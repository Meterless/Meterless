# Memory Compounding, Demonstrated

The same 12-step research task runs twice with the same deterministic mock generator. The cold run starts blank and works all 12 steps. The warm run first mines three prior work sessions into H-MEM; the reinjected memory context enters chunk 0 of the Markovian chain, and the run skips the four steps the team already settled. Mock LLM, real engines.

![Demo: cold vs warm run comparison](demo.gif)

## Run it (90 seconds, no API keys)

```bash
# once, from the repo root:
cd engines/hmem/reference && npm install
cd ../../markovian/reference && npm install
cd ../../..

# the demo:
npx tsx examples/memory-compounding-research/index.ts
```

Expected result: the cold run takes 12 chunks; the warm run takes 8. The comparison table reports the saved chunks and estimated tokens (chars/4, labeled). Output is deterministic; run it twice and diff.

## What each engine does

| Engine | Role in this demo |
|---|---|
| [H-MEM](../../engines/hmem/) | Mines the three prior sessions (model-free path), ranks memories for the task with the hybrid formula, formats the reinjection block with provenance. The session 2 correction outranks the superseded session 1 claim. |
| [Markovian](../../engines/markovian/) | Runs the chunked chain: memory context enters chunk 0 only, compressed carryover maintains continuity, and the accounting shows the saving. |

## Why this is the stack's thesis in one file

Agents fail on thin context, not weak models. The warm run is not smarter; it simply remembers. Durable local memory plus bounded reasoning turns yesterday's work into today's head start, and the saving compounds every session.

Swap in a real provider by replacing the `generator` option with a function that calls your model; the engines do not change.
