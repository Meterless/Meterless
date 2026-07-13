// When you build your own engine per AGENTS.md, import it here instead.
import { Markovian, resetRunSeq } from "../../reference/src/index.ts";

// A 30-step research tree in RESEARCH mode: per-step context stays flat.
// Run it: npx tsx index.ts
import { estimateTokens } from "../../reference/src/index.ts";

async function main(): Promise<void> {
  resetRunSeq();
  const STEPS = 30;
  const promptSizes: number[] = [];
  const markovian = new Markovian({
    chunkConfig: { chunkSize: 4000, carryoverTokens: 640, maxChunks: 32 },
    clock: () => 1_750_000_000_000,
  });

  const run = await markovian.run({
    goal: "Map the local-first sync ecosystem: protocols, engines, storage layers",
    mode: "RESEARCH",
    generator: async (prompt) => {
      promptSizes.push(estimateTokens(prompt));
      const step = promptSizes.length;
      const done = step >= STEPS;
      const body = `>> analyzed node ${step}. Findings recorded for branch ${1 + (step % 5)}. `.repeat(8);
      const marker = done
        ? "[TASK_COMPLETE]"
        : `[STATE_CHECKPOINT]\nCOMPLETED: ${step} nodes\nREMAINING: ${STEPS - step} nodes\nDECISIONS: tree depth capped at 3\nCONTEXT: research tree snapshot ${step}`;
      return { text: body + "\n" + marker };
    },
    reflect: false,
  });

  console.log(`status=${run.status}, chunks=${run.chunks.length}`);
  console.log(`prompt size at step 2:  ${promptSizes[1]} tokens (estimated)`);
  console.log(`prompt size at step 30: ${promptSizes[29]} tokens (estimated)`);
  console.log("Per-step input stays flat; a naive transcript would have grown every step.");
}

main().catch((err) => { console.error(err); process.exit(1); });
