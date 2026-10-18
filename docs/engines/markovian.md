# Markovian

Reasoning compression, state transition, and next-action logic.

<img src="../../engines/images/markovian-cost.svg" alt="Animated: the naive full-history cost curve grows quadratically while the Markovian bounded-state curve stays flat. 86% of input tokens saved at 20 steps" width="820" />

Status: spec available. The engine is an AGENTS.md-driven implementation spec, not a runtime library.

## Focused clone

```bash
npx degit meterless/meterless/engines/markovian my-markovian
```

Then open the folder in your coding agent and follow its AGENTS.md.

## Where it runs today

- [Nightshift](../products/nightshift/job-modes.md): the `deliberate` job kind is one long Markovian chain. Each chunk carries a compressed summary forward and checkpoints.
- [Meterless City](../experiments/meterless-city/README.md): each character carries a bounded state plus the last four turns, never the whole transcript. The 100th line costs what the first did.
- [Swarms](../products/swarms/README.md): O(1) context cost across multi-pass refinement.

## Links

- Spec folder: [`engines/markovian/`](../../engines/markovian/)
- Deep-dive docs: [`engines/markovian/docs/`](../../engines/markovian/docs/)
- README: [`engines/markovian/README.md`](../../engines/markovian/README.md)
