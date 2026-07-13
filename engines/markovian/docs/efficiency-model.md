# Efficiency model

The math behind "flat memory cost, not linear." This doc shows the formulas, the worked examples, and where the approximations are.

## The two baselines

**Naive (append-history) baseline.** Every step's prompt = framing + goal + concatenation of all prior outputs + current step input. The transcript grows with step count.

**Markovian.** Every step's prompt = framing + goal + compressed carryover + current step input. The carryover is bounded by `carryoverTokens`.

## Per-step cost

Let:

- `F` = framing tokens (constant)
- `G` = goal tokens (constant)
- `S` = average step-input tokens (constant)
- `O` = average per-step output tokens (constant)
- `C` = carryover tokens (constant, Markovian only)
- `N` = total steps

**Naive per-step tokens-in at step `i`:**

```
naive_in(i) = F + G + (i-1) * O + S
```

The `(i-1) * O` term is the history. It grows linearly with step index.

**Markovian per-step tokens-in:**

```
markovian_in = F + G + C + S
```

Constant in `i`. Doesn't grow.

## Total cost across N steps

**Naive total:**

```
naive_total = sum from i=1 to N of (F + G + (i-1)*O + S)
            = N*(F + G + S) + O * N*(N-1)/2
```

That's `O(N²)` — quadratic in step count.

**Markovian total:**

```
markovian_total = N * (F + G + C + S)
```

That's `O(N)` — linear in step count.

## Efficiency

```
efficiency = (naive_total - markovian_total) / naive_total
           = (O * N*(N-1)/2 - N*C) / naive_total
```

For large `N`, the `O * N²/2` term dominates the numerator, and the denominator is also `O(N²)`, so efficiency approaches:

```
efficiency → 1 - 2C / (O*N)
```

That is: **the longer the run, the more dramatic the savings**. At fixed C and O, efficiency rises with N.

## Worked examples

Defaults: `F=400, G=200, S=300, O=1200, C=800`. All figures below are **modeled** from these constants, not measured runs — when you report real numbers, use provider-reported usage where available (`chars/4` is the fallback estimate only) and label the source.

| N | Naive total | Markovian total | Savings | Efficiency |
|---|---|---|---|---|
| 5 | 16,500 | 8,500 | 8,000 | 49% |
| 10 | 63,000 | 17,000 | 46,000 | 73% |
| 20 | 246,000 | 34,000 | 212,000 | 86% |
| 50 | 1,515,000 | 85,000 | 1,430,000 | 94% |
| 100 | 6,030,000 | 170,000 | 5,860,000 | 97% |
| 500 | 150,150,000 | 850,000 | 149,300,000 | 99.4% |

At 500 steps, naive doesn't run. Most providers cap at 200K-tier contexts; you'd run out of context before step 200.

## Which number is which

Three efficiency figures appear across this engine's docs. They are all modeled and they use different assumptions; quote them with their context:

| Figure | Where | Assumptions |
|---|---|---|
| ~91% | README hero math | Full 24-chunk run, chunks modeled at the full `chunkSize = 8000`, carryover 800 |
| 86% | Worked example table above | N=20 with the doc constants F=400, G=200, S=300, O=1200, C=800 |
| ~73% | Interactive demo defaults | N=10 with the same constants; shorter runs save less by design |

Expect real runs at typical configs to land between 60% and 90% depending on N, output size, and carryover budget. For a measured curve from an actual engine run: `cd ../reference && npx tsx scripts/measured-run.ts` (labeled estimated; swap in a real provider for measured numbers).

## At what N does Markovian start to win?

Setting `markovian_total < naive_total`:

```
N * (F + G + C + S) < N*(F + G + S) + O * N*(N-1)/2
N * C < O * N*(N-1)/2
2 * C < O * (N-1)
N > 1 + 2C/O
```

With defaults (C=800, O=1200): `N > 1 + 1.33 ≈ 3`. Markovian wins from chunk 3 onwards.

For tasks where C is intentionally large (e.g., 4000 tokens) and O is small (e.g., 600), the breakeven is `N > 14`. Below that, naive is fine. Above that, Markovian wins.

## Where the approximation is loose

- **`O` isn't constant.** Output sizes vary. Use `outputBudget` as the projection and accept ±20%.
- **Naive doesn't actually run forever.** Naive baselines fail at the context limit — but they fail by exceeding context, not by costing more, which is a different failure mode the math doesn't capture.
- **Carryover compression isn't free.** The compression cascade itself spends tokens (in the model call's output generating the marker). That cost is accounted for in `O`, but you can see it explicitly in `chunk.cascade_levels_used`.
- **Tool calls aren't in this math.** They appear in the prompt of the next chunk as injected results, which adds variable cost. Account for them in `S` averages.

## The qualitative case

The efficiency number is real, but the **bigger argument** isn't cost — it's feasibility.

Naive baselines have a ceiling. They run until the context window is full, then they stop being able to add steps. The ceiling is the same shape for everyone, and bigger models just delay it.

Markovian has **no such ceiling**. A 1000-step run costs roughly 1000× a single step. Whether your model has 8K or 200K context, the math doesn't change. The engine is what makes long-horizon agents tractable, not the model.

## What's next

- [Token economics demo](../token-economics-demo) — runnable proof, side-by-side
- [Chunk config](./chunk-config.md) — picking the constants
- [Telemetry](./telemetry.md) — measuring efficiency in your runs
