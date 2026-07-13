# Swarm planning with World context

> Cross-engine example: it runs once the sibling engine drops with its reference implementation; until then treat the code as a reference sketch of the contract.

An [Agent Orchestration](https://github.com/meterless/meterless/blob/main/ROADMAP.md) planner reads current world state **before** producing a DAG. Tasks are scoped to entities that actually exist — the planner cannot hallucinate accounts that are not in the world. When the swarm finishes, its verified output flows back into the world as new facts.

> This is the World Model side of the `swarm-with-world-model` example in the [swarm orchestration engine (a future flagship engine drop; link goes to the roadmap)](https://github.com/meterless/meterless/blob/main/ROADMAP.md) — that example reads the world *from inside the swarm*; this one focuses on what the world exposes for grounded planning.

## What it shows

- A Swarm planner reading the World Model before DAG construction
- Per-task context injection from the World Model
- Swarm output flowing **back** into the World Model as new facts (closed loop)

Prerequisite reading: [`docs/read-surface.md`](../../docs/read-surface.md), [`examples/crm-account-world`](../crm-account-world/README.md). Composition reference: World Model how-to §13 (Swarm).

---

## The loop

```text
World Model ──(current accounts)──▶ Swarm planner ──▶ DAG of grounded tasks
     ▲                                                        │
     └────────────(verified outputs as facts)─────────────────┘
```

The world is **read-mostly during a run**, then written once at the end through the normal ingest pipeline — there is no privileged write path.

## Walkthrough

```ts
import { WorldModel } from "@meterless/world-model";
import { Swarm } from "@meterless/swarm";

const world = new WorldModel({ storage: "local", namespace: "swarm-demo" });
const swarm = new Swarm();

// The world already knows two accounts (from the CRM example).
const accounts = await world.view("graph").entitiesOfType("account");
console.log("accounts in world:", accounts.map((a) => a.attrs.name));

// 1. The planner reads world state, then builds a DAG scoped to REAL accounts.
const dag = await swarm.plan({
  goal: "Draft a Q3 renewal outreach for every active account",
  // The planner is handed the world; it cannot invent accounts.
  grounding: accounts.map((a) => ({ id: a.id, name: a.attrs.name })),
});

// 2. Each task gets per-task context injected from the World Model.
swarm.onTaskStart(async (task) => {
  const ctx = await world.buildPromptContext({ subjectId: task.subjectId, limit: 30 });
  task.augmentPrompt(ctx.text);
});

const result = await swarm.run(dag);

// 3. Verified swarm outputs flow BACK into the world as facts — same ingest path.
//    assertFact is the canonical write primitive for this.
for (const out of result.outputs) {
  await world.assertFact({
    about: out.subjectId,                       // e.g. "account:salesforce:0015g00000ACME"
    predicate: "outreach-draft",
    value: { draft: out.text, status: "ready-for-review" },
    confidence: 0.9,
    source: { kind: "agent", by: `swarm:${result.runId}`, at: new Date() },
    assertedAt: new Date(),
  });
}

const drafts = await world.facts({
  about: "account:salesforce:0015g00000ACME",
  predicate: "outreach-draft",
});
console.log("drafts attached to Acme:", drafts.length);
```

## Run it

This repo is an implementation spec — neither `@meterless/world-model` nor `@meterless/swarm` is a published package. Treat `index.ts` as a reference program against the two contracts: point the imports at your own implementations (World Model per [`AGENTS.md`](../../AGENTS.md); Swarm per [https://github.com/meterless/meterless/blob/main/ROADMAP.md](https://github.com/meterless/meterless/blob/main/ROADMAP.md)), then run `npx tsx ./index.ts`.

## Expected output

```text
accounts in world: ["Acme Corp", "Globex"]
drafts attached to Acme: 1
```

The planner produced exactly two outreach tasks — one per **real** account. No phantom "MegaCorp" task, because the planner was grounded in the world, not free-associating. Each draft is written back as a provenanced fact.

---

## Why it matters

- **Grounded planning, not hallucinated planning.** Handing the planner the actual account list is the difference between "draft outreach for Acme and Globex" and a DAG that invents a customer that does not exist. The world is the guardrail.
- **Per-task context, not one mega-prompt.** Each task pulls only its subject's neighborhood (limit 30). Tasks stay focused and cheap; the planner does not stuff the entire world into every prompt.
- **The loop closes through the front door.** Swarm outputs re-enter via `assertFact` — the same idempotent, provenanced pipeline every other writer uses. A re-run of the swarm does not duplicate drafts (stable fact IDs); an operator can audit `source: swarm:<runId>`.
- **Read-mostly during the run.** The world is stable while the DAG executes; the single write burst at the end keeps the run reproducible and the audit trail clean.

## Next

- The `swarm-with-world-model` example in the [swarm orchestration engine (a future flagship engine drop; link goes to the roadmap)](https://github.com/meterless/meterless/blob/main/ROADMAP.md) — the reciprocal: the same integration from inside the swarm.
- [`scout-context-plan-to-world-query`](../scout-context-plan-to-world-query/README.md) — Scout choosing the planner's grounding scope.
- [`crm-account-world`](../crm-account-world/README.md) — the account world this planner reads from.
- [`docs/operator-control-plane.md`](../../docs/operator-control-plane.md) — reviewing the `ready-for-review` drafts the swarm produced.
