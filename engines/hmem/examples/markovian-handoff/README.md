# Markovian handoff

> Cross-engine example: it runs once the sibling engine reference implementation lands; until then treat the code as a reference sketch of the contract.

H-MEM is the memory a long [Markovian](https://github.com/meterless/meterless/tree/main/engines/markovian) run starts from and writes back to. This example is the **H-MEM side** of the loop: what `query` serves into chunk zero, and what `ingest` absorbs when the run completes.

> The reciprocal example, `markovian-with-hmem`, lives in the [Markovian Engine repo](https://github.com/meterless/meterless/tree/main/engines/markovian) — it focuses on the chunked run; this one focuses on the memory contract feeding and closing it.

Prerequisite reading: [`04-retrieve-and-reinject`](../04-retrieve-and-reinject/README.md), [`docs/reinjection.md`](../../docs/reinjection.md).

---

## The loop, from memory's side

```text
hmem.query  ──serves──▶  memoryContext  ──▶  Markovian chunk 0 (once, never re-queried)
                                                     │
                                                     ▼  run completes
hmem.ingest("plan_completion")  ◀──absorbs──  joined chunk content
```

H-MEM does two things and nothing else here: **retrieve** the relevant prior decisions before the run, and **mine** the finished run back as a durable memory.

## Walkthrough (illustrative reference API)

The code below is a reference sketch of the contract, not a runnable package — this repo is the implementation spec, and no `@meterless/*` npm packages are published.

```ts
import { HMEM } from "@meterless/hmem";
import { Markovian } from "@meterless/markovian";

const hmem = new HMEM({ storage: "local", namespace: "agent-cleo" });

const prompt = "Plan the Q3 analytics-warehouse migration.";

// 1. Memory's job #1: retrieve what past runs already decided.
const { memories } = await hmem.query({ text: prompt, topN: 5 });
// → [ "[infra] (long_term) Team standardized on AWS Glue catalog. {entities: Glue}", ... ]

const markovian = new Markovian({ chunkConfig: { chunkSize: 6000, carryoverTokens: 900 } });
const run = await markovian.run({
  goal: prompt,
  memoryContext: formatReinjection(memories),   // enters chunk 0 ONLY
  skipSemanticMemoryAugmentation: true,         // lower layers must NOT retrieve a second time
  stepFn: myStepFn,
  stopWhen: ({ output }) => output.includes("[TASK_COMPLETE]"),
});

// 2. Memory's job #2: absorb the completed run as a new durable memory.
await hmem.ingest({
  eventType: "plan_completion",
  source: `markovian:${run.id}`,
  content: run.chunks.map((c) => c.content).join("\n\n"),
});

// Prove the loop closed: the new memory is now retrievable.
const next = await hmem.query({ text: "warehouse migration plan", topN: 1 });
console.log(next.memories[0].source);   // → "markovian:<runId>"
```

## Expected behavior (illustrative)

```text
hmem.query  → 5 memories (incl. the Glue-catalog decision from a prior run)
markovian   → plan inherits Glue WITHOUT re-deciding it (memory in chunk 0)
hmem.ingest → run stored as a plan_completion memory, source=markovian:<runId>
hmem.query  → next migration question now surfaces THIS plan as prior context
```

## What `ingest("plan_completion")` actually does

| Step | H-MEM behavior |
| --- | --- |
| receive run content | classified as a `plan_completion` event |
| mine | extract durable facts/decisions, not the raw transcript |
| enrich | domain, entities, `source: markovian:<runId>` provenance |
| store | written to the working tier, audited in the trust ledger |
| later | eligible for retrieval, dreaming, and sleep like any memory |

The completed Markovian run does not get dumped verbatim — it is *mined* the same way a chat or document is (see [`02-mine-from-chat`](../02-mine-from-chat/README.md)).

---

## Why it matters

- **H-MEM is the only thing that makes long runs cumulative.** Markovian gives flat per-step cost; H-MEM is what stops the *next* run from re-deciding what this one already settled. Without the `ingest` step, every migration plan starts from zero.
- **Retrieval feeds chunk zero, not every chunk.** H-MEM serves context once. Re-injecting per chunk would defeat Markovian's O(1) property — the memory contract respects the engine boundary on purpose. That is also why `skipSemanticMemoryAugmentation: true` is passed down: a chunked generator whose lower layer also auto-augments prompts with memory would retrieve twice.
- **The handoff is provenanced both ways.** What entered the run is a `query` trace; what left it is a `plan_completion` memory tagged `markovian:<runId>`. The full round trip is auditable from the ledger.

## Next

- `markovian-with-hmem` in the [Markovian Engine repo](https://github.com/meterless/meterless/tree/main/engines/markovian) — the reciprocal: the same loop from inside Markovian.
- [`world-model-sync`](../world-model-sync/README.md) — the other "memory absorbs an external engine" pattern.
- [`02-mine-from-chat`](../02-mine-from-chat/README.md) — how `ingest` mines durable memory from raw content.
