# Contributing to World Model

Thanks for being here. World Model is an MIT-licensed engine in the Meterless stack and contributions are very welcome.

## Ways to help

- **Use it and report bugs.** A working bug report with a minimal repro is the highest-leverage contribution.
- **Improve docs.** If something in `/docs` or `/workshops` confused you, fix it. Doc PRs are merged fast.
- **Add an example.** Examples in `/examples` are the front door for new users.
- **Build a custom view library.** Domain-specific views (CRM, fintech, gaming) are great as separate packages that build on the World Model contract.
- **Extend the control plane.** Custom panels and merge UIs are first-class.

## Getting set up

```bash
npx degit meterless/meterless/engines/world-model my-world-model
cd my-world-model
```

This folder is documentation-first: the spec and its examples describe the engine you build in your own stack. A minimal runnable reference lives in `reference/` (run its tests with `cd reference && npm install && npm test`); it is not a publishable package. Report issues at <https://github.com/meterless/meterless/issues>.

## PR conventions

- One concern per PR. Smaller is faster to merge.
- If a PR adds reference code, include tests for every behavior it claims.
- Doc updates land in the same PR as the behavior change.
- Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.

## What we won't merge

- New write operations on the canonical store outside the five primitives. The write surface is deliberately small.
- View implementations that mutate canonical state.
- Anything that breaks idempotency at the event-log layer.

If you're not sure, open a discussion before writing the code.

## Code of conduct

Be kind. Disagreements about code are fine. Disagreements about people aren't.

## License

By contributing you agree your contributions are MIT-licensed.
