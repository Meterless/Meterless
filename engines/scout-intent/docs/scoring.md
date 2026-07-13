# Scoring

How Scout decides which intent the user actually wants. Two execution stages, one canonical formula, confidence bands, clarification triggers.

## Two stages, one formula

Scout scores in two stages:

- **Stage 1 — deterministic trigger scan (always on).** A weighted trigger-word/substring scan over the full registry. Winner = highest weighted-match sum; confidence = the winner's score as a fraction of matched weight. Must complete a full-registry scan in **< 16 ms**, enforced by a startup self-test that scans a fixed probe set and fails loudly if exceeded. Runs on every keystroke for UI feedback and on submit for routing.
- **Stage 2 — hybrid rescoring (optional, recommended for routing decisions).** A small local classifier (embedding model, 50–200 MB, ONNX/WebLLM-class) adds semantic similarity; conversation window and retrieved context add the contextual term. If Stage 2 is unavailable (no model, cold start), Stage 1's result stands — graceful degradation, never a hard dependency.

Both stages target the same semantics — the canonical formula:

```
finalScore(intent) =
  0.40 * lexical(intent)      // trigger phrases, synonyms, n-grams
+ 0.35 * semantic(intent)     // embedding similarity vs intent prototypes
+ 0.20 * contextual(intent)   // recent turns, active workflow, retrieved memory
+ 0.05 * recency(intent)      // was this intent used recently in-session
- riskPenalty(intent)         // down-rank intents requesting blocked actions
```

Stage 1 alone yields `lexical` and (from session state) `recency`; `semantic` and `contextual` default to 0 until Stage 2 runs. The merge step is a single dot product with these weights. All weights are config data, not code — tunable per surface.

```
prompt ──▶ Stage 1: deterministic trigger scan (<16 ms, always on)
                │
                ▼
           Stage 2: hybrid rescoring (optional)
             ├──▶ semantic    (local classifier)
             ├──▶ contextual  (turns, workflow, retrieved memory)
             └──▶ merge       ──▶ top-k candidates with scores
```

The `0.20 · contextual` term is where retrieved memory and world context lift confidence after retrieval — see [`examples/query-hmem-before-action`](../examples/query-hmem-before-action) for a documented Medium→High band shift (0.61 → 0.93).

## Confidence bands

The merged top-1 score lands in one of four bands:

| Band | Range | Action |
|---|---|---|
| **High** | ≥ 0.80 | Proceed. Direct routing. |
| **Medium** | 0.55 – 0.79 | Proceed + log for review; offer "did you mean?" inline |
| **Low** | 0.40 – 0.54 | Ask for clarification; offer top-3 as buttons |
| **Reject** | < 0.40 | Fall back to the safe `GENERAL` intent; explain; never guess a high-risk intent |

Bands are configurable. Tighten them for high-risk surfaces; loosen for low-risk ones.

## Multi-intent detection

A single prompt can carry multiple intents.

> "Pull the Q2 numbers and draft a board email"

The classifier emits two candidates:

```ts
[
  { intent: "report.summarize", score: 0.91, span: "Pull the Q2 numbers" },
  { intent: "email.draft",      score: 0.88, span: "draft a board email" },
]
```

When two candidates are both in the High band and reference disjoint spans of the prompt, Scout returns a **plan with both intents** rather than choosing. Secondary intents are everything at or above the **0.55** threshold (the Medium band floor).

See [`examples/detect-multi-intent`](../examples/detect-multi-intent).

## Clarification triggers

The classifier returns a clarification request when:

- Top-1 score is in the Low band (0.40 – 0.54)
- Top-1 and top-2 scores are within 0.05 of each other in the Medium band
- Required parameters can't be bound from the prompt
- The intent is risk-class `high` and confidence is below `0.95`

Clarifications go back to the surface as structured prompts with up to 4 options:

```ts
{
  question: "Did you want to recover stuck deals, or query their current status?",
  options: [
    { label: "Recover them", intent: "deal.recover" },
    { label: "Just show me status", intent: "deal.query" },
  ],
}
```

The surface picks how to render that — buttons, voice, a chat reply. Clarification rate is a tracked metric with a hard ceiling ([eval harness](./eval-harness.md)) — an implementation that clarifies constantly is failing, not being safe.

## Learning loop

Every clarification, every user override, every operator correction is logged. The training set updates nightly. The classifier retrains weekly. The new model goes through evals before it ships.

See [`telemetry-and-learning.md`](./telemetry-and-learning.md).

## Why hybrid

Pure-LLM classifiers are slow, expensive, and brittle. Pure-keyword classifiers miss anything that isn't literal. Combined, the stages handle:

- "Find stuck deals" → lexical strong at Stage 1, confirmed by semantic
- "the Acme deal hasn't moved" → semantic catches the implicit "stuck" pattern
- "What do I do about Q4?" → vague; low merged confidence → clarification
- "draft the usual onboarding email" → contextual term (retrieved memory) resolves "the usual"

Stage 1 is the always-available floor; Stage 2 carries the load when nuance matters.

## Implementation notes

- Stage 1 is pure rules — no model call — and must pass the < 16 ms full-registry self-test at startup.
- Stage 2's classifier defaults to a small embedding model (50-200MB) running locally via WebLLM or ONNX.
- The merge step is a single dot product with the canonical weights.
- Stage 2 latency: typically 20-80ms client-side, 100-300ms with a remote classifier.

## What's next

- [Risk and policy](./risk-and-policy.md) — what happens after scoring
- [Capability graph](./capability-graph.md) — how the scored intent becomes a plan
- [Eval harness](./eval-harness.md) — the metrics that gate scoring changes
