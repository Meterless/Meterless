// Tiered memory store with enrichment (AGENTS.md sections 2, 3, 5).
// A record with no source is rejected by construction. Enrichment runs on
// every add: domain classification, namespace, entity extraction (cap 10),
// relatedTo discovery (cap 5, bidirectional), supersedes detection.

import fs from "node:fs";
import path from "node:path";
import { DEFAULTS, clamp01 } from "./types.ts";
import type { MemoryLayer, MemoryRecord, MemoryType, Provenance } from "./types.ts";
import { cosine, embed, tokenize } from "./embeddings.ts";
import type { TrustLedgerService } from "./trustLedger.ts";

const TECH_TERMS = [
  "react", "python", "typescript", "javascript", "rust", "sqlite", "postgres", "indexeddb",
  "node", "docker", "graphql", "redis", "webrtc", "tauri", "electron", "llm", "embedding",
];
const DOMAIN_KEYWORDS: Record<string, string[]> = {
  tech: ["code", "bug", "api", "database", "deploy", "framework", "library", "server", ...TECH_TERMS],
  work: ["meeting", "deadline", "client", "project", "sprint", "review", "report"],
  personal: ["family", "hobby", "prefer", "like", "dislike", "morning", "evening"],
};

export interface AddInput {
  content: string;
  type?: MemoryType;
  layer?: MemoryLayer;
  tags?: string[];
  confidence?: number;
  source: string;
  provenance?: Provenance;
  chatId?: string;
  missionId?: string;
  goalRunId?: string;
  supersedes?: string;
  derivedFrom?: string[];
}

export class MemoryStoreService {
  private records = new Map<string, MemoryRecord>();
  private seq = 0;
  private stateFile?: string;

  constructor(
    private clock: () => number,
    private ledger: TrustLedgerService,
    private actor: string,
    persistDir?: string
  ) {
    if (persistDir) {
      fs.mkdirSync(persistDir, { recursive: true });
      this.stateFile = path.join(persistDir, "state.json");
      if (fs.existsSync(this.stateFile)) {
        const saved = JSON.parse(fs.readFileSync(this.stateFile, "utf-8")) as { seq: number; records: MemoryRecord[] };
        this.seq = saved.seq;
        for (const r of saved.records) this.records.set(r.id, r);
      }
    }
  }

  persist(): void {
    if (!this.stateFile) return;
    const records = [...this.records.values()].sort((a, b) => a.id.localeCompare(b.id));
    fs.writeFileSync(this.stateFile, JSON.stringify({ seq: this.seq, records }, null, 2) + "\n", "utf-8");
  }

  add(input: AddInput): MemoryRecord {
    if (!input.source || input.source.trim() === "") {
      throw new Error("H-MEM: a memory record with no source must be rejected by construction (AGENTS.md section 2)");
    }
    const now = this.clock();
    const id = `mem-${++this.seq}`;
    const tags = [...(input.tags ?? [])];
    const domain = this.classifyDomain(input.content, tags, input.type ?? "general");
    const record: MemoryRecord = {
      id,
      content: input.content,
      type: input.type ?? "general",
      layer: input.layer ?? "working",
      timestamp: now,
      lastAccessed: now,
      accessCount: 0,
      tags,
      embedding: embed(input.content),
      confidence: clamp01(input.confidence ?? 0.7),
      source: input.source,
      provenance: input.provenance ?? { origin: "manual", learnedAt: now, label: input.source },
      chatId: input.chatId,
      missionId: input.missionId,
      goalRunId: input.goalRunId,
      domain,
      namespace: this.namespace(domain, input.type ?? "general"),
      entities: this.extractEntities(input.content),
      relatedTo: [],
      supersedes: input.supersedes,
      derivedFrom: input.derivedFrom,
    };
    this.discoverRelationships(record);
    this.records.set(id, record);
    this.ledger.log(id, "create", this.actor, { newState: snapshot(record) });
    this.persist();
    return record;
  }

  get(id: string): MemoryRecord | undefined {
    return this.records.get(id);
  }

  all(): MemoryRecord[] {
    return [...this.records.values()];
  }

