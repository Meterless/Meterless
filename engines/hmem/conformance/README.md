# H-MEM Conformance Suite

Answers the question the spec model leaves open: did your (or your coding agent's) implementation get it right?

## Run against the reference

```bash
cd ../reference && npm install   # once
npx tsx ../conformance/runner.ts
```

## Run against YOUR implementation

```bash
HMEM_IMPL=/abs/path/to/your/index.ts npx tsx runner.ts
```

On Windows, use forward slashes and an absolute path. The module must export an `HMEM` class (constructor `{ clock }`, `add`, `query`, `feedback`, plus the `store`, `ledger`, `sleep`, `dreaming`, `conflicts` services).

## What it checks

The exact tier of the spec: arithmetic the spec fully determines (formulas, deltas, thresholds), boundary rulings, and behavior contracts (what must never happen). Absolute retrieval scores depend on your embedder and are not asserted; ordering is asserted only where the spec makes it embedding-independent.

Exit codes: 0 all checks pass, 1 at least one check failed, 2 the implementation could not be loaded.

An implementation is done when this suite is green. Ambiguities the suite resolves are documented in each check's description; disagree by opening an engine-spec-feedback issue.
