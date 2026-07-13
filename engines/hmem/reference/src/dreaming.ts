// Dreaming (AGENTS.md section 7): constructive synthesis with a human
// approval boundary. Proposals are NEVER auto-materialized; only approve()
// turns one into durable memory, with derivedFrom lineage.

import { DEFAULTS } from "./types.ts";
import type { DreamProposal, MemoryRecord } from "./types.ts";
import { cosine, jaccard } from "./embeddings.ts";
import type { MemoryStoreService } from "./memoryStore.ts";
import type { TrustLedgerService } from "./trustLedger.ts";

export class DreamingService {
  private proposals = new Map<string, DreamProposal>();
  private seq = 0;

  constructor(
    private store: MemoryStoreService,
    private ledger: TrustLedgerService,
    private clock: () => number,
    private actor: string
  ) {}

  // Multi-signal relatedness: content similarity, tag overlap, shared domain/type, entity overlap.
  private relatedness(a: MemoryRecord, b: MemoryRecord): number {
    return (
      0.5 * Math.max(0, cosine(a.embedding, b.embedding)) +
      0.2 * jaccard(a.tags, b.tags) +
      0.1 * (a.domain === b.domain ? 1 : 0) +
      0.2 * jaccard(a.entities, b.entities)
    );
  }

  private cluster(): MemoryRecord[][] {
    const all = this.store.all();
    const used = new Set<string>();
    const clusters: MemoryRecord[][] = [];
    for (const seed of all) {
      if (used.has(seed.id)) continue;
      const group = [seed];
      for (const other of all) {
        if (other.id === seed.id || used.has(other.id)) continue;
        if (this.relatedness(seed, other) >= DEFAULTS.dreamRelatedness) group.push(other);
      }
      if (group.length >= DEFAULTS.dreamClusterMinSize) {
        for (const g of group) used.add(g.id);
        clusters.push(group);
      }
    }
    return clusters;
  }

  dream(): DreamProposal[] {
    const created: DreamProposal[] = [];
    const propose = (p: Omit<DreamProposal, "id" | "status">): void => {
      const proposal: DreamProposal = { ...p, id: `dream-${++this.seq}`, status: "proposed" };
      this.proposals.set(proposal.id, proposal);
      created.push(proposal);
      this.ledger.log(proposal.id, "dream_proposed", this.actor, { details: { type: p.type, derivedFrom: p.derivedFrom } });
    };

    // Insights from clusters.
    let insights = 0;
    for (const cluster of this.cluster()) {
      if (insights >= DEFAULTS.maxDreamProposalsPerType) break;
      const domains = [...new Set(cluster.map((m) => m.domain))].join("/");
      propose({
        type: "insight",
        content: `Across ${cluster.length} related memories (${domains}): ${cluster.map((m) => m.content).join(" + ")}`,
        derivedFrom: cluster.map((m) => m.id),
      });
      insights++;
    }

    // Domain suggestions for uncategorized memories.
    let domains = 0;
    for (const m of this.store.all()) {
      if (domains >= DEFAULTS.maxDreamProposalsPerType) break;
      if (m.domain !== "general") continue;
      const suggested = this.store.classifyDomain(m.content, m.tags, m.type);
      if (suggested !== "general") {
        propose({ type: "domain", content: `Reclassify "${m.content.slice(0, 60)}" as ${suggested}`, derivedFrom: [m.id], suggestedDomain: suggested });
        domains++;
      }
    }

    // Invariants from preference/personal/correction signals.
    let invariants = 0;
    const prefs = this.store.all().filter((m) => m.type === "preference" || m.type === "personal" || m.tags.includes("event:user_correction"));
    const byDomain = new Map<string, MemoryRecord[]>();
    for (const p of prefs) {
      const list = byDomain.get(p.domain) ?? [];
      list.push(p);
      byDomain.set(p.domain, list);
    }
    for (const [domain, list] of byDomain) {
      if (invariants >= DEFAULTS.maxDreamProposalsPerType) break;
      if (list.length < 2) continue;
      propose({
        type: "invariant",
        content: `Stable pattern in ${domain}: ${list.map((m) => m.content).join("; ")}`,
        derivedFrom: list.map((m) => m.id),
      });
      invariants++;
    }

    return created;
  }

  pending(): DreamProposal[] {
    return [...this.proposals.values()].filter((p) => p.status === "proposed");
  }

  approve(proposalId: string): MemoryRecord | undefined {
    const p = this.proposals.get(proposalId);
    if (!p || p.status !== "proposed") throw new Error(`H-MEM: no pending proposal ${proposalId}`);
    p.status = "approved";
    this.ledger.log(proposalId, "dream_approved", this.actor, { details: { type: p.type } });

    if (p.type === "domain") {
      for (const id of p.derivedFrom) {
        const m = this.store.get(id);
        if (m && p.suggestedDomain) this.store.update(id, { domain: p.suggestedDomain });
      }
      return undefined;
    }
    // insight -> long-term factual; invariant -> long-term preference. Both carry lineage.
    return this.store.add({
      content: p.content,
      type: p.type === "insight" ? "factual" : "preference",
      layer: "long_term",
      tags: [`dream:${p.type}`],
      confidence: 0.75,
      source: "dreaming",
      provenance: { origin: "dream", learnedAt: this.clock(), label: `approved ${p.type} proposal` },
      derivedFrom: p.derivedFrom,
    });
  }

  reject(proposalId: string): void {
    const p = this.proposals.get(proposalId);
    if (!p || p.status !== "proposed") throw new Error(`H-MEM: no pending proposal ${proposalId}`);
    p.status = "rejected"; // logged, not materialized
    this.ledger.log(proposalId, "dream_rejected", this.actor, { details: { type: p.type } });
  }
}
