<div align="center">

# Meterless Scout Intent

### **Choose the right move before you act.**

Intent sensing. Risk checks. Tool routing. Recommended action.

[![License: MIT](https://img.shields.io/badge/license-MIT-black.svg?style=flat-square)](./LICENSE)
[![Local-first](https://img.shields.io/badge/local--first-✓-black.svg?style=flat-square)](#why-scout)
[![Eval harness](https://img.shields.io/badge/evals-locked%20regression%20set-black.svg?style=flat-square)](./evals)
[![Engine of the Meterless stack](https://img.shields.io/badge/engine-meterless%20stack-black.svg?style=flat-square)](#compose-with-the-meterless-engine-stack)

**[Quickstart](#quickstart)** · **[Architecture](#architecture)** · **[Evals](#evals)** · **[Examples](#examples)** · **[Compose](#compose-with-the-meterless-engine-stack)**

---

</div>

## Focused clone

Clone just this engine into a fresh folder and hand it to your coding agent:

```bash
npx degit meterless/meterless/engines/scout-intent my-scout-intent
```

Then open the folder in Claude Code or another coding agent and follow this folder's [`AGENTS.md`](AGENTS.md).

| You get | You build |
|---|---|
| The full spec ([`AGENTS.md`](AGENTS.md)), 9 deep-dive docs, 11 examples, 4 workshops, a REAL runnable eval harness with a locked regression set | The engine itself, in your stack; verify it with `SCOUT_IMPL=<path> npm run evals` |

---


> **Status: implementation spec.** This repository is the canonical specification for Scout — the pipeline docs, contract schema, policy-pack design, examples, and eval harness. **`@meterless/scout` is not published to npm; there is no `src/` directory, by design.** The code samples throughout show the specified API surface an implementation must satisfy; the eval harness (fixtures, thresholds, runner) is real and runs against your implementation via `SCOUT_IMPL`.

## The problem

Every agent stack eventually grows a second nervous system bolted to the side of the LLM call: routing tables, tool filters, prompt-injection guards, model selectors, confidence thresholds, retry policies. It starts as three `if` statements. It ends as the buggiest layer in the codebase, sitting between the user and every action the agent ever takes.

Scout is that layer, **built as a first-class engine** instead of accumulated as glue.

Before any model runs, before any tool fires, before any swarm spins up, Scout:

1. **Senses** the user's intent — structured, scored, multi-label
2. **Checks risk** — prompt injection, policy violations, scope drift
3. **Routes tools** — the right capability for this intent, this user, this context
4. **Selects a model** — the right model profile for cost, latency, capability
5. **Emits an execution contract** — a single signed object the downstream system can verify

Then the action runs. With the contract in hand, every step is auditable.

---

## What it is

```
                     ┌──────────────────┐
   user / event ────▶│   1. Sense       │  classify intent (top-k, scored)
                     ├──────────────────┤
                     │   2. Interpret   │  bind entities, parameters, ambiguities
                     ├──────────────────┤
                     │   3. Guard       │  injection · policy · scope · PII
                     ├──────────────────┤
                     │   4. Route       │  capability graph → tool plan
                     ├──────────────────┤
                     │   5. Recommend   │  model profile + execution contract
                     └────────┬─────────┘
                              │
                              ▼
                  signed execution contract
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
        H-MEM            Markovian            Swarm
        (memory)        (long reasoning)   (multi-agent)
```

Scout is a single library. It runs entirely client-side by default. It produces structured output. Downstream engines refuse to act on anything that doesn't carry a valid contract.

---

## Quickstart

This is the specified API. `@meterless/scout` is **not yet published** — you cannot `npm install` it today; the snippet below is the surface a conforming implementation exposes.

```ts
import { Scout } from "@meterless/scout";

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

console.log(decision.intent);            // { primary: "deal.recover", confidence: 0.94 }
console.log(decision.risk);              // { level: "low", flags: [] }
console.log(decision.toolPlan);          // [{ tool: "world.query", ... }, { tool: "swarm.run", ... }]
console.log(decision.executionContract); // signed object the downstream engines accept
```

Five-minute setup. Zero backend required.

[Full quickstart →](./docs/architecture.md#quickstart)

---

## Architecture

Scout's runtime is a five-stage pipeline. Each stage is documented in depth and individually replaceable:

| Stage | Job | Read |
|---|---|---|
| **Intent registry** | The declared catalog of intents your system can handle | [`intent-registry.md`](./docs/intent-registry.md) |
| **Scoring** | Hybrid classifier with confidence bands and clarification triggers | [`scoring.md`](./docs/scoring.md) |
| **Risk & policy** | Injection detection, policy gates, scope checks, PII guards | [`risk-and-policy.md`](./docs/risk-and-policy.md) |
| **Capability graph** | The catalog of tools and what they can do | [`capability-graph.md`](./docs/capability-graph.md) |
| **Model routing** | Picking the model profile that fits this work | [`model-routing.md`](./docs/model-routing.md) |
| **Execution contract** | The signed handoff to downstream engines | [`execution-contract.md`](./docs/execution-contract.md) |

Operations:

- [Eval harness](./docs/eval-harness.md) — the locked regression set and the metrics that gate releases
- [Telemetry and learning](./docs/telemetry-and-learning.md) — what gets logged, how the system improves

---

## Evals

**This is the unique asset of this repo.** Scout's whole job is making decisions. If you can't measure decision quality, you don't have an intent layer — you have a rubber stamp.

Scout ships with a complete evaluation harness:

- **Locked regression set** — versioned `prompt → expected intent / risk / tool plan` fixtures (v1 is a 32-example smoke set; ≥ 50 per intent family is the growth target before the thresholds count as measured)
- **Gated metrics** — intent top-1, intent top-3 recall, injection detection precision/recall, tool selection precision, clarification rate, user override frequency
- **Slice reports** — performance broken down by surface, user role, intent family, risk class
- **Drift detection** — alert when distribution shifts beyond a threshold (planned, see [roadmap](./ROADMAP.md))

Run it against your implementation of the spec:

```bash
SCOUT_IMPL=/path/to/your/scout npm run evals   # full suite
npm run evals:intent      # intent-only
npm run evals:injection   # adversarial set
npm run evals:report      # markdown report
```

See [`evals/`](./evals) and [`docs/eval-harness.md`](./docs/eval-harness.md).

---

## Examples

| Example | What it shows |
|---|---|
| [`01-detect-intent`](./examples/classify-simple-intent) | Single-prompt classification with scores and confidence bands |
| [`02-detect-multi-intent`](./examples/detect-multi-intent) | Prompts that carry two or three intents at once |
| [`03-risk-check`](./examples/risk-check) | Policy gates, scope checks, PII detection |
| [`04-generate-execution-contract`](./examples/generate-execution-contract) | The full pipeline → signed contract |
| [`prompt-injection-block`](./examples/prompt-injection-block) | Detecting and refusing an injection at the intent layer |
| [`tool-plan-generation`](./examples/tool-plan-generation) | Capability graph → multi-step tool plan |
| [`model-profile-routing`](./examples/model-profile-routing) | Routing to cheap vs. capable models based on intent |
| [`route-to-markovian`](./examples/route-to-markovian) | Scout decides: this is a long-horizon task → Markovian |
| [`scout-to-swarm`](./examples/scout-to-swarm) | Scout decides: this needs multiple specialists → Swarm |
| [`scout-to-world-model`](./examples/scout-to-world-model) | Scout issues a scoped context plan → World Model answers it |
| [`query-hmem-before-action`](./examples/query-hmem-before-action) | Pull memory before deciding the plan |

---

## Why Scout

**A separate decision layer.** Tool routing, model selection, and policy enforcement should not be re-implemented in every agent. Scout pulls them out into one library with one contract.

**Signed execution contracts.** Downstream engines refuse to act on unsigned plans. That single property eliminates an entire class of bug where agents wander outside their declared scope.

**Locked regression set.** Every change to the intent registry, scoring pipeline, or policy pack runs against versioned fixtures. Releases are gated by metrics, not vibes.

**Glass-box decisions.** Every decision emits structured telemetry — what was scored, what was blocked, what was routed where, with confidence. Downstream replay is trivial.

**Local-first.** The classifier, the guard, and the router run client-side by default. Models can be local (WebLLM) or remote (BYOK). The decision layer is yours.

---

## Compose with the Meterless engine stack

Scout is one of five engines. They compose:

```
User / Event
   ↓
Scout Intent
   ↓
H-MEM + World Model
   ↓
Markovian Engine or Agent Orchestration
   ↓
Verified Output / Action / Updated Memory
```

- **H-MEM** gives agents memory.
- **World Model** gives applications shared state.
- **Scout Intent** decides what should happen next.
- **Markovian Engine** handles long work in bounded chunks.
- **Agent Orchestration** coordinates many agents into governed outcomes.

Scout sits at the front. Every other engine is downstream of its execution contract. See [`examples/route-to-markovian`](./examples/route-to-markovian), [`examples/scout-to-swarm`](./examples/scout-to-swarm), and [`examples/query-hmem-before-action`](./examples/query-hmem-before-action) for the integration patterns.

---

## Roadmap

- Streaming intent detection (decide as the user types)
- Curriculum learning loop from operator overrides
- Multi-modal intent (image + text)
- Distillation of remote classifiers into local models
- Visual policy editor

[Open roadmap →](./ROADMAP.md)

---

## Workshops

Education-first, in the spirit of 12-Factor Agents:

- [Workshop 01 — Build your first intent registry](./workshops/01-build-an-intent-registry.md)
- [Workshop 02 — Block your first injection](./workshops/02-block-an-injection.md)
- [Workshop 03 — Route to the right downstream engine](./workshops/03-route-downstream.md)
- [Workshop 04 — Lock in evals and ship safely](./workshops/04-lock-in-evals.md)

---

## Contributing

- 🐛 [Report a bug](https://github.com/meterless/meterless/issues)
- 💡 [Propose an intent or policy](https://github.com/meterless/meterless/issues)
- 📖 [Contributor guide](./CONTRIBUTING.md)

---

## License

MIT.

---

<div align="center">

**Choose the right move before you act.**

Part of the [Meterless engine stack](https://github.com/meterless/meterless) · [meterless.ai](https://www.meterless.ai)

</div>
