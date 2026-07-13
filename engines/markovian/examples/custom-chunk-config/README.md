# 02 — Custom chunk config

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

> **Marker note:** this walkthrough uses the XML alternate (`<CARRYOVER>`, `<DONE>`) of the canonical bracket protocol (`[STATE_CHECKPOINT]` / `[TASK_COMPLETE]`) — see [docs/marker-protocol.md](../../docs/marker-protocol.md) for the 1:1 mapping.

`carryoverTokens` is the single most consequential knob in the engine. This example runs the *same* task under three config profiles so you can see the trade-off in real numbers.

Prerequisite reading: [`docs/chunk-config.md`](../../docs/chunk-config.md), [`docs/efficiency-model.md`](../../docs/efficiency-model.md).

---

## Scenario

One goal, three task shapes' worth of carryover budget:

```text
Goal: "Draft a 6-section engineering onboarding doc."
```

The rule of thumb from [`docs/chunk-config.md`](../../docs/chunk-config.md): carryover should be **10–15% of `chunkSize`** — lower for information-light work, higher for state-heavy work.

---

## Walkthrough — `index.ts`

```ts
import { Markovian } from "@meterless/markovian";

const profiles = {
  "information-light": { chunkSize: 6000, carryoverTokens: 400 },  // ~7%
  "decision-heavy":    { chunkSize: 6000, carryoverTokens: 900 },  // ~15%
  "state-heavy":       { chunkSize: 6000, carryoverTokens: 1300 }, // ~22%
};

for (const [name, chunkConfig] of Object.entries(profiles)) {
  const markovian = new Markovian({ chunkConfig });
  const run = await markovian.run({
    goal: "Draft a 6-section engineering onboarding doc.",
    stepFn: mySectionStepFn,            // identical across profiles
    stopWhen: ({ output }) => output.includes("<DONE>"),
  });
  console.log(
    `${name}: ${run.chunks.length} chunks · ${run.stats.totalTokensIn} in · ` +
    `carryover-lost-warnings=${run.stats.carryoverTruncations}`,
  );
}
```

## Run it

```bash
# No npm package is published — this repo is an implementation spec.
# Point the import at your implementation of the engine contract (see ../../AGENTS.md), then:
npx tsx ./index.ts
```

## Expected output (illustrative — modeled numbers, not a recorded run)

```text
information-light: 6 chunks · 41,200 in · carryover-lost-warnings=2
decision-heavy:    6 chunks · 46,800 in · carryover-lost-warnings=0
state-heavy:       6 chunks · 53,400 in · carryover-lost-warnings=0
```

## Reading the trade-off

| Profile | Total tokens in | Carryover truncations | Verdict |
| --- | --- | --- | --- |
| information-light | 41,200 (cheapest) | **2** — state was dropped | too tight; sections referenced lost decisions |
| decision-heavy | 46,800 | 0 | **right fit** — every section coherent, no waste |
| state-heavy | 53,400 (priciest) | 0 | safe but you paid for state that compressed fine at 900 |

`carryoverTruncations` is the signal: non-zero means the model's `<CARRYOVER>` exceeded the budget and was cut. Cheaper is not better if it loses the decisions later steps depend on.

---

## Why it matters

- **Carryover size is a task property, not a global default.** A brainstorm tolerates 5–10%; a multi-account migration needs 15–22%. One number does not fit every run — this example is how you find the right one empirically.
- **Cheapest config can be the worst.** `information-light` had the lowest token bill *and* two truncation warnings — section 5 contradicted a decision made in section 2 because that decision fell out of carryover. Watch truncations, not just cost.
- **Over-budgeting wastes money silently.** `state-heavy` paid 30% more for zero benefit here. The right size is the smallest carryover with zero truncations.

## Next

- [`03 — marker-protocol`](../marker-protocol/README.md) — what the model emits into that carryover budget.
- [`04 — compression-cascade`](../compression-cascade/README.md) — what happens when it does not fit.
