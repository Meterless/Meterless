# World Model vs. the alternatives

Honest comparison of where World Model fits in your stack.

## vs. Neo4j / Memgraph (graph databases)

| | World Model | Neo4j |
|---|---|---|
| Built for domain modeling | ✓ | ⚠ general-purpose |
| Append-only event log | ✓ | ✗ edit-in-place |
| Idempotent ingest | ✓ built-in | ⚠ build your own |
| Stable IDs across merges | ✓ alias system | ⚠ manual |
| Operator UI in the box | ✓ | ⚠ Bloom is separate |
| Schema versioning | ✓ mandatory | ⚠ manual |
| Real-time graph algorithms (PageRank, shortest path on 100M nodes) | ⚠ | ✓ |

**Use World Model when:** the domain matters more than the algorithm. Most agent and application use cases.
**Use Neo4j when:** the algorithm matters more than the domain. Network analysis, recommendations on huge graphs.

## vs. Postgres

| | World Model | Postgres |
|---|---|---|
| Domain modeling with provenance | ✓ | ⚠ |
| ACID transactions over money | ⚠ | ✓ |
| Append-only audit log | ✓ built-in | ⚠ build your own |
| Time-travel queries | ✓ | ⚠ build your own |
| Schema versioning + replay | ✓ | ⚠ migrations only |

**Use World Model when:** you need the derived domain model that agents and applications consume.
**Use Postgres when:** you need the transactional system of record. Money, orders, identity.

Most production deployments use both: Postgres for transactional data, World Model for the derived agent-facing layer.

## vs. Vector databases (Pinecone, Weaviate, Qdrant)

| | World Model | Vector DB |
|---|---|---|
| Structured entities and relationships | ✓ | ✗ |
| Billion-scale vector search | ⚠ | ✓ |
| Provenance and audit | ✓ | ✗ |
| Text similarity retrieval | ⚠ | ✓ |

**Use World Model when:** you need to model your domain, not just retrieve similar text.
**Use a vector DB when:** you need RAG over a large corpus.

Use both: vector DB for retrieval, World Model for the structured layer that surfaces the right entities to retrieve against.

## vs. LangGraph / CrewAI / AutoGen "memory"

| | World Model | LLM-framework memory |
|---|---|---|
| Shared across agents and applications | ✓ | ⚠ per-agent |
| Audit trail | ✓ | ✗ |
| Operator inspect/merge/repair | ✓ | ✗ |
| Schema-versioned | ✓ | ✗ |
| Standalone usable without a specific framework | ✓ MIT | ⚠ coupled |

**Use World Model when:** you need a domain layer that lives longer than any one agent or framework.
**Use framework memory when:** you have one agent, one job, one session.

## vs. Event sourcing libraries (EventStoreDB, Axon)

| | World Model | EventStoreDB |
|---|---|---|
| Event sourcing primitives | ✓ | ✓ |
| Pre-built entity/context/relationship model | ✓ | ✗ |
| Operator control plane | ✓ | ⚠ paid feature |
| Local-first by default | ✓ | ✗ |
| Browser-native | ✓ | ✗ |
| Schema versioning | ✓ | ⚠ |

**Use World Model when:** you want event sourcing **with a domain model baked in** and an operator UI in the box.
**Use EventStoreDB when:** you're building generic event sourcing infrastructure and don't need a domain model.

---

## The honest summary

World Model is opinionated. It's good at one specific layer: **the derived domain model that agents and applications share**. If that's what you need, the alternatives all require you to assemble two or three of them and write the glue yourself.

If you need something else — billion-scale vector retrieval, real-time graph algorithms, ACID over money — World Model is the wrong answer. Use the right tool.

It composes with all of them.
