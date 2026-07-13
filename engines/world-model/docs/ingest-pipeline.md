# Ingest pipeline

Writes don't go straight into the canonical store. They flow through a pipeline that **dedupes, validates, resolves entities, attaches provenance, and produces events**. Each stage is idempotent and resumable.

## The stages

```
source ──▶ extract ──▶ normalize ──▶ resolve ──▶ validate ──▶ append ──▶ project
                                                                              │
                                                                              ▼
                                                                       derived views
```

| Stage | Job | Failure mode |
|---|---|---|
| **Extract** | Pull raw records from a source | Source unreachable → checkpoint and retry |
| **Normalize** | Map raw records to canonical shapes | Bad record → dead-letter, alert |
| **Resolve** | Compute stable IDs, follow aliases | Ambiguous match → operator queue |
| **Validate** | Schema check + provenance check | Schema violation → reject, log |
| **Append** | Write event to log | Append-only — cannot fail mid-write |
| **Project** | Update derived views | View error → rebuild that view only |

These six stages are the **per-observation write path** — the inner loop. Batch and streaming ingests wrap it in the 10-step aggregate cycle (reconcile → cluster/classify → persist aggregates → score → infer derived → persist edges → rebuild views → patch source items → **rebuild aggregates** → **mark stale**) defined in [`AGENTS.md`](../AGENTS.md) §4.1. The two orderings are complementary: every record a cycle touches still flows through the six stages above.

## Idempotency

Every stage is idempotent at the **event level**. Re-running the pipeline produces the same event log, which produces the same state.

How:

- **Dedupe key** — every input record gets a content-addressed dedupe key at the extract stage.
- **Checkpoints** — pipelines persist their position. Restarting picks up where it left off.
- **Append-only log** — the canonical store never overwrites. State is a fold over events.
- **Stable IDs** — re-ingesting the same record collapses to the same entity ID.

The test: run the same pipeline twice in a row. The second run should produce zero new events.

## Provenance is mandatory

Every record gets a `Provenance` block at the normalize stage. No provenance → reject at validate.

```ts
{
  kind: "rss",
  url: "https://example.com/feed.xml",
  at: "2026-05-17T14:23:00Z",
  checksum: "sha256:ab12...",
}
```

This is what makes the audit trail real. Six months later, an operator can ask "where did this fact come from?" and the answer is in the event payload.

## Entity resolution

The resolve stage does the work of "is this the same entity we already know about?"

Three strategies, layered:

1. **Exact match on canonical key** — same URL, same external ID, same normalized name. Done.
2. **Confident match on alias** — same primary ID after alias resolution. Done.
3. **Probabilistic match** — embedding similarity + attribute overlap, with **banded thresholds**: similarity **≥ 0.92 → auto-merge**; **0.82–0.92 → queue for operator review** (never auto-merge in the band); **< 0.82 → create a new entity**.

Probabilistic merges always write the **alias** event, never a destructive overwrite. An operator can undo them.

## Conflict handling

When two facts about the same entity disagree:

```ts
// "person:jerome-powell" is a readable display label; the canonical id for a
// name-keyed entity is ent_<sha256 hash> per stable-ids.md.
{ about: "person:jerome-powell", predicate: "title", value: "Chair", source: { kind: "rss", url: "..." } }
{ about: "person:jerome-powell", predicate: "title", value: "Chairman", source: { kind: "api" } }
```

The pipeline:

1. Logs both as Facts.
2. Runs the conflict resolver (configurable: most-recent-wins, highest-confidence-wins, source-priority, manual).
3. Materializes the winning value into the entity's `attrs`.
4. Marks the loser with `supersededBy` pointing at the winner.

No fact is ever lost. The entity's current state is a derivation.

## Streaming vs. batch

Both modes use the same pipeline.

- **Batch** — extract a file, run it through, checkpoint at the end.
- **Streaming** — subscribe to a source, run each record through with a watermark-based checkpoint.

The append stage is the same. The difference is upstream.

## Replay

Because the event log is append-only and stages are idempotent:

- **Replay a single source** — recompute all events from one source after a bug fix.
- **Replay a schema migration** — re-derive entity attributes under a new schema version.
- **Replay a view** — wipe a derived view and re-project from events.

A replay never corrupts the store. It rewrites events with a new schema version while preserving the originals.

See [`operator-control-plane.md`](./operator-control-plane.md) for the operator UI on top of this.
