# Eval harness

Scout's decisions are testable. This is the harness that tests them.

Scout needs an evals folder more than any other engine in the stack — a decision layer you can't measure is a rubber stamp. This is the doc that explains why and what's in it.

## What gets measured

Seven core metrics. Every release runs against the locked regression set and reports on each.

| Metric | What it measures | Target |
|---|---|---|
| **Intent top-1 accuracy** | Did the top scored intent match the labeled intent? | ≥ 0.92 |
| **Intent top-3 recall** | Was the labeled intent in the top 3? | ≥ 0.98 |
| **Injection precision** | Of detected injections, how many were real? | ≥ 0.95 |
| **Injection recall** | Of real injections, how many got caught? | ≥ 0.90 |
| **Tool selection precision** | Did the picked tool match the labeled tool? | ≥ 0.88 |
| **Clarification rate** | What fraction of prompts triggered clarification? | ≤ 0.15 |
| **User override frequency** | What fraction of decisions did users override? | ≤ 0.08 |

Targets are configurable. The defaults are the specified acceptance criteria — they are **targets, not measured results**. No published benchmark backs them yet; the corpus must reach the documented scale (below) before an implementation may claim them.

`user override frequency` is defined as user corrections captured in telemetry ("No, I meant…" followed by an intent switch within the same trace) divided by contracts issued. The bundled fixtures carry no override data, so offline runs report it as 0 with an explicit note — it is a production-telemetry metric.

## The locked regression set

A versioned corpus of `(prompt, expected)` pairs. What ships in this repo today:

```
evals/regression-set/
  v1/
    intents/
      deal.jsonl               # 6 examples
      email.jsonl              # 4 examples
      research-and-plan.jsonl  # 5 examples
    injection/
      adversarial.jsonl        # 10 examples (7 injections + 3 clean controls)
    multi-intent/
      composed.jsonl           # 3 examples
    edge-cases/
      clarification.jsonl      # 4 examples
```

**Corpus v1 is a smoke set — 32 examples total — not a benchmark.** The targets in the table above are release gates for a corpus at documented scale, which is the growth target: **≥ 50 examples per major intent family**, the injection set split into per-class files (`role-confusion.jsonl`, `instruction-override.jsonl`, `embedded-control.jsonl`), and ≥ 3 adversarial examples per new pattern. Do not quote the target numbers as measured results until the corpus reaches that scale.

Each example:

```json
{
  "id": "deal-recover-001",
  "prompt": "Find the top 5 stuck deals and draft recovery emails",
  "user": { "role": "ae" },
  "surface": "chat",
  "expected": {
    "intent": "deal.recover",
    "parameters": { "count": 5, "channel": "email" },
    "risk": "medium",
    "toolPlan": ["world.query", "swarm.run", "email.draft"]
  },
  "tags": ["deal", "multi-step", "v1"]
}
```

The set is **append-only at the example level** and **versioned at the corpus level**. New examples land in the current version. Threshold changes or fixture migrations bump the version. Old versions stay queryable so you can ask "did we regress against v1?"

## Running it

```bash
npm run evals              # full suite against current registry
npm run evals:intent       # intent-only
npm run evals:injection    # adversarial set
npm run evals:multi-intent # multi-intent detection
npm run evals:report       # markdown report
```

The runner requires a Scout implementation — this repo is the spec and `src/` is empty. Point it at yours: `SCOUT_IMPL=/path/to/your/scout npm run evals`.

The runner emits a structured report and a CI-friendly exit code. A release that drops below targets fails its CI gate.

## Slice reports

Aggregate metrics hide problems. The harness produces slice reports broken down by:

- **Surface** — chat vs. inbox vs. API. The classifier may be 0.95 on chat but 0.78 on inbox.
- **Role** — admin prompts may behave differently than viewer prompts.
- **Intent family** — `deal.*` may regress while `research.*` improves.
- **Risk class** — high-risk intents need separate tracking.
- **Time slice** — last week vs. last month, to catch drift.

A release that holds aggregate accuracy but drops a single slice below threshold should still fail the gate. Configurable per-slice.

## Drift detection

The eval harness runs nightly in production deployments (sampled, redacted). It tracks:

- **Distribution shift** — are users sending different kinds of prompts than the regression set expects?
- **Confidence shift** — are top-1 scores drifting downward across the corpus?
- **Clarification spike** — is the system suddenly asking for more clarification?
- **Override spike** — are users suddenly overriding more decisions?

When any drift metric crosses its threshold, the harness flags it. The training set update process pulls flagged examples into the next regression set version.

## Adding examples

```bash
npm run evals:add -- \
  --prompt "Recovery emails for stuck deals" \
  --intent "deal.recover" \
  --params '{"channel":"email"}' \
  --risk "medium"
```

Each new example gets a unique ID, a creation timestamp, and a labeler ID. PRs that add examples are reviewed for label quality before merging.

## Adversarial examples

The injection set is **adversarial by construction**. New variants get added when:

- A production injection slips through (false negative)
- A red-team session produces a novel attack
- An external threat report mentions a new pattern

An adversarial fuzzer that mutates known patterns to generate near-variants is planned, not shipped (see the [roadmap](../ROADMAP.md), v0.3). When it lands it won't replace human-curated adversarial examples — it's a way to catch shallow regressions where a tweaked spelling defeats a regex.

## What it doesn't measure

The harness does not measure:

- **Downstream output quality.** Whether the recovery email is good is the Swarm/Markovian engine's problem.
- **End-user satisfaction.** That's product analytics, not Scout evals.
- **System throughput.** Latency is in telemetry, not evals.

Scout's evals are **decision-quality evals**. Stay focused.

## Releasing

The release process:

1. PR opens against `main`.
2. CI runs `evals` against the locked regression set.
3. Slice reports get posted to the PR.
4. Any metric below threshold blocks merge.
5. If thresholds need to change (because the system improved or the bar rises), that's a separate PR that updates `evals/config/thresholds.yaml`.

Threshold changes are themselves reviewed against historical results. You don't get to lower a threshold to make a regression "pass."

## What's next

- [Telemetry and learning](./telemetry-and-learning.md) — how production data flows back into evals
- [Intent registry](./intent-registry.md) — how new intents get evaluated
- [Risk and policy](./risk-and-policy.md) — the adversarial set
