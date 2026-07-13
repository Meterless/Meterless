# Workshop 03 — Route to the right downstream engine

**Time:** 45 minutes
**You'll leave with:** three intents that route to three different downstream engines (H-MEM, Markovian, Swarm), and a working understanding of how the execution contract enforces scope.

## The picture

```
User prompt
   ↓
 Scout decides
   ↓
 Contract issued (signed, scoped)
   ↓
   ├──▶ H-MEM      (when intent needs memory recall)
   ├──▶ Markovian  (when intent is long-horizon reasoning)
   └──▶ Swarm      (when intent needs multiple specialists)
```

## Step 1 — Add three intents (10 min)

Three intents, three downstream capabilities:

```json
{
  "intents": [
    {
      "id": "memory.recall",
      "capabilities": ["hmem.retrieve"],
      "riskClass": "low",
      "examples": ["what do you know about Acme", "remind me what we decided last week"]
    },
    {
      "id": "plan.long-horizon",
      "capabilities": ["markovian.chain"],
      "riskClass": "low",
      "examples": ["plan a 6-month migration", "step by step rollout plan"]
    },
    {
      "id": "research.comparison",
      "capabilities": ["swarm.run"],
      "riskClass": "low",
      "examples": ["compare X, Y, Z", "produce a comparison memo"]
    }
  ]
}
```

## Step 2 — Wire the three engines (15 min)

```ts
import { Scout } from "@meterless/scout";
import { HMEM } from "@meterless/hmem";
import { Markovian } from "@meterless/markovian";
import { Swarm } from "@meterless/swarm";

const SECRET = process.env.SCOUT_SECRET ?? "dev";

const scout = new Scout({ intentRegistry: "./intents.json", signingSecret: SECRET });
const memory = new HMEM({ verifyContractsWith: SECRET });
const markovian = new Markovian({ verifyContractsWith: SECRET });
const swarm = new Swarm({ verifyContractsWith: SECRET });
```

Each downstream engine receives the contract and verifies the signature before doing anything.

## Step 3 — Route by capability (15 min)

```ts
async function handle(prompt: string) {
  const { executionContract: c } = await scout.decide({
    prompt,
    user: { id: "u-1", role: "user" },
    surface: "chat",
  });

  const cap = c.scope.capabilities[0];

  if (cap === "hmem.retrieve") return memory.retrieveByContract(c);
  if (cap === "markovian.chain") return markovian.runFromContract(c, { secret: SECRET });
  if (cap === "swarm.run") return swarm.startFromContract(c, { secret: SECRET });

  throw new Error(`No handler for capability: ${cap}`);
}
```

Try three prompts. Watch each one land at the right engine.

## Step 4 — Try a scope violation (5 min)

Hand the swarm a contract scoped to `hmem.retrieve`. It refuses:

```ts
const memoryContract = await scout.decide({ prompt: "what do you know about Acme", ... });

try {
  await swarm.startFromContract(memoryContract.executionContract, { secret: SECRET });
} catch (err) {
  console.log("Refused:", err.code); // scope-mismatch
}
```

This is the property the contract buys you. Engines refuse out-of-scope work at the boundary — not after they've already run.

## What you learned

- Scout is the front door. Every engine is downstream of its contract.
- Capabilities are the routing key, not intents.
- Contracts enforce scope at every boundary.
- A misrouted contract gets refused, not silently misexecuted.

## Next

[Workshop 04 — Lock in evals and ship safely →](./04-lock-in-evals.md)
