# H-MEM One-Pager

## Positioning

H-MEM is a hierarchical human-memory architecture for agents: short-term, working, and long-term memory with mining, retrieval, dreaming, sleep, trust, and conflict resolution. Provider-agnostic. MIT.

## Hero line

> **Memory that remembers, learns, and evolves. Private. Local-first. Auditable.**

## The problem (one sentence)

Every agent that ships to real users hits the same three walls — stale facts, black-box recall, and memory rot — and none of them is fixed by a better embedding model.

## Why now

Agents moved from demos to production. Production needs memory that is **correctable** (a user fix sticks), **explainable** (you can answer "why did it know that?"), and **maintainable** (quality does not decay as the store grows). Vector recall alone delivers none of these.

## What is different

| Capability | Vector store | H-MEM |
| --- | --- | --- |
| Recall | similarity only | 8-signal hybrid ranking |
| Provenance | weak / none | source, confidence, lineage on every record |
| Lifecycle | none | capture → enrich → retrieve → dream → sleep |
| Synthesis | none | human-approved dreaming with `derivedFrom` |
| Maintenance | manual | preview-first sleep with backup/restore |
| Audit | none | append-only trust ledger, every mutation |
| Contradictions | last write wins | detected, scored, audited resolution |

## Proof point

"Why did the agent say March 14?" → a five-line ledger trace: mined from a user correction, conflicted with the stale value, resolved by a named human, retrieved at a known score, marked helpful, consolidated with a backup id. Nothing hidden, nothing unattributed.

## Adoption path

```text
Slice 1 (ship first):  add → mine → retrieve/reinject → ledger      (examples 01,02,04,08)
Slice 2 (after trace UI exists):  sleep preview → dreaming review
Slice 3 (operate):  conflict scan + escalation, audit dashboards
```

Do not add dreaming before users can inspect trace and approve proposals.

## Defaults

top-N 5 · threshold 0.35 · consolidate at 7d no access · archive at ≥30d, ≤2 accesses, unreferenced · synthesis at cosine ≥0.82 · dream cluster min 2 · conflict auto-resolve gate 0.70 · entities ≤10/memory.

## One-line close

> Memory should not just remember. It should learn, evolve, and explain itself.

Architecture: [`docs/architecture.md`](../docs/architecture.md) · Demo: [`demos/memory-lifecycle-visual`](../demos/memory-lifecycle-visual/README.md) · Path: [`docs/practical-how-to.md`](../docs/practical-how-to.md)
