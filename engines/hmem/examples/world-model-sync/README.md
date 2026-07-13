# World Model sync

> Cross-engine example: it runs once the sibling engine reference implementation lands; until then treat the code as a reference sketch of the contract.

H-MEM is the agent's personal memory of shared state held in the [World Model](https://github.com/meterless/meterless/tree/main/engines/world-model). This example is the **H-MEM side**: what happens to a world fact once it crosses the boundary and gets `add`-ed, and how it is then recalled without re-querying the world.

> The reciprocal example, `world-to-hmem-sync`, lives in the [World Model repo](https://github.com/meterless/meterless/tree/main/engines/world-model) — it focuses on subscribing to world diffs; this one focuses on what memory does with each one.

Prerequisite reading: [`01-add-memory`](../01-add-memory/README.md), [`08-trust-ledger`](../08-trust-ledger/README.md).

---

## The division of responsibility

| | World Model | H-MEM |
| --- | --- | --- |
| Holds | Shared truth about entities/relationships | One agent's recall |
| Scope | Cross-agent, cross-session | Per-agent |
| Answers | "What is true about Acme?" | "What do *I* recall about Acme?" |
| Provenance | source rows + event log | trust ledger, `source: world:<id>` |

Sync flows **World → H-MEM**, one-directional. Memory's job is to mine each world fact into a durable, audited, recallable record.

## Walkthrough (illustrative reference API)

The code below is a reference sketch of the contract, not a runnable package — this repo is the implementation spec, and no `@meterless/*` npm packages are published.

```ts
import { HMEM } from "@meterless/hmem";
import { WorldModel } from "@meterless/world-model";

const hmem  = new HMEM({ storage: "local", namespace: "agent-cleo" });
const world = new WorldModel({ storage: "local", namespace: "shared-world" });

// Memory subscribes to the slice it cares about; the world pushes diffs.
const unsub = world.view("timeline").subscribe(
  { type: "account", from: "2026-05-01" },
  async (diff) => {
    for (const e of diff.added.concat(diff.changed)) {
      // The H-MEM side of the hop: a governed, audited add() with world provenance.
      await hmem.add({
        content: `${e.attrs.name} (${e.type}): ${e.attrs.summary ?? ""}`,
        type: "factual",
        layer: "long_term",                  // world facts are validated truth
        source: `world:${e.id}`,             // provenance points back to the world
        tags: [`world:${e.type}`, ...(e.attrs.tags ?? [])],
        entities: [{ name: e.attrs.name, type: e.type }],
        confidence: e.confidence ?? 0.9,
      });
    }
  },
);

// Any agent/pipeline updates the shared world…
await world.upsertEntity({
  type: "account",
  externalKey: { system: "salesforce", id: "0015g00000ACME" },
  attrs: { name: "Acme Corp", summary: "Renewed enterprise plan, $80k ARR" },
  source: { kind: "api", at: new Date() },
});

// …and the agent now recalls it from its OWN memory, no world round-trip.
const recalled = await hmem.query({ text: "What do I know about Acme?", topN: 3 });
console.log(recalled.memories[0].content, "|", recalled.memories[0].source);
unsub();
```

## Expected output (illustrative)

```text
Acme Corp (account): Renewed enterprise plan, $80k ARR | world:account:salesforce:0015g00000ACME
```

## What `add` does to an incoming world fact

| Step | H-MEM behavior |
| --- | --- |
| receive | `factual`, `layer: long_term` (world state is validated truth, not inferred) |
| enrich | entities/tags normalized; `source: world:<id>` retained |
| ledger | a `create` entry written — the hop is auditable (see [`08-trust-ledger`](../08-trust-ledger/README.md)) |
| recall | now answerable by `query` without touching the world again |

A world fact is **not** trusted blindly — it still goes through the same governed `add` path as any memory ([`01-add-memory`](../01-add-memory/README.md)). It just enters at `long_term` because the world is authoritative for it.

---

## Why it matters

- **The world is the truth; memory is the agent's cheap local copy.** After the sync, the agent answers "what do I know about Acme?" from its own store — no per-turn round-trip to shared state.
- **Provenance survives the hop.** `source: world:account:...` lets an audit trace the agent's belief back to the exact World Model entity, and the H-MEM ledger records when it arrived.
- **One-directional by design.** Memory never writes back through this path. World mutations go through the World Model's own ingest pipeline — keeping a single source of truth and no write-loop.

## Next

- `world-to-hmem-sync` in the [World Model repo](https://github.com/meterless/meterless/tree/main/engines/world-model) — the reciprocal: the same sync from the World Model side.
- [`scout-grounded-recall`](../scout-grounded-recall/README.md) — Scout deciding which memory slice to pull before acting.
- [`markovian-handoff`](../markovian-handoff/README.md) — the other "memory absorbs an external engine" pattern.
