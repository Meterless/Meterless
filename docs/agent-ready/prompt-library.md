# Prompt library

Meterless is open source on GitHub, so any assistant that can read a link can read this repo and act on it. Copy a prompt below into ChatGPT, Claude, Cursor, Copilot, Gemini or Claude Code. The full library of 49 prompts, grouped as Ideate, Implement, Combine, Harden and Power, lives at [meterless.ai/engines](https://www.meterless.ai/engines.html). These are the starters.

## Start here: the one prompt

Works in any AI. Your AI reads the repo, asks what you are building, and hands you the fastest path to a working result.

```text
Read the Meterless open-source repo at https://github.com/meterless/meterless. Start with llms.txt and README.md, then AGENTS.md.

1. In five plain-language bullets, tell me what Meterless is, what Nightshift does, and what each engine does (H-MEM, World Model, Markovian, Scout Intent).
2. Ask me three short questions about what I'm building.
3. From my answers, recommend the one engine, template or Meterless integration I should try first, and give me the exact steps to get it running.
```

## Ideate · find my best use case

Any chat AI. A short interview, then five ideas ranked by effort and payoff.

```text
Read https://github.com/meterless/meterless (start with llms.txt and docs/architecture/why-meterless.md). Then interview me: ask about my job, the tools I use every day, and the AI tasks that frustrate me.

From my answers, propose five things I could build with the Meterless engines. Rank them in a table by effort, payoff, and which engines each one uses. Tell me which one to start with and why.
```

## Implement · run the 90-second proof

Cursor, Claude Code or Copilot. Cold run versus warm run, on your machine, with no API keys.

```text
Clone https://github.com/meterless/meterless and run the cold-vs-warm memory demo from the repo root:

npx tsx examples/memory-compounding-research/index.ts

No API keys are needed. Then explain the output to me: what the warm run remembered, why it finished in fewer chunks, and which engine files made that happen.
```

## Combine · memory plus long tasks

H-MEM recall carried into every Markovian chunk.

```text
Wire H-MEM into the Markovian loop in this codebase. Start by running the cross-engine demo in https://github.com/meterless/meterless:
npx tsx examples/memory-compounding-research/index.ts

Then read engines/markovian/examples/markovian-with-hmem and engines/hmem/examples/markovian-handoff. Each chunk recalls what memory knows before it starts, and writes back what it learned when it ends. You are done when both conformance suites pass and a second run of the same task needs fewer chunks than the first.
```

## Harden · block prompt injection

Scout's injection guard, measured against its own targets.

```text
Harden this codebase against prompt injection with Scout Intent. Read engines/scout-intent/docs/risk-and-policy.md and workshops/02-block-an-injection.md at https://github.com/meterless/meterless, and run examples/prompt-injection-block.

Route every untrusted input (web pages, files, tool results) through the guard before it reaches the model. Then run npm run evals:injection and report precision and recall against the targets in evals/config/thresholds.yaml (0.95 and 0.90). List every miss and fix the ones you can.
```

## Power · add Meterless as a provider

Text modes in any app, with the real token and an honest offline state. The full prompt is in [add-meterless-provider.md](add-meterless-provider.md).

## Ideate · weekend hackathon ideas

Ten agents one person can ship, with a demo script for the best three.

```text
I want to build something for the Open Agent Hackathon (Oct 15 to 20, 2026). Read https://github.com/meterless/meterless, especially docs/community/hackathon-guide.md and templates/agentathon-starter/README.md.

Give me ten agent ideas one person can ship in a weekend on the agentathon starter. For the top three, include: the problem, which engines it uses, a simple architecture, and a two-minute demo script that would impress judges.
```
