# World Model Implementation Deep Dive

## Purpose

This document is a universal architecture guide for building a **world model** — a persistent, queryable, evolving representation of *things* (entities of any kind), the *contexts* they appear in, and the *relationships* between them.

It is deliberately domain-agnostic. The same architecture applies to:

- **Narrative & creative tools** — characters, locations, props, scenes
- **Knowledge & research systems** — documents, sources, claims, topics, citations
- **News & social aggregators** — articles, stories, publishers, hashtags, public figures
- **Agent platforms** — tasks, tools, sessions, observations, world state
- **Simulations & games** — actors, items, regions, factions, events
- **Product analytics** — users, accounts, features, sessions, cohorts
- **CRM / sales intelligence** — companies, contacts, deals, signals
- **Scientific knowledge bases** — molecules, papers, authors, experiments
- **Enterprise data catalogs** — datasets, owners, schemas, lineage
- **Personal knowledge management** — notes, tags, references, projects
- **IoT / monitoring** — devices, telemetry streams, incidents, regions
- **Recommendation systems** — items, users, interactions, taxonomies
- **Compliance & risk** — entities, sanctions lists, transactions, alerts

The word *entity* is used throughout in its broadest sense: anything the system needs to remember, reason about, or display. A character, a news story, a sensor, a paper, a company, a task, a concept — all are entities under this model.

The document covers:

- Data model and persistence
- Write/update lifecycles
- Semantic capture and continuity
- Relationship graphing (what is modeled vs what is implied)
- Dynamic enrichment pipelines
- Query and context-injection patterns
- Operator-facing UI (the world model "control plane")
- Concurrency, queueing, and consistency
- Trade-offs and portability

Two recurring example shapes are used to keep the abstractions concrete:

- **Example A — Timeline-of-snapshots**: a history of states (steps, scenes, frames, sessions) where entities exist *within* the snapshots. Suits narrative, simulation, agent trace, and game-state use cases.
- **Example B — Stream-clustered facts**: a stream of incoming items (articles, observations, events) clustered into higher-order aggregates (stories, topics, incidents). Suits research, news, monitoring, and intelligence use cases.

Both are valid world-model shapes. Most real systems are hybrids.

---

## 1) High-Level Architecture

A world model is, at minimum, three things layered together:

1. **A schema** — typed records for entities, contexts, and relationships.
2. **A pipeline** — an ordered set of steps that ingests raw input, derives entities, and writes them into a durable store.
3. **A read surface** — queries, projections, and context builders that downstream consumers (UI, ranking, generation, retrieval) call into.

Common architectural traits across well-built world models:

- **One canonical store, many derived views.** The persisted rows are the source of truth. Derived state (latest-version maps, sparklines, leaderboards, canonical merged entities) is reconstructed on read or rebuilt as a materialized view — never mutated independently.
- **Append-friendly, mutate-cautiously.** Snapshots, events, and observations are appended. Canonical aggregates are recomputed from the append log rather than edited in place.
- **Idempotent pipelines.** Re-running ingest on the same input produces the same world state. This makes repair, backfill, and replay safe.
- **Stable IDs derived from content, not autoincrement.** Externally-keyed entities use `type:system:externalId`; name-keyed entities use `` ent_${sha256(`${type}:${normalizeName(name)}`).hex.slice(0, 16)} `` (see `docs/stable-ids.md`). Content-derived IDs let independent processes agree on entity identity without coordination.
- **Schema-versioned storage.** Storage layers carry a version number; migrations are explicit and inspectable.
- **Bounded blast radius.** Failures in one entity's enrichment don't poison the rest of the world.

The architecture is intentionally portable: the same pieces can run client-side in a browser (IndexedDB), server-side in Postgres, or distributed across workers and queues.

---

## 2) The World Data Model

### 2.1 Aggregate shapes

There is no single "right" aggregate. Pick the one that matches how your domain accumulates state:

- **Timeline aggregate** (Example A)

  ```text
  World
    ├─ id, name
    ├─ snapshots: Snapshot[]
    │     ├─ timestamp
    │     ├─ context (config, location, scene)
    │     ├─ entities: EntityRef[]    // entities present in this snapshot
    │     ├─ events: Event[]           // what happened
    │     └─ artifacts (image, transcript, log)
    ├─ activeSnapshotIndex
    └─ registries: { locations, factions, items, ... }
  ```

  Use when state evolves through discrete steps and you need to reconstruct or branch from any point.

