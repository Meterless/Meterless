# Risk and policy

The guard stage. The job: refuse to act on requests that shouldn't be acted on, without making the system unusable for legitimate ones.

## What gets checked

```
                 ┌────────────────────────┐
                 │  Guard stack           │
   intent ─────▶ │  ┌──────────────────┐  │
                 │  │ injection check  │  │
                 │  ├──────────────────┤  │
                 │  │ policy gate      │  │  ──▶ allow / warn / block
                 │  ├──────────────────┤  │
                 │  │ scope check      │  │
                 │  ├──────────────────┤  │
                 │  │ PII / sensitive  │  │
                 │  ├──────────────────┤  │
                 │  │ rate limit       │  │
                 │  └──────────────────┘  │
                 └────────────────────────┘
```

Each layer is independent. Each returns `pass`, `warn`, or `block` plus a structured reason.

## 1. Injection check

Detects prompt injection. Multi-layered:

- **Pattern match** — known injection strings, role-confusion markers ("ignore previous instructions"), embedded-control attempts (`</system>`, `[INST]`)
- **Role drift** — the user is asking the agent to adopt a different role or system prompt
- **Out-of-band tool refs** — the user is asking for tools that aren't reachable from the current intent's capability set
- **Model-based check** — small classifier trained on labeled injection corpus

Output:

```ts
{ injection: { detected: boolean, kind: "pattern" | "role-drift" | "tool-ref" | "model", score: number, evidence: string[] } }
```

Detected injections do not get logged with their full payload by default — only metadata. Configurable per-deployment.

## 2. Policy gate

RBAC plus declarative policy.

```yaml
# policies/deal.recover.yaml
intent: deal.recover
allow:
  roles: [ae, csm, sales-leader]
  surfaces: [chat, inbox]
  params:
    count: { max: 20 }
deny:
  param-combinations:
    - { channel: "call", count: { gt: 5 } }  # never bulk-call
require-approval:
  - { stage: "closed-won" }  # don't touch closed-won deals without approval
```

The gate evaluates each rule in order. First matching `deny` blocks. Any `require-approval` lifts the contract into a review-required state.

## 3. Scope check

Even if the policy gate allows, scope check asks: **does this intent fit this conversation?**

- Surface match — `deal.recover` on the public marketing chat? Block.
- Session continuity — three turns ago the user was researching personal travel; now they're trying to delete an account. Mismatch flag.
- Recency — too many high-risk actions in too short a window from the same user.

Scope flags don't block by default. They lift the risk level by one band, which often triggers approval requirements downstream.

## 4. PII / sensitive

Detects:

- **PII** — emails, phone numbers, SSNs, credit cards, addresses
- **Credentials** — API keys, tokens, passwords
- **Health / financial** — HIPAA / PCI markers

Two responses:

- **Redact** — replace in the prompt before downstream gets it
- **Block** — reject the request

Configurable per-intent and per-data-class. The default is "redact aggressively, log nothing."

## 5. Rate limit

Per-user, per-intent, per-tool, per-surface rate limits. Each is a token bucket. Excess gets blocked or queued depending on intent.

This is the layer that prevents the "thousand-email bug" — a misclassified prompt that would otherwise launch a mass action.

## Composition: the level

The guard stack reduces to a single `level` and a list of `flags`:

```ts
type Risk = {
  level: "low" | "medium" | "high" | "block";
  flags: RiskFlag[];
  redactions: Redaction[];
  reason?: string;
  approvalsRequired?: ApprovalSpec[];
};
```

Reduction rules:

- Any layer `block` → `level: "block"`.
- Any layer `warn` → lift by one band (low → medium, medium → high).
- High-risk intent + medium/high level → `approvalsRequired`.

## Failure mode: false positives

A safety system that blocks legitimate work gets disabled. Scout's design choice: **warn loudly, block sparingly**.

- Pattern injection check has a tight precision target (>0.95). False positives must be rare.
- Policy gates are explicit. No "we think this might be against policy" — either a rule matched or it didn't.
- Scope flags are advisory. They lift risk, they don't block.
- Rate limits are per-intent. Generic "you're using the agent too much" doesn't exist.

When in doubt, warn and log. Operator review > silent block.

## Failure mode: false negatives

Worse than annoying — actually unsafe. Mitigations:

- **Adversarial regression set.** The eval harness includes a locked corpus of injection attempts. Releases that drop precision/recall on it don't ship.
- **Defense in depth.** Downstream engines (Swarm, World Model write surface) re-verify the contract scope. If Scout misses an injection that produces a tool plan outside scope, the downstream engine refuses.
- **Telemetry on every block.** Patterns get reviewed weekly. New variants make it into the next eval set.

## Policy packs

A **policy pack** is a versioned bundle of injection patterns, RBAC rules, scope rules, and PII detectors. Scout ships with:

- `default` — general-purpose, conservative defaults
- `enterprise` — RBAC-heavy, approval-led, audit-first
- `regulated` — HIPAA / PCI / FedRAMP-aware redactions
- `adversarial-tight` — hardened injection posture for hostile surfaces; the eval runner composes it with `default` when scoring the adversarial set

Packs are named and versioned; the pack version is stamped on every contract (`policyPackVersion: "default@3"`). You can compose:

```ts
const scout = new Scout({
  policyPack: ["default", "enterprise", "./custom-policies.yaml"],
});
```

Custom packs are evaluated against the same eval harness.

## What's next

- [Capability graph](./capability-graph.md) — what happens after the guard passes
- [Execution contract](./execution-contract.md) — how risk gets carried forward
- [Eval harness](./eval-harness.md) — the adversarial set
