// H-MEM conformance runner. Executes ANY implementation against the spec's
// load-bearing behaviors and prints a scorecard.
//
//   npx tsx runner.ts                              # runs the reference
//   HMEM_IMPL=/abs/path/to/index.ts npx tsx runner.ts   # runs YOURS
//
// The implementation module must export an HMEM class compatible with
// AGENTS.md: constructor({ clock }), add(), query(), feedback(), and the
// service surface (store, ledger, sleep, dreaming, conflicts). Assertions here
// are the exact tier: formula arithmetic, deltas, gates, and boundaries the
// spec fully determines. Absolute score values depend on the embedder and are
// NOT asserted, except order where the spec makes order embedding-independent.

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const implPath = process.env.HMEM_IMPL ?? path.join(here, "..", "reference", "src", "index.ts");

interface CaseResult {
  id: string;
  section: string;
  description: string;
  status: "PASS" | "FAIL";
  detail?: string;
}

async function loadImpl(): Promise<{ HMEM: new (opts: { clock: () => number }) => any }> {
  let mod: Record<string, unknown>;
  try {
    mod = await import(pathToFileURL(path.resolve(implPath)).href);
  } catch (err) {
    console.error(`conformance: could not load implementation at ${implPath}`);
    console.error(`  ${(err as Error).message}`);
    console.error(`  Set HMEM_IMPL to an absolute path exporting an HMEM class.`);
    process.exit(2);
  }
  if (typeof mod.HMEM !== "function") {
    console.error(`conformance: module at ${implPath} does not export an HMEM class.`);
    console.error(`  Exports found: ${Object.keys(mod).join(", ") || "(none)"}`);
    process.exit(2);
  }
  return mod as never;
}

function approx(a: number, b: number, eps = 1e-9): boolean {
  return Math.abs(a - b) < eps;
}

