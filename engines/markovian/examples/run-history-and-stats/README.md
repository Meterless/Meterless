# 06 — Run history and stats

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

Every Markovian run produces a structured, replayable record: per-step content, tokens, latency, emitted markers, and cascade decisions. This example loads a finished run and analyzes it after the fact.

Prerequisite reading: [`docs/run-history.md`](../../docs/run-history.md), [`docs/efficiency-model.md`](../../docs/efficiency-model.md).

---

## Scenario

A migration-planning run completed yesterday with id `run_8f3a`. We want to: load it, inspect per-chunk records, recompute efficiency, and diff the carryover between two steps to see what state actually crossed a boundary.

---

## Walkthrough — `index.ts`

```ts
import { Markovian, diffCarryover } from "@meterless/markovian";

const markovian = new Markovian({ history: yourHistoryStore });

// 1. Load a stored run by id.
const run = await markovian.history.get("run_8f3a");

// 2. Per-chunk records.
for (const c of run.chunks) {
  console.log(
    `step ${c.step}: ${c.tokensIn} in / ${c.tokensOut} out · ` +
    `${c.latencyMs}ms · markers=[${c.markersEmitted}] · cascade=${c.cascadeStrategyUsed}`,
  );
}

// 3. Efficiency from stats (vs the naive append-history baseline).
const { totalTokensIn, naiveTokensIn, efficiency } = run.stats;
console.log(`Markovian: ${totalTokensIn}  ·  Naive: ${naiveTokensIn}  ·  ${efficiency}% saved`);

// 4. Diff carryover between any two steps.
console.log(diffCarryover(run.chunks[3].carryoverOut, run.chunks[7].carryoverOut));

// 5. Cumulative stats across all runs.
const agg = await markovian.history.cumulative();
console.log(`${agg.totalRuns} runs · avg efficiency ${agg.averageEfficiency}%`);
```

## Run it

```bash
# No npm package is published — this repo is an implementation spec.
# Point the import at your implementation of the engine contract (see ../../AGENTS.md), then:
npx tsx ./index.ts
```

## Expected output (illustrative — modeled numbers, not a recorded run)

```text
step 1: 900 in / 1180 out · 2100ms · markers=[CARRYOVER,PROGRESS] · cascade=marker
step 2: 1700 in / 1240 out · 2400ms · markers=[CARRYOVER] · cascade=marker
...
step 12: 1700 in / 640 out · 1800ms · markers=[CARRYOVER,DONE] · cascade=marker
Markovian: 21,400  ·  Naive: 96,200  ·  78% saved
+ DECISION added: catalog provider = Glue
+ OPEN_QUESTION resolved: backfill strategy
- stale NEXT_STEP dropped
14 runs · avg efficiency 81%
```

## What the record gives you

| Capability | Use |
| --- | --- |
| `history.get(id)` | Replay a run exactly — it is a JSON load, not a re-execution |
| per-chunk `tokensIn/Out`, `latencyMs` | find the slow/expensive step |
| `markersEmitted`, `cascadeStrategyUsed` | spot a chain drifting toward fallback compression |
| `diffCarryover(a, b)` | prove which decisions/questions crossed between any two steps |
| `history.cumulative()` | the efficiency trend across every run (the "Engine tab" data) |

## Note on efficiency fidelity

Every run record carries its own `chunkConfig` snapshot — this is **mandatory** — and `run.stats.efficiency` is always recomputed against that snapshot, never the current live config. Recomputing against current config produces dishonest numbers the moment anyone changes a slider. See [`docs/efficiency-model.md`](../../docs/efficiency-model.md) and [`docs/run-history.md`](../../docs/run-history.md).

---

## Why it matters

- **A run is data, not a transcript.** Because every step is a structured record, replay is a `history.get()` away — you can audit a decision made 40 steps ago without re-running the model.
- **Drift is detectable after the fact.** A chain whose `cascadeStrategyUsed` slid from `marker` → `heuristic` over its life had weak framing. The history is where you catch that and fix it for next time.
- **Efficiency is measured, not asserted.** `naiveTokensIn` vs `totalTokensIn` in the record is the receipt for the flat-cost claim — per run, and aggregated across all runs.

## Next

- [`token-savings-demo`](../token-savings-demo/README.md) — the same numbers, computed live, side-by-side with the naive baseline.
- [`07 — reflection-pass`](../reflection-pass/README.md) — the optional synthesis step recorded at the end of a run.
