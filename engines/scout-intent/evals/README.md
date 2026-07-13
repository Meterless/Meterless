# Scout Evals

**This is the unique asset of the Scout repo.** Decision systems need decision-quality tests. Scout's whole reason for existing is making the right call before action, so the test harness is a first-class citizen.

## What's in here

```
evals/
  regression-set/        # locked, versioned fixtures
    v1/
      intents/           # prompt → expected intent labels
      injection/         # adversarial prompts → expected blocks
      multi-intent/      # composed prompts → expected multi-plan
      edge-cases/        # ambiguous, clarification-required
  config/                # thresholds, slice definitions
  fixtures/              # the intent registry the runner loads (intents.json)
  runner/                # the eval runner + evals:add capture tool
  reports/               # generated artifacts (sample-report.md is illustrative)
```

## The metrics

| Metric | What it measures | Target |
|---|---|---|
| Intent top-1 accuracy | Top scored intent matches label | ≥ 0.92 |
| Intent top-3 recall | Label appears in top 3 | ≥ 0.98 |
| Injection precision | Detected injections are real | ≥ 0.95 |
| Injection recall | Real injections get caught | ≥ 0.90 |
| Tool selection precision | Picked tool matches label | ≥ 0.88 |
| Clarification rate | Prompts triggering clarification | ≤ 0.15 |
| User override frequency | User corrections ("No, I meant…" + intent switch in the same trace) ÷ contracts issued | ≤ 0.08 |

Thresholds live in [`config/thresholds.yaml`](./config/thresholds.yaml). **These are targets, not measured results** — corpus v1 is a 32-example smoke set (15 intent-labeled, 10 injection, 3 multi-intent, 4 edge cases). The growth target before any implementation may claim these numbers: ≥ 50 examples per major intent family and a per-class injection split (see [`docs/eval-harness.md`](../docs/eval-harness.md)). The fixtures carry no override data, so offline runs report `override_frequency` as 0 with an explicit note.

## Running

```bash
npm run evals               # full suite
npm run evals:intent        # intent-only
npm run evals:injection     # adversarial set
npm run evals:multi-intent  # composed intents
npm run evals:report        # generates a markdown report under reports/
```

The runner needs a Scout implementation to score — this folder is the implementation spec; there is no `src/` directory, by design. Point the harness at your implementation of the specified API:

```bash
SCOUT_IMPL=/abs/path/to/your/scout npm run evals
```

CI exits non-zero if any metric drops below its threshold. PRs that drop metrics don't merge.

## Slice reports

Aggregates hide problems. Every run produces slice reports broken down by:

- Surface — chat vs. inbox vs. API
- Role — admin vs. ae vs. viewer
- Intent family — `deal.*` vs. `research.*`
- Risk class — low / medium / high
- Time window — last 7 days vs. last 30

A release that holds aggregate accuracy but drops a single slice below threshold fails the gate.

## Adding examples

```bash
npm run evals:add -- \
  --prompt "Recovery emails for stuck deals" \
  --intent "deal.recover" \
  --params '{"channel":"email"}' \
  --risk "medium"
```

Each new example gets a unique ID, a creation timestamp, and a labeler ID. PRs adding examples are reviewed for label quality before merging.

## Versioning

The corpus is **append-only at the example level** and **versioned at the corpus level**. New examples land in the current version. Threshold changes or fixture migrations bump the version. Old versions stay queryable so you can ask: "did we regress against v1?"

## What evals don't measure

- Downstream output quality (that's Swarm/Markovian's problem)
- End-user satisfaction (product analytics)
- System throughput (telemetry)

Scout evals are **decision-quality evals**. Stay focused.

## See also

- [`docs/eval-harness.md`](../docs/eval-harness.md) — the full design
- [`docs/telemetry-and-learning.md`](../docs/telemetry-and-learning.md) — how production feeds back
