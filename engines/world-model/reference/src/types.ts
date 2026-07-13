/**
 * Record shapes for the World Model reference implementation.
 *
 * Source of truth: AGENTS.md section 2 and docs/aggregate-shapes.md.
 * The five write primitives are upsertEntity, upsertContext, relate,
 * assertFact, and snapshot. Everything else is derived.
 */

export type ISODate = string;

export type EntityId = string;
export type ContextId = string;
export type RelationshipId = string;
export type FactId = string;
export type EventId = string;

/** Every write carries provenance. No provenance, no write (rejected at the boundary). */
export type Provenance = {
  kind: "manual" | "rss" | "api" | "file" | "agent" | "pipeline" | "wire" | (string & {});
  /** user id, pipeline id, agent id */
  by?: string;
  /** observation timestamp. Record timestamps derive from this, never from wall clock. */
  at: ISODate | Date;
  url?: string;
  checksum?: string;
  /** ingest/replay run identifier, joins events to a run */
  runId?: string;
};

/** Provenance after normalization: `at` is always an ISO string internally. */
export type StoredProvenance = Omit<Provenance, "at"> & { at: ISODate };

/**
 * Entity record layers per AGENTS.md section 2.2:
 * identity / semantics (attrs) / continuity anchors (aliases, embedding) /
 * aggregates (rollups) / provenance / lifecycle.
 */
export type Entity = {
  type: string;
  id: EntityId;
  attrs: Record<string, unknown>;
  schemaVersion: number;
  source: StoredProvenance;
  createdAt: ISODate;
  updatedAt: ISODate;
  /** canonical display name, when known */
  name?: string;
  /** every name the sources used; continuity anchor + merge survivor set */
  aliases: string[];
  /** lifecycle */
  state: "emerging" | "active" | "archived";
  /** cheap-to-read rollups, recomputed by pipeline step 9 (rebuild aggregates) */
  aggregates?: {
    mentionCount: number;
    firstSeenAt?: ISODate;
    lastSeenAt?: ISODate;
    linkedStoryIds: string[];
  };
};

export type Context = {
  type: string;
  id: ContextId;
  attrs: Record<string, unknown>;
  parent?: ContextId;
  startedAt?: ISODate;
  endedAt?: ISODate;
  schemaVersion: number;
  source: StoredProvenance;
  createdAt: ISODate;
  updatedAt: ISODate;
};

/**
 * Bitemporal edge. `validTo` unset means open-ended. A superseding observation
 * CLOSES the old edge (sets validTo) and opens a new one; it never deletes.
 */
export type Relationship = {
  id: RelationshipId;
  from: EntityId;
  type: string;
  to: EntityId;
  context?: ContextId;
  attrs?: Record<string, unknown>;
  validFrom?: ISODate;
  validTo?: ISODate;
  schemaVersion: number;
  source: StoredProvenance;
  createdAt: ISODate;
  /** set when a superseding relate closed this edge */
  supersededBy?: RelationshipId;
};

export type Fact = {
  id: FactId;
  about: EntityId;
  predicate: string;
  value: unknown;
  confidence: number;
  context?: ContextId;
  source: StoredProvenance;
  assertedAt: ISODate;
  supersededBy?: FactId;
};

export type Snapshot = {
  id: string;
  at: ISODate;
  context?: ContextId;
  entities: EntityId[];
  attrs?: Record<string, unknown>;
  schemaVersion: number;
  source: StoredProvenance;
};

export type Tombstone = {
  targetId: string;
  reason?: string;
  at: ISODate;
  by?: string;
};

export type Alias = {
  aliasId: EntityId;
  primaryId: EntityId;
  mergedAt: ISODate;
  mergedBy: string;
  reason: string;
};

export type ViewRebuild = {
  view: string;
  at: ISODate;
  durationMs: number;
  eventsReplayed: number;
};

export type EventKind =
  | "upsertEntity"
  | "upsertContext"
  | "relate"
  | "assertFact"
  | "snapshot"
  | "tombstone"
  | "alias"
  | "view-rebuild";

/** Append-only log entry. State is a fold over events; views are projections of the fold. */
export type WorldEvent = {
  id: EventId;
  /** monotonic within the namespace; determined by append order, not writer clocks */
  seq: number;
  kind: EventKind;
  payload: Entity | Context | Relationship | Fact | Snapshot | Tombstone | Alias | ViewRebuild;
  schemaVersion: number;
  at: ISODate;
};