- **Stream-cluster aggregate** (Example B)

  ```text
  Items[]                         // raw ingested observations
    └─ clustered into Stories[]   // higher-order aggregates
                ├─ entities: EntityRef[]
                ├─ events: Event[]
                ├─ sources: SourceRef[]
                └─ scores: Score[] (over time)
  ```

  Use when raw input arrives continuously and meaning emerges from grouping.

- **Pure graph aggregate**

  ```text
  Nodes: { id, type, properties }
  Edges: { from, to, type, properties, validFrom, validTo }
  ```

  Use when relationships are first-class and time-bitemporality matters (knowledge graphs, lineage, compliance).

- **Hybrid** — most production systems combine two or more. A narrative tool may have a timeline plus a location registry plus an entity graph. A news system may have a stream-cluster plus a publisher graph plus a topic taxonomy.

### 2.2 Entity records

A robust entity record separates **identity**, **semantics**, **continuity anchors**, and **provenance**:

| Layer | Purpose | Examples |
|---|---|---|
| Identity | Stable handle | `id`, `name`, `type`, canonical aliases |
| Semantics | What it *is* / *means* | `description`, `traits`, `tags`, `summary` |
| Continuity anchors | Reduce drift across regenerations / re-encounters | visual essence, fingerprint hash, embedding, schema, signature |
| Aggregates | Cheap-to-read rollups | `mentionCount`, `firstSeenAt`, `lastSeenAt`, `linkedStoryIds` |
| Provenance | Where it came from | `isCustom`, `importedFrom`, `discoveredAt`, `createdFromSnapshotIndex` |
| Lifecycle | Where it is now | `state` (`emerging` / `active` / `archived`), `confidence`, `staleness` |

Not every entity needs every layer. A character benefits from continuity anchors (face, hair, voice). A news story benefits from aggregates (mention count, source diversity). A sensor benefits from lifecycle (online/offline/decommissioned). Pick what your domain rewards.

### 2.3 Context records

Entities live *inside* contexts. A context is "the environment in which this entity was observed or acts." Contexts deserve their own first-class records when they are reused or have their own properties:

- **Locations** (places, regions, scenes)
- **Sessions** (conversations, runs, episodes)
- **Sources** (publishers, sensors, channels, feeds)
- **Tenants / accounts** (multi-tenant data partitions)
- **Time windows** (day, sprint, quarter, market session)

Contexts often have their own graph (adjacency, hierarchy, lineage) and their own enrichment (description, palette, atmosphere, reliability score).

### 2.4 Relationship records

Edges between entities, when promoted to first-class records, gain:

- **Type** (`mentions`, `cites`, `owns`, `reports_to`, `connects_to`, `causes`, `depicts`)
- **Direction** (directed, undirected, symmetric)
- **Properties** (weight, confidence, time bounds)
- **Provenance** (which observation produced this edge)

If you don't need this richness, edges can stay implicit — denormalized as ID arrays on the endpoints (`entity.linkedStoryIds`, `story.entityIds`). Implicit edges are cheaper but harder to evolve.

---

## 3) Persistence and Durability

### 3.1 Choosing a substrate

| Substrate | Good fit for | Trade-offs |
|---|---|---|
| IndexedDB / SQLite (client) | Single-user tools, offline-first, privacy-sensitive workloads | No multi-user merge; constrained query language |
| Postgres / MySQL (server) | Multi-user, transactional, joinable | Operational overhead; network round trips |
| Document DB (Mongo, Firestore) | Flexible schema, embedded aggregates | Weak join story; eventual consistency caveats |
| Graph DB (Neo4j, Neptune) | Edge-heavy domains, multi-hop queries | Niche tooling; learning curve |
| Vector DB (pgvector, Pinecone, Qdrant) | Semantic search, similarity recall | Need an embedding pipeline; not a system of record |
| Object store + index | Large artifacts (images, audio, transcripts) | Pair with a metadata DB |
| In-memory + write-through | Hot working set, tests, fallbacks | Volatile; mirror to durable store |

A practical pattern is **one write-through adapter** that hides substrate choice from the rest of the app and provides graceful degradation (e.g., IndexedDB primary with in-memory fallback, or Postgres primary with read-replica failover).

