# Architecture planning

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

> **Marker note:** this walkthrough uses the XML alternate (`<CARRYOVER>`, `<DONE>`) of the canonical bracket protocol (`[STATE_CHECKPOINT]` / `[TASK_COMPLETE]`) — see [docs/marker-protocol.md](../../docs/marker-protocol.md) for the 1:1 mapping.

Long-form migration planning where the **decisions** are the payload. The counterpart to [`long-research-chain`](../long-research-chain/README.md): research accumulates findings; architecture planning accumulates *commitments that later steps must not contradict*. That makes carryover discipline the whole game.

Prerequisite reading: [`long-research-chain`](../long-research-chain/README.md), [`docs/chunk-config.md`](../../docs/chunk-config.md), [`docs/reflection.md`](../../docs/reflection.md).

---

## Scenario

```text
Goal: "Plan the migration of our analytics warehouse to Apache Iceberg.
       15 checkpoints: format, catalog, phasing, backfill, cutover, rollback."
```

The danger in a decision-heavy chain: step 11 quietly re-litigates a choice made in step 3 because that decision fell out of carryover. The fix is decision-heavy carryover + a ratify reflection.

---

## Walkthrough — `index.ts`

```ts
import { Markovian } from "@meterless/markovian";

const markovian = new Markovian({
  // Decision-heavy → carryover at the high end of the ratio (≈18% of chunk).
  chunkConfig: { chunkSize: 7000, carryoverTokens: 1300, maxChunks: 20 },
  reflection: { mode: "ratify" },
});

const framing = `
You are planning an architecture migration as a sequence of decision checkpoints.
After each checkpoint emit:

<CARRYOVER>
DECISIONS:        <every committed choice, terse, NEVER drop one>
OPEN_QUESTIONS:   <unresolved, with the step that must close it>
CONSTRAINTS:      <hard constraints discovered so far>
CHECKPOINT: X of ~15 — <name>
</CARRYOVER>

A DECISION, once in carryover, must be carried forward verbatim until the plan is done.
Emit <DONE> only when all 15 checkpoints are decided.
`;

const run = await markovian.run({
  goal: "Plan the analytics-warehouse migration to Apache Iceberg (15 checkpoints).",
  stepFn: async ({ goal, carryover, step }) => {
    const prompt = [framing, `Goal: ${goal}`,
      carryover && `Plan state:\n${carryover}`,
      `Decide checkpoint ${step + 1}.`].filter(Boolean).join("\n\n");
    return { content: await yourLLM(prompt), step: step + 1 };
  },
  stopWhen: ({ output }) => output.includes("<DONE>"),
});

console.log(run.reflection.verdict);   // expect "ratified" if no decision drifted
console.log(run.output);
```

## Run it

```bash
# No npm package is published — this repo is an implementation spec.
# Point the import at your implementation of the engine contract (see ../../AGENTS.md), then:
npx tsx ./index.ts
```

## Expected output (illustrative — modeled numbers, not a recorded run)

```text
15 chunks · 86% saved · reflection: ratified

# Iceberg Migration Plan
## Decisions (carried verbatim across all 15 checkpoints)
- Target format: Apache Iceberg (cost + open ecosystem)   [decided: checkpoint 1]
- Catalog: AWS Glue (already in stack)                      [decided: checkpoint 3]
- Phasing: 3 phases over 6 months                           [decided: checkpoint 4]
- Backfill: dual-write + reconcile, cold layer last         [decided: checkpoint 8]
- Rollback: keep Delta read path for 1 phase                [decided: checkpoint 12]
## Phase 1 … Phase 2 … Phase 3 …
```

## Why carryover discipline is the whole game here

```text
checkpoint 3  DECISIONS: [Iceberg, Glue]
checkpoint 8  DECISIONS: [Iceberg, Glue, 3-phase, dual-write]   ← step-3 choices still present
checkpoint 12 DECISIONS: [..., rollback]                         ← nothing dropped
reflection    cross-checks: does the final plan honor every DECISION? → ratified
```

If `DECISIONS` had been allowed to compress lossily, checkpoint 12's rollback plan might assume Delta Lake — contradicting checkpoint 1. The framing instruction *"carry decisions verbatim"* + a ratify pass is what prevents that.

---

## Why it matters

- **Decisions are not summarizable.** Findings can be compressed; a *commitment* cannot be paraphrased without risking contradiction 9 steps later. This is the case where you deliberately spend a larger `carryoverTokens` budget and instruct verbatim retention — the [`02 — custom-chunk-config`](../custom-chunk-config/README.md) trade-off, applied with intent.
- **Ratify reflection is the integrity check, not a rewrite.** The chain never saw all 15 checkpoints at once. One read-only pass confirms the final plan honors every decision it committed to — the exact drift a bounded chain risks.
- **86% saved, but feasibility is still the point.** A 15-checkpoint plan with full decision history would be a large, growing prompt. Flat cost is why this runs predictably; the decision discipline is why it runs *correctly*.

## Next

- [`long-research-chain`](../long-research-chain/README.md) — the findings-heavy counterpart.
- [`07 — reflection-pass`](../reflection-pass/README.md) — ratify vs refine vs branch-and-converge in depth.
