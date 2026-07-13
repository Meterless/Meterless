// When you build your own engine per AGENTS.md, import it here instead.
import { WorldModel } from "../../reference/src/index.ts";

const RUN_ID = "agent-run-2026-05-18-001";
const AGENT_ID = "research-agent-v1";

async function getWorld() {
  return new WorldModel({ storage: "local", namespace: "agent-runs" });
}

async function start() {
  const world = await getWorld();

  await world.upsertEntity({
    type: "agent-run",
    externalKey: { system: "internal", id: RUN_ID },
    attrs: { agent: AGENT_ID, status: "running", startedAt: new Date().toISOString(), stepCount: 0 },
    source: { kind: "agent", by: AGENT_ID, at: new Date() },
  });

  await world.upsertContext({
    type: "agent-run-context",
    externalKey: { system: "internal", id: RUN_ID },
    attrs: { agent: AGENT_ID },
    source: { kind: "agent", by: AGENT_ID, at: new Date() },
  });

  console.log(`Started run ${RUN_ID}`);
}

async function step() {
  const world = await getWorld();
  const run = await world.view("graph").entity(`agent-run:internal:${RUN_ID}`);
  const next = (run.attrs.stepCount ?? 0) + 1;

  // Record the step as a nested context
  await world.upsertContext({
    type: "agent-step",
    externalKey: { system: "internal", id: `${RUN_ID}-step-${next}` },
    parent: `agent-run-context:internal:${RUN_ID}`,
    attrs: { stepNumber: next, doneAt: new Date().toISOString() },
    source: { kind: "agent", by: AGENT_ID, at: new Date() },
  });

  // Update the run entity
  await world.upsertEntity({
    type: "agent-run",
    externalKey: { system: "internal", id: RUN_ID },
    attrs: { stepCount: next, lastStepAt: new Date().toISOString() },
    source: { kind: "agent", by: AGENT_ID, at: new Date() },
  });

  console.log(`Step ${next} done`);
}

async function resume() {
  const world = await getWorld();
  const run = await world.view("graph").entity(`agent-run:internal:${RUN_ID}`);
  if (!run) {
    console.log("No prior run found — start first.");
    return;
  }
  console.log(`Resuming ${RUN_ID}: ${run.attrs.stepCount} steps completed`);
  console.log("Last step at:", run.attrs.lastStepAt);
  console.log("Status:", run.attrs.status);
  // Agent now picks up at step N+1 with no in-memory state
}

async function demo() {
  // No argument: run the whole lifecycle in one process so the example
  // demonstrates crash recovery end to end. Each call re-opens the world
  // from local storage; no in-memory state crosses the boundary.
  await start();
  await step();
  await step();
  await resume();
}

const cmd = process.argv[2];
if (cmd === "start") start();
else if (cmd === "step") step();
else if (cmd === "resume") resume();
else demo();
