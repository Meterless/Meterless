# Compression cascade

The compression cascade is what produces the next chunk's carryover. It's a small pipeline that prioritizes decisions, entities, and open questions over prose.

## The four strategies (strict order)

1. **Marker override.** Parse the text after the state marker; sanitize marker artifacts; accept iff length **≥ 24 chars** and within budget.
2. **LLM compression.** Call `compressorFn(prompt, systemPrompt)` with the previous state + the last 2000 chars of the chunk output, asking for "3-5 critical points" in the structured `COMPLETED / REMAINING / DECISIONS / CONTEXT` block. Prefer a cheap/local model — the compressor never needs frontier quality.
3. **Heuristic extraction.** Regex-capture key phrases (`Therefore`, `Key insight`, `Status`, `Next`), take the first 5 hits, join with `"; "`.
4. **Absolute fallback.** Tail-truncate words to `carryoverTokens × 4` chars.

Each strategy only runs if the previous one failed. Record `cascadeLevelUsed` per chunk — a rising fallback level is a primary drift signal.

The rest of this doc describes the internals of how candidate state is extracted, ranked, and fitted to budget.

## The principle

> Carryover must preserve what affects future steps, and drop everything else.

What affects future steps:

- **Decisions made** — "we chose Iceberg over Delta"
- **Entities introduced** — accounts, players, components, configs
- **Open questions** — "still need to evaluate catalog providers"
- **Constraints discovered** — "must support backfill of 18 months"
- **Step state** — "currently at step 7 of approximately 12"

What doesn't affect future steps:

- Most prose explaining the decision (the decision itself is what matters)
- Repeated context from prior chunks
- Low-signal turns ("OK, let's continue")
- Worked examples (keep the conclusion, drop the work)

## The pipeline

```
chunk output ──▶ extract ──▶ rank ──▶ compress ──▶ format ──▶ carryover_N+1
```

### 1. Extract

Pull candidate facts from the chunk output. Three sources:

- **Markers** — the state block after `[STATE_CHECKPOINT]` (or inside `<CARRYOVER>` in the XML alternate), plus any labeled `DECISIONS` / `ENTITIES` / `QUESTIONS` sections
- **Structural cues** — bulleted lists, numbered steps, headers
- **NER pass** — entities, dates, quantities (cheap local pass, doesn't use the model)

### 2. Rank

Score candidates by:

- **Decision-shape** — explicit choices outrank musings
- **Entity references** — named things outrank vague references
- **Open vs closed** — open questions retained at higher priority than answered ones
- **Recency** — later facts in the chunk weighted slightly higher (they reflect the chunk's current state)
- **Token cost** — short facts win ties against verbose ones

### 3. Compress

Three levels, applied in order until carryover fits the token budget:

**Level 1 — Drop low-rank items.** Trim the tail.
**Level 2 — Collapse redundant items.** "Decided Iceberg" and "Iceberg chosen" merge.
**Level 3 — Summarize within categories.** Multiple decisions in the same area get a one-line summary with a count.

If level 3 still doesn't fit, the engine emits a `carryover-overflow` warning and truncates with priority order preserved.

### 4. Format

Render to the canonical structured carryover block:

```
COMPLETED: 3-phase migration drafted; Iceberg selected as target format
REMAINING: catalog evaluation criteria; backfill cutoff date
DECISIONS:
- Iceberg as target format
- 3-phase migration over 6 months
CONTEXT: entities — team:migration-pod, system:warehouse-v2;
         open — catalog provider (Polaris vs Glue); step 4 of ~12
```

When over budget, drop lowest-priority items first — progress, then entities, then open questions, with decisions dropped only as a last resort (retention priority: decisions > open questions > entities > progress) — and emit a `carryover-overflow` warning.

## When to override the default cascade

The default cascade is general-purpose. Some tasks benefit from custom logic:

- **Code-heavy tasks** — preserve function signatures and module boundaries over English
- **Research tasks** — preserve citations and source attributions
- **Planning tasks** — preserve dependency graph + checkpoints over rationale

Custom cascades are pluggable:

```ts
const markovian = new Markovian({
  compressionCascade: customCascade,
});
```

The interface is small — `extract`, `rank`, `compress`, `format` — and each step is replaceable individually.

## What the cascade doesn't do

- **It doesn't summarize the goal.** The goal is in framing; it's the same every chunk.
- **It doesn't include the chunk's full output.** That's in run history. Carryover is *state*, not transcript.
- **It doesn't try to predict future needs.** Just preserves what is plausibly load-bearing for *next-step* reasoning.

## Failure modes

| Mode | Cause | Mitigation |
|---|---|---|
| **Drift** — carryover loses fidelity step by step | Cascade compressing too aggressively | Bump `carryoverTokens`; pin critical facts in framing |
| **Bloat** — carryover hits budget every chunk | Too many decisions, too few merges | Use category-specific compressors; collapse redundant decisions |
| **Lost entities** — an account referenced in step 2 missing by step 7 | NER pass missed it; cascade dropped it | Add a domain entity list to the cascade; markers can pin entities explicitly |

The diagnostic for all of these: look at carryover_N → carryover_N+1 diffs in run history. The engine logs them.

## What's next

- [Run history](./run-history.md) — where compression decisions get recorded
- [Telemetry](./telemetry.md) — compression metrics over time
- [Reflection](./reflection.md) — recovering from cascade failures
