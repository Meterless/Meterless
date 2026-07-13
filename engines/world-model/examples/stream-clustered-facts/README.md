# Stream clustered facts

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

The **stream-cluster aggregate shape**: raw items arrive continuously from many sources, and meaning emerges from grouping them. The resolver does the hard part — deciding *"is this the same entity we already know about?"* — online, as facts stream in.

## What it shows

- Streaming `Fact` ingest from multiple sources
- Online entity resolution: **exact → alias → probabilistic**
- Conflict resolution when sources disagree (most-recent-wins)
- Provenance preserved across every source

Prerequisite reading: [`docs/ingest-pipeline.md`](../../docs/ingest-pipeline.md), [`docs/stable-ids.md`](../../docs/stable-ids.md).

---

## Scenario

Three sources report on the same person under slightly different names and disagree on his title:

```text
RSS    "Jerome Powell"   title: "Chair"        2026-05-17T09:00Z
API    "Jerome H. Powell" title: "Chairman"    2026-05-17T11:00Z
Wire   "Jay Powell"      title: "Fed Chair"    2026-05-17T14:00Z
```

These must collapse to **one** entity, with full provenance, and a deterministic current title.

## Walkthrough

```ts
import { WorldModel } from "@meterless/world-model";

const world = new WorldModel({
  storage: "local",
  namespace: "stream-demo",
  conflictPolicy: "most-recent-wins",
  // Banded resolver thresholds (the canonical scheme):
  //   ≥ 0.92        auto-merge — always recorded as an alias event
  //   0.82 – 0.92   queue for operator review, never auto-merge
  //   < 0.82        create a new entity
  resolver: { strategy: ["exact", "alias", "probabilistic"], autoMergeAt: 0.92, reviewBand: [0.82, 0.92] },
});

const stream = [
  { name: "Jerome Powell",    title: "Chair",     src: { kind: "rss", url: "feeds/markets.xml", at: new Date("2026-05-17T09:00Z") } },
  { name: "Jerome H. Powell", title: "Chairman",  src: { kind: "api", url: "newsapi.org",       at: new Date("2026-05-17T11:00Z") } },
  { name: "Jay Powell",       title: "Fed Chair", src: { kind: "wire", url: "reuters",          at: new Date("2026-05-17T14:00Z") } },
];

let powellRef;
for (const item of stream) {
  // upsertEntity runs the resolver: exact → alias → probabilistic (banded).
  const person = await world.upsertEntity({
    type: "person",
    name: item.name,
    source: item.src,
  });
  powellRef = person.id; // name-keyed canonical id: ent_<sha256 hash> (docs/stable-ids.md)

  // The title claim is a Fact — assertFact is the canonical write primitive.
  await world.assertFact({
    about: person.id,
    predicate: "title",
    value: item.title,
    confidence: 0.9,
    source: item.src,
    assertedAt: item.src.at,
  });
}

const powell = await world.view("graph").entity(powellRef);

console.log(powell.attrs.title);          // current (conflict-resolved) value
console.log(powell.aliases);              // every name the sources used
console.log((await world.facts({ about: powellRef })).length);
```

## Run it

This repo is an implementation spec — `@meterless/world-model` is not a published package. Treat `index.ts` as a reference program against the contract in [`/docs`](../../docs/architecture.md): point the import at your own implementation (built per [`AGENTS.md`](../../AGENTS.md)), then run `npx tsx ./index.ts`.

## Expected output

```text
Fed Chair
["Jerome Powell", "Jerome H. Powell", "Jay Powell"]
3
```

One entity. Three aliases. Three facts retained. Current title `"Fed Chair"` because the wire report (14:00Z) is the most recent under `most-recent-wins`.

---

## How resolution layered the three items

| Item | Strategy that matched | Result |
| --- | --- | --- |
| "Jerome Powell" | exact (first sight) | creates the Powell entity (emerging) — name-keyed id `ent_…` |
| "Jerome H. Powell" | probabilistic (0.94 ≥ 0.92) | auto-merge → alias event, same entity |
| "Jay Powell" | probabilistic (0.93 ≥ 0.92) | auto-merge → alias event, same entity |

A match in the **review band (0.82–0.92)** would not auto-merge — it queues for operator review (see [`docs/operator-control-plane.md`](../../docs/operator-control-plane.md)); below 0.82 a new entity is created. Probabilistic merges always write an **alias event**, never a destructive overwrite, so an operator can undo them.

## Why it matters

- **No fact is ever lost.** All three title claims are retained as Facts. The entity's `title` is a *derivation* under the conflict policy, not an overwrite. Switch the policy to `highest-confidence-wins` and re-derive — the source facts are untouched.
- **Identity is decided online, deterministically.** The resolver does not need a batch job to dedupe later; stable IDs + alias events collapse the stream at the boundary.
- **Provenance survives clustering.** Six months later "where did his title come from?" is answerable down to the wire report at 14:00Z.

## Next

- [`news-intelligence`](../news-intelligence/README.md) — this shape applied to a real article feed with event clustering.
- [`docs/ingest-pipeline.md`](../../docs/ingest-pipeline.md) — the full extract → normalize → resolve → validate → append → project pipeline.
