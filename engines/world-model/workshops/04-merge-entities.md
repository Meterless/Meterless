# Workshop 04 — Merging duplicate entities

**Time:** 30 minutes
**You'll leave with:** experience merging two entities, inspecting the audit trail, and reversing the merge if you change your mind.

## Why merges matter

In real systems, "Jerome Powell" and "J. Powell" and "Powell (Fed Chair)" all arrive from different sources. The probabilistic resolver catches most of these automatically. The hard cases land in the operator queue. This workshop walks through the operator side.

## Setup

```ts
import { WorldModel } from "@meterless/world-model";

const world = new WorldModel({ storage: "local", namespace: "merge-demo" });
```

## Step 1 — Create two entities that should be one (5 min)

```ts
await world.upsertEntity({
  type: "person",
  externalKey: { system: "rss", id: "jerome-powell" },
  attrs: { name: "Jerome Powell", title: "Chair" },
  source: { kind: "rss", url: "https://news-a.example", at: new Date() },
});

await world.upsertEntity({
  type: "person",
  externalKey: { system: "rss", id: "j-powell-fed" },
  attrs: { name: "J. Powell", role: "Federal Reserve Chair" },
  source: { kind: "rss", url: "https://news-b.example", at: new Date() },
});
```

Two persons, two IDs. They're the same human.

## Step 2 — Add relationships to each (5 min)

```ts
await world.upsertEntity({
  type: "article",
  externalKey: { system: "url", id: "guardian-fed-rates" },
  attrs: { title: "Fed holds rates" },
  source: { kind: "rss", at: new Date() },
});

await world.relate({
  from: "article:url:guardian-fed-rates",
  type: "mentions",
  to: "person:rss:jerome-powell",
  source: { kind: "rss", at: new Date() },
});

await world.relate({
  from: "article:url:guardian-fed-rates",
  type: "mentions",
  to: "person:rss:j-powell-fed",
  source: { kind: "rss", at: new Date() },
});
```

The article now "mentions" two different person entities for the same human.

## Step 3 — Merge (10 min)

```ts
await world.merge({
  primary: "person:rss:jerome-powell",
  alias: "person:rss:j-powell-fed",
  by: "operator-1",
  reason: "Same person, different sources",
});
```

Now query the article's mentions:

```ts
const mentions = await world.view("graph").outgoing("article:url:guardian-fed-rates", {
  via: "mentions",
});
console.log(mentions);
// Both old references resolve to person:rss:jerome-powell
```

Both old relationships still resolve. The alias system follows the pointer.

## Step 4 — Inspect the audit (5 min)

```ts
const aliasEvents = await world.events({ kind: "alias" });
console.log(aliasEvents);
// Includes who merged, when, the reason, both IDs
```

## Step 5 — Unmerge (5 min)

You changed your mind. Maybe they really are different people.

```ts
await world.unmerge({
  alias: "person:rss:j-powell-fed",
  by: "operator-1",
  reason: "Discovered they're different — Jerome and Jay Powell are brothers",
});
```

The alias is removed. References to `person:rss:j-powell-fed` now resolve back to that entity directly.

## What you learned

- Merges are alias events, not destructive overwrites.
- Old references survive the merge.
- Merges are reversible.
- Provenance and operator identity are recorded.

## What's next

You've completed the workshop series. Next steps:

- Read [`docs/operator-control-plane.md`](../docs/operator-control-plane.md) for the full operator UI design.
- Explore [`examples/`](../examples) for production patterns.
- Compose with [Scout Intent](https://github.com/meterless/meterless/tree/main/engines/scout-intent) and [Agent Orchestration](https://github.com/meterless/meterless/blob/main/ROADMAP.md).
