# Scout vs. the alternatives

Where Scout fits and where it doesn't.

## vs. LangChain Agents / CrewAI / AutoGen routing

| | Scout | LangChain Agents |
|---|---|---|
| First-class decision engine | ✓ | ⚠ embedded in agent code |
| Signed execution contracts | ✓ | ✗ |
| Versioned regression set | ✓ | ✗ |
| Pluggable into multiple agent frameworks | ✓ | ✗ coupled |
| Policy gates at the boundary | ✓ | ⚠ per-agent |
| Local-first by default | ✓ | ⚠ |

**Use Scout when:** your routing/policy/safety logic deserves its own test surface and lifecycle.
**Use framework routing when:** you have one agent doing one job and never plan to add another.

## vs. Guardrails / NeMo Guardrails

| | Scout | Guardrails libraries |
|---|---|---|
| Intent classification | ✓ | ⚠ pattern-only |
| Tool routing | ✓ | ✗ |
| Model selection | ✓ | ✗ |
| Injection detection | ✓ | ✓ |
| PII redaction | ✓ | ✓ |
| Signed contracts for downstream | ✓ | ✗ |
| Locked regression set with gated CI | ✓ | ⚠ |

**Use Scout when:** you need the whole decision pipeline — intent + risk + routing + model.
**Use guardrails libraries when:** you only need output filtering and your routing is solved elsewhere.

Scout *composes* with them — Scout's policy pack can call out to a guardrails library for specific checks.

## vs. OPA / policy engines

| | Scout | OPA |
|---|---|---|
| Generic policy evaluation | ⚠ | ✓ |
| AI-specific patterns (injection, PII, role drift) | ✓ | ⚠ build your own |
| Intent classification | ✓ | ✗ |
| Tool routing | ✓ | ✗ |
| Execution contracts for downstream engines | ✓ | ✗ |

**Use Scout when:** you need a decision layer for AI systems specifically.
**Use OPA when:** you need generic policy-as-code for a service mesh, infra, etc.

These compose cleanly. Scout's policy stage can defer to OPA for organization-wide rules and add AI-specific checks on top.

## vs. building your own decision layer

| | Scout | DIY |
|---|---|---|
| Time to first decision | minutes | weeks |
| Regression set | included | you build it |
| Adversarial corpus | included | you curate it |
| Sliced metrics | included | you instrument it |
| Capability graph | included | you design it |
| Schema-versioned intents | included | you version them |
| Model routing with cost ceilings | included | you implement them |

**Use Scout when:** you'd otherwise spend a quarter building this and another quarter regretting how you built it.
**Use DIY when:** your needs are so specific that nothing on the shelf maps cleanly.

## The honest summary

Scout is opinionated. It's good at one specific layer: **the decision pipeline that runs before every meaningful action your AI system takes**. If that's what you need, the alternatives all require you to assemble two or three of them and write the glue yourself.

If you don't need a decision layer — single-agent demo, one-shot script, no policy concerns — Scout is overkill. Use the right tool.

For everything in between: Scout, with the rest of the [Meterless stack](https://github.com/meterless/meterless) downstream.
