# 05 — Streaming progress

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

> **Marker note:** this walkthrough uses the XML alternate (`<CARRYOVER>`, `<DONE>`) of the canonical bracket protocol (`[STATE_CHECKPOINT]` / `[TASK_COMPLETE]`) — see [docs/marker-protocol.md](../../docs/marker-protocol.md) for the 1:1 mapping.

A long chain is a poor experience if the user stares at a blank screen for 40 steps. This example subscribes to per-chunk events and renders live progress — the human-in-the-loop surface for Markovian.

Prerequisite reading: [`docs/streaming-ui.md`](../../docs/streaming-ui.md).

---

## Scenario

A 12-step migration plan. The user should see, in real time: which step is running, the `<PROGRESS>` line the model emitted, and a token-budget gauge.

---

## Walkthrough — `index.ts`

```ts
import { Markovian } from "@meterless/markovian";

const markovian = new Markovian({
  chunkConfig: { chunkSize: 6000, carryoverTokens: 800 },
});

const runPromise = markovian.run({
  goal: "Plan a 12-step warehouse migration to Iceberg.",
  stepFn: myStepFn,
  stopWhen: ({ output }) => output.includes("<DONE>"),
});

// Subscribe to live events. Throttle to ~300ms to avoid render thrash.
markovian.on("chunk.start",    (e) => render(e.step, "running", e.tokensUsed));
markovian.on("chunk.progress", (e) => render(e.step, e.progressMarker, e.tokensUsed));
markovian.on("chunk.complete", (e) => render(e.step, "done", e.tokensUsed));
markovian.on("run.complete",   ()  => console.log("\n✓ migration plan ready"));

function render(step: number, status: string, used: number) {
  const bar = "█".repeat(Math.round((used / 72_000) * 20)).padEnd(20, "·");
  process.stdout.write(`\rstep ${step}/12  ${status.slice(0, 40).padEnd(40)}  [${bar}] ${used} tok`);
}

const run = await runPromise;
```

## Run it

```bash
# No npm package is published — this repo is an implementation spec.
# Point the import at your implementation of the engine contract (see ../../AGENTS.md), then:
npx tsx ./index.ts
```

## Expected terminal output (illustrative; animated, one line)

```text
step 4/12  Selected Iceberg; drafting phase 2          [██████··············] 23,400 tok
...
step 12/12 done                                        [████████████████····] 71,800 tok
✓ migration plan ready
```

## Event reference

| Event | Fires | Carries |
| --- | --- | --- |
| `chunk.start` | before a step's model call | `step`, `tokensUsed` so far |
| `chunk.progress` | when the step emits `<PROGRESS>` | `progressMarker`, `tokensUsed` |
| `chunk.complete` | after carryover is extracted | `step`, `carryoverOut`, `tokensUsed` |
| `run.complete` | chain hit `<DONE>` or `maxChunks` | final `stats` |

## UX rules from the doc

- **Throttle subscriptions to ~300ms.** A fast model fires deltas faster than a terminal (or React) can paint. Unthrottled = flicker.
- **Fixed-height container for the live region.** The active step's text grows as it streams; a fixed box prevents layout shift.
- **Strip markers before display.** `<CARRYOVER>`/`<DONE>` are engine data, never user-visible. The events already hand you cleaned text.

---

## Why it matters

- **The token gauge is the pitch, live.** Watching `tokensUsed` climb *linearly* (not quadratically) across 12 steps is the flat-cost property you can see, not just claim — the bar would be pinned at step 5 under a naive baseline.
- **`<PROGRESS>` is for humans; `<CARRYOVER>` is for the engine.** They are different markers on purpose. Progress is a disposable status line; carryover is load-bearing state. Surfacing the right one keeps the UI honest.
- **Long runs become supervisable.** A 200-step run is only acceptable if a human can watch it advance and abort a wrong turn. Streaming events are what make long-horizon work operable, not just possible.

## Next

- [`06 — run-history-and-stats`](../run-history-and-stats/README.md) — the same data, after the run, for replay and analysis.
- [`07 — reflection-pass`](../reflection-pass/README.md) — the optional self-review step at the end.
