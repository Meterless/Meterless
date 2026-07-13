// Idempotency check (AGENTS.md invariant): re-running the ingest pipeline on
// the same input produces the same world state. The diff must be empty.
// Exit 0 on empty diff; pass --mutate to prove the check can fail (exit 1).

import { WorldModel } from "../src/index.ts";

const fixture = [
  {
    externalId: "art-101",
    title: "Fed holds rates steady amid mixed signals",
    at: "2026-05-17T14:00:00.000Z",
    source: { kind: "rss" as const, url: "https://example.com/a", at: "2026-05-17T14:00:00.000Z" },
    entities: [
      { type: "person", name: "Jerome Powell" },
      { type: "org", name: "Federal Reserve" },
    ],
  },
  {
    externalId: "art-102",
    title: "Powell signals patience on cuts",
    at: "2026-05-17T16:30:00.000Z",
    source: { kind: "rss" as const, url: "https://example.com/b", at: "2026-05-17T16:30:00.000Z" },
    entities: [
      { type: "person", name: "Jerome Powell" },
      { type: "org", name: "Federal Reserve" },
    ],
  },
  {
    externalId: "art-103",
    title: "Markets unmoved by the announcement",
    at: "2026-05-17T18:00:00.000Z",
    source: { kind: "api" as const, at: "2026-05-17T18:00:00.000Z" },
    entities: [{ type: "org", name: "Federal Reserve" }],
  },
];

async function main(): Promise<void> {
  const mutate = process.argv.includes("--mutate");
  const world = new WorldModel({ storage: "memory", namespace: "idem", clock: () => new Date("2026-05-18T00:00:00.000Z") });

  const r1 = await world.ingest(fixture);
  const shape1 = world.stateShapeCanonical();
  console.log(`run 1: processed=${r1.processed} clusters=${r1.clusters} changed=${r1.changed}`);

  const second = mutate
    ? [{ ...fixture[0], title: fixture[0].title + " (edited)" }, ...fixture.slice(1)]
    : fixture;
  const r2 = await world.ingest(second);
  const shape2 = world.stateShapeCanonical();
  console.log(`run 2: processed=${r2.processed} skipped=${r2.skippedUnchanged} changed=${r2.changed}`);

  if (shape1 === shape2) {
    console.log("diff: empty");
    if (mutate) {
      console.error("expected the mutation to change state; it did not");
      process.exit(1);
    }
    process.exit(0);
  } else {
    console.log("diff: NON-EMPTY");
    process.exit(mutate ? 0 : 1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
