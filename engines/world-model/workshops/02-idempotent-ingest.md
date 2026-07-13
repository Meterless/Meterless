# Workshop 02 — Idempotent ingest

**Time:** 45 minutes
**You'll leave with:** an ingest pipeline that you can run as many times as you want without corrupting the store.

## Why idempotency

Production data is messy. Sources double-send. Pipelines crash mid-batch. Bug fixes mean you have to replay last week. If your ingest isn't idempotent, every one of those incidents is a data corruption incident.

World Model's invariant: **the same input produces the same event log**.

## Setup

Start from Workshop 01's project — your implementation of the World Model contract wired in (see the setup note in [Workshop 01](./01-build-your-first-world.md); `@meterless/world-model` is not a published package).

## Step 1 — A naive ingest (10 min)

```ts
import { WorldModel } from "@meterless/world-model";

const world = new WorldModel({ storage: "local", namespace: "ingest-demo" });

const records = [
  { isbn: "9780062316097", title: "Sapiens" },
  { isbn: "9780062316097", title: "Sapiens" }, // duplicate
  { isbn: "9780062316097", title: "Sapiens: A Brief History" }, // corrected title
];

for (const r of records) {
  await world.upsertEntity({
    type: "book",
    externalKey: { system: "isbn", id: r.isbn },
    attrs: { title: r.title },
    source: { kind: "file", at: new Date() },
  });
}
```

Inspect the event log: how many events? How many entities?

```ts
console.log("Events:", (await world.events()).length);
console.log("Entities:", (await world.entities()).length);
```

Expected: 3 events (every upsert appends), 1 entity (stable ID collapses duplicates), and the final title is `"Sapiens: A Brief History"` (latest fact supersedes).

## Step 2 — Re-run the pipeline (5 min)

Run the same loop a second time. Now check again.

Expected: still 3 entity events for this content (the dedupe stage at the boundary suppresses the no-op writes), still 1 entity, attributes unchanged.

This is the test. **The second run produces zero new events.**

## Step 3 — Add provenance and replay (15 min)

```ts
const ingestRun = `run-${Date.now()}`;

for (const r of records) {
  await world.upsertEntity({
    type: "book",
    externalKey: { system: "isbn", id: r.isbn },
    attrs: { title: r.title },
    source: {
      kind: "file",
      url: "books-2026-05-17.csv",
      at: new Date(),
      runId: ingestRun,
    },
  });
}
```

Now query "what did run X write?":

```ts
const runEvents = await world.events({ source: { runId: ingestRun } });
console.log(runEvents.length, "events from this run");
```

## Step 4 — Replay after a bug fix (15 min)

Simulate a bug: your old extractor capitalized titles wrong. The fix is in. Replay just that source's events:

```ts
await world.replay({
  source: { kind: "file", url: "books-2026-05-17.csv" },
  transform: (record) => ({
    ...record,
    attrs: { ...record.attrs, title: properCase(record.attrs.title) },
  }),
});
```

Original events are preserved. New events supersede. Audit trail shows what the operator did.

## What you learned

- Idempotency is a property of the event log, not of your code.
- Stable IDs are what make idempotency cheap.
- Provenance is what makes replay safe.
- A replay never destroys history.

## Next

[Workshop 03 — Rebuilding a view from scratch →](./03-rebuild-a-view.md)
