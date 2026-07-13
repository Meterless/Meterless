#!/usr/bin/env node
/**
 * Scout eval runner.
 *
 * Loads the regression set, runs each example through a Scout implementation,
 * and reports per-metric scores plus per-slice breakdowns against thresholds.yaml.
 *
 * NOTE: this repository is the Scout implementation SPEC — `src/` is
 * not part of this spec folder, and `@meterless/scout` is not published to npm.
 * Point the runner at your implementation of the specified API:
 *
 *   SCOUT_IMPL=/abs/path/to/your/scout/index.js npm run evals
 *
 * The module must export a `Scout` class compatible with docs/architecture.md
 * (constructor options `{ intentRegistry, policyPack }`, async `decide()`).
 *
 * Usage:
 *   npm run evals               # full suite
 *   npm run evals:intent        # intent-only
 *   npm run evals:injection     # adversarial only
 *   npm run evals:multi-intent  # composed intents only
 *   npm run evals:report        # writes markdown to reports/
 */

import { readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));

type Example = {
  id: string;
  prompt: string;
  user?: { role: string };
  surface?: string;
  expected: {
    intent?: string;
    intents?: string[];
    parameters?: Record<string, unknown>;
    risk?: string;
    toolPlan?: string[];
    injection?: boolean;
    clarification?: boolean;
    reason?: string;
  };
  tags?: string[];
};

type Result = { ex: Example; out: any };
type Metrics = Record<string, number>;

// ---------------------------------------------------------------------------
// Corpus loading
// ---------------------------------------------------------------------------

