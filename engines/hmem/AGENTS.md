# H-MEM Agnostic Implementation Guide

## Purpose

This document codifies a production-ready Human Memory (H-MEM) architecture that any agentic product can implement. It covers:

- Memory mining (from interactions, files, plans, and responses)
- Hierarchical memory storage and retrieval
- Reinjection of memory context into model prompts
- Dreaming (pattern synthesis and proposal generation)
- Sleep cycle (consolidation, archival, synthesis)
- Trust layer (audit ledger and feedback effects)
- Conflict detection and resolution



---

## 1) Core Design Principles

- Treat memory as a **living knowledge graph**, not a flat note list.
- Separate **what is remembered** from **how it is used in prompts**.
- Keep provenance on every inferred memory (`source`, `derivedFrom`, `supersedes`, `relatedTo`).
- Use a **human approval boundary** for high-impact synthesis (dream outputs).
- Make every mutation auditable through a trust ledger.
- Favor graceful degradation: when AI extraction is unavailable, fall back to direct capture.

---

## 2) Canonical Memory Model

Each memory record should contain:

- `id`, `content`, `type` (`personal`, `factual`, `preference`, `general`)
- `layer` (`short_term`, `working`, `long_term`)
- `timestamp`, `lastAccessed`, `accessCount`
- `tags`
- Retrieval fields: lightweight `embedding`, runtime `score`
- Reliability fields: `confidence`, `source` — **both mandatory**; a record with no `source` must be rejected by construction
- Provenance: `provenance` object (`origin` enum, `learnedAt`, human-readable `label`, optional refs) — mandatory for new writes, derived for legacy rows
- Scoping fields: `chatId`, `missionId`, `goalRunId` — chat-scoped and goal-run-isolated recall
- Hierarchy fields: `domain`, `namespace`
- Graph fields:
  - `entities[]` (normalized entities with entity type; cap 10)
  - `relatedTo[]` (peer links; cap 5)
  - `supersedes` (replacement edge)
  - `supersededBy` (set by conflict resolution; drives the retrieval penalty)
  - `derivedFrom[]` (synthesis lineage)

This model supports ranking, governance, consolidation, and explainability.

---

## 3) Storage Topology

Use tiered storage with different persistence and decay behavior:

- **Short-term**: volatile/session memory
- **Working**: local persistent memory for active context
- **Long-term**: durable storage for validated knowledge

Recommended persistence split:

- `long_term` in durable DB
- `working` in lightweight local store
- `short_term` in memory/session

On load:

1. Hydrate long-term + working tiers.
2. Merge with in-session short-term.
3. De-duplicate by ID.
4. Backfill missing embeddings.
5. Apply forgetting curve to non-long-term records.

---

## 4) Memory Mining (Acquisition Pipeline)

### 4.1 Interaction Mining

Observe the seven canonical event types:

- `chat_message`
- `user_correction`
- `file_save`
- `file_open`
- `file_edit`
- `model_response`
- `plan_completion`

For each event type:

1. Build an extraction prompt specialized to that event.
2. Ask background model for strict JSON array of memory strings.
3. Parse robustly (strip markdown fences, tolerate minor format noise).
4. Validate (string, minimum length).
5. Add each item as memory with event-derived `type`, `tags`, and `source`.

### 4.2 Document/File Mining

For imported docs:

1. Truncate to safe token window.
2. Ask extraction model for reusable facts/preferences/technical knowledge.
3. Save mined items to working layer with source tags (document + file name).

### 4.3 No-Model Fallback

If no model is available:

- Store concise direct summaries as short-term memories.
- Preserve capture continuity instead of dropping information.

---

## 5) Normalization and Enrichment

Every added/updated memory should run enrichment:

- Domain classification (multi-pass):
  - explicit tags (`project:*`, `tech:*`)
  - specific tech detection (`tech:react`, `tech:python`, etc.)
  - project-name inference
  - weighted scoring over keywords/tags/phrases/type hints
  - fallback heuristics
- Namespace generation (domain sub-buckets like `work/meetings`, `tech/frontend`)
- Entity extraction (technology, concept, person heuristics; normalized names)
- Relationship discovery:
  - `supersedes` detection from high similarity + correction/update language
  - `relatedTo` by shared entities and domain affinity

Use bidirectional linking for related nodes where possible.

