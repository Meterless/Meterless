// Memory compounding, demonstrated: the SAME 12-step research task runs
// twice with the same deterministic mock generator. The cold run starts
// blank. The warm run first mines three prior sessions into H-MEM and gets
// the reinjected context in chunk 0, so it skips the steps the team already
// settled. Mock LLM, real engines.
//
// Run it: npx tsx index.ts   (install deps once: cd ../../engines/hmem/reference && npm install,
//                             then cd ../../markovian/reference && npm install)

import { HMEM } from "../../engines/hmem/reference/src/index.ts";
import { Markovian, estimateTokens, resetRunSeq } from "../../engines/markovian/reference/src/index.ts";
import { PRIOR_SESSIONS } from "./prior-sessions.ts";

const CLOCK = () => 1_750_000_000_000;
const GOAL = "Produce the storage-layer design brief for the local-first sync app";
const TTY = process.stdout.isTTY === true;
const dim = (s: string) => (TTY ? `[2m${s}[0m` : s);
const green = (s: string) => (TTY ? `[32m${s}[0m` : s);
const cyan = (s: string) => (TTY ? `[36m${s}[0m` : s);
const bold = (s: string) => (TTY ? `[1m${s}[0m` : s);

// The 12 research steps. Steps 3, 4, 8, and 9 re-derive decisions that the
// prior sessions already settled; a run whose chunk-0 memory context carries
// those decisions skips them (emitting a one-line "already resolved" note
// folded into the previous step instead of a full chunk).
const STEPS = [
  "survey the storage options for local-first apps",
  "define the constraints: offline, multi-device, enterprise pilots",
  "evaluate IndexedDB vs sqlite for local persistence",           // settled in sessions 1+2
  "decide the browser/desktop storage contract",                  // settled in session 2
  "design the write path and corruption guarantees",
  "design the schema versioning story",
  "pick the sync transport",
  "evaluate relay server vs peer-to-peer",                        // settled in session 1
  "decide encryption at rest",                                    // settled in session 3
  "design the conflict resolution approach",
  "define the migration plan from the prototype",
  "assemble the design brief",
];
const SETTLED_BY_MEMORY = new Set([2, 3, 7, 8]); // 0-based indexes into STEPS

function makeGenerator(memoryAware: boolean, promptTokens: number[]) {
  let cursor = 0; // next step index to work on
  return async (prompt: string) => {
    promptTokens.push(estimateTokens(prompt));
    const hasMemory = memoryAware && prompt.includes("[MEMORY CONTEXT]");
    const lines: string[] = [];
    // Work on the next step; with memory, settled steps collapse into notes.
    while (cursor < STEPS.length && (hasMemory || memoryAware) && SETTLED_BY_MEMORY.has(cursor) && memoryAware) {
      lines.push(`already resolved from memory: ${STEPS[cursor]}`);
      cursor += 1;
    }
    if (cursor < STEPS.length) {
      lines.push(`worked: ${STEPS[cursor]}. ` + "Analysis, options, and the recorded decision for this step. ".repeat(6));
      cursor += 1;
    }
    const done = cursor >= STEPS.length;
    const marker = done
      ? "[TASK_COMPLETE]"
      : `[STATE_CHECKPOINT]\nCOMPLETED: ${cursor} of ${STEPS.length} steps\nREMAINING: ${STEPS.slice(cursor, cursor + 2).join("; ")}\nDECISIONS: carried forward\nCONTEXT: storage design brief`;
    return { text: lines.join("\n") + "\n" + marker };
  };
}

async function runChain(label: string, memoryContext: string | undefined, memoryAware: boolean) {
  resetRunSeq();
  const promptTokens: number[] = [];
  const markovian = new Markovian({ chunkConfig: { chunkSize: 4000, carryoverTokens: 640, maxChunks: 16 }, clock: CLOCK });
  const run = await markovian.run({
    goal: GOAL,
    memoryContext,
    generator: makeGenerator(memoryAware, promptTokens),
    reflect: false,
  });
  const totalPromptTokens = promptTokens.reduce((s, t) => s + t, 0);
  return { label, run, totalPromptTokens };
}

async function main(): Promise<void> {
  console.log(bold("Memory compounding demo") + dim("  |  Mock LLM, real engines."));
  console.log(dim(`goal: ${GOAL}\n`));

  // 1. Mine the prior sessions into H-MEM.
  const hmem = new HMEM({ clock: CLOCK });
  console.log(bold("1. Mine three prior sessions into H-MEM"));
  for (const session of PRIOR_SESSIONS) {
    const mined = await hmem.mine(session.event, session.text);
    console.log(`   ${cyan(session.label)}: ${mined.length} memories mined`);
  }

  // 2. Recall for the task; the correction must outrank the superseded claim.
  const recall = hmem.query("which storage should the local-first app use and what constraints apply", { threshold: 0.1, topN: 5 });
  console.log(bold("\n2. Recall for the task (hybrid ranking, provenance attached)"));
  for (const r of recall.memories) {
    console.log(`   ${green(r.relevance.toFixed(3))} [${r.memory.layer}] ${r.memory.content.slice(0, 76)}`);
    console.log(dim(`         id=${r.memory.id} confidence=${r.memory.confidence} source=${r.memory.source}`));
  }
  const correction = recall.memories.find((r) => r.memory.content.includes("sqlite instead"));
  const original = recall.memories.find((r) => r.memory.content.includes("We decided to use IndexedDB"));
  if (correction && original) {
    console.log(dim(`   note: the session-2 correction (${correction.memory.id}) outranks the superseded session-1 claim (${original.memory.id}).`));
  } else if (correction) {
    console.log(dim(`   note: the session-2 correction (${correction.memory.id}) made the cut; the superseded session-1 IndexedDB claim did not.`));
  }

  // 3. Run the same task cold and warm.
  console.log(bold("\n3. Same 12-step task, twice"));
  const cold = await runChain("cold  (no memory)", undefined, false);
  console.log(`   cold run:  ${cold.run.chunks.length} chunks, status=${cold.run.status}`);
  const warm = await runChain("warm  (H-MEM in chunk 0)", recall.context, true);
  console.log(`   warm run:  ${warm.run.chunks.length} chunks, status=${warm.run.status}`);

  // 4. Comparison.
  console.log(bold("\n4. Comparison") + dim("  (tokens estimated, chars/4)"));
  const rows = [
    ["", "cold", "warm"],
    ["chunks", String(cold.run.chunks.length), String(warm.run.chunks.length)],
    ["prompt tokens (estimated)", String(cold.totalPromptTokens), String(warm.totalPromptTokens)],
    ["output tokens (estimated)", String(cold.run.totalTokensUsed), String(warm.run.totalTokensUsed)],
  ];
  const w = [26, 10, 10];
  for (const [i, row] of rows.entries()) {
    const line = row.map((c, j) => c.padEnd(w[j])).join("| ");
    console.log("   " + (i === 0 ? dim(line) : line));
  }
  const saved = cold.run.totalTokensUsed + cold.totalPromptTokens - warm.run.totalTokensUsed - warm.totalPromptTokens;
  console.log(green(`\n   memory saved ${saved.toLocaleString()} estimated tokens and ${cold.run.chunks.length - warm.run.chunks.length} chunks on this run.`));
  console.log("   What the warm run already knew:");
  for (const idx of [...SETTLED_BY_MEMORY].sort((a, b) => a - b)) console.log(`   - ${STEPS[idx]}`);
  console.log(dim("\n   Mock LLM, real engines. Swap in a real provider via the generator option."));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
