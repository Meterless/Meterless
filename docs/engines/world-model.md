# World Model

User, task, and environment state modeling.

<img src="../../engines/images/world-model-flow.svg" alt="Animated: documents, conversations, signals, and actions stream into an append-only canonical event log; graph, timeline, and search views derive from it" width="820" />

Status: spec available. The engine is an AGENTS.md-driven implementation spec, not a runtime library.

## Focused clone

```bash
npx degit meterless/meterless/engines/world-model my-world-model
```

Then open the folder in your coding agent and follow its AGENTS.md.

## Where it runs today

- [Relay](../products/relay/README.md) remembers your desktop: windows, controls and workflow state before and after each action.
- [Sitcomify](../experiments/sitcomify/README.md) casts every character, prop and running gag into a world model, so each @mention carries one canonical description into every scene.
- [Meterless City](../experiments/meterless-city/README.md) keeps who said what and who joined whom as an event log with provenance.

## Links

- Spec folder: [`engines/world-model/`](../../engines/world-model/)
- Deep-dive docs: [`engines/world-model/docs/`](../../engines/world-model/docs/)
- README: [`engines/world-model/README.md`](../../engines/world-model/README.md)
