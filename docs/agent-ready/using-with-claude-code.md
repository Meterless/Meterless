# Using Meterless with Claude Code

This repo is built to be worked on by coding agents. The engines are AGENTS.md-driven implementation specs: you clone a spec folder into your project and let the agent build it into your stack.

## Implement an engine

1. Clone one engine folder into a fresh directory:

```bash
npx degit meterless/meterless/engines/hmem my-hmem
```

2. Open the folder in Claude Code.
3. Prompt: "Implement the H-MEM engine in this project following AGENTS.md."

The engine's AGENTS.md carries the full contract. The agent does not need any other part of this repo.

## Work on this repo itself

1. Start from the root [AGENTS.md](../../AGENTS.md). It is a router: find your task type, go to the one folder it names, load nothing else.
2. Per-engine AGENTS.md files are full-length. The root one is not a manual.
3. Do not read other engine folders unless the task spans engines. Each engine folder is self-contained.

## Run Claude Code against your own machine

Nightshift turns your Mac or DGX Spark into an AI hotspot. Add Meterless as a provider and Claude Code's requests land on your own hardware. The contract is in [add-meterless-provider.md](add-meterless-provider.md). Read [the hotspot guide](../products/nightshift/hotspot.md) for when local is the right call and when to rent latency instead.

Several Meterless apps also ship MCP servers for Claude Code: Sitcomify (`claude mcp add sitcomify -- node bin/sitcomify.mjs mcp`) and the Relay agent bridge, which lets your agent list windows, click named controls and run saved skills.

## Ready-made prompts

[prompt-library.md](prompt-library.md) has starter prompts for ideating, implementing, combining and hardening the engines.

## Non-coding agents

[llms.txt](../../llms.txt) at the repo root carries the folder map and canonical doc URLs in plain form.
