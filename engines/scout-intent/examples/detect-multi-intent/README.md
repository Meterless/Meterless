# 02 — Detect multi-intent

Real prompts are rarely one intent. "Pull the Q2 numbers **and** draft a board email" is two. Scout returns a *composed plan* with an execution mode — it does not silently pick one and drop the other.

Prerequisite reading: [`01 — classify-simple-intent`](../classify-simple-intent/README.md), [`docs/scoring.md`](../../docs/scoring.md).

---

## Scenario

```text
"Pull the Q2 revenue numbers and draft a board email summarizing them."
```

This is `data.query` **then** `email.draft` — and the email depends on the numbers, so they cannot run in parallel.

---

## Walkthrough — `index.ts`

```ts
import { Scout } from "@meterless/scout";

const scout = new Scout({ intentRegistry: "./intents.json" });

const decision = await scout.classify({
  prompt: "Pull the Q2 revenue numbers and draft a board email summarizing them.",
  user: { id: "u-1", role: "ae" },
  surface: "chat",
});

console.log("primary:   ", decision.primary.id);
console.log("secondary: ", decision.secondary.map((s) => s.id));
console.log("mode:      ", decision.executionMode);
for (const i of [decision.primary, ...decision.secondary]) {
  console.log(`  ${i.id} ← span "${i.span}"`);
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
primary:    data.query
secondary:  [ "email.draft" ]
mode:       plan_then_execute
  data.query  ← span "Pull the Q2 revenue numbers"
  email.draft ← span "draft a board email summarizing them"
```

## How execution mode is resolved

```text
primary    = highest-scoring intent (data.query, 0.88)
secondary  = other intents above the 0.55 threshold (email.draft, 0.71)
            ↓
are they independent?
  yes → "parallel"           (run both at once)
  no  → "plan_then_execute"  (email depends on the numbers → sequential)
single intent only → "single_step"
```

The email references *"them"* (the numbers), so they are **not** independent → `plan_then_execute`. Each intent carries a **span**: the slice of the prompt that produced it, so a downstream planner knows which words map to which step.

## What the composed plan becomes

`plan_then_execute` means one contract is issued per stage, chained by `parentId`:

```text
contract A  intent=data.query   → produces the Q2 figures
contract B  intent=email.draft  parentId=A  → drafts using A's result
```

Run [`04`](../generate-execution-contract/README.md) to see the contract shape; the multi-intent case simply emits a chain instead of a single contract.

---

## Why it matters

- **Composing beats choosing.** Picking only `data.query` and dropping the email silently does half the user's request — the most common multi-intent failure. Scout surfaces *all* intents above threshold and lets the mode decide ordering.
- **Span attribution makes the plan auditable.** "Why did `email.draft` run?" → because the span *"draft a board email…"* scored it. The decision is traceable to the exact words, not a black box.
- **Dependence picks the mode, not the agent.** `parallel` vs `plan_then_execute` is decided at the intent layer from whether the intents reference each other — the orchestrator just executes the mode it is handed.

## Next

- [`03 — risk-check`](../risk-check/README.md) — running a prompt through the guard stack.
- [`scout-to-swarm`](../scout-to-swarm/README.md) — when a multi-intent plan needs parallel specialists.
