// Unpublished spec packages: the sibling engine has not dropped yet. Build
// or wait for it, then point these imports at real implementations.
import { WorldModel } from "@meterless/world-model";
import { Swarm } from "@meterless/swarm";

async function main() {
  const world = new WorldModel({ storage: "memory", namespace: "swarm-world" });
  const swarm = new Swarm();

  // Seed a small world with three stuck deals
  for (const id of ["acme", "globex", "initech"]) {
    await world.upsertEntity({
      type: "account",
      externalKey: { system: "sf", id },
      attrs: { name: id.toUpperCase() },
      source: { kind: "manual", at: new Date() },
    });
    await world.relate({
      from: `account:sf:${id}`,
      type: "open-deal",
      to: "campaign:internal:renewal-q2",
      attrs: { stage: "negotiation", daysInStage: 18 },
      source: { kind: "manual", at: new Date() },
    });
  }

  // Planner asks World Model what stuck deals exist
  const stuckDeals = await world.view("graph").query({
    edgeType: "open-deal",
    filter: (rel) => rel.attrs.daysInStage > 14,
  });

  // Build the DAG — one analysis task per stuck deal
  const dag = swarm.plan({
    goal: "Draft a recovery email for each stuck deal",
    tasks: stuckDeals.map((deal) => ({
      id: `analyze-${deal.from}`,
      kind: "analyze-deal",
      input: { accountRef: deal.from, dealAttrs: deal.attrs },
    })),
  });

  const result = await swarm.execute(dag);

  // Write the result back into World Model as a new fact per account
  for (const taskResult of result.tasks) {
    await world.assertFact({
      about: taskResult.input.accountRef,
      predicate: "drafted-recovery-email",
      value: taskResult.output.draft,
      confidence: 0.9,
      source: { kind: "agent", by: `swarm:${result.runId}`, at: new Date() },
      assertedAt: new Date(),
    });
  }

  console.log("Swarm produced drafts for", result.tasks.length, "accounts");
  console.log("Drafts written back into World Model");
}

main();
