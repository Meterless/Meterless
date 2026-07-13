# Telemetry

What gets measured. How efficiency is computed. What flows into dashboards.

## Counters and gauges

Per chunk:

```
chunk.tokens_in            tokens sent to the model
chunk.tokens_out           tokens received
chunk.latency_ms           model latency
chunk.carryover_in_tokens
chunk.carryover_out_tokens
chunk.markers.<name>       counter per marker emitted
chunk.cascade_levels_used  how deep the compression cascade went
chunk.errors               any parsing/budget errors
```

Per run:

```
run.chunks_total
run.tokens_in_total
run.tokens_out_total
run.latency_ms_total
run.efficiency_pct         vs naive baseline (see efficiency-model.md)
run.status                 completed | max-chunks | errored | aborted | paused (transient)
run.tools_called           count of NEEDS_TOOL invocations
run.clarifications         count of NEEDS_CLARIFICATION pauses
```

Per-deployment aggregates (across runs):

```
runs.completed_total
runs.efficiency_p50
runs.efficiency_p95
runs.tokens_saved_total    (naive_estimate - actual)
runs.tokens_per_step_avg
```

## What efficiency means

`run.efficiency_pct` is the percentage of tokens **saved vs. a naive baseline** that ships the full transcript every step.

```
naive_tokens = sum over steps i of (framing + goal + all prior outputs up to i + step_i_input)
actual_tokens = sum over steps i of (framing + goal + carryover_i + step_i_input)
efficiency = (naive_tokens - actual_tokens) / naive_tokens
```

For long runs this number is typically 80-95%; for short ones (3-5 chunks) 30-50%. These are **modeled against an estimated naive baseline** — see [`efficiency-model.md`](./efficiency-model.md) for the derivation, worked examples, and where the approximation is loose.

Accounting source order: use provider-reported usage (`usage.input_tokens` / `output_tokens`) when available; fall back to `ceil(chars/4)` only when it isn't. Label every reported number with its source (`measured` vs `estimated`) — self-computed savings without that label will not survive scrutiny. Efficiency for a historical run is always computed against **that run's persisted `chunkConfig`**, never the current config.

## Surfacing telemetry

Three modes:

**1. Programmatic** — subscribe in code.

```ts
markovian.on("chunk.complete", (event) => {
  metrics.gauge("markovian.tokens_in", event.tokensIn, { runId: event.runId });
});

markovian.on("run.complete", (event) => {
  metrics.histogram("markovian.efficiency", event.efficiency);
});
```

**2. Local dashboard** — opt-in (an implementation ships its own; see the [Engine tab blueprint](./engine-tab.md)).

```bash
npm run markovian:dashboard   # example script name in your host project
```

Shows efficiency over time, per-chunk latency, carryover size trends, tool-call frequency.

**3. Structured logs** — JSON lines to stdout if you want to ship them somewhere.

```ts
const markovian = new Markovian({ telemetry: { logTo: "stdout" } });
```

## What's not logged

By default:

- The raw prompt and output content (use `run history` for that, which stays local)
- Tool call arguments
- Carryover content

The default telemetry is **shape data**. You can answer "are runs getting more efficient over time" without ever exposing content.

Configurable per-deployment.

## Drift detection

Three signals to watch:

- **Efficiency dropping** — carryover is bloating; cascade may need tuning
- **Cascade-level usage rising** — compression is having to work harder; carryover budget may be too tight
- **Marker miss rate rising** — model is forgetting to emit markers; framing needs reinforcement

Each has a default threshold and an alert hook.

## What's next

- [Efficiency model](./efficiency-model.md) — the math behind the savings number
- [Run history](./run-history.md) — where the underlying data lives
- [Streaming UI](./streaming-ui.md) — live telemetry surfaces