### 3.2 Stores you typically need

Concrete store names will vary; the *kinds* recur:

- **Canonical entity store** — keyed by stable ID
- **Canonical context store** — keyed by stable ID (locations, sources, sessions)
- **Edge / mention store** — with indexes on both endpoints
- **Snapshot / observation store** — append-only history
- **Score / metric snapshot store** — for time series and ranking
- **Aggregate / materialized view store** — rebuilt from canonicals (do not mutate independently)
- **App / pointer state** — current selections, queues, dreaming state, active world

### 3.3 Indexing

At minimum, index every foreign-key-shaped field used in lookups:

- `mentions.articleId`, `mentions.storyId`
- `snapshots.worldId`
- `scores.storyId` (for "latest by ID")
- `entities.type` (for typed leaderboards)

Also consider time indexes (`discoveredAt`, `publishDate`) for window queries.

### 3.4 Failure handling

Durable, resilient storage layers share a few habits:

- Detect corruption, blocked-open, and quota errors explicitly.
- Retry with exponential backoff for transient errors.
- Provide a "nuke-and-rebuild" path for unrecoverable corruption, gated by user confirmation when possible.
- Persist *aggregate documents*, not only deltas, so a lost append doesn't leave the world unreadable.
- Debounce writes (e.g., ~300 ms) to avoid write storms during rapid edits.

---

## 4) End-to-End Write Lifecycle

The write path is the most consequential part of a world model. Get this right and every consumer benefits.

### 4.1 The canonical pipeline shape

There are **two complementary orderings, not competing ones**. The ten steps below are the **batch/stream cycle**. Each record inside a cycle runs the six-stage **per-observation event path** — `extract → normalize → resolve → validate → append → project` (see `docs/ingest-pipeline.md`) — with append as the only exactly-once stage.

Regardless of domain, batch/stream ingest cycles follow this order:

1. **Reconcile** — detach stale edges/aggregates touching items being reprocessed.
2. **Cluster / classify** — group raw items into higher-order aggregates (stories, scenes, sessions).
3. **Persist primary aggregates** — stories, snapshots, sessions.
4. **Score / measure** — compute trend velocity, salience, confidence; persist a snapshot row per measurement. Velocity is defined as `velocity(w) = mentions in window w / hours(w)` over bucketed windows of 1 h / 24 h / 7 d; `trendDirection = sign(velocity(current bucket) − velocity(previous bucket))`.
5. **Infer derived records** — events, milestones, alerts.
6. **Persist edges** — mentions, links, citations.
7. **Rebuild materialized views** — sources, leaderboards, "latest" maps.
8. **Patch source items** — write computed fields back onto raw items so downstream readers can avoid joins.
9. **Rebuild aggregates** — entity mention counts, trend direction, last-seen timestamps.
10. **Mark stale** — items not touched this cycle whose state is now out of date.

Each stage should be **awaited per record**, **idempotent**, and **safe to interrupt**.

### 4.2 Snapshot creation (Example A)

1. User input or upstream signal enters a creation queue.
2. Generate or capture the snapshot's primary content (text, image, transcript, telemetry).
3. Extract entities present in the snapshot.
4. Enrich entities (visual essence, embeddings, classifications, summaries).
5. Compose the snapshot record (context + entities + artifacts + timestamp).
6. Append to the world's history; update aggregates.
7. Persist through the write-through adapter.

### 4.3 Stream ingest (Example B)

1. Pull raw items from feeds, APIs, scrapers, or sensors.
2. Normalize to a common item shape with stable IDs.
3. Cluster items into aggregates using a refinement loop:
   - Coarse bucket by URL / signature / time / source.
   - Refine within bucket via similarity: two items co-cluster when **entity-overlap Jaccard ≥ 0.5 OR embedding cosine ≥ 0.85**.
   - Union-find to collapse merge-equivalent buckets.
4. Compute aggregate properties (title, summary, state, confidence).
5. Run the canonical pipeline (§4.1) over the resulting aggregates.

### 4.4 Bulk update / migration jobs

Some operations are world-wide rewrites:

- Re-render every snapshot containing entity X with X's updated definition.
- Re-cluster every item under a new similarity threshold.
- Backfill embeddings for every entity after switching providers.
- Repair orphan edges after a schema migration.

