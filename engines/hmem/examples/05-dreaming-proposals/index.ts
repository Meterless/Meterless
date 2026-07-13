import { HMEM } from "../../reference/src/index.ts";

// Synthesis with the approval boundary.
const hmem = new HMEM({ clock: () => 1_750_000_000_000 });
hmem.add({ content: "Prefer short bullet answers in reviews", type: "preference", source: "chat" });
hmem.add({ content: "Prefer python for scripting tasks", type: "preference", source: "chat" });
hmem.add({ content: "Standup moved to 9am for timezone spread", type: "factual", source: "chat" });

const proposals = hmem.dreaming.dream();
console.log(`dreaming produced ${proposals.length} proposals (nothing materialized yet):\n`);
for (const p of proposals) console.log(`- [${p.type}] ${p.content.slice(0, 90)}...`);

console.log(`\nmemory count before approval: ${hmem.store.all().length}`);
const first = proposals[0];
const created = hmem.dreaming.approve(first.id);
console.log(`approved ${first.id} -> ${created ? `new ${created.layer} memory ${created.id}` : "domain update applied"}`);
console.log(`memory count after approval: ${hmem.store.all().length}`);
