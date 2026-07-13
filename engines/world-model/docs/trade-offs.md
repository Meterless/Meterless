# Trade-offs

What World Model is *not*, and when not to use it.

## What it's not

### Not a general-purpose graph database

World Model is good at *modeling a domain*. Neo4j, Memgraph, and TigerGraph are good at *executing arbitrary graph algorithms over enormous graphs*.

If your workload is "shortest path across 100M nodes" or "PageRank over the citation network," use a graph DB. If your workload is "what does my agent need to know about this account right now," use World Model.

### Not a vector database

World Model has a search view backed by embeddings, but it is not optimized for billion-scale vector search. The search view is for *finding entities in your world model*, not for general retrieval over arbitrary text.

For RAG-style retrieval against a large corpus that isn't part of your domain model, use a vector DB (Pinecone, Weaviate, Qdrant, pgvector) and treat the corpus as a separate concern.

### Not a real-time analytics store

The event log is append-only and ordered. Analytics queries (group-by, percentile, time-series rollups) work, but at moderate scale. If you need sub-second OLAP over billions of events, project World Model events into ClickHouse or DuckDB and run analytics there.

### Not a substitute for your transactional database

Your `orders` table belongs in Postgres. Your `payments` table belongs in Postgres. Money belongs in a transactional database with ACID guarantees.

World Model is for the **derived domain model** that agents and UIs consume — accounts, threads, players, articles, incidents. The transactional system of record stays where it is. World Model ingests from it.

### Not a message queue

World Model is for state, not for transient messages. If you have a stream of events that don't need to persist as part of the domain (clicks, telemetry, log lines), use a message queue or stream processor. World Model can ingest aggregates from that stream — it should not be the stream.

## When to use it

| Symptom | World Model is probably right |
|---|---|
| Agents need to remember a domain across sessions | ✓ |
| Multiple agents need to share the same picture of a domain | ✓ |
| You're building an entity-resolution layer on top of messy sources | ✓ |
| You need to answer "what did the world look like on date X" | ✓ |
| You need audit trails on every domain change | ✓ |
| You want to wipe and rebuild your read model without losing history | ✓ |

## When not to use it

| Symptom | Use something else |
|---|---|
| You need ACID transactions over money | Postgres / your transactional DB |
| You need billion-scale vector search | Vector DB |
| You need real-time graph algorithms | Graph DB |
| You need a message queue | Kafka / Redpanda / NATS |
| You need OLAP over hundreds of millions of events | ClickHouse / DuckDB |
| Your "world" fits in a single JSON file | A JSON file |

## Honest trade-offs in the design

### Append-only is more expensive

The event log grows. Old events are rarely read but always stored. Storage cost scales with write volume, not with current-state size.

Mitigation: snapshot + compact. Take periodic snapshots, prune events older than the snapshot, lose granular history for old events. Configurable per-namespace.

### Idempotency requires canonical keys

You have to declare a canonical key for each entity type. Bad canonical keys lead to bad merges. Good canonical keys are *boring* — they're the natural identifier of the thing.

If your domain has no natural identifier, content hashing falls back to attribute hashing, which means any attribute change creates a new ID. That's a sign the type is wrong: split it into a stable entity plus a fact stream.

### Operator UI is real work

Every team that adopts World Model in anger eventually needs operator workflows the default control plane doesn't cover. The control plane is extensible (custom views, custom merge UIs, custom replay tools), but plan for it.

### Schema migrations are explicit

You don't get to "just change the schema." A schema change is a migration with a version bump and a replay strategy. This is by design — silent schema drift is the failure mode this whole architecture exists to prevent.

If "just change the schema" is what you want, you don't want a canonical store, you want a key-value cache. Use that instead.

## Comparison table

| Need | World Model | Postgres | Neo4j | Vector DB |
|---|---|---|---|---|
| Domain modeling with provenance | ✓ | ⚠ | ⚠ | ✗ |
| ACID transactions | ⚠ | ✓ | ⚠ | ✗ |
| Append-only audit log | ✓ | ⚠ | ⚠ | ✗ |
| Idempotent ingest | ✓ | ⚠ | ⚠ | ⚠ |
| Time-travel queries | ✓ | ⚠ | ⚠ | ✗ |
| Vector retrieval | ⚠ | ⚠ | ✗ | ✓ |
| Real-time graph algorithms | ⚠ | ✗ | ✓ | ✗ |
| Schema versioning + replay | ✓ | ⚠ | ⚠ | ✗ |

Use the right tool. World Model is the right tool for one specific layer of your AI stack — the domain model that agents and applications share.
