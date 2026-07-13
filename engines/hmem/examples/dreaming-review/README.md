# Scenario · Dreaming Review (The Approval Boundary)

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

[`05-dreaming-proposals`](../05-dreaming-proposals/README.md) shows how proposals are *generated*. This scenario is about the other half — the **human approval boundary**: what a reviewer sees, what each decision does, and why this gate is the single most important safety property in H-MEM.

Prerequisite reading: [`docs/dreaming.md`](../../docs/dreaming.md).

---

## The review queue

A dreaming run surfaces three proposals of differing quality. The reviewer sees each with full lineage:

```text
dream_prop_lf1   invariant   conf 0.81
  "Prefer local-first, private storage for memory features by default."
  derivedFrom: mem_a "prefers local-first"  · mem_b "rejected cloud sync"  · mem_c "private by default"

dream_prop_dx4   insight     conf 0.66
  "The team's deploy failures correlate with Friday releases."
  derivedFrom: mem_d "Fri deploy rolled back"  · mem_e "Fri hotfix"

dream_prop_zz9   invariant   conf 0.41
  "The user dislikes meetings."
  derivedFrom: mem_f "moved one standup"
```

## Three decisions, three different outcomes

| Proposal | Decision | Rationale | Effect |
| --- | --- | --- | --- |
| `dream_prop_lf1` | **Approve** | 3 independent sources, coherent, high conf | New long-term `preference` memory, `derivedFrom` set |
| `dream_prop_dx4` | **Approve as insight** | plausible but only 2 sources | New long-term `factual` memory, `derivedFrom` set |
| `dream_prop_zz9` | **Reject** | over-generalized from a single weak signal | `dream_rejected` ledgered, nothing materialized |

```ts
await dreaming.approve("dream_prop_lf1");
await dreaming.approve("dream_prop_dx4");
await dreaming.reject("dream_prop_zz9", "over-generalized from one data point");
```

## What approval actually writes

```json
[
  {"action":"dream_approved","details":{"proposalId":"dream_prop_lf1","actor":"user:42"}},
  {"memoryId":"mem_lf_inv","action":"create","actor":"dreaming",
   "newState":{"type":"preference","layer":"long_term"},
   "details":{"derivedFrom":["mem_a","mem_b","mem_c"]}},
  {"action":"dream_rejected","details":{"proposalId":"dream_prop_zz9",
   "actor":"user:42","reason":"over-generalized from one data point"}}
]
```

Note the rejection is **on the record**. A rejected proposal still produces an audit entry; it just never becomes a memory.

## What a good review checks

- **Lineage strength** — how many independent sources? `zz9` failed on one.
- **Over-generalization** — does the claim exceed what the sources support?
- **Privacy** — does the synthesized statement expose anything the sources kept private?
- **Conflict** — does it contradict an existing long-term memory? (route to [`07`](../07-conflict-resolution/README.md))

---

## Why it matters

- **This boundary is why dreaming is safe.** Unsupervised synthesis — derived guesses silently hardening into "facts" — is the fourth agent-memory failure mode. The approval gate is the entire defense, and it cannot be auto-approved away.
- **`derivedFrom` makes review possible.** A reviewer can only judge a proposal because every one points back at its exact sources. The system never asks you to trust a claim with no provenance.
- **Rejections are data too.** Logging rejections lets you tune dreaming (raise relatedness threshold, raise cluster min size) when it produces garbage like `zz9`.

## Related

- Proposal generation: [`05-dreaming-proposals`](../05-dreaming-proposals/README.md)
- Preference lifecycle that feeds dreaming: [`preference-learning`](../preference-learning/README.md)
