# Agent Instructions for Meterless

Meterless turns the computer you already own into an AI hotspot. Nightshift is the flagship product. This repo is the open core: the engine implementation specs, the architecture and product documentation, the benchmarks summary, and the project narrative. The engines are AGENTS.md-driven specs, not runtime libraries. Product application code does not live here.

## Routing table

Find your task type. Go to that folder. Load nothing else.

| Task | Go to |
|---|---|
| Implementing or modifying an engine spec | `engines/<name>/`, then read that folder's `AGENTS.md` and load nothing else |
| Nightshift documentation | `docs/products/nightshift/` |
| Editing other product documentation (Gaia, Relay, Swarms) | `docs/products/<name>/` |
| Experiment pages (Meterless City, Sitcomify, DataPlant) | `docs/experiments/<name>/` |
| Benchmark pages, report captures, example output | `docs/benchmarks/` |
| Architecture, narrative, or learnings docs | `docs/architecture/` |
| Engine overview pages | `docs/engines/` |
| Agent integration guides, prompts, the provider contract | `docs/agent-ready/` |
| Community and hackathon material | `docs/community/` |
| Shared diagrams | `docs/images/` |
| Working cross-stack demos | `examples/<name>/` |
| Hackathon starter templates | `templates/<name>/` |
| Root README, roadmap, contribution docs | repo root |

Engine folders: `engines/hmem/`, `engines/world-model/`, `engines/markovian/`, `engines/scout-intent/`.

## Isolation rule

Do not read other engine folders unless the task spans engines. Each engine folder is self-contained: its own AGENTS.md, docs, examples, evals, and workshops.

## Repo-wide rules

1. All folder and file names are lowercase kebab-case.
2. No empty folders. A folder exists only when it has real content.
3. Apache 2.0 license applies to everything in this repo.
4. App installers live in the per-app repos (`meterless/gaia`, `meterless/relay`, `meterless/swarms`, `meterless/dataplant`, and others) and on meterless.ai. Never attach binaries to releases on this repo.
5. Do not create an `apps/` folder. Products live under `docs/products/` and experiments under `docs/experiments/` until an app's source ships here.
6. Writing style: short declarative sentences. No em dashes. No exclamation points.
7. Product media lives in a `media/` folder beside the doc that uses it. Keep each video under 2 MB and link larger ones from meterless.ai instead.
8. Benchmark numbers must name their machine, build and date, and keep failures in the denominator. Copy them from the published report; never round them up.

## Non-coding agents

See [llms.txt](llms.txt) for a plain-text map of this repo and canonical doc URLs.
