# Architecture

Scout is a five-stage decision pipeline that runs **before** every meaningful action your system takes. Its output is a single signed object — the execution contract — that downstream engines verify before they do anything.

This document is the map. Each stage has its own doc going deeper.

## The shape

```
                        Scout pipeline
   ┌─────────────────────────────────────────────────────────┐
   │                                                         │
   │  ┌─────────┐   ┌──────────┐   ┌────────┐                │
   │  │  Sense  │──▶│ Interpret│──▶│ Guard  │                │
   │  └─────────┘   └──────────┘   └────┬───┘                │
   │                                    │                    │
   │                                    ▼                    │
   │                              ┌──────────┐               │
   │                              │  Route   │               │
   │                              └────┬─────┘               │
   │                                   ▼                     │
   │                              ┌──────────┐               │
   │                              │Recommend │               │
   │                              └────┬─────┘               │
   └───────────────────────────────────┼─────────────────────┘
                                       ▼
                          ┌─────────────────────────┐
                          │  execution contract     │
                          │  (signed, structured)   │
                          └────────────┬────────────┘
                                       │
                  ┌────────────────────┼────────────────────┐
                  ▼                    ▼                    ▼
                H-MEM            Markovian               Swarm
              (memory)         (long reasoning)      (multi-agent)
```

## Five stages

### 1. Sense

Classify intent from the raw input in two stages: a **Stage-1 deterministic trigger scan** over the full registry (always on, < 16 ms with a startup self-test) plus an optional **Stage-2 hybrid rescoring** with a small local model and contextual signals. Produces a **top-k list of scored intents**, not a single label.

Output:

```ts
{ candidates: [
  { intent: "deal.recover", score: 0.94 },
  { intent: "deal.query",   score: 0.31 },
  { intent: "email.draft",  score: 0.22 },
]}
```

See [`scoring.md`](./scoring.md).

### 2. Interpret

Bind entities and parameters from the prompt to the top intent. Resolve ambiguity. Decide if a clarification is needed.

Output:

```ts
{
  intent: "deal.recover",
  parameters: { count: 5, channel: "email" },
  references: { campaign: "renewal-q2-2026" },
  needsClarification: false,
}
```

### 3. Guard

Run the request through the policy stack:

- **Injection detection** — known patterns, model-based detection, role-confusion heuristics
- **Policy gates** — RBAC, scope checks, per-tool allowlists
- **Scope drift** — does this intent fit this user, this surface, this session?
- **PII / sensitivity** — redact or block based on data class

Output:

```ts
{ level: "low" | "medium" | "high" | "block",
  flags: [],
  redactions: [],
  reason?: string }
```

See [`risk-and-policy.md`](./risk-and-policy.md).

### 4. Route

Walk the **capability graph** to assemble a tool plan. Each intent declares the capabilities it needs; capabilities resolve to specific tools at runtime based on availability, permissions, and context.

Output:

```ts
{ toolPlan: [
  { tool: "world.query", input: {...} },
  { tool: "swarm.run",   input: {...} },
]}
```

See [`capability-graph.md`](./capability-graph.md).

### 5. Recommend

Pick the **model profile** — cheap fast model for classification, capable model for synthesis, local model for sensitive data. Bundle the whole decision into a signed execution contract.

Output: see [`execution-contract.md`](./execution-contract.md).

## The execution contract

The contract is the only thing downstream engines accept. It is:

- **Structured** — schema-versioned, typed
- **Signed** — HMAC over the canonical encoding
- **Replayable** — every decision can be reconstructed from telemetry
- **Auditable** — every contract has a trace ID and lineage

Engines refuse to act without a valid, fresh, scope-matching contract.

## Quickstart

```ts
import { Scout } from "@meterless/scout";

const scout = new Scout({
  intentRegistry: "./intents.json",
  policyPack: "default",
  modelProfiles: "./model-profiles.json",
});

const decision = await scout.decide({
  prompt: "Find stuck deals and draft recovery emails",
  user: { id: "u-123", role: "ae" },
  surface: "chat",
});

if (decision.risk.level === "block") {
  return { error: "blocked", reason: decision.risk.reason };
}

const result = await runDownstream(decision.executionContract);
```

## What's next

- [Intent registry](./intent-registry.md) — declaring what your system can do
- [Scoring](./scoring.md) — how candidate intents are ranked
- [Risk and policy](./risk-and-policy.md) — guards, gates, and refusals
- [Capability graph](./capability-graph.md) — intents → tools
- [Model routing](./model-routing.md) — picking the right model
- [Execution contract](./execution-contract.md) — the handoff format
- [Eval harness](./eval-harness.md) — how releases are gated
- [Telemetry and learning](./telemetry-and-learning.md) — the feedback loop
