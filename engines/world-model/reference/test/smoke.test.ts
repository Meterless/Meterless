import { describe, expect, it } from "vitest";
import {
  WorldModel, canonicalJson, decide, entityIdFromName, nameSimilarity, normalizeName,
} from "../src/index.ts";

const AT = "2026-05-17T10:00:00.000Z";
const src = (at = AT) => ({ kind: "manual" as const, at });
const fixedClock = () => new Date(AT);

describe("World Model reference implementation", () => {
  it("stable ids: diacritics and NBSP normalize identically; distinct names stay distinct", () => {
    expect(normalizeName("José  García")).toBe(normalizeName("Jose Garcia"));
    expect(normalizeName("Jose Garcia")).toBe("jose garcia");
    expect(entityIdFromName("person", "José García")).toBe(entityIdFromName("person", "jose garcia"));
    expect(entityIdFromName("org", "Acme Corp")).not.toBe(entityIdFromName("org", "Acme Corporation"));
    expect(entityIdFromName("person", "x")).not.toBe(entityIdFromName("org", "x")); // type is part of the key
  });

  it("merge bands: 0.85 exactly auto-merges, 0.82 exactly queues, below is new", () => {
    expect(decide(0.86)).toBe("auto-merge");
    expect(decide(0.85)).toBe("auto-merge");
    expect(decide(0.84)).toBe("review");
    expect(decide(0.82)).toBe("review");
    expect(decide(0.81)).toBe("new");
  });

  it("rejects writes without provenance", async () => {
    const world = new WorldModel({ storage: "memory", namespace: "t" });
    await expect(
      world.upsertEntity({ type: "person", name: "No Provenance", source: undefined as never })
    ).rejects.toThrow(/provenance/i);
  });

  it("upserts merge attrs; snapshot view answers point-in-time queries; bitemporal edges close", async () => {
    const world = new WorldModel({ storage: "memory", namespace: "t" });
    await world.upsertEntity({
      type: "player", externalKey: { system: "g", id: "p1" },
      attrs: { name: "P One", overall: 87 }, source: src("2087-08-01T12:00:00.000Z"),
    });
    await world.upsertEntity({
      type: "player", externalKey: { system: "g", id: "p1" },
      attrs: { overall: 94, tier: "all-pro" }, source: src("2088-01-20T12:00:00.000Z"),
    });
    const august = world.view("snapshot").entityAt("player:g:p1", "2087-08-15");
    const feb = world.view("snapshot").entityAt("player:g:p1", "2088-02-01");
    expect(august?.attrs.overall).toBe(87);
    expect(august?.attrs.tier).toBeUndefined();
    expect(feb?.attrs.overall).toBe(94);
    expect(feb?.attrs.tier).toBe("all-pro");

    // Edge supersession: same (from, type, context), new target closes the old edge.
    await world.upsertEntity({ type: "team", externalKey: { system: "g", id: "a" }, attrs: {}, source: src("2087-01-01T00:00:00.000Z") });
    await world.upsertEntity({ type: "team", externalKey: { system: "g", id: "b" }, attrs: {}, source: src("2087-01-01T00:00:00.000Z") });
    await world.relate({ from: "player:g:p1", type: "plays-for", to: "team:g:a", validFrom: "2087-01-01T00:00:00.000Z", source: src("2087-01-01T00:00:00.000Z") });
    await world.relate({ from: "player:g:p1", type: "plays-for", to: "team:g:b", validFrom: "2088-03-01T00:00:00.000Z", source: src("2088-03-01T00:00:00.000Z") });
    const now = world.view("graph").neighborsOf("player:g:p1", { via: "plays-for" });
    expect(now.map((e) => e.id)).toEqual(["team:g:b"]);
    const during2087 = world.view("graph").neighborsOf("player:g:p1", { via: "plays-for", at: "2087-06-01T00:00:00.000Z" });
    expect(during2087.map((e) => e.id)).toEqual(["team:g:a"]);
  });

  it("fact conflicts: highest-confidence-wins puts the winner on the entity and marks losers", async () => {
    const world = new WorldModel({ storage: "memory", namespace: "t", conflictPolicy: "highest-confidence-wins" });
    await world.assertFact({ about: "person:jerome-powell", predicate: "title", value: "Chair", confidence: 0.95, source: { kind: "rss", url: "a", at: "2026-05-17T09:00:00.000Z" } });
    await world.assertFact({ about: "person:jerome-powell", predicate: "title", value: "Chairman", confidence: 0.7, source: { kind: "rss", url: "b", at: "2026-05-17T09:30:00.000Z" } });
    const entity = world.view("graph").entity("person:jerome-powell");
    expect(entity?.attrs.title).toBe("Chair");
    const facts = world.view("facts").about("person:jerome-powell");
    expect(facts).toHaveLength(2);
    expect(facts.filter((f) => f.supersededBy)).toHaveLength(1);
  });

  it("name resolution: near-duplicates auto-merge or queue by band", async () => {
    const world = new WorldModel({ storage: "memory", namespace: "t" });
    await world.upsertEntity({ type: "person", name: "Jerome Powell", source: src() });
    // Identical after normalization: same id, no merge machinery involved.
    await world.upsertEntity({ type: "person", name: "jerome powell", source: src() });
    // One edit in 13 chars: similarity 12/13 = 0.923 -> auto-merge (alias).
    const merged = await world.upsertEntity({ type: "person", name: "Jerome Powel", source: src() });
    expect(merged.id).toBe(entityIdFromName("person", "Jerome Powell"));
    expect(world.view("graph").entity(entityIdFromName("person", "Jerome Powel"))?.id).toBe(entityIdFromName("person", "Jerome Powell"));
    // Similarity in [0.82, 0.85) queues for review.
    const sim = nameSimilarity("Jerome Powell x", "Jerome Powell abc");
    expect(sim).toBeGreaterThanOrEqual(0.82);
    expect(sim).toBeLessThan(0.85);
    await world.upsertEntity({ type: "person", name: "Jerome Powell abc", source: src() });
    await world.upsertEntity({ type: "person", name: "Jerome Powell x", source: src() });
    expect(world.mergeQueue().some((p) => p.status === "pending")).toBe(true);
  });

  it("ingest is idempotent: same batch twice, empty diff; a mutation changes the shape", async () => {
    const observations = [
      { externalId: "art-1", title: "Fed holds rates", at: "2026-05-17T14:00:00.000Z", source: { kind: "rss" as const, at: "2026-05-17T14:00:00.000Z" }, entities: [{ type: "person", name: "Jerome Powell" }] },
      { externalId: "art-2", title: "Powell signals patience", at: "2026-05-17T16:30:00.000Z", source: { kind: "rss" as const, at: "2026-05-17T16:30:00.000Z" }, entities: [{ type: "person", name: "Jerome Powell" }] },
    ];
    const world = new WorldModel({ storage: "memory", namespace: "t", clock: fixedClock });
    const first = await world.ingest(observations);
    expect(first.processed).toBe(2);
    expect(first.clusters).toBeGreaterThan(0);
    const shape1 = world.stateShapeCanonical();
    const second = await world.ingest(observations);
    expect(second.processed).toBe(0);
    expect(second.skippedUnchanged).toBe(2);
    expect(second.changed).toBe(false);
    expect(world.stateShapeCanonical()).toBe(shape1); // empty diff
    const third = await world.ingest([{ ...observations[0], title: "Fed holds rates steady" }]);
    expect(third.changed).toBe(true);
    expect(world.stateShapeCanonical()).not.toBe(shape1);
  });

  it("single-writer FIFO: unawaited concurrent writes serialize in audit order", async () => {
    const world = new WorldModel({ storage: "memory", namespace: "t" });
    const a = world.upsertEntity({ type: "x", name: "First Entity", source: src("2026-01-01T00:00:00.000Z") });
    const b = world.upsertEntity({ type: "x", name: "Second Entity", source: src("2026-01-02T00:00:00.000Z") });
    await Promise.all([a, b]);
    const kinds = world.audit().map((e) => e.summary);
    expect(kinds[0]).toContain("First Entity".toLowerCase().replace(/ /g, "") ? entityIdFromName("x", "First Entity") : "");
    expect(world.audit().length).toBe(2);
    expect(world.audit()[0].seq).toBeLessThan(world.audit()[1].seq);
  });

  it("custom views fold over matching events", async () => {
    const world = new WorldModel({ storage: "memory", namespace: "t" });
    await world.upsertEntity({ type: "account", externalKey: { system: "sf", id: "a1" }, attrs: {}, source: src() });
    await world.upsertContext({ type: "campaign", externalKey: { system: "sf", id: "c1" }, attrs: {}, source: src() });
    await world.relate({ from: "account:sf:a1", type: "open-deal", to: "campaign:sf:c1", attrs: { stage: "negotiation", daysInStage: 14 }, source: src() });
    world.registerView("stuck-deals", {
      events: ["relate"],
      initialState: [] as { account: string; days: number }[],
      reducer: (state, event) => {
        const p = event.payload as { type?: string; attrs?: { daysInStage?: number }; from?: string };
        if (p.type === "open-deal" && (p.attrs?.daysInStage ?? 0) > 10) state.push({ account: p.from!, days: p.attrs!.daysInStage! });
        return state;
      },
    });
    const stuck = world.view("stuck-deals").get() as { account: string; days: number }[];
    expect(stuck).toHaveLength(1);
    expect(stuck[0].days).toBe(14);
  });

  it("is deterministic: identical operations produce identical canonical state", async () => {
    const go = async () => {
      const world = new WorldModel({ storage: "memory", namespace: "t", clock: fixedClock });
      await world.upsertEntity({ type: "person", name: "Ada Lovelace", source: src() });
      await world.assertFact({ about: entityIdFromName("person", "Ada Lovelace"), predicate: "field", value: "mathematics", confidence: 0.9, source: src() });
      return world.stateShapeCanonical() + canonicalJson(world.audit());
    };
    expect(await go()).toBe(await go());
  });
});
