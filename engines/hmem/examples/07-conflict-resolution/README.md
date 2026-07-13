# 07 · Conflict Resolution

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

When two memories contradict, H-MEM does not pick the louder one. A scanner finds candidate contradictions; a resolver decides with weighted heuristics or hands off to a human; every resolution is audited.

Prerequisite reading: [`docs/conflict-resolution.md`](../../docs/conflict-resolution.md).

---

## Scenario

A correction arrives after an old fact was already stored:

```text
mem_a  "Standup is at 9:00."   source:session:2  timestamp T0   accessCount 6
mem_b  "Standup is at 9:30."   source:user_correction  timestamp T0+14d  accessCount 1
```

Same entity (`standup`), same domain (`work/meetings`), divergent time value → a conflict.

---

## Walkthrough

### TypeScript

```ts
const detected = await conflicts.scan();
// [{ id: "conflict_91", memoryA: "mem_a", memoryB: "mem_b",
//    reason: "same entity, divergent time", confidence: 0.86 }]

for (const c of detected) {
  const decision = await conflicts.autoDecide(c);
  if (decision.confidence >= 0.7) {
    await conflicts.resolve(c.id, decision);
  } else {
    await ui.queueForHuman(c);          // low confidence → escalate
  }
}
```

### Python

```python
detected = await conflicts.scan()
for c in detected:
    decision = await conflicts.auto_decide(c)
    if decision.confidence >= 0.7:
        await conflicts.resolve(c.id, decision)
    else:
        await ui.queue_for_human(c)
```

---

## How auto-decide weighs it

Auto-decision inputs: recency, access frequency, confidence, content richness, source reliability, conflict type, similarity/domain context.

Here `mem_b` is **newer** and came from a **`user_correction`** (a high-reliability source), which outweighs `mem_a`'s higher access count. Decision:

```text
strategy: keep_b
reason:   newer record from user_correction source supersedes stale value
confidence: 0.88
```

## Resolution strategies

`keep_a` · `keep_b` · `keep_both` · `merge` · `delete_both`

`keep_both` is correct when the two are not actually contradictory (e.g. two different standups). The scanner's confidence modifiers — shared entities raise it, an explicit `supersedes` relation suppresses it as an intended replacement — exist to avoid false positives here.

## Expected effects + ledger

```json
[
  {"action":"conflict_detected","details":{"id":"conflict_91","a":"mem_a","b":"mem_b","confidence":0.86}},
  {"action":"conflict_resolved","memoryId":"mem_a",
   "previousState":{"current":true},"newState":{"supersededBy":"mem_b"},
   "details":{"strategy":"keep_b","actor":"auto"}}
]
```

- `mem_b` remains current.
- `mem_a` is marked superseded (kept for audit history, penalized in retrieval — not deleted).
- The resolution carries `previousState` and `newState`.

---

## Why it matters

- **Superseded ≠ deleted.** `mem_a` stays in the store so the audit trail can still answer "what did the agent believe before the correction?" It is just `-0.20` penalized in the ranker so it stops surfacing.
- **Escalate on low confidence.** Auto-resolving an ambiguous contradiction is how agents silently corrupt memory. Below threshold → a human decides, and that decision is ledgered with `actor`.
- **This closes the first failure mode.** "The agent used something I corrected two weeks ago" cannot happen when corrections are detected, scored against the stale value, and audited.

## Next

[`08-trust-ledger`](../08-trust-ledger/README.md) — the audit substrate every step above writes to.
