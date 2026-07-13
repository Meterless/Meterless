# Engine tab

The Engine tab is the performance-reporting surface for a Markovian deployment: projected vs actual cost curves, live config controls, a chain inspector, and historical run management. This is the blueprint an implementation should follow.

## Chart modes

**Projected mode** uses the theoretical efficiency curve from the config manager, based on the current `ChunkConfig`. Useful before any runs exist. Plots cumulative cost growth for the standard (append-history) baseline vs Markovian at each step, using `historySize = (step − 1) × chunkSize` for the standard side and `carryoverTokens + chunkSize` per step for the Markovian side.

**Actual mode** aggregates real historical runs step by step. Per-step averages carry a sample count. Computes real savings and real savings percent — always against **each run's own persisted `chunkConfig`**, never the current config.

Auto behavior: once at least one historical run with chunks exists, actual mode is enabled and becomes the default.

> Projected numbers are modeled, not measured. Actual numbers should prefer provider-reported usage, falling back to `chars/4` estimates only when usage is unavailable — and be labeled accordingly.

## Config controls

Expose live controls for `chunkSize`, `maxChunks`, and `carryoverTokens`, clamped to the canonical bounds (see [`chunk-config.md`](./chunk-config.md)):

| Field | Default | Min | Max | Step |
|---|---|---|---|---|
| `chunkSize` | 8000 | 1000 | 128000 | 1000 |
| `maxChunks` | 24 | 1 | 32 | 1 |
| `carryoverTokens` | 800 | 128 | 32768 | 128 |

The projection chart updates immediately; new values apply to the **next** run, never a run in flight.

## Chain inspector

For the current run or any historical run, selecting a step shows:

- the incoming carryover state
- the output snapshot for that step
- per-step token count
- the compression-cascade level used (a rising fallback level is a drift alarm — see [`telemetry.md`](./telemetry.md))

## Historical run management

- List recent runs (UI list capped at ~80; storage keeps more)
- View run metadata: timestamp, chunk count, efficiency, tokens saved, status
- Delete individual runs
- Clear all history (admin action)

Every run record carries its `chunkConfig` snapshot — this is mandatory, and it is what makes historical efficiency numbers honest.

## What's next

- [Telemetry](./telemetry.md) — the counters behind the charts
- [Run history](./run-history.md) — the records the actual mode aggregates
- [Chunk config](./chunk-config.md) — the bounds the controls clamp to
