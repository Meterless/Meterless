# Nightshift job modes

Nightshift has many ways to run a job besides "race four attempts and pick one". This page lists them and what each one was measured to do. The measurements come from the [job modes benchmark](https://meterless.ai/Benchmarks/DGX/modes/NIGHTSHIFT_MODES_BENCHMARKS.html): one DGX Spark, October 1 to 3, 2026, builds 1.3.2 through 1.3.5, every cell run three times, failures kept in the denominators.

## Kinds

| Kind | What it is | Ask for it when |
|---|---|---|
| `best_of_n` | Race n attempts across the fleet, cluster them, pick a winner. Many knobs. | "Give me the best of many tries." |
| `deliberate` | One long chain of chunks. It is Markovian: each chunk carries a compressed summary forward and checkpoints. Chains can be forked from any chunk. | "Think about one thing for a long time." |
| `batch` | Many independent requests in one job, one answer each, no selection. | "Do these 500 things tonight." |
| `bulk` | The same instruction over every file of a folder or corpus, with a coverage ledger. 1 to 8 units in flight. | "Go through all of these and tell me what you covered." |
| `app_stream` | An outside app's conversation through the local endpoint, kept as one open job per app. Opened by the proxy, not submitted. | "Record what my other apps asked." |
| `composition` | Pinned sources from an import or the compose verb. Never races. Minted, not submitted. | "Build on earlier work." |

## Selection inside a race

| Control | Options |
|---|---|
| **Selector** | `verifier_panel` (a judge panel scores a shortlist; the default), `majority_vote` (the largest agreeing group wins; no judge), `unit_test` (JavaScript tests you supply run against each attempt; all or nothing; needs exec checks enabled) |
| **Judge mode** | `accuracy` (default), `quality` (a frozen written rubric with deterministic checks and an eligibility gate), `consistency` (the winner is checked against an indexed canon; fails closed without one), `creative` (no single winner: a shortlist, a spread label and contrasts) |
| **Diversity** | off, low, medium, high, across axes: briefs, temperature, postures, synthesis |
| **Attempt budget** | low, mid, high, max: 15, 40, 70 or 100 percent of each lane's output ceiling |

## When and how long

| Control | Options |
|---|---|
| **Window** | `quiet` (default: wait for the night window and quiet traffic) or `now` |
| **Gates** | Start only on an otherwise idle box, or at a scheduled time |
| **Stops** | A hard deadline with a labelled partial; stop when no new cluster appears after K attempts; stop when the quality bar is met |

## After the race and across nights

| Capability | What it does |
|---|---|
| **Makes** | One verb, `POST /v1/jobs/{id}/materialize`, with 44 transforms on the DGX edition: apps with a verify and repair loop, refined artifacts, documents, media, conversions |
| **Synthesis and reports** | Cluster report, synopsis and synthesis (a curator model or a deterministic cut), night report, insight seal |
| **Repair queue** | Scan, preview and submit bounded repairs of saved attempts. Fix what almost worked. |
| **Rerun, fork, continue** | Rerun a job, fork a deliberate chain from a chunk, or continue a night with last night's consensus folded in |
| **Methods and Skills** | A Method is a versioned set of job defaults mined from a successful night. A Skill is attached text. |
| **Schedules and watchers** | A stored job on a cadence of five minutes or more. A watcher is a schedule with a condition on a folder, URL or HTTP endpoint, with debounce, dedupe and cooldown. |
| **Auto** | The planner detects the task class and picks kind, n, judge, diversity, budget, window and fleet, then writes its rationale onto the record |
| **Media autopilot** | Chooses and queues media makes from a race's winner |

## What the measurements say

| Mode | Result | Build |
|---|---|---|
| Verifier panel with a dedicated judge lane | 306 of 310 shortlisted candidates scored (99%). Best-scoring candidate picked 22 of 26. Best partial answer found 11 of 11 where no candidate was fully correct, against 1 of 10 for majority vote. | 1.3.2 |
| Verifier panel on a fleet with no judge lane | 0 of 59 scored, then 17 of 20 after the fix | 1.3.2 to 1.3.4 |
| Majority vote | About three times faster than the panel (median 33 s vs 100 s). Right when most candidates are right. | 1.3.2 |
| Bulk | 220 of 220 units correct, 0 duplicates, about 1,000 units an hour, lossless pause. Model-free conversion ran at 6,700 to 8,300 files an hour. | 1.3.3 |
| Gate repair, seeded defects | Missing click handler repaired 6 of 6. Syntax error 4 of 6. Truncation 3 of 3. | 1.3.3 |
| Deliberate | 0 of 15 correct, then 8 of 15. The fact prompt is now answered in 5 s, in one chunk. | 1.3.2 to 1.3.3 |
| Consistency judge | Recall 0.2, then 0.5, then 0.83. Precision 1.0 throughout. | 1.3.2 to 1.3.4 |
| 45 s deadline | Ran up to 255 s late, then finished in 47 to 59 s, labelled | 1.3.2 to 1.3.3 |
| Malformed requests | 11 of 11 refused at submit, with a reason | 1.3.3 |
| App generation | 12 of 12 marked verified, but only 6 of 12 worked | 1.3.3 |
| Auto | Planned 256 attempts for answers a best-of-4 found in under 2 minutes | 1.3.3 |

35 defects were fixed with regression tests during this campaign. Each test fails on the build before its fix. The open problems are stated plainly: "verified" means a generated app loads, not that it works; Auto over-plans; thinking models spend most of a short job reasoning. These lessons are collected in [learnings](../../architecture/learnings.md).
