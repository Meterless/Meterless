# How to Use Markovian Engine

A practical walkthrough of wiring up a Markovian chunked-reasoning runtime. Code samples in **TypeScript**, **Python**, and **Rust**.

This guide assumes you have read the architecture overview. If you have not, start there. This document is about wiring it up.

---

## Table of contents

1. [Install and configure](#1-install-and-configure)
2. [Define the canonical data model](#2-define-the-canonical-data-model)
3. [Inject a provider-agnostic generator](#3-inject-a-provider-agnostic-generator)
4. [Run your first chain](#4-run-your-first-chain)
5. [The marker protocol](#5-the-marker-protocol)
6. [The compression cascade](#6-the-compression-cascade)
7. [Stream and render progressively](#7-stream-and-render-progressively)
8. [Read the live progress service](#8-read-the-live-progress-service)
9. [Persist run history](#9-persist-run-history)
10. [Compute efficiency](#10-compute-efficiency)
11. [Mode templates: Architect and Research](#11-mode-templates-architect-and-research)
12. [Abort, error, and reflection](#12-abort-error-and-reflection)
13. [Compose with H-MEM and Swarm](#13-compose-with-h-mem-and-swarm)

---

## 1. Install and configure

Markovian is a runtime, not a library lock-in. You implement the orchestrator. The reference defaults below are the recommended starting point.

### TypeScript

```ts
import { Markovian } from "./markovian";

const engine = new Markovian({
  chunkSize: 8000,
  maxChunks: 24,
  carryoverTokens: 800,
  overlapTokens: 0,
  generator: yourGenerator,
  compressor: yourCompressor,        // optional, defaults to generator
  history: yourHistoryStore,         // optional, defaults to in-memory
});
```

### Python

```python
from markovian import Markovian

engine = Markovian(
    chunk_size=8000,
    max_chunks=24,
    carryover_tokens=800,
    overlap_tokens=0,
    generator=your_generator,
    compressor=your_compressor,
    history=your_history_store,
)
```

### Rust

```rust
use markovian::{Markovian, ChunkConfig};

let engine = Markovian::new(ChunkConfig {
    chunk_size: 8000,
    max_chunks: 24,
    carryover_tokens: 800,
    overlap_tokens: 0,
})
.with_generator(your_generator)
.with_compressor(your_compressor)
.with_history(your_history_store);
```

### Config bounds

| Field | Default | Min | Max | Step |
|---|---|---|---|---|
| `chunkSize` | 8000 | 1000 | 128000 | 1000 |
| `maxChunks` | 24 | 1 | 32 | 1 |
| `carryoverTokens` | 800 | 128 | 32768 | 128 |
| `overlapTokens` | 0 | 0 | 4096 | — |

Configs are validated at load time (typed error, not silent truncation): `chunkSize >= framingTokens + carryoverTokens + outputBudget`, where `framingTokens ≈ 400` and `outputBudget ≈ 1200` are engine constants; `carryoverTokens > 0`; and the total must fit the model's context window.

`overlapTokens` semantics: when `> 0`, the final `overlapTokens` (× 4 chars) of chunk N's cleaned output are prepended to chunk N+1's prompt in an `[OVERLAP]` block, after the carryover. Implement this or reject non-zero values — never accept-and-ignore.

---

## 2. Define the canonical data model

The contracts are the same in every language.

### TypeScript

```ts
export type Mode = "ARCHITECT" | "RESEARCH";

export interface ChunkInfo {
  id: number;            // 1-based
  tokens: number;        // ceil(content.length / 4)
  carryover: string;     // state passed into this step
  content: string;       // display-safe output for this step
}

export type RunStatus = "completed" | "max-chunks" | "errored" | "aborted";

export interface MarkovianRun {
  id: string;
  timestamp: number;
  prompt: string;
  mode: Mode;
  chunkConfig: ChunkConfig;   // MANDATORY per-run snapshot
  chunks: ChunkInfo[];
  totalTokensUsed: number;
  totalTokensSaved: number;
  efficiencyPercent: number;
  durationMs: number;
  status: RunStatus;
}

export interface CumulativeStats {
  totalRuns: number;
  completedRuns: number;
  totalTokensUsed: number;
  totalTokensSaved: number;
  averageEfficiency: number;
  totalChunksProcessed: number;
  lastRunTimestamp: number;
  efficiencyHistory: { timestamp: number; efficiency: number; tokensSaved: number }[];
}
```

### Python

```python
from dataclasses import dataclass
from typing import Literal

Mode = Literal["ARCHITECT", "RESEARCH"]

@dataclass
class ChunkInfo:
    id: int
    tokens: int
    carryover: str
    content: str

RunStatus = Literal["completed", "max-chunks", "errored", "aborted"]

@dataclass
class MarkovianRun:
    id: str
    timestamp: int
    prompt: str
    mode: Mode
    chunk_config: "ChunkConfig"  # MANDATORY per-run snapshot
    chunks: list[ChunkInfo]
    total_tokens_used: int
    total_tokens_saved: int
    efficiency_percent: float
    duration_ms: int
    status: RunStatus
```

### Rust

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum Mode { Architect, Research }

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChunkInfo {
    pub id: u32,
    pub tokens: u32,
    pub carryover: String,
    pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum RunStatus { Completed, MaxChunks, Errored, Aborted }

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MarkovianRun {
    pub id: String,
    pub timestamp: i64,
    pub prompt: String,
    pub mode: Mode,
    pub chunk_config: ChunkConfig, // MANDATORY per-run snapshot
    pub chunks: Vec<ChunkInfo>,
    pub total_tokens_used: u64,
    pub total_tokens_saved: u64,
    pub efficiency_percent: f32,
    pub duration_ms: u64,
    pub status: RunStatus,
}
```

---

## 3. Inject a provider-agnostic generator

Markovian does not know about OpenAI, Anthropic, or your local model. You hand it a function.

### TypeScript

```ts
type Attachment = { kind: string; data: unknown };

type Generator = (
  prompt: string,
  attachments: Attachment[],
  systemPrompt?: string,
  onStream?: (delta: string) => void,
  abortSignal?: AbortSignal,
  extras?: unknown
) => Promise<{ text: string; metadata?: unknown }>;

// Example wrap around any provider:
const openaiGenerator: Generator = async (prompt, attachments, system, onStream, signal) => {
  let full = "";
  const stream = await openai.chat.completions.create({
    model: "gpt-x",
    messages: [
      ...(system ? [{ role: "system", content: system }] : []),
      { role: "user", content: prompt }
    ],
    stream: true,
  }, { signal });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content ?? "";
    full += delta;
    onStream?.(delta);
  }
  return { text: full };
};
```

### Python

```python
from typing import Callable, Awaitable, Optional
import asyncio

Generator = Callable[..., Awaitable[dict]]

async def openai_generator(prompt, attachments, system=None, on_stream=None, abort=None, **extras):
    full = []
    async for chunk in openai.chat.completions.stream(
        model="gpt-x",
        messages=[
            *([{"role": "system", "content": system}] if system else []),
            {"role": "user", "content": prompt},
        ],
    ):
        delta = chunk.choices[0].delta.content or ""
        full.append(delta)
        if on_stream:
            on_stream(delta)
        if abort and abort.is_set():
            break
    return {"text": "".join(full)}
```

### Rust

```rust
use async_trait::async_trait;
use tokio::sync::mpsc;

#[async_trait]
pub trait Generator: Send + Sync {
    async fn generate(
        &self,
        prompt: &str,
        attachments: &[Attachment],
        system: Option<&str>,
        on_stream: Option<mpsc::Sender<String>>,
        abort: tokio_util::sync::CancellationToken,
    ) -> anyhow::Result<GenerateOutput>;
}

pub struct GenerateOutput {
    pub text: String,
    pub metadata: Option<serde_json::Value>,
}
```

### Routing strategy

Choose your provider and model **upstream** of Markovian. Long-form workloads route to the orchestrator. Short-form workloads bypass Markovian and call the provider directly.

```ts
async function dispatch(prompt: string) {
  if (looksLongForm(prompt)) {
    return engine.run({ prompt, mode: "ARCHITECT", generator: openaiGenerator });
  }
  return openaiGenerator(prompt, []);
}
```

---

## 4. Run your first chain

### TypeScript

```ts
const run = await engine.run({
  prompt: "Build a CLI tool that downloads, transcribes, and summarizes podcasts.",
  mode: "ARCHITECT",
  attachments: [],
  memoryContext: "",
  onStream: (event) => {
    if (event.kind === "delta") console.log(event.delta);
    if (event.kind === "chunkComplete") console.log(`✓ chunk ${event.chunkId}`);
  },
});

console.log(`Completed in ${run.chunks.length} chunks`);
console.log(`Efficiency: ${run.efficiencyPercent.toFixed(1)}%`);
console.log(`Tokens saved: ${run.totalTokensSaved}`);
```

### Python

```python
run = await engine.run(
    prompt="Build a CLI tool that downloads, transcribes, and summarizes podcasts.",
    mode="ARCHITECT",
    attachments=[],
    memory_context="",
    on_stream=lambda e: print(e),
)

print(f"Completed in {len(run.chunks)} chunks")
print(f"Efficiency: {run.efficiency_percent:.1f}%")
print(f"Tokens saved: {run.total_tokens_saved}")
```

### Rust

```rust
let run = engine.run(RunRequest {
    prompt: "Build a CLI tool that downloads, transcribes, and summarizes podcasts.".into(),
    mode: Mode::Architect,
    attachments: vec![],
    memory_context: String::new(),
}).await?;

println!("Completed in {} chunks", run.chunks.len());
println!("Efficiency: {:.1}%", run.efficiency_percent);
println!("Tokens saved: {}", run.total_tokens_saved);
```

---

## 5. The marker protocol

The model signals continuation vs completion with explicit markers in its output.

| Marker | Meaning |
|---|---|
| `[STATE_CHECKPOINT]` | End of non-final chunk. Followed by concise state summary. |
| `[TASK_COMPLETE]` | Final chunk. Stop recursion. |

Backwards-compatible variants are recognized: `@@@STATE@@@`, `[STATE]`, `---STATE---`, `@@@FINAL@@@`, `[FINAL]`, `---FINAL---`.

A typical non-final chunk ends like this:

```text
... and then the encoder writes the result to disk.

[STATE_CHECKPOINT]
- Implemented download module
- Encoder writes WAV to /tmp/podcast-cache
- Next: implement transcription with Whisper
- Blockers: none
```

A final chunk ends like this:

```text
... CLI now passes all integration tests.

[TASK_COMPLETE]
```

### Cleaning markers before display

```ts
// TypeScript
const STATE_RE  = /\[(?:STATE_CHECKPOINT|STATE)\][\s\S]*$/;
const FINAL_RE  = /\[(?:TASK_COMPLETE|FINAL)\][\s\S]*$/;
const LEGACY_RE = /(@@@(?:STATE|FINAL)@@@|---(?:STATE|FINAL)---)[\s\S]*$/;

function cleanForDisplay(text: string): string {
  return text
    .replace(FINAL_RE, "")
    .replace(STATE_RE, "")
    .replace(LEGACY_RE, "")
    .trim();
}
```

```python
# Python
import re
STATE_RE  = re.compile(r"\[(?:STATE_CHECKPOINT|STATE)\][\s\S]*$")
FINAL_RE  = re.compile(r"\[(?:TASK_COMPLETE|FINAL)\][\s\S]*$")
LEGACY_RE = re.compile(r"(@@@(?:STATE|FINAL)@@@|---(?:STATE|FINAL)---)[\s\S]*$")

def clean_for_display(text: str) -> str:
    text = FINAL_RE.sub("", text)
    text = STATE_RE.sub("", text)
    text = LEGACY_RE.sub("", text)
    return text.strip()
```

```rust
// Rust
use regex::Regex;
use once_cell::sync::Lazy;

static FINAL_RE:  Lazy<Regex> = Lazy::new(|| Regex::new(r"\[(?:TASK_COMPLETE|FINAL)\][\s\S]*$").unwrap());
static STATE_RE:  Lazy<Regex> = Lazy::new(|| Regex::new(r"\[(?:STATE_CHECKPOINT|STATE)\][\s\S]*$").unwrap());
static LEGACY_RE: Lazy<Regex> = Lazy::new(|| Regex::new(r"(@@@(?:STATE|FINAL)@@@|---(?:STATE|FINAL)---)[\s\S]*$").unwrap());

pub fn clean_for_display(text: &str) -> String {
    let s = FINAL_RE.replace_all(text, "");
    let s = STATE_RE.replace_all(&s, "");
    let s = LEGACY_RE.replace_all(&s, "");
    s.trim().to_string()
}
```

---

## 6. The compression cascade

Carryover extraction tries strategies in order. Each one falls through to the next on failure.

```ts
// TypeScript reference
async function extractCarryover(prevState: string, chunkOutput: string): Promise<string> {
  // 1. Explicit override via marker
  const marker = parseStateBlock(chunkOutput);
  if (marker && marker.length >= 24) return sanitize(marker);

  // 2. Model-based compression
  try {
    const compressed = await compressorFn(
      `Previous state:\n${prevState}\n\nCurrent step preview:\n${chunkOutput.slice(-2000)}\n\nReturn 3-5 critical points.`,
      "You compress reasoning state. Be terse. No prose."
    );
    if (compressed.text.length > 0) return compressed.text;
  } catch {}

  // 3. Heuristic extraction
  const heuristic = regexExtract(chunkOutput, ["Therefore", "Key insight", "Status", "Next"]);
  if (heuristic.length > 0) return heuristic.slice(0, 5).join("; ");

  // 4. Absolute fallback
  return tailTruncateWords(chunkOutput, carryoverTokens * 4);
}
```

```python
# Python reference
async def extract_carryover(prev_state: str, chunk_output: str) -> str:
    marker = parse_state_block(chunk_output)
    if marker and len(marker) >= 24:
        return sanitize(marker)

    try:
        compressed = await compressor_fn(
            f"Previous state:\n{prev_state}\n\nCurrent step preview:\n{chunk_output[-2000:]}\n\nReturn 3-5 critical points.",
            "You compress reasoning state. Be terse. No prose."
        )
        if compressed["text"]:
            return compressed["text"]
    except Exception:
        pass

    heuristic = regex_extract(chunk_output, ["Therefore", "Key insight", "Status", "Next"])
    if heuristic:
        return "; ".join(heuristic[:5])

    return tail_truncate_words(chunk_output, carryover_tokens * 4)
```

```rust
// Rust reference
pub async fn extract_carryover(prev_state: &str, chunk_output: &str, cfg: &ChunkConfig, compressor: &dyn Compressor) -> String {
    if let Some(marker) = parse_state_block(chunk_output) {
        if marker.len() >= 24 { return sanitize(&marker); }
    }

    if let Ok(compressed) = compressor.compress(
        &format!("Previous state:\n{}\n\nCurrent step preview:\n{}\n\nReturn 3-5 critical points.", prev_state, tail(chunk_output, 2000)),
        "You compress reasoning state. Be terse. No prose."
    ).await {
        if !compressed.is_empty() { return compressed; }
    }

    let heuristic = regex_extract(chunk_output, &["Therefore", "Key insight", "Status", "Next"]);
    if !heuristic.is_empty() {
        return heuristic.into_iter().take(5).collect::<Vec<_>>().join("; ");
    }

    tail_truncate_words(chunk_output, (cfg.carryover_tokens * 4) as usize)
}
```

Marker-state acceptance threshold is **≥ 24 chars** — anything shorter falls through the cascade. Ask the compressor to return the structured carryover block rather than free-form prose:

```
COMPLETED: <what was done>
REMAINING: <what is left>
DECISIONS: <key choices made, with values>
CONTEXT: <entities, open questions, constraints needed to continue>
```

---

## 7. Stream and render progressively

Completed chunks render as formatted markdown. The active chunk streams as plain text. Markers are stripped at display time.

### TypeScript (React)

```tsx
function MarkovianView({ runId }: { runId: string }) {
  const [chunks, setChunks] = useState<ChunkInfo[]>([]);
  const [live, setLive] = useState("");

  useEffect(() => {
    const unsub = engine.subscribe(runId, (event) => {
      switch (event.kind) {
        case "delta":         setLive(prev => cleanForDisplay(prev + event.delta)); break;
        case "chunkComplete": setChunks(prev => [...prev, event.chunk]); setLive(""); break;
        case "complete":      break;
      }
    });
    return unsub;
  }, [runId]);

  return (
    <div className="markovian-view">
      {chunks.map(c => (
        <div key={c.id} className="chunk-done">
          <Markdown>{c.content}</Markdown>
        </div>
      ))}
      {live && <div className="chunk-live"><pre>{live}</pre></div>}
    </div>
  );
}
```

### Python (FastAPI SSE)

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

@app.get("/run/{run_id}/stream")
async def stream(run_id: str):
    async def event_stream():
        async for event in engine.subscribe(run_id):
            yield f"event: {event['kind']}\ndata: {json.dumps(event)}\n\n"
    return StreamingResponse(event_stream(), media_type="text/event-stream")
```

### Rust (Axum SSE)

```rust
use axum::{response::sse::{Event, Sse}, extract::Path};
use futures::stream::StreamExt;

async fn stream(Path(run_id): Path<String>) -> Sse<impl Stream<Item = Result<Event, _>>> {
    let rx = engine.subscribe(&run_id);
    Sse::new(rx.map(|ev| Ok(Event::default().event(ev.kind()).json_data(ev).unwrap())))
}
```

### UX rules

- Use a fixed-height container for the live chunk.
- Throttle subscriptions at ~300ms to avoid render thrash.
- Sanitize live text every render. Markers are not user-visible.

---

## 8. Read the live progress service

The progress service publishes structured state. Subscribe to drive your live UI.

```ts
// TypeScript
engine.progress.subscribe((state) => {
  console.log({
    phase: state.phase,              // initializing | generating | compressing | reflecting | complete | error
    phaseDetail: state.phaseDetail,
    currentChunk: state.currentChunk,
    maxChunks: state.maxChunks,
    tokensUsed: state.tokensUsed,
    tokensSaved: state.tokensSaved,
    carryoverSize: state.carryoverSize,
  });
});
```

```python
# Python
def on_progress(state):
    print(state.phase, state.current_chunk, state.tokens_saved)

engine.progress.subscribe(on_progress)
```

```rust
// Rust
let mut rx = engine.progress().subscribe();
while let Some(state) = rx.recv().await {
    println!("{:?} chunk={} saved={}", state.phase, state.current_chunk, state.tokens_saved);
}
```

### Phases

| Phase | When |
|---|---|
| `initializing` | Run record created, before the first generator call |
| `generating` | Streaming a chunk |
| `compressing` | Running the compression cascade between chunks |
| `reflecting` | Post-chain reflection step |
| `complete` | Run finished successfully |
| `error` | Recoverable or fatal error; check `phaseDetail` |

---

## 9. Persist run history

The reference implementation persists run records in IndexedDB and a cumulative stats snapshot in local storage. The contract is the same on the server.

```ts
// TypeScript
class HistoryService {
  async record(run: MarkovianRun) { /* insert into runs table */ }
  async list({ limit = 50 } = {}): Promise<MarkovianRun[]> { /* ... */ }
  async get(runId: string): Promise<MarkovianRun | null> { /* ... */ }
  async delete(runId: string): Promise<void> { /* ... */ }
  async clear(): Promise<void> { /* ... */ }
  async cumulative(): Promise<CumulativeStats> { /* ... */ }
}
```

Server-side recommendations:

- Use a real database (Postgres, SQLite, whatever). IndexedDB is for the browser reference.
- Store `prompt` truncated (the reference truncates for storage).
- Persist the **`chunkConfig` snapshot** on every run record — this is **required**, not optional. Historical efficiency must be recomputed against the run's own config; recomputing against the current config produces dishonest numbers the moment anyone changes a slider.

---

## 10. Compute efficiency

### Per-chunk savings (streaming estimate)

For chunk `i` (**1-based** — the first chunk is `i = 1`, so it carries no history):

```ts
// TypeScript
function estimateSavings(i: number, currentText: string, cfg: ChunkConfig) {
  const chunkTokens = Math.ceil(currentText.length / 4);
  const historySize = (i - 1) * cfg.chunkSize;
  const standardCost  = historySize + chunkTokens;
  const markovianCost = cfg.carryoverTokens + chunkTokens;
  const savings = Math.max(0, standardCost - markovianCost);
  return { chunkTokens, standardCost, markovianCost, savings };
}
```

```python
# Python
import math
def estimate_savings(i, current_text, cfg):  # i is 1-based
    chunk_tokens = math.ceil(len(current_text) / 4)
    history_size = (i - 1) * cfg.chunk_size
    standard_cost  = history_size + chunk_tokens
    markovian_cost = cfg.carryover_tokens + chunk_tokens
    return {
        "chunk_tokens": chunk_tokens,
        "standard_cost": standard_cost,
        "markovian_cost": markovian_cost,
        "savings": max(0, standard_cost - markovian_cost),
    }
```

```rust
// Rust
pub fn estimate_savings(i: u32, current_text: &str, cfg: &ChunkConfig) -> Savings {
    // i is 1-based
    let chunk_tokens = ((current_text.len() as f32) / 4.0).ceil() as u32;
    let history_size = (i - 1) * cfg.chunk_size;
    let standard_cost  = history_size + chunk_tokens;
    let markovian_cost = cfg.carryover_tokens + chunk_tokens;
    Savings {
        chunk_tokens,
        standard_cost,
        markovian_cost,
        savings: standard_cost.saturating_sub(markovian_cost),
    }
}
```

### Full-run efficiency

```ts
// TypeScript
function runEfficiency(chunks: ChunkInfo[], cfg: ChunkConfig) {
  const totalTokensUsed = chunks.reduce((s, c) => s + c.tokens, 0);

  let standardCost = 0;
  for (let i = 0; i < chunks.length; i++) {
    const historyTokens = chunks.slice(0, i).reduce((s, c) => s + c.tokens, 0);
    standardCost += historyTokens + chunks[i].tokens;
  }

  const markovianCost = chunks.length * cfg.carryoverTokens + totalTokensUsed;
  const tokensSaved   = Math.max(0, standardCost - markovianCost);
  const efficiencyPct = standardCost > 0 ? (tokensSaved / standardCost) * 100 : 0;

  return { totalTokensUsed, standardCost, markovianCost, tokensSaved, efficiencyPct };
}
```

Compute full-run efficiency with **the run's own persisted `chunkConfig`** (`run.chunkConfig`), never the current live config.

Token accounting: prefer provider-reported usage (`usage.input_tokens` / `output_tokens`) when the provider returns it; `ceil(chars / 4)` is the fallback estimate only. Label every reported number as `measured` or `estimated`.

---

## 11. Mode templates: Architect and Research

Two ship in the reference implementation.

### Architect mode

Build, plan, implement.

```ts
// TypeScript
function architectFirstPrompt(goal: string, memoryContext: string) {
  return `${memoryContext}\n\nGoal: ${goal}\n\nAnalyze the problem, lay out a plan, and begin implementation. End with [STATE_CHECKPOINT] followed by a concise summary of where you are and what is next.`;
}

function architectContinuationPrompt(goal: string, carryover: string) {
  return `Original goal: ${goal.slice(0, 200)}\n\nPrior state:\n${carryover}\n\nContinue the implementation. If the work is finished, end with [TASK_COMPLETE]. Otherwise, end with [STATE_CHECKPOINT] and a concise next-state summary.`;
}
```

### Research mode

Recursive analytical exploration. Action logging pattern `>> ...`. Multi-file style output.

```ts
function researchFirstPrompt(goal: string, memoryContext: string) {
  return `${memoryContext}\n\nResearch question: ${goal}\n\nWork recursively. Log each action with >> at the start of the line. Build a research tree and emit a state snapshot. End with [STATE_CHECKPOINT] followed by the snapshot.`;
}

function researchContinuationPrompt(goal: string, carryover: string) {
  return `Research question: ${goal.slice(0, 200)}\n\nResearch state:\n${carryover}\n\nContinue the research. If the question is fully answered, end with [TASK_COMPLETE]. Otherwise, end with [STATE_CHECKPOINT] and an updated state snapshot.`;
}
```

Both modes use the same marker protocol and the same compression cascade. The only difference is the prompt template.

To keep carryover structured (see §6), have the framing ask the model to format its state summaries as the canonical block:

```
COMPLETED: <what was done>
REMAINING: <what is left>
DECISIONS: <key choices made, with values>
CONTEXT: <entities, open questions, constraints needed to continue>
```

### Attachment policy

Chunk 0 receives full attachments and memory context. Continuation chunks receive **no attachments by default**. The compressed carryover and truncated goal maintain continuity.

```ts
// TypeScript
function buildChunkPrompt(i: number, run: RunRequest, carryover: string) {
  const isFirst = i === 0;
  const prompt = isFirst
    ? buildFirstPrompt(run.mode, run.prompt, run.memoryContext)
    : buildContinuationPrompt(run.mode, run.prompt, carryover);
  const attachments = isFirst ? run.attachments : [];
  return { prompt, attachments };
}
```

---

## 12. Abort, error, and reflection

### Abort

Honor the abort signal **before each chunk and before compression**.

```ts
// TypeScript
async function runLoop(req: RunRequest, signal: AbortSignal) {
  for (let i = 0; i < cfg.maxChunks; i++) {
    if (signal.aborted) throw new AbortError("user_abort");
    const chunk = await generateChunk(i, req, signal);
    if (signal.aborted) throw new AbortError("user_abort");
    const carryover = await extractCarryover(prevState, chunk.content);
    persistChunk(chunk);
    if (containsFinalMarker(chunk.content)) return { completed: true };
  }
  return { completed: false };
}
```

### Error

Mark the progress state as `error` with user-visible detail. Preserve partial output. Do not crash the run if reflection fails.

```ts
try {
  // run loop
} catch (err) {
  progress.update({ phase: "error", phaseDetail: friendlyMessage(err) });
  await history.record(partialRun);
  throw err;
}
```

### Reflection

After completion, synthesize a final pass over the original goal, final carryover, full content, and code artifact summary.

```ts
async function reflect(run: MarkovianRun) {
  if (run.status !== "completed" || run.chunks.length === 0) return;

  const codeBlocks = extractCodeBlocks(run);
  const reflectionPrompt = `
Original goal: ${run.prompt}
Final state: ${run.chunks.at(-1)!.carryover}
Code artifacts: ${codeBlocks.length} blocks across ${uniqueLanguages(codeBlocks).join(", ")}
Full content (truncated): ${truncate(allContent(run), 30000)}

Synthesize a final review. Highlight what was accomplished, what was deferred, and what should be tested first.
`;
  try {
    const reflection = await generator(reflectionPrompt, []);
    await history.appendReflection(run.id, reflection.text);
  } catch (err) {
    // Reflection failure must not fail the run.
    logger.warn("reflection failed", { runId: run.id, err });
  }
}
```

---

## 13. Compose with H-MEM and Swarm

### With H-MEM

Pull memory context from H-MEM before kicking off a Markovian run. The context goes into chunk 0 only.

```ts
const { memories } = await hmem.query({ text: userPrompt, topN: 5 });
const memoryContext = formatReinjection(memories);

const run = await markovian.run({
  prompt: userPrompt,
  mode: "ARCHITECT",
  memoryContext,
  generator: yourGenerator,
});

// On completion, feed the run back into H-MEM:
await hmem.ingest({
  eventType: "plan_completion",
  source: `markovian:${run.id}`,
  content: run.chunks.map(c => c.content).join("\n\n"),
});
```

### With Agent Orchestration

Each task in a Swarm DAG can call Markovian for long-form work. Short tasks call the provider directly.

```ts
// Inside a Swarm TaskRunner:
async function execute(task: Task) {
  if (task.estimatedTokens > 4000) {
    return await markovian.run({
      prompt: task.prompt,
      mode: task.mode === "research" ? "RESEARCH" : "ARCHITECT",
      generator: yourGenerator,
    });
  }
  return await yourGenerator(task.prompt, []);
}
```

This is how you get O(1) per-step context **inside** a governed multi-agent system. Each agent gets chunked reasoning. The swarm orchestrator gets bounded tasks.

---

## Common problems and what to try

| Problem | First thing to try |
|---|---|
| Chains never finish | Lower `chunkSize`, raise `maxChunks`, verify markers reach the runtime |
| Final marker missed | Strengthen the system prompt; emphasize "end with `[TASK_COMPLETE]`" |
| Carryover loses critical state | Raise `carryoverTokens`; check that step 2 of the cascade (model compression) is wired |
| Live UI flickers | Throttle subscriptions to 300ms; use a fixed-height container for the live chunk |
| Efficiency numbers look wrong | Persist a per-run config snapshot and recompute against that, not current config |
| Reflection fails | Wrap it in try/catch; the rest of the run must succeed regardless |

---

## Repository structure

The companion reference spec lives in the [`Markovian-Engine`](https://github.com/meterless/meterless/tree/main/engines/markovian) repository. It is documentation-first: the engine contracts are specified before the code, so the layout maps concepts.

```text
Markovian-Engine/
├── README.md            Overview, the flat-cost pitch, quick start
├── docs/                The architecture, one concept per file
│   ├── architecture.md          The chunk loop and the engine parts
│   ├── chunk-config.md          chunkSize / carryoverTokens sizing
│   ├── marker-protocol.md       The structured markers the engine reads
│   ├── engine-tab.md            The performance-reporting surface
│   ├── compression-cascade.md   The four-strategy carryover fallback ladder
│   ├── efficiency-model.md      The O(N) vs O(N²) math, worked examples
│   ├── run-history.md           Per-step records and replay
│   ├── streaming-ui.md          Per-chunk progress for human-in-the-loop
│   ├── reflection.md            Optional post-run self-review pass
│   ├── telemetry.md             Counters, gauges, the efficiency model
│   └── compose-with-swarm.md    Markovian inside a swarm task
├── examples/            Runnable walkthroughs
│   ├── run-first-chain … reflection-pass        The numbered learning path
│   ├── long-research-chain, architecture-planning, token-savings-demo
│   │                                            Long-run + economics scenarios
│   └── markovian-with-hmem, markovian-inside-swarm   Cross-engine integration
├── token-economics-demo/   Runnable side-by-side cost chart (index.html + package.json)
├── workshops/           Four-lab track (run → size chunks → tune compression → reflect/resume)
├── src/                 Reserved for your implementation (the runtime is provider-agnostic)
└── content/             Launch post, one-pager, comparison
```

Read order for a new implementer: `README.md` → `docs/architecture.md` → `docs/chunk-config.md` → `docs/marker-protocol.md` → `examples/run-first-chain` → the rest → `token-economics-demo/` to see the flat-cost claim proven. `src/` is intentionally empty — the repo specifies the contract; you bring the generator. The two cross-engine examples show the Markovian side of each pairing; their reciprocals live in the sibling engine repos.

---

## License

Apache 2.0. Use it. Fork it. Ship it.
