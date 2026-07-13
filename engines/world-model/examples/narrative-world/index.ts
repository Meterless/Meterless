// When you build your own engine per AGENTS.md, import it here instead.
import { WorldModel } from "../../reference/src/index.ts";

async function main() {
  const world = new WorldModel({ storage: "local", namespace: "gridiron" });

  // Bloodline: three generations of Frazier QBs
  const lineage = [
    { id: "tommie-frazier-sr", name: "Tommie Frazier Sr.", debut: 88, tier: "starter" },
    { id: "tommie-frazier-ii", name: "Tommie Frazier II", debut: 115, tier: "all-pro" },
    { id: "tommie-frazier-iii", name: "Tommie Frazier III", debut: 142, tier: "legendary" },
  ];

  for (const p of lineage) {
    await world.upsertEntity({
      type: "player",
      externalKey: { system: "gridiron", id: p.id },
      attrs: { name: p.name, position: "QB", debutSeason: p.debut, tier: p.tier },
      source: { kind: "manual", at: new Date() },
    });
  }

  // child-of relationships
  await world.relate({
    from: "player:gridiron:tommie-frazier-ii",
    type: "child-of",
    to: "player:gridiron:tommie-frazier-sr",
    source: { kind: "manual", at: new Date() },
  });
  await world.relate({
    from: "player:gridiron:tommie-frazier-iii",
    type: "child-of",
    to: "player:gridiron:tommie-frazier-ii",
    source: { kind: "manual", at: new Date() },
  });

  // Nested contexts
  await world.upsertContext({
    type: "season",
    externalKey: { system: "gridiron", id: "145" },
    attrs: { year: 145 },
    source: { kind: "manual", at: new Date() },
  });
  await world.upsertContext({
    type: "game",
    externalKey: { system: "gridiron", id: "sb-145" },
    parent: "season:gridiron:145",
    attrs: { round: "super-bowl" },
    source: { kind: "manual", at: new Date() },
  });

  // Tommie Frazier III plays for Bengals; Eldridge Dickey Sr for Redskins
  await world.upsertEntity({
    type: "team",
    externalKey: { system: "gridiron", id: "bengals" },
    attrs: { name: "Bengals" },
    source: { kind: "manual", at: new Date() },
  });
  await world.upsertEntity({
    type: "team",
    externalKey: { system: "gridiron", id: "redskins" },
    attrs: { name: "Redskins" },
    source: { kind: "manual", at: new Date() },
  });
  await world.relate({
    from: "player:gridiron:tommie-frazier-iii",
    type: "plays-for",
    to: "team:gridiron:bengals",
    context: "season:gridiron:145",
    source: { kind: "manual", at: new Date() },
  });

  // The Super Bowl matchup
  await world.relate({
    from: "game:gridiron:sb-145",
    type: "features-team",
    to: "team:gridiron:bengals",
    source: { kind: "manual", at: new Date() },
  });
  await world.relate({
    from: "game:gridiron:sb-145",
    type: "features-team",
    to: "team:gridiron:redskins",
    source: { kind: "manual", at: new Date() },
  });

  // Query: full Frazier bloodline
  const ancestors = await world.view("graph").traverse("player:gridiron:tommie-frazier-iii", {
    via: "child-of",
    direction: "ancestors",
    maxDepth: 5,
  });
  console.log("Frazier bloodline:", ancestors.map((e) => e.attrs.name));

  // Query: who plays in Super Bowl 145?
  const teams = await world.view("graph").neighborsOf("game:gridiron:sb-145", { via: "features-team" });
  console.log("SB 145 teams:", teams.map((t) => t.attrs.name));
}

main();
