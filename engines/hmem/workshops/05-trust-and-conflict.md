# Workshop 05 · Trust and Conflict Operations

**Prereq:** [Lab 04](04-dream-and-sleep.md). **Time:** ~75 min. **Builds on:** a full store with mining, retrieval, dreaming, and sleep.

## Outcome

By the end you can detect contradictions, resolve them with audited decisions, escalate the ambiguous ones, and answer forensic questions from the ledger alone.

Reference: [`docs/conflict-resolution.md`](../docs/conflict-resolution.md), [`docs/trust-ledger.md`](../docs/trust-ledger.md). Worked examples: [`examples/07`](../examples/07-conflict-resolution/README.md), [`examples/08`](../examples/08-trust-ledger/README.md).

---

## Exercise 1 — Detection scan

Implement `conflicts.scan()` using: opposing-phrase pairs (`always/never`, `enable/disable`), high-similarity divergent numeric/date values, same-entity incompatible predicates. Run it as a scheduled batch over the store.

**Checkpoint:** `"deadline is March 4"` vs `"deadline is March 14"` produces one conflict with `confidence ~0.86`; two standups for two different teams do **not** auto-conflict (confidence stays low).

## Exercise 2 — Confidence modifiers

Apply: shared entities ↑, same domain ↑, explicit relation ↓ false-positive, `supersedes` relation suppresses (intended replacement).

**Checkpoint:** adding an explicit `relatedTo` link between two near-similar memories drops their conflict confidence below the escalation threshold.

## Exercise 3 — Resolve + escalate

```text
for each conflict:
  decision = autoDecide(c)         # recency, access, confidence, richness,
                                   # source reliability, type, similarity/domain
  if decision.confidence >= 0.70:  resolve(c, decision)     # auto
  else:                            queueForHuman(c)         # escalate
```

Strategies: `keep_a`, `keep_b`, `keep_both`, `merge`, `delete_both`. Every resolution writes `previousState` + `newState`.

**Checkpoint:** the deadline conflict auto-resolves `keep_b` (newer, `user_correction` source); a formal-vs-casual tone conflict (no clear winner) escalates instead of guessing.

## Exercise 4 — Forensic audit

Using only `ledger.history` / `range` / `stats`, answer:

1. "Why did the agent say March 14?"
2. "Did it ever use the stale March 4 value *after* the correction?"
3. "How many `wrong` feedback events this week, by actor?"

**Checkpoint:** every answer is reconstructable from ledger entries alone — no application state, no logs outside the ledger.

## Exercise 5 — Discussion

1. Auto-resolution saves human effort but can destroy correct data. Where is the line, and why is "raise the threshold so we auto-resolve more" the wrong instinct?
2. A superseded memory is penalized, not deleted. What audit question becomes unanswerable if you delete it instead?
3. The ledger is never destructively pruned — a constrained client must archive-export the oldest segment and record a `ledger_rotated` entry before trimming. State the cost of silent pruning in terms of the three agent-memory failure modes.

---

## Done when

- Contradictions are detected with precision *and* false-positive suppression.
- High-confidence conflicts auto-resolve; ambiguous ones escalate, never guess.
- Every resolution carries previous/new state.
- Forensic questions are answerable from the ledger alone.

Validate against the **Conflict detection** and **Trust ledger** eval categories in [`evals/tests`](../evals/tests/README.md).

## You finished the track

You can now build, feed, use, evolve, and operate H-MEM. Pressure-test your implementation against the full [`evals/tests`](../evals/tests/README.md) plan, then read [`docs/practical-how-to.md`](../docs/practical-how-to.md) for the shortest path to a production slice.
