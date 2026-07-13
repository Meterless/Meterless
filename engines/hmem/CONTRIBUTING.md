# Contributing

This repository is the architecture, education, and onboarding artifact for H-MEM. The docs are the spec; `reference/` holds a minimal runnable reference implementation (deterministic, zero runtime dependencies), not a production library. If a PR adds reference code, include tests for every behavior it claims.

## Contribution style

- Prefer short, inspectable documents.
- Use clear headings.
- Add examples when introducing abstract concepts.
- Document assumptions and unresolved questions.
- Keep memory record fields and ledger actions stable.

## What to contribute

- Schema clarifications.
- New mining patterns.
- Ranker weight experiments.
- Conflict resolution heuristics.
- Sleep and dreaming workflows.

## What not to contribute

- Source code files.
- Package manifests.
- Lockfiles.
- Binary assets.

## Review checklist

- Does the change preserve auditability?
- Does it respect the approval boundary for dreaming?
- Does it preserve sleep guardrails?
- Does it maintain compatibility with sibling Meterless engines?
- Are all files Markdown?
