// When you build your own engine per AGENTS.md, import it here instead.
import { Markovian, resetRunSeq } from "../../reference/src/index.ts";

// A 12-phase architecture scenario in ARCHITECT mode. Run it: npx tsx index.ts
async function main(): Promise<void> {
  resetRunSeq();
  const PHASES = 12;
  const markovian = new Markovian({
    chunkConfig: { chunkSize: 4000, carryoverTokens: 800 },
    clock: () => 1_750_000_000_000,
  });

  const run = await markovian.run({
    goal: "Design the migration of a monolith warehouse pipeline to Iceberg with a Polaris catalog",
    mode: "ARCHITECT",
    stepFn: ({ step }) => {
      const phase = step + 1;
      const done = phase >= PHASES;
      const body = `Phase ${phase}: evaluated constraints, produced the design slice for this phase, recorded decisions. `.repeat(6);
      const marker = done
        ? "[TASK_COMPLETE]"
        : `[STATE_CHECKPOINT]\nCOMPLETED: phases 1-${phase}\nREMAINING: phases ${phase + 1}-${PHASES}\nDECISIONS: target=Iceberg, catalog=Polaris, backfill=18mo\nCONTEXT: cutover strategy open`;
      return { content: body + "\n" + marker };
    },
    reflect: false,
  });

  console.log(`status=${run.status}, chunks=${run.chunks.length}`);
  console.log(`carryover into the final phase:\n${run.chunks[run.chunks.length - 1].carryover}\n`);
  console.log(`efficiency (estimated): ${run.efficiencyPercent.toFixed(1)}% saved vs naive history accumulation`);
}

main().catch((err) => { console.error(err); process.exit(1); });
