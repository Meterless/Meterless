# Meterless Roadmap

Engines drop as new folders under `engines/`, each with a tagged release (`<engine>-v<semver>`) and its own announcement. Target cadence: monthly.

## Shipped

| Engine | Status |
|---|---|
| H-MEM | Spec available at `engines/hmem/` |
| World Model | Spec available at `engines/world-model/` |
| Markovian | Spec available at `engines/markovian/` |
| Scout Intent | Spec available at `engines/scout-intent/`, with a runnable eval harness |

## Next drops

| Engine | Role | Status |
|---|---|---|
| swarm-orchestration | DAG planning, dynamic specialists, merge and verify | Target: August 2026 |
| runtime | Quality, cost, and latency routing and execution substrate | Target: Q4 2026 |
| fulcrum | To be announced | Planned |

Targets, not promises. Dates move; the cadence does not. Unreleased engines have no folders in this repo; a folder appears on drop day with the full spec.

## Docs and templates

- Agent-ready guides for more coding agents
- [x] Hackathon starter shipped: `templates/agentathon-starter/` (memory notebook agent, runs in two minutes, no keys)
- [x] First cross-stack example shipped: `examples/memory-compounding-research/` (H-MEM + Markovian, runnable, no keys)

## Future gates

- `apps/<name>/` appears only on the day an app ships open source. Swarms Lite is the expected first candidate.
- `packages/` (CLI, SDK, MCP server) appears only when working code exists.
- `evals/` and `benchmarks/` appear only with real harnesses and real data.
