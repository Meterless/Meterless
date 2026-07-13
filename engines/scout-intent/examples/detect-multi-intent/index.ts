import { Scout } from "@meterless/scout";

async function main() {
  const scout = new Scout({ intentRegistry: "../classify-simple-intent/intents.json" });

  const prompt = "Pull the Q2 numbers and draft a board email";

  const result = await scout.classifyMulti({ prompt, surface: "chat" });

  console.log(`Prompt: "${prompt}"\n`);
  console.log(`Detected ${result.intents.length} intent(s):\n`);

  for (const i of result.intents) {
    console.log(`  ${i.intent}  ${i.score.toFixed(2)}`);
    console.log(`    span: "${i.span}"`);
    console.log(`    params: ${JSON.stringify(i.parameters)}\n`);
  }

  // The composed plan executes each intent in dependency order
  console.log("Composed tool plan:");
  for (const step of result.toolPlan) {
    console.log(`  → ${step.tool}  (from intent: ${step.fromIntent})`);
  }
}

main();
