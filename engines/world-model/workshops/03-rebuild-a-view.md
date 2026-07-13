# Workshop 03 — Rebuilding a view from scratch

**Time:** 20 minutes
**You'll leave with:** confidence that throwing away a view and re-projecting from the event log is a safe, normal operation.

## The principle

The canonical store is the truth. Every view is rebuildable from it. If a view ever drifts — bad projection logic, schema migration, partial failure — you wipe it and re-project.

This workshop proves it.

## Setup

```ts
import { WorldModel } from "@meterless/world-model";

const world = new WorldModel({ storage: "local", namespace: "rebuild-demo" });
```

## Step 1 — Build some state (5 min)

Add a few entities and a custom view:

```ts
world.registerView("authors-by-book-count", {
  events: ["upsertEntity"],
  initialState: {} as Record<string, number>,
  reducer: (state, event) => {
    if (event.kind === "upsertEntity" && event.payload.type === "book") {
      const author = event.payload.attrs.author;
      state[author] = (state[author] ?? 0) + 1;
    }
    return state;
  },
});

for (const book of [
  { title: "Sapiens", author: "Harari" },
  { title: "Homo Deus", author: "Harari" },
  { title: "Brief Answers", author: "Hawking" },
]) {
  await world.upsertEntity({
    type: "book",
    externalKey: { system: "title", id: book.title },
    attrs: book,
    source: { kind: "manual", at: new Date() },
  });
}

console.log(await world.view("authors-by-book-count").get());
// { Harari: 2, Hawking: 1 }
```

## Step 2 — Corrupt the view on purpose (5 min)

```ts
// Pretend a bug doubled the count
await world.view("authors-by-book-count").debug_corrupt({ Harari: 999 });
console.log(await world.view("authors-by-book-count").get());
// { Harari: 999, Hawking: 1 }
```

In production this is the kind of state you discover three days later.

## Step 3 — Rebuild (5 min)

```ts
await world.rebuild("authors-by-book-count");
console.log(await world.view("authors-by-book-count").get());
// { Harari: 2, Hawking: 1 }
```

The view is correct again. The canonical store didn't change.

## Step 4 — Inspect the audit trail (5 min)

```ts
const rebuilds = await world.events({ kind: "view-rebuild" });
console.log(rebuilds);
```

Every rebuild is itself an event. You can see when a view was rebuilt, by whom, against which event offset.

## What you learned

- Views are derivations, not state.
- A corrupted view is a 5-minute fix.
- Rebuilds are auditable.
- This is what "canonical store with derived views" actually buys you.

## Next

[Workshop 04 — Merging duplicate entities →](./04-merge-entities.md)