---

## 6) Reinjection (Retrieval -> Prompt Context)

Reinjection is the operational heart of H-MEM.

### 6.1 Retrieval Ranking

Given a query:

1. Build query embedding.
2. Extract query keywords.
3. Infer query domain.
4. Extract query entities.
5. Score each memory with the canonical hybrid formula:

```text
raw = 0.35·semantic + 0.20·keyword + 0.10·tag + 0.10·domain
    + 0.15·entity   + 0.05·layer   + 0.05·recency − 0.20·superseded
score = clamp01(raw) × confidence
```

   - keyword = Jaccard overlap of the top-8 query tokens vs memory tokens
   - layer weights: long_term 1.0, working 0.8, short_term 0.6
   - recency = exponential decay on `lastAccessed`, ~14-day time constant
   - superseded = 1 if `supersededBy` is set (penalized, never deleted)
6. Keep memories above threshold (0.35 on the final score) and take top N (5).

### 6.2 Reinjection Format

Build context as grouped blocks:

- Domain-grouped memory sections
- Each memory line with layer marker and optional entities

Also emit trace metadata:

- `retrievalReason`
- per-memory relevance score
- selected strategy label (`minimal`, `personal`, `comprehensive`, etc.)

Inject this context into downstream prompts for:

- chat generation
- planning/orchestration
- debate agents
- file editing/optimization agents

This makes memory influence explicit, inspectable, and reusable across products.

---

## 7) Dreaming System (Constructive Synthesis)

Dreaming is not cleanup; it is **new knowledge generation**.

### 7.1 Inputs and Preparation

- Pull all memories.
- Cluster related memories using multi-signal relatedness:
  - content similarity
  - tag overlap
  - shared domain/type
  - entity overlap

### 7.2 Proposal Types

- **Insight**: synthesized cross-memory conclusion
- **Domain suggestion**: proposed reclassification for uncategorized memories
- **Invariant**: stable behavioral rule/pattern

### 7.3 Execution Phases

1. Initialize session state and progress telemetry.
2. Cluster memories.
3. Generate insights from clusters.
4. Generate domain suggestions from general memories.
5. Generate invariants from preference/personal/correction signals.
6. Return proposals for review.

### 7.4 Human-in-the-loop Approval

- Approved `insight` -> new long-term factual memory with `derivedFrom`.
- Approved `invariant` -> new long-term preference memory with `derivedFrom`.
- Approved `domain` -> update domain for source memories.
- Rejected proposal -> logged, not materialized.

Only approved proposals should become durable memory.

---

## 8) Sleep System (Consolidation and Compaction)

Sleep is operational maintenance of memory quality and footprint.

### 8.1 Preview-First Workflow

Before execution, compute:

- `toConsolidate`: stale short-term memories to promote
- `toArchive`: low-access old memories safe to remove
- `toSynthesize`: highly similar groups suitable for merge/synthesis

### 8.2 Guardrails

Do not archive memories with high relationship value:

- superseding/current records
- derived/synthesized memories
- relationship hubs

### 8.3 Execution

1. Create backup snapshot.
2. Consolidate: short-term -> long-term based on age/access rules.
3. Archive: delete low-value stale records.
4. Synthesize groups:
   - merge tags/entities
   - inherit non-internal relationships
   - create synthesized memory (`derivedFrom` lineage)
   - delete source memories
5. Persist report with action log + counts + backup ID.

Expose restore-from-backup for recovery.

---

## 9) Trust Layer (Audit and Reliability)

Trust is enforced by append-only audit behavior and feedback loops.

### 9.1 Audit Ledger

Log every significant action — the canonical 17 types:

`create, read, update, delete, feedback, promote, demote, merge, conflict_detected, conflict_resolved, sleep_consolidate, sleep_archive, sleep_synthesize, dream_proposed, dream_approved, dream_rejected, restore`

Each entry should include:

- `memoryId`, `action`, `actor`, `timestamp`
- optional `previousState`, `newState`
- structured details payload

### 9.2 Feedback Adaptation

When users mark memory trace items (exact deltas):

- helpful -> `accessCount += 1; confidence = clamp01(confidence + 0.05)`
- not helpful -> `confidence = clamp01(confidence − 0.03)`
- wrong -> `confidence = clamp01(confidence − 0.20)` + `review` tag

