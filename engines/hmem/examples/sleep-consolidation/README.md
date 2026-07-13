# Scenario · Sleep Consolidation (Execute, Synthesize, Restore)

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

[`06-sleep-preview`](../06-sleep-preview/README.md) stops at the preview. This scenario covers what `execute` actually does — especially **synthesis** (the destructive, subtle part) — and walks a real **restore drill**.

Prerequisite reading: [`docs/sleep-cycle.md`](../../docs/sleep-cycle.md).

---

## From approved preview to execution

The operator approved this plan:

```text
toConsolidate: 3   (earned short-term memories -> long-term)
toArchive:     8   (stale, low-access, not hubs)
toSynthesize:  2 groups
blocked:       1   (relationship hub — untouched)
```

```ts
const report = await sleep.execute(approvedPreview);
```

## Execute steps (in order)

```text
1. create backup snapshot           -> backup_sleep_044
2. consolidate the 3 promotions     -> ledger: promote x3
3. archive the 8 stale records      -> ledger: sleep_archive x8 (entry BEFORE removal)
4. synthesize each group:
     - merge tags + entities
     - inherit non-internal relationships
     - create new memory with derivedFrom = [sources]
     - delete/tombstone the source memories
5. write report (counts + actionLog + backupId)
6. every action -> trust ledger
```

## Synthesis is the subtle one

Group `[mem_pnpm_a, mem_pnpm_b, mem_pnpm_c]` → one canonical memory:

```text
mem_pnpm_canonical
  content:     "Project uses pnpm, not npm."
  type:        preference
  layer:       long_term
  tags:        UNION(a,b,c) tags
  entities:    UNION(a,b,c) entities, capped at 10
  relatedTo:   inherited from a,b,c — EXCLUDING links among a/b/c themselves
  derivedFrom: [mem_pnpm_a, mem_pnpm_b, mem_pnpm_c]
```

The `derivedFrom` lineage is why the now-deleted sources are still explainable: an auditor can see exactly which three memories were merged and when.

## The report

```json
{
  "backupId": "backup_sleep_044",
  "consolidatedCount": 3,
  "archivedCount": 8,
  "synthesizedCount": 2,
  "blockedCount": 1,
  "actionLog": ["promoted mem_x", "archived mem_y", "synthesized pnpm group -> mem_pnpm_canonical"]
}
```

## Restore drill

A week later retrieval quality drops. Suspicion: the synthesis over-merged. Run the drill:

```ts
const history = await ledger.range({ since: sleepRunTime, actions: ["sleep_synthesize"] });
// confirms mem_pnpm_canonical merged a,b,c — but 'c' was actually about a different project

await sleep.restore("backup_sleep_044");
```

Restore reverses consolidation, archival, and synthesis to the snapshot — **and writes its own ledger entry**. It does **not** erase the original sleep report or any prior ledger history. The bad run remains on the record; the data is recovered.

---

## Why it matters

- **Execute trusts the preview — so the preview must be right.** Every guardrail and approval decision happens before step 1. Execution is mechanical; surprises here mean the preview phase was broken.
- **Synthesis deletes sources, so lineage is mandatory.** Without `derivedFrom`, a merged memory is an unexplainable orphan. With it, deletion is safe because the history survives.
- **Restore is a drill you should actually run.** A backup you have never restored from is not a safety net. The audit trail makes a bad sleep diagnosable *and* reversible.

## Related

- The preview half: [`06-sleep-preview`](../06-sleep-preview/README.md)
- Operator workflow: [`docs/preview-first-sleep-cycle.md`](../../docs/preview-first-sleep-cycle.md)
