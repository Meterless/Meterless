# Intent registry

The intent registry is the declared catalog of things your system knows how to do. Everything Scout decides starts here.

## The principle

> If an intent isn't in the registry, it can't be acted on.

This is the property that prevents agent scope drift. The registry is the surface area of your system. Adding a new behavior means adding a new intent — and getting it past the eval harness.

## The shape

```ts
type Intent = {
  id: string;                    // "deal.recover"
  category: string;              // "deal", "email", "research"
  description: string;           // human + classifier prompt
  parameters: ParameterSchema;   // structured, validated
  capabilities: CapabilityRef[]; // what tools it needs
  riskClass: "low" | "medium" | "high";
  surfaces: string[];            // where this intent is allowed
  roles: string[];               // who can invoke it
  examples: string[];            // training + eval seeds
  version: number;
};
```

## A real one

```json
{
  "id": "deal.recover",
  "category": "deal",
  "description": "Draft a recovery action for a stuck deal — typically an email or call plan",
  "parameters": {
    "type": "object",
    "properties": {
      "count": { "type": "integer", "minimum": 1, "maximum": 20 },
      "channel": { "enum": ["email", "call", "slack"] },
      "stage": { "type": "string", "optional": true }
    }
  },
  "capabilities": ["world.query", "swarm.run", "memory.recall"],
  "riskClass": "medium",
  "surfaces": ["chat", "inbox"],
  "roles": ["ae", "csm", "sales-leader"],
  "examples": [
    "find stuck deals and draft recovery emails",
    "the Acme deal hasn't moved in 3 weeks — what should I do?",
    "give me 5 deals at risk and recovery plans for each"
  ],
  "version": 3
}
```

## Categories

Group intents by category. Categories make the registry navigable and give the classifier a hierarchical signal.

```
deal/
  deal.recover
  deal.query
  deal.update
email/
  email.draft
  email.summarize
research/
  research.competitor
  research.market
```

## Risk classes

Each intent declares a base risk class. Risk gets re-evaluated per-request based on parameters and context, but the base class sets the policy floor.

| Class | Examples | Default policy |
|---|---|---|
| **low** | `email.summarize`, `research.market` | Allow with telemetry |
| **medium** | `deal.recover`, `email.draft` | Allow with review log |
| **high** | `account.delete`, `policy.update` | Require explicit confirmation + signed contract review |

## Surfaces and roles

`surfaces` declares where an intent can be invoked from (chat, inbox, API, scheduled). `roles` declares who can invoke it. Both are enforced at the guard stage.

A `deal.recover` invocation from a viewer role gets blocked before the classifier even returns. The block is logged.

## Scale: the canonical registry

The canonical Meterless runtime registry ships **131 intents + 8 topology vectors**. The registries in this repository — `evals/fixtures/intents.json` and the per-example `intents.json` files — are deliberately small example registries (3–13 intents) sized for teaching and for the smoke-test eval corpus. They are not the production catalog.

The 131-intent baseline taxonomy is 31 foundation intents (`GENERAL`, `CODE`, `SWARM`, `RESEARCH`, `ARCHITECT`, `EDIT`, `MEMORY`, `MISSION`, `DEBATE`, `DESTRUCTIVE`, `EXPLAIN`, `ENHANCE`, `TESTER`, `DEBUGGER`, `DEVOPS`, `SECURITY`, `DATABASE`, `DATA_SCIENTIST`, `WRITER`, `DESIGNER`, `TECHNICAL_WRITER`, `TRANSLATOR`, `BUSINESS_ANALYST`, `TUTOR`, `CODE_REVIEWER`, `OPTIMIZER`, `API_DESIGNER`, `PROJECT_MANAGER`, `ACCESSIBILITY`, `MUSICIAN`, `LEGAL`) plus 100 expansion intents across ten groups: advanced code operations (12), memory & context (10), swarm & orchestration (10), mission extensions (8), workspace & files (8), specialized development (12), quality & maintenance (10), AI & automation (8), communication & collaboration (8), platform administration (8), and data & visualization (6).

The 8 **topology vectors** are a parallel shape-of-work signal used by orchestrators for DAG selection — `pipeline`, `fan_out`, `debate`, `loop`, `hierarchical`, `star`, `tree`, `mesh` — emitted as `scout_topology_pattern` on the decision.

The registry carries a `registryVersion`, stamped on every contract, so downstream engines can detect drift between registry variants.

## Versioning

The registry is versioned. Every intent has a version. Every change to an intent — new parameters, new capabilities, changed examples — bumps the version.

Why: the eval harness pins to a registry version. Bumping the version triggers a re-eval. Releases are gated by the metrics.

## Loading the registry

```ts
import { Scout, IntentRegistry } from "@meterless/scout";

// From a single JSON file
const registry = IntentRegistry.fromFile("./intents.json");

// From a directory of YAML files (one per intent)
const registry = IntentRegistry.fromDirectory("./intents/");

// Composed
const registry = IntentRegistry.compose([
  IntentRegistry.fromFile("./core-intents.json"),
  IntentRegistry.fromFile("./customer-intents.json"),
]);

const scout = new Scout({ intentRegistry: registry });
```

## Anti-patterns

- **Too few intents.** "Do whatever the user asked" is not an intent. If your registry has one entry, you're not using Scout, you're using `if (true)`.
- **Too many intents.** If every minor variation is its own intent, the classifier degrades. Parameterize instead.
- **Intents without examples.** The classifier needs seeds. The eval set needs fixtures. Examples are mandatory.
- **Capabilities embedded in intent logic.** Capabilities go in the [capability graph](./capability-graph.md), not in the intent body. The intent declares *what* it needs; the graph resolves *how*.

## What's next

- [Scoring](./scoring.md) — how the classifier picks among registered intents
- [Capability graph](./capability-graph.md) — how intents resolve to tools
- [Eval harness](./eval-harness.md) — how registry changes get gated
