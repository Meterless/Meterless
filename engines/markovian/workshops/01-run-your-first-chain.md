# Workshop 01 — Run your first chain

**Time:** 30 minutes
**You'll leave with:** a running Markovian chain of 5+ steps, an understanding of what carryover actually carries, and the muscle memory for emitting markers.

## Setup

This repo is an implementation spec — there is no published `@meterless/markovian` package. Implement the engine contract first (point your coding agent at [`AGENTS.md`](../AGENTS.md)), then:

```bash
mkdir my-markovian && cd my-markovian
npm init -y
npm install tsx typescript
# add your engine implementation as a local dependency
```

## Step 1 — Pick a goal that needs more than one step (5 min)

"Summarize this paragraph" doesn't. "Plan the next quarter of work" does. The Markovian shape only helps when the work is genuinely multi-step.

Good first goals:

- Draft a five-section onboarding doc
- Plan a four-phase launch
- Outline a six-step retrospective

## Step 2 — Write your stepFn (10 min)

```ts
import { Markovian } from "@meterless/markovian";

const markovian = new Markovian({
  chunkConfig: { chunkSize: 4000, carryoverTokens: 600 },
});

const run = await markovian.run({
  goal: "Plan a four-phase product launch",
  stepFn: async ({ goal, carryover, step }) => {
    const prompt = `${goal}\n\nProgress so far:\n${carryover || "(starting fresh)"}\n\nNext step (${step + 1}):`;
    const output = await yourLLM(prompt);
    return { content: output, step: step + 1 };
  },
  stopWhen: ({ output }) => output.includes("<DONE>"),
});

console.log(run.output);
```

## Step 3 — Teach the model the marker protocol (10 min)

Add framing that tells the model what to emit:

```ts
const framing = `
You are planning step-by-step. After each step's content, emit:

<CARRYOVER>
COMPLETED: ...
REMAINING: ...
DECISIONS: ...
CONTEXT: ...
</CARRYOVER>

Emit <DONE> only when the goal is fully complete.
`;
```

(The `<CARRYOVER>`/`<DONE>` tags are the XML alternate of the canonical bracket markers — see [`docs/marker-protocol.md`](../docs/marker-protocol.md). The four labeled categories are the canonical carryover shape.)

Prepend `framing` to your prompts. Now the model emits structured markers; the engine reads them.

## Step 4 — Watch the carryover evolve (5 min)

```ts
for (const c of run.chunks) {
  console.log(`step ${c.step}:`);
  console.log(`  in:  ${c.carryoverIn.slice(0, 80)}...`);
  console.log(`  out: ${c.carryoverOut.slice(0, 80)}...`);
}
```

You should see decisions accumulating, open questions resolving, progress advancing. If you see whole transcripts copied forward, the model isn't compressing — fix the framing.

## What you learned

- Markovian is multi-step reasoning with bounded context.
- The marker protocol is what makes carryover reliable.
- The model is doing the compression — the engine just reads the markers.
- Framing matters more than chunk size.

## Next

[Workshop 02 — Size your chunks →](./02-size-your-chunks.md)
