# Telemetry and learning

Every decision Scout makes emits structured telemetry. That telemetry is the feedback loop that keeps the system honest.

## What gets logged

Every contract issuance produces a trace:

```
trace_id: 01HE7K9...
contract_id: 01HE7K9...
issued_at: 2026-05-18T12:34:56Z
user: { id: "u-123", role: "ae" }
surface: chat
prompt_hash: sha256:...        # raw prompt NEVER logged by default
intent_top1: deal.recover (0.94)
intent_top3: [deal.recover, deal.query, email.draft]
risk_level: medium
risk_flags: []
tool_plan: [world.query, swarm.run, email.draft]
model_profile: default-capable
latency_ms: { sense: 18, interpret: 32, guard: 22, route: 8, recommend: 4 }
clarification_triggered: false
override_after: null
```

Downstream verifications add events:

```
contract.verified by=swarm at=...
contract.verified by=world-model at=...
contract.expired by=markovian at=...
contract.refused by=email reason=approval-missing
```

User overrides add events:

```
override.intent contract=... from=deal.recover to=deal.query by=u-123
override.tool   contract=... from=email.draft to=email.send by=u-123 (with-approval)
```

## What's *not* logged

By default, Scout never logs:

- The raw prompt
- User-supplied parameter values
- Tool inputs and outputs
- API keys, credentials, PII

The telemetry is **shape data**, not content. You can answer "is the classifier accurate," "are users overriding deal intents more this month," "is the injection detector firing on new patterns" — without the content of any single user's request.

Configurable: deployments that want fuller logging (with proper compliance) can flip flags per data class.

## Storage

Telemetry is local-first by default. It writes to a local store and stays there until you choose to ship it.

Options:

- **Local-only** — telemetry stays on the device, queryable via the local dashboard (planned — see below)
- **Local + redacted aggregate** — daily aggregates ship to a backend; per-request data stays local
- **Centralized** — all telemetry ships to a backend (with explicit user consent)

The default is local-only. Switching modes requires explicit configuration.

## The learning loop

```
production telemetry
        │
        ▼
   drift detector  ──▶ alert if metrics shift
        │
        ▼
   curation queue  ──▶ flagged prompts (anonymized) for label review
        │
        ▼
   labeler pass    ──▶ labels added by reviewers
        │
        ▼
   regression set  ──▶ new examples versioned into the set
        │
        ▼
   classifier retrain  ──▶ new model
        │
        ▼
   eval gate       ──▶ ship or reject
```

The loop is **opt-in per deployment**. Local-only deployments don't ship anything. Deployments that opt in ship aggregates and a curation queue, never raw prompts.

## Overrides as gold labels

User overrides are the single most valuable signal. When a user changes Scout's decision, they're labeling a hard example for free.

Override events get higher curation priority. Patterns of overrides (same intent, same user role, repeated wrong direction) become candidates for:

- Updated intent examples in the registry
- New rule patches in the keyword layer
- Adjusted scoring weights per surface

All changes go through the eval harness before shipping.

## Local-first dashboard

Every Scout installation should be able to render its own telemetry locally. A reference dashboard is planned (see the [roadmap](../ROADMAP.md)); the specified operator surface shows:

- Top intents by volume
- Confidence distribution
- Clarification rate over time
- Override rate by intent
- Risk-level breakdown
- Slow stages (latency drill-down)

This is the operator surface for understanding what your Scout deployment is actually doing. No telemetry leaves the machine.

## Anti-patterns

- **Logging the prompt by default.** Even with consent. The system has to *not need it* to be safe.
- **Treating telemetry as a database.** Telemetry is for analysis and improvement. It's not the source of truth for any user-facing state.
- **Tightening thresholds based on aggregate metrics.** Use slice reports; aggregates lie.
- **Skipping the eval gate when the learning loop improves a metric.** The gate is the gate. Improved metrics still need full slice review.

## What's next

- [Eval harness](./eval-harness.md) — where curated examples go
- [Architecture](./architecture.md) — the overall picture
