import { Scout } from "@meterless/scout";

async function main() {
  const scout = new Scout({
    intentRegistry: "./intents.json",
  });

  const prompts = [
    "Find me the top 5 stuck deals and draft recovery emails",
    "What's the weather?",
    "Summarize the Q2 board prep notes",
  ];

  for (const prompt of prompts) {
    const { candidates } = await scout.classify({ prompt, surface: "chat" });
    console.log(`\n"${prompt}"`);
    for (const c of candidates.slice(0, 3)) {
      // Canonical bands: High ≥ 0.80, Medium 0.55–0.79, Low 0.40–0.54 (clarify),
      // Reject < 0.40 (fall back to safe GENERAL). See docs/scoring.md.
      const band =
        c.score >= 0.8 ? "HIGH" : c.score >= 0.55 ? "MED" : c.score >= 0.4 ? "LOW" : "REJECT";
      console.log(`  [${band}] ${c.intent}  ${c.score.toFixed(2)}`);
    }
  }
}

main();
