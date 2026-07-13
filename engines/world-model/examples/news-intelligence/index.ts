// When you build your own engine per AGENTS.md, import it here instead.
import { WorldModel } from "../../reference/src/index.ts";

// Mock article stream — in production this is an RSS poller or news API client
const articles = [
  {
    publisher: "guardian",
    slug: "2026-05-17-fed-holds-rates",
    title: "Fed holds rates steady amid mixed signals",
    publishedAt: "2026-05-17T14:00:00Z",
    mentions: { persons: ["Jerome Powell"], orgs: ["Federal Reserve"] },
    topic: "fed-rate-may-2026",
  },
  {
    publisher: "reuters",
    slug: "2026-05-17-powell-comments",
    title: "Powell signals patience on cuts",
    publishedAt: "2026-05-17T16:30:00Z",
    mentions: { persons: ["Jerome Powell"], orgs: ["Federal Reserve"] },
    topic: "fed-rate-may-2026",
  },
];

async function main() {
  const world = new WorldModel({ storage: "memory", namespace: "news" });

  // The incident-window context groups related coverage
  await world.upsertContext({
    type: "incident-window",
    externalKey: { system: "topic", id: "fed-rate-may-2026" },
    attrs: { startedAt: "2026-05-15", endedAt: "2026-05-20" },
    source: { kind: "manual", at: new Date() },
  });

  // Ingest articles
  for (const a of articles) {
    await world.upsertEntity({
      type: "article",
      externalKey: { system: "url", id: `${a.publisher}/${a.slug}` },
      attrs: { title: a.title, publishedAt: a.publishedAt },
      source: { kind: "rss", url: `https://${a.publisher}.example/${a.slug}`, at: new Date() },
    });

    // Entity extraction → upsert mentioned persons and orgs.
    // A normalized-name external key is pinned here for readability;
    // production name-keyed ids are ent_<sha256 hash> per docs/stable-ids.md.
    for (const name of a.mentions.persons) {
      await world.upsertEntity({
        type: "person",
        externalKey: { system: "name", id: name.toLowerCase().replace(/ /g, "-") },
        attrs: { name },
        source: { kind: "rss", url: `https://${a.publisher}.example/${a.slug}`, at: new Date() },
      });
      // References use the externally-keyed grammar: type:system:externalId
      await world.relate({
        from: `article:url:${a.publisher}/${a.slug}`,
        type: "mentions",
        to: `person:name:${name.toLowerCase().replace(/ /g, "-")}`,
        context: `incident-window:topic:${a.topic}`,
        source: { kind: "rss", at: new Date() },
      });
    }
  }

  // Query: every article in the incident window
  const coverage = await world.view("graph").entitiesInContext("incident-window:topic:fed-rate-may-2026", {
    type: "article",
  });
  console.log("Coverage of fed-rate-may-2026:", coverage.length, "articles");

  // Query: every mention of Powell
  const powellMentions = await world.view("graph").incoming("person:name:jerome-powell", {
    via: "mentions",
  });
  console.log("Powell mentions:", powellMentions.length);
}

main();
