# Execution contract

The execution contract is the **only thing downstream engines accept**. Swarm, Markovian, H-MEM, World Model — none of them act on a raw user prompt. They act on contracts.

This is the single most important property in the Scout design.

## The shape

```ts
type ExecutionContract = {
  // Identity
  contractId: string;            // ULID, monotonic
  parentId?: string;             // for re-planning, refinements
  traceId: string;               // for telemetry correlation

  // Decision
  intent: {
    primary: IntentRef;
    parameters: Record<string, unknown>;
    references: Record<string, EntityRef>;
    confidence: number;
    alternates: IntentCandidate[];
  };

  // Risk
  risk: {
    level: "low" | "medium" | "high";
    flags: RiskFlag[];
    redactions: Redaction[];
    approvals: ApprovalRecord[];
  };

  // Plan
  toolPlan: ToolStep[];
  modelProfile: ModelProfileRef;

  // Scope
  scope: {
    user: UserRef;
    surface: string;
    capabilities: CapabilityRef[];  // exact set, enforced downstream
    deadline?: ISODate;
    budget?: { tokensMax?: number; costMaxUSD?: number };
  };

  // Provenance
  issuedAt: ISODate;
  expiresAt: ISODate;
  registryVersion: number;
  policyPackVersion: string;

  // Signature
  signature: string;             // HMAC over canonical encoding
  signedBy: "scout";
};
```

## Why a contract, not a function call

Three reasons.

**1. Scope enforcement.** A function call says *what to do*. A contract says *what's allowed*. Downstream engines verify that every tool they invoke is in the contract's `capabilities` set. A swarm task that tries to call a tool outside scope gets refused at the boundary — not stopped by a wrapper, refused by the executor.

**2. Auditability.** A function call is a transient event. A contract is a durable artifact. Every action your system takes can be traced back to a specific contract, with the exact intent, risk assessment, and plan that authorized it. Replay is trivial.

**3. Decoupling.** Without a contract, every agent has to re-implement intent classification, risk checks, and routing. With a contract, all that lives in Scout. Agents become **executors of contracts** — much simpler, much more testable.

## Signing

The contract is signed with HMAC over the canonical JSON encoding:

```
signature = HMAC_SHA256(secret, canonical_json(contract_without_signature))
```

The secret is per-deployment, stored locally. Downstream engines verify on receipt.

This is not a cryptographic-grade defense — it's an **integrity check** that catches:

- Accidental mutation of the contract in transit between modules
- Misconfigured downstream engines accepting hand-crafted plans
- Replay of expired contracts after `expiresAt`

If you need stronger guarantees (multi-party signing, distributed enforcement), swap the signer for a real signing service. The interface is pluggable.

## Expiration

Contracts expire. Default TTL is 5 minutes. Downstream engines refuse contracts past `expiresAt`.

Why short: a contract represents a decision made with specific context. Five minutes later, the context may have changed — the user revoked permissions, the data class shifted, a policy update went live. The short TTL forces re-decision instead of letting old plans rot.

Long-running work (a research swarm, a multi-day reflection) **refreshes** contracts: each new chunk or phase asks Scout for a fresh contract bound to the current parent.

## Re-planning

When a downstream engine can't fulfill a step (a tool went offline, a confidence threshold tightened, a verification failed), it doesn't muddle through. It calls Scout again with the original contract as `parentId` and a `reason` for re-planning.

```ts
const replanned = await scout.replan({
  parent: originalContract.contractId,
  reason: "tool.email.send unavailable",
  state: currentState,
});
```

The new contract has the same trace ID. Telemetry tracks the chain.

## Approval records

For `high`-risk intents or any contract that triggered `requireApproval`, the contract carries an `approvals` array:

```ts
[
  { kind: "user-confirm", at: "2026-05-18T12:34:56Z", confirmation: "yes" },
  { kind: "operator-review", by: "operator-7", at: "...", decision: "approve" },
]
```

Engines verify required approvals are present before acting. Missing approval → refused.

## Telemetry hooks

Every contract emits structured telemetry at issue time and on every downstream verification:

```
contract.issued      contractId=… intent=… risk=… profile=… latencyMs=…
contract.verified    contractId=… engine=swarm verified=true
contract.expired     contractId=… engine=markovian
contract.refused     contractId=… engine=world-model reason=scope-mismatch
```

See [`telemetry-and-learning.md`](./telemetry-and-learning.md).

## Anti-patterns

- **Don't add fields downstream.** The contract is immutable post-signature. Adding fields means re-issuing.
- **Don't extend TTL.** If a long task needs more time, refresh the contract. Don't move the goalposts.
- **Don't accept unsigned contracts.** Even in dev. Make signature verification mandatory at every boundary.
- **Don't store contracts as the system of record.** They're a handoff format, not a database. Persist telemetry; the contracts themselves are short-lived.

## What's next

- [Eval harness](./eval-harness.md) — measuring contract quality
- [Telemetry and learning](./telemetry-and-learning.md) — what the contract trail teaches you
