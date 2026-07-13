// World Model reference implementation facade. Event-sourced, deterministic,
// zero runtime dependencies. Single-writer discipline: every write goes
// through a FIFO queue per instance, so concurrent ingests serialize.

import { canonicalJson, contextIdFromAttrs, entityIdFromName, externalId, factId, relationshipId } from "./stableIds.ts";
import { decide, jaccard, nameSimilarity } from "./resolve.ts";
import { EventStore } from "./store.ts";
import { runIngestPipeline, worldStateShape } from "./ingest.ts";
import type {
  Context, Entity, Fact, IngestObservation, IngestReport, MergeProposal, Provenance,
  Relationship, StoredProvenance, WorldEvent, WorldModelOptions,
} from "./types.ts";

export * from "./types.ts";
export { canonicalJson, entityIdFromName, externalId, normalizeName, sha256Hex } from "./stableIds.ts";
export { levenshtein, nameSimilarity, decide, jaccard } from "./resolve.ts";
export { worldStateShape } from "./ingest.ts";

type ExternalKey = { system: string; id: string };

interface UpsertEntityInput {
  type: string;
  externalKey?: ExternalKey;
  name?: string;
  attrs?: Record<string, unknown>;
  source: Provenance;
  state?: Entity["state"];
}

interface UpsertContextInput {
  type: string;
  externalKey?: ExternalKey;
  attrs?: Record<string, unknown>;
  parent?: string;
  source: Provenance;
}

interface RelateInput {
  from: string;
  type: string;
  to: string;
  context?: string;
  attrs?: Record<string, unknown>;
  validFrom?: string;
  validTo?: string;
  source: Provenance;
}

interface AssertFactInput {
  about: string;
  predicate: string;
  value: unknown;
  confidence?: number;
  context?: string;
  source: Provenance;
}

interface CustomView<S> {
  events: string[];
  initialState: S;
  reducer: (state: S, event: WorldEvent) => S;
}

export class WorldModel {
  private store: EventStore;
  private opts: WorldModelOptions;
  private clock: () => Date;
  private writeLock: Promise<unknown> = Promise.resolve();
  private customViews = new Map<string, { spec: CustomView<unknown>; state: unknown }>();

  constructor(opts: WorldModelOptions) {
    if (!opts.namespace) throw new Error("WorldModel: namespace is required");
    this.opts = opts;
    this.clock = opts.clock ?? (() => new Date());
    this.store = new EventStore(opts.namespace, opts.storage ?? "memory", opts.directory);
  }

  // ---------------------------------------------------------------- writes

  private enqueue<T>(fn: () => T | Promise<T>): Promise<T> {
    const next = this.writeLock.then(fn);
    this.writeLock = next.catch(() => undefined);
    return next;
  }

  private normalizeProvenance(source: Provenance | undefined): StoredProvenance {
    if (!source || !source.kind || source.at === undefined) {
      throw new Error("World Model: every write carries provenance (kind + at). No provenance, no write.");
    }
    const at = source.at instanceof Date ? source.at.toISOString() : source.at;
    return { ...source, at };
  }

