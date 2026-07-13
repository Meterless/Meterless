import { HMEM } from "../../reference/src/index.ts";

// Proposal review flow: approve one, reject one, audit both.
const hmem = new HMEM({ clock: () => 1_750_000_000_000 });
hmem.add({ content: "Prefer concise commit messages under 60 chars", type: "preference", source: "review" });
hmem.add({ content: "Prefer squash merges to keep history linear", type: "preference", source: "review" });

const proposals = hmem.dreaming.dream();
console.log(`pending proposals: ${hmem.dreaming.pending().length}`);
const [first, second] = proposals;
hmem.dreaming.approve(first.id);
if (second) hmem.dreaming.reject(second.id);
console.log(`after review: ${hmem.dreaming.pending().length} pending`);
console.log("\naudit trail:");
for (const e of [...hmem.ledger.all()].filter((e) => e.action.startsWith("dream_"))) {
  console.log(`- ${e.action} ${e.memoryId}`);
}
