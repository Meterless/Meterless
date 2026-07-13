# Architecture

Markovian is a small set of well-defined parts that together produce one property: **per-step token cost is flat in step count**.

This document is the map. Each piece has its own doc going deeper.

## The shape

```
goal ──▶ chunk manager ──▶ ┌──────── chunk N ────────┐
                           │                          │
            carryover_N ──▶│  prompt assembly         │
                           │  └─ goal                 │
                           │  └─ task framing         │
                           │  └─ compressed carryover │
                           │  └─ current step input   │
                           │                          │
                           │  model call              │
                           │                          │
                           │  marker parser           │
                           │  └─ [STATE_CHECKPOINT]   │
                           │  └─ [TASK_COMPLETE]      │
                           │  └─ [NEEDS_TOOL] pauses  │
                           │                          │
                           │  compression cascade     │
                           │  └─ produce carryover_N+1│
                           └─────────┬────────────────┘
                                     ▼
                              run history record
                                     ▼
                              (next chunk or done)
```

Four pieces:

1. **Chunk manager** — schedules chunks, enforces budgets, decides when to stop
2. **Marker parser** — reads structured signals from model output
3. **Compression cascade** — produces the next chunk's carryover from this chunk's state
4. **Run history** — stores per-step records for replay and inspection

## The invariant

Per-step token cost = `goal_tokens + framing_tokens + carryover_tokens + step_input_tokens`.

All four are **bounded constants** in the chunk config. None of them grow with step count. That's the whole engine.

The alternative — append-history naive baseline — has `step_input_tokens = sum of all prior outputs`. That grows linearly. The total run cost grows quadratically. Markovian replaces the growing term with a compressed constant-size carryover.

The math is in [`efficiency-model.md`](./efficiency-model.md).

## Quickstart

The reference API below is the contract your implementation satisfies — this repo is a spec, not a published npm package.

```ts
import { Markovian } from "@meterless/markovian"; // your implementation of the contract

const markovian = new Markovian({
  chunkConfig: {
    chunkSize: 8000,
    carryoverTokens: 800,
    maxChunks: 24,
  },
});

const run = await markovian.run({
  goal: "Plan a 6-month migration of our analytics warehouse to Iceberg",
  stepFn: async ({ goal, carryover, step }) => {
    const prompt = `${goal}\n\nProgress so far:\n${carryover}\n\nNext step (${step + 1}):`;
    const output = await llm.complete(prompt);
    return { content: output, step: step + 1 };
  },
  stopWhen: ({ output }) => output.includes("[TASK_COMPLETE]"),
});

console.log("Chunks:", run.chunks.length);
console.log("Tokens in:", run.stats.totalTokensIn);
console.log("Efficiency vs naive:", run.stats.efficiency, "%");
```

## What's next

- [Chunk config](./chunk-config.md) — sizing the budget pieces
- [Marker protocol](./marker-protocol.md) — the structured signals
- [Compression cascade](./compression-cascade.md) — what makes it into the next carryover
- [Run history](./run-history.md) — per-step records
- [Telemetry](./telemetry.md) — what gets measured
- [Engine tab](./engine-tab.md) — the performance-reporting surface
- [Efficiency model](./efficiency-model.md) — the math
- [Streaming UI](./streaming-ui.md) — per-chunk progress
- [Reflection](./reflection.md) — optional self-review
- [Compose with Swarm](./compose-with-swarm.md) — Markovian inside swarm tasks
