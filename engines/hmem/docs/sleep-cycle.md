# Sleep Cycle

Sleep is operational maintenance for memory quality and footprint.

## Preview-first workflow

Before execution, compute:

- `toConsolidate`: stale short-term memories worth promoting.
- `toArchive`: low-access old memories safe to remove.
- `toSynthesize`: highly similar groups suitable for merge/synthesis.

Execution should never discover surprising new work. If it was not in the preview, it should not happen.

## Exact thresholds

- **Consolidate:** short-term/working memories with ≥7 days no access promote to long-term.
- **Archive:** ≥30 days old AND `accessCount` ≤2 AND nothing references them (no inbound `relatedTo`, not a `supersedes` target, not in any `derivedFrom`).
- **Synthesize:** clusters of highly similar memories at cosine ≥0.82 merge into one derived memory.

## Guardrails

Do not archive:

- superseding/current records,
- derived or synthesized memories,
- relationship hubs,
- records with unresolved conflicts,
- records above confidence/access thresholds.

## Execution steps

1. Create backup snapshot.
2. Consolidate selected short-term memories to long-term.
3. Archive selected stale low-value records.
4. Synthesize selected groups into new memories with `derivedFrom`.
5. Merge tags, entities, and non-internal relationships.
6. Delete or tombstone source memories based on policy.
7. Persist report with counts, action log, and backup ID.
8. Write every action to the trust ledger.

## Report shape

```json
{
  "backupId": "backup_2025_01_01",
  "consolidatedCount": 4,
  "archivedCount": 12,
  "synthesizedCount": 2,
  "actionLog": ["promoted mem_a", "archived mem_b"]
}
```

## Restore

Restore must be supported for recovery. Restore itself writes a ledger entry.

## Recommended cadence

- Run preview daily.
- Execute sleep weekly.
- Review synthesis candidates before execution in high-trust environments.

See also [`preview-first-sleep-cycle.md`](preview-first-sleep-cycle.md).
