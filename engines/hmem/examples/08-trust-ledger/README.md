# 08 · Trust Ledger

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

The trust ledger is the append-only spine under every other example. Examples 01–07 each wrote to it. This example reads it back — the forensic answer to "why did the agent know that, and who changed it?"

Prerequisite reading: [`docs/trust-ledger.md`](../../docs/trust-ledger.md).

---

## Scenario

One memory's full life: mined from chat, retrieved, marked helpful, then consolidated by sleep.

## The ledger entries it produced

```json
[
  {"id":"led_1","memoryId":"mem_pnpm","action":"create","actor":"mining:session:abc",
   "timestamp":1730000000000,"details":{"source":"chat","extractor":"model"}},
  {"id":"led_2","memoryId":"mem_pnpm","action":"read","actor":"retrieval",
   "timestamp":1730003600000,"details":{"traceId":"trace_1","score":0.47}},
  {"id":"led_3","memoryId":"mem_pnpm","action":"feedback","actor":"user:42",
   "timestamp":1730003700000,"previousState":{"confidence":0.78},
   "newState":{"confidence":0.83},"details":{"signal":"helpful"}},
  {"id":"led_4","memoryId":"mem_pnpm","action":"sleep_consolidate","actor":"sleep",
   "timestamp":1730086400000,"previousState":{"layer":"working"},
   "newState":{"layer":"long_term"},"details":{"backupId":"backup_1"}}
]
```

---

## Walkthrough

### TypeScript

```ts
// "Show me everything that happened to this memory."
const history = await ledger.history({ memoryId: "mem_pnpm" });

// "What changed in the last hour?"
const recent = await ledger.range({
  since: Date.now() - 3600_000,
  actions: ["update", "delete", "synthesize"]
});

// "How many 'wrong' feedback events this week?"
const stats = await ledger.stats({
  since: Date.now() - 7 * 86400_000,
  groupBy: "action"
});
```

### Python

```python
history = await ledger.history(memory_id="mem_pnpm")
recent  = await ledger.range(since=now_ms() - 3_600_000,
                              actions=["update", "delete", "synthesize"])
stats   = await ledger.stats(since=now_ms() - 7 * 86_400_000, group_by="action")
```

---

## The forensic answer

Question: **"Why did the agent tell me to use pnpm?"**

`ledger.history("mem_pnpm")` reconstructs the chain:

1. `led_1` — created by mining from a chat message (model extractor).
2. `led_2` — retrieved at score 0.47 under `trace_1` (the confidence multiplier caps a still-working, 0.78-confidence memory well below 0.78).
3. `led_3` — the user marked that result **helpful**; confidence rose 0.78 → 0.83.
4. `led_4` — sleep consolidated it `working → long_term`, backup `backup_1`.

Every claim the agent makes is traceable to a source, a retrieval, a feedback signal, and a maintenance action.

## Invariants

- The ledger is **append-only**. Entries are never edited or deleted.
- A `delete` writes a ledger entry *before* the memory is removed or tombstoned.
- Sleep reports reference ledger IDs; conflict resolutions carry `previousState`/`newState`.
- `restore` writes its own entry and never erases prior history.
- **Ledger pruning: never destructive.** Keep the full audit log. A constrained client that must cap storage exports the oldest segment to an archive artifact and records a `ledger_rotated` entry before trimming.

---

## Why it matters

- **This is the whole thesis.** "AI memory" that cannot explain itself is the second failure mode. The ledger turns recall from a black box into an audited chain.
- **Feedback closes the loop visibly.** `led_3` is where the user's "helpful" became a confidence change the ranker reads on the next query — and it is on the record.
- **Compliance and debugging share one substrate.** "Prove the agent did not use stale data" and "why is retrieval noisy this week" are both `ledger` queries.

## Next

You have completed the first production slice (`01`, `02`, `04`, `08`). Continue with the scenario examples — start at [`chat-memory`](../chat-memory/README.md) — or the [workshops](../../workshops/README.md).
