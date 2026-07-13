# H-MEM Reference Implementation

The spec in [`../AGENTS.md`](../AGENTS.md), made executable. Deterministic, zero runtime dependencies, in-memory with optional JSON persistence. It exists so every example in [`../examples/`](../examples/) runs, and so you can see each contract behave before building your own.

What it is NOT: a production library. The embedder is a deterministic hash mock, storage is a JSON file, and there is no network code. Your implementation replaces every piece of this with your stack; the contracts stay the same.

## Run it

```bash
npm install
npm test
npx tsx ../examples/01-add-memory/index.ts
```

## Layout

| File | Spec section |
|---|---|
| `src/types.ts` | Canonical memory model, ledger actions, operational defaults (sections 2, 9, 13) |
| `src/memoryStore.ts` | Tiered storage, enrichment, relationships (sections 3, 5) |
| `src/memoryMining.ts` | Acquisition pipeline with model-free fallback (section 4) |
| `src/memoryRetrieval.ts` | Hybrid ranking formula, reinjection, feedback deltas (sections 6, 9.2) |
| `src/dreaming.ts` | Clustering and proposals with the approval boundary (section 7) |
| `src/sleepCycle.ts` | Preview-first sleep with guardrails and backups (section 8) |
| `src/trustLedger.ts` | Append-only audit ledger, 17 action types (section 9.1) |
| `src/conflictDetection.ts` | Detection heuristics and the 0.70 auto-resolve gate (section 10) |
| `src/embeddings.ts` | Deterministic hash embedder (swap for a real provider) |

## Determinism

The clock is injectable (`new HMEM({ clock: () => fixedMs })`) and the mock embedder is a pure function of the text, so identical operations produce byte-identical state. Tests and the conformance suite depend on this; keep it true if you extend the reference.
