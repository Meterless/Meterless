// World Model conformance runner. Executes ANY implementation against the
// spec's load-bearing invariants and prints a scorecard.
//
//   npx tsx runner.ts                                          # runs the reference
//   WORLD_MODEL_IMPL=/abs/path/index.ts npx tsx runner.ts      # runs YOURS
//
// Required exports: WorldModel (class), entityIdFromName, normalizeName,
// decide (merge banding). Boundary rulings asserted here: similarity 0.85
// EXACTLY auto-merges; 0.82 EXACTLY queues for review.

import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const implPath = process.env.WORLD_MODEL_IMPL ?? path.join(here, "..", "reference", "src", "index.ts");

interface CaseResult { id: string; description: string; status: "PASS" | "FAIL"; detail?: string }
const results: CaseResult[] = [];

async function loadImpl(): Promise<any> {
  try {
    const mod = await import(pathToFileURL(path.resolve(implPath)).href);
    for (const req of ["WorldModel", "entityIdFromName", "normalizeName", "decide"]) {
      if (typeof mod[req] !== "function") {
        console.error(`conformance: module at ${implPath} is missing export "${req}". Exports: ${Object.keys(mod).join(", ") || "(none)"}`);
        process.exit(2);
      }
    }
    return mod;
  } catch (err) {
    console.error(`conformance: could not load implementation at ${implPath}\n  ${(err as Error).message}`);
    process.exit(2);
  }
}

const record = async (id: string, description: string, fn: () => void | Promise<void>) => {
  try {
    await fn();
    results.push({ id, description, status: "PASS" });
  } catch (err) {
    results.push({ id, description, status: "FAIL", detail: (err as Error).message });
  }
};
const assert = (cond: boolean, msg: string) => {
  if (!cond) throw new Error(msg);
};

const OBSERVATIONS = [
  { externalId: "a1", title: "Fed holds rates", at: "2026-05-17T14:00:00.000Z", source: { kind: "rss", at: "2026-05-17T14:00:00.000Z" }, entities: [{ type: "person", name: "Jerome Powell" }] },
  { externalId: "a2", title: "Powell signals patience", at: "2026-05-17T16:30:00.000Z", source: { kind: "rss", at: "2026-05-17T16:30:00.000Z" }, entities: [{ type: "person", name: "Jerome Powell" }] },
];

