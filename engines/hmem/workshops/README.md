# H-MEM Workshops

Five hands-on labs that build a working H-MEM mental model from the data contract up to forensic operations. Each lab has an outcome, exercises with checkpoints, and a discussion that surfaces the design tension behind the feature.

These are language-agnostic. Do the exercises in TypeScript, Python, Rust, or pseudocode — the contracts do not change.

---

## Track overview

| Lab | Title | You can, by the end | Builds on |
| --- | --- | --- | --- |
| [01](01-build-the-record.md) | Build the Record and Store | Capture, persist, and audit a memory record across tiers | — |
| [02](02-mine-and-enrich.md) | Mine and Enrich | Turn raw interactions into enriched memories with a no-model fallback | 01 |
| [03](03-retrieve-and-reinject.md) | Retrieve and Reinject | Implement the hybrid ranker and grouped reinjection with trace | 02 |
| [04](04-dream-and-sleep.md) | Dream and Sleep | Generate reviewed proposals and run preview-first maintenance | 03 |
| [05](05-trust-and-conflict.md) | Trust and Conflict Operations | Detect contradictions, resolve with audit, answer forensic questions | 04 |

## Recommended path

```text
01 ─▶ 02 ─▶ 03 ─▶ 04 ─▶ 05
 │     │     │     │     └─ operate it: conflicts, escalation, audit queries
 │     │     │     └─ evolve it: dreaming + sleep with safety boundaries
 │     │     └─ use it: ranking + reinjection (the operational core)
 │     └─ feed it: acquisition + enrichment
 └─ ground it: the record + ledger contract (do not skip)
```

Do not skip Lab 01. Every later lab assumes the ledger-on-every-mutation invariant it establishes.

## Pairing with the rest of the repo

- Concepts: [`docs/`](../docs/README.md)
- Worked walkthroughs: [`examples/`](../examples/01-add-memory/README.md)
- Visual demos: [`demos/`](../demos/memory-lifecycle-visual/README.md)
- Eval categories: [`evals/tests/`](../evals/tests/README.md)

## Facilitator notes

- Each lab is ~45–90 minutes depending on language and depth.
- The discussion question at the end of each lab is the point — it exposes *why* the design is the way it is. Do not cut it for time.
- A correct lab solution should hold up against the matching eval category in [`evals/tests`](../evals/tests/README.md).

Start with [`01-build-the-record.md`](01-build-the-record.md).
