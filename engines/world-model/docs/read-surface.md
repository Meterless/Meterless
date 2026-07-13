# Read surface

The canonical store is for writing. Reads come from **views** — derived, rebuildable, projection-shaped surfaces optimized for specific access patterns.

> Readable ids in the snippets below (`team:bengals`, `season:145`) are display labels; canonical stable ids follow the grammar in [`stable-ids.md`](./stable-ids.md).

## The principle

> The canonical store is the source of truth. Every view can be thrown away and rebuilt from it.

This is the test of a healthy World Model deployment. If a view drifts from the store, you wipe it and re-project. The store does not change.

## Built-in views

### Graph view

For relational and traversal queries.

```ts
const roster = await world.view("graph").neighborsOf("team:bengals", {
  via: "plays-for",
  inContext: "season:145",
});

const bloodline = await world.view("graph").traverse("player:tommie-frazier-iii", {
  via: "child-of",
  direction: "ancestors",
  maxDepth: 5,
});
```

Backed by an adjacency-list projection. Rebuilt by replaying `relate` events.

### Timeline view

For time-bounded queries across entities and events.

```ts
const articles = await world.view("timeline").entitiesOfType("article", {
  from: "2026-05-01",
  to: "2026-05-31",
});

const seasonGames = await world.view("timeline").contextChildren("season:145", {
  type: "game",
});
```

Backed by an interval-indexed projection. Rebuilt by replaying `upsertEntity`, `upsertContext`, and `snapshot` events.

### Search view

For text-similarity and embedding queries.

```ts
const results = await world.view("search").entities({
  text: "Fed rate decision",
  types: ["article", "event"],
  limit: 20,
});
```

Backed by an embedding index (default: client-side; pluggable). Rebuilt by re-embedding entity text fields.

### Snapshot view

Point-in-time state of any entity or context.

```ts
const teamAt = await world.view("snapshot").entityAt("team:bengals", "2087-12-01");
```

Backed by event-log fold up to a given timestamp.

## Custom projections

Most production deployments need a domain-specific projection — a CRM dashboard view, a roster page, a campaign analytics view.

```ts
world.registerView("roster", {
  events: ["relate", "upsertEntity"],
  initialState: {},
  reducer: (state, event) => {
    if (event.kind === "relate" && event.payload.type === "plays-for") {
      const team = event.payload.to;
      state[team] ??= [];
      state[team].push(event.payload.from);
    }
    return state;
  },
});

const bengalsRoster = await world.view("roster").get("team:bengals");
```

The view declares which events it cares about. The runtime replays them. The projection is materialized incrementally as new events append.

## Read-your-writes

A write is durable when the event has appended. Views project asynchronously by default, but you can request **read-your-writes consistency** for a single call:

```ts
await world.upsertEntity({ ... });
const view = await world.view("graph").waitForConsistency().neighborsOf(...);
```

Use sparingly. The async path is faster and more scalable.

## Subscriptions

Views can be subscribed to.

```ts
const unsub = world.view("timeline").subscribe({
  type: "article",
  from: "2026-05-17",
}, (diff) => {
  console.log("new articles:", diff.added);
});
```

Subscriptions push diffs, not full states. Used by the control plane and by long-running agents.

## What views are *not*

Views are not databases. They are derivations.

- **Don't write to a view.** Writes go to the canonical store.
- **Don't trust a stale view.** Rebuild it.
- **Don't expose a view as your only persistence layer.** The store is the truth.

If you find yourself wanting to write to a view, you want a new entity type, a new context, or a new fact.
