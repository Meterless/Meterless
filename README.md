# Meterless

[![License: Apache 2.0](https://img.shields.io/badge/license-Apache_2.0-blue.svg)](LICENSE)
[![Engines](https://img.shields.io/badge/engines-4_specs,_3_runnable-purple.svg)](engines/)
[![Conformance](https://img.shields.io/badge/conformance-suites_included-18E299.svg)](AGENTS.md)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)
<!-- add stars + CI badges after publish: quality.yml is the workflow -->

**The local-first context stack for agentic AI.**

Agents fail on thin context, not weak models. Meterless is the context layer: memory, world modeling, reasoning compression, coordination, execution, and runtime quality, local-first.

The proof runs on your machine in 90 seconds, no API keys: the same 12-step task, cold vs warm. The warm run starts with H-MEM memory and finishes in 8 chunks instead of 12 (output below is real, tokens estimated at chars/4):

<img src="examples/memory-compounding-research/demo.gif" alt="Cold vs warm run: memory saves 4 chunks and 814 estimated tokens" width="820" />

```bash
npx tsx examples/memory-compounding-research/index.ts
```

At 20 steps, the Markovian cost model saves 86% of input tokens vs naive history accumulation (modeled; the worked example is in [engines/markovian/docs/efficiency-model.md](engines/markovian/docs/efficiency-model.md)). Measure it yourself: `cd engines/markovian/reference && npx tsx scripts/measured-run.ts`.

---

## Architecture

<img src="docs/images/meterless-stack.svg" alt="Animated: a request flows from user event through Scout Intent, H-MEM and World Model, Markovian or Swarm, the Runtime Quality Layer, and the product surfaces to verified output — with memory written back" width="820" />

<details>
<summary>Text version</summary>

```text
User / Event
   ↓
Scout Intent
   ↓
H-MEM + World Model
   ↓
Markovian Reasoning or Swarm Coordination
   ↓
Runtime Quality Layer
   ↓
Relay Execution / Gaia Interface / Swarms Output
   ↓
Verified Output + Updated Memory
```

</details>

One architecture. Three product surfaces prove it. Read the full flow in [docs/architecture/stack-overview.md](docs/architecture/stack-overview.md).

---

## Start here

**Implement an engine spec.** The engines are AGENTS.md-driven implementation specs with runnable references and conformance suites. Clone one folder and hand it to your coding agent:

```bash
npx degit meterless/meterless/engines/hmem my-hmem
cd my-hmem/reference && npm install && npm test    # a working reference, green in about a minute
npx tsx ../examples/01-add-memory/index.ts         # watch a memory get mined, stored, audited
```

Your agent is done when the conformance suite passes: `HMEM_IMPL=<your build> npx tsx conformance/runner.ts`.

**Start from a template.** `npx degit meterless/meterless/templates/agentathon-starter my-agent` gives you a memory agent that runs in two minutes ([templates/](templates/)).

**Read the architecture.** Start at [docs/architecture/why-meterless.md](docs/architecture/why-meterless.md).

**Get the products.** Installers live on the app repos: [Gaia](https://github.com/meterless/gaia/releases/latest), [Relay](https://github.com/meterless/relay/releases/latest), [Swarms](https://github.com/meterless/swarms/releases/latest).

---

## Engines

<table>
  <tr>
    <td><a href="engines/hmem/"><img src="engines/hmem/images/H-MEM_Hero_Image.png" alt="H-MEM — memory that remembers, learns, and evolves: a three-tier memory pyramid (short-term, working, long-term) that captures from every interaction, consolidates into lasting knowledge, dreams, sleeps, and audits with a trust ledger" width="410" /></a></td>
    <td><a href="engines/world-model/"><img src="engines/world-model/images/World_Model_Hero_Image.png" alt="World Model — one shared model of your world: documents, conversations, signals, and actions unified into a living graph of entities, contexts, and relationships that powers search, timeline, retrieval, and agents" width="410" /></a></td>
  </tr>
  <tr>
    <td><a href="engines/markovian/"><img src="engines/markovian/images/Markovian_Engine_Hero_Image.png" alt="Markovian Engine — think in steps, win at scale: complex work broken into bounded chunks with safe carryover between steps, O(1) context per step, and drastically fewer tokens than retained-history runs" width="410" /></a></td>
    <td><a href="engines/scout-intent/"><img src="engines/scout-intent/images/Scout_Intent_Hero_Image.png" alt="Scout Intent — sense intent early: see what the user is trying to do before the model spins up by detecting intent from raw input, capturing entities and signals, and spotting ambiguity" width="410" /></a></td>
  </tr>
</table>

| Engine | Role | Status | Verify |
|---|---|---|---|
| [H-MEM](engines/hmem/) | Hierarchical memory and durable context. A knowledge graph that mines, retrieves, dreams, and audits. | Spec + runnable reference | [conformance](engines/hmem/conformance/) |
| [World Model](engines/world-model/) | User, task, and environment state modeling. Event-sourced, with a live operator control plane. | Spec + runnable reference | [conformance](engines/world-model/conformance/) |
| [Markovian](engines/markovian/) | Reasoning compression, state transition, and next-action logic. Flat cost for long horizons. | Spec + runnable reference | [conformance](engines/markovian/conformance/) |
| [Scout Intent](engines/scout-intent/) | Intent detection, risk guarding, tool routing, and signed execution contracts. | Spec | [eval harness](engines/scout-intent/evals/) |

Roadmap: swarm-orchestration, runtime, and fulcrum drop as new engine folders on a monthly cadence. See [ROADMAP.md](ROADMAP.md). Unreleased engines have no folders here yet, by design.

---

## Products

Three product surfaces, one architecture. Binaries are proprietary and ship from the per-app repos. Full docs live here under [docs/products/](docs/products/).

**Gaia** is the personal agent workspace. [Docs](docs/products/gaia/README.md) · [Install](https://github.com/meterless/gaia/releases/latest)

<img src="docs/products/gaia/images/gaia-hero.png" alt="Meterless Gaia" width="720" />

**Relay** is the agent execution layer. [Docs](docs/products/relay/README.md) · [Install](https://github.com/meterless/relay/releases/latest)

<img src="docs/products/relay/images/relay-hero.png" alt="Meterless Relay" width="720" />

**Swarms** is the divergent generation layer. [Docs](docs/products/swarms/README.md) · [Install](https://github.com/meterless/swarms/releases/latest)

<img src="docs/products/swarms/images/swarms-hero.png" alt="Meterless Swarms" width="720" />

---

## Agent-ready

This repo is built to be worked on by coding agents. Every engine is a spec a coding agent can implement, and a conformance suite that proves the agent got it right (`engines/<name>/conformance/`). [AGENTS.md](AGENTS.md) routes an agent to the one folder it needs. [llms.txt](llms.txt) gives non-coding agents the same map. Each engine folder is self-contained, with its own full-length AGENTS.md.

---

## Roadmap

Engines drop monthly as tagged releases on this repo. Next: swarm-orchestration (August 2026), runtime (Q4 2026). Targets, not promises; dates move, the cadence does not. Details in [ROADMAP.md](ROADMAP.md).

---

## Contributing and license

Contributions are welcome. Start with [CONTRIBUTING.md](CONTRIBUTING.md).

Everything in this repo is [Apache 2.0](LICENSE). Product application binaries are proprietary and live in the per-app repos.
