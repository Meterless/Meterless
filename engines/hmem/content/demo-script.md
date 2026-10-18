# Demo Script

A ~6-minute live demo. One narrative thread carries all six scenes: a deadline that was captured wrong, corrected, used, and audited. Avoid tangents, because the thread is the pitch.

**Setup:** a store with one stale memory `mem_deadline_old` ("deadline is March 4", from Monday's session).

---

## Scene 1 · Capture a correction (45s)

**Do:** type as the user: *"Actually the deadline is March 14, not March 4 like I said Monday."*

**Show:** mining extracts `mem_deadline_new`; supersession is detected against `mem_deadline_old`.

> "It stored the new note and noticed that it contradicts something it already believed."

## Scene 2 · Retrieve (45s)

**Do:** ask *"When is the deadline?"*

**Show:** the answer is March 14. The stale March 4 memory is suppressed (penalized in the ranker), not deleted.

> "The ranker made a scored decision instead of trusting the last write. The old value still exists for audit."

## Scene 3 · Trace (60s)

**Do:** open the trace panel on that answer.

**Show:** `traceId`, an illustrative score of 0.63, `retrievalReason`, source = `user_correction`, confidence, and the suppressed-superseded count.

> "The model got grouped context. You get a record of why each line was included."

## Scene 4 · Dream (60s)

**Do:** run dreaming.

**Show:** an `invariant` proposal (synthesized across several memories) sitting in `pending_review` with its `derivedFrom` sources listed. Approve one; reject a weak one.

> "It proposes higher-order knowledge. A human decides whether to adopt it, and the lineage is permanent."

## Scene 5 · Sleep (60s)

**Do:** run sleep preview.

**Show:** the four groups: consolidate, archive, synthesize, and one blocked by guardrail (a relationship hub). Approve, then execute; point at the backup id.

> "It previews first, backs up, and refuses to delete a relationship hub."

## Scene 6 · Audit, the closer (75s)

**Do:** ask the closing question: *"Why did the agent say March 14?"*

**Show:** `ledger.history` reconstructs it: mined from a correction → conflicted → resolved by `user:42` → retrieved at 0.63 → marked helpful → consolidated, backup `backup_1`.

> "Five lines trace every claim to a source, a person, and a timestamp. A plain vector database does not record this."

---

## Closing line

> H-MEM is a governed memory architecture with tiered storage, hybrid retrieval, human-reviewed synthesis, preview-first maintenance, append-only audit, and audited conflict resolution.

## Timing & contingencies

| Scene | Target | If short on time |
| --- | --- | --- |
| 1–3 | 2:30 | never cut; this is the spine |
| 4 | 1:00 | cut the reject, keep the approve |
| 5 | 1:00 | show preview only, skip execute |
| 6 | 1:15 | never cut; this is the close |

If the live store misbehaves, fall back to the [trust-ledger demo](../demos/trust-ledger/README.md) timeline as static slides. Scenes map 1:1 to the [memory-lifecycle demo](../demos/memory-lifecycle-visual/README.md).
