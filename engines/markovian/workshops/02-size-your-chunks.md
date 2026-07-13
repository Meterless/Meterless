# Workshop 02 — Size your chunks

**Time:** 30 minutes
**You'll leave with:** the right chunk config for your task shape and a feel for the trade-offs.

## The four knobs

| Knob | What it controls | When to raise it | When to lower it |
|---|---|---|---|
| `chunkSize` | Per-call budget | Bigger model, complex steps | Smaller model, simpler steps |
| `maxChunks` | Hard stop on chain depth (max 32) | Genuinely long chains | Tight, predictable chains |
| `carryoverTokens` | State across chunks | Decision-heavy, state-heavy work | Information-light, creative work |
| `overlapTokens` | Continuity hint (`[OVERLAP]` block) | Long-form writing, code | Most tasks (keep at 0) |

(Framing — goal + system prompt — is an engine constant of ≈400 tokens for validation purposes; keep your actual framing tight and stable since it's paid every chunk.)

## Step 1 — Profile your task (10 min)

Three questions:

1. **What's the average per-step output?** If steps produce ~500 tokens, your `chunkSize` can be smaller. If steps produce ~3000 tokens, you need headroom.
2. **What state has to cross?** Decisions, entities, open questions — pin them. Worked examples — drop them.
3. **What model are you using?** Set `chunkSize` to 60-75% of the context window.

Write the answers down. They'll tell you the config.

## Step 2 — Start at the default and watch (10 min)

```ts
const markovian = new Markovian({
  chunkConfig: { chunkSize: 6000, carryoverTokens: 800 },
});

// run your task
```

Check `run.stats`:

- `cascadeLevelsUsed > 1` on most chunks → carryover is bloating, raise `carryoverTokens` *or* tighten what the model emits
- Per-chunk tokens-in plateaus → working as designed
- Per-chunk tokens-in rises → framing or carryover is leaking; fix the marker emission

## Step 3 — Compare three configs (10 min)

```ts
const configs = [
  { label: "tight", chunkConfig: { chunkSize: 4000, carryoverTokens: 400 } },
  { label: "default", chunkConfig: { chunkSize: 6000, carryoverTokens: 800 } },
  { label: "loose", chunkConfig: { chunkSize: 10000, carryoverTokens: 1600 } },
];

for (const { label, chunkConfig } of configs) {
  const m = new Markovian({ chunkConfig });
  const r = await m.run({ goal: yourGoal, stepFn: yourStepFn, stopWhen: yourStop });
  console.log(`${label}: ${r.chunks.length} chunks, ${r.stats.totalTokensIn} tokens in, ${r.stats.efficiency}% saved`);
}
```

Run each. Compare total tokens, chunk count, and the quality of the final output.

## What you learned

- Defaults are a starting point, not a destination.
- Bigger isn't automatically better.
- Carryover budget is the most consequential knob.
- The right config depends on the task shape, not the model.

## Next

[Workshop 03 — Tune the compression cascade →](./03-tune-compression.md)
