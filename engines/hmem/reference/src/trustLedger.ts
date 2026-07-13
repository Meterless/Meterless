// Append-only trust ledger (AGENTS.md section 9.1). Entries are never
// mutated or deleted. history() reconstructs a memory's full change record
// from the previousState/newState snapshots carried on each entry.

import fs from "node:fs";
import path from "node:path";
import type { LedgerAction, LedgerEntry, MemoryRecord } from "./types.ts";

export class TrustLedgerService {
  private entries: LedgerEntry[] = [];
  private file?: string;

  constructor(private clock: () => number, persistDir?: string) {
    if (persistDir) {
      this.file = path.join(persistDir, "ledger.jsonl");
      if (fs.existsSync(this.file)) {
        this.entries = fs
          .readFileSync(this.file, "utf-8")
          .split("\n")
          .filter(Boolean)
          .map((l) => JSON.parse(l) as LedgerEntry);
      }
    }
  }

  log(
    memoryId: string,
    action: LedgerAction,
    actor: string,
    extra?: { previousState?: Partial<MemoryRecord>; newState?: Partial<MemoryRecord>; details?: Record<string, unknown> }
  ): LedgerEntry {
    const entry: LedgerEntry = { memoryId, action, actor, timestamp: this.clock(), ...extra };
    this.entries.push(entry);
    if (this.file) fs.appendFileSync(this.file, JSON.stringify(entry) + "\n", "utf-8");
    return entry;
  }

  history(memoryId: string): LedgerEntry[] {
    return this.entries.filter((e) => e.memoryId === memoryId);
  }

  all(): readonly LedgerEntry[] {
    return this.entries;
  }

  stats(): Record<string, number> {
    const out: Record<string, number> = {};
    for (const e of this.entries) out[e.action] = (out[e.action] ?? 0) + 1;
    return out;
  }
}
