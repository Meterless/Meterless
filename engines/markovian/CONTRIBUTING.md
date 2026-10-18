# Contributing to Markovian

Thanks for being here. Markovian is an Apache 2.0-licensed engine in the Meterless stack. Contributions are welcome.

## Ways to help

- **Use it and report bugs.** Efficiency bugs matter most, for example: "I expected flat per-step cost and got linear growth." Include the chunk config, the carryover sample, and the run history. File issues at <https://github.com/meterless/meterless/issues>.
- **Add a custom compression cascade.** Domain-specific cascades (code, research, CRM) work well as separate packages implementing the cascade interface from [`docs/compression-cascade.md`](docs/compression-cascade.md).
- **Improve the token economics demo.** Better visualizations, model-specific presets, side-by-side mode for real model costs.
- **Add workshops.** Real-world tasks framed as Markovian chains help adoption more than another README pass.

## Getting set up

This folder is documentation-first. The engine contracts live in `AGENTS.md` and `docs/`. There is no `src/` folder and no root `package.json`. The runnable reference implementation and its tests live in `reference/`, and the conformance suite lives in `conformance/`.

```bash
npx degit meterless/meterless/engines/markovian my-markovian
cd my-markovian
```

The token economics demo doubles as a smoke test for the math:

```bash
cd token-economics-demo
npm install
npm run dev
# or open token-economics-demo/index.html in a browser (no build step needed)
```

## PR conventions

- One concern per PR.
- Tests for every behavior change, colocated with source.
- Doc updates land in the same PR as the behavior change.
- Token-accounting changes require an updated efficiency-model worked example.

## What we won't merge

- Compression cascades that drop decisions to fit budgets without warning. Decisions are load-bearing; an overflow event is a typed warning, not a silent drop.
- "Smarter summarization" that rephrases markers as prose. Markers are typed data; keep them that way.
- Adaptive carryover schemes that violate the bounded-cost guarantee.

If you're not sure, open a discussion before writing the code.

## Code of conduct

Be kind. Disagreements about code are fine. Disagreements about people aren't.

## License

By contributing you agree your contributions are Apache 2.0-licensed.
