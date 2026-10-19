# Agent frameworks

**Claude Opus 5.5 and Claude Haiku 4.5 · October 12, 2026 · Interim**

Not Nightshift. The Meterless engines against the most-shared skill packs, prompt collections and proxies. Same model, same harness, same hidden graders, 11 tasks. On Claude Opus 5.5 the model is the ceiling and no framework moved quality clearly. On Claude Haiku 4.5, two cleared the pre-registered bar. Both were Meterless.

[**Open the framework benchmark ↗**](https://meterless.ai/Benchmarks/AgenticFrameworks/) · [Interim status ↗](https://meterless.ai/Benchmarks/AgenticFrameworks/STATUS.html) · [All benchmarks](README.md)

<a href="https://meterless.ai/Benchmarks/AgenticFrameworks/"><img src="media/report-agent-frameworks.webp" alt="The Agentic Framework Benchmark on meterless.ai: what does each framework actually add to a strong coding agent" width="100%" /></a>

| +4.29 | 21% → 6% | 99.06 | 675 / 774 |
|:--:|:--:|:--:|:--:|
| Meterless context layer on Haiku, 95% CI 2.67 to 5.85 | runs that claimed done but failed hidden tests | Opus baseline: the ceiling | runs graded so far |

---

<img src="media/chart-agent-frameworks.svg" alt="Diverging bar chart: quality lift over a same-model baseline on Claude Haiku 4.5. Meterless context layer +4.29 and Meterless prompt cards +3.36 cleared the bar of +1.29. The irrelevant-context placebo scored -9.61." width="100%" />

| Arm | Model | Quality lift vs baseline | Cost |
|---|---|---:|---|
| Meterless context layer (World State, H-MEM and Markovian through the reference engines) | Haiku 4.5 | +4.29 | |
| Meterless prompt cards | Haiku 4.5 | +3.36 | |
| Meterless app | Opus 5.5 | holds quality at 99.9 | 10% below baseline, $0.65 a run |
| Meterless context layer | Opus 5.5 | −2.79, not significant | +8% |
| Meterless cards with an audit step | Haiku 4.5 | −1.38 | +486% |

On Opus the baseline scores 99.06 and no framework moves quality clearly. There the differences are cost and time; ponytail ran 35% cheaper. The composite score is pre-registered: 40% quality, 20% reliability, 15% low drift, 15% verification, 10% quality per dollar.

## What is weak

- **Interim.** 2 runs per task on Haiku, 9 of 11 tasks. Haiku arms cover different task subsets.
- **Cost.** Both Meterless arms cost 66 to 68% more than the Haiku baseline.
- **Statistics.** p-values are not yet corrected for multiple comparisons.
- **Cloud models, not Nightshift.** These runs used Claude through the cloud. The engines are in [engines/](../../engines/).