async function main(): Promise<void> {
  const { HMEM } = await loadImpl();
  const vectors = JSON.parse(fs.readFileSync(path.join(here, "vectors", "vectors.json"), "utf-8"));
  const T0: number = vectors.clock;
  const DAY = 24 * 60 * 60 * 1000;
  const results: CaseResult[] = [];
  const ids = new Set<string>();

  const record = (section: string, id: string, description: string, fn: () => void | Promise<void>) => {
    if (ids.has(id)) throw new Error(`duplicate case id ${id}`);
    ids.add(id);
    return Promise.resolve()
      .then(fn)
      .then(() => results.push({ id, section, description, status: "PASS" }))
      .catch((err: Error) => results.push({ id, section, description, status: "FAIL", detail: err.message }));
  };
  const assert = (cond: boolean, msg: string) => {
    if (!cond) throw new Error(msg);
  };

  for (const c of vectors.sections["record-validation"]) {
    await record("record-validation", c.id, c.description, () => {
      const hmem = new HMEM({ clock: () => T0 });
      let rejected = false;
      try {
        hmem.add({ content: c.input.content, source: c.input.source });
      } catch {
        rejected = true;
      }
      assert(rejected === (c.expect === "reject"), `expected ${c.expect}, got ${rejected ? "reject" : "accept"}`);
    });
  }

  for (const c of vectors.sections["feedback-deltas"]) {
    await record("feedback-deltas", c.id, c.description, () => {
      const hmem = new HMEM({ clock: () => T0 });
      const m = hmem.add({ content: "feedback target record", confidence: c.start, source: "conformance" });
      const accessBefore = m.accessCount;
      hmem.feedback(m.id, c.kind);
      const after = hmem.store.get(m.id);
      assert(approx(after.confidence, c.expectConfidence), `confidence ${after.confidence}, expected ${c.expectConfidence}`);
      if (c.expectAccessDelta !== undefined) {
        assert(after.accessCount - accessBefore === c.expectAccessDelta, `accessCount delta ${after.accessCount - accessBefore}, expected ${c.expectAccessDelta}`);
      }
      if (c.expectTag) assert(after.tags.includes(c.expectTag), `missing tag ${c.expectTag}`);
    });
  }

  for (const c of vectors.sections["ranking-order"]) {
    await record("ranking-order", c.id, c.description, () => {
      const hmem = new HMEM({ clock: () => T0 });
      const byKey: Record<string, any> = {};
      for (const r of c.records) {
        byKey[r.key] = hmem.add({ content: r.content, confidence: r.confidence, layer: r.layer, source: "conformance" });
      }
      for (const r of c.records) {
        if (r.supersededByKey) byKey[r.key].supersededBy = byKey[r.supersededByKey].id;
      }
      const result = hmem.query(c.query, { threshold: 0, topN: 10 });
      const order = result.memories.map((m: any) => m.memory.id);
      const expected = c.expectOrder.map((k: string) => byKey[k].id);
      for (let i = 0; i < expected.length - 1; i++) {
        assert(order.indexOf(expected[i]) < order.indexOf(expected[i + 1]), `expected ${c.expectOrder[i]} before ${c.expectOrder[i + 1]}, got [${order.join(", ")}]`);
      }
    });
  }

  for (const c of vectors.sections["sleep-guardrails"]) {
    await record("sleep-guardrails", c.id, c.description, () => {
      let now = T0;
      const hmem = new HMEM({ clock: () => now });
      const byKey: Record<string, any> = {};
      for (const r of c.records) {
        byKey[r.key] = hmem.add({ content: r.content, source: r.source, derivedFrom: r.derivedFrom });
      }
      now = T0 + c.ageDays * DAY;
      const before = JSON.stringify(hmem.store.all().map((m: any) => m.id).sort());
      const preview = hmem.sleep.preview();
      assert(JSON.stringify(hmem.store.all().map((m: any) => m.id).sort()) === before, "preview mutated the store");
      for (const k of c.expectArchived) assert(preview.toArchive.includes(byKey[k].id), `${k} should be archivable`);
      for (const k of c.expectProtected) assert(!preview.toArchive.includes(byKey[k].id), `${k} is guardrail-protected and must not archive`);
      const report = hmem.sleep.execute(preview);
      for (const k of c.expectProtected) assert(hmem.store.get(byKey[k].id) !== undefined, `${k} was deleted despite guardrails`);
      assert(typeof report.backupId === "string" && report.backupId.length > 0, "execute must return a backupId");
    });
  }

  for (const c of vectors.sections["conflict-gate"]) {
    await record("conflict-gate", c.id, c.description, () => {
      const hmem = new HMEM({ clock: () => T0 });
      const a = hmem.add({ content: c.a.content, confidence: c.a.confidence, source: "conformance" });
      const b = hmem.add({ content: c.b.content, confidence: c.b.confidence, source: "conformance" });
      const found = hmem.conflicts.scan();
      assert(found.length > 0, "opposing always/never pair on similar content must be detected");
      const outcome = hmem.conflicts.autoResolve(found[0]);
      assert(outcome === "resolved" || outcome === "queued", `outcome must be resolved or queued, got ${outcome}`);
      if (outcome === "resolved") {
        const loser = [hmem.store.get(a.id), hmem.store.get(b.id)].find((m: any) => m?.supersededBy);
        assert(loser !== undefined, "resolved conflicts must mark the loser supersededBy");
      }
      assert(hmem.store.get(a.id) && hmem.store.get(b.id), "conflict resolution must never delete records");
    });
  }

  for (const c of vectors.sections["ledger-audit"]) {
    await record("ledger-audit", c.id, c.description, () => {
      const hmem = new HMEM({ clock: () => T0 });
      const m = hmem.add({ content: "audited record", confidence: c.start, source: "conformance" });
      hmem.feedback(m.id, c.kind);
      const history = hmem.ledger.history(m.id);
      const actions = history.map((h: any) => h.action);
      assert(JSON.stringify(actions) === JSON.stringify(c.expectActions), `actions [${actions}], expected [${c.expectActions}]`);
      const fb = history[history.length - 1];
      assert(approx(fb.previousState?.confidence, c.expectPrev), `previousState.confidence ${fb.previousState?.confidence}, expected ${c.expectPrev}`);
      assert(approx(fb.newState?.confidence, c.expectNew), `newState.confidence ${fb.newState?.confidence}, expected ${c.expectNew}`);
    });
  }

  for (const c of vectors.sections["dream-boundary"]) {
    await record("dream-boundary", c.id, c.description, () => {
      const hmem = new HMEM({ clock: () => T0 });
      for (const r of c.records) hmem.add({ content: r.content, type: r.type, source: "conformance" });
      const countBefore = hmem.store.all().length;
      const proposals = hmem.dreaming.dream();
      assert(proposals.length > 0, "two related preferences must produce at least one proposal");
      assert(hmem.store.all().length === countBefore, "dreaming must not materialize anything before approval");
      const created = hmem.dreaming.approve(proposals[0].id);
      if (created) {
        assert(created.layer === "long_term", "approved proposals materialize as long_term");
        assert((created.derivedFrom ?? []).length > 0, "approved proposals carry derivedFrom lineage");
      }
    });
  }

  // Scorecard.
  const pass = results.filter((r) => r.status === "PASS").length;
  console.log(`\nH-MEM conformance: implementation = ${implPath}`);
  let currentSection = "";
  for (const r of results) {
    if (r.section !== currentSection) {
      currentSection = r.section;
      console.log(`\n  ${currentSection}`);
    }
    console.log(`    ${r.status} ${r.id} ${r.description}${r.detail ? `\n         ${r.detail}` : ""}`);
  }
  console.log(`\n  ${pass}/${results.length} checks passed`);
  process.exit(pass === results.length ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
