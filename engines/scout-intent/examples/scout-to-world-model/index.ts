import { Scout } from "@meterless/scout";
import { WorldModel } from "@meterless/world-model";

const scout = new Scout({ intentRegistry: "./intents.json", policyPack: "default" });
const world = new WorldModel({ storage: "local", namespace: "scout-demo" });

async function answer(prompt: string) {
  // 1. Scout produces a context plan sized to the intent (NOT a fixed default).
  //    Shape: { subjectId, sources, maxTokens, relations, redactionPolicy }
  const plan = await scout.planContext({
    prompt,
    user: { id: "u-1", role: "ae" },
    surface: "chat",
  });
  console.log(plan.contextPlan);
  // e.g. { subjectId: "account:salesforce:0015g00000ACME",
  //        sources: ["world"], maxTokens: 6000, relations: ["employs", "has-deal"] }

  // Skip retrieval entirely when the plan asks for no sources.
  if (!plan.contextPlan.sources.includes("world")) {
    const decision = await scout.decide({ prompt, user: { id: "u-1", role: "ae" }, surface: "chat" });
    return { intent: decision.intent.primary, entities: 0 };
  }

  // 2. The plan becomes a read-surface query. The agent wrote none of this.
  //    A wide plan (maxTokens > 16000) maps to limit 50; otherwise limit 20.
  const wide = plan.contextPlan.maxTokens > 16_000;
  const context = await world.buildPromptContext({
    subjectId: plan.contextPlan.subjectId,
    limit: wide ? 50 : 20,
    include: plan.contextPlan.relations,
    window: { start: Date.now() - 7 * 86_400_000, end: Date.now() },
  });

  // 3. Scout decides WITH the assembled, provenanced context — the retrieved
  //    text lifts the contextual scoring term and re-bands the decision.
  const decision = await scout.decide({
    prompt,
    user: { id: "u-1", role: "ae" },
    surface: "chat",
    context: context.text,
  });
  return { intent: decision.intent.primary, entities: context.provenance.length };
}

async function main() {
  const quick = await answer("what's Acme's primary contact?");
  const deep = await answer("build a full account plan for Acme next quarter");

  console.log(`quick lookup   → ${quick.intent.id} · ${quick.entities} entities`);
  console.log(`account plan   → ${deep.intent.id} · ${deep.entities} entities`);
  console.log(`${quick.entities} vs ${deep.entities}`);
}

main();
