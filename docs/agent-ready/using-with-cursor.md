# Using Meterless with Cursor

The engines are AGENTS.md-driven implementation specs. Cursor reads AGENTS.md files natively, so the workflow is the same as any agent-ready repo.

## Implement an engine

1. Clone one engine folder into a fresh directory:

```bash
npx degit meterless/meterless/engines/world-model my-world-model
```

2. Open the folder in Cursor.
3. In Agent mode, prompt: "Implement the World Model engine in this project following AGENTS.md."

The engine's AGENTS.md carries the full contract: architecture, service boundaries, data shapes, and the build order. The examples and docs folders inside the engine give the agent reference material without leaving the folder.

## Work on this repo itself

Start from the root [AGENTS.md](../../AGENTS.md). It routes by task type to a single folder. Keep context small: one engine folder at a time, and skip the other engines unless the task spans them.
