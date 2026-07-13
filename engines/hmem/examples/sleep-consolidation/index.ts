import { HMEM } from "../../reference/src/index.ts";

// Sleep workflow scenario: consolidation, synthesis, and the backup path.
const DAY = 24 * 60 * 60 * 1000;
const T0 = 1_750_000_000_000;
let now = T0;
const hmem = new HMEM({ clock: () => now });

hmem.add({ content: "Sprint retro action: write better ticket titles", type: "general", layer: "short_term", source: "retro" });
hmem.add({ content: "Sprint retro action item: improve ticket titles", type: "general", layer: "short_term", source: "retro" });
now = T0 + 10 * DAY;

const preview = hmem.sleep.preview();
console.log("plan:", {
  consolidate: preview.toConsolidate.length,
  archive: preview.toArchive.length,
  synthesize: preview.toSynthesize.length,
});
const report = hmem.sleep.execute(preview);
console.log("report:", { backupId: report.backupId, consolidated: report.consolidated, synthesized: report.synthesized });
for (const m of hmem.store.all()) console.log(`- [${m.layer}] ${m.content.slice(0, 80)} lineage=${m.derivedFrom?.join(",") ?? "-"}`);