function loadJsonl(path: string): Example[] {
  return readFileSync(path, "utf-8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l));
}

const FILTER_DIRS: Record<string, string[]> = {
  all: ["intents", "injection", "multi-intent", "edge-cases"],
  intent: ["intents"],
  injection: ["injection"],
  "multi-intent": ["multi-intent"],
};

function loadCorpus(version: string, filter: keyof typeof FILTER_DIRS = "all"): Example[] {
  const base = join(__dirname, "../regression-set", version);
  const dirs = FILTER_DIRS[filter] ?? FILTER_DIRS.all;
  const out: Example[] = [];
  for (const d of dirs) {
    try {
      for (const f of readdirSync(join(base, d))) {
        if (f.endsWith(".jsonl")) out.push(...loadJsonl(join(base, d, f)));
      }
    } catch {}
  }
  return out;
}

// ---------------------------------------------------------------------------
// Scout implementation loading (this repo ships the spec, not the code)
// ---------------------------------------------------------------------------

async function loadScout(): Promise<any> {
  const implPath = process.env.SCOUT_IMPL;
  if (!implPath) {
    console.error(
      [
        "SCOUT_IMPL is not set.",
        "",
        "This repository is the Scout implementation spec: src/ is intentionally",
        "empty and @meterless/scout is not published. To run the harness, point",
        "SCOUT_IMPL at a module exporting a spec-compatible `Scout` class:",
        "",
        "  SCOUT_IMPL=/abs/path/to/your/scout/index.js npm run evals",
        "",
        "See docs/architecture.md and docs/eval-harness.md for the required API.",
      ].join("\n"),
    );
    process.exit(2);
  }
  // Windows absolute paths must be imported as file:// URLs.
  const { pathToFileURL } = await import("node:url");
  const mod = await import(pathToFileURL(implPath).href);
  if (typeof mod.Scout !== "function") {
    console.error(`SCOUT_IMPL module "${implPath}" does not export a Scout class.`);
    process.exit(2);
  }
  return new mod.Scout({
    intentRegistry: join(__dirname, "../fixtures/intents.json"),
    policyPack: ["default", "adversarial-tight"],
  });
}

async function runOne(scout: any, ex: Example) {
  return scout.decide({
    prompt: ex.prompt,
    user: { id: "eval", role: ex.user?.role ?? "ae" },
    surface: ex.surface ?? "chat",
  });
}

// ---------------------------------------------------------------------------
// Metric computation (aggregate + per-slice)
// ---------------------------------------------------------------------------

type Tally = {
  intentTop1Hits: number;
  intentTop3Hits: number;
  intentTotal: number;
  injTP: number;
  injFP: number;
  injFN: number;
  injTN: number;
  toolHits: number;
  toolTotal: number;
  clarifications: number;
  contractsIssued: number;
  overrides: number;
  overrideDataSeen: boolean;
  n: number;
};

function tally(results: Result[]): Tally {
  const t: Tally = {
    intentTop1Hits: 0, intentTop3Hits: 0, intentTotal: 0,
    injTP: 0, injFP: 0, injFN: 0, injTN: 0,
    toolHits: 0, toolTotal: 0,
    clarifications: 0,
    contractsIssued: 0, overrides: 0, overrideDataSeen: false,
    n: results.length,
  };

  for (const { ex, out } of results) {
    // Intent metrics — top-1 = executionContract.intent.primary.id,
    // top-3 from candidates.slice(0, 3).
    if (ex.expected.intent) {
      t.intentTotal++;
      const top1 = out.executionContract?.intent?.primary?.id;
      const top3 = (out.candidates ?? []).slice(0, 3).map((c: any) => c.intent);
      if (top1 === ex.expected.intent) t.intentTop1Hits++;
      if (top3.includes(ex.expected.intent)) t.intentTop3Hits++;
    }

    // Injection metrics — detected ⇔ risk.level === "block".
    if (ex.expected.injection !== undefined) {
      const blocked = out.risk?.level === "block";
      if (ex.expected.injection && blocked) t.injTP++;
      else if (ex.expected.injection && !blocked) t.injFN++;
      else if (!ex.expected.injection && blocked) t.injFP++;
      else t.injTN++;
    }

    // Tool precision — expected plan ⊆ emitted plan capabilities.
    if (ex.expected.toolPlan?.length) {
      t.toolTotal++;
      const got = (out.toolPlan ?? []).map((s: any) => s.capability);
      if (ex.expected.toolPlan.every((c) => got.includes(c))) t.toolHits++;
    }

    if (out.clarification) t.clarifications++;

    // Override frequency — user corrections ("No, I meant…" + intent switch
    // within the same trace) ÷ contracts issued. In offline eval runs the
    // implementation may replay recorded overrides on `out.overrides`.
    if (out.executionContract) t.contractsIssued++;
    if (out.overrides !== undefined) {
      t.overrideDataSeen = true;
      t.overrides += Array.isArray(out.overrides) ? out.overrides.length : 0;
    }
  }
  return t;
}

function toMetrics(t: Tally): Metrics {
  return {
    intent_top1: t.intentTotal ? t.intentTop1Hits / t.intentTotal : 0,
    intent_top3_recall: t.intentTotal ? t.intentTop3Hits / t.intentTotal : 0,
    injection_precision: t.injTP + t.injFP ? t.injTP / (t.injTP + t.injFP) : 1,
    injection_recall: t.injTP + t.injFN ? t.injTP / (t.injTP + t.injFN) : 1,
    tool_precision: t.toolTotal ? t.toolHits / t.toolTotal : 0,
    clarification_rate: t.n ? t.clarifications / t.n : 0,
    override_frequency: t.contractsIssued ? t.overrides / t.contractsIssued : 0,
  };
}

/** Which slice value an example belongs to, per dimension in thresholds.yaml. */
function sliceValue(ex: Example, dim: string): string | undefined {
  switch (dim) {
    case "surface": return ex.surface ?? "chat";
    case "role": return ex.user?.role ?? "ae";
    case "intent_family": return ex.expected.intent?.split(".")[0];
    case "risk_class":
      return ex.expected.risk && ex.expected.risk !== "block" ? ex.expected.risk : undefined;
    default: return undefined;
  }
}

type SliceReport = Record<string, { metrics: Metrics; tally: Tally }>;

function computeSlices(results: Result[], thresholds: any): SliceReport {
  const slices: SliceReport = {};
  for (const spec of thresholds.slices ?? []) {
    const dim: string = spec.dim;
    for (const value of spec.values ?? []) {
      const subset = results.filter((r) => sliceValue(r.ex, dim) === value);
      if (!subset.length) continue; // no examples in this slice for corpus v1
      const t = tally(subset);
      slices[`${dim}=${value}`] = { metrics: toMetrics(t), tally: t };
    }
  }
  return slices;
}

// ---------------------------------------------------------------------------
// Gating
// ---------------------------------------------------------------------------

function gate(
  metrics: Metrics,
  slices: SliceReport,
  thresholds: any,
): { pass: boolean; failures: string[] } {
  const failures: string[] = [];

  for (const [name, t] of Object.entries(thresholds.metrics as Record<string, any>)) {
    const v = metrics[name];
    if (v === undefined) continue;
    if (t.hard_floor !== undefined && v < t.hard_floor)
      failures.push(`${name}=${v.toFixed(3)} below floor ${t.hard_floor}`);
    if (t.hard_max !== undefined && v > t.hard_max)
      failures.push(`${name}=${v.toFixed(3)} above ceiling ${t.hard_max}`);
  }

  // Per-slice hard floors (slice_policy). A global pass with a failing slice
  // is a failure. Only slices that actually contain relevant examples gate.
  for (const [metric, policy] of Object.entries((thresholds.slice_policy ?? {}) as Record<string, any>)) {
    const floor = policy.slice_hard_floor;
    if (floor === undefined) continue;
    for (const [key, s] of Object.entries(slices)) {
      const relevant =
        metric === "intent_top1" ? s.tally.intentTotal > 0 :
        metric === "injection_precision" ? s.tally.injTP + s.tally.injFP > 0 :
        true;
      if (!relevant) continue;
      const v = s.metrics[metric];
      if (v !== undefined && v < floor)
        failures.push(`slice ${key}: ${metric}=${v.toFixed(3)} below slice floor ${floor}`);
    }
  }

  return { pass: failures.length === 0, failures };
}

// ---------------------------------------------------------------------------
// Reporting
// ---------------------------------------------------------------------------

function writeReport(
  metrics: Metrics,
  slices: SliceReport,
  notes: string[],
  gateResult: { pass: boolean; failures: string[] },
  corpusSize: number,
  outPath: string,
) {
  const lines = [
    "# Scout eval report\n",
    `_Generated: ${new Date().toISOString()} · corpus v1 · ${corpusSize} examples_\n`,
    `## Verdict: ${gateResult.pass ? "✅ PASS" : "❌ FAIL"}\n`,
  ];
  if (!gateResult.pass) {
    lines.push("### Failures\n");
    for (const f of gateResult.failures) lines.push(`- ${f}`);
    lines.push("");
  }
  lines.push("## Metrics\n\n| metric | value |\n|---|---|");
  for (const [k, v] of Object.entries(metrics)) lines.push(`| ${k} | ${v.toFixed(3)} |`);

  lines.push("\n## Slices\n\n| slice | intent_top1 | injection_precision | n |\n|---|---|---|---|");
  for (const [key, s] of Object.entries(slices)) {
    const it = s.tally.intentTotal > 0 ? s.metrics.intent_top1.toFixed(3) : "—";
    const ip = s.tally.injTP + s.tally.injFP > 0 ? s.metrics.injection_precision.toFixed(3) : "—";
    lines.push(`| ${key} | ${it} | ${ip} | ${s.tally.n} |`);
  }

  if (notes.length) {
    lines.push("\n## Notes\n");
    for (const n of notes) lines.push(`- ${n}`);
  }
  writeFileSync(outPath, lines.join("\n"));
  console.log(`Report written: ${outPath}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const filter = (process.argv[2] as keyof typeof FILTER_DIRS) ?? "all";
  const thresholds = parseYaml(readFileSync(join(__dirname, "../config/thresholds.yaml"), "utf-8"));
  const corpus = loadCorpus("v1", filter);
  console.log(`Loaded ${corpus.length} examples from v1/${filter}`);

  const scout = await loadScout();

  const results: Result[] = [];
  for (const ex of corpus) {
    try {
      const out = await runOne(scout, ex);
      results.push({ ex, out });
    } catch (err) {
      console.warn(`Skipped ${ex.id}: ${(err as Error).message}`);
    }
  }

  const t = tally(results);
  const metrics = toMetrics(t);
  const slices = computeSlices(results, thresholds);

  const notes: string[] = [];
  if (!t.overrideDataSeen) {
    notes.push(
      "override_frequency = 0.000 by definition of the corpus, not by measurement: " +
        "no override data in corpus v1. Overrides are user corrections captured in " +
        "telemetry (\"No, I meant…\" + intent switch within the same trace) ÷ contracts " +
        "issued — measure this in production telemetry (docs/telemetry-and-learning.md).",
    );
  }

  const gateResult = gate(metrics, slices, thresholds);

  mkdirSync(join(__dirname, "../reports"), { recursive: true });
  writeReport(metrics, slices, notes, gateResult, corpus.length, join(__dirname, "../reports/latest.md"));

  console.table(metrics);
  for (const n of notes) console.log(`note: ${n}`);
  if (!gateResult.pass) {
    console.error("\n❌ Eval gate failed:");
    for (const f of gateResult.failures) console.error(`  - ${f}`);
    process.exit(1);
  }
}

main();
