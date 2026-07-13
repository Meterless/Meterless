# Contributing to Scout

Thanks for being here. Scout is an Apache 2.0-licensed engine in the Meterless stack and contributions are very welcome.

## Ways to help

- **Use it and report bugs.** Especially decision bugs — Scout decided X when it should have decided Y. Include the prompt, user role, surface, and what you expected.
- **Add adversarial examples.** A real-world injection that slipped past the default policy pack is gold. Add it as a JSONL example in `evals/regression-set/v1/injection/`.
- **Improve docs and workshops.** Whatever confused you, fix it.
- **New intent / policy / capability libraries.** Domain-specific bundles (CRM, fintech, regulated industries) are great as separate packages that depend on `@meterless/scout`.

## Getting set up

```bash
npx degit meterless/meterless/engines/scout-intent my-scout-intent
cd my-scout-intent
npm install
```

This folder is the implementation spec; there is no `src/` directory, by design, and `@meterless/scout` is not published. The eval harness runs against an implementation of the specified API:

```bash
SCOUT_IMPL=/abs/path/to/your/scout npm run evals
```

The first `evals` run against your implementation is your baseline. Doc, fixture, and workshop contributions need no implementation at all.

## PR conventions

- **Every behavior change adds eval examples.** A new intent: 5+ examples. A new pattern: 3+ adversarial examples. A bug fix: a regression example that fails without the fix.
- One concern per PR.
- Tests colocated with source.
- Doc updates land in the same PR as the behavior change.

## What we won't merge

- Threshold lowering to make a failing build pass. If a metric is below the floor, fix the underlying issue.
- Decision logic embedded in agent code instead of the registry/policy/capability layer.
- Logging the raw prompt by default in telemetry.
- Anything that breaks signature verification at downstream boundaries.

If you're not sure, open a discussion before writing the code.

## Code of conduct

Be kind. Disagreements about code are fine. Disagreements about people aren't.

## License

By contributing you agree your contributions are Apache 2.0-licensed.
