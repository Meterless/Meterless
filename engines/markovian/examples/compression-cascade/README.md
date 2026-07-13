# 04 — Compression cascade

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

> **Marker note:** this walkthrough uses the XML alternate (`<CARRYOVER>`, `<DONE>`) of the canonical bracket protocol (`[STATE_CHECKPOINT]` / `[TASK_COMPLETE]`) — see [docs/marker-protocol.md](../../docs/marker-protocol.md) for the 1:1 mapping.

When a chunk does not emit a clean `<CARRYOVER>` — or emits one too big — the engine does not give up and it does not blow the budget. It runs a **four-strategy cascade**, each falling through to the next on failure. This example makes the cascade visible.

Prerequisite reading: [`docs/compression-cascade.md`](../../docs/compression-cascade.md), [`docs/marker-protocol.md`](../../docs/marker-protocol.md).

---

## The cascade (strict order)

```text
1. Explicit marker override   parse <CARRYOVER>; accept iff ≥ 24 chars
2. Model-based compression    ask the compressor for 3–5 critical points
3. Heuristic extraction       regex key phrases (Therefore / Decision / Status / Next)
4. Absolute fallback          tail-truncate to carryoverTokens
```

Each strategy only runs if the previous one failed. The run is **never** unbounded and **never** crashes on a bad chunk.

---

## Walkthrough — `index.ts`

```ts
import { Markovian } from "@meterless/markovian";

const markovian = new Markovian({
  chunkConfig: { chunkSize: 5000, carryoverTokens: 600 },
  compressor: async (prompt) =>
    yourLLM(prompt + "\n\nReturn 3-5 critical points. Terse. No prose."),
});

const run = await markovian.run({
  goal: "Design a data-ingestion service, step by step.",
  stepFn: myStepFn,    // sometimes emits a marker, sometimes forgets, sometimes over-emits
  stopWhen: ({ output }) => output.includes("<DONE>"),
});

for (const c of run.chunks) {
  console.log(`step ${c.step}: cascade=${c.cascadeStrategyUsed} (${c.carryoverOut.length} chars)`);
}
```

## Run it

```bash
# No npm package is published — this repo is an implementation spec.
# Point the import at your implementation of the engine contract (see ../../AGENTS.md), then:
npx tsx ./index.ts
```

## Expected output (illustrative)

```text
step 1: cascade=marker            (480 chars)   ← model emitted a clean <CARRYOVER>
step 2: cascade=marker            (520 chars)
step 3: cascade=model-compression (430 chars)   ← no marker → compressor produced one
step 4: cascade=heuristic         (390 chars)   ← compressor errored → regex extraction
step 5: cascade=marker,DONE       (210 chars)
```

## Diff the carryover between two steps

```ts
import { diffCarryover } from "@meterless/markovian";

console.log(diffCarryover(run.chunks[2].carryoverOut, run.chunks[3].carryoverOut));
// + OPEN_QUESTION resolved: catalog provider → Glue
// + DECISION added: batch size 10k rows
// - stale NEXT_STEP line dropped
```

You can see *what state crossed the boundary* — decisions added, questions resolved, stale lines dropped — which is exactly what a healthy chain should show.

## A custom cascade for code-heavy tasks

```ts
new Markovian({
  chunkConfig: { chunkSize: 8000, carryoverTokens: 1200 },
  cascade: {
    // Preserve function signatures + file paths verbatim; compress prose.
    heuristicPhrases: ["function ", "class ", "export ", "FILE:", "DECISION:"],
  },
});
```

---

## Why it matters

- **A missing marker is not a failure.** Strategy 2 (model compression) catches the common "model forgot the marker" case automatically. The chain keeps its O(1) property even when the model is sloppy.
- **The cascade is robust under model/API instability.** If the compressor call itself errors, strategy 2 falls to the deterministic regex extractor (strategy 3), then to a hard tail-truncate (strategy 4). There is always a bounded carryover — the run cannot wedge.
- **The model knows the task better than the generic compressor.** That is why strategy 1 (the model's own `<CARRYOVER>`) is preferred. The cascade is a safety net, not the primary path — encouraging good markers ([`03`](../marker-protocol/README.md)) still wins.
- **Cascade choice is on the record.** `chunk.cascadeStrategyUsed` tells you per step whether the marker held or a fallback fired — a quiet drift toward `heuristic` means the framing needs work.

## Next

- [`06 — run-history-and-stats`](../run-history-and-stats/README.md) — every cascade decision is in the per-chunk record.
- [`02 — custom-chunk-config`](../custom-chunk-config/README.md) — sizing the budget the cascade compresses into.
