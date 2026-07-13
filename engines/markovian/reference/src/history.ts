// Persistent history service (AGENTS.md section 4.7). The reference persists
// to a JSON file instead of IndexedDB; the contract is identical. The per-run
// chunkConfig snapshot is mandatory and historical efficiency is always
// recomputed against it (section 14).

import fs from "node:fs";
import path from "node:path";
import { runEfficiency } from "./configManager.ts";
import type { CumulativeStats, MarkovianRun } from "./types.ts";

export class HistoryService {
  private runs: MarkovianRun[] = [];
  private file?: string;
  private subscribers = new Set<() => void>();

  constructor(historyDir?: string) {
    if (historyDir) {
      fs.mkdirSync(historyDir, { recursive: true });
      this.file = path.join(historyDir, "history.json");
      if (fs.existsSync(this.file)) {
        this.runs = JSON.parse(fs.readFileSync(this.file, "utf-8")) as MarkovianRun[];
      }
    }
  }

  record(run: MarkovianRun): void {
    if (!run.chunkConfig) throw new Error("Markovian: run records require a chunkConfig snapshot (AGENTS.md section 2.3)");
    this.runs.push(run);
    this.persist();
    for (const fn of this.subscribers) fn();
  }

  list(): readonly MarkovianRun[] {
    return this.runs;
  }

  get(id: string): MarkovianRun | undefined {
    return this.runs.find((r) => r.id === id);
  }

  delete(id: string): void {
    this.runs = this.runs.filter((r) => r.id !== id);
    this.persist();
  }

  clear(): void {
    this.runs = [];
    this.persist();
  }

  subscribe(fn: () => void): () => void {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  }

  // Efficiency recomputed per run against ITS OWN snapshot, never a current config.
  cumulativeStats(): CumulativeStats {
    const stats: CumulativeStats = {
      totalRuns: this.runs.length,
      completedRuns: this.runs.filter((r) => r.status === "completed").length,
      totalTokensUsed: 0,
      totalTokensSaved: 0,
      averageEfficiency: 0,
      totalChunksProcessed: 0,
      lastRunTimestamp: 0,
      efficiencyHistory: [],
    };
    for (const run of this.runs) {
      const eff = runEfficiency(run.chunks, run.chunkConfig);
      stats.totalTokensUsed += eff.totalTokensUsed;
      stats.totalTokensSaved += eff.tokensSaved;
      stats.totalChunksProcessed += run.chunks.length;
      stats.lastRunTimestamp = Math.max(stats.lastRunTimestamp, run.timestamp);
      stats.efficiencyHistory.push({ timestamp: run.timestamp, efficiency: eff.efficiencyPercent, tokensSaved: eff.tokensSaved });
    }
    if (this.runs.length) {
      stats.averageEfficiency = stats.efficiencyHistory.reduce((s, e) => s + e.efficiency, 0) / this.runs.length;
    }
    return stats;
  }

  // Actual per-step aggregation for the Engine tab (section 8.1 actual mode).
  performanceByStep(): { step: number; avgTokens: number; samples: number }[] {
    const buckets = new Map<number, { total: number; samples: number }>();
    for (const run of this.runs) {
      for (const c of run.chunks) {
        const b = buckets.get(c.id) ?? { total: 0, samples: 0 };
        b.total += c.tokens;
        b.samples += 1;
        buckets.set(c.id, b);
      }
    }
    return [...buckets.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([step, b]) => ({ step, avgTokens: b.total / b.samples, samples: b.samples }));
  }

  private persist(): void {
    if (this.file) fs.writeFileSync(this.file, JSON.stringify(this.runs, null, 2) + "\n", "utf-8");
  }
}
