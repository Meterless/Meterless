# Streaming UI

Long Markovian runs need a live progress surface. The engine emits structured events; the host renders them.

## Events

```
run.start         { runId, goal, chunkConfig }
chunk.start       { runId, step, carryoverIn }
chunk.token       { runId, step, token }           ── if model streams
chunk.progress    { runId, step, message }         ── from progress markers
chunk.tool        { runId, step, tool, input }     ── from [NEEDS_TOOL]
chunk.complete    { runId, step, tokensIn, tokensOut, latencyMs, carryoverOut }
chunk.error       { runId, step, error }
run.complete      { runId, status, stats }
```

Subscribe:

```ts
markovian.on("chunk.progress", (e) => ui.appendProgress(e.message));
markovian.on("chunk.complete", (e) => ui.advanceStep(e.step, e.tokensOut));
markovian.on("run.complete", (e) => ui.markDone(e.stats));
```

## Recommended UI shapes

### Stepper

A horizontal or vertical step list with one entry per chunk:

```
✓ Step 1 — researched candidates       400ms · 1.2k tok
✓ Step 2 — narrowed to top 3           520ms · 1.4k tok
● Step 3 — evaluating top 3...
○ Step 4 — pending
○ Step 5 — pending
```

The active step shows live `chunk.progress` messages; completed steps show stats.

### Carryover preview

When debugging or for high-trust workflows, surface the carryover diff between steps so the user can see what state crossed the boundary:

```
+ DECISIONS: chose Iceberg
+ OPEN_QUESTIONS: catalog provider
- (none)
```

This is the surface that makes Markovian's behavior **inspectable in real time**, not just after the fact.

### Token budget gauge

A running gauge showing tokens consumed vs. the projected total. Helps users see whether a run is on track or drifting.

```
[████████████░░░░░░] 12k / ~18k tokens
```

## Human-in-the-loop hooks

Markovian can pause for human input via `[NEEDS_CLARIFICATION]` (or its XML alternate — see [`marker-protocol.md`](./marker-protocol.md)). The streaming UI shows the question; the host posts the answer back:

```ts
markovian.on("chunk.clarification", async ({ runId, step, question }) => {
  const answer = await ui.askUser(question);
  await markovian.resume(runId, { stepInput: answer });
});
```

This is what turns long runs from "fire and forget" into **collaborative long-horizon work**.

## Approval gates

For runs scoped under high-risk Scout contracts, you can require approval between chunks:

```ts
const markovian = new Markovian({
  approvalGates: { everyN: 5 },  // pause for approval every 5 chunks
});

markovian.on("approval.required", async ({ runId, step, carryover }) => {
  const ok = await ui.requestApproval({ step, carryover });
  if (ok) markovian.resume(runId);
  else markovian.cancel(runId);
});
```

The streaming UI is where approvals happen. The contract specifies that they're required; the UI provides them.

## What's next

- [Reflection](./reflection.md) — post-run self-review
- [Compose with Swarm](./compose-with-swarm.md) — streaming inside a swarm task
