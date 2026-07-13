# 04 · Retrieve and Reinject

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

This is the operational heart of H-MEM. Capture is worthless if the right memory does not come back at the right moment, grouped, and explainable. This example runs the hybrid ranker and formats grouped prompt context with trace metadata.

Prerequisite reading: [`docs/retrieval-ranking.md`](../../docs/retrieval-ranking.md), [`docs/reinjection.md`](../../docs/reinjection.md).

---

## Scenario

The store holds (from examples 01–03 and prior sessions):

```text
mem_pnpm     "Project uses pnpm, not npm."                         long_term  tech/frontend
mem_node18   "The project targets Node 18."                        working    tech/frontend
mem_standup  "Standup is at 9:30 every weekday."                    long_term  work/meetings
mem_deploy   "Production deploy requires manager approval."         working    policy/access
```

Incoming query:

```text
Prepare the frontend install instructions.
```

---

## Walkthrough

### TypeScript

```ts
const { memories, trace } = await retrieval.query({
  text: "Prepare the frontend install instructions.",
  topN: 5,
  threshold: 0.35,
  strategy: "comprehensive"
});

const memoryContext = formatReinjection(memories);
const finalPrompt = `${memoryContext}\n\nUser: Prepare the frontend install instructions.`;

const response = await chatModel.generate(finalPrompt);
await persistTrace(trace);   // hand the trace to the UI
```

### Python

```python
result = await retrieval.query(
    text="Prepare the frontend install instructions.",
    top_n=5,
    threshold=0.35,
    strategy="comprehensive",
)

memory_context = format_reinjection(result.memories)
final_prompt = f"{memory_context}\n\nUser: Prepare the frontend install instructions."

response = await chat_model.generate(final_prompt)
await persist_trace(result.trace)
```

---

## How the ranker scores each candidate

The hybrid scorer blends eight signals, clamps to [0, 1], then multiplies by the record's confidence (see [`docs/retrieval-ranking.md`](../../docs/retrieval-ranking.md)):

```text
raw   = 0.35*semantic + 0.20*keyword + 0.10*tag + 0.10*domain
      + 0.15*entity   + 0.05*layer   + 0.05*recency - 0.20*superseded
score = clamp01(raw) * confidence
```

Keyword is the Jaccard overlap of the top-8 query tokens; layer weights are long_term 1.0 / working 0.8 / short_term 0.6; recency decays exponentially on `lastAccessed` (~14-day time constant). Illustrative per-signal values for this query:

| Memory | semantic | keyword | tag | domain | entity | layer | recency | raw | conf | **score** | kept? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `mem_pnpm` | 0.70 | 0.25 | 0.5 | 1 | 0.4 | 1.0 | 0.6 | 0.585 | 0.90 | **0.53** | ✓ |
| `mem_node18` | 0.52 | 0.12 | 0.5 | 1 | 0.2 | 0.8 | 0.8 | 0.466 | 0.78 | **0.36** | ✓ |
| `mem_deploy` | 0.18 | 0 | 0 | 0 | 0 | 0.8 | 0.7 | 0.138 | 0.85 | 0.12 | ✗ below 0.35 |
| `mem_standup` | 0.05 | 0 | 0 | 0 | 0 | 1.0 | 0.3 | 0.083 | 0.95 | 0.08 | ✗ below 0.35 |

Worked arithmetic for `mem_pnpm`: `0.35·0.70 + 0.20·0.25 + 0.10·0.5 + 0.10·1 + 0.15·0.4 + 0.05·1.0 + 0.05·0.6 = 0.585`; `0.585 × 0.90 = 0.53`.

Two memories clear the `0.35` threshold on the final score — `mem_node18` only just, because its lower confidence (0.78, model-extracted and not yet validated) drags the multiplier down.

---

## Expected prompt context

Grouped by domain, with layer markers and entities — the model sees structure without being told "this is from memory":

```text
[tech/frontend] (long_term) Project uses pnpm, not npm. {entities: pnpm, npm}
[tech/frontend] (working)   The project targets Node 18. {entities: Node}
```

## Expected trace

```json
{
  "traceId": "trace_7a1",
  "strategy": "comprehensive",
  "retrievalReason": "domain + entity + keyword match on frontend install intent",
  "queryDomain": "tech/frontend",
  "queryEntities": ["frontend", "install"],
  "rankerVersion": "weights@2026-07",
  "results": [
    { "memoryId": "mem_pnpm",   "score": 0.53 },
    { "memoryId": "mem_node18", "score": 0.36 }
  ],
  "suppressedSuperseded": 0
}
```

Each `read` also writes a ledger entry so retrieval itself is auditable.

---

## Why it matters

- **Hybrid, not nearest-neighbor.** Pure cosine similarity would surface `mem_node18` and `mem_pnpm` roughly equally and might leak the irrelevant `mem_deploy`. Domain + entity + layer weighting makes the install-critical pnpm rule the top result.
- **Grouping is the interface.** Domain-grouped context with layer markers lets the model weigh a validated `long_term` rule above a still-tentative `working` one.
- **Trace answers the second failure mode.** "Why did the model know to use pnpm?" → `trace_7a1`, score 0.53, domain+entity match. The agent does not just remember; it can explain.

## Next

[`05-dreaming-proposals`](../05-dreaming-proposals/README.md) — synthesizing new knowledge from clusters of memories like these.
