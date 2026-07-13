# Run history

Every Markovian run produces a structured history. It's how you debug a run, replay a chain, and prove what happened.

## The shape

```ts
type Run = {
  id: string;                    // canonical: run.id (not runId)
  goal: string;
  chunkConfig: ChunkConfig;      // MANDATORY per-run snapshot — efficiency is
                                 // always recomputed against the run's own config
  chunks: ChunkRecord[];
  stats: RunStats;
  startedAt: ISODate;
  endedAt: ISODate;
  status: "completed" | "max-chunks" | "errored" | "aborted"
        | "paused" /* transient: awaiting tool result, clarification, or approval */;
};

type ChunkRecord = {
  chunkId: string;
  step: number;
  promptTokensIn: number;
  outputTokensOut: number;
  latencyMs: number;
  prompt: string;        // full assembled prompt
  output: string;        // raw model output
  markers: MarkerSet;    // parsed markers
  carryoverIn: string;   // what this chunk received
  carryoverOut: string;  // what it produced for the next chunk
  toolCalls?: ToolCall[];
  errors?: ErrorRecord[];
};
```

## What gets stored

Everything needed to reconstruct the run:

- Full prompt and full output, per chunk
- Both carryovers (in and out), so you can diff them
- Parsed markers (STATE_CHECKPOINT, TASK_COMPLETE, NEEDS_TOOL, NEEDS_CLARIFICATION — or their XML alternates)
- Token counts on both sides (provider-reported usage when available; `chars/4` estimate labeled as such otherwise)
- Latency per chunk
- Tool calls if any
- Errors and warnings

## Storage

By default runs are stored in local storage (IndexedDB in browser, filesystem in Node). The reference store is `markovian_history`, indexed by `startedAt`, `chatId`, and `status`, with a cumulative-stats snapshot under `markovian_cumulative_stats` (efficiency history capped at 200 entries). Configurable:

```ts
const markovian = new Markovian({
  storage: "local",        // local-first default
  // or "memory" for tests
  // or { kind: "custom", driver: yourDriver }
});
```

## Inspecting a run

```ts
const run = await markovian.history.get(runId);

console.log("Status:", run.status);
console.log("Chunks:", run.chunks.length);
console.log("Total tokens in:", run.stats.totalTokensIn);
console.log("Efficiency:", run.stats.efficiency, "%");

// Drill into one chunk
const c4 = run.chunks[3];
console.log("Step 4 carryover diff:");
console.log("  in:", c4.carryoverIn);
console.log("  out:", c4.carryoverOut);
```

## Replay

A run can be replayed deterministically given the same model and the same temperature 0 setting:

```ts
const replay = await markovian.replay(runId);
```

Replay runs each chunk fresh with the same prompts. Useful for debugging — you can change the compression cascade or marker parser and see how the same run would have gone.

For pure inspection without re-running, the stored history is enough on its own.

## Diffs

The most useful operation on history is **diffing two carryovers** — usually consecutive ones, sometimes the same step across two runs.

```ts
const diff = markovian.diff(run.chunks[3].carryoverIn, run.chunks[3].carryoverOut);
// → { added: [...], removed: [...], retained: [...] }
```

Added items mean the chunk learned something. Removed items mean compression dropped something — sometimes correctly, sometimes not. Retained items are the steady backbone of the run.

## Privacy

By default, run history stays local. Switching to a centralized backend requires explicit opt-in.

You can configure **per-field redaction** — e.g., store metadata but not full prompt content for sensitive runs:

```ts
const markovian = new Markovian({
  storage: { redact: ["prompt", "output"], retain: ["markers", "stats"] },
});
```

The marker set is usually sufficient for debugging without the raw content.

## Retention

Configurable per-namespace. Defaults: 30 days of full history, then compress to markers + stats for another 90 days, then drop.

```ts
const markovian = new Markovian({
  retention: {
    full: "30d",
    summary: "90d",
    drop: "120d",
  },
});
```

## What's next

- [Telemetry](./telemetry.md) — aggregate counters from history
- [Reflection](./reflection.md) — using history to drive self-review
- [Streaming UI](./streaming-ui.md) — surfacing history as it happens