  upsertEntity(input: UpsertEntityInput): Promise<Entity> {
    return this.enqueue(() => {
      const source = this.normalizeProvenance(input.source);
      const name = input.name ?? (input.attrs?.name as string | undefined);
      const id = input.externalKey
        ? externalId(input.type, input.externalKey.system, input.externalKey.id)
        : entityIdFromName(input.type, mustName(name));

      // Resolution pass for name-keyed entities: near-duplicates of the same
      // type either auto-merge (alias event) or queue for operator review.
      if (!input.externalKey && name) {
        for (const other of this.store.state.entities.values()) {
          if (other.type !== input.type || other.id === id || !other.name) continue;
          const similarity = nameSimilarity(name, other.name);
          const decision = decide(similarity, this.opts.resolver?.autoMergeAt ?? 0.85, this.opts.resolver?.reviewBand?.[0] ?? 0.82);
          if (decision === "auto-merge") {
            this.store.append("alias", { aliasId: id, primaryId: other.id, mergedAt: source.at, mergedBy: "resolver", reason: `similarity ${similarity.toFixed(3)}` }, source.at);
            this.store.logAudit("auto-merge", "resolver", `${name} -> ${other.name} (${similarity.toFixed(3)})`, undefined, undefined, source.at);
            const merged = this.foldEntityUpsert(other.id, input, source, name);
            return merged;
          }
          if (decision === "review") {
            const proposalId = `merge_${this.store.mergeQueue.length + 1}`;
            if (!this.store.mergeQueue.some((p) => (p.leftId === id && p.rightId === other.id) || (p.leftId === other.id && p.rightId === id))) {
              const proposal: MergeProposal = {
                id: proposalId, leftId: id, rightId: other.id, leftName: name, rightName: other.name,
                similarity, reason: "name similarity in review band [0.82, 0.85)", status: "pending", proposedAt: source.at,
              };
              this.store.mergeQueue.push(proposal);
              this.store.logAudit("merge-proposed", "resolver", `${name} ~ ${other.name} (${similarity.toFixed(3)}) queued`, undefined, undefined, source.at);
            }
          }
        }
      }
      return this.foldEntityUpsert(id, input, source, name);
    });
  }

  private foldEntityUpsert(id: string, input: UpsertEntityInput, source: StoredProvenance, name?: string): Entity {
    const resolved = this.store.resolveAlias(id);
    const entity: Entity = {
      type: input.type,
      id: resolved,
      attrs: { ...(input.attrs ?? {}) },
      schemaVersion: 1,
      source,
      createdAt: source.at,
      updatedAt: source.at,
      name,
      aliases: name ? [name] : [],
      state: input.state ?? "active",
    };
    const event = this.store.append("upsertEntity", entity, source.at);
    this.store.logAudit("upsertEntity", source.by ?? "system", `${resolved} (${input.type})`, event.id, source.runId, source.at);
    return this.store.state.entities.get(resolved)!;
  }

  upsertContext(input: UpsertContextInput): Promise<Context> {
    return this.enqueue(() => {
      const source = this.normalizeProvenance(input.source);
      const id = input.externalKey
        ? externalId(input.type, input.externalKey.system, input.externalKey.id)
        : contextIdFromAttrs(input.type, input.attrs ?? {}, input.parent);
      const context: Context = {
        type: input.type,
        id,
        attrs: { ...(input.attrs ?? {}) },
        parent: input.parent,
        schemaVersion: 1,
        source,
        createdAt: source.at,
        updatedAt: source.at,
      };
      const event = this.store.append("upsertContext", context, source.at);
      this.store.logAudit("upsertContext", source.by ?? "system", `${id} (${input.type})`, event.id, source.runId, source.at);
      return this.store.state.contexts.get(id)!;
    });
  }

  relate(input: RelateInput): Promise<Relationship> {
    return this.enqueue(() => {
      const source = this.normalizeProvenance(input.source);
      const from = this.store.resolveAlias(input.from);
      const to = this.store.resolveAlias(input.to);
      const id = relationshipId(from, input.type, to, input.context, input.validFrom);
      if (this.store.state.relationships.has(id)) {
        return this.store.state.relationships.get(id)!; // content-addressed no-op
      }
      const rel: Relationship = {
        id, from, type: input.type, to,
        context: input.context,
        attrs: input.attrs,
        validFrom: input.validFrom ?? source.at,
        validTo: input.validTo,
        schemaVersion: 1,
        source,
        createdAt: source.at,
      };
      const event = this.store.append("relate", rel, source.at);
      this.store.logAudit("relate", source.by ?? "system", `${from} -[${input.type}]-> ${to}`, event.id, source.runId, source.at);
      return this.store.state.relationships.get(id)!;
    });
  }

