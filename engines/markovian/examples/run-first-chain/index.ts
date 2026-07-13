// When you build your own engine per AGENTS.md, import it here instead.
import { Markovian, resetRunSeq } from "../../reference/src/index.ts";

// Minimal working chain with a mock LLM. Run it: npx tsx index.ts
async function main(): Promise<void> {
  resetRunSeq();
  const markovian = new Markovian({
    chunkConfig: { chunkSize: 4000, carryoverTokens: 640 },
    clock: () => 1_750_000_000_000,
  });

  const steps = [
    "Step 1 outline: define audience and frequency.\n[STATE_CHECKPOINT]\nCOMPLETED: audience defined\nREMAINING: channels, pillars, pipeline, measurement\nDECISIONS: audience=PMs, frequency=weekly\nCONTEXT: product newsletter plan",
    "Step 2: choose channels. Email plus LinkedIn.\n[STATE_CHECKPOINT]\nCOMPLETED: audience, channels\nREMAINING: pillars, pipeline, measurement\nDECISIONS: channels=email,linkedin\nCONTEXT: product newsletter plan",
    "Step 3: content pillars. Product updates, customer stories, industry POV.\n[STATE_CHECKPOINT]\nCOMPLETED: audience, channels, pillars\nREMAINING: pipeline, measurement\nDECISIONS: pillars=updates,stories,POV\nCONTEXT: product newsletter plan",
    "Step 4: production pipeline. Draft Monday, edit Tuesday, send Wednesday.\n[STATE_CHECKPOINT]\nCOMPLETED: all but measurement\nREMAINING: measurement\nDECISIONS: pipeline=draft-Mon,edit-Tue,send-Wed\nCONTEXT: product newsletter plan",
    "Step 5: measurement. Open rate, click rate, reply rate. [TASK_COMPLETE]",
  ];

  const run = await markovian.run({
    goal: "Outline a 5-step plan to ship a new product newsletter",
    stepFn: ({ step }) => ({ content: steps[step] ?? "[TASK_COMPLETE]" }),
    reflect: false,
  });

  console.log(`Ran ${run.chunks.length} chunks, status: ${run.status}`);
  console.log(`\nCarryover into chunk 3 (compressed state, not full history):\n${run.chunks[2].carryover}`);
  console.log(`\nStats (estimated, chars/4): used=${run.totalTokensUsed}, saved=${run.totalTokensSaved}, efficiency=${run.efficiencyPercent.toFixed(1)}%`);
}

main().catch((err) => { console.error(err); process.exit(1); });