These should be modeled as **explicit jobs** with progress tracking, cancellation, and resumability — not as incidental side effects of an edit. They are world-model migrations at the content level, and they deserve the same rigor as schema migrations.

---

## 5) Semantic Meaning Capture

"Semantic" here means *what an entity means and how it relates to others*, beyond its ID.

### 5.1 Sources of meaning

In practice, meaning accumulates from many places:

- **Structured fields** on the entity itself (description, type, tags, traits)
- **Surrounding context** (snapshot narrative, item titles, transcript text)
- **Aggregate history** (how often, alongside what, with what outcome)
- **Embeddings** (vector representations for similarity)
- **External references** (Wikidata IDs, DOIs, ISO codes, cross-system keys)
- **Generated summaries** (LLM-produced canonical descriptions, refreshed on change)
- **Observational memory** (what the system has seen the entity do)

### 5.2 Symbolic vs textual vs vector representations

There are three complementary ways to encode meaning. Pick deliberately:

| Representation | Strengths | Weaknesses | Good for |
|---|---|---|---|
| **Symbolic** (typed predicates, RDF triples, schemas) | Precise, queryable, explainable | Brittle, expensive to author, schema-heavy | Compliance, ontologies, lineage |
| **Textual** (descriptions, traits, summaries) | Cheap, expressive, LLM-friendly | Hard to query exactly, drifts over time | Generative pipelines, prompt context |
| **Vector** (embeddings, hashes) | Similarity, retrieval, clustering | Opaque, requires model versioning | Search, dedup, recommendation |

Most production world models use **all three**, with each playing to its strengths. A character entity might have a typed `species` field (symbolic), a `description` (textual), and a `visualEssence` embedding (vector).

### 5.3 Continuity anchors

Continuity is the property that an entity *remains itself* across regenerations, edits, and time. Anchors are the dense, hard-to-drift representations that downstream pipelines re-inject as context. Examples:

- A 2–3 sentence visual essence for a character
- A canonical schema fingerprint for a dataset
- A normalized name + alias set for a public figure
- A topic embedding centroid for a story cluster
- A device serial + firmware version for a sensor

When a generation or inference step might *invent* a new version of an entity, anchors are the lever that pulls it back to canonical.

### 5.4 Memory subsystems

Long-running world models often grow a memory layer separate from the canonical store:

- **Short-term / working memory** — the last N observations, kept verbatim
- **Episodic memory** — recent sessions or runs, lightly summarized
- **Long-term memory** — distilled facts, retrievable by similarity

Memory is consulted at context-construction time and emitted as a `[RELEVANT MEMORIES]` block (or equivalent) to whatever consumer needs it. Keep memory writes automatic but bounded — every observation does not deserve to be remembered forever.

---

## 6) Relationship Graphing

### 6.1 Levels of graph maturity

Most world models do not need a full graph database. They progress through levels:

1. **Implicit** — relationships emerge from co-occurrence in snapshots or shared aggregates. No edges stored.
2. **Denormalized** — edges live as ID arrays on the endpoints (`entity.linkedStoryIds`).
3. **First-class edge records** — `mentions` table with indexes on both endpoints; supports edge properties.
4. **Typed graph** — multiple edge types, each with its own constraints and queries.
5. **Bitemporal graph** — edges have validity intervals; you can query "the world as it was on date X."

Move up a level only when the previous level is provably insufficient. Each level adds query power and operational cost.

### 6.2 Common edge patterns