  assertFact(input: AssertFactInput): Promise<Fact> {
    return this.enqueue(() => {
      const source = this.normalizeProvenance(input.source);
      const about = this.store.resolveAlias(input.about);
      const id = factId(about, input.predicate, input.value, source.at, source.kind, source.url);
      if (this.store.state.facts.has(id)) return this.store.state.facts.get(id)!;

      const fact: Fact = {
        id, about,
        predicate: input.predicate,
        value: input.value,
        confidence: input.confidence ?? 0.5,
        context: input.context,
        source,
        assertedAt: source.at,
      };

      // Conflict policy decides which fact's value lands on the entity.
      const policy = this.opts.conflictPolicy ?? "most-recent-wins";
      const rivals = [...this.store.state.facts.values()].filter((f) => f.about === about && f.predicate === input.predicate && !f.supersededBy);
      let winner: Fact = fact;
      for (const rival of rivals) {
        const rivalWins =
          policy === "highest-confidence-wins" ? rival.confidence > winner.confidence :
          policy === "source-priority" ? priorityOf(rival.source.kind, this.opts.sourcePriority) < priorityOf(winner.source.kind, this.opts.sourcePriority) :
          rival.assertedAt > winner.assertedAt; // most-recent-wins
        if (rivalWins) {
          winner = rival;
        }
      }
      const event = this.store.append("assertFact", fact, source.at);
      for (const f of [fact, ...rivals]) {
        if (f.id !== winner.id) this.store.state.facts.get(f.id)!.supersededBy = winner.id;
      }

      // Ensure the subject entity exists and carries the winning value.
      if (!this.store.state.entities.get(about)) {
        const inferredType = about.includes(":") ? about.split(":")[0] : "entity";
        this.store.append("upsertEntity", {
          type: inferredType, id: about, attrs: {}, schemaVersion: 1, source,
          createdAt: source.at, updatedAt: source.at, aliases: [], state: "emerging",
        } as Entity, source.at);
      }
      const entity = this.store.state.entities.get(about)!;
      entity.attrs[input.predicate] = winner.value;
      entity.updatedAt = source.at;

      this.store.logAudit("assertFact", source.by ?? "system", `${about}.${input.predicate} = ${JSON.stringify(winner.value)} (${policy})`, event.id, source.runId, source.at);
      this.store.persist();
      return this.store.state.facts.get(id)!;
    });
  }

  // ---------------------------------------------------------------- ingest

  ingest(observations: IngestObservation[]): Promise<IngestReport> {
    return this.enqueue(() =>
      runIngestPipeline(
        this.store,
        observations,
        (obs) => {
          const source = this.normalizeProvenance({ ...obs.source, at: obs.at });
          const entity = this.foldEntityUpsert(
            externalId(obs.type ?? "item", "ingest", obs.externalId),
            { type: obs.type ?? "item", externalKey: { system: "ingest", id: obs.externalId }, attrs: { title: obs.title, text: obs.text }, source },
            source,
            obs.title
          );
          const entityIds: string[] = [];
          for (const mention of obs.entities ?? []) {
            const mid = entityIdFromName(mention.type, mention.name);
            this.foldEntityUpsert(mid, { type: mention.type, name: mention.name, source }, source, mention.name);
            entityIds.push(this.store.resolveAlias(mid));
            const rid = relationshipId(entity.id, "mentions", this.store.resolveAlias(mid));
            if (!this.store.state.relationships.has(rid)) {
              this.store.append("relate", {
                id: rid, from: entity.id, type: "mentions", to: this.store.resolveAlias(mid),
                validFrom: source.at, schemaVersion: 1, source, createdAt: source.at,
              } as Relationship, source.at);
            }
          }
          return { entityId: entity.id, entityIds: entityIds.sort() };
        },
        () => this.clock().getTime()
      )
    );
  }

  // ---------------------------------------------------------------- reads