/* ------------------------------------------------------------------ */
/* Aggregate shapes (AGENTS.md section 2.1)                            */
/* ------------------------------------------------------------------ */

/** Timeline aggregate (Example A): a history of snapshots. */
export type TimelineAggregate = {
  id: string;
  name: string;
  snapshots: Snapshot[];
  activeSnapshotIndex: number;
  registries: Record<string, EntityId[]>;
};

/** Stream-cluster aggregate (Example B): raw items clustered into stories. */
export type StoryAggregate = {
  id: string;
  title: string;
  /** observation ids, sorted */
  memberIds: string[];
  /** normalized entity names mentioned across members, sorted */
  entityNames: string[];
  /** resolved entity ids, sorted */
  entityIds: EntityId[];
  /** distinct provenance kinds/urls across members, sorted */
  sources: string[];
  firstAt: ISODate;
  lastAt: ISODate;
  /** derived records inferred in pipeline step 5 */
  milestones: { kind: string; at: ISODate }[];
};

/** Pure graph aggregate: nodes + bitemporal edges. */
export type GraphAggregate = {
  nodes: { id: string; type: string; properties: Record<string, unknown> }[];
  edges: Relationship[];
};

/** Per-story score snapshot, persisted by pipeline step 4 (score / measure). */
export type ScoreSnapshot = {
  storyId: string;
  at: ISODate;
  /** velocity(w) = mentions in window w / hours(w), over bucketed windows */
  velocity1h: number;
  velocity24h: number;
  velocity7d: number;
  /** sign(velocity(current hour bucket) - velocity(previous hour bucket)) */
  trendDirection: -1 | 0 | 1;
};

/* ------------------------------------------------------------------ */
/* Ingest and operator surfaces                                        */
/* ------------------------------------------------------------------ */

/** A raw observation entering the batch/stream ingest cycle. */
export type IngestObservation = {
  /** stable external identifier; the dedupe key derives from it */
  externalId: string;
  /** entity type the observation materializes as (default "item") */
  type?: string;
  title: string;
  text?: string;
  /** the observation timestamp; every derived record timestamp comes from here */
  at: ISODate;
  source: Provenance;
  /** entities mentioned by this observation */
  entities?: { type: string; name: string }[];
};

/** Stored, patched form of an observation (pipeline step 8 writes computed fields back). */
export type ObservationRecord = {
  id: string;
  externalId: string;
  entityId: EntityId;
  checksum: string;
  at: ISODate;
  storyId?: string;
  entityIds?: EntityId[];
  syncedAt?: ISODate;
  stale: boolean;
};

/** An entry in the operator merge-review queue. */
export type MergeProposal = {
  id: string;
  leftId: EntityId;
  rightId: EntityId;
  leftName: string;
  rightName: string;
  similarity: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  proposedAt: ISODate;
  resolvedAt?: ISODate;
  resolvedBy?: string;
};

/** Audit log entry. Every mutation writes one; the control plane reads this. */
export type AuditEntry = {
  seq: number;
  at: ISODate;
  kind: string;
  actor: string;
  summary: string;
  eventId?: EventId;
  runId?: string;
};

export type ConflictPolicy =
  | "most-recent-wins"
  | "highest-confidence-wins"
  | "source-priority"
  | "manual";

export type ResolverOptions = {
  strategy?: string | string[];
  /**
   * Similarity at or above this auto-merges.
   * Default 0.85 (see resolve.ts for the banding ruling).
   */
  autoMergeAt?: number;
  /** [lower, upper): queue for operator review. Default [0.82, autoMergeAt). */
  reviewBand?: [number, number];
};

export type WorldModelOptions = {
  /** "memory" keeps state in-process; "local" persists to .world/<namespace>.json */
  storage?: "memory" | "local";
  namespace: string;
  /** base directory for "local" storage; defaults to process.cwd() */
  directory?: string;
  /**
   * Injectable clock, used ONLY for genuinely-now operator actions
   * (merge approvals, view rebuilds, repair). Record timestamps always
   * derive from observation timestamps so ingest stays idempotent.
   */
  clock?: () => Date;
  resolver?: ResolverOptions;
  conflictPolicy?: ConflictPolicy;
  /** source-priority ranking, highest priority first (used by that policy) */
  sourcePriority?: string[];
};

export type IngestReport = {
  runId: string;
  processed: number;
  skippedUnchanged: number;
  clusters: number;
  eventsAppended: number;
  changed: boolean;
  /** wall-clock step timings; reported only, never persisted into state */
  stepTimingsMs: { step: number; name: string; ms: number }[];
};
