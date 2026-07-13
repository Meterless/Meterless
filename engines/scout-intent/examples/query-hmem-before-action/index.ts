import { Scout } from "@meterless/scout";
import { HMEM } from "@meterless/hmem";

async function main() {
  const memory = new HMEM({ storage: "memory", agentId: "demo-agent" });
  const scout = new Scout({
    intentRegistry: "../classify-simple-intent/intents.json",
    memory,
  });

  // Seed memory with prior preferences
  await memory.mine({
    source: "preference",
    content: "User prefers concise, bullet-point summaries — no preamble",
    provenance: { kind: "user-correction", at: new Date() },
  });
  await memory.mine({
    source: "preference",
    content: "User's primary CRM is Salesforce, not HubSpot",
    provenance: { kind: "user-correction", at: new Date() },
  });

  // Scout pulls memory before deciding
  const decision = await scout.decide({
    prompt: "Summarize the Acme account",
    user: { id: "u-1", role: "ae" },
    surface: "chat",
  });

  console.log("Memory pulled before decision:");
  for (const m of decision.context?.memories ?? []) {
    console.log(`  - ${m.content}`);
  }

  console.log("\nDecision shaped by memory:");
  console.log(`  intent: ${decision.executionContract.intent.primary.id}`);
  console.log(`  style hint: ${decision.executionContract.intent.parameters.style ?? "(none)"}`);
  console.log(`  CRM source: ${decision.executionContract.intent.parameters.crmSource ?? "(none)"}`);
}

main();
