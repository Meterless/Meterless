import { HMEM } from "../../reference/src/index.ts";

// Hybrid ranking and domain-grouped context formatting.
const hmem = new HMEM({ clock: () => 1_750_000_000_000 });
hmem.add({ content: "We deploy the api with docker on mondays", type: "factual", layer: "long_term", confidence: 0.9, source: "runbook" });
hmem.add({ content: "Prefer typescript for all new services", type: "preference", layer: "working", confidence: 0.85, source: "team-decision" });
hmem.add({ content: "The client demo went well last spring", type: "general", layer: "short_term", confidence: 0.6, source: "chat" });

const result = hmem.query("how do we deploy the api with docker");
console.log("reinjection context:\n");
console.log(result.context);
console.log("\ntrace:");
console.log(" reason:  ", result.trace.retrievalReason);
console.log(" strategy:", result.trace.strategy);
console.log(" scores:  ", result.trace.scores);
