# Trust Ledger

The trust ledger is an append-only audit trail for memory actions and feedback.

## Logged actions

- `create`
- `read`
- `update`
- `delete`
- `feedback`
- `promote`
- `demote`
- `merge`
- `conflict_detected`
- `conflict_resolved`
- `sleep_consolidate`
- `sleep_archive`
- `sleep_synthesize`
- `dream_proposed`
- `dream_approved`
- `dream_rejected`
- `restore`

## Entry shape

```json
{
  "id": "led_123",
  "memoryId": "mem_abc",
  "action": "update",
  "actor": "user:42",
  "timestamp": 1730000000000,
  "previousState": {"confidence": 0.7},
  "newState": {"confidence": 0.9},
  "details": {"reason": "helpful feedback"}
}
```

## Feedback adaptation

| Feedback | Effect |
|---|---|
| `helpful` | `accessCount += 1; confidence = clamp01(confidence + 0.05)` |
| `not_helpful` | `confidence = clamp01(confidence − 0.03)` |
| `wrong` | `confidence = clamp01(confidence − 0.20)` and add `review` tag |

Because confidence multiplies the final retrieval score, feedback directly moves future ranking.

## Query surfaces

- history for a memory,
- range by time,
- filter by action,
- stats by actor/action,
- export for audit.

## Invariants

- The ledger is append-only.
- Deletes create ledger entries before the memory is removed or tombstoned.
- Sleep reports include ledger IDs.
- Conflict resolutions include previous and new state.
- Restore does not erase prior ledger entries.

## Pruning policy

The ledger is **never destructively pruned**. If a constrained client must cap storage, it exports the oldest segment to an archive artifact and records a `ledger_rotated` entry before trimming. A silent cap (e.g. dropping entries past N) is a contract violation.

## Example

See [`../examples/08-trust-ledger/README.md`](../examples/08-trust-ledger/README.md).
