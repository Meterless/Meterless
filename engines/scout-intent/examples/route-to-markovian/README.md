# Route to Markovian

Scout sits **above** every other engine. When it detects a long-horizon task, it does not run it — it emits a contract that routes to the [Markovian Engine](https://github.com/meterless/meterless/tree/main/engines/markovian) for bounded-context reasoning, and Markovian verifies that contract before it starts.

Prerequisite reading: [`04 — generate-execution-contract`](../generate-execution-contract/README.md), the [Markovian Engine](https://github.com/meterless/meterless/tree/main/engines/markovian).

---

## Scenario

```text
"Plan our 6-month analytics-warehouse migration to Iceberg."
```

This is `architecture.plan` — an intent that declares `markovian.chain` as a capability. It is genuinely 15+ reasoning steps; a single model call cannot do it justice.

---

## Walkthrough — `index.ts`

```ts
import { Scout } from "@meterless/scout";
import { Markovian } from "@meterless/markovian";

const scout = new Scout({ intentRegistry: "./intents.json", policyPack: "default" });

// 1. Scout decides. It does NOT reason about the migration itself.
const decision = await scout.decide({
  prompt: "Plan our 6-month analytics-warehouse migration to Iceberg.",
  user: { id: "u-1", role: "architect" },
  surface: "chat",
});

console.log(decision.intent.primary.id);   // "architecture.plan"
console.log(decision.toolPlan);            // [{ tool: "markovian.chain", reason: "long-horizon" }]

// 2. The contract is the handoff. Markovian verifies it BEFORE running.
const markovian = new Markovian({ chunkConfig: { tokensPerChunk: 6000, carryoverTokens: 800 } });

const run = await markovian.runFromContract(decision.executionContract, {
  secret: process.env.SCOUT_SECRET,           // verify signature + expiry first
  stepFn: myArchitectStepFn,
  stopWhen: ({ output }) => output.includes("[TASK_COMPLETE]"),
});

console.log(`${run.chunks.length} chunks · ${run.stats.efficiency}% saved`);
```

## Run it

```bash
# The @meterless packages are not yet published — this repository is the
# implementation spec. With a spec-conforming implementation on your import path:
npx tsx ./index.ts
```

## Expected output

```text
architecture.plan
[ { tool: "markovian.chain", reason: "long-horizon decision-heavy task" } ]
markovian: contract verified (sig ok, not expired, capability markovian.chain in scope)
15 chunks · 86% saved
```

## How Scout decides "this is long-horizon"

```text
intent architecture.plan declares capability markovian.chain
        +
estimated-steps heuristic / intent metadata says "decision-heavy, multi-phase"
        ↓
toolPlan = [markovian.chain]
modelProfile = high_reasoning
        ↓
execution contract scoped to capability "markovian.chain" only
```

Scout never sees the migration content. It classifies the *shape* of the work and routes accordingly — the reasoning happens entirely inside Markovian's bounded chunks.

## The handoff is the contract, nothing else

```text
Scout ──signed contract──▶ Markovian
                              │ verifyContract(): sig ok? not expired? markovian.chain in scope?
                              │   any check fails → refused at the boundary
                              ▼
                       bounded chunked run (Scout never re-consulted per chunk)
```

Long runs that need more time call `scout.replan({ parent })` for a fresh contract on the same `traceId` — they do **not** extend the original contract's TTL.

---

## Why it matters

- **Scout decides; Markovian reasons.** The separation is the point: intent/risk/routing live in Scout, bounded long-horizon execution lives in Markovian. Neither re-implements the other.
- **The contract gates the engine.** Markovian refuses to start on an unsigned, expired, or out-of-scope contract — the same property that makes every Scout handoff auditable applies to the long-horizon path too.
- **Routing is on shape, not content.** Scout flags "this is long and decision-heavy" without reading the migration plan. That is what keeps the decision layer cheap and the reasoning layer where it belongs.

## Next

- [`scout-to-swarm`](../scout-to-swarm/README.md) — the parallel-specialists handoff.
- Markovian's view of long-horizon work: the [Markovian engine folder](https://github.com/meterless/meterless/tree/main/engines/markovian).
