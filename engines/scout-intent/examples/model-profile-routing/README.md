# Model profile routing

The Recommend stage's other half. Scout picks a **model profile**, never a concrete model — cheap for classification, capable for synthesis, **local** when the data is sensitive. Your provider layer resolves the profile to an actual model.

Prerequisite reading: [`docs/model-routing.md`](../../docs/model-routing.md).

---

## Scenario

Three requests, three different right answers:

```text
"is this a refund request?"            → trivial classify   → cheap model
"design our Q3 migration architecture" → deep synthesis      → capable model
"summarize this confidential contract" → sensitive data      → LOCAL model
```

---

## Walkthrough — `index.ts`

```ts
import { Scout } from "@meterless/scout";

const scout = new Scout({
  intentRegistry: "./intents.json",
  modelProfiles: "./model-profiles.json",
  policyPack: "default",
});

const cases = [
  { p: "is this a refund request?",                data: "internal" },
  { p: "design our Q3 migration architecture",     data: "internal" },
  { p: "summarize this confidential contract",     data: "confidential" },
];

for (const c of cases) {
  const d = await scout.decide({
    prompt: c.p, user: { id: "u-1", role: "ae" }, surface: "chat",
    dataClass: c.data,
  });
  console.log(`${d.modelProfile.padEnd(20)} tier=${d.modelProfile.tier} costCeil=$${d.scope.budget.costMaxUSD}`);
}
```

`model-profiles.json`:

```json
{
  "low_cost_chat":      { "tier": "standard", "context": 8000,  "latency": "low",  "locality": "any"   },
  "high_reasoning":     { "tier": "premium",  "context": 32000, "latency": "high", "locality": "any"   },
  "local_confidential": { "tier": "local",    "context": 8000,  "latency": "med",  "locality": "local" }
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
low_cost_chat        tier=standard costCeil=$0.01
high_reasoning       tier=premium  costCeil=$0.40
local_confidential   tier=local    costCeil=$0.00
```

## How the profile is chosen

```text
if risk.requiresConfirmation || injectionScore > 0.5  → high_precision
if dataClass == "confidential"                         → local-only profile (data never leaves)
if codeIntent && band == high                          → high_reasoning
if retrievalIntent                                     → retrieval_qa
else                                                   → low_cost_chat
```

| Request | Profile | Why |
| --- | --- | --- |
| refund classify | `low_cost_chat` | trivial; a premium model is waste |
| migration architecture | `high_reasoning` | deep multi-step synthesis earns the premium tier |
| confidential contract | `local_confidential` | **data class wins** — sensitive data never leaves the device, even if a cloud model would be "better" |

## Two hard constraints

- **Cost ceiling is enforced, not advisory.** The chosen profile's budget is written into `scope.budget.costMaxUSD`. A downstream engine that would exceed it refuses the step — the ceiling rides on the signed contract.
- **`confidential` forces local, full stop.** No cost or capability score can override a data-class downgrade to a local model. Sensitive data leaving the device is a policy violation, not a routing trade-off.

## Fallback

```text
low_cost_chat + low_confidence  → escalate to high_precision
high_reasoning + tool_failed    → fall back to high_precision
```

Low confidence escalates to a *safer* profile, not a cheaper one — when Scout is unsure, it spends more, not less.

---

## Why it matters

- **Profiles, not models, keep routing portable.** Scout commits to "this needs deep reasoning"; the provider layer maps that to whatever premium model is wired in. Swap providers without touching intent logic.
- **Data class is a hard gate above cost.** The most common expensive mistake is sending confidential data to the best cloud model "just this once." Making locality a non-overridable rule on the contract removes the judgment call.
- **Unsure → spend more.** Escalating low confidence to `high_precision` (not down to cheap) encodes the right risk posture: a wrong cheap answer costs more than a right expensive one.

## Next

- [`tool-plan-generation`](../tool-plan-generation/README.md) — the capability side of the same Route/Recommend stage.
- [`route-to-markovian`](../route-to-markovian/README.md) — when the profile decision is "this is long-horizon."
