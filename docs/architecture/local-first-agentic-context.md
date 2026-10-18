# Local-First Agentic Context

Context is architecture. An agent's quality ceiling is set by what it knows at the moment it acts, and where that knowledge lives determines cost, privacy and reliability.

## The claim

The context layer belongs on the user's machine. The model can run anywhere.

Models keep improving and keep commoditizing. The durable asset is the accumulated context: what the agent remembers, what it knows about the user and the environment, what it learned from past runs, and the methods that worked. If that lives in a vendor's cloud, the user rents their own memory back. If it lives locally, it compounds and it is portable across models.

## What local-first means here

1. **Memory is local.** H-MEM stores the knowledge graph on the user's machine. Cloud models can be called for inference, but the memory substrate does not leave.
2. **State is local.** The World Model tracks users, tasks and environment on the machine where the work happens.
3. **Execution is local.** Relay and Gaia operate real OS windows, files and apps through your own signed-in sessions. There is no cloud relay in the action path.
4. **Production is local.** Nightshift races, judges and checks on hardware you own. Every attempt, cluster, receipt, Method and Skill stays on your disk.
5. **Inference is routed, not assumed.** Not every step needs a frontier model. The Meterless provider routes by disposition (`fast`, `deep`, `cheap`, `local`) and cloud models join only if you add a key.

## What local-first does not mean

- It does not mean offline-only. Meterless routes to cloud models when quality or latency demands it. When someone is waiting on a long prompt, renting latency is the right call.
- It does not mean anti-cloud. It means the context layer, the durable part, stays with the user.
- It does not mean lower quality. Durable context lifted Haiku 4.5 by 4.29 points on hidden-grader tasks. An 8B model with memory, bounded state and a world model carries Meterless City's characters.

## Consequences

- Privacy is structural, not a policy promise. The 18 knowledge-work nights sent 0 bytes to a cloud service.
- Marginal cost per agentic step trends toward electricity. About 5 cents per verified business deliverable on one desk-side machine.
- Agents survive model swaps. The context layer is model-agnostic by contract, and the routing modes hide model names from apps.
- Idle hours become work. A machine used 3 to 8 hours a day by hand can work 14 to 24 hours a day with Nightshift.

Read the numbers behind each claim in [learnings.md](learnings.md).
