# Local-First Agentic Context

Context is architecture. An agent's quality ceiling is set by what it knows at the moment it acts, and where that knowledge lives determines cost, privacy, and reliability.

## The claim

The context layer belongs on the user's machine. Not the model. The context.

Models keep improving and keep commoditizing. The durable asset is the accumulated context: what the agent remembers, what it knows about the user and the environment, what it learned from past runs. If that lives in a vendor's cloud, the user rents their own memory back. If it lives locally, it compounds and it is portable across models.

## What local-first means here

1. **Memory is local.** H-MEM stores the knowledge graph on the user's machine. Cloud models can be called for inference, but the memory substrate does not leave.
2. **State is local.** The World Model tracks users, tasks, and environment on the machine where the work happens.
3. **Execution is local.** Relay operates real OS windows, files, and apps. There is no cloud relay in the action path.
4. **Inference is routed, not assumed.** Not every step needs a frontier model. Reasoning compression (Markovian) and quality routing (Runtime, a future drop) keep expensive calls for the steps that need them.

## What local-first does not mean

- It does not mean offline-only. Meterless routes to cloud models when quality demands it.
- It does not mean anti-cloud. It means the context layer, the durable part, stays with the user.
- It does not mean weaker. Durable context is why a mid-tier model with real memory beats a frontier model with a blank prompt on long-horizon work.

## Consequences

- Privacy is structural, not a policy promise.
- Marginal cost per agentic step trends toward zero for context operations.
- Agents survive model swaps. The context layer is model-agnostic by contract.
