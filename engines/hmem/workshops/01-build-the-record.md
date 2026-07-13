# Workshop 01 · Build the Record and Store

**Prereq:** none. **Time:** ~60 min. **Builds on:** —

## Outcome

By the end you can capture, persist across tiers, hydrate, and audit a memory record — and explain why provenance and the ledger are not optional.

Reference: [`docs/memory-record.md`](../docs/memory-record.md), [`docs/tiered-storage.md`](../docs/tiered-storage.md), [`docs/trust-ledger.md`](../docs/trust-ledger.md).

---

## Exercise 1 — Define the canonical record

Implement the shape in your language. Required field families:

```text
Identity     id, content, type(personal|factual|preference|general)
Tiering      layer(short_term|working|long_term)
Time/usage   timestamp, lastAccessed, accessCount
Organization tags, domain?, namespace?
Retrieval    embedding?, score?
Reliability  confidence, source
Provenance   provenance?(origin, learnedAt, label, refs?) — mandatory for new writes
Scoping      chatId?, missionId?, goalRunId?
Graph        entities[], relatedTo[]
Lineage      supersedes?, supersededBy?, derivedFrom[]
```

**Checkpoint:** a record with no `source` must be rejected by construction (type system or a validator). Provenance is mandatory.

## Exercise 2 — Tiered storage

Back each tier with a different store:

- `short_term` → in-memory / session
- `working` → SQLite or IndexedDB
- `long_term` → durable DB

**Checkpoint:** `add(memory)` routes by `memory.layer` and returns the stored record with `id` and timestamps assigned.

## Exercise 3 — Hydrate

```text
load long_term
  + load working
  + attach session short_term
  -> dedupe by id
  -> backfill missing embeddings
  -> apply forgetting curve to NON-long_term records
```

**Checkpoint:** after a simulated restart, long-term and working memories return; a stale low-access short-term memory is decayed out.

## Exercise 4 — Ledger on every mutation

Wrap `add` / `update` / `delete` so each writes a ledger entry. A delete must ledger *before* removal.

**Checkpoint:** create one memory, update its confidence, then run:

```text
ledger.history(memoryId)
=> [ {action:create,...}, {action:update, previousState:{confidence:..}, newState:{confidence:..}} ]
```

If `history` cannot reconstruct the change, the lab is not complete.

## Exercise 5 — Discussion (do not skip)

1. **Skip the ledger:** the store still "works." What exact question can you no longer answer? (Map it to one of the three agent-memory failure modes.)
2. **Skip tiering — one flat table:** what breaks first as the store grows — correctness or retrieval quality? Why does the forgetting curve need the tier distinction?
3. Where should `confidence` start for a hand-entered memory vs. a model-extracted one, and why never `1.0` for the latter?

---

## Done when

- A record cannot exist without `source`.
- Memories persist to the correct tier and survive hydrate.
- Every create/update/delete is reconstructable via `ledger.history`.

Validate against the **Trust ledger** eval category in [`evals/tests`](../evals/tests/README.md).

## Next

[`02-mine-and-enrich.md`](02-mine-and-enrich.md) — stop hand-building records; extract them from interactions.
