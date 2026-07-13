# Tiered Storage

H-MEM separates memory into short-term, working, and long-term tiers.

## Tiers

| Tier | Persistence | Use |
|---|---|---|
| `short_term` | Volatile/session | Current conversation, fallback capture, temporary facts |
| `working` | Local persistent | Active projects, recent documents, still-valid local context |
| `long_term` | Durable DB | Validated knowledge, approved dreams, stable preferences |

## Hydration flow

```text
load long-term
  + load working
  + attach session short-term
  -> dedupe by id
  -> backfill missing embeddings
  -> apply forgetting curve to non-long-term records
```

## Forgetting curve

Apply decay only to non-long-term records. Useful signals:

- Age since `timestamp`.
- Age since `lastAccessed`.
- Low `accessCount`.
- Low `confidence`.
- `review` or `not_helpful` tags.

## Promotion

Promote a memory when it has:

- repeated access,
- helpful feedback,
- high confidence,
- no unresolved conflict,
- clear provenance.

## Local-first posture

H-MEM should run well with local storage first:

- Short-term in memory/session.
- Working in SQLite, IndexedDB, or local document store — a real database, never LocalStorage (its ~5–10 MB cap silently truncates the working tier).
- Long-term in user-controlled durable storage.

Remote sync is optional and should preserve source, timestamp, and ledger lineage.

## Backup expectations

The sleep cycle must create a backup snapshot before execution. Restoring from backup must reverse consolidation, archival, and synthesis effects while preserving the ledger entry that restore occurred.
