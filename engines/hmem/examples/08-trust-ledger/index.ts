import { HMEM } from "../../reference/src/index.ts";

// One memory record followed through the append-only ledger.
const hmem = new HMEM({ clock: () => 1_750_000_000_000 });
const m = hmem.add({ content: "The api key lives in the vault", confidence: 0.7, source: "onboarding-doc" });
hmem.query("where is the api key", { threshold: 0 });
hmem.feedback(m.id, "helpful");
hmem.feedback(m.id, "wrong");

console.log(`ledger history for ${m.id}:\n`);
for (const e of hmem.ledger.history(m.id)) {
  const conf = e.newState?.confidence !== undefined ? ` confidence ${e.previousState?.confidence ?? "-"} -> ${e.newState.confidence}` : "";
  console.log(`- ${e.action}${conf}`);
}
console.log("\nledger stats:", hmem.ledger.stats());
console.log("final tags:", hmem.store.get(m.id)?.tags);
