import { HMEM } from "../../reference/src/index.ts";

async function main(): Promise<void> {
  // Extract memories from a conversation with the model-free fallback path.
  const hmem = new HMEM({ clock: () => 1_750_000_000_000 });

  const transcript =
    "Please keep updates short. I always prefer blockers and next steps only. " +
    "The weather was rough today. We decided to move standup to 9am because of the new timezone spread.";

  const mined = await hmem.mine("chat_message", transcript, { chatId: "chat-42" });
  console.log(`mined ${mined.length} memories from the transcript (model-free fallback):\n`);
  for (const m of mined) {
    console.log(`- [${m.layer}] (${m.type}) ${m.content}`);
    console.log(`  source=${m.source} tags=${m.tags.join(",")}`);
  }
  console.log("\nnoise sentences (weather) were dropped; typed preferences and decisions kept.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
