# Scout to World Model

When a decision needs grounding in shared state, Scout does not let the agent free-roam the [World Model](https://github.com/meterless/meterless/tree/main/engines/world-model). It emits a **scoped context plan** — how broad a slice, which relations, what budget — and the world's read surface answers exactly that. The agent only reasons over what it is handed.

> This is the Scout side of the World Model's context-plan integration — the World Model repo shows the world *answering* the plan; this example shows Scout *issuing* it.

Prerequisite reading: [`04 — generate-execution-contract`](../generate-execution-contract/README.md), the [World Model repo](https://github.com/meterless/meterless/tree/main/engines/world-model).

---

## The idea

> Scout owns *intent → context plan*. The World Model owns *plan → context*. The agent reasons; it never navigates the graph itself.

A vague prompt and a strategic one should pull different amounts of world. Scout decides the breadth from the intent; the world honors it.

## Walkthrough — `index.ts`

```ts
import { Scout } from "@meterless/scout";
import { WorldModel } from "@meterless/world-model";

const scout = new Scout({ intentRegistry: "./intents.json", policyPack: "default" });
const world = new WorldModel({ storage: "local", namespace: "scout-demo" });

async function answer(prompt: string) {
  // 1. Scout produces a context plan sized to the intent (NOT a fixed default).
  const plan = await scout.planContext({
    prompt, user: { id: "u-1", role: "ae" }, surface: "chat",
  });
  console.log(plan.contextPlan);
  // { subjectId: "account:salesforce:0015g00000ACME",
  //   sources: ["world"], maxTokens: 6000, relations: ["employs","has-deal"] }

  // 2. The plan becomes a read-surface query. The agent wrote none of this.
  const wide = plan.contextPlan.maxTokens > 16_000;
  const context = await world.buildPromptContext({
    subjectId: plan.contextPlan.subjectId,
    limit: wide ? 50 : 20,
    include: plan.contextPlan.relations,
    window: { start: Date.now() - 7 * 86_400_000, end: Date.now() },
  });

  // 3. Scout decides WITH the assembled, provenanced context.
  const decision = await scout.decide({
    prompt, user: { id: "u-1", role: "ae" }, surface: "chat",
    context: context.text,
  });
  return { intent: decision.intent.primary, entities: context.provenance.length };
}

const quick = await answer("what's Acme's primary contact?");
const deep  = await answer("build a full account plan for Acme next quarter");
console.log(quick.entities, "vs", deep.entities);
```

## Run it

```bash
# The @meterless packages are not yet published — this repository is the
# implementation spec. With a spec-conforming implementation on your import path:
npx tsx ./index.ts
```

## Expected output

```text
{ subjectId: "account:salesforce:0015g00000ACME", sources: ["world"], maxTokens: 6000, relations: ["employs","has-deal"] }
6 vs 41
```

Same world, same subject. The quick lookup pulled a tight neighborhood (≤20 → 6 entities). The account-planning prompt produced a wide plan (≤50 → 41), so Scout asked the world for far more context — automatically, from the intent.

## What Scout puts on the contract

| Field | Set by | Used for |
| --- | --- | --- |
| `contextPlan.subjectId` | intent + entity binding | which world node to center the query on |
| `contextPlan.sources` | intent risk/class | `["world"]` vs `[]` (skip retrieval entirely) |
| `contextPlan.maxTokens` | intent breadth | the read surface's `limit` |
| `contextPlan.relations` | intent capability map | which edges to traverse |

The plan is part of the signed execution contract — so "why did the agent see these 41 entities?" traces back to a specific Scout decision, not an ad-hoc query.

---

## Why it matters

- **The agent never navigates the world.** It writes no graph traversal and picks no budget. Scout plans; the read surface executes; the agent only reasons over the result.
- **Context scales with intent, not a constant.** A trivial question does not drag 50 entities into the prompt; a strategic one is not starved at 20. Breadth is a Scout decision recorded on the contract.
- **Provenance survives the whole path.** The assembled context returns the rows that produced it, traceable back through Scout's plan to the World Model events — one auditable chain.

## Next

- The reciprocal — the same integration from the World Model side — lives in the [World Model repo](https://github.com/meterless/meterless/tree/main/engines/world-model).
- [`query-hmem-before-action`](../query-hmem-before-action/README.md) — the same pattern, grounding in memory instead of shared state.
- [`scout-to-swarm`](../scout-to-swarm/README.md) · [`route-to-markovian`](../route-to-markovian/README.md) — Scout's other downstream handoffs.
