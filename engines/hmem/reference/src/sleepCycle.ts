// Sleep cycle (AGENTS.md section 8). Preview-first: preview() computes the
// full action plan and mutates nothing; execute() takes a backup snapshot
// first and exposes restore(). Guardrails: superseding/current records,
// derived/synthesized memories, and relationship hubs are NEVER archived.

import { DAY_MS, DEFAULTS } from "./types.ts";
import type { MemoryRecord, SleepPreview, SleepReport } from "./types.ts";
import { cosine } from "./embeddings.ts";
import type { MemoryStoreService } from "./memoryStore.ts";
import type { TrustLedgerService } from "./trustLedger.ts";

const HUB_THRESHOLD = 3;

export class SleepCycleService {
  private backups = new Map<string, { records: MemoryRecord[]; seq: number }>();
  private backupSeq = 0;

  constructor(
    private store: MemoryStoreService,
    private ledger: TrustLedgerService,
    private clock: () => number,
    private actor: string
  ) {}

  preview(): SleepPreview {
    const now = this.clock();
    const all = this.store.all();
    const referenced = new Set<string>();
    for (const m of all) {
      for (const r of m.relatedTo) referenced.add(r);
      if (m.supersedes) referenced.add(m.supersedes);
      for (const d of m.derivedFrom ?? []) referenced.add(d);
    }

    const toConsolidate = all
      .filter((m) => m.layer === "short_term" && now - m.lastAccessed >= DEFAULTS.consolidationDays * DAY_MS)
      .map((m) => m.id);

    const toArchive = all
      .filter((m) => {
        const oldEnough = now - m.timestamp >= DEFAULTS.archiveMinDays * DAY_MS;
        const lowAccess = m.accessCount <= DEFAULTS.archiveMaxAccess;
        const unreferenced = !referenced.has(m.id);
        if (!(oldEnough && lowAccess && unreferenced)) return false;
        // Guardrails (section 8.2): never archive these three classes.
        if (m.supersedes) return false;                       // superseding/current record
        if ((m.derivedFrom ?? []).length > 0) return false;   // derived/synthesized memory
        if (m.relatedTo.length >= HUB_THRESHOLD) return false; // relationship hub
        return true;
      })
      .map((m) => m.id);

    const toSynthesize: string[][] = [];
    const used = new Set<string>();
    for (let i = 0; i < all.length; i++) {
      if (used.has(all[i].id)) continue;
      const group = [all[i]];
      for (let j = i + 1; j < all.length; j++) {
        if (used.has(all[j].id)) continue;
        if (cosine(all[i].embedding, all[j].embedding) >= DEFAULTS.synthesisCosine) group.push(all[j]);
      }
      if (group.length >= 2) {
        for (const g of group) used.add(g.id);
        toSynthesize.push(group.map((g) => g.id));
      }
    }

    return { toConsolidate, toArchive, toSynthesize };
  }

  execute(preview?: SleepPreview): SleepReport {
    const plan = preview ?? this.preview();
    const backupId = `backup-${++this.backupSeq}`;
    this.backups.set(backupId, this.store.snapshotAll());
    const actionLog: string[] = [`backup ${backupId} created`];

    for (const id of plan.toConsolidate) {
      const m = this.store.get(id);
      if (!m) continue;
      this.store.promote(id, "long_term");
      this.ledger.log(id, "sleep_consolidate", this.actor, { details: { from: "short_term", to: "long_term" } });
      actionLog.push(`consolidated ${id}`);
    }

    for (const id of plan.toArchive) {
      const m = this.store.get(id);
      if (!m) continue;
      this.ledger.log(id, "sleep_archive", this.actor, { details: { age: this.clock() - m.timestamp, accessCount: m.accessCount } });
      this.store.delete(id, "sleep archive");
      actionLog.push(`archived ${id}`);
    }

    let synthesized = 0;
    for (const group of plan.toSynthesize) {
      const members = group.map((id) => this.store.get(id)).filter((m): m is MemoryRecord => !!m);
      if (members.length < 2) continue;
      const merged = this.store.add({
        content: `Synthesis: ${members.map((m) => m.content).join(" | ")}`,
        type: "factual",
        layer: "long_term",
        tags: [...new Set(members.flatMap((m) => m.tags))],
        confidence: Math.max(...members.map((m) => m.confidence)),
        source: "sleep:synthesis",
        provenance: { origin: "sleep_synthesis", learnedAt: this.clock(), label: `synthesized from ${members.length} memories` },
        derivedFrom: members.map((m) => m.id),
      });
      this.ledger.log(merged.id, "sleep_synthesize", this.actor, { details: { sources: group } });
      for (const m of members) this.store.delete(m.id, "merged by sleep synthesis");
      synthesized++;
      actionLog.push(`synthesized ${merged.id} from ${group.join(", ")}`);
    }

    this.store.persist();
    return {
      backupId,
      consolidated: plan.toConsolidate.length,
      archived: plan.toArchive.length,
      synthesized,
      actionLog,
    };
  }

  restore(backupId: string): void {
    const backup = this.backups.get(backupId);
    if (!backup) throw new Error(`H-MEM: unknown backup ${backupId}`);
    this.store.restoreAll(backup.records, backup.seq);
    this.ledger.log("*", "restore", this.actor, { details: { backupId } });
  }
}
