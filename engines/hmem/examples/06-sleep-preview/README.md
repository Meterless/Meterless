# 06 · Sleep Preview

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

Sleep keeps the store healthy: it consolidates earned memories, archives dead ones, and merges duplicates. The rule that makes it safe: **preview first, execute second, back up always.** Execution never discovers new work — if it was not in the preview, it does not happen.

Prerequisite reading: [`docs/sleep-cycle.md`](../../docs/sleep-cycle.md), [`docs/preview-first-sleep-cycle.md`](../../docs/preview-first-sleep-cycle.md).

---

## Scenario

The store has drifted after weeks of use:

```text
mem_tmp_deadline   short_term  accessed 4x, 8 days old, helpful feedback
mem_old_noise      working     0 access, 45 days old, confidence 0.3
mem_pnpm_a/b/c     working     three near-identical pnpm preferences
mem_project_hub    long_term   relatedTo 11 memories (relationship hub)
```

---

## Walkthrough

### TypeScript

```ts
const preview = await sleep.preview();

console.log("consolidate:", preview.toConsolidate.length);
console.log("archive:",     preview.toArchive.length);
console.log("synthesize:",  preview.toSynthesize.length);
console.log("blocked:",     preview.blocked.length);

// Operator edits the plan, then:
const report = await sleep.execute(preview);

// Roll back if the report looks wrong:
await sleep.restore(report.backupId);
```

### Python

```python
preview = await sleep.preview()
print("consolidate", len(preview.to_consolidate))
print("archive", len(preview.to_archive))
print("synthesize", len(preview.to_synthesize))
print("blocked", len(preview.blocked))

report = await sleep.execute(preview)
await sleep.restore(report.backup_id)   # if needed
```

---

## Expected preview

| Action | Memory | Reason | Guardrail |
| --- | --- | --- | --- |
| consolidate | `mem_tmp_deadline` | 4 accesses, helpful, 8 days old | pass — promote to long_term |
| archive | `mem_old_noise` | 45 days, 0 access, conf 0.3 | pass — safe to remove |
| synthesize | `mem_pnpm_a/b/c` | high-similarity duplicate group | needs approval |
| skip archive | `mem_project_hub` | relationship hub (11 links) | **blocked** |

## Guardrails that fired

Sleep refused to touch `mem_project_hub`. Guardrails block archival of:

- superseding / current records,
- derived or synthesized memories (`derivedFrom` lineage),
- relationship hubs (high `relatedTo` count),
- records with unresolved conflicts,
- records above confidence/access thresholds.

These checks live in the **preview** phase. Execute trusts the preview.

## Expected execution report

```json
{
  "backupId": "backup_sleep_001",
  "consolidatedCount": 1,
  "archivedCount": 1,
  "synthesizedCount": 1,
  "blockedCount": 1,
  "actionLog": [
    "promoted mem_tmp_deadline -> long_term",
    "archived mem_old_noise",
    "synthesized mem_pnpm_a/b/c -> mem_pnpm_canonical",
    "blocked mem_project_hub (relationship hub)"
  ]
}
```

Every line above is also a trust-ledger entry. Restore writes its own entry and does not erase the original report.

---

## Why it matters

- **Preview-first prevents the third failure mode.** Memory rot kills retrieval quality over time. Sleep fixes it — but unsupervised deletion is dangerous, so the operator sees and edits the plan before anything is destroyed.
- **Guardrails protect graph value.** Archiving a relationship hub or a derived memory silently corrupts the knowledge graph. The block is not optional.
- **Backup + restore is the safety net.** Synthesis and archival are destructive. One `restore(backupId)` call reverses a bad run, and the attempt stays in the audit trail.

## Next

[`07-conflict-resolution`](../07-conflict-resolution/README.md) — handling memories that directly contradict each other.
