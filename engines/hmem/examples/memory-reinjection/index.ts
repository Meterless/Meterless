import { HMEM } from "../../reference/src/index.ts";

// Trace metadata attachment: every reinjected block is inspectable.
const hmem = new HMEM({ clock: () => 1_750_000_000_000 });
hmem.add({ content: "Customer Acme renews in september", type: "factual", layer: "long_term", confidence: 0.9, source: "crm" });
hmem.add({ content: "Acme prefers async updates over calls", type: "preference", layer: "working", confidence: 0.8, source: "chat" });

const result = hmem.query("prep notes for the acme renewal call");
console.log(result.context);
console.log("\ntrace metadata travels with the block:");
console.log(JSON.stringify(result.trace, null, 2));
