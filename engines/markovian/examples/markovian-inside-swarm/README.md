# Markovian inside Swarm

> **Marker note:** this walkthrough uses the XML alternate (`<CARRYOVER>`, `<DONE>`) of the canonical bracket protocol (`[STATE_CHECKPOINT]` / `[TASK_COMPLETE]`). See [docs/marker-protocol.md](../../docs/marker-protocol.md) for the 1:1 mapping.

An agent orchestration task that runs a Markovian chain for its long-horizon reasoning. Swarm sees one task, and Markovian handles the chunking inside it. The two governance layers nest without overlap.

> This is the same integration as the `swarm-with-markovian` example planned for the swarm orchestration spec, seen from the Markovian side. The swarm-orchestration and runtime specs are next on the [roadmap](../../../../ROADMAP.md).

Prerequisite reading: [`docs/compose-with-swarm.md`](../../docs/compose-with-swarm.md), [`long-research-chain`](../long-research-chain/README.md).

---

## The boundary

```text
DAG level     planner ─▶ [architect task] ─▶ merge ─▶ verify
                              │  estimatedTokens > 4000
                              ▼
Task level             Markovian: chunk 1 → 2 → … → joined output
                              │
                              ▼
                       ONE artifact handed back to the scheduler
```

The scheduler governs *tasks* (readiness, concurrency, retries). Markovian governs *context within a task* (bounded chunks). Neither reaches into the other.

## Walkthrough: `index.ts`

```ts
import { Markovian } from "@meterless/markovian";

const markovian = new Markovian({
  chunkConfig: { chunkSize: 8000, carryoverTokens: 1200 },
});

// The ONLY place the two engines touch: inside a Swarm TaskRunner.
async function execute(task /*: SwarmTask */) {
  if (task.estimatedTokens > 4000) {
    const run = await markovian.run({
      goal: task.prompt,
      mode: task.role === "researcher" ? "RESEARCH" : "ARCHITECT",
      memoryContext: task.run.settings.memoryContext,   // H-MEM context, if any
      stepFn: defaultStepFn,
      stopWhen: ({ output }) => output.includes("<DONE>"),
    });

    // Contract: return ONE joined artifact; record the Markovian run id for audit.
    task.telemetry.emit("markovian_delegated", {
      taskId: task.id, markovianRunId: run.id, chunks: run.chunks.length,
    });
    return run.chunks.map((c) => c.content).join("\n\n");
  }

  return await yourLLM(task.prompt);   // small task → one shot, no Markovian
}
```

## Run it

```bash
# No npm package is published. This repo is an implementation spec.
# Point the import at your implementation of the engine contract (see ../../AGENTS.md), then:
npx tsx ./index.ts
```

## Expected behavior

```text
swarm DAG:  planner → architect_task → merge → verify
architect_task.estimatedTokens = 12,000  (> 4000) → delegate to Markovian
  markovian: 6 chunks, bounded carryover, <DONE> at chunk 6
  → returns ONE artifact to the scheduler
swarm telemetry: { kind: "markovian_delegated", taskId: "architect_task",
                   markovianRunId: "mk_91", chunks: 6 }
DAG view: architect_task = 1 task, 1 attempt, 1 artifact  (chunking invisible to the DAG)
```

## Contract at both boundaries

| Boundary | Contract |
| --- | --- |
| Swarm → Markovian | task prompt in; bounded chunks run internally |
| Markovian → Swarm | one joined artifact out; `markovianRunId` in telemetry |
| Audit | the Swarm run telemetry links to the inner Markovian run id for end-to-end reconstruction |

A small task (`≤ 4000` tokens) skips Markovian entirely. Delegation has a cost, so it only happens where the task is large enough to need it.

---

## Why it matters

- **The scheduler stays simple.** It never reasons about token windows; it governs tasks. Pushing bounded-context concerns down into the task keeps the DAG layer small and correct. Markovian pushes history concerns down into carryover for the same reason.
- **One artifact, one contract.** Markovian's N chunks become a single task artifact before merge/verify/resume ever see it. The orchestrator needs no special cases.
- **Two nested governances, both auditable.** Swarm bounds how many agents run and how they connect. Markovian bounds how much context one agent reasons over at once. The `markovianRunId` link stitches the two audit trails into one.

## Next

- [`markovian-with-hmem`](../markovian-with-hmem/README.md): the memory composition seam.
- Swarm side of this integration: the `swarm-with-markovian` example, planned for the swarm orchestration spec. That spec and the runtime spec are next on the [roadmap](../../../../ROADMAP.md).
