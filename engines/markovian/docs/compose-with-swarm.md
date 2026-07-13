# Compose with Swarm

Markovian and Swarm solve different problems:

- **Swarm** coordinates *many* tasks in parallel through a governed DAG.
- **Markovian** runs *one* task across many bounded chunks.

The natural composition: **Markovian runs inside a Swarm task** when that task needs long-horizon reasoning.

## The picture

```
                    Swarm DAG
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   ┌─────────┐    ┌─────────┐    ┌─────────┐
   │ Task A  │    │ Task B  │    │ Task C  │
   │ short   │    │ short   │    │ LONG    │
   │ LLM call│    │ LLM call│    │ → runs  │
   └─────────┘    └─────────┘    │   inside│
                                  │   Markov│
                                  └─────────┘
        ▼              ▼              ▼
              merge & verify
```

Task A and B are short — single LLM calls. Task C needs a 20-step plan, so internally it spawns a Markovian chain. The swarm sees one task with one output; Markovian handles the bounded-context reasoning behind it.

## The delegation gate

Delegation is cost, not default. A swarm task delegates to Markovian only when it is genuinely long-horizon:

- `task.estimatedTokens > 4000` → Markovian; otherwise a single-shot LLM call.
- Mode by role: `task.role === "researcher" ? "RESEARCH" : "ARCHITECT"`.
- On empty/error output from the chain, fall back to single-shot and record a `markovianFallbackReason`.

## The handshake

Swarm passes its task input and signed Scout contract to Markovian via `runFromContract` — the contract is verified **once at run start** (signature, expiry, `markovian.chain` ∈ scope capabilities), never re-checked per chunk:

```ts
swarm.registerTaskKind("plan-migration", async ({ input, contract }) => {
  const run = await markovian.runFromContract(contract, {
    secret: SHARED_SECRET,
    goal: input.goal,
    // Reference chunk config on the contract path (tokensPerChunk is a 1:1
    // alias for the canonical chunkSize — see chunk-config.md):
    chunkConfig: { tokensPerChunk: 6000, carryoverTokens: 800 },
    stepFn: async ({ goal, carryover, step }) => {
      const out = await llm.complete(`${goal}\n${carryover}\nNext step:`);
      return { content: out, step: step + 1 };
    },
    stopWhen: ({ output }) => output.includes("[TASK_COMPLETE]"),
  });

  // One joined artifact back to the DAG; run id recorded for audit.
  return { plan: run.chunks.map((c) => c.content).join("\n\n"), runId: run.id };
});
```

Swarm gets one output back. Verification happens at the swarm boundary, not per-chunk. Telemetry records `{ kind: "markovian_delegated", taskId, markovianRunId, chunks }`. A run that needs more time than the contract allows calls `scout.replan({ parent })` for a fresh contract on the same `traceId` — TTLs are never extended in place.

## When *not* to do this

- The task is short and fits in one model call → use a plain LLM step inside the swarm task, skip Markovian.
- The work needs multiple specialists in parallel → use Swarm with multiple tasks, each potentially short.
- The work needs both — fan out across specialists, *and* each specialist needs long reasoning → use Swarm with multiple Markovian-backed tasks.

## H-MEM in the loop

A common shape:

```
Swarm task starts
  ↓
H-MEM recall (relevant memories injected into chunk-zero carryover)
  ↓
Markovian chain (20+ chunks)
  ↓
H-MEM mining (final output → new memories)
  ↓
Swarm task complete
```

The whole composition stays bounded: the memory query is constant, the Markovian chain is constant per chunk, the swarm task itself is one entry in a bounded DAG. No part grows unboundedly with the others.

## Approval gates

If the Scout contract requires per-chunk approval, both engines respect it:

- Swarm checks the contract before invoking the task
- Markovian checks the same contract before each chunk
- Approval prompts surface in the streaming UI

A misrouted contract or expired contract gets refused at either boundary.

## What's next

- [Run history](./run-history.md) — Markovian's history inside a swarm task
- [Streaming UI](./streaming-ui.md) — surfacing per-chunk progress to swarm telemetry
