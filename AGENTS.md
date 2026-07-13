# Agent Instructions for Meterless

Meterless is the local-first context stack for agentic AI. This repo contains the engine implementation specs, the architecture and product documentation, and the project narrative. The engines are AGENTS.md-driven specs, not runtime libraries. Product application code does not live here.

## Routing table

Find your task type. Go to that folder. Load nothing else.

| Task | Go to |
|---|---|
| Implementing or modifying an engine spec | `engines/<name>/`, then read that folder's `AGENTS.md` and load nothing else |
| Editing product documentation | `docs/products/<name>/` |
| Architecture or narrative docs | `docs/architecture/` |
| Engine overview pages | `docs/engines/` |
| Agent integration guides | `docs/agent-ready/` |
| Community and hackathon material | `docs/community/` |
| Working cross-stack demos | `examples/<name>/` |
| Hackathon starter templates | `templates/<name>/` |
| Root README, roadmap, contribution docs | repo root |

Engine folders: `engines/hmem/`, `engines/world-model/`, `engines/markovian/`.

## Isolation rule

Do not read other engine folders unless the task spans engines. Each engine folder is self-contained: its own AGENTS.md, docs, examples, evals, and workshops.

## Repo-wide rules

1. All folder and file names are lowercase kebab-case.
2. No empty folders. A folder exists only when it has real content.
3. MIT license applies to everything in this repo.
4. Product binaries live in the per-app repos (`meterless/gaia`, `meterless/relay`, `meterless/swarms`) and are proprietary. Never attach binaries to releases on this repo.
5. Do not create an `apps/` folder. Products live under `docs/products/` until an app ships open source.
6. Writing style: short declarative sentences. No em dashes. No exclamation points.

## Non-coding agents

See [llms.txt](llms.txt) for a plain-text map of this repo and canonical doc URLs.
