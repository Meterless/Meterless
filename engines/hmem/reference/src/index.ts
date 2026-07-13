// H-MEM reference implementation facade. Deterministic, zero runtime
// dependencies, in-memory with optional JSON persistence. This is the
// minimal runnable expression of AGENTS.md, not a production library.

import type { FeedbackKind, HMEMOptions, MemoryRecord, MiningEventType, QueryResult } from "./types.ts";
import type { AddInput } from "./memoryStore.ts";
import { MemoryStoreService } from "./memoryStore.ts";
import { TrustLedgerService } from "./trustLedger.ts";
import { MemoryMiningService } from "./memoryMining.ts";
import { MemoryRetrievalService } from "./memoryRetrieval.ts";
import { ConflictDetectionService } from "./conflictDetection.ts";
import { SleepCycleService } from "./sleepCycle.ts";
import { DreamingService } from "./dreaming.ts";

export * from "./types.ts";
export { MemoryStoreService } from "./memoryStore.ts";
export { TrustLedgerService } from "./trustLedger.ts";
export { MemoryMiningService, parseStrictJsonArray } from "./memoryMining.ts";
export { MemoryRetrievalService } from "./memoryRetrieval.ts";
export { ConflictDetectionService } from "./conflictDetection.ts";
export { SleepCycleService } from "./sleepCycle.ts";
export { DreamingService } from "./dreaming.ts";
export { embed, cosine, tokenize, jaccard } from "./embeddings.ts";

export class HMEM {
  readonly ledger: TrustLedgerService;
  readonly store: MemoryStoreService;
  readonly mining: MemoryMiningService;
  readonly retrieval: MemoryRetrievalService;
  readonly conflicts: ConflictDetectionService;
  readonly sleep: SleepCycleService;
  readonly dreaming: DreamingService;
  readonly clock: () => number;

  constructor(opts: HMEMOptions = {}) {
    this.clock = opts.clock ?? Date.now;
    const actor = opts.actor ?? "system";
    this.ledger = new TrustLedgerService(this.clock, opts.persistDir);
    this.store = new MemoryStoreService(this.clock, this.ledger, actor, opts.persistDir);
    this.mining = new MemoryMiningService(this.store, this.clock, opts.minerFn);
    this.retrieval = new MemoryRetrievalService(this.store, this.ledger, this.clock, actor);
    this.conflicts = new ConflictDetectionService(this.store, this.ledger, this.clock, actor);
    this.sleep = new SleepCycleService(this.store, this.ledger, this.clock, actor);
    this.dreaming = new DreamingService(this.store, this.ledger, this.clock, actor);
  }

  // Convenience surface mirroring HOW_TO_USE_H-MEM.md.
  add(input: AddInput): MemoryRecord {
    return this.store.add(input);
  }
  mine(event: MiningEventType, text: string, opts?: { chatId?: string }): Promise<MemoryRecord[]> {
    return this.mining.mineInteraction(event, text, opts);
  }
  query(query: string, opts?: { topN?: number; threshold?: number; chatId?: string }): QueryResult {
    return this.retrieval.query(query, opts);
  }
  feedback(memoryId: string, kind: FeedbackKind): void {
    this.retrieval.feedback(memoryId, kind);
  }
}
