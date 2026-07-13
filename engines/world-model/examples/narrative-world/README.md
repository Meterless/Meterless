# Narrative world

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

A persistent narrative universe with bloodlines, seasons, and dynasties. Inspired by long-running football-simulation projects where **Year 145 references Year 74** — and the world model has to remember everything in between, accurately, forever.

## What it shows

- Multi-generational entity bloodlines (`child-of` relationships)
- Nested contexts (`season → week → game`)
- **Temporally-bounded relationships** (a player on a team for a specific season range)
- Recursive traversal: *"who descends from X?"*

Prerequisite reading: [`docs/entity-context-relationship-model.md`](../../docs/entity-context-relationship-model.md), [`docs/aggregate-shapes.md`](../../docs/aggregate-shapes.md).

---

## Scenario

A three-generation quarterback dynasty across two seasons:

```text
player:tommie-frazier-i  ──child-of──▶  (none)
player:tommie-frazier-ii  ──child-of──▶  player:tommie-frazier-i
player:tommie-frazier-iii ──child-of──▶  player:tommie-frazier-ii

season:145 ─▶ week:14 ─▶ game:bengals-vs-chiefs
player:tommie-frazier-iii ──plays-for──▶ team:bengals   (valid: season 144–146)
```

## Walkthrough

```ts
import { WorldModel } from "@meterless/world-model";

const world = new WorldModel({ storage: "local", namespace: "gridiron" });

// Bloodline: three generations, each a stable entity.
const line = [
  ["tommie-frazier-i",   null],
  ["tommie-frazier-ii",  "tommie-frazier-i"],
  ["tommie-frazier-iii", "tommie-frazier-ii"],
] as const;

for (const [id, parent] of line) {
  await world.upsertEntity({
    type: "player",
    externalKey: { system: "league", id },
    attrs: { name: id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), position: "QB" },
    source: { kind: "manual", at: new Date() },
  });
  if (parent) {
    await world.relate({
      from: `player:league:${id}`,
      type: "child-of",
      to: `player:league:${parent}`,
      source: { kind: "manual", at: new Date() },
    });
  }
}

// Nested contexts: season → week → game. A context's ID includes its parent,
// so week:14 under season:145 is a different ID than week:14 under season:144.
await world.upsertContext({ type: "season", externalKey: { system: "league", id: "145" },
  attrs: { year: 145 }, source: { kind: "manual", at: new Date() } });
await world.upsertContext({ type: "week", externalKey: { system: "league", id: "14" },
  parent: "season:league:145", attrs: { number: 14 }, source: { kind: "manual", at: new Date() } });
// "week:league:14@season:league:145" is a readable display form of the parent
// reference. The canonical context id is hash(type + externalKey + parentId)
// per docs/stable-ids.md — which is exactly why week 14 of season 145 hashes
// differently from week 14 of season 144.
await world.upsertContext({ type: "game", externalKey: { system: "league", id: "bengals-vs-chiefs-145-14" },
  parent: "week:league:14@season:league:145", attrs: { home: "bengals" },
  source: { kind: "manual", at: new Date() } });

// Temporally-bounded relationship: on the team only for seasons 144–146.
await world.relate({
  from: "player:league:tommie-frazier-iii",
  type: "plays-for",
  to: "team:league:bengals",
  validFrom: { season: 144 },
  validTo: { season: 146 },
  source: { kind: "manual", at: new Date() },
});

// Recursive bloodline query.
const descendants = await world.view("graph").traverse(
  "player:league:tommie-frazier-i",
  { via: "child-of", direction: "descendants", maxDepth: 5 },
);

console.log(descendants.map((p) => p.attrs.name));

// Time-scoped roster query: who played for the Bengals in season 145?
const roster145 = await world.view("graph").neighborsOf("team:league:bengals", {
  via: "plays-for",
  direction: "incoming",
  inContext: { season: 145 },
});
console.log(roster145.map((p) => p.attrs.name));
```

## Run it

This repo is an implementation spec — `@meterless/world-model` is not a published package. Treat `index.ts` as a reference program against the contract in [`/docs`](../../docs/architecture.md): point the import at your own implementation (built per [`AGENTS.md`](../../AGENTS.md)), then run `npx tsx ./index.ts`.

## Expected output

```text
["Tommie Frazier Ii", "Tommie Frazier Iii"]
["Tommie Frazier Iii"]
```

Generation I has two descendants down the chain. In season 145, only Frazier III is rostered — the relationship's `validFrom/validTo` window (144–146) includes 145, so he appears; query season 150 and the roster is empty without deleting anything.

---

## Why it matters

- **The world remembers across decades.** Year 145 can reference Year 74 because every entity has a stable ID and every relationship its own record — nothing is renumbered or overwritten as the simulation runs.
- **Nested context IDs prevent collisions.** `week:14` only means something *under a season*. Encoding the parent in the context ID is what makes `season → week → game` unambiguous across 145 simulated years.
- **Temporal bounds replace deletion.** A player leaving a team is a `validTo`, not a delete. The season-150 roster is correctly empty *and* the season-145 roster is still correct — both are derivations over the same edges.

## Next

- [`timeline-of-snapshots`](../timeline-of-snapshots/README.md) — point-in-time *attribute* history (complements relationship time-bounds).
- [`agent-run-world-state`](../agent-run-world-state/README.md) — the same nested-context pattern for agent run/step state.
