// Unpublished spec packages: the sibling engine has not dropped yet. Build
// or wait for it, then point these imports at real implementations.
import { WorldModel } from "@meterless/world-model";
import { Scout } from "@meterless/scout";

async function main() {
  const world = new WorldModel({ storage: "memory", namespace: "scout-world" });
  const scout = new Scout({ intentRegistry: "./intents.json" });

  // Seed some world state
  await world.upsertEntity({
    type: "account",
    externalKey: { system: "salesforce", id: "acme" },
    attrs: { name: "Acme Corp", arr: 240_000 },
    source: { kind: "manual", at: new Date() },
  });
  await world.relate({
    from: "account:salesforce:acme",
    type: "open-deal",
    to: "campaign:internal:renewal-q2",
    attrs: { stage: "negotiation", value: 280_000 },
    source: { kind: "manual", at: new Date() },
  });

  // User prompt → Scout produces a context plan
  const userPrompt = "What's the status of the Acme deal?";
  const intent = await scout.classify(userPrompt);
  const contextPlan = await scout.planContext(intent);
  // contextPlan looks like:
  // {
  //   queries: [
  //     { view: "graph", op: "entity", id: "account:salesforce:acme" },
  //     { view: "graph", op: "outgoing", id: "account:salesforce:acme", via: "open-deal" }
  //   ]
  // }

  // Execute the plan against World Model
  const results = await Promise.all(
    contextPlan.queries.map((q) => world.view(q.view).exec(q)),
  );

  console.log("Account:", results[0].attrs);
  console.log("Open deals:", results[1]);

  // The downstream LLM call now gets focused context, not a generic "fetch everything"
}

main();
