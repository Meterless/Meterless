# 04 — Generate an execution contract

The keystone. Examples [`01`](../classify-simple-intent/README.md)–[`03`](../risk-check/README.md) showed pipeline stages in isolation; this runs all of them and emits the one artifact that matters: a **signed execution contract**. Downstream engines act on this, and nothing else.

Prerequisite reading: [`docs/execution-contract.md`](../../docs/execution-contract.md), [`docs/architecture.md`](../../docs/architecture.md).

---

## Scenario

```text
"Find me the top 5 stuck deals and draft recovery emails."
```

One `scout.decide()` call runs the full Sense → Interpret → Guard → Route → Recommend pipeline and returns a contract a downstream engine can verify and execute.

---

## Walkthrough — `index.ts`

```ts
import { Scout, verifyContract } from "@meterless/scout";

const scout = new Scout({
  intentRegistry: "./intents.json",
  policyPack: "default",
  modelProfiles: "./model-profiles.json",
});

const decision = await scout.decide({
  prompt: "Find me the top 5 stuck deals and draft recovery emails",
  user: { id: "u-123", role: "ae" },
  surface: "chat",
});

const contract = decision.executionContract;

// Downstream boundary: verify signature + expiry BEFORE acting.
const check = verifyContract(contract, { secret: process.env.SCOUT_SECRET });
if (!check.ok) throw new Error(`refused: ${check.reason}`);

console.log(JSON.stringify(contract, null, 2));
```

## Run it

```bash
# The @meterless packages are not yet published — this repository is the
# implementation spec. With a spec-conforming implementation on your import path:
npx tsx ./index.ts
```

## Expected contract (abridged)

```json
{
  "contractId": "01J9Z3K8...",
  "traceId": "tr_4f1a",
  "intent": {
    "primary": { "id": "deal.recover", "confidence": 0.94 },
    "parameters": { "limit": 5, "status": "stuck" },
    "alternates": [{ "id": "deal.report", "confidence": 0.21 }]
  },
  "risk": { "level": "low", "flags": [], "redactions": [], "approvals": [] },
  "toolPlan": [
    { "tool": "world.query", "reason": "locate stuck deals" },
    { "tool": "swarm.run",   "reason": "draft per-deal recovery emails" }
  ],
  "modelProfile": "high_reasoning",
  "scope": {
    "user": { "id": "u-123", "role": "ae" },
    "capabilities": ["world.query", "swarm.run", "email.draft"],
    "budget": { "costMaxUSD": 0.40 }
  },
  "issuedAt":  "2026-05-18T12:00:00Z",
  "expiresAt": "2026-05-18T12:05:00Z",
  "registryVersion": 1,
  "policyPackVersion": "default@3",
  "signature": "hmac-sha256:9c1f…",
  "signedBy": "scout"
}
```

## The three properties that make it a contract, not a function call

| Property | What it buys |
| --- | --- |
| **Scope enforcement** | `scope.capabilities` is the *exact* allowed set. A swarm task that calls a tool outside it is refused at the boundary — by the executor, not a wrapper. |
| **Auditability** | The contract is a durable artifact. Every action traces to the `contractId` that authorized it; replay is a JSON load. |
| **Decoupling** | Agents become *executors of contracts*. Intent/risk/routing live in Scout, not re-implemented in every engine. |

## Verification at the boundary

```text
verifyContract():
  1. recompute HMAC over canonical JSON (minus signature) → must match
  2. now() < expiresAt                                      → else "expired"
  3. required approvals present (for high-risk)             → else "missing-approval"
ok → the engine may run ONLY the tools in scope.capabilities
```

Default TTL is **5 minutes**. A contract past `expiresAt` is refused — stale context (revoked permissions, a policy update) must force a re-decision, not run an old plan. Long work calls `scout.replan({ parent })` for a fresh contract on the same `traceId`.

---

## Why it matters

- **The contract is the only thing downstream trusts.** Swarm, Markovian, H-MEM, World Model never act on a raw prompt. This single property eliminates the whole class of bug where an agent wanders outside its declared scope.
- **Signature is an integrity check, not transport security.** HMAC over canonical JSON catches accidental mutation, misconfigured engines accepting hand-crafted plans, and replay of expired contracts. Swap the signer for a real signing service if you need multi-party guarantees — the interface is pluggable.
- **Short TTL is a feature.** A decision is bound to the context it was made in. Five minutes later that context may be stale; forcing re-decision beats letting old plans rot.

## Next

- [`scout-to-swarm`](../scout-to-swarm/README.md) — this exact contract handed to Swarm, verified before the DAG is built.
- [`route-to-markovian`](../route-to-markovian/README.md) — the long-horizon handoff.
