# Agent-run world state

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

A long-running agent that survives a process restart. The agent process is **stateless** — all of its run state lives in the World Model. Kill it mid-task, restart, and it picks up exactly where it left off.

## What it shows

- An agent that records run state as entities + events
- A `run` context with nested `step` contexts
- **Resuming after a crash** by reading current state, not a checkpoint file
- Provenance (`kind: "agent"`) on every write

Prerequisite reading: [`docs/aggregate-shapes.md`](../../docs/aggregate-shapes.md), [`examples/narrative-world`](../narrative-world/README.md) (nested contexts).

---

## The idea

> The agent does not own its state. The World Model does. The process is disposable.

A "task" is a `run` context. Each step appends an event under it. Resume = read the run's current state and continue from the last completed step. No local file, no in-memory checkpoint to lose.

## Walkthrough — `index.ts`

```ts
import { WorldModel } from "@meterless/world-model";

const world = new WorldModel({ storage: "local", namespace: "agent-runs" });
const RUN = "data-migration-2026-05";
const agent = { kind: "agent" as const, by: "migrator-v3", at: new Date() };

async function start() {
  await world.upsertContext({
    type: "run",
    externalKey: { system: "agent", id: RUN },
    attrs: { task: "Migrate 3 datasets", status: "running", lastStep: 0 },
    source: agent,
  });
  console.log("run started:", RUN);
}

async function step() {
  const run = await world.view("snapshot").contextAt(`run:agent:${RUN}`, "now");
  const n = run.attrs.lastStep + 1;

  await world.upsertContext({
    type: "step",
    externalKey: { system: "agent", id: `${RUN}-step-${n}` },
    parent: `run:agent:${RUN}`,
    attrs: { index: n, status: "done", result: `dataset-${n} migrated` },
    source: agent,
  });

  // Advance the run pointer. This is the durable "where am I" — not a local var.
  await world.upsertContext({
    type: "run",
    externalKey: { system: "agent", id: RUN },
    attrs: { ...run.attrs, lastStep: n },
    source: agent,
  });
  console.log(`step ${n} done`);
}

async function resume() {
  const run = await world.view("snapshot").contextAt(`run:agent:${RUN}`, "now");
  if (!run) return console.log("no such run");

  const steps = await world.view("graph").contextChildren(`run:agent:${RUN}`, { type: "step" });
  console.log(`resuming "${run.attrs.task}" — ${run.attrs.lastStep}/3 steps complete`);
  console.log("completed:", steps.map((s) => s.attrs.result));

  if (run.attrs.lastStep >= 3) {
    await world.upsertContext({
      type: "run", externalKey: { system: "agent", id: RUN },
      attrs: { ...run.attrs, status: "complete" }, source: agent,
    });
    console.log("run complete");
  } else {
    await step(); // continue from exactly where it crashed
  }
}

const cmd = process.argv[2];
({ start, step, resume })[cmd]?.() ?? console.log("usage: start | step | resume");
```

## Run it

This repo is an implementation spec — `@meterless/world-model` is not a published package. Treat `index.ts` as a reference program against the contract in [`/docs`](../../docs/architecture.md); point the import at your own implementation (built per [`AGENTS.md`](../../AGENTS.md)), then walk the crash/resume flow:

```bash
# First run — start a task, do two steps, then "crash" (process exits)
npx tsx ./index.ts start
npx tsx ./index.ts step
npx tsx ./index.ts step

# Simulate a process restart — a brand-new process, zero local state
npx tsx ./index.ts resume
```

## Expected output

```text
run started: data-migration-2026-05
step 1 done
step 2 done
resuming "Migrate 3 datasets" — 2/3 steps complete
completed: ["dataset-1 migrated", "dataset-2 migrated"]
step 3 done
```

Each `npx tsx` invocation is a **fresh process** with no shared memory. The third dataset gets migrated after a full restart because the run pointer (`lastStep: 2`) was durable in the World Model, not in the dead process.

---

## Why it matters

- **Crash recovery is free, not engineered.** There is no checkpoint file to write, fsync, or corrupt. "Where was I?" is a snapshot-view read of the run context.
- **The process is disposable.** Scale agents horizontally, kill them on deploy, run them as Lambdas — state lives in shared, queryable, audited storage.
- **Every step is provenanced.** `source: { kind: "agent", by: "migrator-v3" }` on every write means an operator can later ask "which agent version did step 2, and when?"
- **Idempotent re-runs.** Re-running `step` for an already-completed index is a no-op (stable step ID), so an at-least-once scheduler cannot double-migrate.

## Next

- [`world-to-hmem-sync`](../world-to-hmem-sync/README.md) — the agent *remembering* world events in personal memory.
- [`swarm-planning-with-world-context`](../swarm-planning-with-world-context/README.md) — many agents planning over one shared world.
