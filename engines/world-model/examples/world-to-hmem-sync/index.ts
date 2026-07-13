// Cross-engine: World Model facts replicate into an agent's H-MEM.
// The World Model is shared state; H-MEM is the agent's personal memory of
// that state. Run it: npx tsx index.ts
// When you build your own engines per each AGENTS.md, import them here instead.
import { WorldModel } from "../../reference/src/index.ts";
import { HMEM } from "../../../hmem/reference/src/index.ts";

async function main(): Promise<void> {
  const world = new WorldModel({ storage: "memory", namespace: "shared-world" });
  const memory = new HMEM({ clock: () => 1_750_000_000_000 });

  // The agent subscribes to world events and mines facts into its own memory.
  const unsubscribe = world.subscribeEvents((event) => {
    if (event.kind !== "assertFact") return;
    const fact = event.payload as { about: string; predicate: string; value: unknown; confidence: number };
    memory.add({
      content: `${fact.about}: ${fact.predicate} = ${String(fact.value)}`,
      type: "factual",
      layer: "working",
      confidence: fact.confidence,
      tags: ["world-model-sync"],
      source: `world-model:${event.id}`,
    });
  });

  // Facts land in the shared world...
  await world.assertFact({
    about: "org:acme",
    predicate: "renewal-quarter",
    value: "Q3-2026",
    confidence: 0.9,
    source: { kind: "api", at: "2026-05-17T10:00:00.000Z" },
  });
  await world.assertFact({
    about: "org:acme",
    predicate: "champion",
    value: "Maya Rodriguez",
    confidence: 0.85,
    source: { kind: "api", at: "2026-05-17T10:05:00.000Z" },
  });
  unsubscribe();

  // ...and the agent recalls them from its OWN memory, without re-querying the world.
  const recall = memory.query("when does acme renew", { threshold: 0.1 });
  console.log("agent recall from H-MEM:");
  console.log(recall.context);
  console.log("\nprovenance: each memory names the world event it came from:");
  for (const r of recall.memories) console.log(`- ${r.memory.id} source=${r.memory.source}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
