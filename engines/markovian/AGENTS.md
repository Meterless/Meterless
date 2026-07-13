# Markovian Engine Agnostic Implementation Guide

## Purpose

This document codifies a production implementation of a Markovian chunked-reasoning engine using the codebase as source of truth, but expressed in platform-neutral terms. It is designed so any product can implement the same architecture as modular services.

It covers:

- Step/chunk definition and lifecycle
- State compression mechanics and marker protocol
- State persistence and historical analytics
- Memory/context reinjection behavior
- Completion and reflection phases
- Real-time and historical performance reporting ("Engine tab" equivalent)

---

## 1) System Overview

The engine executes long reasoning tasks as a sequence of bounded chunks instead of a single ever-growing prompt.

- **Core idea:** each step sends only:
  - original goal (truncated summary in continuation steps)
  - compressed carryover state from prior step
  - optional initial context (memory/workspace/attachments), first step only where applicable
- **Complexity target:** per-step context is effectively O(1) relative to chain length (carryover-bounded), while naive full-history prompting grows toward O(n^2) cumulative cost.
- **Modes:** architecture supports at least:
  - `ARCHITECT` (build/plan/implement style)
  - `RESEARCH` (recursive analytical style)

The engine is provider-agnostic via an injected generator function.

---

## 2) Canonical Data Model

Use these entities as the portable contract.

### 2.1 Chunk Config

`ChunkConfig`
- `chunkSize`: target generation budget per chunk
- `maxChunks`: recursion cap / max chain depth
- `carryoverTokens`: target carryover state budget
- `overlapTokens`: overlap window between chunks. When `> 0`, the final `overlapTokens` (× 4 chars) of chunk N's cleaned output are prepended to chunk N+1's prompt in an `[OVERLAP]` block, after the carryover. An implementation MUST either implement this or reject a non-zero value — accepting and ignoring the field is a contract violation.

Default reference values:
- `chunkSize = 8000`
- `maxChunks = 24`
- `carryoverTokens = 800`
- `overlapTokens = 0`

Enforced bounds:
- `chunkSize`: min `1000`, max `128000`, step `1000`
- `maxChunks`: min `1`, max `32`, step `1`
- `carryoverTokens`: min `128`, max `32768`, step `128`
- `overlapTokens`: min `0`, max `4096`

Load-time validation (typed error, not silent truncation):
- `chunkSize >= framingTokens + carryoverTokens + outputBudget`, where `framingTokens ≈ 400` (template overhead) and `outputBudget ≈ 1200` are engine constants
- `carryoverTokens > 0`
- the total fits the configured model's context window

### 2.2 Per-step Record

`ChunkInfo`
- `id` (1-based step index)
- `tokens` (estimated from output; current implementation uses `ceil(chars/4)`)
- `carryover` (state passed into this step)
- `content` (display-safe output for that step)

### 2.3 Run Record

`MarkovianRun`
- `id` (UUID)
- `timestamp`
- `prompt` (truncated for storage)
- `mode`
- `chunkConfig` — **MANDATORY** per-run config snapshot. Historical efficiency is always computed against the run's own config, never the current one.
- `chunks[]`
- `totalTokensUsed`
- `totalTokensSaved`
- `efficiencyPercent`
- `durationMs`
- `status`: `"completed" | "max-chunks" | "errored" | "aborted"`

### 2.4 Cumulative Stats

`MarkovianCumulativeStats`
- `totalRuns`
- `completedRuns`
- `totalTokensUsed`
- `totalTokensSaved`
- `averageEfficiency`
- `totalChunksProcessed`
- `lastRunTimestamp`
- `efficiencyHistory[]` (`timestamp`, `efficiency`, `tokensSaved`)

---

## 3) Marker Protocol (State and Completion)

Use explicit markers so the model can signal continuation vs completion.

Primary markers:
- state checkpoint: `[STATE_CHECKPOINT]`
- final completion: `[TASK_COMPLETE]`

