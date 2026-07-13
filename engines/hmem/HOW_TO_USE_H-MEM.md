# How to Use H-MEM

A practical walkthrough of building and operating an H-MEM instance. Code samples in **TypeScript**, **Python**, and **Rust**.

This guide assumes you have read the architecture overview. If you have not, start there. This document is about wiring it up.

---

## Table of contents

1. [Install and bootstrap](#1-install-and-bootstrap)
2. [Define the canonical memory record](#2-define-the-canonical-memory-record)
3. [Wire the tiered store](#3-wire-the-tiered-store)
4. [Mine memories from interactions](#4-mine-memories-from-interactions)
5. [Mine memories from documents](#5-mine-memories-from-documents)
6. [Retrieve and reinject context](#6-retrieve-and-reinject-context)
7. [Capture feedback](#7-capture-feedback)
8. [Run the dreaming cycle](#8-run-the-dreaming-cycle)
9. [Run the sleep cycle](#9-run-the-sleep-cycle)
10. [Detect and resolve conflicts](#10-detect-and-resolve-conflicts)
11. [Query the trust ledger](#11-query-the-trust-ledger)
12. [Operational checklist](#12-operational-checklist)

---

## 1. Install and bootstrap

H-MEM is a reference architecture. You implement the services. The contracts are language-agnostic.

The skeleton below assumes one process. Split services across workers when you scale.

### TypeScript

```ts
// A working version of every service below ships in reference/src/ in this
// folder; import from "../reference/src/index.ts" to run against it directly.
import { MemoryStoreService } from "./services/memoryStore";
import { MemoryMiningService } from "./services/memoryMining";
import { MemoryRetrievalService } from "./services/memoryRetrieval";
import { DreamingService } from "./services/dreaming";
import { SleepCycleService } from "./services/sleepCycle";
import { TrustLedgerService } from "./services/trustLedger";
import { ConflictDetectionService } from "./services/conflictDetection";

const ledger = new TrustLedgerService({ db: yourDb });
const store = new MemoryStoreService({ db: yourDb, ledger });
const retrieval = new MemoryRetrievalService({ store, embedder: yourEmbedder });
const mining = new MemoryMiningService({ store, generator: yourGenerator });
const dreaming = new DreamingService({ store, generator: yourGenerator });
const sleep = new SleepCycleService({ store, ledger });
const conflicts = new ConflictDetectionService({ store, ledger });

await store.hydrate();
```

### Python

```python
from hmem.services import (
    MemoryStore, MemoryMining, MemoryRetrieval,
    Dreaming, SleepCycle, TrustLedger, ConflictDetection
)

ledger = TrustLedger(db=your_db)
store = MemoryStore(db=your_db, ledger=ledger)
retrieval = MemoryRetrieval(store=store, embedder=your_embedder)
mining = MemoryMining(store=store, generator=your_generator)
dreaming = Dreaming(store=store, generator=your_generator)
sleep = SleepCycle(store=store, ledger=ledger)
conflicts = ConflictDetection(store=store, ledger=ledger)

await store.hydrate()
```

### Rust

```rust
use hmem::{
    MemoryStore, MemoryMining, MemoryRetrieval,
    Dreaming, SleepCycle, TrustLedger, ConflictDetection,
};

let ledger = TrustLedger::new(db.clone());
let store = MemoryStore::new(db.clone(), ledger.clone());
let retrieval = MemoryRetrieval::new(store.clone(), embedder.clone());
let mining = MemoryMining::new(store.clone(), generator.clone());
let dreaming = Dreaming::new(store.clone(), generator.clone());
let sleep = SleepCycle::new(store.clone(), ledger.clone());
let conflicts = ConflictDetection::new(store.clone(), ledger.clone());

store.hydrate().await?;
```

---

## 2. Define the canonical memory record

Every implementation language uses the same shape.

### TypeScript

```ts
export type MemoryType = "personal" | "factual" | "preference" | "general";
export type MemoryLayer = "short_term" | "working" | "long_term";

export interface Memory {
  id: string;
  content: string;
  type: MemoryType;
  layer: MemoryLayer;

  timestamp: number;
  lastAccessed: number;
  accessCount: number;

  tags: string[];
  domain?: string;
  namespace?: string;

  embedding?: number[];
  score?: number;
  confidence: number;
  source: string;

  entities: { name: string; type: string }[];
  relatedTo: string[];
  supersedes?: string;
  supersededBy?: string;   // set by conflict resolution; drives the ranking penalty
  derivedFrom: string[];

  // v2 extensions
  provenance?: MemoryProvenance;   // mandatory for new writes; derived for legacy rows
  chatId?: string;                 // recall scoping (chat-turn recall)
  missionId?: string;
  goalRunId?: string;              // recall scoping (goal-run isolation)
}

export type MemoryOrigin =
  | "chat" | "import" | "web" | "decision" | "curiosity" | "goal_run"
  | "user_explicit" | "inference" | "plan_run" | "mission" | "swarm_run"
  | "tool" | "brain";

export interface MemoryProvenance {
  origin: MemoryOrigin;
  learnedAt: number;
  label: string;            // human-readable "how I learned this"
  refs?: { chatId?: string; importRunId?: string; importSource?: string;
           sourceUrl?: string; sourceDomain?: string; decisionId?: string; goalRunId?: string };
}
```

`confidence` and `source` are **mandatory** — a record without `source` must be rejected by construction. The same v2 extension fields (`provenance`, `chatId`/`missionId`/`goalRunId`, `supersededBy`) apply identically to the Python and Rust shapes below; they are omitted there for brevity. See [`docs/memory-record.md`](docs/memory-record.md) for the full contract.

### Python

```python
from dataclasses import dataclass, field
from typing import Literal, Optional

MemoryType = Literal["personal", "factual", "preference", "general"]
MemoryLayer = Literal["short_term", "working", "long_term"]

@dataclass
class Entity:
    name: str
    type: str

@dataclass
class Memory:
    id: str
    content: str
    type: MemoryType
    layer: MemoryLayer

    timestamp: int
    last_accessed: int
    access_count: int

    confidence: float
    source: str

    tags: list[str] = field(default_factory=list)
    domain: Optional[str] = None
    namespace: Optional[str] = None

    embedding: Optional[list[float]] = None
    score: Optional[float] = None

    entities: list[Entity] = field(default_factory=list)
    related_to: list[str] = field(default_factory=list)
    supersedes: Optional[str] = None
    derived_from: list[str] = field(default_factory=list)
```

### Rust

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MemoryType { Personal, Factual, Preference, General }

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum MemoryLayer { ShortTerm, Working, LongTerm }

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Entity { pub name: String, pub r#type: String }

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Memory {
    pub id: String,
    pub content: String,
    pub r#type: MemoryType,
    pub layer: MemoryLayer,

    pub timestamp: i64,
    pub last_accessed: i64,
    pub access_count: u64,

    pub confidence: f32,
    pub source: String,

    pub tags: Vec<String>,
    pub domain: Option<String>,
    pub namespace: Option<String>,

    pub embedding: Option<Vec<f32>>,
    pub score: Option<f32>,

    pub entities: Vec<Entity>,
    pub related_to: Vec<String>,
    pub supersedes: Option<String>,
    pub derived_from: Vec<String>,
}
```

---

## 3. Wire the tiered store

Hydrate at startup. Long-term and working tiers load from durable storage. Short-term is session-only.

### TypeScript

```ts
async function hydrate() {
  const longTerm = await db.query("SELECT * FROM memories WHERE layer = 'long_term'");
  const working = await db.query("SELECT * FROM memories WHERE layer = 'working'");
  const shortTerm = sessionMemories;

  const merged = dedupeById([...longTerm, ...working, ...shortTerm]);
  await backfillMissingEmbeddings(merged);
  applyForgettingCurve(merged.filter(m => m.layer !== "long_term"));
  return merged;
}
```

### Python

```python
async def hydrate(self):
    long_term = await self.db.query("SELECT * FROM memories WHERE layer = 'long_term'")
    working = await self.db.query("SELECT * FROM memories WHERE layer = 'working'")
    short_term = self.session_memories

    merged = dedupe_by_id([*long_term, *working, *short_term])
    await self.backfill_missing_embeddings(merged)
    self.apply_forgetting_curve([m for m in merged if m.layer != "long_term"])
    return merged
```

### Rust

```rust
pub async fn hydrate(&self) -> anyhow::Result<Vec<Memory>> {
    let long_term = self.db.query("SELECT * FROM memories WHERE layer = 'long_term'").await?;
    let working   = self.db.query("SELECT * FROM memories WHERE layer = 'working'").await?;
    let short_term = self.session_memories.read().await.clone();

    let mut merged: Vec<Memory> = long_term.into_iter()
        .chain(working).chain(short_term).collect();
    merged = dedupe_by_id(merged);
    self.backfill_missing_embeddings(&mut merged).await?;
    apply_forgetting_curve(merged.iter_mut().filter(|m| !matches!(m.layer, MemoryLayer::LongTerm)));
    Ok(merged)
}
```

---

## 4. Mine memories from interactions

Seven event types: `chat_message`, `user_correction`, `file_save`, `file_open`, `file_edit`, `model_response`, `plan_completion`. Each gets an event-specific extraction prompt.

### TypeScript

```ts
await mining.ingest({
  eventType: "user_correction",
  source: "session:abc123",
  content: "No, the deadline is March 14, not March 4."
});

// Internally:
async function ingest(event: InteractionEvent) {
  const prompt = buildExtractionPrompt(event.eventType, event.content);
  const raw = await generator(prompt);
  const candidates = parseJsonStrict(raw);

  for (const item of candidates) {
    if (typeof item !== "string" || item.length < 6) continue;
    await store.add({
      content: item,
      type: inferType(event.eventType),
      tags: [`event:${event.eventType}`],
      source: event.source,
      layer: "working"
    });
  }
}
```

### Python

```python
await mining.ingest(
    event_type="user_correction",
    source="session:abc123",
    content="No, the deadline is March 14, not March 4."
)

async def ingest(self, event_type, source, content):
    prompt = build_extraction_prompt(event_type, content)
    raw = await self.generator(prompt)
    candidates = parse_json_strict(raw)

    for item in candidates:
        if not isinstance(item, str) or len(item) < 6:
            continue
        await self.store.add(Memory(
            content=item,
            type=infer_type(event_type),
            tags=[f"event:{event_type}"],
            source=source,
            layer="working",
            ...
        ))
```

### Rust

```rust
mining.ingest(InteractionEvent {
    event_type: EventType::UserCorrection,
    source: "session:abc123".into(),
    content: "No, the deadline is March 14, not March 4.".into(),
}).await?;

pub async fn ingest(&self, event: InteractionEvent) -> anyhow::Result<()> {
    let prompt = build_extraction_prompt(&event.event_type, &event.content);
    let raw = self.generator.generate(&prompt).await?;
    let candidates: Vec<String> = parse_json_strict(&raw)?;

    for item in candidates {
        if item.len() < 6 { continue; }
        self.store.add(Memory {
            content: item,
            r#type: infer_type(&event.event_type),
            tags: vec![format!("event:{:?}", event.event_type)],
            source: event.source.clone(),
            layer: MemoryLayer::Working,
            ..Default::default()
        }).await?;
    }
    Ok(())
}
```

### The no-model fallback

If your generator is unavailable, **do not drop the input**. Capture it as a short-term summary instead.

```ts
// TypeScript
async function ingestWithFallback(event: InteractionEvent) {
  try {
    return await ingest(event);
  } catch (err) {
    await store.add({
      content: truncate(event.content, 240),
      type: "general",
      layer: "short_term",
      tags: [`event:${event.eventType}`, "fallback:no-model"],
      source: event.source
    });
  }
}
```

---

## 5. Mine memories from documents

Truncate to a safe token window. Tag with file provenance. Save to the working layer.

### TypeScript

```ts
await mining.ingestDocument({
  path: "/docs/onboarding-policy.md",
  content: fileContents,
  maxTokens: 8000
});
```

### Python

```python
await mining.ingest_document(
    path="/docs/onboarding-policy.md",
    content=file_contents,
    max_tokens=8000
)
```

### Rust

```rust
mining.ingest_document(DocumentIngest {
    path: "/docs/onboarding-policy.md".into(),
    content: file_contents,
    max_tokens: 8000,
}).await?;
```

The extraction prompt for documents asks for **reusable facts, preferences, and technical knowledge**. Tag each mined memory with `source:doc:<filename>` so you can trace back.

---

## 6. Retrieve and reinject context

This is the operational core. Retrieval returns top-N memories. Reinjection formats them as grouped prompt context with trace metadata.

### TypeScript

```ts
const { memories, trace } = await retrieval.query({
  text: userMessage,
  topN: 5,
  threshold: 0.35,
  strategy: "comprehensive"
});

const memoryContext = formatReinjection(memories);
const finalPrompt = `${memoryContext}\n\nUser: ${userMessage}`;

const response = await chatModel.generate(finalPrompt);

// Hand the trace to your UI so the user can see why the model knew what it knew.
await persistTrace(trace);
```

### Python

```python
result = await retrieval.query(
    text=user_message,
    top_n=5,
    threshold=0.35,
    strategy="comprehensive"
)

memory_context = format_reinjection(result.memories)
final_prompt = f"{memory_context}\n\nUser: {user_message}"

response = await chat_model.generate(final_prompt)
await persist_trace(result.trace)
```

### Rust

```rust
let result = retrieval.query(QueryRequest {
    text: user_message.clone(),
    top_n: 5,
    threshold: 0.35,
    strategy: Strategy::Comprehensive,
}).await?;

let memory_context = format_reinjection(&result.memories);
let final_prompt = format!("{}\n\nUser: {}", memory_context, user_message);

let response = chat_model.generate(&final_prompt).await?;
persist_trace(&result.trace).await?;
```

### The hybrid ranker

The retrieval scorer blends eight signals, clamps to [0, 1], then multiplies by the record's confidence. A reference implementation in TypeScript:

```ts
function scoreMemory(query: Query, m: Memory): number {
  const raw =
    0.35 * cosine(query.embedding, m.embedding ?? []) +
    0.20 * keywordOverlap(query.keywords, m.content) +   // Jaccard of top-8 query tokens
    0.10 * tagOverlap(query.tags, m.tags) +
    0.10 * (m.domain === query.domain ? 1 : 0) +
    0.15 * entityOverlap(query.entities, m.entities) +
    0.05 * layerWeight(m.layer) +                        // long_term 1.0, working 0.8, short_term 0.6
    0.05 * recencyBoost(m.lastAccessed) -                // exp decay, ~14-day time constant
    0.20 * (m.supersededBy ? 1 : 0);                     // penalized, never deleted
  return clamp01(raw) * m.confidence;
}
```

Defaults: `topN = 5`, `threshold = 0.35` on the final score. Because confidence is a multiplier, feedback (§7) directly moves future ranking. Tune the weights per domain and persist a weight-profile label (e.g. `weights@2026-07`) so the trust ledger can correlate ranker changes with feedback.

### The reinjection format

Group by domain. Include layer markers and entities. The model can see structure without you saying "I retrieved this from memory."

```text
[work/meetings] (long_term) Standup is at 9:30 every weekday. {entities: standup, schedule}
[work/meetings] (working)   Sarah owns the Q2 roadmap doc. {entities: Sarah, roadmap}
[tech/frontend] (long_term) Project uses pnpm, not npm. {entities: pnpm, project}
```

---

## 7. Capture feedback

Feedback closes the loop. Wire your UI's thumbs-up, thumbs-down, and "this is wrong" actions to ledger writes.

### TypeScript

```ts
await ledger.recordFeedback({
  memoryId: "mem_abc",
  signal: "helpful",       // "helpful" | "not_helpful" | "wrong"
  traceId: "trace_xyz",
  actor: "user:42"
});

// On the store side:
async function applyFeedback(memoryId: string, signal: FeedbackSignal) {
  const m = await store.get(memoryId);
  switch (signal) {
    case "helpful":
      m.accessCount += 1;
      m.confidence = clamp01(m.confidence + 0.05);
      break;
    case "not_helpful":
      m.confidence = clamp01(m.confidence - 0.03);
      break;
    case "wrong":
      m.confidence = clamp01(m.confidence - 0.20);
      m.tags = unique([...m.tags, "review"]);
      break;
  }
  await store.update(m);
}
```

### Python

```python
await ledger.record_feedback(
    memory_id="mem_abc",
    signal="helpful",
    trace_id="trace_xyz",
    actor="user:42"
)
```

### Rust

```rust
ledger.record_feedback(FeedbackRecord {
    memory_id: "mem_abc".into(),
    signal: FeedbackSignal::Helpful,
    trace_id: "trace_xyz".into(),
    actor: "user:42".into(),
}).await?;
```

---

## 8. Run the dreaming cycle

Dreaming proposes new memories. Nothing materializes without human approval.

### TypeScript

```ts
const proposals = await dreaming.run({
  maxPerType: 8,
  clusterMinSize: 2,
  relatednessThreshold: 0.35
});

// proposals: { insights: [...], invariants: [...], domainSuggestions: [...] }

for (const p of proposals.insights) {
  await ui.presentProposal(p);  // user reviews
}

await dreaming.approve(proposalId);
await dreaming.reject(otherProposalId, "stale");
```

Approval handlers:

| Proposal type | On approval |
|---|---|
| `insight` | New long-term `factual` memory with `derivedFrom` |
| `invariant` | New long-term `preference` memory with `derivedFrom` |
| `domain` | Update `domain` field on source memories |

### Python

```python
proposals = await dreaming.run(
    max_per_type=8,
    cluster_min_size=2,
    relatedness_threshold=0.35,
)

for p in proposals["insights"]:
    await ui.present_proposal(p)

await dreaming.approve(proposal_id)
await dreaming.reject(other_proposal_id, reason="stale")
```

### Rust

```rust
let proposals = dreaming.run(DreamConfig {
    max_per_type: 8,
    cluster_min_size: 2,
    relatedness_threshold: 0.35,
}).await?;

for p in &proposals.insights {
    ui.present_proposal(p).await?;
}

dreaming.approve(&proposal_id).await?;
dreaming.reject(&other_proposal_id, "stale").await?;
```

---

## 9. Run the sleep cycle

Preview first. Execute second. Backup always.

### TypeScript

```ts
const preview = await sleep.preview();
// preview: { toConsolidate, toArchive, toSynthesize }

console.log("Will promote", preview.toConsolidate.length, "memories");
console.log("Will archive", preview.toArchive.length, "memories");
console.log("Will synthesize", preview.toSynthesize.length, "groups");

const report = await sleep.execute(preview);
// report: { backupId, consolidatedCount, archivedCount, synthesizedCount, actionLog }

// Roll back if something looks wrong:
await sleep.restore(report.backupId);
```

### Python

```python
preview = await sleep.preview()
print(f"Promote {len(preview.to_consolidate)} memories")
print(f"Archive {len(preview.to_archive)} memories")
print(f"Synthesize {len(preview.to_synthesize)} groups")

report = await sleep.execute(preview)
# Roll back if needed:
await sleep.restore(report.backup_id)
```

### Rust

```rust
let preview = sleep.preview().await?;
println!("Promote {} memories", preview.to_consolidate.len());

let report = sleep.execute(&preview).await?;
// Roll back if needed:
sleep.restore(&report.backup_id).await?;
```

### Guardrails

Sleep refuses to archive:

- Superseding records (anything pointed at by another memory's `supersedes`)
- Derived memories (anything with `derivedFrom` lineage)
- Relationship hubs (memories with high `relatedTo` count)

Encode these checks in the preview phase. The execute phase trusts the preview.

---

## 10. Detect and resolve conflicts

Run on a schedule. The detector finds candidate contradictions. The resolver decides.

### TypeScript

```ts
const detected = await conflicts.scan();
// detected: [{ id, memoryA, memoryB, reason, confidence }, ...]

for (const c of detected) {
  const decision = await conflicts.autoDecide(c);
  // decision: { strategy: "keep_a" | "keep_b" | "keep_both" | "merge" | "delete_both", reason }
  await conflicts.resolve(c.id, decision);
}
```

### Python

```python
detected = await conflicts.scan()
for c in detected:
    decision = await conflicts.auto_decide(c)
    await conflicts.resolve(c.id, decision)
```

### Rust

```rust
let detected = conflicts.scan().await?;
for c in detected {
    let decision = conflicts.auto_decide(&c).await?;
    conflicts.resolve(&c.id, decision).await?;
}
```

### Manual resolution

Auto-resolve only when the decision confidence is **≥ 0.70**. Below that, surface the conflict to a human.

```ts
// TypeScript
await conflicts.resolve(conflict.id, {
  strategy: "keep_a",
  reason: "user picked the more recent statement",
  actor: "user:42"
});
```

The resolution **always writes to the ledger**, with `previousState` and `newState` for the affected memories.

---

## 11. Query the trust ledger

Every mutation is auditable. Treat the ledger as your forensic log.

### TypeScript

```ts
// "Show me everything that happened to this memory."
const history = await ledger.history({ memoryId: "mem_abc" });

// "What changed in the last hour?"
const recent = await ledger.range({
  since: Date.now() - 3600_000,
  actions: ["update", "delete", "synthesize"]
});

// "How many wrong-feedback events did we record this week?"
const stats = await ledger.stats({
  since: Date.now() - 7 * 86400_000,
  groupBy: "action"
});
```

### Python

```python
history = await ledger.history(memory_id="mem_abc")
recent = await ledger.range(since=now_ms() - 3_600_000, actions=["update", "delete", "synthesize"])
stats = await ledger.stats(since=now_ms() - 7 * 86_400_000, group_by="action")
```

### Rust

```rust
let history = ledger.history("mem_abc").await?;
let recent  = ledger.range(LedgerRange {
    since: now_ms() - 3_600_000,
    actions: vec![Action::Update, Action::Delete, Action::Synthesize],
}).await?;
let stats = ledger.stats(StatsRequest {
    since: now_ms() - 7 * 86_400_000,
    group_by: GroupBy::Action,
}).await?;
```

---

## 12. Operational checklist

Defaults to start with. Tune per domain.

| Setting | Default |
|---|---|
| Retrieval top-N | 5 |
| Retrieval threshold | 0.35 on the final score (after confidence multiplier) |
| Consolidation threshold | 7 days no access |
| Archive threshold | ≥30 days old AND accessCount ≤2 AND unreferenced |
| Sleep synthesis similarity | cosine ≥0.82 |
| Dream cluster min size | 2 |
| Dream relatedness threshold | 0.35 |
| Max dream proposals per type | 8 |
| Conflict auto-resolve gate | decision confidence ≥0.70 |
| Entity cap per memory | 10 |
| Related links cap per memory | 5 |

Scheduling recommendations:

- **Mining.** Inline with every interaction event.
- **Retrieval.** Inline with every query that needs context.
- **Dreaming.** Daily or weekly. Surface proposals in a review queue, do not auto-approve.
- **Sleep.** Weekly. Run preview daily for observability, execute weekly.
- **Conflict scan.** Daily. Auto-resolve only at decision confidence ≥0.70; queue the rest.
- **Ledger pruning.** Never destructive. The ledger is append-only and never destructively pruned. If a constrained client must cap storage, export the oldest segment to an archive artifact and record a `ledger_rotated` entry before trimming — a silent cap is a contract violation.

---

## Common integration patterns

### Behind a chat agent

```
user message → retrieval.query → format → prepend to prompt → model
                                                  ↓
                                            mining.ingest (on every turn)
```

### Behind a planning agent

```
plan request → retrieval.query (strategy: "comprehensive") → prepend
plan output → mining.ingest (event: "plan_completion")
```

### With Markovian Engine

H-MEM's reinjected context becomes Markovian's `memoryContext` parameter, which the Markovian runtime injects into the first chunk only — re-injecting per chunk would defeat the O(1) property. Continuation chunks rely on Markovian's compressed carryover. If a lower layer of your generator also auto-augments prompts with memory, pass `skipSemanticMemoryAugmentation: true` down so retrieval does not happen twice. The two engines compose cleanly.

```ts
const { memories } = await hmem.query({ text: userPrompt, topN: 5 });
const memoryContext = formatReinjection(memories);

await markovian.run({
  prompt: userPrompt,
  mode: "ARCHITECT",
  memoryContext,
  generator: yourGenerator
});
```

---

## When to escalate

- **Retrieval feels stale.** Check `superseded` penalties in your ranker and run the conflict scanner.
- **The model contradicts itself.** Lower the retrieval threshold, raise top-N, and verify the trace shows current memories.
- **The store keeps growing.** Run sleep more often. Check archive guardrails are not over-protective.
- **Dreaming produces garbage.** Raise the relatedness threshold. Cluster minimum size of 3 instead of 2.
- **Performance drops.** Backfill missing embeddings. Profile the ranker; the per-memory loop is usually the hotspot.

---

## Repository structure

This repository ([github.com/meterless/meterless/tree/main/engines/hmem](https://github.com/meterless/meterless/tree/main/engines/hmem)) is documentation-first: every service contract is written down before any code, so the layout below is a map of *concepts*, not a build tree.

```text
H-MEM/
├── README.md            Overview, quick start, the canonical memory record
├── docs/                The architecture, one concept per file
│   ├── architecture.md          System shape and the end-to-end lifecycle
│   ├── memory-record.md         The portable record contract
│   ├── tiered-storage.md        short-term / working / long-term + forgetting curve
│   ├── mining-pipeline.md       Acquisition from chats, files, plans, responses
│   ├── retrieval-ranking.md     The eight-signal hybrid ranker
│   ├── reinjection.md           Grouped prompt context + trace metadata
│   ├── dreaming.md              Reviewed synthesis (insights, invariants, domains)
│   ├── sleep-cycle.md           Preview-first consolidation, archive, synthesis
│   ├── trust-ledger.md          The append-only audit contract
│   ├── conflict-resolution.md   Detection, scoring, audited resolution
│   ├── privacy-and-local-first.md
│   └── how-to-use.md / practical-how-to.md   Wiring guides (this document's repo twin)
├── examples/            Runnable walkthroughs
│   ├── 01-add-memory … 08-trust-ledger      The numbered learning path
│   ├── chat-memory, document-memory, …      Scenario deep-dives
│   └── markovian-handoff, world-model-sync, scout-grounded-recall
│                                            Cross-engine integration (the H-MEM side)
├── demos/               Visual markdown demos
│   ├── memory-lifecycle-visual/
│   ├── preview-first-sleep-cycle/
│   └── trust-ledger/
├── workshops/           Five-lab teaching track (record → mine → retrieve → dream/sleep → trust)
├── evals/tests/         Community evals: mining, retrieval, feedback, sleep, ledger categories
└── content/             Launch post, one-pager, comparison, demo script
```

Read order for a new implementer: `README.md` → `docs/architecture.md` → `docs/memory-record.md` → the numbered `examples/` in order → `workshops/`. The `examples/markovian-handoff`, `world-model-sync`, and `scout-grounded-recall` folders show H-MEM's side of each cross-engine pairing; their reciprocals live in the sibling engine repos: [Markovian Engine](https://github.com/meterless/meterless/tree/main/engines/markovian), [World Model](https://github.com/meterless/meterless/tree/main/engines/world-model), and [Scout Intent](https://github.com/meterless/meterless/tree/main/engines/scout-intent).

---

## License

Apache 2.0. Use it. Fork it. Ship it.
