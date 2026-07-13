# 03 — Marker protocol

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

Carryover between chunks is not free-form prose — it is structured markers the model emits and the engine reads. This example shows the parser handling every marker, a tool round-trip, and a malformed marker.

Prerequisite reading: [`docs/marker-protocol.md`](../../docs/marker-protocol.md).

> **Note:** the canonical wire format is the bracket protocol (`[STATE_CHECKPOINT]`, `[TASK_COMPLETE]`, `[NEEDS_TOOL ...]`, `[NEEDS_CLARIFICATION]`). This example uses the documented **XML alternate mapping** (`<CARRYOVER>`, `<DONE>`, ...) for readability — the parser normalizes both to the same wire format.

---

## Scenario

A research chain that emits all five markers across its life:

```text
<CARRYOVER>   bounded state for the next chunk
<PROGRESS>    one-line status for the live UI
<NEEDS_TOOL>  pause, call a tool, resume with the result
<DONE>        chain complete
<NEEDS_CLARIFICATION>  pause for a human answer
```

---

## Walkthrough — `index.ts`

```ts
import { Markovian } from "@meterless/markovian";

const markovian = new Markovian({
  chunkConfig: { chunkSize: 5000, carryoverTokens: 700 },
  tools: {
    "world.query": async (input) => {
      const { entity } = JSON.parse(input);
      return `lookup(${entity}) → { status: "active", owner: "team-x" }`;
    },
  },
});

const run = await markovian.run({
  goal: "Research the status of team:bengals and summarize.",
  stepFn: async ({ goal, carryover, step, toolResult }) => {
    // toolResult is populated on the chunk AFTER a <NEEDS_TOOL>.
    const prompt = [
      goal,
      carryover && `State:\n${carryover}`,
      toolResult && `Tool result:\n${toolResult}`,
      `Step ${step + 1}. Emit <CARRYOVER>, <PROGRESS>, and <DONE> when finished.`,
    ].filter(Boolean).join("\n\n");
    return { content: await yourLLM(prompt), step: step + 1 };
  },
  stopWhen: ({ output }) => output.includes("<DONE>"),
});

for (const c of run.chunks) {
  console.log(`step ${c.step}: markers=${c.markersEmitted.join(",")}`);
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
step 1: markers=CARRYOVER,PROGRESS
step 2: markers=NEEDS_TOOL              ← engine paused, called world.query
step 3: markers=CARRYOVER,PROGRESS      ← toolResult injected at input slot
step 4: markers=CARRYOVER,DONE
run.output: "team:bengals is active, owned by team-x. ..."
```

## What the parser tolerates (and does not)

| Input | Result |
| --- | --- |
| `<carryover>` lowercase, extra whitespace | accepted (tolerant) |
| `<DONE/>` void with trailing slash | accepted |
| prose wrapped around the markers | accepted — markers extracted |
| `<CARRYOVER>` unclosed tag | **typed error**, recorded in run history |
| carryover exceeding `carryoverTokens` | truncated + warning, run continues |
| chunk emits **no** `<CARRYOVER>` | engine falls back to the [compression cascade](../compression-cascade/README.md) |

## The tool round-trip

```text
chunk 2 emits:  <NEEDS_TOOL tool="world.query" input='{"entity":"team:bengals"}' />
engine:         pauses chunk scheduling → calls tools["world.query"] → gets result
chunk 3:        receives result at the input slot (state.toolResult), continues
```

The chain never ships the tool plumbing in its prompt — the result is injected as data into the next bounded chunk.

---

## Why it matters

- **Structure survives compression; prose does not.** A model that writes "we discussed phases then the catalog choice…" is *summarizing* (drifts). A model that fills `DECISIONS:`/`OPEN_QUESTIONS:` is *structuring* — that is what survives the carryover boundary intact.
- **The parser is tolerant on shape, strict on validity.** Whitespace, case, and surrounding prose are fine; unclosed tags are a typed error on the record, not a silent corruption. Failures are observable.
- **Tools and clarifications are first-class pauses.** `<NEEDS_TOOL>` / `<NEEDS_CLARIFICATION>` let a bounded chunk reach outside itself without bloating its context — the engine handles the round-trip and resumes.

## Next

- [`04 — compression-cascade`](../compression-cascade/README.md) — what happens when the model emits no marker, or one too big.
- [`05 — streaming-progress`](../streaming-progress/README.md) — surfacing `<PROGRESS>` to a live UI.