Backward-compatible detection markers (optional):
- state: `@@@STATE@@@`, `[STATE]`, `---STATE---`
- final: `@@@FINAL@@@`, `[FINAL]`, `---FINAL---`

Optional pause markers (bracket form is canonical; semantics in `docs/marker-protocol.md`):
- `[NEEDS_TOOL tool="..." input="..."]` — run pauses, host fulfills the tool call, resumes with the result injected
- `[NEEDS_CLARIFICATION] ...` — run pauses for human input, resumes with the answer

Rules:
- model should end each non-final chunk with state marker + concise state summary
- model should end final chunk with final marker
- exactly one marker per chunk; the model never narrates markers
- UI rendering should strip markers and internal control text from user-visible content

Canonical carryover shape (structured, not free-form) — the compressor and prompt templates request this labeled block:

```
COMPLETED: <what was done>
REMAINING: <what is left>
DECISIONS: <key choices made, with values>
CONTEXT: <entities, open questions, constraints needed to continue>
```

---

## 4) Component Architecture

## 4.1 Config Manager Service

Responsibilities:
- hold current `ChunkConfig`
- clamp updates to safe bounds
- produce projected efficiency curve for charting

Projected curve model (10 steps in reference implementation):
- `avgOutputPerChunk = chunkSize`
- Standard cumulative step cost:
  - `historySize = (step - 1) * avgOutputPerChunk`
  - `standardStepCost = historySize + avgOutputPerChunk`
- Markovian cumulative step cost:
  - `markovianStepCost = carryoverTokens + avgOutputPerChunk`

This drives a "Projected vs Markovian" chart even before real runs exist.

## 4.2 Chunk Manager

Responsibilities:
- allocate chunk ids
- store `ChunkInfo[]`
- enforce `maxChunks`

Token estimation:
- per chunk token count is approximated as `ceil(content.length / 4)`

## 4.3 State Carryover Service

Responsibilities:
- extract next carryover state after each chunk
- cascade through deterministic and model-based compression strategies

Compression cascade (strict order):
1. **Explicit override via marker in chunk output**
   - parse text after state marker
   - sanitize marker artifacts
   - accept iff length **≥ 24 chars** and within budget
2. **LLM-based compression**
   - call injected `compressorFn(prompt, systemPrompt)`
   - include previous state + current chunk preview (last 2000 chars)
   - enforce concise "3-5 critical points" style, returned as the structured `COMPLETED / REMAINING / DECISIONS / CONTEXT` block (§3)
3. **Heuristic extraction fallback**
   - regex capture of key phrases (e.g., "Therefore", "Key insight", "Status")
   - compress first N points into semicolon-delimited summary
4. **Absolute fallback**
   - tail-truncate words to carryover token budget

This makes compression robust even during model/API instability.

## 4.4 Prompt Builder

Two mode templates:

- **Architect first chunk**
  - asks for analyze/plan/start implementation
  - requires ending with state marker + next-state summary
- **Architect continuation chunk**
  - includes:
    - truncated original goal (`~200 chars`)
    - previous carryover block
    - strict continuation instructions
    - explicit final/state marker rules

- **Research first chunk**
  - sets recursive analysis behavior
  - enforces action logging pattern (`>> ...`)
  - asks for multi-file style output and research-tree state snapshot
- **Research continuation chunk**
  - resumes from research state
  - same marker protocol for done/continue

## 4.5 Runtime Orchestrator

A single function executes the full chain with:
- injected generator function (provider-agnostic)
- prompt, mode, attachments, memory context, abort signal, stream callback

Loop condition:
- while can add chunk and not done

Per-iteration flow:
1. start progress for chunk
2. build chunk prompt from mode + carryover
3. invoke generator (streaming)
4. update live token/savings estimates while streaming
5. clean markers from display content
6. account tokens and accumulate savings
7. run state compression phase
8. update carryover metrics
9. persist chunk in chunk manager
10. if completion marker detected, mark done

After loop:
- if completed and not aborted, run final reflection step
- finalize progress
- asynchronously persist run history
- asynchronously record analytics

## 4.6 Progress Service (Real-Time)

