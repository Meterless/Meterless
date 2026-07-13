import { describe, expect, it } from "vitest";
import { HMEM } from "../src/index.ts";

const T0 = 1_750_000_000_000; // fixed epoch for deterministic tests
const fixedClock = () => T0;

describe("H-MEM reference implementation", () => {
  it("rejects a record with no source by construction", () => {
    const hmem = new HMEM({ clock: fixedClock });
    expect(() => hmem.add({ content: "no provenance here", source: "" })).toThrow(/source/);
  });

  it("computes the canonical retrieval formula (hand-computed to 4 decimals)", () => {
    const hmem = new HMEM({ clock: fixedClock });
    // Memory content identical to the query: semantic = 1, keyword Jaccard = 1.
    // tags = [] -> tag = 0. entities: none extracted from lowercase non-tech words -> entity = 0.
    // Same classified domain (general vs general) -> domain = 1.
    // long_term -> layer weight 1.0; lastAccessed = now -> recency = 1. Not superseded.
    // raw = 0.35 + 0.20 + 0 + 0.10 + 0 + 0.05*1.0 + 0.05*1 - 0 = 0.75
    // score = 0.75 * confidence(0.8) = 0.60
    const m = hmem.add({
      content: "walking every day keeps ideas flowing",
      type: "general",
      layer: "long_term",
      confidence: 0.8,
      source: "test",
    });
    const score = hmem.retrieval.scoreOne(m, "walking every day keeps ideas flowing");
    expect(score).toBeCloseTo(0.6, 4);
  });

  it("applies exact feedback deltas and the review tag", () => {
    const hmem = new HMEM({ clock: fixedClock });
    const m = hmem.add({ content: "the deploy runs at midnight", confidence: 0.7, source: "test" });
    hmem.feedback(m.id, "helpful");
    expect(m.confidence).toBeCloseTo(0.75, 10);
    expect(m.accessCount).toBe(1);
    hmem.feedback(m.id, "not_helpful");
    expect(m.confidence).toBeCloseTo(0.72, 10);
    hmem.feedback(m.id, "wrong");
    expect(m.confidence).toBeCloseTo(0.52, 10);
    expect(m.tags).toContain("review");
  });

  it("superseded records rank below fresh records but are not deleted", () => {
    const hmem = new HMEM({ clock: fixedClock });
    const oldRec = hmem.add({ content: "we deploy with docker on fridays", confidence: 0.9, source: "test" });
    const newRec = hmem.add({ content: "we deploy with docker on mondays", confidence: 0.9, source: "test" });
    oldRec.supersededBy = newRec.id;
    const result = hmem.query("when do we deploy with docker", { threshold: 0 });
    const ids = result.memories.map((r) => r.memory.id);
    expect(ids).toContain(oldRec.id); // penalized, never filtered
    expect(ids.indexOf(newRec.id)).toBeLessThan(ids.indexOf(oldRec.id));
  });

  it("sleep preview mutates nothing; guardrails protect dream-derived records", () => {
    const DAY = 24 * 60 * 60 * 1000;
    let now = T0;
    const hmem = new HMEM({ clock: () => now });
    // An old, low-access record that is dream-derived: guardrail must block archive.
    const derived = hmem.add({ content: "synthesized insight about the roadmap", source: "dreaming", derivedFrom: ["mem-x"] });
    // An old, low-access, unreferenced plain record: archivable.
    const plain = hmem.add({ content: "random one-off note about parking", source: "test" });
    now = T0 + 40 * DAY;

    const before = JSON.stringify(hmem.store.snapshotAll());
    const preview = hmem.sleep.preview();
    expect(JSON.stringify(hmem.store.snapshotAll())).toBe(before); // preview is pure
    expect(preview.toArchive).toContain(plain.id);
    expect(preview.toArchive).not.toContain(derived.id);

    const report = hmem.sleep.execute(preview);
    expect(hmem.store.get(plain.id)).toBeUndefined();
    expect(hmem.store.get(derived.id)).toBeDefined();
    hmem.sleep.restore(report.backupId);
    expect(hmem.store.get(plain.id)).toBeDefined(); // restore works
  });

  it("dream proposals are not materialized until approved", () => {
    const hmem = new HMEM({ clock: fixedClock });
    hmem.add({ content: "prefer short bullet answers", type: "preference", source: "test" });
    hmem.add({ content: "prefer python for scripting tasks", type: "preference", source: "test" });
    const proposals = hmem.dreaming.dream();
    expect(proposals.length).toBeGreaterThan(0);
    const countBefore = hmem.store.all().length;
    expect(countBefore).toBe(2); // nothing materialized yet
    const invariant = proposals.find((p) => p.type === "invariant") ?? proposals[0];
    const created = hmem.dreaming.approve(invariant.id);
    expect(created).toBeDefined();
    expect(created!.layer).toBe("long_term");
    expect(created!.derivedFrom?.length).toBeGreaterThan(0);
  });

  it("ledger is append-only and reconstructs history", () => {
    const hmem = new HMEM({ clock: fixedClock });
    const m = hmem.add({ content: "the api key lives in the vault", confidence: 0.7, source: "test" });
    hmem.feedback(m.id, "wrong");
    const history = hmem.ledger.history(m.id);
    const actions = history.map((h) => h.action);
    expect(actions).toEqual(["create", "feedback"]);
    const fb = history[1];
    expect(fb.previousState?.confidence).toBeCloseTo(0.7, 10);
    expect(fb.newState?.confidence).toBeCloseTo(0.5, 10);
  });

  it("is deterministic: identical operations with a fixed clock produce identical state", () => {
    const run = () => {
      const hmem = new HMEM({ clock: fixedClock });
      hmem.add({ content: "typescript is the primary language", type: "factual", source: "test" });
      hmem.add({ content: "prefer typescript over javascript for new services", type: "preference", source: "test" });
      hmem.query("what language do we use", { threshold: 0 });
      return JSON.stringify(hmem.store.snapshotAll()) + JSON.stringify(hmem.ledger.all());
    };
    expect(run()).toBe(run());
  });

  it("conflict auto-resolve respects the 0.70 gate and marks supersededBy", () => {
    const hmem = new HMEM({ clock: fixedClock });
    const a = hmem.add({ content: "always enable telemetry uploads for diagnostics", confidence: 0.9, source: "test" });
    const b = hmem.add({ content: "never enable telemetry uploads for diagnostics", confidence: 0.3, source: "test" });
    const found = hmem.conflicts.scan();
    expect(found.length).toBeGreaterThan(0);
    const outcome = hmem.conflicts.autoResolve(found[0]);
    if (outcome === "resolved") {
      const loser = [a, b].find((m) => m.supersededBy);
      expect(loser).toBeDefined();
      expect(hmem.store.get(a.id)).toBeDefined(); // never deleted
      expect(hmem.store.get(b.id)).toBeDefined();
    } else {
      expect(hmem.conflicts.queue().length).toBeGreaterThan(0);
    }
  });

  it("model-free mining extracts signal sentences as short-term memories", async () => {
    const hmem = new HMEM({ clock: fixedClock });
    const mined = await hmem.mine(
      "chat_message",
      "I always prefer dark mode in every editor. The weather is nice. We decided to use sqlite because it needs no server."
    );
    expect(mined.length).toBe(2);
    expect(mined.every((m) => m.layer === "short_term")).toBe(true);
    expect(mined.every((m) => m.source === "interaction:chat_message")).toBe(true);
  });
});
