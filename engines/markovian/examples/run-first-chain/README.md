# 01 — Run your first chain

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

The smallest possible Markovian run: a goal in, bounded chunks out, flat token cost. Start here — every other example is this plus one idea.

Prerequisite reading: [`docs/architecture.md`](../../docs/architecture.md), [`docs/marker-protocol.md`](../../docs/marker-protocol.md).

---

## Scenario

A goal that genuinely needs multiple steps (a single shot would not do it justice):

```text
Plan a four-phase product launch.
```

We want the engine to run it as a short chain, with each step seeing only the goal + a **compressed carryover** — never the full transcript.

---

## The whole thing — `index.ts`

```ts
import { Markovian } from "@meterless/markovian";

const markovian = new Markovian({
  chunkConfig: { chunkSize: 4000, carryoverTokens: 600 },
});

const framing = `
You are planning step by step. After each step's content, emit:

<CARRYOVER>
COMPLETED: ...
REMAINING: ...
DECISIONS: ...
CONTEXT: ...
</CARRYOVER>

Emit <DONE> only when the launch plan is fully complete.
`;

const run = await markovian.run({
  goal: "Plan a four-phase product launch.",
  stepFn: async ({ goal, carryover, step }) => {
    const prompt = `${framing}\n\nGoal: ${goal}\n\nProgress so far:\n${carryover || "(starting fresh)"}\n\nWrite step ${step + 1}:`;
    const output = await yourLLM(prompt);     // any provider — Markovian doesn't care
    return { content: output, step: step + 1 };
  },
  stopWhen: ({ output }) => output.includes("<DONE>"),
});

console.log(run.output);
console.log(`${run.chunks.length} chunks · ${run.stats.efficiency}% saved vs naive`);
```

## Run it

```bash
# No npm package is published — this repo is an implementation spec.
# Point the import at your implementation of the engine contract (see ../../AGENTS.md), then:
npx tsx ./index.ts
```

## Expected output (illustrative — modeled numbers, not a recorded run)

```text
# Four-Phase Product Launch Plan
Phase 1 — Private beta ...
Phase 2 — Design-partner GA ...
Phase 3 — Public launch ...
Phase 4 — Post-launch iteration ...

5 chunks · 49% saved vs naive
```

## Inspect what carryover actually carried

```ts
for (const c of run.chunks) {
  console.log(`step ${c.step}: in="${c.carryoverIn.slice(0, 60)}…" out="${c.carryoverOut.slice(0, 60)}…"`);
}
```

You should see DECISIONS accumulating and OPEN_QUESTIONS resolving — **not** whole prior steps copied forward. If you see transcripts, the model is not compressing; tighten the framing.

---

## Why it matters

- **Each step's prompt is bounded.** Step 5 sees the goal + ~600 tokens of carryover, not steps 1–4 verbatim. That is the entire point — memory cost stays flat as the chain grows.
- **The model does the compression; the engine reads the markers.** Markovian does not summarize for you. It schedules chunks and extracts `<CARRYOVER>`. The marker protocol is what makes that reliable instead of drifty.
- **49% saved at only 5 steps.** Even a tiny chain beats the naive append-history baseline. The advantage widens with length (see [`token-savings-demo`](../token-savings-demo/README.md)).

## Next

- [`02 — custom-chunk-config`](../custom-chunk-config/README.md) — sizing chunks for your model and task.
- [`03 — marker-protocol`](../marker-protocol/README.md) — the structured markers the engine reads (this example uses the XML alternate of the canonical bracket protocol — see [`docs/marker-protocol.md`](../../docs/marker-protocol.md)).
