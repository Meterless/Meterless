# Workshop 04 — Lock in evals and ship safely

**Time:** 45 minutes
**You'll leave with:** a regression set tied to your intent registry, thresholds gating your CI, and the muscle memory to add new examples every time you ship.

## The discipline

Every behavior change to Scout — new intent, new pattern, new policy, new scoring weight — runs against a versioned regression set before merging. No exceptions.

If you don't have this discipline, the system gets dumber every quarter and nobody can tell you when it happened.

## Step 1 — Seed the corpus (10 min)

For every intent in your registry, write 5-10 examples in JSONL:

```bash
mkdir -p evals/regression-set/v1/intents
```

```jsonl
{"id":"doc-summarize-001","prompt":"tldr this doc","expected":{"intent":"doc.summarize","risk":"low"}}
{"id":"doc-summarize-002","prompt":"give me the highlights","expected":{"intent":"doc.summarize","risk":"low"}}
{"id":"account-lookup-001","prompt":"what's the latest on Acme","expected":{"intent":"account.lookup"}}
```

Each example: a unique ID, the prompt, optional user/surface, expected intent + risk + tool plan.

## Step 2 — Set thresholds (10 min)

`evals/config/thresholds.yaml`:

```yaml
metrics:
  intent_top1:        { target: 0.90, hard_floor: 0.82 }
  intent_top3_recall: { target: 0.97, hard_floor: 0.92 }
  injection_recall:   { target: 0.88, hard_floor: 0.80 }
  clarification_rate: { target_max: 0.20 }
```

Start permissive. Tighten as the corpus grows. Lowering a threshold to make a failing build pass is the one move that's banned.

## Step 3 — Run it (10 min)

```bash
npm run evals
```

Watch metrics print. Watch the report appear in `evals/reports/latest.md`. The first run is the baseline.

## Step 4 — Wire CI (10 min)

`.github/workflows/scout-evals.yml`:

```yaml
name: scout-evals
on: [pull_request]
jobs:
  evals:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm install
      - run: npm run evals
      - uses: actions/upload-artifact@v4
        with:
          name: scout-eval-report
          path: evals/reports/latest.md
```

A PR that drops a metric below floor fails the build. A PR that surfaces a near-miss prints a watch-list. Reviewers see both before merging.

## Step 5 — Add an example with every behavior change (5 min)

A new intent → 5+ new examples.
A new pattern → 3+ adversarial examples.
A bug fix → an example that fails without the fix and passes with it.

This single discipline is what keeps the system from regressing as it grows.

## What you learned

- The regression set is the contract you keep with your future self.
- Thresholds are the floor, not the ceiling.
- Slice reports catch problems aggregates hide.
- Adding examples is part of every PR, not a separate project.

## Done

You've completed the Scout workshop series. Next steps:

- Wire Scout into your actual stack — see [`examples/scout-to-swarm`](../examples/scout-to-swarm) for the pattern.
- Subscribe to drift detection — see [`docs/telemetry-and-learning.md`](../docs/telemetry-and-learning.md).
- Compose with the rest of the [Meterless engine stack](https://github.com/meterless/meterless).
