// When you build your own engine per AGENTS.md, import it here instead.
import { WorldModel } from "../../reference/src/index.ts";

async function main() {
  const world = new WorldModel({ storage: "memory", namespace: "snapshots-demo" });

  // Day 1 — initial state
  await world.upsertEntity({
    type: "player",
    externalKey: { system: "gridiron", id: "eldridge-dickey-sr" },
    attrs: { name: "Eldridge Dickey Sr.", team: "redskins", position: "QB", overall: 87 },
    source: { kind: "manual", at: new Date("2087-08-01T12:00:00Z") },
  });

  // Mid-season — overall rises
  await world.upsertEntity({
    type: "player",
    externalKey: { system: "gridiron", id: "eldridge-dickey-sr" },
    attrs: { overall: 91 },
    source: { kind: "manual", at: new Date("2087-11-15T12:00:00Z") },
  });

  // Playoffs — promoted to all-pro tier
  await world.upsertEntity({
    type: "player",
    externalKey: { system: "gridiron", id: "eldridge-dickey-sr" },
    attrs: { overall: 94, tier: "all-pro" },
    source: { kind: "manual", at: new Date("2088-01-20T12:00:00Z") },
  });

  // Query at three timestamps
  const augustView = await world
    .view("snapshot")
    .entityAt("player:gridiron:eldridge-dickey-sr", "2087-08-15");

  const novemberView = await world
    .view("snapshot")
    .entityAt("player:gridiron:eldridge-dickey-sr", "2087-11-30");

  const februaryView = await world
    .view("snapshot")
    .entityAt("player:gridiron:eldridge-dickey-sr", "2088-02-01");

  console.log("August:", augustView.attrs); // overall: 87
  console.log("November:", novemberView.attrs); // overall: 91
  console.log("February:", februaryView.attrs); // overall: 94, tier: all-pro

  // Same stable ID across all three
  console.log("Same ID:", augustView.id === februaryView.id);
}

main();
