// When you build your own engine per AGENTS.md, import it here instead.
import { WorldModel } from "../../reference/src/index.ts";

async function main() {
  const world = new WorldModel({ storage: "memory", namespace: "demo" });

  await world.upsertEntity({
    type: "player",
    externalKey: { system: "gridiron", id: "tommie-frazier-iii" },
    attrs: { name: "Tommie Frazier III", position: "QB", tier: "legendary" },
    source: { kind: "manual", at: new Date() },
  });

  await world.upsertEntity({
    type: "team",
    externalKey: { system: "gridiron", id: "bengals" },
    attrs: { name: "Bengals", city: "Cincinnati" },
    source: { kind: "manual", at: new Date() },
  });

  await world.upsertContext({
    type: "season",
    externalKey: { system: "gridiron", id: "145" },
    attrs: { year: 145 },
    source: { kind: "manual", at: new Date() },
  });

  // References use the externally-keyed id grammar: type:system:externalId
  await world.relate({
    from: "player:gridiron:tommie-frazier-iii",
    type: "plays-for",
    to: "team:gridiron:bengals",
    context: "season:gridiron:145",
    source: { kind: "manual", at: new Date() },
  });

  const roster = await world.view("graph").neighborsOf("team:gridiron:bengals", {
    via: "plays-for",
    inContext: "season:gridiron:145",
  });

  console.log("Bengals roster, season 145:", roster);
}

main();
