# Why Meterless

Agents fail on thin context, not weak models. Meterless is the context layer: memory, world modeling, reasoning compression, coordination, execution, and runtime quality, local-first.

## The problem

Most agent stacks today:

- Forget everything between sessions. No durable memory.
- Have no model of the user, task, or environment. No world model.
- Re-derive reasoning from scratch on every step. No reasoning compression.
- Produce same-y output. No divergent generation.
- Cannot touch the user's actual computer. No execution layer.
- Route every token through expensive cloud inference. No runtime quality or cost control.

## The Meterless answer

One architecture, validated through three product surfaces. See [stack-overview.md](stack-overview.md) for the full flow.

## Positioning

- Gaia is not another AI app. It is the personal agent workspace.
- Relay is not another desktop automation tool. It is the agent execution layer.
- Swarms is not another multi-agent workflow product. It is the divergent generation and anti-sameness layer.
- The engines are not technical demos. They are the shared infrastructure the products prove.

Products prove it. Engines power it. Templates spread it. GitHub concentrates it.

## Why local-first

- **Privacy.** Memory, world state, and execution stay on the user's machine.
- **Cost.** Not every step of an agentic workflow needs frontier-model inference.
- **Reliability.** Agents that work offline and degrade gracefully.
- **Control.** Enterprises can run agent infrastructure inside their own perimeter.

Read more: [local-first-agentic-context.md](local-first-agentic-context.md).
