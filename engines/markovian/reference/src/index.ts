// Markovian reference implementation facade. Deterministic, zero runtime
// dependencies. Implements AGENTS.md: config bounds and validation, marker
// protocol, compression cascade, mode prompts, orchestrator loop, progress,
// history with mandatory config snapshots, reflection, and the section 14
// accounting rules (chars/4 labeled "estimated"; [OVERLAP] implemented).

import { resolveConfig } from "./configManager.ts";
import { CarryoverService } from "./carryover.ts";
import { HistoryService } from "./history.ts";
import { orchestrate } from "./orchestrator.ts";
import { ProgressService } from "./progress.ts";
import type { ChunkConfig, Generator, MarkovianOptions, MarkovianRun, ProgressState, RunOptions } from "./types.ts";

export * from "./types.ts";
export { resolveConfig, projectionCurve, runEfficiency, modelTotals, DOC_DEFAULTS } from "./configManager.ts";
export { parseMarkers, cleanMarkers } from "./markers.ts";
export { CarryoverService, canonicalBlock } from "./carryover.ts";
export { buildPrompt, overlapSlice } from "./promptBuilder.ts";
export { ProgressService } from "./progress.ts";
export { HistoryService } from "./history.ts";
export { resetRunSeq } from "./orchestrator.ts";

export class Markovian {
  readonly config: ChunkConfig;
  readonly history: HistoryService;
  readonly progress: ProgressService;
  private carryoverService: CarryoverService;
  private clock: () => number;
  private defaultGenerator?: Generator;

  constructor(opts: MarkovianOptions = {}) {
    this.config = resolveConfig(opts.chunkConfig);
    this.clock = opts.clock ?? Date.now;
    this.history = new HistoryService(opts.historyDir);
    this.progress = new ProgressService(this.clock, this.config.maxChunks);
    this.carryoverService = new CarryoverService(opts.compressorFn);
    this.defaultGenerator = opts.generator;
  }

  onProgress(fn: (s: ProgressState) => void): () => void {
    return this.progress.subscribe(fn);
  }

  async run(options: RunOptions): Promise<MarkovianRun> {
    const run = await orchestrate({
      options,
      config: this.config,
      clock: this.clock,
      progress: this.progress,
      carryoverService: this.carryoverService,
      defaultGenerator: this.defaultGenerator,
    });
    this.history.record(run);
    return run;
  }
}