async function main(): Promise<void> {
  const mod = await loadImpl();
  const { WorldModel, entityIdFromName, normalizeName, decide } = mod;
  const clock = () => new Date("2026-05-18T00:00:00.000Z");

  await record("sid-001", "stable ids: diacritics and NBSP normalize identically (NFKD + strip marks)", () => {
    assert(normalizeName("José  García") === normalizeName("Jose Garcia"), "accented + NBSP name must normalize to the plain form");
    assert(entityIdFromName("person", "José García") === entityIdFromName("person", "jose garcia"), "same normalized name must produce the same id");
  });

  await record("sid-002", "stable ids: distinct names stay distinct (no over-normalization)", () => {
    assert(entityIdFromName("org", "Acme Corp") !== entityIdFromName("org", "Acme Corporation"), "different names must produce different ids");
    assert(entityIdFromName("person", "x") !== entityIdFromName("org", "x"), "type participates in the key");
  });

  await record("band-001", "merge bands at the boundaries: 0.85 auto, 0.84 review, 0.82 review, 0.81 new", () => {
    assert(decide(0.85) === "auto-merge", "0.85 exactly is auto-merge (>= reading)");
    assert(decide(0.84) === "review", "0.84 queues for review");
    assert(decide(0.82) === "review", "0.82 exactly queues");
    assert(decide(0.81) === "new", "0.81 is a new entity");
  });

  await record("prov-001", "writes without provenance are rejected", async () => {
    const world = new WorldModel({ storage: "memory", namespace: "conf" });
    let rejected = false;
    try {
      await world.upsertEntity({ type: "person", name: "No Provenance", source: undefined });
    } catch {
      rejected = true;
    }
    assert(rejected, "no provenance, no write");
  });

  await record("idem-001", "ingest idempotency: same batch twice produces an empty diff", async () => {
    const world = new WorldModel({ storage: "memory", namespace: "conf", clock });
    await world.ingest(OBSERVATIONS);
    const shape1 = world.stateShapeCanonical();
    const second = await world.ingest(OBSERVATIONS);
    assert(second.changed === false, "second run must report changed=false");
    assert(world.stateShapeCanonical() === shape1, "canonical state must be identical after re-ingest");
  });

  await record("idem-002", "the idempotency check can fail: a mutated batch changes the shape", async () => {
    const world = new WorldModel({ storage: "memory", namespace: "conf", clock });
    await world.ingest(OBSERVATIONS);
    const shape1 = world.stateShapeCanonical();
    const mutated = [{ ...OBSERVATIONS[0], title: OBSERVATIONS[0].title + " (edited)" }, OBSERVATIONS[1]];
    const run = await world.ingest(mutated);
    assert(run.changed === true, "an edited observation must report changed=true");
    assert(world.stateShapeCanonical() !== shape1, "canonical state must differ after a real edit");
  });

  await record("bitemp-001", "bitemporal edges: a superseding edge closes the old one; point-in-time queries respect validity", async () => {
    const world = new WorldModel({ storage: "memory", namespace: "conf" });
    const at = (s: string) => ({ kind: "manual", at: s });
    await world.upsertEntity({ type: "player", externalKey: { system: "g", id: "p1" }, attrs: {}, source: at("2087-01-01T00:00:00.000Z") });
    await world.upsertEntity({ type: "team", externalKey: { system: "g", id: "a" }, attrs: {}, source: at("2087-01-01T00:00:00.000Z") });
    await world.upsertEntity({ type: "team", externalKey: { system: "g", id: "b" }, attrs: {}, source: at("2088-03-01T00:00:00.000Z") });
    await world.relate({ from: "player:g:p1", type: "plays-for", to: "team:g:a", validFrom: "2087-01-01T00:00:00.000Z", source: at("2087-01-01T00:00:00.000Z") });
    await world.relate({ from: "player:g:p1", type: "plays-for", to: "team:g:b", validFrom: "2088-03-01T00:00:00.000Z", source: at("2088-03-01T00:00:00.000Z") });
    const now = world.view("graph").neighborsOf("player:g:p1", { via: "plays-for" });
    assert(now.length === 1 && now[0].id === "team:g:b", `open edge should point at team b; got [${now.map((e: any) => e.id)}]`);
    const then = world.view("graph").neighborsOf("player:g:p1", { via: "plays-for", at: "2087-06-01T00:00:00.000Z" });
    assert(then.length === 1 && then[0].id === "team:g:a", `2087 query should return team a; got [${then.map((e: any) => e.id)}]`);
  });

  await record("audit-001", "every mutation writes an audit entry in order", async () => {
    const world = new WorldModel({ storage: "memory", namespace: "conf" });
    await world.upsertEntity({ type: "x", name: "Audit One", source: { kind: "manual", at: "2026-01-01T00:00:00.000Z" } });
    await world.upsertEntity({ type: "x", name: "Audit Two", source: { kind: "manual", at: "2026-01-02T00:00:00.000Z" } });
    const audit = world.audit();
    assert(audit.length >= 2, `expected >= 2 audit entries, got ${audit.length}`);
    for (let i = 1; i < audit.length; i++) assert(audit[i].seq > audit[i - 1].seq, "audit seq must be strictly increasing");
  });

  const pass = results.filter((r) => r.status === "PASS").length;
  console.log(`\nWorld Model conformance: implementation = ${implPath}\n`);
  for (const r of results) console.log(`  ${r.status} ${r.id} ${r.description}${r.detail ? `\n       ${r.detail}` : ""}`);
  console.log(`\n  ${pass}/${results.length} checks passed`);
  process.exit(pass === results.length ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