State object should include:
- lifecycle: `isActive`, `phase`, `phaseDetail`
- chunk counters: `currentChunk`, `maxChunks`
- token metrics: `tokensUsed`, `tokensSaved`, `carryoverSize`
- timing: `startTime`, `lastUpdateTime`
- logs (bounded queue; reference keeps last 15)
- `completedChunks[]` with per-chunk data for precise live charts and progressive rendering

Phases:
- `initializing`
- `generating`
- `compressing`
- `reflecting`
- `complete`
- `error`

## 4.7 History Service (Persistent Analytics)

Responsibilities:
- load prior runs
- record each run
- compute cumulative stats
- provide actual aggregated performance-by-step data
- support delete/clear and subscriptions

Storage split in reference implementation:
- run records: IndexedDB object store (`markovian_history`)
- cumulative stats snapshot: local storage key (`markovian_cumulative_stats`)

---

## 5) Memory and Context Reinjection Contract

The engine accepts `memoryContext` as external input, then injects it into the first chunk via:

- `enhancedPrompt = memoryContext + "\n\nUser Request: " + prompt` (if non-empty)

Upstream context composition pattern (agnostic blueprint):
1. retrieve memory context from memory subsystem (optional)
2. append workspace/project context (optional)
3. append user-selected attached context snippets (optional)
4. pass composed context into Markovian run

Attachment policy in runtime loop:
- chunk 0 receives full attachments
- continuation chunks receive no attachments by default

Practical meaning:
- heavy context enters at step 1
- compressed carryover and goal summary maintain continuity afterward

---

## 6) Token and Efficiency Math (Reference Formulas)

## 6.1 During streaming (estimate)

For chunk `i` (chunks are **1-based**):
- `chunkTokens = ceil(currentChunkText.length / 4)`
- `historySize = (i - 1) * chunkSize` (reference estimator)
- `standardChunkCost = historySize + chunkTokens`
- `markovianChunkCost = carryoverTokens + chunkTokens`
- `chunkSavings = max(0, standardChunkCost - markovianChunkCost)`
- `currentTotalSavings = accumulatedSavings + chunkSavings`

## 6.2 After chunk completes (actual displayed chunk)

- `actualChunkTokens = ceil(displayContent.length / 4)`
- reuse same standard/markovian formulas with `actualChunkTokens`
- accumulate into run totals

## 6.3 Historical run efficiency

For a full run:
- `totalTokensUsed = sum(chunk.tokens)`
- Standard cumulative cost:
  - for each chunk `i`, add `sum(tokens[0..i-1]) + tokens[i]`
- Markovian cumulative cost:
  - `chunks.length * carryoverTokens + totalTokensUsed`
- `tokensSaved = max(0, standardCost - markovianCost)`
- `efficiencyPercent = tokensSaved / standardCost * 100` (if standardCost > 0)

---

## 7) Completion and Reflection

Completion detection:
- if chunk output contains final marker, stop recursion and mark run completed

Reflection step (post-chain synthesis):
- run only when:
  - at least one chunk exists
  - run is completed (not interrupted)
  - not aborted
- build reflection prompt from:
  - original prompt
  - final carryover state
  - full generated content (truncated to safe length if huge)
  - code artifact summary (count/language/size of code blocks)
- stream reflection content as final append
- reflection failure should not fail entire run

---

## 8) Engine Tab (Performance Reporting) Blueprint

An implementation equivalent to the reference "Engine tab" should provide:

## 8.1 Performance Chart Modes

1. **Projected mode**
   - uses config manager theoretical efficiency curve
   - visualizes expected Standard vs Markovian growth
2. **Actual mode**
   - aggregates real historical runs step-by-step
   - per-step averages include sample count
   - computes real savings and real savings %

Auto behavior:
- if at least one run with chunks exists, enable and default to actual mode

## 8.2 Config Controls

Expose live controls for:
- `chunkSize`
- `maxChunks`
- `carryoverTokens`

Behavior:
- clamp to configured limits
- chart updates immediately for projections
- new values apply to next run

