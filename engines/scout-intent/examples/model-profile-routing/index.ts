import { Scout } from "@meterless/scout";

async function main() {
  const scout = new Scout({
    intentRegistry: "../classify-simple-intent/intents.json",
    modelProfiles: "../generate-execution-contract/model-profiles.json",
    routing: "local-first",
  });

  const cases = [
    {
      label: "Public data — fast remote OK",
      prompt: "What's a good intro to compound interest?",
      dataClass: "public",
    },
    {
      label: "Internal data — capable remote",
      prompt: "Summarize last week's exec sync notes",
      dataClass: "internal",
    },
    {
      label: "Confidential data — must be local",
      prompt: "Draft a response to the customer's HIPAA inquiry",
      dataClass: "confidential",
    },
    {
      label: "Cost-ceiling demo — restrict to <$0.01",
      prompt: "Summarize the Q2 board prep notes",
      dataClass: "internal",
      budget: { costMaxUSD: 0.01 },
    },
  ];

  for (const c of cases) {
    const decision = await scout.decide({
      prompt: c.prompt,
      user: { id: "u", role: "ae" },
      surface: "chat",
      dataClass: c.dataClass,
      budget: c.budget,
    });
    console.log(`\n[${c.label}]`);
    console.log(`  selected profile: ${decision.executionContract.modelProfile.id}`);
    console.log(`  fallbacks: ${decision.executionContract.modelProfile.fallbacks?.join(", ") ?? "none"}`);
  }
}

main();
