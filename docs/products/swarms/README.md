# Swarms

**The swarm builds itself. You keep it.**

Type one goal. Swarms auto-generates the whole agent team: specialized agents planned, parallelized, reconciled and verified, running locally in your browser. The reasoning is yours to keep: edit the graph, rerun any branch, refine it over time.

Free and open source · v0.9.3 · Apache 2.0 · [Launch Swarms in your browser](https://meterless.ai/Swarms/) · [meterless.ai/swarms](https://meterless.ai/swarms.html) · [GitHub](https://github.com/meterless/swarms)

<img src="images/swarms-hero.png" alt="Meterless Swarms" width="100%" />

| Swarm size | Context cost | Providers | Swarm design | Runs | Price |
|---|---|---|---|---|---|
| 300+ agents | O(1) | 5, 2 local | Auto-generated | Locally, in-browser | Free, open source |

## Reasoning graphs, running locally

Swarms keeps both the answer and the graph that produced it. Use natural language to create and refine reasoning topologies for research, comparison, coding, analysis, writing, batch work and verification, with local control by default, scheduled to run automatically. A sample batch graph: 147 nodes, 382 edges, depth 14, 22 critics, 19 merges.

## The graph is saved

Most AI tools charge you to re-run the whole model every time. Swarms saves the reasoning as a graph you keep and can run again.

1. **Inspect.** Open any node: model, tokens, score.
2. **Edit.** Refine the graph: select, describe, diff, apply.
3. **Swap.** Any model on any node: frontier for the hard parts, cheap for the rest.
4. **Rerun.** History, branch, schedule.

A common pattern is to run the graph once with a frontier model, refine it, then rerun it with cheaper models on most nodes.

## The ranked gallery

Every output lands in a ranked gallery sorted by goal-fit, lineage and renderability: research briefs, code, comparisons, analysis, writing or creative variants. Open one, hit Refine, edit inline, and re-run only that branch. The whole swarm does not restart, just the part you touched.

- **Generates.** HTML, CSS patches, SVG, YAML graphs, TypeScript, SQL, JSON, Markdown and more.
- **Ranks and reconciles.** Goal-fit, lineage and renderability score every item. Patches reconcile against their target. Variants collapse into families.
- **Refines inline.** Click any artifact, comment on any element, re-run from there.

<img src="images/swarms-fanout.svg" alt="Animated: a planner maps one prompt into distinct directions, parallel variants stream in as they finish, one fails alone while the rest continue, and results are ranked, reconciled and refined" width="820" />

## Why breadth matters

Different models' first answers tend to look alike. Nightshift races of 250 to 300 attempts found 25 to 37 distinct solution clusters and were still finding new ones after attempt 250. Swarms brings that breadth to a single prompt in your browser. [Nightshift](../nightshift/README.md) gives it the whole night.

## Engines inside

| Engine | What it does in Swarms |
|---|---|
| Swarm orchestration | DAG planning, dynamic specialists, merge and verify. The spec is next on the [roadmap](../../../ROADMAP.md). |
| [Scout Intent](../../../engines/scout-intent/) | Intent modes that classify what kind of work a prompt is |
| [Markovian](../../../engines/markovian/) | O(1) context cost across multi-pass refinement |

## Docs

- [Getting started](getting-started.md)
- [Features](features.md)
- [Shortcuts](shortcuts.md)
- [Privacy](privacy.md)
- [FAQ](faq.md)
- [Troubleshooting](troubleshooting.md)

## The family

Swarms is one of three free Meterless apps, alongside [Gaia](../gaia/README.md) and [Relay](../relay/README.md). Need the project, memory and results to persist across sessions? Continue the work in Gaia.
