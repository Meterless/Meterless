// When you build your own engine per AGENTS.md, import it here instead.
import { Markovian, resetRunSeq } from "../../reference/src/index.ts";

// Cumulative stats and per-step aggregation across persisted runs.
// Run it: npx tsx index.ts
async function main(): Promise<void> {
  resetRunSeq();
  const markovian = new Markovian({
    chunkConfig: { chunkSize: 4000, carryoverTokens: 640 },
    clock: () => 1_750_000_000_000,
  });

  const mk = (steps: number) => ({
    goal: `task with ${steps} steps`,
    stepFn: ({ step }: { step: number }) => ({
      content:
        `Output for step ${step + 1}. `.repeat(15) +
        (step + 1 >= steps
          ? "[TASK_COMPLETE]"
          : `[STATE_CHECKPOINT]\nCOMPLETED: ${step + 1}\nREMAINING: ${steps - step - 1}\nDECISIONS: none\nCONTEXT: history demo`),
    }),
    reflect: false,
  });

  await markovian.run(mk(3));
  await markovian.run(mk(6));

  const stats = markovian.history.cumulativeStats();
  console.log("cumulative stats (estimated tokens):");
  console.log(`  runs=${stats.totalRuns} completed=${stats.completedRuns} chunks=${stats.totalChunksProcessed}`);
  console.log(`  used=${stats.totalTokensUsed} saved=${stats.totalTokensSaved} avgEfficiency=${stats.averageEfficiency.toFixed(1)}%`);
  console.log("\nactual per-step aggregation (Engine tab, actual mode):");
  for (const row of markovian.history.performanceByStep()) {
    console.log(`  step ${row.step}: avg ${row.avgTokens.toFixed(0)} tokens over ${row.samples} run(s)`);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
