import { HMEM } from "../../reference/src/index.ts";

// Preview-first maintenance: see the plan before anything changes.
const DAY = 24 * 60 * 60 * 1000;
const T0 = 1_750_000_000_000;
let now = T0;
const hmem = new HMEM({ clock: () => now });

hmem.add({ content: "One-off note about a parking spot", source: "chat" });
hmem.add({ content: "Stale short-term thought about lunch options", type: "general", layer: "short_term", source: "chat" });
now = T0 + 40 * DAY; // let them age

const preview = hmem.sleep.preview();
console.log("sleep preview (no mutations yet):");
console.log(" toConsolidate:", preview.toConsolidate);
console.log(" toArchive:    ", preview.toArchive);
console.log(" toSynthesize: ", preview.toSynthesize);
console.log(" store size:   ", hmem.store.all().length, "(unchanged)");

const report = hmem.sleep.execute(preview);
console.log("\nexecuted with backup", report.backupId + ":");
for (const line of report.actionLog) console.log("  " + line);
console.log(" store size now:", hmem.store.all().length);