  view(name: "graph"): GraphView;
  view(name: "facts"): FactsView;
  view(name: "snapshot"): SnapshotView;
  view(name: "timeline"): TimelineView;
  view(name: string): { get(): unknown };
  view(name: string): unknown {
    if (name === "graph") return new GraphView(this.store);
    if (name === "facts") return new FactsView(this.store);
    if (name === "snapshot") return new SnapshotView(this.store);
    if (name === "timeline") return new TimelineView(this.store);
    const custom = this.customViews.get(name);
    if (!custom) throw new Error(`World Model: unknown view "${name}"`);
    return {
      get: () => {
        let state = structuredClone(custom.spec.initialState);
        for (const e of this.store.events) {
          if (custom.spec.events.includes(e.kind)) state = custom.spec.reducer(state, e);
        }
        return state;
      },
    };
  }

  registerView<S>(name: string, spec: CustomView<S>): void {
    this.customViews.set(name, { spec: spec as CustomView<unknown>, state: spec.initialState });
  }

  // ------------------------------------------------------------- operator

  mergeQueue(): readonly MergeProposal[] {
    return this.store.mergeQueue;
  }

  approveMerge(proposalId: string, by: string): Promise<void> {
    return this.enqueue(() => {
      const p = this.store.mergeQueue.find((m) => m.id === proposalId && m.status === "pending");
      if (!p) throw new Error(`World Model: no pending merge proposal ${proposalId}`);
      const at = this.clock().toISOString();
      p.status = "approved";
      p.resolvedAt = at;
      p.resolvedBy = by;
      this.store.append("alias", { aliasId: p.leftId, primaryId: p.rightId, mergedAt: at, mergedBy: by, reason: p.reason }, at);
      this.store.logAudit("merge-approved", by, `${p.leftName} -> ${p.rightName}`, undefined, undefined, at);
    });
  }

  rejectMerge(proposalId: string, by: string): Promise<void> {
    return this.enqueue(() => {
      const p = this.store.mergeQueue.find((m) => m.id === proposalId && m.status === "pending");
      if (!p) throw new Error(`World Model: no pending merge proposal ${proposalId}`);
      p.status = "rejected";
      p.resolvedAt = this.clock().toISOString();
      p.resolvedBy = by;
      this.store.logAudit("merge-rejected", by, `${p.leftName} stays separate from ${p.rightName}`);
      this.store.persist();
    });
  }

  audit(): readonly import("./types.ts").AuditEntry[] {
    return this.store.audit;
  }

  events(): readonly WorldEvent[] {
    return this.store.events;
  }

  stateShape(): unknown {
    return worldStateShape(this.store);
  }

  stateShapeCanonical(): string {
    return canonicalJson(worldStateShape(this.store));
  }

  subscribeEvents(fn: (e: WorldEvent) => void): () => void {
    return this.store.subscribe(fn);
  }
}

// ------------------------------------------------------------------ views

class GraphView {
  constructor(private store: EventStore) {}

  entity(id: string): Entity | undefined {
    return this.store.state.entities.get(this.store.resolveAlias(id));
  }

  neighborsOf(id: string, opts?: { via?: string; inContext?: string; at?: string }): Entity[] {
    const rid = this.store.resolveAlias(id);
    const out: Entity[] = [];
    for (const rel of this.store.state.relationships.values()) {
      if (opts?.via && rel.type !== opts.via) continue;
      if (opts?.inContext && rel.context !== opts.inContext) continue;
      if (opts?.at && !validAt(rel, opts.at)) continue;
      if (!opts?.at && rel.validTo) continue; // closed edges excluded from "now" queries
      const other = rel.from === rid ? rel.to : rel.to === rid ? rel.from : undefined;
      if (!other) continue;
      const entity = this.store.state.entities.get(other);
      if (entity) out.push(entity);
    }
    return out.sort((a, b) => a.id.localeCompare(b.id));
  }

