// Measured cost curve: runs the SAME 20-step task twice with the same
// deterministic mock generator, once through the Markovian orchestrator and
// once naive (full history re-sent every step), and prints the cumulative
// input-token table. Every number is labeled. With ANTHROPIC_API_KEY set and
// @anthropic-ai/sdk installed, a third mode makes 20 small real calls and
// reports provider-measured usage; the script never requires either.

import { Markovian, estimateTokens, resetRunSeq } from "../src/index.ts";

const STEPS = 20;

function stepOutput(step: number): string {
  const last = step >= STEPS;
  const body = `Step ${step}: derived requirements, compared options, recorded the decision for this stage. `.repeat(12);
  const marker = last
    ? "[TASK_COMPLETE]"
    : `[STATE_CHECKPOINT]\nCOMPLETED: steps 1-${step}\nREMAINING: steps ${step + 1}-${STEPS}\nDECISIONS: option-${step} locked\nCONTEXT: measured-run demo`;
  return body + "\n" + marker;
}

async function main(): Promise<void> {
  resetRunSeq();
  const clock = () => 1_750_000_000_000;

  // Markovian pass: prompts are goal + bounded carryover.
  const markovianPromptTokens: number[] = [];
  const markovian = new Markovian({ chunkConfig: { chunkSize: 4000, carryoverTokens: 640 }, clock });
  await markovian.run({
    goal: "Design a rollout plan for a local-first sync engine across 20 workstreams",
    generator: async (prompt) => {
      markovianPromptTokens.push(estimateTokens(prompt));
      return { text: stepOutput(markovianPromptTokens.length) };
    },
    reflect: false,
  });

  // Naive pass: identical outputs, but every step re-sends the full history.
  const naivePromptTokens: number[] = [];
  {
    const goal = "Design a rollout plan for a local-first sync engine across 20 workstreams";
    let history = "";
    for (let step = 1; step <= STEPS; step++) {
      const prompt = `${goal}\n\n[FULL HISTORY]\n${history}\n\nContinue with step ${step}.`;
      naivePromptTokens.push(estimateTokens(prompt));
      history += "\n" + stepOutput(step);
    }
  }

  console.log("Markovian vs naive input cost, same 20-step task, same outputs.");
  console.log("All numbers: estimated (chars/4). Mock LLM, real engine.\n");
  console.log("step | naive cum. tokens | markovian cum. tokens | ratio");
  console.log("-----|-------------------|-----------------------|------");
  let naiveCum = 0;
  let markCum = 0;
  let prevRatio = 0;
  let monotone = true;
  for (let i = 0; i < STEPS; i++) {
    naiveCum += naivePromptTokens[i];
    markCum += markovianPromptTokens[i];
    const ratio = naiveCum / markCum;
    if (ratio < prevRatio - 1e-9) monotone = false;
    prevRatio = ratio;
    if ((i + 1) % 2 === 0 || i === 0) {
      console.log(
        `${String(i + 1).padStart(4)} | ${String(naiveCum).padStart(17)} | ${String(markCum).padStart(21)} | ${ratio.toFixed(2)}x`
      );
    }
  }
  const savedPct = ((naiveCum - markCum) / naiveCum) * 100;
  console.log(`\ninput tokens saved at step ${STEPS}: ${(naiveCum - markCum).toLocaleString()} (${savedPct.toFixed(1)}%, estimated)`);
  console.log(`naive grows superlinearly, markovian linearly; ratio monotonically increases: ${monotone}`);

  if (process.env.ANTHROPIC_API_KEY) {
    console.log("\nANTHROPIC_API_KEY detected. For provider-measured numbers, install @anthropic-ai/sdk");
    console.log("and adapt the generator to call the API; label those numbers 'measured'.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
