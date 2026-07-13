# Query H-MEM before action

Scout's Interpret stage does not decide in a vacuum. It emits a **context plan** telling [H-MEM](https://github.com/meterless/meterless/tree/main/engines/hmem) how aggressively to retrieve, then folds the returned memories back into intent confidence and tool selection. The decision is grounded in the user's actual history, preferences, and prior corrections.

Prerequisite reading: [`04 — generate-execution-contract`](../generate-execution-contract/README.md), the [H-MEM engine folder](https://github.com/meterless/meterless/tree/main/engines/hmem).

---

## Scenario

```text
"draft the usual onboarding email for the new hire"
```

"the usual" is unrecoverable without memory. Scout must pull the user's prior onboarding-email preferences from H-MEM *before* it can confidently classify and plan.

---

## Walkthrough — `index.ts`

```ts
import { Scout } from "@meterless/scout";
import { HMEM } from "@meterless/hmem";

const scout = new Scout({ intentRegistry: "./intents.json", policyPack: "default" });
const hmem  = new HMEM({ storage: "local", namespace: "user-u1" });

// 1. Scout emits a CONTEXT PLAN — it decides how aggressive retrieval should be.
const plan = await scout.planContext({
  prompt: "draft the usual onboarding email for the new hire",
  user: { id: "u-1", role: "manager" },
  surface: "chat",
});
console.log(plan.contextPlan);
// { sources: ["memory"], maxTokens: 4000, redactionPolicy: "default_internal" }

// 2. Execute the plan against H-MEM (plan drives topN + strategy).
const wantsMemory = plan.contextPlan.sources.includes("memory");
const { memories } = await hmem.query({
  text: "draft the usual onboarding email",
  topN: wantsMemory ? 8 : 0,
  strategy: plan.contextPlan.redactionPolicy === "default_internal" ? "comprehensive" : "minimal",
});

// 3. Decide WITH the retrieved memory folded in.
const decision = await scout.decide({
  prompt: "draft the usual onboarding email for the new hire",
  user: { id: "u-1", role: "manager" },
  surface: "chat",
  context: memories,
});

console.log("intent:", decision.intent.primary.id, decision.intent.primary.confidence);
console.log("params:", decision.intent.parameters);
```

## Run it

```bash
# The @meterless packages are not yet published — this repository is the
# implementation spec. With a spec-conforming implementation on your import path:
npx tsx ./index.ts
```

## Expected output

```text
{ sources: ["memory"], maxTokens: 4000, redactionPolicy: "default_internal" }
hmem.query → 3 memories (incl. "prefers warm tone, includes 30-60-90 plan link")
intent: email.draft 0.93     ← confidence rose: "the usual" disambiguated by memory
params: { tone: "warm", template: "onboarding-v3", include: ["30-60-90-plan"] }
```

## How memory changed the decision

| Without memory | With memory (this example) |
| --- | --- |
| "the usual" → ambiguous → `email.draft` at 0.61 (**medium** → clarify) | resolved → `email.draft` at 0.93 (**high** → proceed) |
| no parameters — would have to ask the user | `tone`, `template`, `include` filled from prior corrections |
| generic email | the user's *actual* established onboarding email |

The contextual term in the scoring formula (`0.20 · contextual`) is exactly where retrieved memory lifts confidence — a medium-band guess becomes a high-band decision *because* the history grounded it.

## Scout decides the retrieval budget — not H-MEM

```text
trivial lookup           → contextPlan.sources = []        → topN 0  (don't pay for memory)
"the usual" / references → contextPlan.sources = ["memory"] → topN 8, comprehensive
sensitive surface        → redactionPolicy tightens          → strategy "minimal"
```

H-MEM does not guess how hard to search. Scout's context plan tells it — retrieval aggressiveness is an intent-layer decision, recorded on the contract.

---

## Why it matters

- **"The usual" only works with grounded memory.** Reference-laden prompts are unrecoverable from text alone. Pulling history *before* deciding is what turns an ambiguous clarify-loop into a confident one-shot.
- **Scout sizes the retrieval, not the memory store.** A trivial prompt should not drag 8 memories into the decision; a referential one must. The context plan makes that an explicit, auditable choice instead of a fixed default.
- **Memory raises confidence the honest way.** It feeds the contextual scoring term — a medium→high band shift you can trace to specific retrieved memories, not an opaque bump.

## Next

- The reciprocal view — the same call from inside H-MEM — lives in the [H-MEM engine folder](https://github.com/meterless/meterless/tree/main/engines/hmem).
- [`04 — generate-execution-contract`](../generate-execution-contract/README.md) — the contract this grounded decision seals.
