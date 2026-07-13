import { HMEM } from "../../reference/src/index.ts";

// Hand-built record capture with audit. Run it: npx tsx index.ts
const hmem = new HMEM({ clock: () => 1_750_000_000_000, actor: "example-01" });

const memory = hmem.add({
  content: "We chose SQLite for local persistence because it needs no server",
  type: "factual",
  layer: "working",
  tags: ["tech:sqlite", "decision"],
  confidence: 0.9,
  source: "manual:example",
});

console.log("created record:");
console.log(JSON.stringify({ ...memory, embedding: "[64-dim vector omitted]" }, null, 2));
console.log("\nledger entries for", memory.id + ":");
for (const entry of hmem.ledger.history(memory.id)) {
  console.log(` ${entry.action} by ${entry.actor} at ${entry.timestamp}`);
}

try {
  hmem.add({ content: "a record with no source", source: "" });
} catch (err) {
  console.log("\nrejected by construction:", (err as Error).message);
}
