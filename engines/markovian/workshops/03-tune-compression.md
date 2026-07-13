# Workshop 03 — Tune the compression cascade

**Time:** 45 minutes
**You'll leave with:** a custom compression cascade for your task shape and confidence that the right things are crossing chunk boundaries.

## When to tune

You can ship the default cascade for 80% of tasks. The remaining 20% is when:

- Code-heavy work — function signatures matter more than English explanation
- Research work — citations matter more than synthesis prose
- Multi-account ops — account IDs and stage changes matter more than commentary
- Anything where you've watched the carryover and seen the wrong things get retained

## Step 1 — Identify what should cross (10 min)

For your task, write a list of things that **must** make it into the next chunk:

```
- Account IDs touched this chunk
- Stage transitions
- Open clarifying questions
- Step number / phase
```

And what doesn't have to:

```
- Free-form rationale
- Worked examples
- Repeated phrasing of the goal
```

This list is your compression policy.

## Step 2 — Write a custom cascade (15 min)

```ts
import { Markovian, CompressionCascade } from "@meterless/markovian";

const crmCascade: CompressionCascade = {
  extract: (chunkOutput) => {
    const accountMatches = chunkOutput.match(/account:[a-z0-9-]+/g) ?? [];
    const stageMatches = chunkOutput.match(/stage:\s*\w+/g) ?? [];
    const questions = chunkOutput.match(/<QUESTION>(.*?)<\/QUESTION>/g) ?? [];
    return { accounts: accountMatches, stages: stageMatches, questions };
  },
  rank: (items) => items, // domain order is already priority
  compress: (items, budget) => {
    // Keep all accounts and stages; trim questions if needed
    let used = items.accounts.join("\n").length + items.stages.join("\n").length;
    const room = budget - used;
    items.questions = items.questions.slice(0, Math.floor(room / 60));
    return items;
  },
  format: (items) =>
    `ACCOUNTS: ${items.accounts.join(", ")}\nSTAGES: ${items.stages.join(", ")}\nQUESTIONS:\n${items.questions.join("\n")}`,
};

const markovian = new Markovian({
  chunkConfig: { chunkSize: 6000, carryoverTokens: 800 },
  compressionCascade: crmCascade,
});
```

## Step 3 — Diff before and after (10 min)

Run the same task with the default cascade and the custom one. Diff the carryovers at step 5:

```ts
const diff = markovian.diff(defaultRun.chunks[4].carryoverOut, customRun.chunks[4].carryoverOut);
console.log(diff);
```

The custom version should be denser in the things you care about and thinner in the things you don't.

## Step 4 — Verify the final output is still coherent (10 min)

Compression that drops the wrong things produces final output that misses the wrong things. Read both final outputs. The custom cascade should be at least as good — usually better, because the model isn't fighting unfocused carryover.

## What you learned

- The cascade is small and pluggable.
- "What should cross" is a domain question, not an engine question.
- Diffing carryovers is the debugging primitive.
- Better compression usually produces better final output, not worse.

## Next

[Workshop 04 — Reflect and resume →](./04-reflect-and-resume.md)
