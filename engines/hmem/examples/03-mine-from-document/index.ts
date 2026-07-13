import { HMEM } from "../../reference/src/index.ts";

async function main(): Promise<void> {
  // File import with provenance tagging.
  const hmem = new HMEM({ clock: () => 1_750_000_000_000 });

  const doc =
    "Architecture notes. We use postgres for the canonical store because of jsonb support. " +
    "Services must always emit structured logs. Deploys happen because CI is green, never manually.";

  const mined = await hmem.mining.mineDocument("architecture-notes.md", doc);
  console.log(`mined ${mined.length} memories from the document:\n`);
  for (const m of mined) {
    console.log(`- ${m.content}`);
    console.log(`  source=${m.source} tags=${m.tags.join(",")} domain=${m.domain}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
