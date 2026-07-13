# The intent layer is the missing piece

Most agent stacks built today have one thing in common: a slowly accreting pile of routing logic, prompt-injection guards, tool selectors, model pickers, and policy checks sitting between the user and every action the agent takes. It starts as three `if` statements. It ends as the buggiest layer in the codebase.

The architecture problem is that the decision logic — *which intent did the user want, can they do this, with what tool, on what model* — is treated as glue instead of as infrastructure. It gets re-implemented in every agent. It never has a clear contract. It can't be tested with the same rigor as the model calls it gates.

Scout is that layer, **built as a first-class engine** instead of accumulated as glue.

## What it does

Before any model runs, before any tool fires, before any swarm spins up, Scout senses the intent, checks the risk, routes the tools, picks the model, and emits a signed execution contract. Then the action runs. With the contract in hand, every step is auditable.

That contract is the single most important property in the design. Downstream engines — Swarm, Markovian, H-MEM, World Model — refuse to act on anything that doesn't carry one. Misrouted plans get refused at the boundary, not after they've already done damage.

## Why it has evals as a first-class asset

Decision systems need decision-quality tests. Scout's whole reason for existing is making the right call before action, so the locked regression set, the gated CI, the slice reports, and the adversarial corpus are first-class deliverables of the repo.

Seven metrics gate every release: intent top-1 accuracy, top-3 recall, injection precision and recall, tool selection precision, clarification rate, user override frequency. None of them are vibes. All of them are computed against a versioned corpus. A PR that drops a metric below floor doesn't merge.

This is the unique asset of the repo. Documentation explains decisions. Evals enforce them.

## Why it's different from a prompt template

Prompt templates put the routing logic inside the LLM call. That works for a demo. It does not work for a system that needs to enforce data-class constraints, refuse out-of-scope tools, gate releases by accuracy, and replay a six-month-old decision when a customer asks why their account got touched.

The decision layer needs to be **outside the model** — structured, scored, signed, replayable. That's what Scout is.

## How to start

Pick three intents your system needs. Write 5 examples per intent. Run Workshop 01. You'll have a working classifier in 30 minutes and a regression set in another 30.

Then plug it into your stack. The execution contract is the only handshake every downstream engine needs.

The decision layer is yours.

[Get started →](../README.md)
