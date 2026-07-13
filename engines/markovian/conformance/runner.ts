// Markovian conformance runner. Executes ANY implementation against the
// spec's hard rules (AGENTS.md sections 6 and 14) and prints a scorecard.
//
//   npx tsx runner.ts                                       # runs the reference
//   MARKOVIAN_IMPL=/abs/path/index.ts npx tsx runner.ts     # runs YOURS
//
// Required exports: Markovian (class), and either modelTotals + runEfficiency
// or equivalent efficiency math reachable through runs. The overlap contract
// is three-way: implementing [OVERLAP] passes, rejecting non-zero
// overlapTokens passes, accepting-and-ignoring FAILS.

import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const implPath = process.env.MARKOVIAN_IMPL ?? path.join(here, "..", "reference", "src", "index.ts");

interface CaseResult { id: string; description: string; status: "PASS" | "FAIL"; detail?: string }
const results: CaseResult[] = [];
const T0 = 1_750_000_000_000;

async function loadImpl(): Promise<any> {
  try {
    const mod = await import(pathToFileURL(path.resolve(implPath)).href);
    if (typeof mod.Markovian !== "function") {
      console.error(`conformance: module at ${implPath} does not export a Markovian class. Exports: ${Object.keys(mod).join(", ") || "(none)"}`);
      process.exit(2);
    }
    return mod;
  } catch (err) {
    console.error(`conformance: could not load implementation at ${implPath}\n  ${(err as Error).message}`);
    process.exit(2);
  }
}

const record = async (id: string, description: string, fn: () => void | Promise<void>) => {
  try {
    await fn();
    results.push({ id, description, status: "PASS" });
  } catch (err) {
    results.push({ id, description, status: "FAIL", detail: (err as Error).message });
  }
};
const assert = (cond: boolean, msg: string) => {
  if (!cond) throw new Error(msg);
};

function stepGen(total: number) {
  let calls = 0;
  const fn = async (prompt: string) => {
    calls += 1;
    const done = calls >= total;
    const body = `Output for step ${calls} with enough text to register in the accounting math. `.repeat(10);
    const marker = done
      ? "[TASK_COMPLETE]"
      : `[STATE_CHECKPOINT]\nCOMPLETED: steps 1-${calls}\nREMAINING: ${total - calls}\nDECISIONS: none\nCONTEXT: conformance`;
    return { text: body + "\n" + marker };
  };
  fn.calls = () => calls;
  return fn;
}

