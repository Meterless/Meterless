# Scout Intent

Intent detection, risk guarding, tool routing, and signed execution contracts. Scout runs before every meaningful action; downstream engines act only on its contracts.

<img src="../../engines/images/scout-pipeline.svg" alt="Animated: an input passes through sense, interpret, guard, route, and recommend stages; an injection attempt is blocked at guard and a signed execution contract is emitted" width="820" />

Status: spec available. The engine is an AGENTS.md-driven implementation spec with a REAL runnable eval harness: a locked 32-example regression set, seven gated metrics with per-slice floors, and a runner that scores any implementation via `SCOUT_IMPL`.

## Focused clone

```bash
npx degit meterless/meterless/engines/scout-intent my-scout-intent
```

Then open the folder in your coding agent and follow its AGENTS.md.

## Where it runs today

- [Relay](../products/relay/README.md) tags intent as you type (a loop, a URL, an email) and matches it to verified skills before any planning.
- [Swarms](../products/swarms/README.md) classifies what kind of work a prompt is before it designs the swarm.
- Harden your own app with it: the injection prompt in the [prompt library](../agent-ready/prompt-library.md) runs the guard against its own precision and recall targets.

## Links

- Spec folder: [`engines/scout-intent/`](../../engines/scout-intent/)
- Deep-dive docs: [`engines/scout-intent/docs/`](../../engines/scout-intent/docs/)
- Eval harness: [`engines/scout-intent/evals/`](../../engines/scout-intent/evals/)
- README: [`engines/scout-intent/README.md`](../../engines/scout-intent/README.md)
