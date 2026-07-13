# Workshop 01 — Build your first world

**Time:** 30 minutes
**You'll leave with:** a running World Model with five entities, two contexts, four relationships, and one custom view.

## Setup

> **Before you start:** this repo is the implementation spec — `@meterless/world-model` is not a published npm package. Build the engine first (open the repo in your coding agent and follow [`AGENTS.md`](../AGENTS.md)), then work through the labs against your implementation. The workshop code targets the canonical contract, so it applies to any conforming build.

```bash
mkdir my-first-world && cd my-first-world
npm init -y
npm install tsx typescript
```

Create `index.ts`:

```ts
import { WorldModel } from "@meterless/world-model"; // ← your implementation of the contract

const world = new WorldModel({ storage: "local", namespace: "my-first-world" });
```

## Step 1 — Add three entities (5 min)

Pick a domain you know well. Customers, books, characters in a story, players in a game.

```ts
await world.upsertEntity({
  type: "book",
  externalKey: { system: "isbn", id: "9780062316097" },
  attrs: { title: "Sapiens", author: "Yuval Noah Harari", year: 2014 },
  source: { kind: "manual", at: new Date() },
});
```

Add two more.

## Step 2 — Add a context (5 min)

Contexts are bounded situations.

```ts
await world.upsertContext({
  type: "reading-list",
  externalKey: { system: "user", id: "summer-2026" },
  attrs: { name: "Summer 2026 reading list" },
  source: { kind: "manual", at: new Date() },
});
```

## Step 3 — Connect them with relationships (5 min)

```ts
await world.relate({
  from: "book:isbn:9780062316097",
  type: "appears-in",
  to: "reading-list:user:summer-2026",
  source: { kind: "manual", at: new Date() },
});
```

## Step 4 — Query a built-in view (5 min)

```ts
const books = await world.view("graph").entitiesInContext(
  "reading-list:user:summer-2026",
  { type: "book" },
);
console.log(books);
```

## Step 5 — Build a custom view (10 min)

```ts
world.registerView("books-by-year", {
  events: ["upsertEntity"],
  initialState: {} as Record<number, string[]>,
  reducer: (state, event) => {
    if (event.kind === "upsertEntity" && event.payload.type === "book") {
      const year = event.payload.attrs.year;
      state[year] ??= [];
      state[year].push(event.payload.attrs.title);
    }
    return state;
  },
});

const byYear = await world.view("books-by-year").get();
```

## What you learned

- Entities, contexts, and relationships.
- Stable IDs via `externalKey`.
- Built-in views vs. custom projections.
- Provenance on every write.

## Next

[Workshop 02 — Idempotent ingest →](./02-idempotent-ingest.md)
