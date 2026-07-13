// Event-sourced canonical store. State is a fold over an append-only event
// log; views are projections of the fold. Persistence is a JSON file per
// namespace (.world/<namespace>.json) replayed on load. Every mutation writes
// an audit entry; the control plane reads the audit log.

import fs from "node:fs";
import path from "node:path";
import type {
  AuditEntry, Context, Entity, EventKind, Fact, Relationship, Snapshot, StoredProvenance,
  WorldEvent, MergeProposal, ObservationRecord, StoryAggregate, ScoreSnapshot,
} from "./types.ts";

export interface FoldedState {
  entities: Map<string, Entity>;
  contexts: Map<string, Context>;
  relationships: Map<string, Relationship>;
  facts: Map<string, Fact>;
  aliases: Map<string, string>; // aliasId -> primaryId
}

export class EventStore {
  events: WorldEvent[] = [];
  audit: AuditEntry[] = [];
  observations = new Map<string, ObservationRecord>();
  stories = new Map<string, StoryAggregate>();
  scores: ScoreSnapshot[] = [];
  mergeQueue: MergeProposal[] = [];
  state: FoldedState = {
    entities: new Map(),
    contexts: new Map(),
    relationships: new Map(),
    facts: new Map(),
    aliases: new Map(),
  };
  private seq = 0;
  private auditSeq = 0;
  private file?: string;
  private subscribers = new Set<(e: WorldEvent) => void>();

  constructor(namespace: string, storage: "memory" | "local", directory?: string) {
    if (storage === "local") {
      const dir = path.join(directory ?? process.cwd(), ".world");
      fs.mkdirSync(dir, { recursive: true });
      this.file = path.join(dir, `${namespace}.json`);
      if (fs.existsSync(this.file)) {
        const saved = JSON.parse(fs.readFileSync(this.file, "utf-8")) as {
          events: WorldEvent[];
          audit: AuditEntry[];
          observations: [string, ObservationRecord][];
          stories: [string, StoryAggregate][];
          scores: ScoreSnapshot[];
          mergeQueue: MergeProposal[];
        };
        this.audit = saved.audit ?? [];
        this.auditSeq = this.audit.length ? this.audit[this.audit.length - 1].seq : 0;
        this.observations = new Map(saved.observations ?? []);
        this.stories = new Map(saved.stories ?? []);
        this.scores = saved.scores ?? [];
        this.mergeQueue = saved.mergeQueue ?? [];
        for (const e of saved.events ?? []) this.applyAndRecord(e, false);
      }
    }
  }

  append(kind: EventKind, payload: WorldEvent["payload"], at: string): WorldEvent {
    const event: WorldEvent = { id: `evt_${this.seq + 1}`, seq: this.seq + 1, kind, payload, schemaVersion: 1, at };
    this.applyAndRecord(event, true);
    return event;
  }

  private applyAndRecord(event: WorldEvent, isNew: boolean): void {
    this.seq = Math.max(this.seq, event.seq);
    if (isNew) this.events.push(event);
    else this.events.push(event);
    this.fold(event);
    if (isNew) {
      this.persist();
      for (const fn of this.subscribers) fn(event);
    }
  }

  private fold(event: WorldEvent): void {
    switch (event.kind) {
      case "upsertEntity": {
        const e = event.payload as Entity;
        const existing = this.state.entities.get(e.id);
        if (existing) {
          existing.attrs = { ...existing.attrs, ...e.attrs };
          existing.updatedAt = e.updatedAt;
          existing.source = e.source;
          if (e.name && !existing.aliases.includes(e.name)) existing.aliases.push(e.name);
          if (e.name) existing.name = e.name;
        } else {
          this.state.entities.set(e.id, structuredClone(e));
        }
        break;
      }
      case "upsertContext": {
        const c = event.payload as Context;
        const existing = this.state.contexts.get(c.id);
        if (existing) {
          existing.attrs = { ...existing.attrs, ...c.attrs };
          existing.updatedAt = c.updatedAt;
        } else {
          this.state.contexts.set(c.id, structuredClone(c));
        }
        break;
      }
      case "relate": {
        const r = event.payload as Relationship;
        // Superseding semantics: a new open edge with the same (from, type,
        // context) but different target CLOSES the previous open edge.
        for (const other of this.state.relationships.values()) {
          if (
            other.from === r.from && other.type === r.type &&
            (other.context ?? "") === (r.context ?? "") &&
            other.to !== r.to && !other.validTo && !other.supersededBy
          ) {
            other.validTo = r.validFrom ?? r.createdAt;
            other.supersededBy = r.id;
          }
        }
        if (!this.state.relationships.has(r.id)) this.state.relationships.set(r.id, structuredClone(r));
        break;
      }
      case "assertFact": {
        const f = event.payload as Fact;
        if (!this.state.facts.has(f.id)) this.state.facts.set(f.id, structuredClone(f));
        break;
      }
      case "alias": {
        const a = event.payload as { aliasId: string; primaryId: string };
        this.state.aliases.set(a.aliasId, a.primaryId);
        break;
      }
      case "snapshot":
      case "tombstone":
      case "view-rebuild":
        break;
    }
  }

  // Replays the event log up to (and including) a timestamp: the snapshot view.
  foldUntil(at: string): FoldedState {
    const scratch = new EventStore("scratch", "memory");
    for (const e of this.events) {
      if (e.at <= at) scratch.fold(e);
    }
    return scratch.state;
  }

  resolveAlias(id: string): string {
    let cur = id;
    const seen = new Set<string>();
    while (this.state.aliases.has(cur) && !seen.has(cur)) {
      seen.add(cur);
      cur = this.state.aliases.get(cur)!;
    }
    return cur;
  }

  logAudit(kind: string, actor: string, summary: string, eventId?: string, runId?: string, at?: string): void {
    this.audit.push({ seq: ++this.auditSeq, at: at ?? new Date(0).toISOString(), kind, actor, summary, eventId, runId });
    this.persist();
  }

  subscribe(fn: (e: WorldEvent) => void): () => void {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  }

  persist(): void {
    if (!this.file) return;
    const data = {
      events: this.events,
      audit: this.audit,
      observations: [...this.observations.entries()],
      stories: [...this.stories.entries()],
      scores: this.scores,
      mergeQueue: this.mergeQueue,
    };
    fs.writeFileSync(this.file, JSON.stringify(data, null, 2) + "\n", "utf-8");
  }
}
