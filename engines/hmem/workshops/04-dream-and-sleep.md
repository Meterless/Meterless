# Workshop 04 · Dream and Sleep

**Prereq:** [Lab 03](03-retrieve-and-reinject.md). **Time:** ~90 min. **Builds on:** a store you can query and reinject from.

## Outcome

By the end you can generate human-reviewed dream proposals and run a preview-first sleep cycle with guardrails, backup, and restore.

Reference: [`docs/dreaming.md`](../docs/dreaming.md), [`docs/sleep-cycle.md`](../docs/sleep-cycle.md). Worked examples: [`examples/05`](../examples/05-dreaming-proposals/README.md), [`examples/06`](../examples/06-sleep-preview/README.md).

---

## Part A — Dreaming (constructive synthesis)

### Exercise A1 — Cluster

Cluster memories on multi-signal relatedness (content similarity, tag overlap, shared domain/type, entity overlap). Defaults: cluster min size 2, relatedness threshold 0.35.

**Checkpoint:** three local-first / privacy memories form one cluster; an unrelated standup memory does not join it.

### Exercise A2 — Propose + approval boundary

Generate `insight`, `invariant`, and `domain` proposals. Implement `approve` / `reject`. **Nothing materializes without approval.**

```text
approved insight    -> new long_term factual,    derivedFrom set
approved invariant  -> new long_term preference,  derivedFrom set
approved domain     -> update source memory domains
rejected            -> dream_rejected ledger entry, NO memory
```

**Checkpoint:** approving a proposal creates a long-term memory whose `derivedFrom` lists every source; rejecting writes only a ledger entry.

## Part B — Sleep (preview-first maintenance)

### Exercise B1 — Preview

Compute `toConsolidate`, `toArchive`, `toSynthesize`, and `blocked`. Attach reason + guardrail status to each item. Thresholds: consolidate at ≥7 days no access; archive at ≥30 days old AND accessCount ≤2 AND unreferenced; synthesize clusters at cosine ≥0.82.

### Exercise B2 — Guardrails

Block archival of: superseding/current records, derived memories, relationship hubs, unresolved-conflict records, above-threshold records. **Guardrail logic lives in preview; execute trusts preview.**

**Checkpoint:** a relationship hub appears as `blocked`, never as `archive`, no matter how old it is.

### Exercise B3 — Execute + restore

Backup → consolidate → archive (ledger before removal) → synthesize (merge tags/entities, inherit non-internal relations, `derivedFrom`, tombstone sources) → report. Then implement `restore(backupId)`.

**Checkpoint:** `restore` reverses the run, writes its own ledger entry, and does **not** erase the original sleep report.

## Discussion

1. Dreaming and sleep both "change memory in bulk." State the one-sentence difference. Why is conflating them the most common implementation mistake?
2. Why must guardrails run in preview and not in execute? What attack/accident does that ordering prevent?
3. A backup you never restored from — is it a safety net? What does that imply for your test plan?

---

## Done when

- Dreaming never materializes a proposal without approval; lineage is always set.
- Sleep preview is a contract execute cannot exceed.
- Guardrails protect hubs/derived/superseding records.
- `restore` recovers data and stays on the record.

Validate against the **Dreaming proposals** and **Sleep consolidation** eval categories in [`evals/tests`](../evals/tests/README.md).

## Next

[`05-trust-and-conflict.md`](05-trust-and-conflict.md) — operate it: contradictions, escalation, forensic audit.
