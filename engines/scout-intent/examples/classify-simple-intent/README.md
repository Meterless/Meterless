# 01 — Classify a simple intent

The smallest Scout call: a prompt in, scored top-k intents out. Start here — every other example is this plus one stage of the pipeline.

Prerequisite reading: [`docs/intent-registry.md`](../../docs/intent-registry.md), [`docs/scoring.md`](../../docs/scoring.md).

---

## Scenario

A registry that declares three intents (`doc.summarize`, `account.lookup`, `email.draft`). The user types something that should clearly land on one of them:

```text
"give me a quick tldr of this doc"
```

We want the scored candidates and their confidence bands — not yet a full execution contract (that is [`04`](../generate-execution-contract/README.md)).

---

## The whole thing — `index.ts`

```ts
import { Scout } from "@meterless/scout";

const scout = new Scout({ intentRegistry: "./intents.json" });

const decision = await scout.classify({
  prompt: "give me a quick tldr of this doc",
  user: { id: "u-1", role: "user" },
  surface: "chat",
});

console.log(decision.candidates);
console.log("primary:", decision.primary.id, decision.primary.confidence, decision.primary.band);
```

`intents.json` (excerpt — see [Workshop 01](../../workshops/01-build-an-intent-registry.md)):

```json
{
  "version": 1,
  "intents": [
    { "id": "doc.summarize", "riskClass": "low",
      "examples": ["summarize this doc", "give me the tldr", "short summary of the Q2 notes"] }
  ]
}
```

## Run it

```bash
# The @meterless packages are not yet published — this repository is the
# implementation spec. With a spec-conforming implementation on your import path:
npx tsx ./index.ts
```

## Expected output

```text
[
  { id: "doc.summarize",   score: 0.91, band: "high"   },
  { id: "email.draft",     score: 0.18, band: "reject" },
  { id: "account.lookup",  score: 0.06, band: "reject" }
]
primary: doc.summarize 0.91 high
```

## How the score was produced

The hybrid scorer blends signals (see [`docs/scoring.md`](../../docs/scoring.md)):

```text
finalScore = 0.40·lexical + 0.35·semantic + 0.20·contextual + 0.05·recency − riskPenalty
```

- **lexical** — "tldr" / "doc" hit `doc.summarize`'s example triggers hard
- **semantic** — embedding similarity to the registered examples
- **contextual / recency** — neutral here (no prior turns)

Scoring runs in two stages: a **Stage-1 deterministic trigger scan** (always on, full-registry scan in < 16 ms, verified by a startup self-test) supplies `lexical` and `recency`; an optional **Stage-2 hybrid rescoring** (small local classifier) adds `semantic` and `contextual`. If Stage 2 is unavailable, Stage 1's result stands.

## Confidence bands drive what happens next

| Band | Score | Action |
| --- | --- | --- |
| high | ≥ 0.80 | direct routing — proceed to the contract |
| medium | 0.55–0.79 | proceed + log; inline "did you mean?" affordance |
| low | 0.40–0.54 | clarify — structured prompt with top-3 intent buttons |
| reject | < 0.40 | fall back to safe `GENERAL`; explain; never guess a high-risk intent |

Clarification also triggers regardless of band when top-1 and top-2 are within 0.05 of each other in the Medium band, when a required parameter can't be bound, or when a `high` risk-class intent scores below 0.95 confidence (see [`docs/scoring.md`](../../docs/scoring.md)).

`0.91` is `high` → the pipeline proceeds without asking the user anything.

---

## Why it matters

- **The registry is the surface area.** Scout can only classify intents you declared. `classify` is a lookup against your catalog, not open-ended NLU — that is what makes it deterministic and testable.
- **Scores are bands, not just numbers.** The band, not the raw float, decides behavior: route, clarify, or disambiguate. This is how Scout asks instead of guessing when it is unsure.
- **`classify` is read-only.** It produces candidates and stops. No risk gate, no tool plan, no contract yet — those are later stages. Keeping the smallest call side-effect-free makes it cheap to call early and often.

## Next

- [`02 — detect-multi-intent`](../detect-multi-intent/README.md) — when one prompt carries two or three intents.
- [`04 — generate-execution-contract`](../generate-execution-contract/README.md) — the full pipeline, ending in a signed contract.
