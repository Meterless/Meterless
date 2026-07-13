# Workshop 04 — Reflect and resume

**Time:** 30 minutes
**You'll leave with:** a run that ratifies its own work, and the muscle memory for resuming a paused chain.

## Reflection

Reflection is an optional final pass that reviews the run and either ratifies, refines, or flags.

```ts
const run = await markovian.run({
  goal: "Plan a launch",
  stepFn: ...,
  stopWhen: ...,
  reflection: { mode: "ratify" },
});

console.log(run.reflection.verdict);    // "ratified" | "flagged"
console.log(run.reflection.issues);     // structured list if flagged
```

### When to ratify vs refine vs branch

- **Ratify** — fast verdict; you'll use it as a signal downstream
- **Refine** — you want a single improved output
- **Branch and converge** — you want the engine to actually do the fix-up work and converge

Default to `ratify`. Move to `refine` when the output is going to a customer. Move to `branch` only for high-stakes work where the additional cost is justified.

## Resume

Long chains sometimes pause — for tool calls, for clarification, for approval gates. The engine surfaces a pause event; you resume after providing the input.

```ts
markovian.on("chunk.clarification", async ({ runId, question }) => {
  const answer = await askUser(question);
  await markovian.resume(runId, { stepInput: answer });
});

markovian.on("chunk.tool", async ({ runId, tool, input }) => {
  const result = await invokeTool(tool, input);
  await markovian.resume(runId, { toolResult: result });
});
```

## Approval gates

For runs under high-risk contracts, approve every N chunks:

```ts
const markovian = new Markovian({
  approvalGates: { everyN: 5 },
});

markovian.on("approval.required", async ({ runId, step, carryover }) => {
  const ok = await getApproval({ step, carryover });
  if (ok) await markovian.resume(runId);
  else await markovian.cancel(runId);
});
```

The streaming UI is where approvals happen. The contract specifies they're required; the UI provides them.

## What you learned

- Reflection is optional, bounded, and modal — pick the right mode for the cost.
- Resume turns one-shot runs into collaborative work.
- Approval gates make high-risk chains safe without making them sluggish.

## Done

You've completed the Markovian workshop series. Next steps:

- Compose with Swarm — see [`examples/markovian-inside-swarm`](../examples/markovian-inside-swarm)
- Feed H-MEM — see [`examples/markovian-with-hmem`](../examples/markovian-with-hmem)
- Read [`docs/efficiency-model.md`](../docs/efficiency-model.md) and play with [`token-economics-demo`](../token-economics-demo) to internalize the math
- Compose with the rest of the [Meterless engine stack](https://github.com/meterless/meterless).
