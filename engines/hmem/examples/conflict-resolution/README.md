# Scenario · Conflict Resolution at Scale

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

[`07-conflict-resolution`](../07-conflict-resolution/README.md) walks one contradiction end to end. This scenario covers the operational reality: conflict detection is a **scheduled batch job** over the whole store, most resolutions are automatic, and the few ambiguous ones must escalate cleanly.

Prerequisite reading: [`docs/conflict-resolution.md`](../../docs/conflict-resolution.md).

---

## The scheduled scan

Run conflict detection daily (see [`docs/architecture.md`](../../docs/architecture.md) cadence table). A single scan over a real store finds a mixed bag:

```text
conflict_a  mem_launch_old  vs mem_launch_new   "March 4" vs "March 14"     conf 0.91
conflict_b  mem_db_v1       vs mem_db_v2         "Postgres 14" vs "Postgres 16"  conf 0.88
conflict_c  mem_tone_1      vs mem_tone_2        "be formal" vs "be casual"  conf 0.52
conflict_d  mem_standup_a   vs mem_standup_b     "9:00 EU team" vs "9:30 US team"  conf 0.44
```

---

## Batch policy

```ts
const detected = await conflicts.scan();

for (const c of detected) {
  const decision = await conflicts.autoDecide(c);
  if (decision.confidence >= 0.70) {
    await conflicts.resolve(c.id, decision);          // auto
  } else {
    await ui.queueForHuman(c);                         // escalate
  }
}
```

| Conflict | Auto-decide | Outcome |
| --- | --- | --- |
| `conflict_a` | `keep_b` (newer correction) conf 0.90 | auto-resolved |
| `conflict_b` | `keep_b` (newer, plan_completion source) conf 0.84 | auto-resolved |
| `conflict_c` | formal vs casual, no clear winner, conf 0.52 | **escalated** |
| `conflict_d` | likely *not* a real conflict, conf 0.44 | **escalated** |

## The two escalations are different

- **`conflict_c`** is a *genuine* contradiction with no automatic winner — recency and source are tied. A human must pick; their choice is ledgered with `actor`.
- **`conflict_d`** is a likely **false positive**: two standups for two teams. The correct human decision is `keep_both`. The scanner's confidence modifiers (shared entities raise confidence, explicit relations lower false positives) kept this one *below* threshold precisely so it would not auto-resolve into data loss.

## Ledger output

Every scan and decision is auditable:

```json
[
  {"action":"conflict_detected","details":{"id":"conflict_a","confidence":0.91}},
  {"action":"conflict_resolved","memoryId":"mem_launch_old",
   "previousState":{"current":true},"newState":{"supersededBy":"mem_launch_new"},
   "details":{"strategy":"keep_b","actor":"auto"}},
  {"action":"conflict_detected","details":{"id":"conflict_c","confidence":0.52,"escalated":true}}
]
```

---

## Why it matters

- **Auto-resolve only above a confidence threshold; queue the rest.** Aggressive auto-resolution is how a memory store quietly destroys correct data. The threshold is a safety valve, not a tuning knob to crank toward "less human work."
- **False positives must escalate, not resolve.** `conflict_d` shows why low confidence routes to a human: the safe answer (`keep_both`) is one a naive auto-decider would get wrong.
- **The schedule matters.** Run daily. Stale contradictions that sit unresolved are exactly the first agent-memory failure mode in slow motion.

## Related

- Single-conflict walkthrough: [`07-conflict-resolution`](../07-conflict-resolution/README.md)
- Audit substrate: [`08-trust-ledger`](../08-trust-ledger/README.md)
