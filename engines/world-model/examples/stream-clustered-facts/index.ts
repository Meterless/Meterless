// When you build your own engine per AGENTS.md, import it here instead.
import { WorldModel } from "../../reference/src/index.ts";

async function main() {
  const world = new WorldModel({
    storage: "memory",
    namespace: "stream-demo",
    // Banded resolver: ≥ 0.92 auto-merge (alias event); 0.82–0.92 operator review; < 0.82 new entity
    resolver: { strategy: "exact+alias+probabilistic", autoMergeAt: 0.92, reviewBand: [0.82, 0.92] },
    conflictPolicy: "highest-confidence-wins",
  });

  // A stream of facts about the same person from different sources.
  // "person:jerome-powell" is a readable display id kept for clarity here;
  // a production name-keyed entity id is ent_<sha256 hash> per docs/stable-ids.md.
  const stream = [
    {
      about: "person:jerome-powell",
      predicate: "title",
      value: "Chair",
      confidence: 0.95,
      source: { kind: "rss", url: "https://example-news.com/a", at: new Date("2026-05-17T09:00:00Z") },
    },
    {
      about: "person:jerome-powell",
      predicate: "title",
      value: "Chairman",
      confidence: 0.7,
      source: { kind: "rss", url: "https://example-news.com/b", at: new Date("2026-05-17T09:30:00Z") },
    },
    {
      about: "person:jerome-powell",
      predicate: "primary-affiliation",
      value: "Federal Reserve",
      confidence: 0.99,
      source: { kind: "api", at: new Date("2026-05-17T10:00:00Z") },
    },
  ];

  for (const fact of stream) {
    await world.assertFact(fact);
  }

  // Resolved entity reflects highest-confidence + most-recent
  const powell = await world.view("graph").entity("person:jerome-powell");
  console.log("Resolved entity:", powell.attrs);
  // title: "Chair" (higher confidence wins over "Chairman")
  // primary-affiliation: "Federal Reserve"

  // Facts log preserves both
  const facts = await world.view("facts").about("person:jerome-powell");
  console.log("Fact log:", facts.length, "entries");
  console.log("Superseded:", facts.filter((f) => f.supersededBy).length);
}

main();
