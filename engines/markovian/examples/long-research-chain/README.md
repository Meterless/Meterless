# Long research chain

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

> **Marker note:** this walkthrough uses the XML alternate (`<CARRYOVER>`, `<DONE>`) of the canonical bracket protocol (`[STATE_CHECKPOINT]` / `[TASK_COMPLETE]`) — see [docs/marker-protocol.md](../../docs/marker-protocol.md) for the 1:1 mapping.

A 30-step research run, end to end. This is the example where Markovian stops being a nicety and becomes the *only* way the work runs at all — a 30-step naive chain exhausts the context window before it finishes.

Prerequisite reading: the numbered path [`01`](../run-first-chain/README.md)–[`07`](../reflection-pass/README.md), [`docs/efficiency-model.md`](../../docs/efficiency-model.md).

---

## Scenario

```text
Goal: "Produce a competitive landscape report on the vector-database market:
       8 vendors, pricing, architecture, benchmarks, and a recommendation."
```

This is genuinely ~30 steps of recursive analysis with periodic web/tool lookups. Naively, by step ~18 the prompt is the whole research transcript and you hit the model's context ceiling. With Markovian, step 30 costs the same as step 3.

---

## Walkthrough — `index.ts`

```ts
import { Markovian } from "@meterless/markovian";

const markovian = new Markovian({
  chunkConfig: { chunkSize: 8000, carryoverTokens: 1400, maxChunks: 32 }, // 32 is the maxChunks bound
  tools: {
    "web.search": async (q) => fetchSearch(JSON.parse(q).query),
  },
  reflection: { mode: "ratify" },
});

const framing = `
You are running a recursive research investigation. Log each action with ">> ".
Build a research tree. After each step emit:

<CARRYOVER>
FINDINGS: <key facts with source>
VENDORS_COVERED: <list>
OPEN_THREADS: <what still needs investigation>
PROGRESS: step X of ~30
</CARRYOVER>

Use <NEEDS_TOOL tool="web.search" input='{"query":"..."}' /> when you need data.
Emit <DONE> only when all 8 vendors are covered and a recommendation is written.
`;

const run = await markovian.run({
  goal: "Competitive landscape: vector-database market, 8 vendors, recommendation.",
  stepFn: async ({ goal, carryover, step, toolResult }) => {
    const prompt = [
      framing, `Goal: ${goal}`,
      carryover && `Research state:\n${carryover}`,
      toolResult && `Search result:\n${toolResult}`,
      `Continue research (step ${step + 1}).`,
    ].filter(Boolean).join("\n\n");
    return { content: await yourLLM(prompt), step: step + 1 };
  },
  stopWhen: ({ output }) => output.includes("<DONE>"),
});

console.log(`${run.chunks.length} chunks · ${run.stats.efficiency}% saved`);
console.log(`naive would have needed ~${run.stats.naiveTokensIn} tokens in (ceiling exceeded ~step 18)`);
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
31 chunks · 94% saved
naive would have needed ~1,180,000 tokens in (ceiling exceeded ~step 18)

# Vector Database Competitive Landscape
## Vendors: Pinecone, Weaviate, Qdrant, Milvus, pgvector, Chroma, LanceDB, Vespa
## Pricing … ## Architecture … ## Benchmarks …
## Recommendation: Qdrant for self-host cost/perf; Pinecone for managed simplicity.
```

## The shape that makes 30 steps work

```text
step 1   >> scope the 8 vendors            <CARRYOVER> FINDINGS, VENDORS_COVERED:1
step 4   <NEEDS_TOOL web.search "Qdrant pricing">  → result injected into step 5
step 12  >> deep-dive benchmarks           <CARRYOVER> OPEN_THREADS shrinking
...
step 30  >> synthesize recommendation      <CARRYOVER> ... <DONE>
step 31  reflection (ratify) → "consistent, all 8 covered"
```

Every step's prompt is goal + ~1400-token carryover + maybe one tool result. **Never** the prior 29 steps.

---

## Why it matters

- **This run does not exist without Markovian.** The qualitative point from the efficiency model: naive baselines have a *ceiling*, not just a cost. A 30-step research transcript exceeds context around step 18 — a bigger model just moves the ceiling, it does not remove it. Bounded carryover removes it.
- **94% saved is the floor at this length, not the headline.** Efficiency rises with N (see [`docs/efficiency-model.md`](../../docs/efficiency-model.md)). The headline is feasibility: 30 steps, then 100, then 500, all at flat per-step cost.
- **Tools keep chunks bounded too.** A `web.search` result is injected into the *next* chunk as data — the research does not accumulate raw search dumps in an ever-growing prompt.
- **Ratify reflection is the safety check.** One pass confirms all 8 vendors were actually covered before the report ships — catching anything a bounded step dropped.

## Next

- [`architecture-planning`](../architecture-planning/README.md) — the decision-heavy long-run counterpart.
- [`token-savings-demo`](../token-savings-demo/README.md) — this run's economics, side-by-side with naive.
