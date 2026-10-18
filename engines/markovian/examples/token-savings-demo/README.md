# Token savings demo

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

The engine's central claim is that per-step cost stays flat instead of growing linearly. This example checks it with numbers. It assembles the same task content two ways, Markovian bounded carryover vs a naive history-growing baseline, and prints them step by step.

Prerequisite reading: [`docs/efficiency-model.md`](../../docs/efficiency-model.md). Visual version: [`../../token-economics-demo`](../../token-economics-demo/README.md).

---

## Scenario

Hold the per-step content identical across both runs. Vary only how the prompt is assembled:

- **Naive:** every step's prompt = framing + goal + all prior outputs + this step.
- **Markovian:** every step's prompt = framing + goal + bounded carryover + this step.

If content is constant, every token difference comes from prompt assembly. That isolates the one variable being measured.

---

## Walkthrough: `index.ts`

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
# No npm package is published. This repo is an implementation spec.
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
| 50+ | Markovian only | naive exceeds the context ceiling and stops running |

---

## Why it matters

- **Below the crossover, Markovian costs more.** For a 2-step task, call the model directly. The engine pays off from step ~3 onward. This demo shows the losing steps too, so the claim stays honest.
- **The gap is structural.** Naive is `O(N²)` by construction, because every step ships every prior output. No prompt trick changes the shape; only bounded carryover does.
- **Past ~50 steps the question is whether the run fits at all.** The naive total at 500 steps (~150M tokens in) cannot run. The efficiency % shows only part of that gap.

## Next

- [`../../token-economics-demo`](../../token-economics-demo/README.md): the same comparison as an interactive chart.
- [`docs/efficiency-model.md`](../../docs/efficiency-model.md): the full derivation and where the approximation is loose.
