# World Model Reference Implementation

The spec in [`../AGENTS.md`](../AGENTS.md), made executable. Event-sourced, deterministic, zero runtime dependencies. State is a fold over an append-only log; views are projections of the fold; every mutation writes an audit entry.

What it is NOT: a production library. Storage is in-memory or a JSON file per namespace, resolution uses Levenshtein similarity on normalized names, and clustering uses entity-overlap Jaccard. Your implementation swaps in real storage, embeddings, and scale; the contracts stay the same.

## Run it

```bash
npm install
npm test
npx tsx scripts/idempotency-check.ts            # core invariant: re-ingest -> empty diff
npx tsx scripts/idempotency-check.ts --mutate   # proof the check can fail
npm run build:browser                           # regenerates ../control-plane/live.html
```

## Layout

| File | What it implements |
|---|---|
| `src/types.ts` | Record shapes: Entity, Context, bitemporal Relationship, Fact, events, aggregates |
| `src/stableIds.ts` | Content-addressed IDs: NFKD name normalization, canonical JSON, inline sha-256 |
| `src/resolve.ts` | Merge bands (0.85 auto, [0.82, 0.85) review, below new), Levenshtein, Jaccard |
| `src/store.ts` | Append-only event store, fold, aliasing, audit, JSON persistence |
| `src/ingest.ts` | The 10-step pipeline with per-step timings and the idempotency contract |
| `src/index.ts` | WorldModel facade: writes behind a single-writer FIFO queue, views, operator surface |

## Rulings this reference pins (spec left them open)

- Similarity is `1 - levenshtein / max(len)` on NORMALIZED names. 0.85 exactly auto-merges; 0.82 exactly queues.
- Externally keyed records use the literal `type:system:externalId` grammar; name-keyed entities hash the normalized name; attr-keyed contexts hash attrs plus parent.
- Record timestamps always derive from observation provenance (`source.at`), never wall clock; that is what makes ingest idempotent. The injectable clock covers only genuinely-now operator actions.
- A new open edge with the same (from, type, context) and a different target CLOSES the previous open edge (`validTo` + `supersededBy`); nothing is deleted.

## The live control plane

[`../control-plane/live.html`](../control-plane/live.html) embeds this implementation (esbuild bundle, inlined so file:// works) and wires all five operator panels to it: real entities in Inspect, a seeded review-band pair in Merge, fact edits with audit entries, view rebuild timings, and an idempotent replay in Repair. Regenerate it after source changes with `npm run build:browser` and commit the output.
