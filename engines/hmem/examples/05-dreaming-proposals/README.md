# 05 · Dreaming Proposals

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

Retrieval ([04](../04-retrieve-and-reinject/README.md)) uses memory. Dreaming **builds** memory — it clusters existing records and proposes higher-order knowledge that no single memory states. Nothing it proposes becomes durable without human approval.

Prerequisite reading: [`docs/dreaming.md`](../../docs/dreaming.md).

---

## Scenario

Over several sessions the store accumulated three related signals:

```text
mem_a  "User prefers local-first storage."          preference  source:session:1
mem_b  "User rejected cloud-only memory sync."       correction  source:session:4
mem_c  "User asked for private memory by default."   preference  source:session:7
```

No record states the general rule. Dreaming's job is to notice the pattern and propose it — for review, not for silent adoption.

---

## Walkthrough

### TypeScript

```ts
const proposals = await dreaming.run({
  maxPerType: 8,
  clusterMinSize: 2,
  relatednessThreshold: 0.35
});

for (const p of proposals.invariants) {
  await ui.presentProposal(p);     // human reviews — required
}

await dreaming.approve("dream_prop_lf1");
await dreaming.reject("dream_prop_x9", "too speculative");
```

### Python

```python
proposals = await dreaming.run(
    max_per_type=8,
    cluster_min_size=2,
    relatedness_threshold=0.35,
)

for p in proposals["invariants"]:
    await ui.present_proposal(p)

await dreaming.approve("dream_prop_lf1")
await dreaming.reject("dream_prop_x9", reason="too speculative")
```

---

## How the cluster forms

Dreaming clusters on multi-signal relatedness — content similarity, tag overlap, shared domain/type, entity overlap. `mem_a`, `mem_b`, `mem_c` cluster because they share the `privacy` / `local-first` entity space and the same domain, above the `0.35` relatedness threshold.

## Expected proposal

```text
id:          dream_prop_lf1
type:        invariant
content:     Prefer local-first, private storage for memory features by default.
derivedFrom: [mem_a, mem_b, mem_c]
confidence:  0.74
status:      pending_review
```

## Approval effects

| Proposal type | On approval |
| --- | --- |
| `insight` | New long-term `factual` memory, `derivedFrom` set |
| `invariant` | New long-term `preference` memory, `derivedFrom` set |
| `domain` | Update `domain` on the source memories |

On approval of `dream_prop_lf1`:

```json
[
  {"action":"dream_approved","details":{"proposalId":"dream_prop_lf1","actor":"user:42"}},
  {"memoryId":"mem_lf_invariant","action":"create","actor":"dreaming",
   "newState":{"type":"preference","layer":"long_term"},
   "details":{"derivedFrom":["mem_a","mem_b","mem_c"]}}
]
```

On rejection, only a `dream_rejected` ledger entry is written — nothing materializes.

---

## Why it matters

- **Dreaming is not cleanup.** Cleanup is sleep ([06](../06-sleep-preview/README.md)). Dreaming generates *new reviewed knowledge*. Conflating the two is the most common implementation mistake.
- **The approval boundary is non-negotiable.** Unsupervised synthesis is the fourth agent-memory failure mode: derived guesses hardening into "facts." Every materialized dream carries `derivedFrom` lineage back to every source — the system never lies about where a belief came from.
- **Confidence stays below 1.0.** A synthesized invariant is an inference over inferences. `0.74` reflects that; feedback and repeated retrieval can raise it over time.

## Next

[`06-sleep-preview`](../06-sleep-preview/README.md) — the maintenance counterpart: previewing what to consolidate, archive, or synthesize.