This closes the loop between retrieval quality and future ranking.

---

## 10) Conflict Detection and Resolution

### 10.1 Detection

Scan memory pairs with contradiction heuristics:

- opposing phrase pairs (`always/never`, `enable/disable`, etc.)
- high-similarity conflicting numeric values
- same-entity divergent claims

Confidence modifiers:

- shared entities increase confidence
- same domain increases confidence
- explicit relation lowers false positives
- supersedes relation suppresses conflict (treated as intended replacement)

Persist conflict records with reason and metadata.

### 10.2 Resolution Strategies

Support:

- keep A
- keep B
- keep both
- merge
- delete both

Auto-decision can use weighted heuristics:

- recency
- access frequency
- confidence
- content richness
- source reliability (`user_correction` = high)
- conflict type
- similarity and domain context

Auto-resolve only at decision confidence ≥ 0.70; queue everything else for human review. The losing record is marked `supersededBy` (kept and penalized in ranking, never deleted). All resolutions must be audit-logged with previous and new state.

---

## 11) Suggested Service Boundaries

Implement as composable services:

- `MemoryStoreService` (tiered persistence, CRUD, decay, promotion)
- `MemoryMiningService` (interaction/doc extraction + fallback)
- `MemoryRetrievalService` (ranking, context packaging, trace metadata)
- `DreamingService` (clustering + proposal generation + approval handling)
- `SleepCycleService` (preview + execution + backup/report)
- `TrustLedgerService` (audit ingest/query/stats/export; append-only, never destructively pruned — constrained clients archive-export and record `ledger_rotated` before trimming)
- `ConflictDetectionService` (scan, classify, resolve, auto-decide)


---

## 12) End-to-End Lifecycle

1. Observe interaction/document and mine candidate memories.
2. Add/update memory with domain/entity/relationship enrichment.
3. On query, retrieve top memories and reinject domain-grouped context.
4. Capture feedback and adjust confidence/access.
5. Periodically run dreaming for higher-order proposals.
6. Periodically run sleep for consolidation, archival, and synthesis.
7. Continuously detect and resolve contradictions.
8. Audit everything.

---

## 13) Operational Defaults (Recommended)

- Retrieval top-N: 5
- Retrieval threshold: 0.35 on the final score (after the confidence multiplier)
- Consolidation threshold: 7 days no recent access
- Archive threshold: ≥30 days old AND accessCount ≤2 AND unreferenced
- Sleep synthesis similarity: cosine ≥0.82
- Dream cluster min size: 2
- Dream relatedness threshold: 0.35
- Max dream proposals/type: 8
- Conflict auto-resolve gate: decision confidence ≥0.70
- Entity cap per memory: 10
- Related links cap per memory: 5
- Feedback deltas: helpful +0.05 / not_helpful −0.03 / wrong −0.20 (+ `review` tag)

Tune these per domain and user behavior.

---

## 14) Implementation Checklist

- [ ] Define canonical memory schema with lineage fields.
- [ ] Implement tiered persistence and migration-safe loading.
- [ ] Add acquisition hooks for all key event types.
- [ ] Build extraction prompts + robust JSON parsing fallback.
- [ ] Implement enrichment (domain, namespace, entities, relations).
- [ ] Implement hybrid retrieval scoring and reinjection formatter.
- [ ] Add memory trace metadata and feedback loop.
- [ ] Implement trust ledger and queryable audit APIs.
- [ ] Implement conflict scanning + resolution workflows.
- [ ] Implement dream proposal cycle with approval boundary.
- [ ] Implement sleep preview/execute/backup/restore.
- [ ] Add metrics and dashboards for memory health.

---

## 15) Explicit Non-Goals

- Agent/product-specific UI assumptions
- Provider-specific model lock-in

This guide is intentionally system-agnostic so any product can implement H-MEM as modular services.

---

## Verify your implementation

After implementing this spec, run the conformance suite against your build and iterate until it is green:

```bash
HMEM_IMPL=/abs/path/to/your/index.ts npx tsx conformance/runner.ts
```

The suite (in `conformance/`) checks the exact-tier contracts: formulas, deltas, gates, boundary rulings, and never-happens behaviors. A green scorecard is the definition of done for this spec. The runnable reference in `reference/` passes it; diff against the reference when a check fails and the reason is unclear.
