# Concurrency and queues

World Model is append-only at the canonical layer, which makes most concurrency questions degenerate cases. But the corners matter.

## The model

- **Writes are events.** Appending an event is atomic.
- **State is a fold.** Concurrent reads of the same view return consistent state at some event offset.
- **Views are async-projected by default.** New events are visible immediately in the event log, eventually in views.

## Write ordering

Events are appended in a **monotonic total order** within a namespace. The order is determined by the append site, not by clock time on the writer.

```
Event 1: upsertEntity at 14:00:01.000
Event 2: upsertEntity at 14:00:00.998 (clock skew)
```

Even if the writer's clock says event 2 happened first, the log records event 1 first because event 1 reached the append stage first. Clock skew is a producer concern, not a store concern.

## Write coalescing

Two writes to the same entity within a small window get **coalesced into a single event** if and only if:

- They are both `upsertEntity`.
- They have the same provenance kind.
- They produce the same canonical ID.
- The attribute updates don't conflict.

Otherwise, both events append. The later one supersedes the earlier in materialized state.

Coalescing is an optimization. It can be disabled per-source.

## Conflict windows

Two writers update the same attribute in overlapping pipeline runs. Both events append. The conflict resolver runs at projection time.

Resolution strategies (configurable per attribute):

- `most-recent-wins` — later event materializes.
- `highest-confidence-wins` — fact with higher confidence materializes.
- `source-priority` — fixed source ranking decides.
- `manual` — both facts visible; operator picks.

No write is ever dropped. Conflict resolution affects only the **derived view**.

## Queues

Ingest pipelines run as workers behind a queue.

```
source ──▶ extract queue ──▶ normalize queue ──▶ resolve queue ──▶ append
```

Each queue is:

- **Bounded** — backpressure stops upstream when downstream is slow.
- **Checkpointed** — workers persist their position.
- **At-least-once** — restarting a worker replays from the last checkpoint; idempotency catches the duplicates.

The append stage is the **only** stage that is exactly-once, because it's the only stage that mutates the canonical store.

## Concurrency caps

Each stage has a configurable concurrency cap. Defaults:

| Stage | Default cap |
|---|---|
| Extract | 4 |
| Normalize | 8 |
| Resolve | 4 |
| Validate | 16 |
| Append | 1 *(serialized)* |
| Project | per-view, default 2 |

Append is serialized within a namespace to preserve total ordering. If you need more append throughput, partition by namespace.

## Reader consistency

By default, reads from a view return **eventually consistent** results — the view may be a few events behind the log.

For tighter consistency:

```ts
// Read-your-writes for a single call
const result = await world.view("graph").waitForConsistency().neighborsOf(...);

// Read at a specific event offset
const result = await world.view("graph").atEvent(eventId).neighborsOf(...);
```

For most agent and UI use cases, async is fine. For workflows where a downstream agent must see an upstream agent's write, use `waitForConsistency`.

## Failure modes

| Failure | What happens | Recovery |
|---|---|---|
| Worker crashes mid-stage | Queue redrives from checkpoint | Idempotency keys collapse duplicates |
| Append fails (storage error) | Event not committed | Upstream stage retries from queue |
| View projection error | View is marked stale | Rebuild the view; canonical store is fine |
| Schema validation error | Event rejected, dead-letter | Operator reviews, fixes source, replays |
| Probabilistic merge false-positive | Both entities still in store as alias | Operator unmerges from audit trail |

The store's invariant: **a failure in any stage cannot corrupt the canonical store**. The worst case is a stuck queue, never a poisoned database.
