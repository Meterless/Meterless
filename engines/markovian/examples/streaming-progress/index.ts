// When you build your own engine per AGENTS.md, import it here instead.
import { Markovian, resetRunSeq } from "../../reference/src/index.ts";

// Live telemetry subscription: phases, chunk counters, savings. Run it: npx tsx index.ts
async function main(): Promise<void> {
  resetRunSeq();
  const markovian = new Markovian({
    chunkConfig: { chunkSize: 4000, carryoverTokens: 640 },
    clock: () => 1_750_000_000_000,
  });

  const seen: string[] = [];
  const unsubscribe = markovian.onProgress((s) => {
    const line = `phase=${s.phase} chunk=${s.currentChunk} used=${s.tokensUsed} saved=${s.tokensSaved} carryover=${s.carryoverSize}`;
    if (seen[seen.length - 1] !== line) seen.push(line);
  });

  await markovian.run({
    goal: "Stream a 4-step task",
    stepFn: ({ step }) => ({
      content:
        `Streaming step ${step + 1} content. `.repeat(15) +
        (step >= 3 ? "[TASK_COMPLETE]" : `[STATE_CHECKPOINT]\nCOMPLETED: ${step + 1} steps\nREMAINING: ${3 - step}\nDECISIONS: none\nCONTEXT: stream demo`),
    }),
    reflect: false,
  });
  unsubscribe();

  console.log("progress events observed:");
  for (const line of seen) console.log("  " + line);
  console.log("\nThrottle UI renders (reference: 300ms) to avoid layout thrash on real streams.");
}

main().catch((err) => { console.error(err); process.exit(1); });