## 8.3 Chain Inspector

Required capabilities:
- inspect current run chunks
- browse historical runs
- select step/node and show:
  - incoming carryover state
  - output snapshot
  - per-step token count

## 8.4 Historical Run Management

Required capabilities:
- list recent runs
- view run metadata (timestamp, chunks, efficiency, tokens saved)
- delete individual runs
- clear all history (optional admin action)

---

## 9) Live Telemetry Panel Blueprint

A side telemetry panel equivalent should support 3 views:
- current session
- live progress
- historical run

Core live KPIs:
- efficiency %
- chain depth / recursion depth
- tokens used (Markovian)
- comparable standard-token estimate

Core visualizations:
- **Context velocity chart:** standard vs markovian per step
- **State compression chart:** carryover compression ratio per step

Live updates should be throttled (reference uses 300ms) to prevent render thrash.

---

## 10) Streaming UX Contract

For long chains, render progressively:
- completed chunks as formatted markdown
- active chunk as plain streaming text

Sanitize live text:
- strip state/final markers and leaked internal system headers

Use fixed-height containers and throttled subscriptions for HUD components to avoid layout shifts and flicker during streaming.

---

## 11) Error and Abort Handling

Hard requirements:
- abort signal checked before each chunk and before compression
- mark progress state `error` with user-visible detail on chunk failures
- preserve partial output where possible
- do not crash the entire run if reflection fails

Recommended:
- log friendly provider/model misconfiguration hints when transport errors match known patterns

---

## 12) Provider-Agnostic Integration Pattern

Inject a generator function with this conceptual signature:

```ts
type Generator = (
  prompt: string,
  attachments: Attachment[],
  systemPrompt?: string,
  onStream?: (delta: string) => void,
  abortSignal?: AbortSignal,
  extras?: unknown
) => Promise<{ text: string; metadata?: unknown }>;
```

Routing strategy:
- choose provider/model upstream
- route long-form modes to Markovian orchestrator
- route short-form mode to single-shot generation

This allows one Markovian runtime to sit behind any provider stack (cloud API, local model, gateway, or hybrid).

---

## 13) Implementation Checklist

- Define config bounds and defaults.
- Implement marker protocol and cleaner.
- Build chunk manager and carryover service with fallback ladder.
- Implement mode-specific prompt templates.
- Implement orchestrator loop with streaming, compression, completion, reflection.
- Add real-time progress service with subscriptions and chunk records.
- Add persistent history service and cumulative stats.
- Build Engine tab:
  - projection chart
  - actual chart
  - config controls
  - run/chain inspector
- Build telemetry panel for live/current/historical views.
- Add progressive chunk rendering path.
- Add abort + error states + retry-safe fallbacks.

---

## 14) Accounting and Fidelity Rules

- Token accounting: prefer **provider-reported usage** (`usage.input_tokens` / `output_tokens`) when available; use `ceil(chars / 4)` as fallback only. Label every reported number with its source (`measured` vs `estimated`).
- `overlapTokens`: implement the `[OVERLAP]` window semantics (§2.1) or reject non-zero values. Never accept-and-ignore.
- Output validation is wired as the conclusion/reflection pass (`ratify` / `refine` modes) — see §7 and `docs/reflection.md`.
- Historical "actual performance" computes Markovian step cost as `carryoverTokens + chunk.tokens` using **the run's own persisted `chunkConfig`**. The per-run config snapshot is mandatory (§2.3).

These rules keep the implementation resilient, provider-portable, and its efficiency numbers honest.

---

## Verify your implementation

After implementing this spec, run the conformance suite against your build and iterate until it is green:

```bash
MARKOVIAN_IMPL=/abs/path/to/your/index.ts npx tsx conformance/runner.ts
```

The suite (in `conformance/`) checks the exact-tier contracts: formulas, deltas, gates, boundary rulings, and never-happens behaviors. A green scorecard is the definition of done for this spec. The runnable reference in `reference/` passes it; diff against the reference when a check fails and the reason is unclear.
