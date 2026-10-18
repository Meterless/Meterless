# Token economics demo

This interactive chart shows the main claim of the Markovian engine: per-step cost stays flat while the naive cost keeps growing.

## Run it

```bash
npm install
npm run dev
# → vite prints the local URL to open
```

Or open `index.html` in any modern browser. The demo runs client-side with no build step.

## What you can do

- Adjust the chunk budget, carryover budget, and goal size with sliders
- Adjust the per-step output size
- Watch the Markovian curve stay flat while the naive curve grows quadratically
- See the crossover step where Markovian starts winning
- See the projected cost in dollars for both strategies

## What you're looking at

```
Tokens-in per step

   ▲
   │             naive baseline ____________
   │                        /
   │                       /
   │                      /
   │                     /
   │                    /
   │                   /
   │                  /
   │   ─────────────/─────────────  ← Markovian (flat)
   │
   └────────────────────────────────────▶ step count
```

The naive line is the cost-per-step of an agent that ships the full transcript every step. The Markovian line is the cost-per-step of an agent that ships a compressed carryover.

All numbers here are modeled from the symbolic cost model in [`docs/efficiency-model.md`](../docs/efficiency-model.md). They are projections, not measured provider usage. Real runs should account with provider-reported usage (`chars/4` is the fallback estimate only) and label numbers accordingly.

The total area under each curve is the run cost. For naive, that area grows quadratically with step count. For Markovian, linearly.

This chart summarizes the case for the engine.

## Why this exists

Documentation can claim "flat cost." A chart shows it. A chart you can adjust shows that the relationship is structural, not a cherry-picked example.

The main argument for the engine is this graph, so the repo ships it as a runnable demo.

See also:

- [`docs/efficiency-model.md`](../docs/efficiency-model.md) for the math
- [`examples/token-savings-demo`](../examples/token-savings-demo) for the same numbers in a CLI


For the measured counterpart (an actual engine run, not sliders): `cd ../reference && npx tsx scripts/measured-run.ts`.
