# Timeline of snapshots

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

The **timeline aggregate shape**: state evolves through discrete updates, and you can reconstruct the world as it was at any past moment. Ask *"what did this entity look like on date X?"* and get the answer from an event-log fold — not a separate audit table.

## What it shows

- Multiple updates to the same entity, each with provenance
- Querying the **snapshot view** at different timestamps
- Attributes evolving while the **ID stays stable**
- Schema-version changes that do **not** break old snapshots

Prerequisite reading: [`docs/aggregate-shapes.md`](../../docs/aggregate-shapes.md), [`docs/read-surface.md`](../../docs/read-surface.md).

---

## Scenario

A football team's valuation and stadium change over a decade. The team is one entity; its facts change over time.

```text
team:bengals
  2080-01-01  valuation $1.2B   stadium "Riverfront"
  2084-06-01  valuation $2.1B   stadium "Riverfront"
  2087-09-15  valuation $3.4B   stadium "Queen City Dome"   (schema v2: adds `capacity`)
```

## Walkthrough

```ts
import { WorldModel } from "@meterless/world-model";

const world = new WorldModel({ storage: "local", namespace: "timeline-demo" });

// Three updates to the SAME entity. Same ID every time.
await world.upsertEntity({
  type: "team",
  externalKey: { system: "league", id: "bengals" },
  attrs: { name: "Bengals", valuation: 1_200_000_000, stadium: "Riverfront" },
  source: { kind: "manual", at: new Date("2080-01-01") },
});

await world.upsertEntity({
  type: "team",
  externalKey: { system: "league", id: "bengals" },
  attrs: { name: "Bengals", valuation: 2_100_000_000, stadium: "Riverfront" },
  source: { kind: "manual", at: new Date("2084-06-01") },
});

// Schema v2 adds `capacity`. Old snapshots stay valid; they just lack the field.
await world.upsertEntity({
  type: "team",
  schemaVersion: 2,
  externalKey: { system: "league", id: "bengals" },
  attrs: {
    name: "Bengals",
    valuation: 3_400_000_000,
    stadium: "Queen City Dome",
    capacity: 68_000,
  },
  source: { kind: "manual", at: new Date("2087-09-15") },
});

// Point-in-time queries — the snapshot view folds the event log up to a timestamp.
const in2081 = await world.view("snapshot").entityAt("team:league:bengals", "2081-01-01");
const in2085 = await world.view("snapshot").entityAt("team:league:bengals", "2085-01-01");
const today  = await world.view("snapshot").entityAt("team:league:bengals", "2090-01-01");

console.log(in2081.attrs.valuation, in2081.attrs.stadium);
console.log(in2085.attrs.valuation, in2085.attrs.stadium);
console.log(today.attrs.valuation,  today.attrs.stadium, today.attrs.capacity);
```

## Run it

This repo is an implementation spec — `@meterless/world-model` is not a published package. Treat `index.ts` as a reference program against the contract in [`/docs`](../../docs/architecture.md): point the import at your own implementation (built per [`AGENTS.md`](../../AGENTS.md)), then run `npx tsx ./index.ts`.

## Expected output

```text
1200000000 Riverfront
2100000000 Riverfront
3400000000 Queen City Dome 68000
```

The 2081 query returns the 2080 state. The 2085 query returns the 2084 state. The schema-v2 `capacity` field is `undefined` in pre-2087 snapshots — and that is correct, not a bug.

---

## Why it matters

- **One entity, many states, one ID.** `team:league:bengals` never renumbers. Time is a query parameter, not a new row you have to join against.
- **Snapshots are derived.** `view("snapshot")` is a fold over the append-only event log up to a timestamp. There is no separate history table to keep in sync.
- **Schema versions are independent of identity.** Bumping `schemaVersion` to add `capacity` does not invalidate or rewrite the 2080 and 2084 events. Old snapshots remain queryable exactly as they were.
- **This is the test of a healthy deployment.** You can wipe the snapshot view and re-derive every historical state from the event log.

## Next

- [`narrative-world`](../narrative-world/README.md) — timelines with nested contexts and multi-generational bloodlines.
- [`stream-clustered-facts`](../stream-clustered-facts/README.md) — the other aggregate shape: continuous ingest, online clustering.
