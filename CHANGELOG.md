# Changelog

## scout-intent-v1.0.0

### Added

- Scout Intent engine drop at `engines/scout-intent/`: the five-stage decision pipeline spec (Sense, Interpret, Guard, Route, Recommend), signed execution contracts, the intent registry contract, two-stage scoring with canonical confidence bands, the guard stack, capability graph, and model routing. Includes a newly authored AGENTS.md, 9 deep-dive docs, 11 examples, 4 workshops, and a REAL runnable eval harness (32-example locked regression set, seven gated metrics with per-slice floors, `SCOUT_IMPL` injection). Fixed a Windows path bug in the eval runner (file:// URL imports).

## [Unreleased]

### Added

- Flagship monorepo consolidation. Engine specs migrated from their standalone repos: H-MEM to `engines/hmem/`, World Model to `engines/world-model/`, Markovian Engine to `engines/markovian/`. Clean import; original repos remain as redirects until archived.
- Product documentation for Gaia, Relay, and Swarms migrated into `docs/products/` and scrubbed: dead repo references removed, standalone-product framing rewritten to one-architecture positioning, an "Engines inside" section added per product.
- Root narrative layer: README, AGENTS.md router, llms.txt, CONTRIBUTING, ROADMAP, SECURITY, CODE_OF_CONDUCT.
- Focused-clone (degit) commands at the top of each engine README.
