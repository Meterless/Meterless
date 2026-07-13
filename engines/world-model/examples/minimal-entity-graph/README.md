# Minimal entity graph

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

The smallest possible World Model: three entities, two relationships, one query. Start here. Every other example is this plus one idea.

## What it shows

- Creating entities with **stable, content-addressed IDs** (no autoincrement)
- Adding relationships between them
- Querying a **derived view** instead of the canonical store
- The whole thing in ~25 lines

Prerequisite reading: [`docs/stable-ids.md`](../../docs/stable-ids.md), [`docs/read-surface.md`](../../docs/read-surface.md).

---

## Scenario

A tiny org graph: a company, two people, and who works where.

```text
person:ada ──works-at──▶ company:acme
person:grace ──works-at──▶ company:acme
```

## The whole thing

```ts
import { WorldModel } from "@meterless/world-model";

const world = new WorldModel({ storage: "local", namespace: "minimal-graph" });

// 1. Three entities. IDs are derived from the canonical key — not assigned.
await world.upsertEntity({
  type: "company",
  externalKey: { system: "domain", id: "acme.com" },
  attrs: { name: "Acme Corp" },
  source: { kind: "manual", at: new Date() },
});

for (const [id, name] of [["ada", "Ada Lovelace"], ["grace", "Grace Hopper"]]) {
  await world.upsertEntity({
    type: "person",
    externalKey: { system: "email", id: `${id}@acme.com` },
    attrs: { name },
    source: { kind: "manual", at: new Date() },
  });
}

// 2. Two relationships. Adding the same edge twice is a no-op (stable edge ID).
for (const id of ["ada", "grace"]) {
  await world.relate({
    from: `person:email:${id}@acme.com`,
    type: "works-at",
    to: "company:domain:acme.com",
    source: { kind: "manual", at: new Date() },
  });
}

// 3. Query the graph view — never the canonical store directly.
const employees = await world.view("graph").neighborsOf("company:domain:acme.com", {
  via: "works-at",
  direction: "incoming",
});

console.log(employees.map((e) => e.attrs.name));
// → ["Ada Lovelace", "Grace Hopper"]
```

## Run it

This repo is an implementation spec — `@meterless/world-model` is not a published package. Treat `index.ts` as a reference program against the contract in [`/docs`](../../docs/architecture.md): point the import at your own implementation (built per [`AGENTS.md`](../../AGENTS.md)), then run `npx tsx ./index.ts`.

## Expected output

```text
["Ada Lovelace", "Grace Hopper"]
```

## Prove it is idempotent

Run it a second time. The output is identical and the event log does **not** grow for the entity/edge writes:

```ts
console.log("events:", (await world.events()).length);   // stable across re-runs
console.log("entities:", (await world.entities()).length); // 3, not 6
```

Stable IDs collapse the duplicate writes at the boundary. This is the property every other example builds on.

---

## Why it matters

- **IDs are derived, not assigned.** `person:email:ada@acme.com` is the same ID on every machine, every re-run, every backfill. No coordination, no renumbering.
- **You query a view, not the store.** `view("graph")` is a rebuildable projection. Throw it away and re-project from the event log — the canonical store never changes.
- **25 lines is the floor, not a toy.** This exact shape scales to the CRM, narrative, and news examples; only the entity types and views differ.

## Next

- [`timeline-of-snapshots`](../timeline-of-snapshots/README.md) — add time: query the world as it was on a past date.
- [`stream-clustered-facts`](../stream-clustered-facts/README.md) — add scale: ingest a messy stream and resolve entities online.
