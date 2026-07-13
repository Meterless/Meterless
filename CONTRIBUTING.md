# Contributing to Meterless

Thanks for helping build the local-first context stack for agentic AI.

A contributor should be able to make a useful first contribution in under five minutes.

## Where to contribute

| I want to | Go to |
|---|---|
| Give feedback on an engine spec | Open an engine-spec-feedback issue |
| Improve an engine spec, example, or workshop | `engines/<name>/` |
| Fix or improve product docs | `docs/products/<name>/` |
| Improve architecture or narrative docs | `docs/architecture/` |
| Add or improve a starter template | `templates/<name>/` (must run; see templates/README.md) |
| Report a product bug | The per-app repo's issue tracker |

## What lives where

This repo contains specs and docs, not application code. The engines are AGENTS.md-driven implementation specs. You implement them in your own stack with a coding agent. Feedback from real implementations is the most valuable contribution there is: what was ambiguous, what was missing, what broke.

Product binaries are proprietary and ship from the per-app repos (`meterless/gaia`, `meterless/relay`, `meterless/swarms`). Product documentation lives here and is Apache 2.0.

## How to submit

1. Fork the repo and create a branch.
2. Make your change. Keep it scoped to one folder where possible.
3. Open a pull request using the PR template.

Some engines carry their own `CONTRIBUTING.md` (for example `engines/hmem/CONTRIBUTING.md`). When contributing inside an engine folder, follow its local guide.

## Rules

1. Local-first is the wedge. Do not add hard cloud dependencies to core paths.
2. No empty folders. A folder exists only when it has real content.
3. Lowercase kebab-case names everywhere.
4. Short declarative sentences in docs. No em dashes. No exclamation points.
