# Scenario · Preference Learning (Full Lifecycle)

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

This is the scenario that ties every subsystem together. Follow one preference from a throwaway remark to a validated, audited long-term invariant — touching mining, enrichment, retrieval, feedback, promotion, dreaming, and the ledger.

Read the numbered examples first; this is the integration view.

---

## The signal arrives (weakly)

Session 1, in passing:

```text
User: keep status updates short — just blockers and next steps.
```

Mining ([`02`](../02-mine-from-chat/README.md)) creates:

```text
mem_su1  "User prefers short status updates: blockers and next steps only."
type=preference  layer=working  confidence=0.78  source=session:1
```

It starts in **working**, not long-term. One remark is not yet a validated rule.

## It earns durability through use

| Event | Mechanism | Effect on `mem_su1` |
| --- | --- | --- |
| Retrieved for a status-update task | hybrid ranker ([`04`](../04-retrieve-and-reinject/README.md)) | `accessCount` ↑, `lastAccessed` updated |
| User marks the result helpful | feedback ([`08`](../08-trust-ledger/README.md)) | `confidence` 0.78 → 0.83, ledgered |
| Retrieved again next week, helpful again | feedback | `confidence` → 0.88, `accessCount` 3 |
| Promotion criteria met | tiered storage | `working` → `long_term`, ledgered |

Promotion fires when a memory has repeated access, helpful feedback, high confidence, no unresolved conflict, and clear provenance — see [`docs/tiered-storage.md`](../../docs/tiered-storage.md).

## Related signals accumulate

Over more sessions:

```text
mem_su1  "short status updates: blockers + next steps"   long_term
mem_pl1  "wants migration plans before implementation"    working
mem_rv1  "prefers reviewing diffs over prose summaries"   working
```

## Dreaming proposes the invariant

These cluster. Dreaming ([`05`](../05-dreaming-proposals/README.md)) proposes:

```text
dream_prop_comm  invariant  conf 0.79
  "This user prefers terse, action-oriented communication: decisions and
   next steps over narrative."
  derivedFrom: [mem_su1, mem_pl1, mem_rv1]
```

A human approves it ([`dreaming-review`](../dreaming-review/README.md)). It becomes a long-term `preference` memory with full lineage. Now the agent applies the *general* communication style, not just three specific rules.

## The full ledger trail

```json
[
  {"memoryId":"mem_su1","action":"create","actor":"mining:session:1"},
  {"memoryId":"mem_su1","action":"feedback","actor":"user:42","details":{"signal":"helpful"}},
  {"memoryId":"mem_su1","action":"promote","actor":"store",
   "previousState":{"layer":"working"},"newState":{"layer":"long_term"}},
  {"action":"dream_approved","details":{"proposalId":"dream_prop_comm","actor":"user:42"}},
  {"memoryId":"mem_comm_inv","action":"create","actor":"dreaming",
   "details":{"derivedFrom":["mem_su1","mem_pl1","mem_rv1"]}}
]
```

---

## Why it matters

- **Nothing is trusted on first sight.** A preference must *earn* long-term status through repeated use and explicit positive feedback. This is the antidote to the agent over-fitting to one offhand comment.
- **Specific memories become general behavior — with consent.** The jump from three rules to one communication invariant is exactly the kind of synthesis that must pass the human approval boundary, never happen silently.
- **Every step is on the record.** Capture → feedback → promotion → synthesis is one continuous, queryable audit chain. That chain *is* the product.

## Related

This scenario integrates: [`02`](../02-mine-from-chat/README.md) · [`04`](../04-retrieve-and-reinject/README.md) · [`05`](../05-dreaming-proposals/README.md) · [`08`](../08-trust-ledger/README.md) · [`dreaming-review`](../dreaming-review/README.md)
