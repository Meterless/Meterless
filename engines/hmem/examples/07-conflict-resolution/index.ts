import { HMEM } from "../../reference/src/index.ts";

// Detection and resolution with full audit.
const hmem = new HMEM({ clock: () => 1_750_000_000_000 });
const a = hmem.add({ content: "Always enable telemetry uploads for diagnostics", confidence: 0.9, source: "runbook" });
const b = hmem.add({ content: "Never enable telemetry uploads for diagnostics", confidence: 0.35, source: "old-chat" });

const conflicts = hmem.conflicts.scan();
console.log(`detected ${conflicts.length} conflict(s):`);
for (const c of conflicts) console.log(`- ${c.id}: ${c.memoryA} vs ${c.memoryB} (${c.reason}, confidence ${c.confidence.toFixed(2)})`);

const outcome = hmem.conflicts.autoResolve(conflicts[0]);
console.log(`\nauto-resolve outcome: ${outcome} (gate: decision confidence >= 0.70)`);
console.log("record A supersededBy:", hmem.store.get(a.id)?.supersededBy ?? "-");
console.log("record B supersededBy:", hmem.store.get(b.id)?.supersededBy ?? "-");
console.log("both records still exist:", !!hmem.store.get(a.id) && !!hmem.store.get(b.id));
