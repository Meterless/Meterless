# World ↔ H-MEM sync

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

World Model facts replicated into an agent's [H-MEM](https://github.com/meterless/meterless/tree/main/engines/hmem). **The World Model is shared state; H-MEM is the agent's personal memory of that state.** They are complementary, not competing — this example wires them together.

## What it shows

- Subscribing to a World Model view (push diffs, not polls)
- Mining new world facts into H-MEM as durable `factual` memories
- H-MEM trust-ledger entries recording World Model provenance
- The agent "remembering" world events without re-querying the world

Prerequisite reading: [`docs/read-surface.md`](../../docs/read-surface.md), and the add-memory example in the [H-MEM repo](https://github.com/meterless/meterless/tree/main/engines/hmem).

---

## The division of responsibility

| | World Model | H-MEM |
| --- | --- | --- |
| Holds | Shared truth about entities/relationships | One agent's recall |
| Scope | Cross-agent, cross-session | Per-agent |
| Question it answers | "What is true about Acme?" | "What do *I* know/recall about Acme?" |
| Provenance | source rows + event log | trust ledger, `source: world:<id>` |

Sync flows **World → H-MEM**: when the world learns a fact, the agent's memory mines it.

## Walkthrough

```ts
import { WorldModel } from "@meterless/world-model";
import { HMEM } from "@meterless/hmem";

const world = new WorldModel({ storage: "local", namespace: "shared-world" });
const hmem  = new HMEM({ storage: "local", namespace: "agent-cleo" });

// Subscribe to a slice of the world. Subscriptions push diffs, not full state.
const unsub = world.view("timeline").subscribe(
  { type: "account", from: "2026-05-01" },
  async (diff) => {
    for (const entity of diff.added.concat(diff.changed)) {
      // Mine the world fact into the agent's long-term memory.
      await hmem.add({
        content: `${entity.attrs.name} (${entity.type}): ${entity.attrs.summary ?? ""}`,
        type: "factual",
        layer: "long_term",
        source: `world:${entity.id}`,            // provenance points back to the world
        tags: [`world:${entity.type}`, ...(entity.attrs.tags ?? [])],
        entities: [{ name: entity.attrs.name, type: entity.type }],
        confidence: entity.confidence ?? 0.9,
      });
    }
  },
);

// Something updates the shared world (could be any agent, any pipeline).
await world.upsertEntity({
  type: "account",
  externalKey: { system: "salesforce", id: "0015g00000ACME" },
  attrs: { name: "Acme Corp", summary: "Renewed enterprise plan, $80k ARR" },
  source: { kind: "api", at: new Date() },
});

// The agent now recalls it WITHOUT querying the world again.
const recalled = await hmem.query({ text: "What do I know about Acme?", topN: 3 });
console.log(recalled.memories[0].content);
console.log(recalled.memories[0].source);

unsub();
```

## Run it

This repo is an implementation spec — neither `@meterless/world-model` nor `@meterless/hmem` is a published package. Treat `index.ts` as a reference program against the two contracts: point the imports at your own implementations (World Model per [`AGENTS.md`](../../AGENTS.md); H-MEM per its own repo, [github.com/meterless/meterless/tree/main/engines/hmem](https://github.com/meterless/meterless/tree/main/engines/hmem)), then run `npx tsx ./index.ts`.

## Expected output

```text
Acme Corp (account): Renewed enterprise plan, $80k ARR
world:account:salesforce:0015g00000ACME
```

The agent recalls the Acme fact from its own H-MEM. The `source` proves it originated in the World Model — and H-MEM's trust ledger has a `create` entry for it (see the trust-ledger example in the [H-MEM repo](https://github.com/meterless/meterless/tree/main/engines/hmem)).

---

## Why it matters

- **One source of truth, many memories.** The world is authoritative; each agent keeps a cheap, queryable personal copy of the slice it cares about. No agent re-queries the world on every turn.
- **Provenance survives the hop.** `source: world:account:...` means an audit can trace an agent's belief all the way back to the World Model event that produced it.
- **Diffs, not polls.** The subscription pushes only what changed. A long-running agent stays current without a polling loop hammering the read surface.
- **The sync is one-directional and safe.** World → memory only. The agent never writes back through this path; world writes go through the ingest pipeline (see [`docs/ingest-pipeline.md`](../../docs/ingest-pipeline.md)).

## Next

- The `world-model-sync` example in the [H-MEM repo](https://github.com/meterless/meterless/tree/main/engines/hmem) — the reciprocal: the same sync from inside H-MEM.
- [`scout-context-plan-to-world-query`](../scout-context-plan-to-world-query/README.md) — Scout deciding *which* world slice to pull.
- [`agent-run-world-state`](../agent-run-world-state/README.md) — the agent's run state living in the world too.
