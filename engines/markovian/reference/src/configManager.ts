// Config manager (AGENTS.md section 4.1) plus the efficiency math from
// section 6 and docs/efficiency-model.md. Validation throws a typed error;
// nothing is silently truncated or ignored.

import {
  BOUNDS, ConfigValidationError, DEFAULT_CONFIG, FRAMING_TOKENS, OUTPUT_BUDGET,
} from "./types.ts";
import type { ChunkConfig, ChunkInfo } from "./types.ts";

export function resolveConfig(partial?: Partial<ChunkConfig>): ChunkConfig {
  const cfg: ChunkConfig = { ...DEFAULT_CONFIG, ...partial };
  for (const key of ["chunkSize", "maxChunks", "carryoverTokens", "overlapTokens"] as const) {
    const b = BOUNDS[key];
    const v = cfg[key];
    if (!Number.isFinite(v)) throw new ConfigValidationError(`${key} must be a number`);
    if (v < b.min || v > b.max) throw new ConfigValidationError(`${key}=${v} outside [${b.min}, ${b.max}]`);
    // Ruling: the spec's "step" values are UI slider granularity, not hard
    // validation. The spec's own default carryoverTokens=800 is unreachable
    // under a strict step-128 grid from min=128, so a strict reading would
    // reject the documented default. Only min/max are enforced here.
  }
  if (cfg.carryoverTokens <= 0) throw new ConfigValidationError("carryoverTokens must be > 0");
  if (cfg.chunkSize < FRAMING_TOKENS + cfg.carryoverTokens + OUTPUT_BUDGET) {
    throw new ConfigValidationError(
      `chunkSize=${cfg.chunkSize} < framing(${FRAMING_TOKENS}) + carryover(${cfg.carryoverTokens}) + outputBudget(${OUTPUT_BUDGET})`
    );
  }
  return cfg;
}

// Projected efficiency curve (section 4.1), 10 steps.
export function projectionCurve(cfg: ChunkConfig, steps = 10): { step: number; standard: number; markovian: number }[] {
  const out = [];
  for (let step = 1; step <= steps; step++) {
    const historySize = (step - 1) * cfg.chunkSize;
    out.push({
      step,
      standard: historySize + cfg.chunkSize,
      markovian: cfg.carryoverTokens + cfg.chunkSize,
    });
  }
  return out;
}

// Historical run efficiency (section 6.3). ALWAYS computed against the
// config passed in, which must be the run's own persisted snapshot.
export function runEfficiency(chunks: ChunkInfo[], cfg: ChunkConfig): {
  totalTokensUsed: number;
  standardCost: number;
  markovianCost: number;
  tokensSaved: number;
  efficiencyPercent: number;
} {
  const totalTokensUsed = chunks.reduce((s, c) => s + c.tokens, 0);
  let standardCost = 0;
  let prefix = 0;
  for (const c of chunks) {
    standardCost += prefix + c.tokens;
    prefix += c.tokens;
  }
  const markovianCost = chunks.length * cfg.carryoverTokens + totalTokensUsed;
  const tokensSaved = Math.max(0, standardCost - markovianCost);
  return {
    totalTokensUsed,
    standardCost,
    markovianCost,
    tokensSaved,
    efficiencyPercent: standardCost > 0 ? (tokensSaved / standardCost) * 100 : 0,
  };
}

// Symbolic cost model from docs/efficiency-model.md. modelEfficiency(20)
// with the documented defaults reproduces the doc's 86% worked example.
export interface CostModelConstants {
  F: number; // framing
  G: number; // goal
  S: number; // step input
  O: number; // per-step output
  C: number; // carryover
}
export const DOC_DEFAULTS: CostModelConstants = { F: 400, G: 200, S: 300, O: 1200, C: 800 };

export function modelTotals(N: number, k: CostModelConstants = DOC_DEFAULTS): {
  naiveTotal: number;
  markovianTotal: number;
  savings: number;
  efficiency: number; // 0..1
} {
  // Input-token totals exactly as derived in docs/efficiency-model.md:
  //   naive_total     = N*(F + G + S) + O * N*(N-1)/2
  //   markovian_total = N*(F + G + C + S)
  const naiveTotal = N * (k.F + k.G + k.S) + (k.O * N * (N - 1)) / 2;
  const markovianTotal = N * (k.F + k.G + k.C + k.S);
  const savings = naiveTotal - markovianTotal;
  return { naiveTotal, markovianTotal, savings, efficiency: savings / naiveTotal };
}