async function main(): Promise<void> {
  const mod = await loadImpl();
  const { Markovian } = mod;

  await record("eff-001", "efficiency model reproduces the documented worked example: N=20 -> 86% (within 0.5%)", () => {
    assert(typeof mod.modelTotals === "function", "export modelTotals(N) implementing docs/efficiency-model.md");
    const { naiveTotal, markovianTotal, efficiency } = mod.modelTotals(20);
    assert(naiveTotal === 246_000, `naiveTotal ${naiveTotal}, expected 246000`);
    assert(markovianTotal === 34_000, `markovianTotal ${markovianTotal}, expected 34000`);
    assert(Math.abs(efficiency * 100 - 86.18) < 0.5, `efficiency ${(efficiency * 100).toFixed(2)}%, expected ~86.18%`);
  });

  await record("snap-001", "run records carry a mandatory chunkConfig snapshot", async () => {
    const m = new Markovian({ chunkConfig: { chunkSize: 4000, carryoverTokens: 640 }, clock: () => T0 });
    const run = await m.run({ goal: "snapshot check", generator: stepGen(3), reflect: false });
    assert(run.chunkConfig && run.chunkConfig.carryoverTokens === 640, "run.chunkConfig snapshot missing or wrong");
  });

  await record("snap-002", "historical efficiency is computed against the run's own snapshot, not current config", () => {
    assert(typeof mod.runEfficiency === "function", "export runEfficiency(chunks, config)");
    const chunks = [1, 2, 3, 4].map((id) => ({ id, tokens: 1000, carryover: "", content: "" }));
    const a = mod.runEfficiency(chunks, { chunkSize: 8000, maxChunks: 24, carryoverTokens: 512, overlapTokens: 0 });
    const b = mod.runEfficiency(chunks, { chunkSize: 8000, maxChunks: 24, carryoverTokens: 2048, overlapTokens: 0 });
    assert(a.standardCost === 10_000, `standardCost ${a.standardCost}, expected 10000 (prefix-sum formula)`);
    assert(a.markovianCost === 6_048, `markovianCost ${a.markovianCost}, expected 4*512+4000=6048`);
    assert(a.tokensSaved !== b.tokensSaved, "different snapshots must produce different savings for the same chunks");
  });

  await record("ovl-001", "overlap contract: implement [OVERLAP] or reject non-zero; accept-and-ignore fails", async () => {
    let constructed: any;
    try {
      constructed = new Markovian({ chunkConfig: { chunkSize: 4000, carryoverTokens: 640, overlapTokens: 64 }, clock: () => T0 });
    } catch (err) {
      const msg = (err as Error).message;
      assert(/overlap/i.test(msg), `rejection must name overlapTokens; got: ${msg}`);
      return; // rejecting non-zero values is a conforming choice
    }
    const prompts: string[] = [];
    await constructed.run({
      goal: "overlap conformance",
      generator: async (prompt: string) => {
        prompts.push(prompt);
        const done = prompts.length >= 3;
        return { text: `chunk ${prompts.length} content `.repeat(20) + (done ? "[TASK_COMPLETE]" : "[STATE_CHECKPOINT]\nCOMPLETED: chunk recorded with carried state") };
      },
      reflect: false,
    });
    assert(prompts.slice(1).some((p) => p.includes("[OVERLAP]")), "config accepted overlapTokens=64 but no [OVERLAP] block appeared: accept-and-ignore is a contract violation");
  });

  await record("lab-001", "token numbers are labeled: runs carry estimated or measured", async () => {
    const m = new Markovian({ chunkConfig: { chunkSize: 4000, carryoverTokens: 640 }, clock: () => T0 });
    const run = await m.run({ goal: "label check", generator: stepGen(2), reflect: false });
    assert(run.tokenLabel === "estimated" || run.tokenLabel === "measured", `run.tokenLabel is "${run.tokenLabel}"; every number carries its source`);
  });

  await record("ref-001", "reflection failure does not fail the run", async () => {
    let calls = 0;
    const m = new Markovian({ chunkConfig: { chunkSize: 4000, carryoverTokens: 640 }, clock: () => T0 });
    const run = await m.run({
      goal: "reflection failure",
      generator: async () => {
        calls += 1;
        if (calls === 2) throw new Error("provider exploded in reflection");
        return { text: "done in one chunk [TASK_COMPLETE]" };
      },
    });
    assert(run.status === "completed", `run.status ${run.status}; reflection failures must not fail the run`);
  });

  await record("mrk-001", "markers are cleaned from display content and drive completion", async () => {
    const m = new Markovian({ chunkConfig: { chunkSize: 4000, carryoverTokens: 640 }, clock: () => T0 });
    const run = await m.run({ goal: "marker cleaning", generator: stepGen(3), reflect: false });
    assert(run.status === "completed", `status ${run.status}, expected completed via [TASK_COMPLETE]`);
    assert(!/STATE_CHECKPOINT|TASK_COMPLETE/.test(run.output), "markers leaked into display output");
    assert(run.chunks.length === 3, `chunks ${run.chunks.length}, expected 3`);
  });

  await record("cfg-001", "config bounds reject out-of-range values with a typed error, never silent truncation", () => {
    let threw = false;
    try {
      new Markovian({ chunkConfig: { chunkSize: 128, carryoverTokens: 640 }, clock: () => T0 });
    } catch {
      threw = true;
    }
    assert(threw, "chunkSize=128 (below min 1000) must be rejected, not clamped");
  });

  const pass = results.filter((r) => r.status === "PASS").length;
  console.log(`\nMarkovian conformance: implementation = ${implPath}\n`);
  for (const r of results) console.log(`  ${r.status} ${r.id} ${r.description}${r.detail ? `\n       ${r.detail}` : ""}`);
  console.log(`\n  ${pass}/${results.length} checks passed`);
  process.exit(pass === results.length ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
