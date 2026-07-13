# Conflict Resolution

H-MEM detects and resolves contradictions between memory records.

## Detection signals

- Opposing phrase pairs: `always/never`, `enable/disable`, `before/after`.
- High-similarity claims with divergent numeric or date values.
- Same-entity claims with incompatible predicates.
- Corrections that imply supersession.

## Confidence modifiers

| Signal | Effect |
|---|---|
| Shared entities | Increases confidence |
| Same domain | Increases confidence |
| Explicit relation | Lowers false-positive risk |
| Supersedes relation | Suppresses conflict as intended replacement |

## Conflict record

```json
{
  "id": "conflict_123",
  "memoryA": "mem_old",
  "memoryB": "mem_new",
  "reason": "same entity, conflicting deadline",
  "confidence": 0.86,
  "status": "open"
}
```

## Resolution strategies

- `keep_a`
- `keep_b`
- `keep_both`
- `merge`
- `delete_both`

## Auto-decision inputs

- recency,
- access frequency,
- confidence,
- content richness,
- source reliability (`user_correction` is high),
- conflict type,
- similarity and domain context.

## Auto-resolution gate

Auto-resolve only when the decision confidence is **≥ 0.70**; otherwise queue the conflict for human review. On resolution the losing record is marked `supersededBy` — kept for audit, ranked down by the −0.20 retrieval penalty, never deleted. Run the scan daily.

## Audit rule

Every resolution writes to the trust ledger with previous and new state for affected memories.
