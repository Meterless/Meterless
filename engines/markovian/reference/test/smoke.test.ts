import { describe, expect, it } from "vitest";
import {
  Markovian, modelTotals, resolveConfig, runEfficiency, parseMarkers, cleanMarkers, resetRunSeq,
  ConfigValidationError,
} from "../src/index.ts";
import type { ChunkInfo } from "../src/types.ts";

const T0 = 1_750_000_000_000;
const fixedClock = () => T0;

function mockStepFn(totalSteps: number) {
  return ({ step }: { step: number }) => {
    const last = step + 1 >= totalSteps;
    const content = `Work for step ${step + 1}: analysis text that fills the chunk with useful output. `.repeat(20);
    const marker = last
      ? "[TASK_COMPLETE]"
      : `[STATE_CHECKPOINT]\nCOMPLETED: step ${step + 1}\nREMAINING: ${totalSteps - step - 1} steps\nDECISIONS: none new\nCONTEXT: chain test`;
    return { content: content + "\n" + marker };
  };
}

describe("Markovian reference implementation", () => {
  it("reproduces the docs/efficiency-model.md worked example: N=20 -> 86%", () => {
    const { naiveTotal, markovianTotal, efficiency } = modelTotals(20);
    expect(naiveTotal).toBe(246_000);
    expect(markovianTotal).toBe(34_000);
    expect(efficiency * 100).toBeGreaterThan(85.5);
    expect(efficiency * 100).toBeLessThan(86.5);
  });

  it("validates config bounds with typed errors, never silent truncation", () => {
    expect(() => resolveConfig({ chunkSize: 500 })).toThrow(ConfigValidationError);
    expect(() => resolveConfig({ maxChunks: 99 })).toThrow(ConfigValidationError);
    expect(() => resolveConfig({ chunkSize: 2000, carryoverTokens: 1024 })).toThrow(/framing/);
    expect(resolveConfig({}).chunkSize).toBe(8000);
  });

  it("runs a chain to completion via the marker protocol", async () => {
    resetRunSeq();
    const m = new Markovian({ chunkConfig: { chunkSize: 4000, carryoverTokens: 640 }, clock: fixedClock });
    const run = await m.run({ goal: "test chain", stepFn: mockStepFn(5), reflect: false });
    expect(run.status).toBe("completed");
    expect(run.chunks.length).toBe(5);
    expect(run.output).not.toMatch(/STATE_CHECKPOINT|TASK_COMPLETE/);
    expect(run.chunks[1].carryover).toContain("COMPLETED: step 1"); // marker override won the cascade
    expect(run.tokenLabel).toBe("estimated");
  });

  it("stores a mandatory config snapshot; historical efficiency ignores current config", () => {
    const chunks: ChunkInfo[] = [1, 2, 3, 4].map((id) => ({ id, tokens: 1000, carryover: "", content: "" }));
    const snapA = resolveConfig({ carryoverTokens: 512 });
    const effA = runEfficiency(chunks, snapA);
    // standard = 1000 + 2000 + 3000 + 4000 = 10000; markovian = 4*512 + 4000 = 6048
    expect(effA.standardCost).toBe(10_000);
    expect(effA.markovianCost).toBe(6_048);
    const snapB = resolveConfig({ carryoverTokens: 2048 });
    const effB = runEfficiency(chunks, snapB);
    expect(effB.markovianCost).toBe(4 * 2048 + 4000); // same chunks, run-own config changes the math
    expect(effA.tokensSaved).not.toBe(effB.tokensSaved);
  });

  it("implements the [OVERLAP] block when overlapTokens > 0 (never accept-and-ignore)", async () => {
    resetRunSeq();
    const prompts: string[] = [];
    const m = new Markovian({ chunkConfig: { chunkSize: 4000, carryoverTokens: 640, overlapTokens: 64 }, clock: fixedClock });
    await m.run({
      goal: "overlap test",
      generator: async (prompt) => {
        prompts.push(prompt);
        const last = prompts.length >= 3;
        return { text: `content of chunk ${prompts.length} `.repeat(30) + (last ? "[TASK_COMPLETE]" : "[STATE_CHECKPOINT]\nCOMPLETED: chunk done and state carried forward cleanly") };
      },
      reflect: false,
    });
    expect(prompts.length).toBe(3);
    expect(prompts[0]).not.toContain("[OVERLAP]");
    expect(prompts[1]).toContain("[OVERLAP]");
    // overlap carries the tail of the previous chunk's cleaned output
    expect(prompts[1]).toContain("content of chunk 1");
  });

  it("reflection failure does not fail the run", async () => {
    resetRunSeq();
    let calls = 0;
    const m = new Markovian({ chunkConfig: { chunkSize: 4000, carryoverTokens: 640 }, clock: fixedClock });
    const run = await m.run({
      goal: "reflection failure test",
      generator: async () => {
        calls += 1;
        if (calls === 2) throw new Error("provider exploded during reflection");
        return { text: "all done in one chunk. [TASK_COMPLETE]" };
      },
    });
    expect(run.status).toBe("completed");
    expect(run.reflection).toBeUndefined();
    expect(run.error).toMatch(/reflection failed/);
  });

  it("abort stops within one chunk and preserves partial output", async () => {
    resetRunSeq();
    const controller = new AbortController();
    const m = new Markovian({ chunkConfig: { chunkSize: 4000, carryoverTokens: 640 }, clock: fixedClock });
    const run = await m.run({
      goal: "abort test",
      abortSignal: controller.signal,
      stepFn: ({ step }) => {
        if (step === 1) controller.abort();
        return { content: `chunk ${step + 1} content long enough to register in accounting. [STATE_CHECKPOINT]\nCOMPLETED: some work on the long task` };
      },
      reflect: false,
    });
    expect(run.status).toBe("aborted");
    expect(run.chunks.length).toBe(2);
    expect(run.output.length).toBeGreaterThan(0);
  });

  it("marker parsing handles pause markers and cleans display text", () => {
    const raw = 'Working. <NEEDS_TOOL tool="search" input="latest docs"/> more text.\n[STATE_CHECKPOINT]\nCOMPLETED: queued a tool call for the search step';
    const parsed = parseMarkers(raw);
    expect(parsed.needsTool).toEqual({ tool: "search", input: "latest docs" });
    expect(parsed.state).toContain("COMPLETED");
    expect(parsed.cleaned).not.toMatch(/NEEDS_TOOL|STATE_CHECKPOINT/);
    expect(cleanMarkers("done now [TASK_COMPLETE]")).toBe("done now");
  });

  it("history cumulative stats recompute against each run's own snapshot", async () => {
    resetRunSeq();
    const m1 = new Markovian({ chunkConfig: { chunkSize: 4000, carryoverTokens: 128 }, clock: fixedClock });
    const r1 = await m1.run({ goal: "a", stepFn: mockStepFn(4), reflect: false });
    m1.history.clear();
    m1.history.record(r1);
    const stats = m1.history.cumulativeStats();
    expect(stats.totalRuns).toBe(1);
    expect(stats.efficiencyHistory[0].efficiency).toBeCloseTo(r1.efficiencyPercent, 6);
  });

  it("is deterministic under a fixed clock", async () => {
    const go = async () => {
      resetRunSeq();
      const m = new Markovian({ chunkConfig: { chunkSize: 4000, carryoverTokens: 640 }, clock: fixedClock });
      const run = await m.run({ goal: "determinism", stepFn: mockStepFn(4), reflect: false });
      return JSON.stringify(run);
    };
    expect(await go()).toBe(await go());
  });
});
