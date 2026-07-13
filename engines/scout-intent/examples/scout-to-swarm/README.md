# Scout to Swarm

When Scout detects work that needs multiple specialists in parallel, it routes to [Agent Orchestration](https://github.com/meterless/meterless/blob/main/ROADMAP.md). The execution contract becomes the swarm's **scope boundary**: the DAG may only use the tools the contract allows.

> This is the Scout side of Swarm's world-model planning integration — Scout is what hands the swarm its grounded, scoped contract.

Prerequisite reading: [`04 — generate-execution-contract`](../generate-execution-contract/README.md), [Agent Orchestration](https://github.com/meterless/meterless/blob/main/ROADMAP.md).

---

## Scenario

```text
"Audit this codebase for security, performance, and test gaps, then summarize."
```

This is `code.audit` — an intent declaring `swarm.run`. It needs several reviewers working in parallel: that is a DAG, not a single agent.

---

## Walkthrough — `index.ts`

```ts
import { Scout } from "@meterless/scout";
import { Swarm } from "@meterless/swarm";

const scout = new Scout({ intentRegistry: "./intents.json", policyPack: "default" });

const decision = await scout.decide({
  prompt: "Audit this codebase for security, performance, and test gaps, then summarize.",
  user: { id: "u-1", role: "engineer" },
  surface: "chat",
});

// The contract scopes the swarm. The DAG cannot use a tool outside scope.capabilities.
const swarm = new Swarm();
const run = await swarm.startFromContract(decision.executionContract, {
  secret: process.env.SCOUT_SECRET,    // verify BEFORE building the DAG
});

console.log("intent:", decision.intent.primary.id);
console.log("scoped tools:", decision.executionContract.scope.capabilities);
console.log("run:", run.status, "·", run.blackboard["__merged__"]?.slice(0, 60));
```

## Run it

```bash
# The @meterless packages are not yet published — this repository is the
# implementation spec. With a spec-conforming implementation on your import path:
npx tsx ./index.ts
```

## Expected output

```text
intent: code.audit
scoped tools: ["repo.read", "security.scan", "swarm.run"]
swarm: contract verified — building DAG within scope
run: complete · # Audit Summary — 6 findings (1 critical, 2 high) ...
```

## How the contract scopes the DAG

```text
Scout decide → contract.scope.capabilities = ["repo.read", "security.scan", "swarm.run"]
                                   │
Swarm.startFromContract: verify sig + expiry, then PLAN
                                   │
   planner builds DAG ──────────── may only assign tools in scope.capabilities
                                   │
   a task that tries repo.WRITE → refused at the executor boundary (not in scope)
```

Scout decided *what is allowed*; the swarm decided *how to parallelize within that*. Neither overrules the other: the contract is the ceiling, the DAG is the plan under it.

## The result flows back referenced

```text
swarm completes → run.blackboard["__merged__"]
                → returned to the caller tagged with contract.traceId
```

Everything the swarm did traces to the `code.audit` contract that authorized it. A re-audit gets a fresh contract (new `contractId`, same `traceId` lineage if it is a replan).

---

## Why it matters

- **The contract is the swarm's scope ceiling.** A swarm task that tries a tool outside `scope.capabilities` is refused by the executor — not by a wrapper, not by a prompt instruction. Scout's scope decision is *enforced*, not advisory.
- **Two layers, clean boundary.** Scout: which capabilities, which model profile, what risk posture. Swarm: how to decompose and parallelize within that envelope. The handoff is one signed object.
- **Grounded, not hallucinated, parallelism.** The swarm plans *under* a contract that already encodes intent and allowed tools — it cannot invent a step Scout did not authorize. That is the difference between governed orchestration and "spawn N agents."

## Next

- [`route-to-markovian`](../route-to-markovian/README.md) — the long-horizon (not parallel) handoff.
- Swarm's grounded-planning view: the [swarm orchestration engine (a future flagship engine drop; link goes to the roadmap)](https://github.com/meterless/meterless/blob/main/ROADMAP.md).
