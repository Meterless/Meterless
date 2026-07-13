// Canonical H-MEM shapes per AGENTS.md section 2 and 9.

export type MemoryType = "personal" | "factual" | "preference" | "general";
export type MemoryLayer = "short_term" | "working" | "long_term";
export type ProvenanceOrigin =
  | "chat_message" | "user_correction" | "file_save" | "file_open" | "file_edit"
  | "model_response" | "plan_completion" | "document" | "manual" | "dream" | "sleep_synthesis";

export interface Provenance {
  origin: ProvenanceOrigin;
  learnedAt: number;
  label: string;
  refs?: string[];
}

export interface MemoryRecord {
  id: string;
  content: string;
  type: MemoryType;
  layer: MemoryLayer;
  timestamp: number;
  lastAccessed: number;
  accessCount: number;
  tags: string[];
  embedding: number[];
  score?: number;
  confidence: number;      // mandatory
  source: string;          // mandatory; construction rejects records without it
  provenance: Provenance;  // mandatory for new writes
  chatId?: string;
  missionId?: string;
  goalRunId?: string;
  domain: string;
  namespace: string;
  entities: string[];      // cap 10
  relatedTo: string[];     // cap 5
  supersedes?: string;
  supersededBy?: string;   // set by conflict resolution; drives the retrieval penalty
  derivedFrom?: string[];
}

// The canonical 17 ledger action types (AGENTS.md section 9.1).
export type LedgerAction =
  | "create" | "read" | "update" | "delete" | "feedback" | "promote" | "demote" | "merge"
  | "conflict_detected" | "conflict_resolved"
  | "sleep_consolidate" | "sleep_archive" | "sleep_synthesize"
  | "dream_proposed" | "dream_approved" | "dream_rejected" | "restore";

export interface LedgerEntry {
  memoryId: string;
  action: LedgerAction;
  actor: string;
  timestamp: number;
  previousState?: Partial<MemoryRecord>;
  newState?: Partial<MemoryRecord>;
  details?: Record<string, unknown>;
}

export type MiningEventType =
  | "chat_message" | "user_correction" | "file_save" | "file_open" | "file_edit"
  | "model_response" | "plan_completion";

export type DreamProposalType = "insight" | "domain" | "invariant";

export interface DreamProposal {
  id: string;
  type: DreamProposalType;
  content: string;
  derivedFrom: string[];
  suggestedDomain?: string;
  status: "proposed" | "approved" | "rejected";
}

export interface SleepPreview {
  toConsolidate: string[];
  toArchive: string[];
  toSynthesize: string[][];
}

export interface SleepReport {
  backupId: string;
  consolidated: number;
  archived: number;
  synthesized: number;
  actionLog: string[];
}

export interface ConflictRecord {
  id: string;
  memoryA: string;
  memoryB: string;
  reason: string;
  confidence: number;
  resolved: boolean;
  resolution?: "keep_a" | "keep_b" | "keep_both" | "merge" | "delete_both";
}

export interface RetrievedMemory {
  memory: MemoryRecord;
  relevance: number;
}

export interface QueryResult {
  memories: RetrievedMemory[];
  context: string;
  trace: {
    retrievalReason: string;
    strategy: "minimal" | "personal" | "comprehensive";
    scores: Record<string, number>;
  };
}

export interface HMEMOptions {
  clock?: () => number;          // injectable time source; default Date.now
  persistDir?: string;           // when set, state.json + ledger.jsonl live here
  actor?: string;                // default "system"
  minerFn?: (prompt: string) => Promise<string>; // optional model hook; default model-free path
}

export const FEEDBACK_DELTAS = { helpful: 0.05, not_helpful: -0.03, wrong: -0.2 } as const;
export type FeedbackKind = keyof typeof FEEDBACK_DELTAS;

export const DEFAULTS = {
  retrievalTopN: 5,
  retrievalThreshold: 0.35,   // on the final score, after the confidence multiplier
  consolidationDays: 7,
  archiveMinDays: 30,
  archiveMaxAccess: 2,
  synthesisCosine: 0.82,
  dreamClusterMinSize: 2,
  dreamRelatedness: 0.35,
  maxDreamProposalsPerType: 8,
  conflictAutoResolveGate: 0.7,
  entityCap: 10,
  relatedCap: 5,
  recencyDays: 14,
} as const;

export const clamp01 = (x: number): number => Math.min(1, Math.max(0, x));

export const DAY_MS = 24 * 60 * 60 * 1000;
