# News intelligence

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

Article ingest → entity extraction → event clustering. A working news world model: many articles from many publishers collapse into a small set of entities and the events that connect them.

## What it shows

- Article ingest with provenance from RSS-style sources
- Person and organization extraction during normalize
- **Event clustering** — many articles about one Fed rate decision land under a single `event` entity
- Incident-window **context scoping**

Prerequisite reading: [`docs/ingest-pipeline.md`](../../docs/ingest-pipeline.md), [`examples/stream-clustered-facts`](../stream-clustered-facts/README.md).

---

## Scenario

Four articles, three publishers, one underlying event:

```text
Reuters  "Fed holds rates steady"          mentions: Jerome Powell, Federal Reserve
Bloomberg "Powell signals patience on cuts" mentions: Jerome Powell, Federal Reserve
AP       "Markets rally after Fed decision" mentions: Federal Reserve, S&P 500
Reuters  "Fed holds rates steady"          (duplicate re-send)
```

All four belong to one `event:internal:fed-may-2026-rate-decision`, scoped to a `news-window` context.

## Walkthrough

```ts
import { WorldModel } from "@meterless/world-model";

const world = new WorldModel({ storage: "local", namespace: "news-intel" });

// An incident-window context scopes everything about this decision.
await world.upsertContext({
  type: "news-window",
  externalKey: { system: "internal", id: "fed-may-2026" },
  attrs: { name: "Fed May 2026 rate decision", from: "2026-05-15", to: "2026-05-22" },
  source: { kind: "manual", at: new Date() },
});

const feed = [
  { url: "reuters.com/a1", title: "Fed holds rates steady", pub: "reuters",
    mentions: ["Jerome Powell", "Federal Reserve"] },
  { url: "bloomberg.com/b2", title: "Powell signals patience on cuts", pub: "bloomberg",
    mentions: ["Jerome Powell", "Federal Reserve"] },
  { url: "apnews.com/c3", title: "Markets rally after Fed decision", pub: "ap",
    mentions: ["Federal Reserve", "S&P 500"] },
  { url: "reuters.com/a1", title: "Fed holds rates steady", pub: "reuters",
    mentions: ["Jerome Powell", "Federal Reserve"] }, // duplicate re-send
];

// The event aggregate is itself an entity — clustering stays inside the
// five write primitives: upsertEntity + relate. No special cluster operation.
await world.upsertEntity({
  type: "event",
  externalKey: { system: "internal", id: "fed-may-2026-rate-decision" },
  attrs: { name: "Fed May 2026 rate decision" },
  source: { kind: "pipeline", by: "news-clusterer", at: new Date() },
});

for (const a of feed) {
  // Article: stable ID is the URL → the duplicate re-send is a no-op.
  await world.upsertEntity({
    type: "article",
    externalKey: { system: "url", id: a.url },
    attrs: { title: a.title, publisher: a.pub },
    source: { kind: "rss", url: a.url, at: new Date(), checksum: `sha256:${a.url}` },
  });

  // Extracted people/orgs are upserted through the pipeline's resolve stage
  // (exact → alias → probabilistic), so "Jerome Powell" from every publisher
  // collapses to one canonical entity. We pin a normalized-name external key
  // for readability; production name-keyed ids are ent_<hash> (docs/stable-ids.md).
  for (const name of a.mentions) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const type = name === "S&P 500" ? "index" : "org-or-person";
    await world.upsertEntity({
      type,
      externalKey: { system: "name", id: slug },
      attrs: { name },
      source: { kind: "rss", url: a.url, at: new Date() },
    });
    await world.relate({
      from: `article:url:${a.url}`,
      type: "mentions",
      to: `${type}:name:${slug}`,
      context: "news-window:internal:fed-may-2026",
      source: { kind: "rss", url: a.url, at: new Date() },
    });
  }

  // Cluster the article into the underlying event: membership is a relationship.
  // Relationship ids hash (from, type, to, context) → re-adding is a no-op.
  await world.relate({
    from: `article:url:${a.url}`,
    type: "member-of",
    to: "event:internal:fed-may-2026-rate-decision",
    context: "news-window:internal:fed-may-2026",
    source: { kind: "pipeline", by: "news-clusterer", at: new Date() },
  });
}

const members = await world.view("graph").neighborsOf("event:internal:fed-may-2026-rate-decision", {
  via: "member-of",
  direction: "incoming",
});
console.log("articles in event:", members.length);

const powellCoverage = await world.view("graph").neighborsOf("org-or-person:name:jerome-powell", {
  via: "mentions",
  direction: "incoming",
  inContext: "news-window:internal:fed-may-2026",
});
console.log("articles mentioning Powell:", powellCoverage.length);
```

## Run it

This repo is an implementation spec — `@meterless/world-model` is not a published package. Treat `index.ts` as a reference program against the contract in [`/docs`](../../docs/architecture.md): point the import at your own implementation (built per [`AGENTS.md`](../../AGENTS.md)), then run `npx tsx ./index.ts`.

## Expected output

```text
articles in event: 3
articles mentioning Powell: 2
```

Four feed items, but the Reuters re-send collapses on its URL-derived ID → **3** unique articles in the event. Powell is mentioned by the Reuters and Bloomberg pieces → **2**.

---

## Why it matters

- **Duplicate re-sends are free.** A feed double-sending `reuters.com/a1` produces zero new article state — the URL is the canonical key. News feeds *will* double-send; idempotency is not optional here.
- **Entities outlive articles.** The canonical Powell entity is one entity referenced by many articles across publishers. Coverage analysis ("how many outlets covered Powell this week?") is a graph query, not a join over scraped text.
- **The event is a derived aggregate.** The event's member count is recomputed from `member-of` edges, never hand-incremented — so re-ingesting the feed cannot corrupt the count.
- **Window context scopes analysis.** Every `mentions` edge is tagged with the news-window context, so the same entities can participate in a later Fed decision without cross-contaminating this one's coverage stats.

## Next

- [`stream-clustered-facts`](../stream-clustered-facts/README.md) — the resolver mechanics (exact → alias → probabilistic, banded thresholds).
- [`crm-account-world`](../crm-account-world/README.md) — the same ingest shape for sales data instead of news.