- **Mentions** — item ↔ entity (item's text references entity)
- **Member-of** — entity ↔ aggregate (article in story, character in scene)
- **Adjacency** — context ↔ context (location connects to location)
- **Hierarchy** — entity ↔ entity (topic → subtopic)
- **Citation / lineage** — directed, often with weight
- **Co-occurrence** — derived, often a materialized view

### 6.3 Implicit signals to harvest before building a graph

Before promoting to typed edges, check if you can already get value from:

- Shared snapshot membership
- `@mentions` in text
- Shared location, source, or session
- Title / description token overlap
- Shared embedding neighborhood

A surprisingly capable relationship layer can be built from these alone.

---

## 7) Dynamic Enrichment

Enrichment is the set of post-ingest jobs that improve fidelity over time. The world model gets *better* the longer it runs, because enrichment fills in what the initial write could not.

### 7.1 Common enrichment kinds

- **Detail extraction** — pull structured attributes out of unstructured artifacts (face details from image, schema from CSV, entities from text).
- **Continuity anchor computation** — derive dense fingerprints (visual essence, embeddings, hashes).
- **Trait / tag generation** — produce categorical labels from descriptions or context.
- **Cross-source enrichment** — merge information about the same entity from multiple sources.
- **Vision / multimodal import** — accept an image, audio file, or document and produce a typed entity.
- **Rebuild / replay** — re-run a prior enrichment over historical content with an improved model.
- **Merge detection** — find probable duplicates and propose merges. A proposal fires when two same-type entities have **normalized-Levenshtein name similarity ≥ 0.85**, or high story/context overlap, or embedding proximity above the operator-review band. Proposals go to the operator queue — never auto-destructive.
- **Stale flagging** — mark entities whose underlying source has changed since their last enrichment.

### 7.2 Enrichment as a queue, not a side effect

Enrichment should be:

- **Explicit jobs** with IDs, status, and progress
- **Bounded in scope** (per-entity, per-window, per-source)
- **Cancellable**
- **Resumable**
- **Observable** (UI shows what is happening and how far along)

Implicit enrichment (running quietly in `useEffect` or a global hook) is a debugging nightmare. Promote enrichment to first-class jobs early.

### 7.3 Provider abstractions

Enrichment often calls external providers (LLMs, vision APIs, embedding services). Hide them behind adapters with:

- Provider preference (cloud vs local, primary vs fallback)
- Rate limiting and retry
- Cost / token accounting
- Versioning (record which provider + model produced each enrichment, so you can rebuild later)

---

## 8) Context Injection

The world model exists to be *consumed*. Most consumption happens at context-construction time: a downstream subsystem (generation, search, ranking, UI) asks "what does the world model know that's relevant here?"

### 8.1 Common injection points

- **Generation prompts** — entity canon, recent history, relevant memories, location atmosphere.
- **Search and ranking** — story velocity, source diversity, entity mention counts as features.
- **Retrieval-augmented generation** — top-K relevant entities or memories prepended to a query.
- **UI rendering** — leaderboards, sparklines, "related" panels, hero images.
- **Recap / digest generation** — periodic summaries of what changed.
- **Notifications** — fire when an entity crosses a threshold (velocity, confidence, staleness).

### 8.2 Building context

A good context builder:

1. Accepts the *intent* (what is being generated, ranked, or rendered).
2. Selects which entities and contexts are relevant — typically by mention, recency, similarity, or salience.
3. Prioritizes (mention-prioritized first, then recency, then similarity).
4. Prefers continuity anchors over raw fields (use the visual essence, not the raw description).
5. Falls back gracefully when an anchor is missing.
6. Truncates to a token / size budget.
7. Returns a structured payload, not a pre-rendered string, so callers can format for their target.

### 8.3 The wired-vs-helper trap

A common gap: helper functions exist to build rich context, but the active code path uses a simpler subset. Audit what is actually injected at runtime, not what *could be* injected. Document the gap explicitly so contributors know which helpers are live and which are dormant.

---

## 9) Writing and Updating Items

### 9.1 Entity writes

Entities can be created and updated through several channels. A complete model supports:

- **Manual creation** in the operator UI.
- **Import** from JSON, CSV, image, document, or external system.
- **Generation** by ingest pipelines.
- **Bulk update** by ID or name match across all snapshots or items.
- **Bulk delete** with cascade to edges and aggregates.

### 9.2 Canonical reconstruction

When entities exist across many snapshots or items, a canonical view must be derived:

- **Latest-wins** for atomic fields.
- **Union** for set-valued fields (traits, tags, aliases).
- **Longest-text-wins** for descriptive fields (often a useful proxy for "most informative version").
- **Most-confident-wins** when a confidence score exists.
- **Provenance-weighted** when sources have differing trust.

The canonical view is what consumers should see; the per-snapshot versions remain for audit and replay.

### 9.3 Context writes (locations, sources, sessions)

Contexts have their own write patterns:

- Manual create / edit / delete.
- Extraction from current snapshot or item ("turn this scene into a saved location").
- Generation from world context ("invent a new region consistent with what we have").
- Image / document import.

### 9.4 Snapshots and items

Snapshots are immutable by default — they are observations of the world at a moment. The UI may permit reordering, branching, duplicating, or deleting snapshots, but mutating an existing snapshot's content should be rare and explicit.

Items in a stream model (articles, observations) are likewise immutable inputs; their *world-model annotations* (storyId, entityIds, sync state) are the mutable surface.

### 9.5 Stale and orphan handling

Every world model accumulates rot. Build in:

- **Stale flags** — items that were once synced but whose aggregate has changed.
- **Orphan detection** — entities or events not linked to any aggregate (a data-quality canary).
- **Tombstones** — soft deletes that preserve historical references.
- **Repair jobs** — explicit operator-triggered rebuilds.

---

## 10) The Library / Control Plane

The operator-facing UI for a world model is not just a viewer — it is a **control plane** for CRUD, enrichment, and maintenance. Every world model worth keeping deserves one.

### 10.1 Display

For each entity type, the library should show:

- Deduped, canonical list.
- First-seen / last-seen / appearance count.
- Search, filter, sort (by recency, count, alphabetical, type).
- Drill-down to per-snapshot or per-item appearances.

For contexts (locations, sources, sessions):

- Registry view with usage counts.
- Assignment / unassignment to current snapshot.

For aggregates (stories, clusters):

- Velocity, confidence, state badges.
- Linked entities, items, sources.
- Sparklines / trend snapshots.

### 10.2 Edit

- Create, edit, delete with cascade.
- Bulk operations (rename, retype, merge).
- Trait / tag generation.
- JSON import / export.
- Image / document import.
- Random / suggested generation.
- Rebuild enrichment.

### 10.3 Maintenance

- Trigger pipeline runs (full, repair, window).
- Show queue state (running, queued, failed).
- Show per-job progress.
- Show schema version, record counts, orphan counts.
- Provide a "nuke and rebuild" path for corruption recovery.

### 10.4 Common UI/model gaps to watch for

- Dense continuity anchors (essences, embeddings) drive generation but are not surfaced as editable fields.
- Edge fields exist in the model (`connectedLocationIds`, `entityIds`) but no relationship visualization or edit UX.
- Pipelines exist but no visible run history.
- Enrichment jobs exist but no per-job log.

These gaps are normal early-stage; document them so they don't become silent debt.

---

## 11) Jobs, Queues, and Concurrency

A real world model has many concurrent operations: ingestion, enrichment, bulk rewrites, user edits, render queues. Concurrency is where most production bugs live.

### 11.1 A practical queueing model

- **Per-aggregate queue** — one running job at a time per world / project / stream, with FIFO backlog. Avoids cross-talk.
- **Job typing** — `ingest`, `action`, `bulk_update`, `rebuild`, `enrichment`. Different policies per type.
- **Processing head** — for chained jobs, a pointer to the snapshot they extend from.
- **Stale discard** — jobs older than **10 minutes** are discarded with a reason.
- **Retry / fallback** — network errors retry with backoff; persistent provider failures fall back to alternatives.
- **Cancellation** — jobs are cancellable; the canceller wins.

### 11.2 Background coordination

For UI-heavy clients, separate background-coordinator services from React/Vue lifecycles. Pipelines should not be tied to component mount/unmount. A long-running ingest must survive navigation.

### 11.3 No external infrastructure required

For client-side world models, in-process queues with per-aggregate isolation are sufficient. For server-side, a managed queue (SQS, Redis, NATS) buys durability across restarts but the per-aggregate FIFO discipline still applies.

---

## 12) Trade-offs and Architectural Choices

Three axes that drive most world-model design decisions:

### 12.1 Semantic depth vs scalability

- **Deep semantics** (typed ontology, LLM entity classification, knowledge graph linkage) — better reasoning, slower ingest, expensive merge logic.
- **Shallow semantics** (regex extraction, denormalized aggregates, structural signals) — fast, cheap, scales freely; weaker explanations.

Pick the depth your *consumers* actually need. A search tool needs less depth than a compliance system.

### 12.2 Mutable canon vs immutable append

- **Mutable canon** (operator can edit entities directly) — flexible, low-friction, drift-prone.
- **Immutable append** (ingest writes only; canon is rebuilt) — consistent, replayable, harder to "fix one wrong field."

Most systems are mutable-canon for operator-facing entities and immutable-append for derived aggregates.

### 12.3 Generative vs observational

- **Generative** (LLM produces entities, traits, summaries) — rich content, hallucination risk, needs continuity anchors.
- **Observational** (entities extracted from real-world signals) — grounded, sparse, needs aggregation to feel "alive."

Real systems mix: observational ingest + generative enrichment + operator override.

### 12.4 Time models

| Model | Use when |
|---|---|
| Discrete steps | Each state change is meaningful (turns, scenes, sessions) |
| Continuous timestamps | Events have absolute times (news, telemetry) |
| Bucketed windows | You analyze rates over rolling intervals (1h / 24h / 7d) |
| Bitemporal | You need "as-of" queries (compliance, audit, lineage) |

Most world models need at least two of these.

---

## 13) Universal Portability Blueprint

To stand up this architecture in a new product, in roughly this order:

1. **Pick aggregate shape** — timeline, stream-cluster, graph, or hybrid.
2. **Define the entity record** — identity / semantics / continuity / aggregates / provenance / lifecycle.
3. **Choose a persistence substrate** with a write-through adapter and graceful fallback.
4. **Implement stable ID derivation** (content-hash, normalized-name, external-key).
5. **Build the ingest pipeline** in canonical order (§4.1), idempotent and resumable.
6. **Add a context-builder** that consumers call instead of joining tables themselves.
7. **Add enrichment jobs** as first-class queue entries with progress and cancellation.
8. **Build the library / control plane** with display, edit, and maintenance surfaces.
9. **Promote relationships** from implicit to denormalized to first-class as need grows.
10. **Add memory and continuity anchors** when generation or retrieval starts drifting.
11. **Instrument** record counts, schema version, orphan counts, queue depth, job duration.
12. **Document the wired-vs-helper map** so contributors know what is actually live.

---

## 14) Pitfalls and Anti-Patterns

- **Schema drift without versioning.** Migrations become archaeology. Stamp every store with a version from day one.
- **Mutable aggregates.** If `mentionCount` can be incremented from anywhere, it will be wrong. Recompute it.
- **Hidden enrichment.** Side effects in mount hooks. You will not be able to find or stop them later.
- **Joining in consumers.** Every consumer reinvents the same join. Centralize in a query / context layer.
- **Single-source canon.** One bad field overwrites the truth. Prefer canonical reconstruction with provenance.
- **Edges as flags.** A `bool isAllyOf` field on every entity does not scale to N relationships. Promote to edges.
- **Unbounded memory.** Saving every observation forever degrades quality and cost. Distill and forget.
- **No control plane.** A world model with no operator UI calcifies. Operators are the immune system.
- **Treating ingestion as a one-shot.** Real ingest must be repeatable, resumable, and repair-friendly.
- **Conflating "stored" with "loaded."** Storing rich data you never read is a tax on every write.

---

## 15) Key Takeaways

- A world model is **persistent typed memory of things and how they relate**, with a write pipeline, a read surface, and an operator UI around it.
- The best architectures share traits across wildly different domains: stable IDs, idempotent ingest, derived canon, queued enrichment, structured context injection.
- Pick your aggregate shape (timeline, stream-cluster, graph, hybrid) deliberately — it shapes everything downstream.
- Continuity is the hardest property to preserve and the most valuable. Invest in continuity anchors early.
- Relationships should grow from implicit to typed only when consumers demand it.
- Enrichment is what makes the world model *get better* over time. Promote it to first-class jobs.
- The library is not a viewer. It is the control plane. Without one, the model decays.
- Trade-offs (semantic depth vs scale, mutable vs append, generative vs observational) are choices, not absolutes — and most production systems land in the middle of each axis.

A well-built world model is the substrate that makes downstream features — generation, search, ranking, recap, retrieval, agent reasoning — feel coherent. It is worth treating as a first-class subsystem with its own architecture, its own UI, and its own operational discipline, regardless of what your "things" happen to be.

---

## Verify your implementation

After implementing this spec, run the conformance suite against your build and iterate until it is green:

```bash
WORLD_MODEL_IMPL=/abs/path/to/your/index.ts npx tsx conformance/runner.ts
```

The suite (in `conformance/`) checks the exact-tier contracts: formulas, deltas, gates, boundary rulings, and never-happens behaviors. A green scorecard is the definition of done for this spec. The runnable reference in `reference/` passes it; diff against the reference when a check fails and the reason is unclear.
