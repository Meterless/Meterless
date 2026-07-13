# Tool plan generation

The Route stage. Scout maps an intent to **capabilities**, not concrete tools — then resolves capabilities to whatever tool adapters exist in *this* environment. That indirection is what makes a Scout plan portable across stacks.

Prerequisite reading: [`docs/capability-graph.md`](../../docs/capability-graph.md).

---

## Scenario

The `deal.recover` intent declares three capabilities. Two tools are registered for them; one capability has no adapter available — Scout must produce a structured error, not a silent gap.

```text
intent deal.recover  declares: world.query, swarm.run, email.draft
registered tools:     crm.search → world.query
                      swarm.run  → swarm.run
                      (nothing)  → email.draft   ← unresolved
```

---

## Walkthrough — `index.ts`

```ts
import { Scout } from "@meterless/scout";

const scout = new Scout({ intentRegistry: "./intents.json", policyPack: "default" });

// Tools register against CAPABILITIES, not intents.
scout.tools.register("crm.search", {
  capability: "world.query", costUSD: 0.002, latencyMs: 120, surface: "server",
});
scout.tools.register("swarm.run", {
  capability: "swarm.run", costUSD: 0.05, latencyMs: 4000, surface: "server",
});
// note: nothing registered for capability "email.draft"

const decision = await scout.decide({
  prompt: "recover the top 5 stuck deals",
  user: { id: "u-1", role: "ae" },
  surface: "chat",
});

console.log(decision.toolPlan);
console.log("unresolved:", decision.unresolvedCapabilities);
```

## Run it

```bash
# The @meterless packages are not yet published — this repository is the
# implementation spec. With a spec-conforming implementation on your import path:
npx tsx ./index.ts
```

## Expected output

```text
[
  { tool: "crm.search", capability: "world.query", reason: "locate stuck deals" },
  { tool: "swarm.run",  capability: "swarm.run",   reason: "draft recovery emails in parallel" }
]
unresolved: [
  { capability: "email.draft", error: "no_adapter", severity: "warn" }
]
```

## The selection algorithm

```text
1. candidate capabilities  ← union of capabilities from top-k intents
2. policy/risk filter      ← drop anything disallowed by the guard verdict
                              (a high-risk run loses shell / fs-write / egress)
3. rank by utility         ← availability, cost, latency, confidence, surface fit
4. resolve to tools        ← capability → registered adapter
5. unresolved → structured ← no adapter = a typed warning, never a silent skip
```

`world.query` resolved to `crm.search` because it was the registered adapter on this stack. On a different deployment it might resolve to a local AST service or a remote index — **the intent and the plan do not change; only the resolution does.**

## Why capabilities, not tools

| Without the indirection | With the capability graph |
| --- | --- |
| Intent hardcodes `crm.search` | Intent declares `world.query` |
| Plan breaks on a stack without that tool | Plan is portable; the adapter resolves locally |
| Risk filter must know every tool name | Risk filter operates on capability classes |

## Unresolved is a signal, not a crash

`email.draft` had no adapter. Scout did **not** drop it silently and did **not** throw — it emitted a structured `unresolved` entry. The downstream system decides: degrade (skip the email step), prompt the operator to register an adapter, or refuse the contract. The decision is explicit and on the record.

---

## Why it matters

- **Capabilities make Scout portable.** The same `deal.recover` plan runs on a local-first laptop and a cloud deployment because the intent commits to *what* (a capability), never *which tool*. Resolution is an environment concern.
- **Risk filtering happens before ranking.** A high-risk verdict strips dangerous capabilities *before* the ranker ever sees them — a blocked capability cannot be reintroduced later by a high utility score. Order is the safety guarantee (see [`prompt-injection-block`](../prompt-injection-block/README.md)).
- **A missing tool is a typed outcome.** Silent capability gaps are how agents quietly do half a task. The structured `unresolved` entry forces an explicit decision instead of an invisible omission.

## Next

- [`model-profile-routing`](../model-profile-routing/README.md) — the parallel decision: which model profile runs this plan.
- [`scout-to-swarm`](../scout-to-swarm/README.md) — the `swarm.run` step handed off as a scoped contract.
