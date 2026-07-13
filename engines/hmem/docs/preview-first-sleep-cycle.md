# Preview-First Sleep Cycle Guide

This guide describes the safe operator workflow for H-MEM sleep.

## Operator flow

```text
1. Generate preview
2. Inspect grouped actions
3. Check guardrail explanations
4. Approve or remove actions
5. Create backup
6. Execute approved plan
7. Inspect report
8. Restore if needed
```

## Preview table

| Group | Operator question |
|---|---|
| `toConsolidate` | Are these short-term memories important enough to keep? |
| `toArchive` | Are these stale, low-access, and not relationship hubs? |
| `toSynthesize` | Do these duplicates really mean the same thing? |

## Required preview metadata

- memory id,
- content preview,
- proposed action,
- reason,
- confidence/access/age,
- guardrail status,
- affected relationships,
- expected ledger action.

## Approval policy

For personal or high-impact memory, require explicit approval for synthesis and archival. Consolidation can be auto-approved when confidence and access thresholds are met.

## Demo

See [`../demos/preview-first-sleep-cycle/README.md`](../demos/preview-first-sleep-cycle/README.md).
