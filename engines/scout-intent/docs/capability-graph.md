# Capability graph

Intents declare *what* needs to happen. The capability graph resolves *how*.

## The principle

Intents don't reference tools directly. They reference **capabilities** — abstract verbs like `world.query`, `memory.recall`, `swarm.run`, `email.send`. The capability graph maps each capability to one or more concrete tools at runtime, picking based on availability, permissions, and context.

This indirection is what lets you swap a tool implementation without rewriting your intents. It's also what lets a single intent run on a phone (local tools), a laptop (mixed), or an air-gapped deployment (local only) without changing the registry.

## Shape of the graph

```
Capabilities (abstract)             Tools (concrete)
                                                 
world.query        ─────────▶  meterless.world-model.graph
                          └──▶  postgres.read

memory.recall      ─────────▶  meterless.hmem.retrieve

swarm.run          ─────────▶  meterless.swarm.execute
                          └──▶  remote.swarm.api

email.send         ─────────▶  gmail.send
                          └──▶  outlook.send
                          └──▶  smtp.send
```

Each edge is annotated with availability, latency, cost, and permission requirements.

## Resolving capabilities

When Scout's router sees an intent like `deal.recover` (capabilities: `world.query`, `swarm.run`, `email.send`), it walks the graph for each capability and picks one concrete tool.

Selection rules, in priority order:

1. **Required permissions** — drop tools the user can't use.
2. **Availability** — drop tools that are offline or rate-limited.
3. **Surface preference** — chat surface prefers conversational tools; inbox prefers email-first.
4. **Cost / latency budget** — pick the cheapest tool that meets the latency target.
5. **Tie-break** — prefer local tools over remote (local-first default).

The output is a **tool plan**:

```ts
[
  { tool: "meterless.world-model.graph", input: { query: { ... } } },
  { tool: "meterless.swarm.execute",     input: { dag: { ... } } },
  { tool: "gmail.send",                  input: { drafts: { ... } } },
]
```

## Registering tools

Tools register themselves at startup:

```ts
import { Scout } from "@meterless/scout";

const scout = new Scout({ ... });

scout.capabilities.register({
  capability: "email.send",
  toolId: "gmail.send",
  availability: () => gmailClient.isConnected(),
  requiredPermissions: ["gmail:send"],
  cost: { perCall: 0 },
  latency: { p95Ms: 800 },
  invoke: async (input) => gmailClient.send(input),
});
```

A capability with no registered tools is **unresolvable**. Intents that depend on it can't run; Scout returns a structured "unavailable capability" error instead of failing silently.

## Capability families

Group capabilities by family. Families let you reason about whole classes of behavior at once.

```
read/      world.query, memory.recall, file.read
write/     world.assert, memory.commit, file.write
reason/    swarm.run, markovian.chain
act/       email.send, calendar.create, slack.post
```

Risk policies can scope by family — "this user can only do `read/` operations, no `act/`."

## Dynamic capabilities

Some capabilities depend on runtime context: a CRM integration that's connected for some users and not others, a tool that requires a paid plan, an MCP server that's available in a specific session.

These get registered dynamically:

```ts
scout.capabilities.register({
  capability: "crm.read",
  toolId: "salesforce.mcp",
  availability: () => session.mcpServers.has("salesforce"),
  ...
});
```

The router re-checks availability on every decision. Unavailable tools drop out automatically.

## When no tool resolves

Three failure modes:

1. **Capability declared but no tool registered** → unresolvable capability error. Surface tells the user "this requires a connection to X."
2. **All tools filtered by permissions** → permission error. Surface explains what's missing.
3. **All tools filtered by availability** → degraded mode. Surface offers retry or fallback.

Scout never makes up a tool. If nothing resolves, it returns a typed error, not a hallucinated plan.

## Why a graph, not a table

Capabilities form a graph because some are composed of others.

```
deal.recover  needs  [world.query, swarm.run, email.send]
swarm.run     needs  [memory.recall, markovian.chain]
```

The router walks transitively. An intent that declares `swarm.run` automatically depends on whatever `swarm.run` resolves to plus its dependencies.

This is also what makes the graph **testable**. You can ask: "Given user U in session S, can intent I run end-to-end?" — and get a structured answer with the resolved tool plan or the first missing capability.

## What's next

- [Model routing](./model-routing.md) — picking the model that backs each tool
- [Execution contract](./execution-contract.md) — packaging the plan for downstream
- [Eval harness](./eval-harness.md) — testing tool selection precision
