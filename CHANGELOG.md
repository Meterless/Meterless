# Changelog

## readme-show-first (October 2026)

### Changed

- Rebuilt the root README around showing real output:
  - a centered header with a nav row and social-proof badges
  - a 24-second hero animation made from real overnight output, with each frame's job-log numbers (`docs/images/nightshift-one-night.webp`)
  - the receipt from one published night
  - a "Pick your way in" table
  - an "Open the files" grid linking to the original files on meterless.ai
  - a comparison of a chat, a cloud agent and Nightshift
- Added `docs/images/nightshift-race-clusters.svg`, an animated chart of the four real races drawn from the site's checkpoint data. It is also used in the Nightshift README, with the full data table beneath it.
- Fixed the Morning Desk links. The site's `/Nightshift/KnowledgeWork/` path returns 404; the docs now use `/Benchmarks/KnowledgeWork/`.
- `engines/markovian/docs/reflection.md`: the Cost section now names each mode to match the Mode 0 to 2 headings.

## style-and-visual-polish (October 2026)

### Changed

- Removed every em dash from the repo's Markdown, text and SVG files, about 1,170 in total, most of them in the engine folders. `scripts/check-conventions.mjs` now enforces this repo-wide. Generated eval reports are exempt.
- Rewrote AI-sounding prose across the root docs, the product docs, the experiments, the engine overview pages and all four engine folders. That covers contrast slogans, fragment taglines, hype words, and bold used for emphasis mid-sentence.
- Fixed outdated engine text. The `@meterless/*` imports now say they name your own implementation, since no package is published. References to a `src/` folder that does not exist are gone. The swarm-orchestration and runtime specs are now listed as next on the roadmap.
- Added 16:9 card images so the card grids in the README, the products page and the experiments page line up.
- Regrouped the Nightshift gallery by image shape and removed a duplicate image.
- Product detail pages now have product-specific titles, consistent image widths, and shortcut tables with header rows.

## nightshift-revamp (October 2026)

### Changed

- Repo repositioned around Nightshift, the flagship product. The root README, AGENTS.md, llms.txt, ROADMAP, docs index and architecture docs now lead with Nightshift and the Meterless Runtime, with the open engines as the context layer underneath.
- Gaia, Relay and Swarms reframed as free apps. Their READMEs are rewritten from the current product pages: Gaia v2.4.1, Relay v0.8.8, Swarms v0.9.3.
- `docs/architecture/why-meterless.md` carries the ownership thesis: you own the work, value should compound, the value is in throughput.
- New stack diagram (`docs/images/meterless-stack.svg`) and roadmap timeline (`docs/images/roadmap-cadence.svg`).

### Added

- `docs/products/nightshift/`: overview, how it works, job modes, hotspot, editions and hardware, gallery, and media from real nights.
- `docs/benchmarks/`: summaries of every published benchmark with machine, build, date and failures.
- `docs/architecture/learnings.md`: fifteen lessons from the benchmarks.
- `docs/experiments/`: Meterless City, Sitcomify and DataPlant, with media.
- `docs/agent-ready/add-meterless-provider.md` (Runtime 0.90.0 provider contract) and `docs/agent-ready/prompt-library.md`.
- Relay media from the new Relay page: the AP reconciliation recording, five stage shots, fifteen app-tour screens, and before and after windows.
- `docs/products/gaia/gallery.md` covering every screen and capture in `docs/products/gaia/media/`.
- `docs/images/nightshift-night.svg`: an animated diagram of one night.

## scout-intent-v1.0.0

### Added

- Scout Intent engine drop at `engines/scout-intent/`: the five-stage decision pipeline spec (Sense, Interpret, Guard, Route, Recommend), signed execution contracts, the intent registry contract, two-stage scoring with canonical confidence bands, the guard stack, capability graph, and model routing. Includes a newly authored AGENTS.md, 9 deep-dive docs, 11 examples, 4 workshops, and a REAL runnable eval harness (32-example locked regression set, seven gated metrics with per-slice floors, `SCOUT_IMPL` injection). Fixed a Windows path bug in the eval runner (file:// URL imports).

## [Unreleased]

### Added

- Flagship monorepo consolidation. Engine specs migrated from their standalone repos: H-MEM to `engines/hmem/`, World Model to `engines/world-model/`, Markovian Engine to `engines/markovian/`. Clean import; original repos remain as redirects until archived.
- Product documentation for Gaia, Relay, and Swarms migrated into `docs/products/` and scrubbed: dead repo references removed, standalone-product framing rewritten to one-architecture positioning, an "Engines inside" section added per product.
- Root narrative layer: README, AGENTS.md router, llms.txt, CONTRIBUTING, ROADMAP, SECURITY, CODE_OF_CONDUCT.
- Focused-clone (degit) commands at the top of each engine README.
