# Aggregate shapes

This is the canonical write surface. Five shapes. Strict. Versioned.

## Entity

The atomic thing that exists.

```ts
type Entity = {
  type: string;              // "player", "article", "account"
  id: string;                // stable, content-addressable
  attrs: Record<string, unknown>;
  schemaVersion: number;
  source: Provenance;
  createdAt: ISODate;
  updatedAt: ISODate;
};
```

Entities are upserted, never deleted. A delete is a tombstone fact.

## Context

A situation that scopes facts. A season, a quarter, a thread, an incident.

```ts
type Context = {
  type: string;              // "season", "quarter", "thread"
  id: string;
  attrs: Record<string, unknown>;
  parent?: ContextId;        // contexts can nest
  startedAt?: ISODate;
  endedAt?: ISODate;
  source: Provenance;
};
```

Contexts can nest. `season:145 → week:14 → game:1287` is a valid chain.

## Relationship

A typed, optionally context-scoped, edge between two entities.

```ts
type Relationship = {
  from: EntityRef;
  type: string;              // "plays-for", "mentions", "owns"
  to: EntityRef;
  context?: ContextRef;
  attrs?: Record<string, unknown>;
  validFrom?: ISODate;
  validTo?: ISODate;
  source: Provenance;
};
```

Relationships have temporal bounds (`validFrom`, `validTo`) so you can ask "who played for the Bengals in 2087" without losing history.

## Fact

An atomic assertion about an entity, with source and confidence. Useful when you want to track *who said what* before resolving it into entity attributes.

```ts
type Fact = {
  about: EntityRef;
  predicate: string;         // "height-cm", "primary-position"
  value: unknown;
  confidence: number;        // 0..1
  context?: ContextRef;
  source: Provenance;
  assertedAt: ISODate;
  supersededBy?: FactId;
};
```

Facts are the input to entity attribute resolution. Conflicting facts get logged, scored, and either resolved or escalated to an operator.

## Provenance

Every write carries provenance.

```ts
type Provenance = {
  kind: "manual" | "rss" | "api" | "file" | "agent" | "pipeline";
  by?: string;               // user id, pipeline id, agent id
  at: ISODate;
  url?: string;
  checksum?: string;
  runId?: string;            // ingest/replay run identifier — joins events to a run
};
```

If a write has no provenance, it gets rejected at the boundary. There is no exception.

## Event

The append-only log entry. Every write produces one.

```ts
type Event = {
  id: EventId;               // monotonic
  kind: "upsertEntity" | "upsertContext" | "relate" | "assertFact" | "snapshot"   // the five write primitives
      | "tombstone" | "alias" | "view-rebuild";                                    // system/operator event kinds
  payload: Entity | Context | Relationship | Fact | Snapshot | Tombstone | Alias | ViewRebuild;
  schemaVersion: number;
  at: ISODate;
};
```

The state is a fold over events. Views are projections of the fold.

`tombstone`, `alias`, and `view-rebuild` are emitted by the engine and the control plane — an
`alias` event commits a merge (and its inverse commits an unmerge), a `tombstone` is the delete,
and a `view-rebuild` records an operator-triggered projection rebuild. They are event kinds in
the log, not additions to the five-primitive write surface.
