import { HMEM } from "../../reference/src/index.ts";

async function main(): Promise<void> {
  // Corpus handling: mine a document, query it later with provenance intact.
  const hmem = new HMEM({ clock: () => 1_750_000_000_000 });
  await hmem.mining.mineDocument(
    "postmortem-2026-06.md",
    "The outage happened because the retry queue was unbounded. We must always cap retry queues at 1000 entries. Alerting should page because sustained errors matter."
  );
  const result = hmem.query("what did we learn about retry queues", { threshold: 0.2 });
  console.log(result.context);
  console.log("\nevery memory carries document provenance:");
  for (const r of result.memories) console.log(`- ${r.memory.id} source=${r.memory.source}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
