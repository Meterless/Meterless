// Runtime orchestrator (AGENTS.md section 4.5). One function runs the whole
// chain: build prompt, invoke generator, clean markers, account tokens,
// compress state, persist chunk, detect completion. Reflection failure never
// fails the run (sections 7, 11). Abort is checked before each chunk and
// before compression.

import { cleanMarkers, parseMarkers } from "./markers.ts";
import { runEfficiency } from "./configManager.ts";
import { CarryoverService } from "./carryover.ts";
import { buildPrompt, overlapSlice } from "./promptBuilder.ts";
import { ProgressService } from "./progress.ts";
import { estimateTokens } from "./types.ts";
import type { Attachment, ChunkConfig, ChunkInfo, Generator, MarkovianRun, Mode, RunOptions, StepFn } from "./types.ts";

let runSeq = 0;
export function resetRunSeq(): void {
  runSeq = 0;
}

export async function orchestrate(args: {
  options: RunOptions;
  config: ChunkConfig;
  clock: () => number;
  progress: ProgressService;
  carryoverService: CarryoverService;
  defaultGenerator?: Generator;
}): Promise<MarkovianRun> {
  const { options, config, clock, progress, carryoverService } = args;
  const goal = options.goal ?? options.prompt;
  if (!goal) throw new Error("Markovian: run needs a goal or prompt");
  const mode: Mode = options.mode ?? "ARCHITECT";
  const attachments: Attachment[] = options.attachments ?? [];
  const generator = normalizeGenerator(options, args.defaultGenerator, goal);
  const start = clock();

  const run: MarkovianRun = {
    id: `run-${++runSeq}`,
    timestamp: start,
    prompt: goal.slice(0, 500),
    mode,
    chunkConfig: { ...config }, // mandatory per-run snapshot
    chunks: [],
    totalTokensUsed: 0,
    totalTokensSaved: 0,
    efficiencyPercent: 0,
    durationMs: 0,
    status: "completed",
    tokenLabel: "estimated",
    output: "",
  };

  const cleanedParts: string[] = [];
  let carryover = "";
  let previousCleaned = "";
  let accumulatedSavings = 0;
  let done = false;

  progress.phase("initializing", `${mode} chain, maxChunks=${config.maxChunks}`);

  try {
    while (run.chunks.length < config.maxChunks && !done) {
      if (options.abortSignal?.aborted) {
        run.status = "aborted";
        break;
      }
      const step = run.chunks.length + 1; // 1-based
      progress.phase("generating", `chunk ${step}`);

      const prompt = buildPrompt({
        mode,
        goal,
        step,
        carryover,
        overlapText: overlapSlice(previousCleaned, config),
        memoryContext: options.memoryContext,
        attachments: step === 1 ? attachments : [],
        config,
      });

      const { text } = await generator(prompt, step === 1 ? attachments : [], undefined, options.onStream, options.abortSignal);
      const parsed = parseMarkers(text);
      const content = parsed.cleaned;
      const chunkTokens = estimateTokens(content);

      // Section 6.1/6.2 savings accounting (estimated, chars/4).
      const historySize = (step - 1) * config.chunkSize;
      const standardChunkCost = historySize + chunkTokens;
      const markovianChunkCost = config.carryoverTokens + chunkTokens;
      accumulatedSavings += Math.max(0, standardChunkCost - markovianChunkCost);

      // Persist the generated chunk first: its cost is already paid, so an
      // abort after generation still preserves partial output (section 11).
      const chunk: ChunkInfo = { id: step, tokens: chunkTokens, carryover, content };
      run.chunks.push(chunk);
      cleanedParts.push(content);
      previousCleaned = content;
      progress.chunkDone(chunk);

      if (options.abortSignal?.aborted) {
        run.status = "aborted";
        break;
      }
      progress.phase("compressing", `chunk ${step}`);
      const next = await carryoverService.next({
        markerState: parsed.state,
        previousCarryover: carryover,
        chunkText: text,
        config,
      });
      carryover = next.carryover;
      progress.update({ tokensUsed: run.chunks.reduce((s, c) => s + c.tokens, 0), tokensSaved: accumulatedSavings, carryoverSize: estimateTokens(carryover) });

      if (parsed.done) done = true;
      if (!done && options.stopWhen?.({ step, carryover })) done = true;
    }

    if (!done && run.status === "completed" && run.chunks.length >= config.maxChunks) {
      run.status = "max-chunks";
    }
  } catch (err) {
    run.status = "errored";
    run.error = (err as Error).message;
    progress.phase("error", run.error);
  }

  run.output = cleanedParts.join("\n\n");
  const eff = runEfficiency(run.chunks, run.chunkConfig);
  run.totalTokensUsed = eff.totalTokensUsed;
  run.totalTokensSaved = eff.tokensSaved;
  run.efficiencyPercent = eff.efficiencyPercent;

  // Reflection: only on completed, non-aborted runs with chunks. Failure is non-fatal.
  if (options.reflect !== false && run.status === "completed" && run.chunks.length > 0) {
    progress.phase("reflecting");
    try {
      const codeBlocks = (run.output.match(/```/g)?.length ?? 0) / 2;
      const reflectionPrompt =
        `Reflect on this completed run.\nGoal: ${goal.slice(0, 200)}\nFinal state: ${carryover}\n` +
        `Output (truncated): ${run.output.slice(0, 4000)}\nCode blocks: ${Math.floor(codeBlocks)}\n` +
        `Verdict: ratify if the goal is met, refine with concrete gaps otherwise.`;
      const { text } = await generator(reflectionPrompt, [], "You are the reflection pass. Be brief and concrete.", undefined, options.abortSignal);
      run.reflection = cleanMarkers(text);
    } catch (err) {
      run.reflection = undefined;
      run.error = `reflection failed (run preserved): ${(err as Error).message}`;
    }
  }

  run.durationMs = clock() - start;
  progress.phase(run.status === "errored" ? "error" : "complete", run.status);
  return run;
}

// The examples use a simplified stepFn({goal, carryover, step}) shape; adapt
// it to the provider-agnostic Generator contract (section 12).
function normalizeGenerator(options: RunOptions, fallback: Generator | undefined, goal: string): Generator {
  if (options.generator) return options.generator;
  if (options.stepFn) {
    const stepFn: StepFn = options.stepFn;
    let step = 0; // 0-based for the stepFn contract used across the examples
    return async (prompt) => {
      const result = await stepFn({ goal, carryover: extractCarryoverFromPrompt(prompt), step, prompt });
      step += 1;
      return { text: result.content };
    };
  }
  if (fallback) return fallback;
  throw new Error("Markovian: provide a generator or stepFn");
}

function extractCarryoverFromPrompt(prompt: string): string {
  const m = prompt.match(/\[CARRYOVER STATE\]\n([\s\S]*?)(?:\n\n|$)/);
  return m ? m[1].trim() : "";
}
