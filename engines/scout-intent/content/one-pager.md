# Scout Intent — One-Pager

**Choose the right move before you act.** Intent sensing. Risk checks. Tool routing. Recommended action.

## What it is

A runtime decision layer between user input and execution. Senses intent, checks risk, routes tools, picks the model, emits a signed execution contract that downstream engines verify.

## What it solves

Every agent stack grows a routing-and-policy layer. It starts as three if-statements and ends as the buggiest part of the codebase. Scout pulls that layer out into a first-class engine with a tested decision pipeline.

## Five-stage pipeline

1. **Sense** — classify intent with confidence bands
2. **Interpret** — bind entities and parameters
3. **Guard** — injection, policy, scope, PII
4. **Route** — capability graph → tool plan
5. **Recommend** — pick model profile + sign the contract

## What's in the box

- Intent registry — declared catalog of behaviors
- Two-stage scorer — deterministic trigger scan (< 16 ms) + optional hybrid rescoring, with confidence bands
- Policy pack — injection detection, RBAC, scope, PII
- Capability graph — abstract verbs resolve to concrete tools at runtime
- Model profiles — cheap fast, capable, local-first, with cost ceilings
- Signed execution contracts — downstream engines refuse unsigned plans
- **Locked regression set** — versioned fixtures gating every release

## Composes with the Meterless stack

- Sits in front of every other engine
- Issues contracts to **H-MEM**, **World Model**, **Markovian**, **Swarm**
- Engines verify and refuse out-of-scope contracts at the boundary
- Telemetry feeds learning loop, never raw prompts

## Why it's different

- Decisions are scored, not "AI-vibes"
- Releases are gated by metrics
- Adversarial corpus included
- Apache 2.0-licensed. Yours forever.

## Adopt it

This repository is the implementation spec — `@meterless/scout` is not yet published to npm. Start with the specified API in the [Quickstart](../README.md#quickstart), build against the docs, and gate your implementation with the bundled eval harness.

[Quickstart →](../README.md#quickstart) · [Workshops →](../workshops) · [Evals →](../evals)
