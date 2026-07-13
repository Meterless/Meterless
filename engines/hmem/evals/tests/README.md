# H-MEM Community Evals

> No community evals have been submitted yet. Yours can be first.

This folder is for community-created evals, benchmarks, and regression tests for H-MEM.

If you are testing H-MEM on a real project, agent workflow, codebase, knowledge system, customer workspace, research corpus, or long-running chat history, this is the place to share what you learned.

The goal is simple:

> Build a shared eval library that shows how H-MEM performs in the real world, not just in synthetic demos.

We welcome small tests, messy edge cases, failure reports, benchmark writeups, comparison runs, and full regression suites.

## What belongs here

Use this folder for markdown-based evals that test how well H-MEM handles memory over time.

Good contributions include:

- real-project benchmark reports,
- retrieval quality tests,
- memory mining tests,
- stale-vs-current memory tests,
- conflict resolution tests,
- long-context compression tests,
- agent workflow memory tests,
- before-and-after comparisons,
- failure cases H-MEM should learn from,
- regression tests that should not break in future versions.

This is not limited to polished benchmarks. Some of the most valuable evals are small, specific examples where memory either worked surprisingly well or failed in a way others can reproduce.

## Suggested file format

Create a new markdown file for each eval:

```text
evals/
  community/
    your-name-project-type-short-description.md
```

Example:

```text
evals/
  community/
    acme-agent-workspace-auth-memory.md
    research-corpus-retrieval-conflicts.md
    customer-success-account-history-test.md
```

## Community eval template

Use this format when adding a new eval.

````markdown
# Eval: <short descriptive name>

## Contributor

Name or GitHub handle:

## Project type

What kind of project or workflow was H-MEM tested on?

Examples:

- coding agent workspace
- customer success account history
- research knowledge base
- product planning chat history
- support ticket archive
- personal productivity system
- multi-agent workflow
- long-running project memory

## What this eval tests

Describe the memory behavior being tested.

Examples:

- Can H-MEM retrieve the current decision and suppress stale ones?
- Can H-MEM mine useful memories from noisy chat logs?
- Can H-MEM preserve project constraints across long workflows?
- Can H-MEM detect contradictions?
- Can H-MEM reinject only the memories that matter?
- Can H-MEM outperform vector-only retrieval?

## Source material

Describe the test material without exposing private data.

```yaml
source_material:
  files: 120
  chats: 34
  tickets: 0
  decisions: 18
  time_span: "4 weeks"
  domain: "agent coding workspace"
```

Do not include private data, customer secrets, credentials, proprietary code, or sensitive personal information. Redact anything that should not be public.

## Eval setup

Explain how the test was run.

```yaml
setup:
  hmem_version: "optional"
  baseline: "vector-only retrieval"
  retrieval_top_k: 8
  dataset_redacted: true
  run_type: "manual | scripted | CI"
```

## Test cases

Add one or more test cases.

```yaml
- name: retrieve current architecture decision
  input:
    query: "What auth architecture should the agent preserve before making changes?"
  expected:
    should_retrieve:
      - "Current auth flow uses token rotation with server-side session validation."
      - "Do not move refresh token handling into the browser."
    should_suppress:
      - "Old plan to store refresh tokens client-side."
    should_include:
      - provenance
      - confidence_score
      - conflict_status
```

## Results

Share what happened.

```yaml
results:
  passed: true
  strengths:
    - "Retrieved the current auth decision."
    - "Correctly suppressed the stale client-side token plan."
  failures:
    - "Missed one related security note from a planning chat."
  notes:
    - "Hybrid retrieval performed better than vector-only for this case."
```

## What this teaches us

Explain the takeaway in plain English.

Examples:

- H-MEM handled stale decisions correctly.
- H-MEM needs better recency weighting for planning chats.
- Hybrid retrieval beat vector-only when project terminology changed over time.
- Conflict detection worked, but provenance was incomplete.
- Sleep consolidation should preserve relationship hubs more carefully.

## Suggested regression

If this eval revealed a repeatable behavior, add the regression H-MEM should keep passing.

```yaml
regression:
  name: recent planning decision outranks stale implementation note
  should_pass_when:
    - current decision is retrieved
    - stale decision is suppressed
    - provenance is attached
    - trust ledger records the conflict
```
````

## Core eval categories

Community evals can cover any useful memory behavior, but these are the main categories we care about.

| Category | What it tests |
|---|---|
| Memory mining | Can H-MEM extract useful memories from messy inputs? |
| Retrieval quality | Are the right memories returned for the task? |
| Stale memory suppression | Are outdated facts avoided or marked as stale? |
| Conflict detection | Can H-MEM identify contradictions and resolve them safely? |
| Reinjection quality | Are only useful memories reintroduced into the working context? |
| Provenance | Can every retrieved memory be traced back to where it came from? |
| Feedback learning | Does helpful / not helpful / wrong feedback change future behavior? |
| Sleep consolidation | Can H-MEM archive, merge, or synthesize memories without losing important context? |
| Dreaming proposals | Are suggested insights kept as proposals until approved? |
| Trust ledger | Is every memory mutation auditable? |
| Real-project performance | Does H-MEM improve outcomes on actual workflows? |

## Lightweight contribution option

You do not need a full benchmark to contribute.

A simple useful eval can be as small as this:

````markdown
# Eval: Stale launch date correction

## Contributor

@your-handle

## What this eval tests

Whether H-MEM retrieves the corrected launch date and suppresses the old one.

## Test case

```yaml
- name: corrected launch date wins
  input:
    memories:
      - "The launch is planned for March 4."
      - "Correction: the launch moved to March 14."
    query: "When is the launch?"
  expected:
    should_retrieve:
      - "The launch moved to March 14."
    should_suppress:
      - "The launch is planned for March 4."
```

## Result

Passed.

## Takeaway

H-MEM correctly treated the correction as the active memory.
````

## Review process

Submitted evals may be edited for clarity, formatting, privacy, or reproducibility before being added to this folder.

We are especially interested in evals that:

- come from real projects,
- expose failure modes,
- compare H-MEM against a baseline,
- are easy for others to reproduce,
- turn into useful regression tests,
- show where memory improves agent performance.

## Community goal

H-MEM should not be evaluated only by its creators.

This folder exists so builders can test it on the kinds of messy, long-running, real-world workflows where memory actually matters.

If H-MEM fails, share the eval.

If H-MEM beats your baseline, share the eval.

If you find an edge case that breaks memory, share the eval.

Every good eval makes the system better.
