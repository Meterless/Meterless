# Entity / Context / Relationship model

Three primary types. They compose to model almost any domain.

> **A note on ids in this doc:** readable ids like `player:tommie-frazier-iii` and `season:145` are **display labels** used for clarity. Canonical stable ids follow the grammar in [`stable-ids.md`](./stable-ids.md): `type:system:externalId` when externally keyed, `ent_<hash>` when name keyed, and context ids include their parent in the hash.

## Why three?

Most graph databases give you two: nodes and edges. That's not enough for systems where the **situation** matters as much as the entities.

A player "plays for" a team. But which season? Which league? Under which coach? In a flat graph, you cram those into edge attributes and lose the ability to query them as first-class concepts. In World Model, the season *is* a first-class entity — specifically, a **context** — and the relationship is scoped to it.

## The three roles

### Entity — the *what*

A discrete, identifiable thing.

- `player:tommie-frazier-iii`
- `article:guardian-2026-05-17-fed-rate`
- `account:acme-corp`
- `incident:inc-2026-04-19-payment-outage`

### Context — the *when / where / situation*

A bounded situation in which facts hold.

- `season:145`
- `quarter:2026-q2`
- `thread:slack-c-eng-2026-05-17-abc`
- `campaign:spring-launch-2026`

Contexts nest. `season:145 → week:14 → game:1287` is a path. Facts can be scoped to any level.

### Relationship — the *connection*

A typed edge between two entities, optionally scoped to a context.

```ts
{
  from: "player:tommie-frazier-iii",
  type: "plays-for",
  to: "team:bengals",
  context: "season:145",
  validFrom: "2087-08-01",
  validTo: "2088-02-15",
}
```

## Worked example — Gridiron Scripture

A narrative-football universe with bloodlines, seasons, and dynasties.

**Entities**:

```ts
{ type: "player", id: "tommie-frazier-iii", attrs: { tier: "legendary" } }
{ type: "player", id: "tommie-frazier-ii", attrs: { tier: "all-pro" } }
{ type: "team", id: "bengals" }
{ type: "team", id: "redskins" }
```

**Contexts**:

```ts
{ type: "season", id: "145" }
{ type: "season", id: "144", parent: undefined }
{ type: "game", id: "sb-145", parent: "season:145" }
```

**Relationships**:

```ts
{ from: "player:tommie-frazier-iii", type: "child-of", to: "player:tommie-frazier-ii" }
{ from: "player:tommie-frazier-iii", type: "plays-for", to: "team:bengals", context: "season:145" }
{ from: "game:sb-145", type: "features-team", to: "team:bengals" }
{ from: "game:sb-145", type: "features-team", to: "team:redskins" }
```

Now you can ask:

- *Who plays for the Bengals in season 145?* — graph view, filter by relationship type and context
- *What's Tommie Frazier III's bloodline?* — graph view, recursive child-of traversal
- *Show me every Super Bowl* — timeline view, entities of type `game` with attribute `playoff-round=super-bowl`

All from the same canonical store.

## Worked example — News intelligence

```ts
{ type: "article", id: "guardian-2026-05-17-fed-rate" }
{ type: "person", id: "jerome-powell" }
{ type: "organization", id: "federal-reserve" }
{ type: "event", id: "fed-rate-decision-2026-05" }
```

```ts
{ type: "incident-window", id: "fed-may-2026", startedAt: "2026-05-15", endedAt: "2026-05-20" }
```

```ts
{ from: "article:guardian-2026-05-17-fed-rate", type: "mentions", to: "person:jerome-powell" }
{ from: "article:guardian-2026-05-17-fed-rate", type: "covers", to: "event:fed-rate-decision-2026-05", context: "incident-window:fed-may-2026" }
```

Ask: *what does every article in the May 2026 incident window say about the Fed?* — one query.

## When to use what

| Pattern | Use |
|---|---|
| A thing that persists with attributes | **Entity** |
| A bounded situation, time window, or scoped state | **Context** |
| A connection between two entities, especially if temporal | **Relationship** |
| An assertion about a thing, especially with conflicting sources | **Fact** (resolves to entity attrs) |

If you're tempted to put an attribute on an entity that only holds *in some situation*, that's a relationship scoped to a context, not an attribute.
