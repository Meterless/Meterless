# Dreaming

Dreaming is constructive synthesis. It creates proposals for new knowledge from clusters of existing memories.

## Inputs

Dreaming pulls all eligible memories and clusters them using:

- content similarity,
- tag overlap,
- shared domain or type,
- entity overlap,
- relationship proximity.

## Proposal types

| Proposal | Meaning | Approval effect |
|---|---|---|
| `insight` | Cross-memory factual conclusion | New long-term `factual` memory with `derivedFrom` |
| `invariant` | Stable preference or behavioral pattern | New long-term `preference` memory with `derivedFrom` |
| `domain` | Reclassification suggestion | Update source memory domains |

## Execution phases

1. Initialize session and progress telemetry.
2. Cluster memories.
3. Generate insight proposals from clusters.
4. Generate domain suggestions from uncategorized/general memories.
5. Generate invariants from preference, personal, and correction signals.
6. Return proposals for human review.

## Approval boundary

Only approved proposals become durable memory.

- Approved `insight` becomes a new long-term factual memory.
- Approved `invariant` becomes a new long-term preference memory.
- Approved `domain` updates source memories.
- Rejected proposal is logged and not materialized.

## Proposal record

```text
id: dream_prop_123
type: insight
content: The user prefers local-first tools for agent memory.
derivedFrom: [mem_a, mem_b, mem_c]
confidence: 0.72
status: pending_review
```

## Defaults

- cluster min size: 2
- relatedness threshold: 0.35
- max proposals per type: 8

## Anti-pattern

Dreaming must not be used as cleanup. Cleanup belongs to sleep. Dreaming builds new reviewed knowledge.
