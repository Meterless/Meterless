# Scout-grounded recall

> Cross-engine example: the scout-intent spec has dropped (see [`engines/scout-intent/`](../../../scout-intent/)); this runs once a Scout reference implementation lands. Until then treat the code as a reference sketch of the contract.

Before [Scout Intent](https://github.com/meterless/meterless/tree/main/engines/scout-intent) decides what to do, it asks H-MEM what the agent already knows. This example is the **H-MEM side**: how a Scout context plan maps to a retrieval call, and what the returned memories carry that lets Scout decide confidently instead of guessing.

> The reciprocal example, `query-hmem-before-action`, lives in the [Scout Intent engine](https://github.com/meterless/meterless/tree/main/engines/scout-intent) — it focuses on Scout folding memory into intent confidence; this one focuses on what H-MEM serves and why.

Prerequisite reading: [`04-retrieve-and-reinject`](../04-retrieve-and-reinject/README.md), [`docs/retrieval-ranking.md`](../../docs/retrieval-ranking.md).

---

## Scenario

```text
"draft the usual onboarding email for the new hire"
```

"the usual" is unrecoverable from the prompt alone. Scout cannot confidently classify it until H-MEM returns the user's prior onboarding-email preferences and corrections.

## The contract, from memory's side

```text
Scout context plan { sources:["memory"], redactionPolicy:"default_internal" }
        │  Scout decides HOW aggressive retrieval should be
        ▼
hmem.query({ topN, strategy })   ← H-MEM decides WHAT comes back
        │  ranked, trace-tagged memories
        ▼
Scout.decide(context = memories) ← confidence rises on the contextual signal
```

## Walkthrough (illustrative reference API)

The code below is a reference sketch of the contract, not a runnable package — this repo is the implementation spec, and no `@meterless/*` npm packages are published.

```ts
import { HMEM } from "@meterless/hmem";
import { Scout } from "@meterless/scout";

const hmem  = new HMEM({ storage: "local", namespace: "user-u1" });
const scout = new Scout({ intentRegistry: "./intents.json", policyPack: "default" });

// Scout sizes the retrieval; it does not do the retrieving.
const plan = await scout.planContext({
  prompt: "draft the usual onboarding email for the new hire",
  user: { id: "u-1", role: "manager" }, surface: "chat",
});

// H-MEM answers the plan. Plan → topN + strategy mapping:
const { memories, trace } = await hmem.query({
  text: "draft the usual onboarding email",
  topN: plan.contextPlan.sources.includes("memory") ? 8 : 0,
  strategy: plan.contextPlan.redactionPolicy === "default_internal" ? "comprehensive" : "minimal",
});

for (const m of memories) console.log(`${m.type}  ${m.content}  ←${m.source}`);
console.log("retrieval reason:", trace.retrievalReason);

// Scout decides WITH what memory returned.
const decision = await scout.decide({
  prompt: "draft the usual onboarding email for the new hire",
  user: { id: "u-1", role: "manager" }, surface: "chat",
  context: memories,
});
console.log("intent:", decision.intent.primary.id, decision.intent.primary.confidence);
```

## Expected output (illustrative)

```text
preference  Onboarding emails use a warm tone, include the 30-60-90 plan link  ←feedback:correction
preference  Template onboarding-v3, CC the new hire's manager                  ←session:s-204
factual     Last onboarding email was sent 2026-04-30                           ←event:email_sent
retrieval reason: domain+entity match on "onboarding email"; comprehensive (default_internal)
intent: email.draft 0.93
```

## What H-MEM contributes to the decision

| H-MEM returns | Effect on Scout |
| --- | --- |
| 3 ranked memories with `trace.retrievalReason` | the `0.20·contextual` term in scoring lifts confidence 0.61 → 0.93 |
| `type: preference` records from prior corrections | `email.draft` parameters fill in (tone, template) — no clarify loop |
| `source:` provenance on each | Scout's contract can cite *why* it inferred "the usual" |

H-MEM does not decide the intent — it supplies grounded, provenanced recall so Scout's existing scoring resolves a medium-band guess into a high-band decision. The retrieval **strategy** (`comprehensive` vs `minimal`) is dictated by Scout's plan, not chosen by H-MEM.

---

## Why it matters

- **Scout sizes the recall; H-MEM serves it.** A trivial prompt yields `topN: 0` — memory is not consulted. A reference-laden one ("the usual") gets a comprehensive pull. The split keeps retrieval cost proportional to ambiguity.
- **The trace is what makes the decision auditable.** `trace.retrievalReason` rides into Scout's contract, so "why did Scout think this was `email.draft`?" traces back to specific memories and their `source:` provenance.
- **Memory raises confidence the honest way.** It feeds Scout's contextual scoring term — a medium→high band shift attributable to named records, not an opaque bump.

## Next

- `query-hmem-before-action` in the [Scout Intent engine](https://github.com/meterless/meterless/tree/main/engines/scout-intent) — the reciprocal: the same call from inside Scout.
- [`04-retrieve-and-reinject`](../04-retrieve-and-reinject/README.md) — the retrieval + trace mechanics in depth.
- [`world-model-sync`](../world-model-sync/README.md) · [`markovian-handoff`](../markovian-handoff/README.md) — H-MEM's other integration seams.
