# H-MEM

Hierarchical memory and durable context. A knowledge graph that mines, retrieves, dreams, and audits.

<img src="../../engines/images/hmem-lifecycle.svg" alt="Animated: a memory settles from short-term to long-term while capture, enrich, retrieve, dream, and sleep stages fire and the trust ledger appends" width="820" />

Status: spec available. The engine is an AGENTS.md-driven implementation spec, not a runtime library.

## Focused clone

```bash
npx degit meterless/meterless/engines/hmem my-hmem
```

Then open the folder in your coding agent and follow its AGENTS.md.

## Where it runs today

- [Gaia](../products/gaia/README.md) keeps projects, decisions and preferences across sessions on shared memory tiers.
- [Meterless City](../experiments/meterless-city/README.md) characters remember you. A sleep cycle consolidates old episodes into chapters; an hour of play is a memory day.
- In the [agent framework benchmark](../benchmarks/agent-frameworks.md), the reference engines as a context layer (with World Model and Markovian) lifted Haiku 4.5 by 4.29 points.

## Links

- Spec folder: [`engines/hmem/`](../../engines/hmem/)
- Deep-dive docs: [`engines/hmem/docs/`](../../engines/hmem/docs/)
- README: [`engines/hmem/README.md`](../../engines/hmem/README.md)
