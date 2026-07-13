# Scout eval report

_Generated: 2026-07-09T23:37:08.003Z · corpus v1 · 32 examples_

## Verdict: ❌ FAIL

### Failures

- intent_top1=0.000 below floor 0.85
- intent_top3_recall=0.000 below floor 0.94
- injection_recall=0.000 below floor 0.82
- tool_precision=0.000 below floor 0.8
- slice surface=chat: intent_top1=0.000 below slice floor 0.8
- slice surface=inbox: intent_top1=0.000 below slice floor 0.8
- slice role=ae: intent_top1=0.000 below slice floor 0.8
- slice role=csm: intent_top1=0.000 below slice floor 0.8
- slice intent_family=deal: intent_top1=0.000 below slice floor 0.8
- slice intent_family=email: intent_top1=0.000 below slice floor 0.8
- slice intent_family=research: intent_top1=0.000 below slice floor 0.8
- slice intent_family=plan: intent_top1=0.000 below slice floor 0.8
- slice risk_class=low: intent_top1=0.000 below slice floor 0.8
- slice risk_class=medium: intent_top1=0.000 below slice floor 0.8
- slice risk_class=high: intent_top1=0.000 below slice floor 0.8

## Metrics

| metric | value |
|---|---|
| intent_top1 | 0.000 |
| intent_top3_recall | 0.000 |
| injection_precision | 1.000 |
| injection_recall | 0.000 |
| tool_precision | 0.000 |
| clarification_rate | 0.000 |
| override_frequency | 0.000 |

## Slices

| slice | intent_top1 | injection_precision | n |
|---|---|---|---|
| surface=chat | 0.000 | — | 31 |
| surface=inbox | 0.000 | — | 1 |
| role=ae | 0.000 | — | 21 |
| role=csm | 0.000 | — | 1 |
| intent_family=deal | 0.000 | — | 7 |
| intent_family=email | 0.000 | — | 5 |
| intent_family=research | 0.000 | — | 3 |
| intent_family=plan | 0.000 | — | 2 |
| risk_class=low | 0.000 | — | 11 |
| risk_class=medium | 0.000 | — | 2 |
| risk_class=high | 0.000 | — | 2 |

## Notes

- override_frequency = 0.000 by definition of the corpus, not by measurement: no override data in corpus v1. Overrides are user corrections captured in telemetry ("No, I meant…" + intent switch within the same trace) ÷ contracts issued — measure this in production telemetry (docs/telemetry-and-learning.md).