  incoming(id: string, opts?: { via?: string }): Entity[] {
    const rid = this.store.resolveAlias(id);
    const out: Entity[] = [];
    for (const rel of this.store.state.relationships.values()) {
      if (rel.to !== rid) continue;
      if (opts?.via && rel.type !== opts.via) continue;
      if (rel.validTo) continue;
      const entity = this.store.state.entities.get(rel.from);
      if (entity) out.push(entity);
    }
    return out.sort((a, b) => a.id.localeCompare(b.id));
  }

  entitiesInContext(contextId: string, opts?: { type?: string }): Entity[] {
    const seen = new Map<string, Entity>();
    for (const rel of this.store.state.relationships.values()) {
      if (rel.context !== contextId) continue;
      for (const id of [rel.from, rel.to]) {
        const entity = this.store.state.entities.get(id);
        if (entity && (!opts?.type || entity.type === opts.type)) seen.set(entity.id, entity);
      }
    }
    return [...seen.values()].sort((a, b) => a.id.localeCompare(b.id));
  }

  traverse(startId: string, opts: { via: string; direction: "ancestors" | "descendants"; maxDepth?: number }): Entity[] {
    const maxDepth = opts.maxDepth ?? 5;
    const out: Entity[] = [];
    const visited = new Set<string>();
    let frontier = [this.store.resolveAlias(startId)];
    for (let depth = 0; depth < maxDepth && frontier.length; depth++) {
      const next: string[] = [];
      for (const id of frontier) {
        for (const rel of this.store.state.relationships.values()) {
          if (rel.type !== opts.via || rel.validTo) continue;
          const target = opts.direction === "ancestors" ? (rel.from === id ? rel.to : undefined) : rel.to === id ? rel.from : undefined;
          if (target && !visited.has(target)) {
            visited.add(target);
            const entity = this.store.state.entities.get(target);
            if (entity) out.push(entity);
            next.push(target);
          }
        }
      }
      frontier = next;
    }
    return out;
  }

  query(opts: { type?: string; where?: (e: Entity) => boolean }): Entity[] {
    return [...this.store.state.entities.values()]
      .filter((e) => (!opts.type || e.type === opts.type) && (!opts.where || opts.where(e)))
      .sort((a, b) => a.id.localeCompare(b.id));
  }
}

class FactsView {
  constructor(private store: EventStore) {}
  about(id: string): Fact[] {
    const rid = this.store.resolveAlias(id);
    return [...this.store.state.facts.values()].filter((f) => f.about === rid).sort((a, b) => a.assertedAt.localeCompare(b.assertedAt));
  }
}

class SnapshotView {
  constructor(private store: EventStore) {}
  // Entity state as of a timestamp: replay events with at <= timestamp.
  entityAt(id: string, at: string): Entity | undefined {
    const iso = at.length === 10 ? `${at}T23:59:59.999Z` : at;
    const state = this.store.foldUntil(iso);
    let cur = id;
    const seen = new Set<string>();
    while (state.aliases.has(cur) && !seen.has(cur)) {
      seen.add(cur);
      cur = state.aliases.get(cur)!;
    }
    return state.entities.get(cur);
  }
}

class TimelineView {
  constructor(private store: EventStore) {}
  subscribe(fn: (e: WorldEvent) => void): () => void {
    return this.store.subscribe(fn);
  }
  get(): WorldEvent[] {
    return [...this.store.events];
  }
}

function validAt(rel: Relationship, at: string): boolean {
  if (rel.validFrom && at < rel.validFrom) return false;
  if (rel.validTo && at >= rel.validTo) return false;
  return true;
}

function priorityOf(kind: string, ranking?: string[]): number {
  const idx = (ranking ?? []).indexOf(kind);
  return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
}

function mustName(name: string | undefined): string {
  if (!name) throw new Error("World Model: name-keyed entities need a name (or provide an externalKey)");
  return name;
}
