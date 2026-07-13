# How to Use World Model

A practical walkthrough of building and operating a domain-agnostic world model. Code samples in **TypeScript**, **Python**, and **Rust**.

This guide assumes you have read the architecture overview. If you have not, start there. This document is about wiring it up.

---

## Table of contents

1. [Pick your aggregate shape](#1-pick-your-aggregate-shape)
2. [Define the canonical models](#2-define-the-canonical-models)
3. [Generate stable hash IDs](#3-generate-stable-hash-ids)
4. [Bootstrap storage](#4-bootstrap-storage)
5. [Run the ingest pipeline](#5-run-the-ingest-pipeline)
6. [Resolve and merge entities](#6-resolve-and-merge-entities)
7. [Enrich with bounded blast radius](#7-enrich-with-bounded-blast-radius)
8. [Rebuild derived views](#8-rebuild-derived-views)
9. [Query through the read surface](#9-query-through-the-read-surface)
10. [Operate the control plane](#10-operate-the-control-plane)
11. [Handle concurrency and consistency](#11-handle-concurrency-and-consistency)
12. [Migrate schemas safely](#12-migrate-schemas-safely)
13. [Compose with the rest of the stack](#13-compose-with-the-rest-of-the-stack)

---

## 1. Pick your aggregate shape

Three shapes. Most production systems hybridize.

### Timeline of snapshots

```text
World
  ├─ id, name
  ├─ snapshots: Snapshot[]
  │     ├─ timestamp
  │     ├─ context (config, location, scene)
  │     ├─ entities: EntityRef[]
  │     └─ events: Event[]
  └─ registries: { locations, factions, items }
```

Use when state evolves through discrete steps and you need to reconstruct from any point. Suits narrative tools, simulations, agent traces, game state.

### Stream-clustered facts

```text
Items[]
  └─ clustered into Stories[]
        ├─ entities: EntityRef[]
        ├─ events: Event[]
        ├─ sources: SourceRef[]
        └─ scores: Score[]
```

Use when raw input arrives continuously and meaning emerges from grouping. Suits news, research, monitoring, intelligence.

### Pure graph

```text
Nodes: { id, type, properties }
Edges: { from, to, type, properties, validFrom, validTo }
```

Use when relationships are first-class and time-bitemporality matters. Suits knowledge graphs, lineage, compliance.

Hybrids are common. A narrative tool can have a timeline plus a location registry plus an entity graph.

---

## 2. Define the canonical models

The schema separates **identity**, **semantics**, **continuity**, **aggregates**, **provenance**, and **lifecycle**.

### TypeScript

```ts
export interface Entity {
  // Identity
  id: string;
  name: string;
  type: string;
  aliases: string[];

  // Semantics
  description?: string;
  traits: string[];
  tags: string[];
  summary?: string;

  // Continuity anchors (reduce drift across regenerations)
  fingerprint?: string;
  embedding?: number[];
  visualEssence?: string;

  // Aggregates (cheap-to-read rollups)
  mentionCount: number;
  firstSeenAt: number;
  lastSeenAt: number;
  linkedIds: string[];

  // Provenance
  isCustom: boolean;
  importedFrom?: string;
  discoveredAt: number;
  createdFromSnapshotIndex?: number;

  // Lifecycle
  state: "emerging" | "active" | "archived";
  confidence: number;
  staleness: number;
}

export interface Context {
  id: string;
  kind: "location" | "session" | "source" | "tenant" | "time_window";
  name: string;
  properties: Record<string, unknown>;
  parentId?: string;
}

export interface Edge {
  id: string;
  from: string;
  to: string;
  type: string;
  weight?: number;
  confidence: number;
  validFrom?: number;
  validTo?: number;
  observationId: string;
}

export interface Snapshot {
  index: number;
  worldId: string;
  timestamp: number;
  contextId?: string;
  entityIds: string[];
  events: Event[];
}
```

### Python

```python
from dataclasses import dataclass, field
from typing import Literal, Optional, Any

EntityState = Literal["emerging", "active", "archived"]

@dataclass
class Entity:
    id: str
    name: str
    type: str
    aliases: list[str] = field(default_factory=list)

    description: Optional[str] = None
    traits: list[str] = field(default_factory=list)
    tags: list[str] = field(default_factory=list)
    summary: Optional[str] = None

    fingerprint: Optional[str] = None
    embedding: Optional[list[float]] = None
    visual_essence: Optional[str] = None

    mention_count: int = 0
    first_seen_at: int = 0
    last_seen_at: int = 0
    linked_ids: list[str] = field(default_factory=list)

    is_custom: bool = False
    imported_from: Optional[str] = None
    discovered_at: int = 0
    created_from_snapshot_index: Optional[int] = None

    state: EntityState = "emerging"   # new entities start emerging
    confidence: float = 0.6           # new-entity default
    staleness: float = 0.0

@dataclass
class Edge:
    id: str
    from_: str
    to: str
    type: str
    confidence: float = 1.0
    weight: Optional[float] = None
    valid_from: Optional[int] = None
    valid_to: Optional[int] = None
    observation_id: str = ""
```

### Rust

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum EntityState { Emerging, Active, Archived }

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Entity {
    pub id: String,
    pub name: String,
    pub r#type: String,
    #[serde(default)] pub aliases: Vec<String>,

    pub description: Option<String>,
    #[serde(default)] pub traits: Vec<String>,
    #[serde(default)] pub tags: Vec<String>,
    pub summary: Option<String>,

    pub fingerprint: Option<String>,
    pub embedding: Option<Vec<f32>>,
    pub visual_essence: Option<String>,

    pub mention_count: u64,
    pub first_seen_at: i64,
    pub last_seen_at: i64,
    #[serde(default)] pub linked_ids: Vec<String>,

    pub is_custom: bool,
    pub imported_from: Option<String>,
    pub discovered_at: i64,
    pub created_from_snapshot_index: Option<u32>,

    pub state: EntityState,
    pub confidence: f32,
    pub staleness: f32,
}
```

---

## 3. Generate stable hash IDs

**This one decision unlocks everything else.** Independent processes agree on entity identity without coordination. Re-ingesting the same input produces the same IDs. Backfill from cold data does not create duplicates.

### TypeScript

```ts
import { createHash } from "crypto";

export function stableEntityId(name: string, type: string): string {
  const normalized = `${type}:${normalizeName(name)}`;
  const hash = createHash("sha256").update(normalized).digest("hex").slice(0, 16);
  return `ent_${hash}`;
}

export function normalizeName(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")   // strip diacritics
    .replace(/\s+/g, " ")
    .trim();
}
```

### Python

```python
import hashlib, unicodedata, re

def normalize_name(s: str) -> str:
    s = s.lower()
    s = unicodedata.normalize("NFKD", s)
    s = "".join(ch for ch in s if not unicodedata.combining(ch))
    s = re.sub(r"\s+", " ", s).strip()
    return s

def stable_entity_id(name: str, type_: str) -> str:
    normalized = f"{type_}:{normalize_name(name)}"
    h = hashlib.sha256(normalized.encode("utf-8")).hexdigest()[:16]
    return f"ent_{h}"
```

### Rust

```rust
use sha2::{Sha256, Digest};
use unicode_normalization::UnicodeNormalization;

pub fn normalize_name(s: &str) -> String {
    let lowered = s.to_lowercase();
    let no_diacritics: String = lowered
        .nfkd()
        .filter(|c| !unicode_normalization::char::is_combining_mark(*c))
        .collect();
    no_diacritics.split_whitespace().collect::<Vec<_>>().join(" ")
}

pub fn stable_entity_id(name: &str, r#type: &str) -> String {
    let normalized = format!("{}:{}", r#type, normalize_name(name));
    let mut hasher = Sha256::new();
    hasher.update(normalized.as_bytes());
    let hex = format!("{:x}", hasher.finalize());
    format!("ent_{}", &hex[..16])
}
```

**Get name normalization right or you create silent duplicates.** Casing, whitespace, diacritics, and Unicode normalization form (NFKD vs NFC) all matter.

---

## 4. Bootstrap storage

A practical pattern: **one write-through adapter** that hides substrate choice from the rest of the app.

### TypeScript

```ts
interface Store<T> {
  get(id: string): Promise<T | null>;
  put(record: T): Promise<void>;
  delete(id: string): Promise<void>;
  query(filter: Filter): Promise<T[]>;
}

const stores = {
  entities: new EntityStore(postgres),       // canonical
  contexts: new ContextStore(postgres),       // canonical
  edges:    new EdgeStore(postgres, { indexedOn: ["from", "to"] }),
  snapshots: new SnapshotStore(postgres, { append: true }),
  scores:   new ScoreStore(postgres, { indexedOn: ["entityId", "timestamp"] }),
  views:    new MaterializedViewStore(redis), // derived
};
```

### Substrate selection

| Substrate | Good fit | Trade-off |
|---|---|---|
| IndexedDB / SQLite (client) | Single-user, offline-first, privacy | No merge across users |
| Postgres / MySQL | Multi-user, transactional, joinable | Operational overhead |
| Document DB | Flexible schema, embedded aggregates | Weak joins |
| Graph DB (Neo4j) | Edge-heavy, multi-hop queries | Niche tooling |
| Vector DB (pgvector, Qdrant) | Semantic search | Not a system of record |
| Object store + metadata DB | Large artifacts (images, audio) | Pair with metadata |

Use multiple substrates. Pick the best one for each store. The write-through adapter is your seam.

### Failure handling

```ts
async function durableWrite<T>(store: Store<T>, record: T): Promise<void> {
  const ATTEMPTS = 5;
  let delay = 100;
  for (let i = 0; i < ATTEMPTS; i++) {
    try {
      return await store.put(record);
    } catch (err) {
      if (isTransient(err) && i < ATTEMPTS - 1) {
        await sleep(delay);
        delay *= 2;
        continue;
      }
      if (isCorruption(err)) {
        await markForRebuild(store.name);
      }
      throw err;
    }
  }
}
```

Debounce writes around 300ms to avoid write storms during rapid edits.

---

## 5. Run the ingest pipeline

Every ingest path runs the same ordered steps. **Order matters. Re-runnability is the prize.**

These ten steps are the **batch/stream cycle** (AGENTS.md §4.1). Each record inside the cycle runs the six-stage **per-observation event path** — `extract → normalize → resolve → validate → append → project` (see [`docs/ingest-pipeline.md`](docs/ingest-pipeline.md)). The two orderings are complementary: the six stages are the inner loop; the ten steps are the cycle built on top of it.

```text
1.  Reconcile           Detach stale edges/aggregates touching reprocessed items
2.  Cluster / classify  Group raw items into higher-order aggregates
3.  Persist primary     Stories, snapshots, sessions
4.  Score / measure     Compute trend, salience, confidence; persist snapshot row
5.  Infer derived       Events, milestones, alerts
6.  Persist edges       Mentions, links, citations
7.  Rebuild views       Sources, leaderboards, "latest" maps
8.  Patch source items  Write computed fields back to raw items
9.  Rebuild aggregates  Mention counts, trend direction, last-seen timestamps
10. Mark stale          Items untouched this cycle whose state is out of date
```

Do not drop steps 9–10. Skipping the aggregate rebuild leaves `mentionCount` and trend direction drifting from the canonical log; skipping the stale pass leaves ghosts that were never reprocessed.

### TypeScript

```ts
async function ingest(items: RawItem[]): Promise<IngestReport> {
  const report = newReport();

  // 1. Reconcile
  const affectedIds = await reconcileTouchedRecords(items);

  // 2. Cluster / classify
  const aggregates = await cluster(items);

  // 3. Persist primary aggregates
  for (const agg of aggregates) {
    await stores.aggregates.put(agg);
    report.aggregatesUpserted += 1;
  }

  // 4. Score / measure
  const scores = await measure(aggregates);
  for (const s of scores) await stores.scores.put(s);

  // 5. Infer derived
  const events = await inferEvents(aggregates, scores);
  for (const e of events) await stores.events.put(e);

  // 6. Persist edges
  const edges = await deriveEdges(items, aggregates);
  for (const e of edges) await stores.edges.put(e);

  // 7. Rebuild materialized views
  await rebuildLatestMaps(affectedIds);
  await rebuildLeaderboards();

  // 8. Patch source items
  for (const item of items) {
    item.aggregateId = lookupAggregateId(item, aggregates);
    await stores.items.put(item);
  }

  // 9. Rebuild aggregates (mention counts, trend direction, last-seen)
  await rebuildAggregates(affectedIds);

  // 10. Mark stale — items untouched this cycle whose state is out of date
  await markStale({ untouchedSince: report.startedAt });

  return report;
}
```

### Python

```python
async def ingest(items: list[RawItem]) -> IngestReport:
    report = new_report()

    affected_ids = await reconcile_touched_records(items)

    aggregates = await cluster(items)
    for agg in aggregates:
        await stores.aggregates.put(agg)
        report.aggregates_upserted += 1

    for s in await measure(aggregates):
        await stores.scores.put(s)
    for e in await infer_events(aggregates, scores):
        await stores.events.put(e)
    for edge in await derive_edges(items, aggregates):
        await stores.edges.put(edge)

    await rebuild_latest_maps(affected_ids)
    await rebuild_leaderboards()

    for item in items:
        item.aggregate_id = lookup_aggregate_id(item, aggregates)
        await stores.items.put(item)

    await rebuild_aggregates(affected_ids)                      # 9. rebuild aggregates
    await mark_stale(untouched_since=report.started_at)         # 10. mark stale

    return report
```

### Rust

```rust
pub async fn ingest(stores: &Stores, items: Vec<RawItem>) -> anyhow::Result<IngestReport> {
    let mut report = IngestReport::default();
    let affected_ids = reconcile_touched_records(stores, &items).await?;

    let aggregates = cluster(&items).await?;
    for agg in &aggregates {
        stores.aggregates.put(agg).await?;
        report.aggregates_upserted += 1;
    }
    for s in measure(&aggregates).await? { stores.scores.put(&s).await?; }
    for e in infer_events(&aggregates).await? { stores.events.put(&e).await?; }
    for edge in derive_edges(&items, &aggregates).await? { stores.edges.put(&edge).await?; }

    rebuild_latest_maps(stores, &affected_ids).await?;
    rebuild_leaderboards(stores).await?;

    for mut item in items {
        item.aggregate_id = lookup_aggregate_id(&item, &aggregates);
        stores.items.put(&item).await?;
    }

    rebuild_aggregates(stores, &affected_ids).await?;              // 9. rebuild aggregates
    mark_stale(stores, report.started_at).await?;                  // 10. mark stale

    Ok(report)
}
```

### Idempotency check

Run the pipeline twice on the same input. Compare the resulting world. **Diff should be empty.** If not, you have a non-deterministic enrichment step. Cache or seed it.

---

## 6. Resolve and merge entities

Hash IDs do most of the work. Aliases, fuzzy matching, and operator merges handle the rest.

### TypeScript

```ts
class EntityResolver {
  async resolve(name: string, type: string): Promise<Entity> {
    // 1. Try canonical ID
    const canonicalId = stableEntityId(name, type);
    const exact = await stores.entities.get(canonicalId);
    if (exact) return exact;

    // 2. Try alias index
    const aliasMatch = await stores.entities.queryByAlias(normalizeName(name), type);
    if (aliasMatch) return aliasMatch;

    // 3. Try fuzzy match within type — banded thresholds:
    //    ≥ 0.92            auto-merge (always recorded as an alias event)
    //    0.82 – 0.92       queue for operator review, do NOT merge
    //    < 0.82            new entity
    const candidates = await stores.entities.fuzzySearch(name, type, { topK: 3 });
    const best = candidates[0];
    const score = best ? similarity(best.name, name) : 0;
    if (score >= 0.92) return best;
    if (score >= 0.82) await operatorQueue.proposeMerge({ candidate: best, name, type, score });

    // 4. Create new emerging entity
    const entity: Entity = {
      id: canonicalId,
      name,
      type,
      aliases: [],
      mentionCount: 0,
      firstSeenAt: Date.now(),
      lastSeenAt: Date.now(),
      linkedIds: [],
      isCustom: false,
      discoveredAt: Date.now(),
      state: "emerging",
      confidence: 0.6,
      staleness: 0,
      traits: [],
      tags: [],
    };
    await stores.entities.put(entity);
    return entity;
  }
}
```

### Operator merge

When a human says "these two are the same entity", merge them:

```ts
async function mergeEntities(keepId: string, mergeId: string, actor: string): Promise<void> {
  const keep = await stores.entities.get(keepId);
  const drop = await stores.entities.get(mergeId);
  if (!keep || !drop) throw new Error("entity not found");

  // Union aliases
  keep.aliases = unique([...keep.aliases, drop.name, ...drop.aliases]);
  keep.mentionCount += drop.mentionCount;
  keep.firstSeenAt = Math.min(keep.firstSeenAt, drop.firstSeenAt);
  keep.lastSeenAt  = Math.max(keep.lastSeenAt,  drop.lastSeenAt);
  keep.linkedIds   = unique([...keep.linkedIds, ...drop.linkedIds]);

  await stores.entities.put(keep);

  // Rewrite edges
  await stores.edges.rewrite(mergeId, keepId);

  // Soft-delete the dropped entity
  drop.state = "archived";
  drop.tags = unique([...drop.tags, `merged_into:${keepId}`]);
  await stores.entities.put(drop);

  await audit.record({ kind: "entity_merge", keepId, mergeId, actor, timestamp: Date.now() });
}
```

The control plane writes back through the **same pipeline** as the ingest path. There is no privileged write path.

---

## 7. Enrich with bounded blast radius

Each entity type has its own enrichment worker. One worker failing must not poison the rest.

### TypeScript

```ts
class EnrichmentWorker {
  constructor(public entityType: string, public enricher: Enricher) {}

  async run(entityId: string): Promise<void> {
    try {
      const entity = await stores.entities.get(entityId);
      if (!entity || entity.type !== this.entityType) return;

      const updates = await this.enricher.enrich(entity);
      const merged = { ...entity, ...updates, lastSeenAt: Date.now() };
      await stores.entities.put(merged);
    } catch (err) {
      // Log but do not propagate. One entity's failure must not stop the world.
      logger.warn("enrichment failed", { entityId, type: this.entityType, err });
      await stores.errors.put({ entityId, type: this.entityType, err: String(err), at: Date.now() });
    }
  }
}

// Run a pool per entity type:
const pools = {
  character: new WorkerPool(new EnrichmentWorker("character", characterEnricher), { concurrency: 4 }),
  story:     new WorkerPool(new EnrichmentWorker("story", storyEnricher),         { concurrency: 8 }),
  source:    new WorkerPool(new EnrichmentWorker("source", sourceEnricher),       { concurrency: 2 }),
};
```

### Idempotency requirement

Enrichment that calls the model must be re-runnable or cached. Two ways to achieve that:

```ts
// Option A: cache by content hash
async function enrich(entity: Entity): Promise<Partial<Entity>> {
  const key = `enrich:${entity.id}:${contentHash(entity)}`;
  const cached = await cache.get(key);
  if (cached) return cached;

  const result = await generator.generate(buildPrompt(entity));
  await cache.put(key, result, { ttl: "30d" });
  return result;
}

// Option B: deterministic seeding
const result = await generator.generate(buildPrompt(entity), { seed: hashSeed(entity.id) });
```

---

## 8. Rebuild derived views

The canonical store is truth. Everything else is rebuilt from it. **Never mutate a derived view independently.**

### TypeScript

```ts
class LatestMapView {
  // "Latest aggregate version per ID"
  async rebuild(affectedIds: string[]): Promise<void> {
    for (const id of affectedIds) {
      const versions = await stores.aggregates.query({ aggregateId: id, orderBy: "version", desc: true, limit: 1 });
      if (versions.length === 0) {
        await stores.views.delete(`latest:${id}`);
        continue;
      }
      await stores.views.put({ key: `latest:${id}`, value: versions[0] });
    }
  }
}

class LeaderboardView {
  async rebuild(type: string): Promise<void> {
    const entities = await stores.entities.query({ type, orderBy: "mentionCount", desc: true, limit: 100 });
    await stores.views.put({ key: `leaderboard:${type}`, value: entities });
  }
}
```

Derived views can lag. Reads against them are eventually consistent. Plan for that in your UI.

---

## 9. Query through the read surface

Consumers do not query the canonical store directly. They go through a read surface that provides lookups, projections, context builders, and provenance.

### TypeScript

```ts
class ReadSurface {
  // Single-entity lookup
  async entity(id: string): Promise<Entity | null> { /* ... */ }

  // Projection
  async latest(aggregateId: string): Promise<Aggregate | null> {
    const view = await stores.views.get(`latest:${aggregateId}`);
    return view?.value ?? null;
  }

  // Time series
  async sparkline(entityId: string, window: TimeWindow): Promise<Score[]> {
    return stores.scores.query({ entityId, since: window.start, until: window.end });
  }

  // Context builder for prompts
  async buildPromptContext(req: ContextRequest): Promise<{ text: string; provenance: Provenance[] }> {
    const entities = await this.relatedEntities(req.subjectId, req.limit);
    const recent   = await this.recentEvents(req.subjectId, req.window);

    const text = formatForPrompt({ entities, events: recent });
    const provenance = [
      ...entities.map(e => ({ kind: "entity", id: e.id, source: e.importedFrom })),
      ...recent.map(e => ({ kind: "event", id: e.id, source: e.snapshotId })),
    ];
    return { text, provenance };
  }
}
```

### Python

```python
class ReadSurface:
    async def entity(self, id_): return await stores.entities.get(id_)

    async def latest(self, aggregate_id):
        view = await stores.views.get(f"latest:{aggregate_id}")
        return view["value"] if view else None

    async def sparkline(self, entity_id, window):
        return await stores.scores.query(
            entity_id=entity_id, since=window.start, until=window.end,
        )

    async def build_prompt_context(self, req):
        entities = await self.related_entities(req.subject_id, req.limit)
        recent = await self.recent_events(req.subject_id, req.window)
        return {
            "text": format_for_prompt({"entities": entities, "events": recent}),
            "provenance": [
                *[{"kind": "entity", "id": e.id, "source": e.imported_from} for e in entities],
                *[{"kind": "event", "id": e.id, "source": e.snapshot_id} for e in recent],
            ],
        }
```

### Rust

```rust
impl ReadSurface {
    pub async fn entity(&self, id: &str) -> anyhow::Result<Option<Entity>> {
        self.stores.entities.get(id).await
    }

    pub async fn sparkline(&self, entity_id: &str, window: TimeWindow) -> anyhow::Result<Vec<Score>> {
        self.stores.scores.query(ScoreQuery {
            entity_id: entity_id.into(),
            since: window.start,
            until: window.end,
        }).await
    }
}
```

### Provenance is non-negotiable

Every read can trace back to the rows that contributed. The trace is what makes the world model **auditable**.

---

## 10. Operate the control plane

A world model needs a control plane, not just an API. Operators inspect entities, merge duplicates, split conflated entities, mark canonical preferences, and trigger re-enrichment.

### TypeScript

```ts
class ControlPlane {
  async listEntities(filter: Filter): Promise<Entity[]> {
    return stores.entities.query(filter);
  }

  async mergeEntities(keepId: string, mergeId: string, actor: string): Promise<void> {
    return mergeEntities(keepId, mergeId, actor);
  }

  async splitEntity(id: string, newName: string, observationIds: string[], actor: string): Promise<Entity> {
    const original = await stores.entities.get(id);
    if (!original) throw new Error("not found");

    const newEntity = await resolver.resolve(newName, original.type);
    // Reassign edges produced by the listed observations
    await stores.edges.reassign({ observationIds, from: id, to: newEntity.id });
    // Recompute aggregates
    await rebuildAggregatesFor(id);
    await rebuildAggregatesFor(newEntity.id);
    await audit.record({ kind: "entity_split", originalId: id, newId: newEntity.id, actor });
    return newEntity;
  }

  async reenrich(id: string): Promise<void> {
    const entity = await stores.entities.get(id);
    if (!entity) throw new Error("not found");
    // Invalidate the enrichment cache for this entity
    await cache.deletePrefix(`enrich:${entity.id}:`);
    const pool = pools[entity.type];
    await pool.submit(entity.id);
  }
}
```

The control plane writes back **through the same pipeline as the ingest path**. There is no privileged write path. That is what keeps the world trustworthy.

---

## 11. Handle concurrency and consistency

| Concern | Recommendation |
|---|---|
| Writes per entity | Single-writer per entity for enrichment. Many readers anywhere. |
| Enrichment work | Queued. Worker pool per entity type. Backpressure on bursts. |
| Derived view freshness | Eventually consistent. Reads against canonical are strongly consistent. |
| Schema changes | Schema-versioned storage. Explicit, inspectable migrations. |
| Write storms | Debounce around 300ms. |
| Lost append | Persist aggregate documents, not only deltas. |

### Single-writer pattern

```ts
class SingleWriterRegistry {
  private locks = new Map<string, Promise<void>>();

  async withLock<T>(entityId: string, fn: () => Promise<T>): Promise<T> {
    while (this.locks.has(entityId)) await this.locks.get(entityId);
    let release!: () => void;
    const lock = new Promise<void>(r => { release = r; });
    this.locks.set(entityId, lock);
    try { return await fn(); }
    finally { this.locks.delete(entityId); release(); }
  }
}
```

Use Postgres advisory locks, Redis locks, or in-process locks depending on substrate.

---

## 12. Migrate schemas safely

Storage carries a version. Migrations are explicit.

```ts
const MIGRATIONS = [
  { from: 1, to: 2, run: addEntityLifecycleFields },
  { from: 2, to: 3, run: backfillFingerprints },
  { from: 3, to: 4, run: splitContextsIntoOwnStore },
];

async function migrate(currentVersion: number, target: number): Promise<void> {
  for (const m of MIGRATIONS) {
    if (m.from < target && m.from >= currentVersion) {
      console.log(`Migrating ${m.from} -> ${m.to}`);
      await m.run();
      await stores.meta.put({ key: "schema_version", value: m.to });
    }
  }
}
```

Run migrations through the **same write-through adapter**. The adapter is your seam against backwards compatibility.

---

## 13. Compose with the rest of the stack

### With H-MEM

The world model is the **system of record** for entities and relationships. H-MEM is the **agent's memory** — short-term, working, long-term recall. They are complementary.

```ts
// Pull world-model context into H-MEM as durable factual memories:
async function syncWorldToMemory(entityId: string): Promise<void> {
  const entity = await worldModel.entity(entityId);
  if (!entity) return;

  await hmem.add({
    content: `${entity.name} (${entity.type}): ${entity.summary ?? entity.description ?? ""}`,
    type: "factual",
    layer: "long_term",
    source: `world:${entityId}`,
    tags: [`world:${entity.type}`, ...entity.tags],
    entities: [{ name: entity.name, type: entity.type }],
    confidence: entity.confidence,
  });
}
```

### With Scout

Scout's context plan tells the world model how broad a context to assemble.

```ts
const contract = await scout.process({ rawInput, session });

const context = await worldModel.buildPromptContext({
  subjectId: extractSubjectId(rawInput),
  limit: contract.contextPlan.maxTokens > 16000 ? 50 : 20,
  window: { start: now() - 7 * DAY, end: now() },
});
```

### With Swarm

A planning agent inside a Swarm DAG can query the world model for entity context before generating a plan. The world model is read-mostly during a run.

```ts
// Inside TaskRunner.execute for a planning task:
const subject = parseSubject(task.prompt);
const context = await worldModel.buildPromptContext({ subjectId: subject, limit: 30 });
const augmentedPrompt = `${context.text}\n\n${task.prompt}`;
return await generator(augmentedPrompt, []);
```

---

## Trade-offs to be honest about

- **Idempotency requires deterministic enrichment.** LLM calls inside the pipeline must be re-runnable or cached.
- **Derived views lag.** Reads against them are eventually consistent.
- **Hash IDs need name normalization.** Get casing, whitespace, and diacritics right.
- **Append-only stores grow.** Plan retention policies per entity type up front.

---

## Common problems and what to try

| Problem | First thing to try |
|---|---|
| Duplicate entities appearing | Audit `normalizeName`. Add aliases. Check the resolver bands (auto-merge ≥ 0.92, review 0.82–0.92). |
| Re-ingest changes the world | An enrichment step is non-deterministic. Cache by content hash or seed it. |
| Derived views drift from canonical | Rebuild from canonical. Never edit a derived view directly. |
| One entity poisons enrichment | Catch and log per-entity. Worker pool isolation per type. |
| Reads are slow | Add foreign-key indexes. Materialize the hot views. |
| Operator merges feel unsafe | The control plane goes through the same pipeline. Add an undo via reverse merge. |
| Storage corruption | Detect explicitly. Provide nuke-and-rebuild gated by user confirmation. |

---

## Reusable principles to adopt first

If you only adopt three things from this guide:

1. **Hash-based stable IDs.** Stop using autoincrement for entities.
2. **Append-only canonical store. Recomputed derived views.** No silent mutations.
3. **Bounded blast radius on enrichment.** One worker per entity type. Failures isolated.

Those three take a system from "works in demo" to "survives production."

---

## Repository structure

This guide ships inside the [World Model repository](https://github.com/meterless/meterless/tree/main/engines/world-model). It is documentation-first: the architecture and contracts are written before the code, so the layout is a map of concepts.

```text
World-Model/
├── README.md            Overview, quick start, the canonical-store idea
├── docs/                The architecture, one concept per file
│   ├── architecture.md                    System shape and the ingest→read flow
│   ├── aggregate-shapes.md                Timeline / stream-cluster / graph / hybrid
│   ├── entity-context-relationship-model.md   The three primary record types
│   ├── stable-ids.md                      Content-addressed IDs, the keystone decision
│   ├── ingest-pipeline.md                 Idempotent writes, dedupe, conflict handling
│   ├── read-surface.md                    Derived views: graph, timeline, search, snapshot
│   ├── operator-control-plane.md          Inspect, merge, split, rebuild, repair
│   ├── concurrency-and-queues.md          Single-writer, eventual-consistency rules
│   └── trade-offs.md                      What it is not, and when not to use it
├── examples/            Reference walkthroughs against the contract
│   ├── minimal-entity-graph, timeline-of-snapshots, stream-clustered-facts
│   │                                      Core aggregate shapes
│   ├── narrative-world, news-intelligence, crm-account-world, agent-run-world-state
│   │                                      Domain scenarios
│   └── world-to-hmem-sync, swarm-planning-with-world-context,
│       scout-context-plan-to-world-query  Cross-engine integration
├── control-plane/       Illustrative operator-UI mock (index.html + README)
├── workshops/           Four-lab track (build → idempotent ingest → rebuild a view → merge)
├── src/                 Reserved for your implementation (contracts are language-agnostic)
└── content/             Launch post, one-pager, comparison
```

The repo folder specifies the contract; you bring the stack. A minimal runnable reference implementation lives in `reference/` so every example executes; your production implementation still belongs in your own codebase.

---

## License

Apache 2.0. Use it. Fork it. Ship it.
