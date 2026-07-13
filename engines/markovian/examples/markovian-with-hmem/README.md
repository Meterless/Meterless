# Markovian with H-MEM

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

> **Marker note:** this walkthrough uses the XML alternate (`<CARRYOVER>`, `<DONE>`) of the canonical bracket protocol (`[STATE_CHECKPOINT]` / `[TASK_COMPLETE]`) — see [docs/marker-protocol.md](../../docs/marker-protocol.md) for the 1:1 mapping.

[H-MEM](https://github.com/meterless/meterless/tree/main/engines/hmem) feeds **chunk zero** with relevant prior memories; the final run output is mined **back** into memory. The loop closes: today's long run informs next week's.

> Memory enters at step 1 only. After that, bounded carryover maintains continuity — H-MEM is not re-queried every chunk.

Prerequisite reading: [`docs/architecture.md`](../../docs/architecture.md), and the `01-add-memory` example in the [H-MEM repo](https://github.com/meterless/meterless/tree/main/engines/hmem).

---

## The contract (from the how-to §13)

```text
hmem.query  ─▶ formatReinjection ─▶ memoryContext ─▶ Markovian chunk 0 ONLY
                                                          │
                                                          ▼
                                          run completes → hmem.ingest("plan_completion")
```

Heavy context enters once; the compressed carryover carries continuity forward. The completed run becomes a new memory for future runs.

## Walkthrough — `index.ts`

```ts
import { Markovian } from "@meterless/markovian";
import { HMEM } from "@meterless/hmem";

const hmem = new HMEM({ storage: "local", namespace: "agent-cleo" });
const markovian = new Markovian({ chunkConfig: { chunkSize: 6000, carryoverTokens: 900 } });

const userPrompt = "Plan the Q3 analytics-warehouse migration.";

// 1. Pull relevant memory BEFORE the run (past decisions, constraints, prefs).
const { memories } = await hmem.query({ text: userPrompt, topN: 5 });
const memoryContext = formatReinjection(memories);
// → "[infra] (long_term) Team standardized on AWS Glue catalog. {entities: Glue}\n..."

// 2. Inject it into chunk ZERO only via memoryContext.
const run = await markovian.run({
  goal: userPrompt,
  memoryContext,                     // engine prepends this to step 1's prompt only
  stepFn: myStepFn,
  stopWhen: ({ output }) => output.includes("<DONE>"),
});

// 3. Mine the completed run back into H-MEM as a durable memory.
await hmem.ingest({
  eventType: "plan_completion",
  source: `markovian:${run.id}`,
  content: run.chunks.map((c) => c.content).join("\n\n"),
});

console.log(run.output);
```

## Run it

```bash
# No npm package is published — this repo is an implementation spec.
# Point the imports at your implementations of the engine contracts (see ../../AGENTS.md), then:
npx tsx ./index.ts
```

## Expected behavior

```text
hmem.query → 5 memories (incl. "Team standardized on AWS Glue catalog")
chunk 0 prompt includes that memory → the plan picks Glue WITHOUT re-deciding it
chunks 1..N → bounded carryover only (memory NOT re-injected)
run completes → hmem.ingest stores the plan as a plan_completion memory
next week: a new migration run's hmem.query surfaces THIS plan as prior context
```

## The closing loop

| Phase | Engine | Effect |
| --- | --- | --- |
| Before | H-MEM `query` | retrieves the Glue-catalog decision from a past run |
| Chunk 0 | Markovian | the plan inherits that decision instead of re-litigating it |
| Chunks 1..N | Markovian | carryover only — flat cost preserved |
| After | H-MEM `ingest` | this plan becomes memory for the next planning run |

---

## Why it matters

- **Memory belongs in chunk zero, nowhere else.** Re-injecting H-MEM every chunk would defeat the O(1) property — the prompt would grow with retrieved memory each step. The contract (`memoryContext` → step 1 only) is what keeps Markovian flat *and* memory-aware.
- **The two engines have complementary jobs.** H-MEM decides *what past knowledge is relevant*; Markovian decides *how to reason through a long task without re-paying for it*. Neither does the other's job.
- **The loop is the point.** A plan that ignores last quarter's decisions repeats them. `ingest("plan_completion")` is what makes the agent's long-horizon work cumulative instead of amnesiac.

## Next

- The `markovian-handoff` example in the [H-MEM repo](https://github.com/meterless/meterless/tree/main/engines/hmem) — the reciprocal: the same loop from inside H-MEM.
- [`markovian-inside-swarm`](../markovian-inside-swarm/README.md) — the other composition seam.
- H-MEM's reinjection model: [H-MEM](https://github.com/meterless/meterless/tree/main/engines/hmem).
