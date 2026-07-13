# Stable IDs

IDs in World Model are **deterministic, content-addressable, and never renumbered**. This is the property that makes ingest idempotent, merges safe, and re-imports lossless.

## The rules

1. **Every entity, context, and relationship has a stable ID.**
2. **IDs are derived, not assigned.** Same input → same ID.
3. **IDs survive merges.** A merged entity keeps both originals as aliases.
4. **IDs survive schema migrations.** The schema version changes; the ID does not.
5. **IDs survive re-imports.** Importing the same source twice produces the same IDs.

## How IDs are derived

The default ID strategy is a content hash over a canonical key set.

### Entities

Two forms, one grammar:

- **Externally keyed** (preferred whenever an authoritative external identifier exists):

  ```
  id = `${type}:${system}:${externalId}`     // e.g. account:salesforce:0015g00000A1b2cAAA
  ```

- **Name keyed** (the fallback when no external key exists):

  ```
  id = `ent_${sha256(`${type}:${normalizeName(name)}`).hex.slice(0, 16)}`
  normalizeName = lowercase → NFKD → strip combining marks → collapse whitespace → trim
  ```

Which external key to pin is a deterministic, type-specific decision (`canonicalKey`):

| Entity type | Canonical key |
|---|---|
| `article` | `url` or `(publisher, slug)` |
| `person` | normalized full name + DOB if known, else externalId |
| `account` | CRM external ID |
| `player` | normalized name + bloodline marker |
| `event` | source + native event ID |

Type-specific canonical keys are declared in your schema and **versioned**. Changing them produces a migration, not a renumbering.

### Contexts

```
id = hash(type + canonicalKey(attrs) + parent?)
```

Same shape, but a context's ID includes its parent — so `week:14` under `season:145` is a different ID than `week:14` under `season:144`.

### Relationships

```
id = hash(from + type + to + context? + validFrom?)
```

Relationships have stable IDs too, so adding the same edge twice is a no-op.

## Aliases

When two entities turn out to be the same (operator merge, or automated entity resolution), one becomes the **primary** and the other becomes an **alias**.

```ts
type Alias = {
  aliasId: EntityId;
  primaryId: EntityId;
  mergedAt: ISODate;
  mergedBy: string;
  reason: string;
};
```

Old references to the alias ID **still resolve** — the read surface follows alias pointers transparently. The event log preserves both, so an unmerge is a one-step rollback.

## Externalized IDs

For entities that have authoritative external identifiers (Salesforce IDs, ISBNs, DOIs), World Model lets you pin the canonical key:

```ts
await world.upsertEntity({
  type: "account",
  externalKey: { system: "salesforce", id: "0015g00000A1b2cAAA" },
  attrs: { name: "Acme Corp" },
  source: { kind: "api" },
});
```

The ID is then `account:salesforce:0015g00000A1b2cAAA` — the literal externally-keyed form — and stays consistent across every system that knows about that account.

## Why content hashes, not UUIDs

UUIDs make ingest non-idempotent: re-ingesting the same article generates a new ID. Content-addressed IDs collapse duplicates at the boundary, which is the property you want at the canonical-store layer.

If you need opaque external IDs for users to copy-paste, expose them through a separate handle layer — don't compromise the canonical ID strategy to make URLs prettier.

## When IDs change

They don't. Not after a merge (aliases handle that), not after a schema migration (the schema version is independent), not after a re-import (canonical key is stable).

The only case where an ID changes is **explicit re-keying**: an operator decides that the canonical key for a type was wrong, declares a migration, and the system replays the event log with the new key. The old IDs become aliases of the new ones. Old references still resolve.

This is the property the rest of the system depends on.
