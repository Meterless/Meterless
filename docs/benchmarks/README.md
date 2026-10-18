# Benchmarks

Tokens per second tells you how fast a model writes. These benchmarks measure how much useful work a machine finished, and how much of it was good enough to keep. Every run is published with its failures. Each number names its machine, build and source. The full interactive reports live on [meterless.ai/benchmarks](https://www.meterless.ai/benchmarks.html). This page summarizes them.

| Report | Machine | Dates | Status |
|---|---|---|---|
| [Real nights](#real-nights) | DGX Spark | Aug to Sep 2026 | Measured |
| [3D bench](#3d-bench) | DGX Spark GB10 | Oct 10, 2026 | Measured |
| [Agent frameworks](#agent-frameworks) | Claude Opus 5.5 and Haiku 4.5 | Oct 12, 2026 | Interim |
| [Knowledge work](#knowledge-work) | One desk-side machine | Sep 26 to 28, 2026 | Measured |
| [Job modes](#job-modes) | DGX Spark | Oct 1 to 3, 2026 | Measured |
| [Mac M5, 16 GB](#mac-m5-16-gb) | Apple M5, 16 GB | Sep 22 to 26, 2026 | Measured |
| [Hardware card](#the-hardware-card) | DGX Spark | Sep 17, 2026 | Measured |

Not yet published: Windows PCs and M1 to M4 Macs. Their benchmark folders are open. Results land when the runs are read.

---

## The public benchmark format: one real night

`job_mtrtl3j401` · "a compelling 3D landing page, one HTML file" · DGX Spark · three local lanes · local only · September 7 to 8, 2026.

| Attempts | Clusters | Finalists | Judged | Accepted outcome |
|---:|---:|---:|---:|---:|
| 202 | 2 | 20 | 12 | 1 |

| Window | Attempts per accepted | Judge coverage | Verifier abstentions | Lane errors survived | Cloud escalation |
|---|---:|---:|---:|---:|---:|
| 5h 15m | 200 | 60% | 4 | 72 | $0.00 |

Settled by the Outcome Contract: accepted, 3 of 3 artifacts verified at the static tier (2 not runtime-checked: no browser). Substrate: llama.cpp, Q4, 128 GB.

---

## Real nights

A month of real jobs read from one DGX Spark's job log.

| Measure | Value |
|---|---|
| Jobs | 361 |
| Landed attempts | 5,361 |
| Signed receipts | 1,828 |
| App turns served locally | 98% |
| Distinct solution clusters per race of 250 to 300 attempts | 25 to 37, still arriving in the last 50 attempts |
| Cloud spend on the published night | $0.00 |
| Interactive latency | median 36.8 s, p95 5 min 7 s |

The weak point is judging. Only 8% of shortlisted candidates were scored (14 of 169), and 92 of 104 recorded outcomes are not yet decided. The trust funnel shows the same thing: 3,034 artifacts, 2,020 static-valid, 167 of 261 tested actually ran. 44% of seated lanes landed nothing. Media makes went 832 requested, 468 rendered, 0 accepted. The [job modes](#job-modes) campaign found and fixed the mechanism.

## 3D bench

Three open image-to-3D models on 16 test stills, then 14 Nightshift 3D desks run as real nights. Every lift is finished and painted by Meterless and checked twice.

| Model | Median lift | Peak memory | Mean grade of 5 |
|---|---:|---:|---:|
| TripoSR | 2.0 s | 4.7 GB | 3.3 |
| TripoSG 1.5B | 167 s | 11.6 GB | 4.1 |
| Hunyuan3D 2.1 | 85 s | 12.3 GB | 4.3 |

246 of 246 polished GLBs pass the Khronos glTF validator. Median finish 8.3 s. Paint plus finish 104 s. Closed and manifold: 82 of 127 raw lifts. Hunyuan3D shut the box down 4 times unpaced in a warm room; with cool-down pacing it ran 9 jobs in a row at 83 °C or less. Its Tencent community licence excludes the EU, UK and South Korea. Grades are one reviewer's read of turntable renders. [Open the 3D bench](https://meterless.ai/Benchmarks/3D/).

## Agent frameworks

Not Nightshift. The Meterless engines and the most-shared agent frameworks, each against a plain same-model baseline on 11 tasks with hidden graders. 675 of 774 runs graded so far.

| Arm | Model | Quality lift vs baseline | Cost |
|---|---|---:|---|
| Meterless context layer (World State, H-MEM and Markovian through the reference engines) | Haiku 4.5 | +4.29 | |
| Meterless prompt cards | Haiku 4.5 | +3.36 | |
| Meterless app | Opus 5.5 | holds quality at 99.9 | 10% below baseline, $0.65 a run |
| Meterless context layer | Opus 5.5 | −2.79, not significant | +8% |
| Meterless cards with an audit step | Haiku 4.5 | −1.38 | +486% |

On Opus the baseline scores 99.06 and no framework moves quality clearly. There the differences are cost and time. One framework ran 35% cheaper. The composite score is pre-registered: 40% quality, 20% reliability, 15% low drift, 15% verification, 10% quality per dollar. Interim: 2 to 3 trials per cell, Haiku arms cover different task subsets, p-values not yet corrected for multiplicity. [Report](https://meterless.ai/Benchmarks/AgenticFrameworks/) · [interim status](https://meterless.ai/Benchmarks/AgenticFrameworks/STATUS.html).

## Knowledge work

The Morning Desk: real business briefs raced overnight by open models, read by a judge, re-checked by proofs and confirmed against an answer key.

| Measure | Value |
|---|---|
| Deliverables | 18 |
| Words, checked | 15,424 |
| Verified per run, by build (1.2.3, 1.2.7, 1.2.9, 1.3.0) | 0, 3, 4, 11 |
| Winning models | Qwen3.8 27B won 12 of 18. Qwen2.5 14B won 6. |
| Security RFP answers, build over build | judge 0.85, 0.92, 0.95. Time 27.8 to 19.8 min. |

Some deliverables carry dates the models invented. One brief, the postmortem, scored lower on the newer build (0.95 to 0.85). [Read the Morning Desk](https://meterless.ai/Benchmarks/KnowledgeWork/).

## Job modes

What each Nightshift mode is good for, and what it was not doing. Selectors, judges, deliberate, batch, bulk, deadlines, app generation and repair. The headline results are in [docs/products/nightshift/job-modes.md](../products/nightshift/job-modes.md).

| Measure | Value |
|---|---|
| Deliberate, correct | 0 of 15, then 8 of 15 |
| Gate repair | 6 of 6 |
| Refine, seeded bugs | 6 of 6 |
| Bulk | 220 of 220 units correct, lossless pause |
| Malformed requests refused at submit | 11 of 11, with a reason |
| Generated apps "verified" vs working | 12 of 12 vs 6 of 12 |
| Auto planning | 256 attempts for answers a best-of-4 found in under 2 minutes |

Electricity was not measured. [Read the report](https://meterless.ai/Benchmarks/DGX/modes/NIGHTSHIFT_MODES_BENCHMARKS.html).

## Mac M5, 16 GB

Every installed catalog fleet, best-of-4, on a fanless laptop with its owner's apps open: code, fact and extraction jobs, plus media.

| Measure | Value |
|---|---|
| Code winners correct | 21 of 21 |
| Catalog fleets after live fixes (8 fleets × 3 jobs) | 24 of 24 completed, 24 of 24 winners correct (were 3 of 24) |
| Best-of-4 winner vs one random attempt | 90% vs 82% correct, over 61 jobs |
| Three rotated jobs | 1,201 s down to 273 s once plans follow the memory actually free |
| Sustained 3-hour soak | 301 of 301 jobs, 1,806 attempts, 0 errors |
| Whisper | about 32× real time |
| SD-Turbo at 512² | 3.0 s |
| Model switches | median 1.8 to 2.5 s |

14B models need about 11.4 GB free and were never admitted at 8 to 9 GB. Image edit and video do not fit in 16 GB. The Mac build was ad-hoc signed, not notarized. [Read the report](https://meterless.ai/Benchmarks/MAC/M5+/).

---

## The hardware card

### Prefill and decode, always separately

Prefill is how fast the machine reads. Decode is how fast it writes. They are limited by different silicon and differ by almost two orders of magnitude. Averaging them into one "speed" hides the only thing you need to route work.

| Lane · model | Prompt tokens | Prefill tok/s | TTFT | Decode tok/s |
|---|---:|---:|---:|---:|
| coder · Qwen2.5-Coder-32B Q4_K_M | 823 | 424 | 1.9 s | 6.7 |
| | 6,263 | 458 | 13.7 s | 6.2 |
| vision · Qwen3.8-27B UD-Q4_K_XL | 816 | 454 | 1.8 s | 7.6 |
| | 6,274 | 512 | 12.3 s | 7.7 |
| judge · Muse-Glimmer-30B UD-Q4_K_XL | 438 | 490 | 0.9 s | 7.6 |
| | 3,282 | 596 | 5.5 s | 7.4 |

Measured September 17, 2026 on the three resident chat lanes. llama.cpp 0865990, flash attention on, KV cache q8_0, prompt cache disabled so prefill is real.

### Running lanes side by side

The same request on one, two, then all three lanes at once. Separate models share one memory bus, so the aggregate grows far slower than the seat count.

| Lanes running | Aggregate decode | TTFT on an 820-token prompt |
|---:|---:|---:|
| 1 | 6.7 tok/s | 1.9 s |
| 2 | 7.0 tok/s | 3.3 s |
| 3 | 9.7 tok/s | 4.1 s |

Overnight, that trade buys three independent approaches to one problem for roughly the price of one stream. At 2 PM in an editor it would be unacceptable, which is why posture exists. The full machine card is in [editions.md](../products/nightshift/editions.md).

---

## How to read these numbers

- Failures, refusals and wiped jobs stay in the denominators or are reported apart.
- "Measured" means read from a job log, a harness record or a test report. "Projected" means computed from a measured run and labelled.
- Attempts are not results. Throughput counts work produced. Acceptance counts work you would keep.

The lessons these runs taught are collected in [docs/architecture/learnings.md](../architecture/learnings.md).
