# Model routing

Pick the right model for the work. Cheap for classification, capable for synthesis, local for sensitive data, fast for streaming, careful for high-risk.

## Model profiles

A **model profile** declares a model with its constraints and cost. Scout's model router picks a profile per task in the plan based on the intent, the risk class, and the deployment context.

```json
{
  "id": "default-fast",
  "provider": "openai",
  "model": "gpt-4.1-nano",
  "context": 128000,
  "cost": { "in": 0.0001, "out": 0.0004 },
  "latency": { "p95Ms": 800 },
  "capabilities": ["text", "function-calling"],
  "dataClasses": ["public"]
}
```

```json
{
  "id": "local-capable",
  "provider": "webllm",
  "model": "llama-3.1-8b-instruct",
  "context": 32000,
  "cost": { "in": 0, "out": 0 },
  "latency": { "p95Ms": 4000 },
  "capabilities": ["text", "json-mode"],
  "dataClasses": ["public", "internal", "confidential", "restricted"]
}
```

## Routing rules

The router scores profiles against the request:

1. **Compatibility** — the profile must support the capabilities the task needs (function calling, JSON mode, vision).
2. **Data class** — the profile must be cleared for the data class of the input.
3. **Context budget** — the profile must fit the full prompt + carryover.
4. **Cost target** — if a budget is set, prefer profiles under it.
5. **Latency target** — same.
6. **Quality target** — risk-class `high` intents prefer high-quality profiles.

Default tie-break: local profiles win over remote when data class is `confidential` or `restricted`.

## Per-task routing

A single execution contract often has multiple tasks. Each gets routed independently.

```
task: classify_intent      → profile: default-fast
task: extract_entities     → profile: default-fast
task: draft_recovery_email → profile: default-capable
task: verify_compliance    → profile: local-capable  (data class: confidential)
```

## Fallback chains

Profiles can declare fallbacks. If the primary fails (rate limit, network, model error), the router tries the next.

```json
{
  "id": "default-fast",
  "fallbacks": ["default-capable", "local-fast"]
}
```

Fallbacks must satisfy the same data-class constraint. A profile cleared only for `public` data won't be used as a fallback for `confidential` data, even if its primary is.

## Cost ceilings

You can declare a cost ceiling per intent or per surface:

```yaml
costCeilings:
  intent.deal.recover:
    perInvocation: 0.05  # USD
  surface.chat:
    perDay: 5.00
```

The router rejects any plan whose estimated cost exceeds the ceiling. The estimation uses token counts at plan time; the surface gets back a structured "cost ceiling" error if there's no fitting profile.

## Local-first defaults

Scout ships with two default chains:

- **Local-first chain** — `local-fast` → `local-capable` → `remote-fast`
- **Cloud-first chain** — `remote-fast` → `remote-capable` → `local-capable`

The local-first chain is the default. To opt into cloud-first, set `routing: "cloud-first"` in the config.

## BYOK model

Every remote profile requires user-supplied API keys. Scout doesn't proxy. There's no Meterless-hosted model gateway. The key lives client-side; the call goes direct to the provider.

The execution contract records *which profile* ran each task, never the key. Telemetry stays local-first.

## Why route at the Scout layer

Putting model selection inside agent code couples each agent to a model. Changing models means rewriting agents. Putting it in Scout means:

- A single config change rolls a new model across every intent that uses that profile.
- Cost ceilings are enforced before execution, not after the bill arrives.
- Data-class compliance is enforceable at the boundary.
- The eval harness can measure *whether the right profile got picked*, not just whether the output is good.

## What's next

- [Execution contract](./execution-contract.md) — how profile selection gets carried forward
- [Eval harness](./eval-harness.md) — measuring routing decisions
- [Telemetry and learning](./telemetry-and-learning.md) — using routing data to improve
