# How to Use H-MEM

A practical walkthrough for building and operating an H-MEM instance.

## 1. Bootstrap services

```ts
const ledger = new TrustLedgerService({ db });
const store = new MemoryStoreService({ db, ledger });
const retrieval = new MemoryRetrievalService({ store, embedder });
const mining = new MemoryMiningService({ store, generator });
const dreaming = new DreamingService({ store, generator });
const sleep = new SleepCycleService({ store, ledger });
const conflicts = new ConflictDetectionService({ store, ledger });

await store.hydrate();
```

## 2. Define the record

Use the canonical record in [`memory-record.md`](memory-record.md). Keep the same logical shape in TypeScript, Python, Rust, or any other stack.

## 3. Wire tiered storage

Hydrate long-term and working memory from durable stores. Add short-term session memory. Dedupe by ID, backfill missing embeddings, and apply decay to non-long-term records.

## 4. Mine from interactions

```ts
await mining.ingest({
  eventType: "user_correction",
  source: "session:abc123",
  content: "No, the deadline is March 14, not March 4."
});
```

Use no-model fallback when extraction fails.

## 5. Mine from documents

```ts
await mining.ingestDocument({
  path: "/docs/onboarding-policy.md",
  content: fileContents,
  maxTokens: 8000
});
```

Tag mined memories with document provenance.

## 6. Retrieve and reinject

```ts
const result = await retrieval.query({
  text: userMessage,
  topN: 5,
  threshold: 0.35,
  strategy: "comprehensive"
});

const memoryContext = formatReinjection(result.memories);
const prompt = `${memoryContext}\n\nUser: ${userMessage}`;
```

Persist the trace for UI inspection.

## 7. Capture feedback

```ts
await ledger.recordFeedback({
  memoryId: "mem_abc",
  signal: "helpful",
  traceId: "trace_xyz",
  actor: "user:42"
});
```

## 8. Run dreaming

Run daily or weekly. Present proposals to a human. Materialize only approved proposals.

## 9. Run sleep

Generate preview first, execute second, and always create a backup.

## 10. Resolve conflicts

Run conflict scans daily. Auto-resolve only at decision confidence ≥0.70 and queue the rest for human review.
