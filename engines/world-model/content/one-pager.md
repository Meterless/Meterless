# World Model — One-Pager

**One shared model of your world.** Ingest anything. Unify everything. Power every agent and application.

## What it is

A persistent, queryable, evolving graph of entities, contexts, and relationships. Canonical store with derived views, idempotent ingest pipelines, stable IDs, schema-versioned storage, bounded blast radius.

## What it solves

Every AI product eventually needs a persistent picture of its domain. Most teams build it three times — as JSON blobs, then a Postgres schema, then a knowledge graph nobody can edit or audit. World Model is the version you build once.

## Five core capabilities

1. **Canonical store** — append-only event log, the single source of truth.
2. **Derived views** — graph, timeline, search, custom projections. Rebuildable from the store.
3. **Idempotent ingest** — same input → same event log. Replay is safe.
4. **Stable IDs** — content-addressable, alias-aware, survive merges and re-imports.
5. **Operator control plane** — inspect, merge, edit, rebuild, repair from a browser UI.

## Composes with the Meterless stack

- Sync facts into **H-MEM** so agents remember the world.
- Answer **Scout** context plans without hallucinating entities.
- Feed **Swarm** planners with grounded state.
- Snapshot before a **Markovian** chain; reconcile after.

## Why it's different

- Built for replay from day one. Bug fixes don't require migrations.
- Operator control plane specified up front — inspect, merge, edit, rebuild, repair. No "we'll design the admin panel later."
- Schema versioning is mandatory, not optional.
- Apache 2.0-licensed. Yours forever.

## Adopt it

This repo is the **implementation spec** — there is no published `@meterless/world-model` package. Clone it, open it in your coding agent, and build the engine into your stack from `AGENTS.md`:

```bash
npx degit meterless/meterless/engines/world-model my-world-model
# then: "Implement the World Model engine in this project following AGENTS.md."
```

[Quickstart →](../README.md#quickstart) · [Workshops →](../workshops) · [Architecture →](../docs/architecture.md)
