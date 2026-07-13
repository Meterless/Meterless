# Workshop 03 · Retrieve and Reinject

**Prereq:** [Lab 02](02-mine-and-enrich.md). **Time:** ~90 min. **Builds on:** an enriched store.

## Outcome

By the end you can rank memories with the hybrid scorer, group them into prompt context, and emit trace metadata that explains every selection.

Reference: [`docs/retrieval-ranking.md`](../docs/retrieval-ranking.md), [`docs/reinjection.md`](../docs/reinjection.md). Worked example: [`examples/04`](../examples/04-retrieve-and-reinject/README.md).

---

## Exercise 1 — Query preparation

Given a query string, produce: embedding, keywords, inferred domain, entities, and a strategy label (`minimal` | `personal` | `comprehensive`).

**Checkpoint:** `"Prepare the frontend install instructions."` → domain `tech/frontend`, entities include `frontend`, `install`.

## Exercise 2 — The hybrid ranker

Implement the eight-signal scorer with the confidence multiplier:

```text
raw   = 0.35*semantic + 0.20*keyword + 0.10*tag + 0.10*domain
      + 0.15*entity   + 0.05*layer   + 0.05*recency - 0.20*superseded
score = clamp01(raw) * confidence
```

Details: keyword = Jaccard overlap of the top-8 query tokens; layer weights long_term 1.0 / working 0.8 / short_term 0.6; recency = exponential decay on `lastAccessed` with a ~14-day time constant; superseded = 1 when `supersededBy` is set. Defaults: `topN = 5`, `threshold = 0.35` on the final score.

Persist the weight profile (e.g. `weights@2026-07`) so quality changes correlate with feedback later.

**Checkpoint:** a `long_term` pnpm rule outranks a `working` Node-version note for an install query; an off-domain memory falls below `threshold=0.35` and is excluded.

## Exercise 3 — Grouped reinjection

Format kept memories grouped by domain, with layer markers and entities:

```text
[tech/frontend] (long_term) Project uses pnpm, not npm. {entities: pnpm, npm}
[tech/frontend] (working)   The project targets Node 18. {entities: Node}
```

**Checkpoint:** grouping is by domain; the model is never told "this came from memory" — structure carries that.

## Exercise 4 — Trace + safety filter

Emit trace: `traceId`, `retrievalReason`, `strategy`, query domain/entities, per-memory score, ranker version, suppressed-superseded count. Before formatting, drop `review`/`wrong`-tagged memories and apply redaction to `private`/`pii`.

**Checkpoint:** a `wrong`-tagged memory that scores high is **not** in the prompt context but its suppression is visible in the trace; `read` writes a ledger entry.

## Exercise 5 — Discussion

1. Pure cosine similarity would rank two frontend memories nearly equally. Which signals break the tie correctly here, and why is layer weight worth only 0.05 while confidence multiplies the whole score?
2. Trace goes to the operator; content goes to the model. What breaks if you put the trace in the prompt? If you hide it from the operator?
3. "Memory is context, not instruction." Construct a memory string that, if treated as instruction, would be an injection attack. How does the safety rule defend against it?

---

## Done when

- The ranker beats vector-only on a mixed query.
- Context is domain-grouped with layer markers.
- Every result has trace metadata; `review`/`wrong` memories are filtered pre-prompt.

Validate against the **Retrieval quality** and **Reinjection quality** eval categories in [`evals/tests`](../evals/tests/README.md).

## Next

[`04-dream-and-sleep.md`](04-dream-and-sleep.md) — let memory evolve and stay healthy, safely.
