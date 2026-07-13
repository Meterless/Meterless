# Retrieval Ranking

H-MEM retrieval uses hybrid ranking rather than vector similarity alone.

## Query preparation

Given a query:

1. Build a query embedding.
2. Extract query keywords.
3. Infer query domain.
4. Extract query entities.
5. Select a strategy: `minimal`, `personal`, `comprehensive`, or product-defined.

## Scoring formula

The canonical eight-signal blend, clamped and then multiplied by the record's confidence:

```text
raw =
  0.35 * semantic        # cosine(queryEmbedding, memory.embedding)
+ 0.20 * keyword         # Jaccard overlap of top-8 query tokens vs memory tokens
+ 0.10 * tag             # tag overlap
+ 0.10 * domain          # 1 if memory.domain === query.domain else 0
+ 0.15 * entity          # entity overlap
+ 0.05 * layer           # long_term 1.0, working 0.8, short_term 0.6
+ 0.05 * recency         # exponential decay on lastAccessed, ~14-day time constant
- 0.20 * superseded      # 1 if supersededBy is set (penalized, never deleted)

score = clamp01(raw) * confidence
```

Because `confidence` multiplies the final score, feedback deltas (+0.05 / −0.03 / −0.20) directly move future ranking.

Tune weights per domain and persist a weight-profile label (e.g. `weights@2026-07`) so quality changes can be correlated with feedback.

## Layer weights

| Layer | Weight | Intuition |
|---|---|---|
| `long_term` | 1.0 | Highest: validated and durable |
| `working` | 0.8 | Medium: active and useful but less permanent |
| `short_term` | 0.6 | Lowest: recent but volatile |

## Filtering

Recommended initial defaults:

- `topN = 5`
- `threshold = 0.35` (applied to the final score, after the confidence multiplier)
- entity cap per memory = 10
- related links cap per memory = 5

## Scoped recall

Memories carry optional `chatId` / `missionId` / `goalRunId` scoping fields:

- Chat-turn recall filters to the active `chatId` scope.
- Goal-run recall is isolated per `goalRunId` — memories from one run never leak into another.
- `includeUnscoped` defaults to `true` so pre-scoping legacy records never silently disappear.

## Superseded records

Superseded memories (records with `supersededBy` set) should not disappear from audit history, but they should be penalized in retrieval via the −0.20 term. If the replacement is available, prefer the current memory and include trace metadata indicating the older item was suppressed.