  update(id: string, patch: Partial<MemoryRecord>): MemoryRecord {
    const rec = this.mustGet(id);
    const prev = snapshot(rec);
    Object.assign(rec, patch);
    this.ledger.log(id, "update", this.actor, { previousState: prev, newState: snapshot(rec) });
    this.persist();
    return rec;
  }

  delete(id: string, reason: string): void {
    const rec = this.mustGet(id);
    this.records.delete(id);
    this.ledger.log(id, "delete", this.actor, { previousState: snapshot(rec), details: { reason } });
    this.persist();
  }

  touch(id: string): void {
    const rec = this.mustGet(id);
    rec.lastAccessed = this.clock();
    rec.accessCount += 1;
  }

  promote(id: string, layer: MemoryLayer): void {
    const rec = this.mustGet(id);
    const prev = snapshot(rec);
    rec.layer = layer;
    this.ledger.log(id, "promote", this.actor, { previousState: prev, newState: snapshot(rec) });
    this.persist();
  }

  restoreAll(records: MemoryRecord[], seq: number): void {
    this.records = new Map(records.map((r) => [r.id, structuredClone(r)]));
    this.seq = seq;
    this.persist();
  }

  snapshotAll(): { records: MemoryRecord[]; seq: number } {
    return { records: structuredClone([...this.records.values()]), seq: this.seq };
  }

  private mustGet(id: string): MemoryRecord {
    const rec = this.records.get(id);
    if (!rec) throw new Error(`H-MEM: unknown memory id ${id}`);
    return rec;
  }

  // Multi-pass domain classification (AGENTS.md section 5).
  classifyDomain(content: string, tags: string[], type: MemoryType): string {
    for (const t of tags) {
      if (t.startsWith("project:")) return t.slice("project:".length);
      if (t.startsWith("tech:")) return "tech";
    }
    const tokens = new Set(tokenize(content));
    let best = "general";
    let bestScore = 0;
    for (const [domain, kws] of Object.entries(DOMAIN_KEYWORDS)) {
      let score = kws.reduce((s, kw) => s + (tokens.has(kw) ? 1 : 0), 0);
      if (domain === "personal" && (type === "personal" || type === "preference")) score += 1;
      if (score > bestScore) {
        best = domain;
        bestScore = score;
      }
    }
    return bestScore > 0 ? best : "general";
  }

  private namespace(domain: string, type: MemoryType): string {
    const bucket = type === "preference" || type === "personal" ? "profile" : type === "factual" ? "facts" : "notes";
    return `${domain}/${bucket}`;
  }

  extractEntities(content: string): string[] {
    const entities = new Set<string>();
    for (const t of tokenize(content)) if (TECH_TERMS.includes(t)) entities.add(t);
    for (const m of content.matchAll(/\b([A-Z][a-zA-Z]{2,})\b/g)) {
      const norm = m[1].toLowerCase();
      if (!["the", "this", "that", "with"].includes(norm)) entities.add(norm);
    }
    return [...entities].slice(0, DEFAULTS.entityCap);
  }

  private discoverRelationships(record: MemoryRecord): void {
    const CORRECTION = /\b(actually|instead|no longer|not anymore|changed to|correction)\b/i;
    for (const other of this.records.values()) {
      if (record.relatedTo.length >= DEFAULTS.relatedCap) break;
      const sharedEntities = other.entities.filter((e) => record.entities.includes(e));
      const sim = cosine(record.embedding, other.embedding);
      if (!record.supersedes && sim > 0.85 && CORRECTION.test(record.content)) {
        record.supersedes = other.id;
        continue;
      }
      if (sharedEntities.length >= 1 && other.domain === record.domain) {
        record.relatedTo.push(other.id);
        if (other.relatedTo.length < DEFAULTS.relatedCap && !other.relatedTo.includes(record.id)) {
          other.relatedTo.push(record.id); // bidirectional link
        }
      }
    }
  }
}

export function snapshot(r: MemoryRecord): Partial<MemoryRecord> {
  const { embedding, ...rest } = structuredClone(r);
  return rest;
}
