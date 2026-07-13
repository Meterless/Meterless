// When you build your own engine per AGENTS.md, import it here instead.
import { Markovian, resetRunSeq } from "../../reference/src/index.ts";

// Post-run synthesis: the reflection pass ratifies or refines. Run it: npx tsx index.ts
async function main(): Promise<void> {
  resetRunSeq();
  const markovian = new Markovian({
    chunkConfig: { chunkSize: 4000, carryoverTokens: 640 },
    clock: () => 1_750_000_000_000,
  });

  let generatorCalls = 0;
  const run = await markovian.run({
    goal: "Write the rollout checklist for the beta",
    generator: async (prompt) => {
      generatorCalls += 1;
      if (prompt.includes("Reflect on this completed run")) {
        return { text: "Verdict: ratify. The checklist covers rollout, rollback, and comms. One refinement: add an owner column." };
      }
      return { text: "Checklist drafted: rollout steps, rollback plan, comms plan. [TASK_COMPLETE]" };
    },
  });

  console.log(`chunks=${run.chunks.length}, generator calls=${generatorCalls} (last one is the reflection pass)`);
  console.log(`\nreflection:\n${run.reflection}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
