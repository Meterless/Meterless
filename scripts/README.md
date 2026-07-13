# Repo scripts

Quality checks that CI and contributors run locally. Plain `.mjs`, executed with `node` directly, zero dependencies to install.

- `check-links.mjs` verifies every relative markdown link, image path, and flagship-absolute URL resolves in the tree, case-sensitively (Windows and macOS hide casing bugs that break on GitHub).
- `check-conventions.mjs` enforces the repo rules: no empty folders, lowercase kebab-case folder names (folders only, files exempt), root AGENTS.md under 100 lines, no banned references, no root workspace tooling, no em dashes in root-authored prose.
- `run-examples.mjs` runs every engine reference test suite and every runnable example with a timeout, skipping examples that still import unpublished `@meterless/*` packages.

Run all three:

```bash
node scripts/check-links.mjs && node scripts/check-conventions.mjs && node scripts/run-examples.mjs
```

Why plain scripts at the root do not violate the no-root-tooling rule: the consolidation spec prohibits workspace and build tooling at the repo root (package.json, pnpm, turbo), because the flagship is not a buildable package. These files are standalone checkers with no manifest, no dependencies, and no build step. Engine reference implementations keep their own engine-local `package.json`, which is the established pattern.
