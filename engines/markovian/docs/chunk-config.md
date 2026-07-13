# Chunk config

The chunk configuration is the entire budget profile for a run. Get this right and the engine flies. Get it wrong and you either run out of context or spend tokens on nothing.

## The shape

```ts
type ChunkConfig = {
  chunkSize: number;            // total per-chunk budget for the model call
  maxChunks: number;            // hard stop after this many chunks
  carryoverTokens: number;      // how much state we forward to chunk N+1
  overlapTokens?: number;       // optional overlap window between chunks (default 0)
};
```

Two engine constants participate in validation but are not user knobs: `framingTokens ≈ 400` (goal + system framing overhead) and `outputBudget ≈ 1200` (expected per-step output size for accounting).

> **Naming:** `chunkSize` is the canonical field name. Some integration paths (e.g. the Scout contract path) use `tokensPerChunk`; treat it as a 1:1 alias for `chunkSize`.

## Defaults and bounds

| Field | Default | Min | Max | Step |
|---|---|---|---|---|
| `chunkSize` | **8000** | 1000 | 128000 | 1000 |
| `maxChunks` | **24** | 1 | 32 | 1 |
| `carryoverTokens` | **800** | 128 | 32768 | 128 |
| `overlapTokens` | **0** | 0 | 4096 | — |

These work for most mid-size-context models with reasonable headroom. Scale them to your model.

## How to size them

### `chunkSize`

Set this to **60-75% of your model's context window**. Leave headroom for output, framing variance, and any unexpected tool returns.

| Model context | Recommended `chunkSize` |
|---|---|
| 8K | 5000 |
| 32K | 22000 |
| 128K | 90000 |
| 200K | 140000 (clamped to the 128000 max) |

Larger isn't automatically better. Bigger chunks mean fewer chunks for the same work, but each chunk is more expensive and slower. Smaller chunks mean more roundtrips but tighter per-step focus.

### `carryoverTokens`

The single most consequential knob. It controls how much state crosses chunk boundaries.

Rule of thumb: **carryover should be 10-15% of `chunkSize`** (the default 800/8000 is exactly 10%). Smaller than that and important state gets lost in compression. Larger than that and you're paying for state that should have been compressed.

| Task shape | Recommended carryover ratio |
|---|---|
| Information-light (creative writing, brainstorming) | 5-10% |
| Decision-heavy (planning, architecture) | 12-18% |
| State-heavy (multi-account ops, long debugging) | 15-22% |

### Framing (engine constant, ≈400)

The goal, system instructions, and any persistent context. This is paid every chunk, so it grows the bill.

Keep framing **tight and stable**. A 200-token goal beats a 1200-token system prompt with options the model rarely uses.

### `overlapTokens`

Optional. Some tasks benefit from a small overlap between chunks: when `overlapTokens > 0`, the final `overlapTokens` (× 4 chars) of chunk N's **cleaned output** are prepended to chunk N+1's prompt in an `[OVERLAP]` block, after the carryover — a "where we just were" hint independent of compressed carryover.

An implementation MUST either implement this semantics or **reject** a non-zero value with a typed error. Accepting and silently ignoring the field is a contract violation.

Set this to 0 for most tasks. Set it to 100-300 for tasks where continuity matters more than savings (long-form writing, code reasoning).

### `maxChunks`

A hard stop. Prevents runaway runs from spending budget on a stuck loop.

Default 24, bounded at 32. Tune down for tighter chains (8-15). Work that genuinely needs more steps should be chained as multiple runs (or delegated via Swarm) rather than raising the cap — a run that hits `maxChunks` stops with `status: "max-chunks"` and a structured warning, never a silent truncation.

### Output budget (engine constant, ≈1200)

Estimated per-step output size, used for cost accounting and budget projection.

Doesn't enforce — the model still emits what it emits — but the engine uses it to flag "this run is going to exceed the chunk budget if outputs keep growing."

## Per-task overrides

For tasks where one shape doesn't fit:

```ts
const run = await markovian.run({
  goal: "...",
  chunkConfig: { chunkSize: 18000, carryoverTokens: 2400 }, // override for this run
  stepFn: ...,
});
```

## Validation

The engine validates configs at load time:

- `chunkSize >= framingTokens + carryoverTokens + outputBudget` (with the ≈400 / ≈1200 engine constants)
- `carryoverTokens > 0`
- `chunkSize` fits in the configured model's context

A config that doesn't budget enough for output produces a typed error at load time, not a silent truncation.

## What's next

- [Marker protocol](./marker-protocol.md) — what the model emits
- [Compression cascade](./compression-cascade.md) — how carryover gets produced
- [Efficiency model](./efficiency-model.md) — the math behind the budget
