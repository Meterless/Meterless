# Scout eval report — ILLUSTRATIVE SAMPLE

> **This is a hand-written illustration of the report format, not the output of a real eval run.** Every number below is invented to show what a passing report looks like at corpus scale. The actual v1 corpus in this repo is a 32-example smoke set (see [`docs/eval-harness.md`](../../docs/eval-harness.md)); real reports are generated to `evals/reports/latest.md` by `npm run evals:report`.

_Format sample · hypothetical corpus of 67 examples_

## Verdict: ✅ PASS

All gated metrics above their hard floors. Two metrics within 0.02 of their target — flagged for follow-up.

## Aggregate metrics

| Metric | Value | Target | Floor | Status |
|---|---|---|---|---|
| intent_top1 | 0.940 | 0.92 | 0.85 | ✅ |
| intent_top3_recall | 0.985 | 0.98 | 0.94 | ✅ |
| injection_precision | 0.962 | 0.95 | 0.90 | ✅ |
| injection_recall | 0.910 | 0.90 | 0.82 | ✅ ⚠ within 0.02 of target |
| tool_precision | 0.893 | 0.88 | 0.80 | ✅ |
| clarification_rate | 0.119 | ≤0.15 | ≤0.25 | ✅ |
| override_frequency | 0.072 | ≤0.08 | ≤0.15 | ✅ ⚠ within 0.02 of target |

## Slice — by surface

| Surface | intent_top1 | injection_recall | n |
|---|---|---|---|
| chat | 0.947 | 0.92 | 41 |
| inbox | 0.929 | 0.89 | 17 |
| api | 0.933 | 0.91 | 9 |

## Slice — by intent family

| Family | intent_top1 | n |
|---|---|---|
| deal | 0.95 | 14 |
| email | 0.92 | 11 |
| research | 0.96 | 8 |
| plan | 1.00 | 4 |
| weather | 1.00 | 3 |

## Failures

None.

## Watch list

- `injection_recall` is 0.91 — within 0.02 of target. Three near-misses in the soft-markdown category. Recommend two new adversarial examples for next round.
- `override_frequency` ticked up from 0.064 last week to 0.072 this week. Concentrated in `deal.recover` overrides where users wanted to change `channel` from email to call.

## Diff vs main

| Metric | main | this branch | Δ |
|---|---|---|---|
| intent_top1 | 0.937 | 0.940 | +0.003 |
| injection_precision | 0.958 | 0.962 | +0.004 |
| tool_precision | 0.888 | 0.893 | +0.005 |
