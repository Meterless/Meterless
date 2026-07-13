# Token savings demo

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

The whole pitch of this engine is "flat cost, not linear." This example proves it with numbers: the **same task content**, assembled two ways — Markovian bounded carryover vs a naive history-growing baseline — printed step by step.

Prerequisite reading: [`docs/efficiency-model.md`](../../docs/efficiency-model.md). Visual version: [`../../token-economics-demo`](../../token-economics-demo/README.md).

---

## Scenario

Hold the per-step *content* identical across both runs. Vary only how the prompt is assembled:

- **Naive:** every step's prompt = framing + goal + all prior outputs + this step.
- **Markovian:** every step's prompt = framing + goal + bounded carryover + this step.

If content is constant, every token difference is attributable to prompt assembly — the cleanest possible demonstration.

---

## Walkthrough — `index.ts`

```ts
import { Markovian, estimateNaiveBaseline } from "@meterless/markovian";

const STEPS = 20;
const fixedStepOutputs = loadCannedOutputs(STEPS);   // identical content for both runs

// 1. Markovian: bounded carryover.
const markovian = new Markovian({
  chunkConfig: { chunkSize: 6000, carryoverTokens: 800, framingTokens: 400 },
});
const run = await markovian.run({
  goal: "Plan a 20-step data-platform rollout.",
  stepFn: async ({ step }) => ({ content: fixedStepOutputs[step], step: step + 1 }),
  stopWhen: ({ step }) => step >= STEPS,
});

// 2. Naive baseline: replay the SAME outputs with append-history assembly.
const naive = estimateNaiveBaseline({
  outputs: fixedStepOutputs,
  framingTokens: 400, goalTokens: 200, stepInputTokens: 300,
});

// 3. Side by side.
console.log("step |   naive in |  markovian in | running saved");
let saved = 0;
for (let i = 0; i < STEPS; i++) {
  saved += naive.perStep[i] - run.chunks[i].tokensIn;
  console.log(
    `${String(i + 1).padStart(4)} | ${String(naive.perStep[i]).padStart(10)} | ` +
    `${String(run.chunks[i].tokensIn).padStart(13)} | ${saved.toLocaleString().padStart(10)}`,
  );
}
console.log(`\nNaive total: ${naive.total}  ·  Markovian total: ${run.stats.totalTokensIn}`);
console.log(`Efficiency: ${run.stats.efficiency}%  ·  crossover at step ${run.stats.crossoverStep}`);
```

## Run it

```bash
# No npm package is published — this repo is an implementation spec.
# Point the import at your implementation of the engine contract (see ../../AGENTS.md), then:
npx tsx ./index.ts
```

## Expected output

```text
step |   naive in |  markovian in | running saved
   1 |        900 |          1700 |       -800     ← naive cheaper for the first 2 steps
   2 |       2100 |          1700 |       -400
   3 |       3300 |          1700 |      1,200     ← crossover: Markovian pulls ahead
   ...
  20 |      23700 |          1700 |    212,000

Naive total: 246,000  ·  Markovian total: 34,000
Efficiency: 86%  ·  crossover at step 3
```

The numbers match the worked example in [`docs/efficiency-model.md`](../../docs/efficiency-model.md) (defaults `F=400, G=200, S=300, O=1200, C=800`): naive is `O(N²)`, Markovian is `O(N)`, breakeven at `N > 1 + 2C/O ≈ 3`.

## Reading the crossover

| Steps | Winner | Why |
| --- | --- | --- |
| 1–2 | naive (barely) | Markovian pays a fixed ~800-tok carryover before it has history to beat |
| 3 | crossover | naive's growing history overtakes the flat carryover cost |
| 20 | Markovian by 7× | naive is quadratic; the gap widens every step |
| 50+ | Markovian only | naive exceeds the context ceiling — it stops *running*, not just costing |

---

## Why it matters

- **Below the crossover, Markovian is not free — and that is honest.** For a 2-step task, just call the model. The engine earns its keep from step ~3 onward; pretending it wins everywhere would be the kind of claim this demo exists to disprove.
- **The gap is structural, not tuning.** Naive is `O(N²)` *by construction* — every step ships every prior output. No prompt trick changes the shape; only bounded carryover does.
- **Past ~50 steps the metric stops being "cost."** It becomes "runs vs does not run." The naive total at 500 steps (~150M tokens in) is not expensive — it is impossible. That is the real argument; the efficiency % is just the visible part of it.

## Next

- [`../../token-economics-demo`](../../token-economics-demo/README.md) — the same comparison as an interactive chart.
- [`docs/efficiency-model.md`](../../docs/efficiency-model.md) — the full derivation and where the approximation is loose.
