// Cross-engine: H-MEM feeds chunk 0; the run output is mined back into
// memory. The loop closes: this run informs the next one.
// Run it: npx tsx index.ts
// When you build your own engines per each AGENTS.md, import them here instead.
import { Markovian, resetRunSeq } from "../../reference/src/index.ts";
import { HMEM } from "../../../hmem/reference/src/index.ts";

async function main(): Promise<void> {
  resetRunSeq();
  const clock = () => 1_750_000_000_000;
  const hmem = new HMEM({ clock });

  // Prior knowledge lives in memory before the run starts.
  hmem.add({ content: "We chose sqlite for local persistence because it needs no server", type: "factual", layer: "long_term", confidence: 0.9, source: "prior-run" });
  hmem.add({ content: "Prefer typescript for all new services", type: "preference", layer: "working", confidence: 0.85, source: "team-decision" });

  // Query H-MEM and inject the reinjection block into chunk 0.
  const recall = hmem.query("plan the sync service implementation", { threshold: 0.1 });
  console.log("memory context injected into chunk 0:\n" + recall.context + "\n");

  const markovian = new Markovian({ chunkConfig: { chunkSize: 4000, carryoverTokens: 640 }, clock });
  const run = await markovian.run({
    goal: "Plan the sync service implementation",
    memoryContext: recall.context,
    stepFn: ({ step, prompt }) => {
      if (step === 0 && !prompt.includes("[MEMORY CONTEXT]")) throw new Error("memory context missing from chunk 0");
      return {
        content:
          `Step ${step + 1}: planning with remembered decisions (sqlite, typescript). `.repeat(6) +
          (step >= 2 ? "[TASK_COMPLETE]" : `[STATE_CHECKPOINT]\nCOMPLETED: step ${step + 1}\nREMAINING: ${2 - step} steps\nDECISIONS: reuse sqlite decision\nCONTEXT: sync service plan`),
      };
    },
    reflect: false,
  });

  console.log(`run: ${run.chunks.length} chunks, status=${run.status}`);

  // Mine the run output back into memory: today informs next week.
  const mined = await hmem.mine("plan_completion", "We decided the sync service ships in three phases because review capacity is limited.");
  console.log(`\nmined back into memory: ${mined.length} record(s)`);
  for (const m of mined) console.log(`- [${m.layer}] ${m.content} (source=${m.source})`);
}

main().catch((err) => { console.error(err); process.exit(1); });
