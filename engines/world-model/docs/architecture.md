# Architecture

World Model is a **canonical store with derived views**. Writes are append-friendly and idempotent. Reads come from views that are rebuildable from the store. The schema is versioned and migrations are explicit.

This document is the map. The other docs in `/docs` go deeper on each piece.

## The shape

```
┌─────────────────────────────────────────────────────────┐
│                      Canonical store                    │
│                                                         │
│   Entities · Contexts · Relationships · Facts · Events  │
│                                                         │
│   Append-only, content-addressed, schema-versioned      │
└──────────────────────┬──────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
   ┌────────┐     ┌────────┐      ┌────────┐
   │ graph  │     │timeline│      │ search │     ← derived views
   │ view   │     │  view  │      │  view  │
   └───┬────┘     └────┬───┘      └───┬────┘
       │               │              │
       └───────────────┼──────────────┘
                       ▼
            agents · UIs · pipelines     ← consumers
                       ▲
                       │
              ┌────────┴────────┐
              │ Ingest pipeline │     ← producers
              └─────────────────┘
                       ▲
                       │
                 sources, files, streams
```

## Three primitives

1. **Entity** — a thing that exists. Has a stable ID, a type, attributes, and provenance.
2. **Context** — a situation that scopes facts. Seasons, quarters, news events, campaigns, threads.
3. **Relationship** — a typed edge between two entities, optionally scoped to a context.

Plus two derived concerns:

- **Facts** — atomic statements about an entity, with source and confidence.
- **Events** — append-only records of writes, for replay and audit.

See [`aggregate-shapes.md`](./aggregate-shapes.md) for the exact shapes.

## Two surfaces

**Write surface** — small, strict, idempotent. Five primitives: `upsertEntity`, `upsertContext`, `relate`, `assertFact`, `snapshot`.

**Read surface** — open, projection-shaped, view-based. Graph queries, timeline queries, search queries, custom projections. See [`read-surface.md`](./read-surface.md).

## Quickstart

> This repo is the implementation spec — `@meterless/world-model` is the reference API name, not a published package. Code like this targets the contract; you (or your coding agent, following [`AGENTS.md`](../AGENTS.md)) bring the implementation.

```ts
import { WorldModel } from "@meterless/world-model";

const world = new WorldModel({
  storage: "local",
  namespace: "my-app",
  schemaVersion: 1,
});

// Write — externally keyed: the article's URL pins its stable ID
await world.upsertEntity({
  type: "article",
  externalKey: { system: "url", id: "https://guardian.example/2026-05-17-fed-rate" },
  attrs: { title: "Fed holds rates", publishedAt: "2026-05-17" },
  source: { kind: "rss", url: "https://example.com/feed", at: "2026-05-17T14:23:00Z" },
});

// Read from a view
const timeline = await world.view("timeline").entitiesOfType("article", {
  from: "2026-05-01",
  to: "2026-05-31",
});
```

## Bounded blast radius

The whole architecture is built around one principle: **a single bad write must never corrupt the store**.

- Writes are append-only events. The "current state" is a derivation.
- Bad events can be tombstoned without losing history.
- Bad pipelines can be replayed from a checkpoint.
- Bad schema migrations can be reverted.
- Bad entity merges can be unmerged from the audit trail.

This is what makes World Model safe to use as the canonical layer in production systems.

## What's next

- [Aggregate shapes](./aggregate-shapes.md) — exact data structures
- [Entity / Context / Relationship model](./entity-context-relationship-model.md) — how the three primary types compose
- [Stable IDs](./stable-ids.md) — how IDs survive merges, re-imports, and migrations
- [Ingest pipeline](./ingest-pipeline.md) — how writes become canonical state
- [Read surface](./read-surface.md) — the view system
- [Operator control plane](./operator-control-plane.md) — the operator UI
- [Concurrency and queues](./concurrency-and-queues.md) — write ordering and coalescing
- [Trade-offs](./trade-offs.md) — what World Model is *not*
