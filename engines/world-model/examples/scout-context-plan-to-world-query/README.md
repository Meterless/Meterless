# Scout context plan → World Model query

> Cross-engine example: the scout-intent spec has dropped (see [`engines/scout-intent/`](../../../scout-intent/)); this runs once a Scout reference implementation lands. Until then treat the code as a reference sketch of the contract.

[Scout Intent](https://github.com/meterless/meterless/tree/main/engines/scout-intent) decides the query plan; the World Model answers it. The reasoning agent never has to know how to navigate the world — **Scout figures out how broad a context to assemble, and the World Model's read surface produces it.**

> This is the World Model side of the `scout-to-world-model` example in the [Scout Intent engine](https://github.com/meterless/meterless/tree/main/engines/scout-intent) — that example shows Scout *issuing* the scoped context plan; this one shows the world *answering* it.

## What it shows

- A user prompt arriving at Scout
- Scout producing a structured **context plan**
- The plan translating into a World Model read-surface query
- The assembled context feeding the downstream reasoning step

Prerequisite reading: [`docs/read-surface.md`](../../docs/read-surface.md). Composition reference: World Model how-to §13 (Scout).

---

## The idea

> Scout owns *intent → plan*. The World Model owns *plan → context*. The agent just reasons over what it is handed.

A vague prompt and a precise prompt should pull different amounts of world. Scout decides the budget; `world.buildPromptContext` honors it.

## Walkthrough

```ts
import { WorldModel } from "@meterless/world-model";
import { Scout } from "@meterless/scout";

const world = new WorldModel({ storage: "local", namespace: "scout-demo" });
const scout = new Scout();

// (assume the world already has an Acme account, contacts, deals, threads)

async function answer(rawInput: string) {
  // 1. Scout turns the prompt into a structured contract.
  const contract = await scout.process({ rawInput, session: "sess-1" });

  // 2. The context plan decides breadth. Big task → wide context; quick lookup → narrow.
  const wide = contract.contextPlan.maxTokens > 16_000;

  // 3. The plan becomes a World Model query — the agent wrote none of this.
  const context = await world.buildPromptContext({
    subjectId: contract.contextPlan.subjectId,        // e.g. "account:salesforce:0015g00000ACME"
    limit: wide ? 50 : 20,
    window: { start: Date.now() - 7 * 86_400_000, end: Date.now() },
    include: contract.contextPlan.relations ?? ["employs", "has-deal"],
  });

  // 4. Downstream reasoning consumes the assembled context + its provenance.
  return {
    prompt: `${context.text}\n\n${rawInput}`,
    provenance: context.provenance,
  };
}

const quick = await answer("What's Acme's primary contact?");
const deep  = await answer("Build a full account plan for Acme for next quarter");

console.log("quick context entities:", quick.provenance.length);
console.log("deep context entities:",  deep.provenance.length);
```

## Run it

This repo is an implementation spec — neither `@meterless/world-model` nor `@meterless/scout` is a published package. Treat `index.ts` as a reference program against the two contracts: point the imports at your own implementations (World Model per [`AGENTS.md`](../../AGENTS.md); Scout per [the scout-intent engine](https://github.com/meterless/meterless/tree/main/engines/scout-intent)), then run `npx tsx ./index.ts`.

## Expected output

```text
quick context entities: 6
deep context entities: 41
```

Same world, same subject. The quick lookup pulled a tight neighborhood (≤20). The account-planning prompt triggered a wide plan (≤50), so Scout asked the World Model for far more context — automatically.

---

## Why it matters

- **The agent does not navigate the world.** It never writes a graph traversal or picks a token budget. Scout plans; the read surface executes. The agent only reasons.
- **Context scales with intent.** A trivial question does not drag 50 entities into the prompt; a strategic one is not starved at 20. The budget is a Scout decision, not a hard-coded constant.
- **Provenance rides along.** Every assembled context returns the rows that produced it, so the downstream answer is auditable back through Scout's plan to the World Model events.
- **One read surface, every consumer.** Scout, the UI, retrieval, and ranking all call `buildPromptContext`. There is one access pattern over one source of truth.

## Next

- The `scout-to-world-model` example in the [Scout Intent engine](https://github.com/meterless/meterless/tree/main/engines/scout-intent) — the reciprocal: the same integration from inside Scout.
- [`world-to-hmem-sync`](../world-to-hmem-sync/README.md) — caching the pulled context in the agent's memory.
- [`swarm-planning-with-world-context`](../swarm-planning-with-world-context/README.md) — a multi-agent planner reading the world before it builds a DAG.
