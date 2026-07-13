import { HMEM } from "../../reference/src/index.ts";

// Feedback loop: retrieval quality adapts confidence over time.
const hmem = new HMEM({ clock: () => 1_750_000_000_000 });
const good = hmem.add({ content: "Prefer tabs rendered as 2 spaces in typescript", type: "preference", confidence: 0.7, source: "chat" });
const bad = hmem.add({ content: "Prefer yaml for every config file", type: "preference", confidence: 0.7, source: "old-chat" });

console.log("before feedback:", { [good.id]: good.confidence, [bad.id]: bad.confidence });
hmem.feedback(good.id, "helpful");
hmem.feedback(good.id, "helpful");
hmem.feedback(bad.id, "wrong");
console.log("after feedback: ", { [good.id]: good.confidence.toFixed(2), [bad.id]: bad.confidence.toFixed(2) });
console.log("wrong feedback also tagged for review:", hmem.store.get(bad.id)?.tags);
const result = hmem.query("formatting preferences for typescript", { threshold: 0 });
for (const r of result.memories) console.log(`- ${r.relevance.toFixed(3)} ${r.memory.content}`);
