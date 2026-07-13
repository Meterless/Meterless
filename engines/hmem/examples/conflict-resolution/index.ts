import { HMEM } from "../../reference/src/index.ts";

// Scenario variant: a correction supersedes instead of conflicting.
const hmem = new HMEM({ clock: () => 1_750_000_000_000 });
const original = hmem.add({ content: "The weekly report goes out on friday afternoons", confidence: 0.8, source: "process-doc" });
const correction = hmem.add({ content: "Correction: the weekly report goes out on friday mornings now", confidence: 0.9, source: "user_correction" });

console.log("correction supersedes:", correction.supersedes === original.id ? original.id : "(not linked)");
const conflicts = hmem.conflicts.scan();
console.log("conflicts detected:", conflicts.length, "(supersedes relation suppresses the pair)");
const result = hmem.query("when does the weekly report go out", { threshold: 0 });
for (const r of result.memories) console.log(`- ${r.relevance.toFixed(3)} ${r.memory.content}`);
