import { HMEM } from "../../reference/src/index.ts";

async function main(): Promise<void> {
  // Multi-turn scenario: memory accumulates across turns and shapes retrieval.
  const hmem = new HMEM({ clock: () => 1_750_000_000_000 });
  const turns = [
    "I always prefer dark mode in every editor we ship.",
    "We decided to use sqlite because the app must work offline.",
    "Actually we should use postgres instead for the cloud sync tier.",
  ];
  for (const [i, turn] of turns.entries()) {
    const mined = await hmem.mine("chat_message", turn, { chatId: "session-1" });
    console.log(`turn ${i + 1}: mined ${mined.length} -> ${mined.map((m) => m.id).join(", ")}`);
  }
  const result = hmem.query("which database should the app use", { threshold: 0.2 });
  console.log("\nretrieved for the database question:");
  for (const r of result.memories) console.log(`- ${r.relevance.toFixed(3)} ${r.memory.content}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
