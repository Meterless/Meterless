# Marker protocol

The carryover between chunks isn't free-form prose. It's a set of structured markers the model emits and the engine reads.

This is what makes carryover **bounded and reliable**. Free-form summaries drift; markers don't.

## The canonical wire format: bracket markers

The engine's wire format is the **bracket protocol**:

| Marker | Meaning |
|---|---|
| `[STATE_CHECKPOINT]` | End of a non-final chunk. Followed by the state summary the next chunk receives. |
| `[TASK_COMPLETE]` | Final chunk. Stop recursion. |
| `[NEEDS_TOOL tool="..." input="..."]` | Pause: the host fulfills the tool call, then resumes with the result injected into the next chunk. |
| `[NEEDS_CLARIFICATION] ...` | Pause: the host surfaces the question to a human, resumes via `resume(runId, { stepInput })`. |

Backward-compatible variants are **accepted but never emitted**: state `@@@STATE@@@`, `[STATE]`, `---STATE---`; final `@@@FINAL@@@`, `[FINAL]`, `---FINAL---`.

Rules:

- Every non-final chunk ends with the state marker + state summary.
- The final chunk ends with the final marker.
- Exactly one marker per chunk; the model never narrates markers.
- Display content is always cleaned of markers; carryover extraction reads the text *after* the state marker before cleaning.
- Marker-state text is accepted only if it is **≥ 24 chars**; anything shorter falls through the [compression cascade](./compression-cascade.md).
- A malformed marker is a typed error recorded on the run.

### The state block

The text after `[STATE_CHECKPOINT]` should be the structured, labeled block — this is the canonical carryover shape:

```
[STATE_CHECKPOINT]
COMPLETED: Selected Iceberg over Delta Lake (cost + ecosystem); drafted 3-phase migration
REMAINING: Catalog evaluation; backfill strategy for the cold layer
DECISIONS: target=Iceberg; phases=3 over 6 months
CONTEXT: entities: warehouse-v2, migration-pod; open: Polaris vs Glue
```

Format inside the categories is up to your framing — lists, key=value pairs, terse prose — as long as it fits in `carryoverTokens` and keeps the four labels.

## The XML alternate (documented mapping)

Hosts that prefer tag-delimited output — or use a model's structured-output mode — can run the **XML alternate**. It maps 1:1 onto the bracket wire format; the engine normalizes it on parse. The runnable `examples/` in this repo use this alternate for readability.

| Canonical (bracket) | XML alternate |
|---|---|
| `[STATE_CHECKPOINT]` + state block | `<CARRYOVER>...</CARRYOVER>` |
| `[TASK_COMPLETE]` | `<DONE>` |
| `[NEEDS_TOOL tool="..." input="..."]` | `<NEEDS_TOOL tool="..." input="..." />` |
| `[NEEDS_CLARIFICATION] ...` | `<NEEDS_CLARIFICATION>...</NEEDS_CLARIFICATION>` |
| (progress service / streaming events) | `<PROGRESS>...</PROGRESS>` — optional per-step status line for the UI |

Example of the alternate form:

```xml
<CARRYOVER>
COMPLETED: chose Iceberg over Delta Lake
REMAINING: catalog evaluation, backfill strategy
DECISIONS: 3-phase migration over 6 months
CONTEXT: open — Polaris vs Glue; cold-layer backfill window
</CARRYOVER>
```

Models with JSON mode can emit `{ output, carryover, progress, done }` and let the host convert to markers. Whatever the surface form, **the wire format inside the engine is the bracket protocol**, and config naming follows it (`chunkSize` is canonical; `tokensPerChunk` is a documented 1:1 alias used on some integration paths — see [`chunk-config.md`](./chunk-config.md)).

## Parser tolerance

The parser is **tolerant**. Markers can have:

- Extra whitespace, line breaks, indentation
- Mixed case (`[state_checkpoint]` and `<carryover>` both work)
- Optional trailing `/` on void XML markers (`<DONE/>`)
- Surrounding prose the model wrote anyway

It's **not** tolerant of:

- Malformed markers (unclosed XML tags, broken bracket attributes)
- Markers inside markers (no nesting)
- Carryover that exceeds `carryoverTokens` (truncated with a `carryover-overflow` warning, priority order preserved: decisions > open questions > entities > progress)

Malformed marker → typed error, run history records the attempt.

### Cleaning (exact regexes)

```
FINAL_RE  = /\[(?:TASK_COMPLETE|FINAL)\][\s\S]*$/
STATE_RE  = /\[(?:STATE_CHECKPOINT|STATE)\][\s\S]*$/
LEGACY_RE = /(@@@(?:STATE|FINAL)@@@|---(?:STATE|FINAL)---)[\s\S]*$/
clean(text) = text.replace(FINAL_RE,'').replace(STATE_RE,'').replace(LEGACY_RE,'').trim()
```

## What happens if no marker?

If a chunk produces no state marker, the engine falls back to the [compression cascade](./compression-cascade.md) and produces a carryover automatically from the chunk's full output. This works, but the model knows the task better than the generic compressor — encouraging marker emission is always better.

If a chunk produces no final marker and you've hit `maxChunks`, the run stops with `status: "max-chunks"` and a structured warning — not a silent truncation, not an error. The host decides whether to continue with a fresh run or accept the partial result.

## Why structured

A model that writes "we discussed the migration phases, then talked about the catalog choice, and finally agreed to..." in free-form prose is *summarizing*. Summarization drifts. Decisions get rephrased. Numbers get rounded. Open questions disappear.

A model that writes:

```
COMPLETED: chose Iceberg over Delta; committed 3-phase migration
REMAINING: catalog provider decision
DECISIONS: target=Iceberg; phases=3
CONTEXT: open — Polaris vs Glue
```

is **structuring**. Structure is what survives compression.

The marker protocol turns "summarize your progress" into "fill in this schema." That's why it works.

## What's next

- [Compression cascade](./compression-cascade.md) — what happens to the carryover before it lands in the next chunk
- [Run history](./run-history.md) — markers in the per-step records
- [Streaming UI](./streaming-ui.md) — surfacing progress to users
