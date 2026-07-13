# Reflection

An optional pass at the end of a Markovian run where the engine reviews its own work and either ratifies it, refines it, or flags it for human attention.

## When to use it

- Long planning runs where the final output has to hang together
- Research chains where consistency across chunks matters
- Decision sequences where you want a sanity check before action

Skip it for:

- Single-purpose factual chains where each chunk is independent
- Cheap-and-frequent runs where the reflection cost outweighs the value
- Anything where downstream verification already runs (Swarm verify, World Model assert)

## What it does

Three canonical modes, picked at config time:

### Mode 0 — Conclude (default)

Synthesize the accumulated reasoning into one final answer. The reference instruction: *"Synthesize a final review. Highlight what was accomplished, what was deferred, and what should be tested first."* Input: original prompt + final carryover + full content (**truncated to 30,000 chars**) + a code-artifact summary (count/language/size of code blocks).

### Mode 1 — Ratify

The cheapest. Reflection reads the final output and the marker trail and emits a verdict:

```
RATIFIED — output coherent with goal, no contradictions found
or
FLAGGED — found N issues, see notes
```

Used as a downstream signal. The host decides what to do with flagged runs.

### Mode 2 — Refine

Reflection identifies issues and produces a refined final output:

```
issues: [...]
refined_output: ...
```

The original output is always preserved as `reflection.originalOutput`. The host can accept the refinement, accept the original, or escalate.

### Optional extension — Branch and converge

Beyond the three canonical modes, some hosts add a branch-and-converge pass: reflection spawns a small second chain that addresses the issues, then merges with the original. More expensive; useful when refinement requires actual work, not just rewording.

## How it works

Reflection is itself a Markovian chain — bounded chunks, structured markers — but with a different goal:

```
goal: "Review the prior run's final output and marker trail; identify
       contradictions, gaps, or unresolved questions; produce a verdict."
input: run history (markers only, not full chunk transcripts)
```

It's bounded, fast (typically 1-3 chunks), and produces a structured verdict.

Reflection runs only when the run has ≥ 1 chunk, completed, and was not aborted. And the hard rule: **reflection failure must never fail the run** — a reflection error degrades to a skipped verdict; the chain's real output is returned regardless.

## Wiring

```ts
const run = await markovian.run({
  goal: "...",
  stepFn: ...,
  reflection: { mode: "refine" },
});

console.log(run.reflection.verdict);   // "ratified" | "flagged" | "refined"
console.log(run.reflection.issues);    // structured list
console.log(run.output);               // refined or original
```

## What reflection won't fix

- A fundamentally wrong goal — reflection can't notice that you asked for the wrong thing.
- A carryover that lost critical state ten chunks ago — reflection sees markers, not the lost detail.
- Tool-output errors that cascaded — reflection can flag inconsistency but can't re-fetch.

For those failure modes, you want **resume from checkpoint** or **re-plan via Scout**, not reflection.

## Cost

Reflection typically costs 1.5-3x a normal chunk. Modes 1 and 2 are bounded by the existing carryover and a small reflection-specific framing. Mode 3 spawns a sub-chain and is bounded by `maxChunks` on the sub-chain.

The cost is **predictable and capped**. It's not a recursive verification cascade.

## What's next

- [Run history](./run-history.md) — what reflection reads
- [Compose with Swarm](./compose-with-swarm.md) — when to skip reflection (Swarm already verifies)
