# Scout Intent Spec Roadmap

> Engine drops and dates live in the [flagship roadmap](../../ROADMAP.md). This file tracks spec versions for this engine only.

What's specified, what's in flight, what's planned.

> This repository is the Scout implementation **spec** — there is no `src/` directory, by design. "Now" below means *specified and covered by the docs, examples, and eval harness in this repo*, not shipped as an npm package.

## Now (v0.1 — specified)

- Five-stage decision pipeline (sense → interpret → guard → route → recommend)
- Intent registry with category, parameters, capabilities, risk class
- Two-stage scoring: deterministic trigger scan (< 16 ms self-test) + optional hybrid rescoring
- Confidence bands and clarification triggers
- Policy packs: injection detection, RBAC, scope, PII redaction (`default`, `enterprise`, `regulated`, `adversarial-tight`)
- Capability graph with availability/cost/latency routing
- Model profile routing with cost ceilings
- Signed execution contracts with 5-minute TTL and tampering detection
- **Regression smoke set** (32 examples) with seven gated metrics and per-slice floors
- Slice reports; illustrative sample report artifact
- Local-first telemetry

## Soon (v0.2)

- Reference implementation (in `reference/`, matching the sibling engines)
- Corpus at documented scale (≥ 50 examples per major intent family; per-class injection files)
- Streaming intent detection (decide as the user types)
- Approval-record management for high-risk intents
- Drift detection alerts
- Custom policy pack composer
- Markdown report generator with diffs
- Local telemetry dashboard

## Next (v0.3)

- Curriculum learning loop from operator overrides
- Multi-modal intent (image + text)
- Distillation of remote classifiers into local models
- Visual policy editor
- Adversarial fuzzer for the eval set

## Later

- Cross-organization shared policy packs (signed, versioned)
- Federated drift detection (aggregates only, never raw prompts)
- Eval marketplace — community-contributed adversarial corpora

[Suggest priorities →](https://github.com/meterless/meterless/issues)
