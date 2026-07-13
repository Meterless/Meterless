# Markovian Reference Implementation

The spec in [`../AGENTS.md`](../AGENTS.md), made executable. Deterministic, zero runtime dependencies. It exists so every example in [`../examples/`](../examples/) runs, and so the efficiency claims in the docs come with a script you can run instead of a chart you have to trust.

What it is NOT: a production library. The generator is injected (mock by default), history persists to a JSON file, and token counts are `ceil(chars/4)` labeled `estimated`. Your implementation swaps in a real provider and real accounting; the contracts stay the same.

## Run it

```bash
npm install
npm test
npx tsx scripts/measured-run.ts
```

`measured-run.ts` runs the same 20-step task through the orchestrator and through a naive full-history baseline with the same mock generator, then prints the cumulative input-token table. Every number carries its label.

## Layout

| File | Spec section |
|---|---|
| `src/types.ts` | Canonical data model, bounds, constants (section 2) |
| `src/markers.ts` | Marker protocol parse and clean (section 3) |
| `src/configManager.ts` | Validation, projection curve, run efficiency, symbolic cost model (sections 4.1, 6) |
| `src/carryover.ts` | Four-level compression cascade (section 4.3) |
| `src/promptBuilder.ts` | Mode templates, chunk-0 memory injection, [OVERLAP] block (sections 4.4, 5, 2.1) |
| `src/orchestrator.ts` | The chain loop, abort, completion, reflection (sections 4.5, 7, 11) |
| `src/progress.ts` | Real-time progress with bounded logs (section 4.6) |
| `src/history.ts` | Persistent runs with mandatory config snapshots (sections 4.7, 14) |

## Contract notes

- `overlapTokens > 0` inserts a real `[OVERLAP]` block into continuation prompts. Accept-and-ignore is a contract violation; this reference implements the block.
- Marker protocol: canonical `[STATE_CHECKPOINT]` and `[TASK_COMPLETE]`, plus the spec's legacy variants, plus the angle-bracket aliases (`<CARRYOVER>`, `<DONE>`, `<PROGRESS>`, `<NEEDS_TOOL .../>`) used by earlier example sketches.
- The spec's per-field `step` values are treated as UI slider granularity, not validation: the spec's own default `carryoverTokens = 800` is unreachable on a strict step-128 grid from min 128, so only min and max are enforced.
- Reflection failure never fails a run; the error is recorded on the run record.
