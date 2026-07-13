# Scout Intent Agnostic Implementation Guide

## Purpose

This document codifies a production implementation of Scout, the intent detection, risk guarding, and routing engine that runs BEFORE every meaningful action an agentic system takes. It is expressed in platform-neutral terms so any product can implement the same architecture as modular services.

It covers:

- The five-stage decision pipeline (Sense, Interpret, Guard, Route, Recommend)
- The intent registry contract and versioning
- Two-stage scoring with the canonical confidence formula and bands
- The guard stack (injection, policy, scope, sensitivity, rate limits)
- The capability graph and tool-plan assembly
- Model profile routing
- The signed execution contract, the only artifact downstream engines accept
- Telemetry, the learning loop, and the eval gates that ship releases

Every number in this guide is traceable to a file in `docs/`. Where the docs leave a choice open, it is marked `(implementer's choice)`.

---

## 1) Core Design Principles

- **Nothing acts on a raw prompt.** Downstream engines (H-MEM, World Model, Markovian, Swarm) act only on signed execution contracts.
- **If an intent is not in the registry, it cannot be acted on.** The registry is the system's entire surface area; this is the property that prevents scope drift.
- **Deterministic floor, optional intelligence.** Stage-1 scoring is pure rules and always available; Stage-2 model rescoring is an upgrade, never a dependency.
- **Refuse at the boundary.** Scope violations are refused by the executor verifying the contract, not politely discouraged by a wrapper.
- **Clarify when unsure, but clarification is a cost.** The clarification rate has a hard ceiling in the eval gates; a system that always asks is failing, not being safe.
- **Every decision is replayable.** Contracts carry trace IDs; telemetry reconstructs any decision after the fact.

---

## 2) The Pipeline

Five stages, in order, per request:

```
Sense -> Interpret -> Guard -> Route -> Recommend -> ExecutionContract
```

1. **Sense** classifies intent from raw input. Output: top-k scored candidates, never a single label.
2. **Interpret** binds parameters and entity references from the prompt to the top intent, and decides whether clarification is needed.
3. **Guard** runs the policy stack. Output: risk level `low | medium | high | block` plus flags, redactions, and a reason on block.
4. **Route** walks the capability graph to assemble a tool plan.
5. **Recommend** picks the model profile and bundles everything into a signed contract.

The pipeline's public surface (see `docs/architecture.md` quickstart):

```ts
class Scout {
  constructor(options: {
    intentRegistry: string | IntentRegistry;   // file path or composed registry
    policyPack?: string;                        // named policy set, default "default"
    modelProfiles?: string;                     // profiles file
  });

  // Full pipeline: returns { intent, risk, executionContract, ... }
  decide(input: { prompt: string; user?: UserRef; surface: string; context?: unknown }): Promise<Decision>;

  // Sense stage only: returns { candidates: { intent, score }[] }
  classify(input: { prompt: string; surface: string }): Promise<{ candidates: IntentCandidate[] }>;

  // Re-planning with lineage (section 8)
  replan(input: { parent: string; reason: string; state?: unknown }): Promise<Decision>;
}
```

---

## 3) Intent Registry (the catalog)

Canonical record shape (`docs/intent-registry.md`):

```ts
type Intent = {
  id: string;                    // "deal.recover"; category.name grammar
  category: string;              // "deal", "email", "research"
  description: string;           // doubles as the classifier prompt
  parameters: ParameterSchema;   // JSON-schema-style, validated at Interpret
  capabilities: CapabilityRef[]; // abstract verbs, resolved by the graph
  riskClass: "low" | "medium" | "high";
  surfaces: string[];            // where this intent may be invoked
  roles: string[];               // who may invoke it
  examples: string[];            // classifier seeds AND eval fixtures; mandatory
  version: number;               // bump on ANY change; triggers re-eval
};
```

Rules:

- Examples are mandatory. An intent without examples cannot be classified or evaluated.
- Base `riskClass` sets the policy floor; risk is re-evaluated per request but never below the floor.
- `surfaces` and `roles` are enforced at Guard; a viewer-role invocation of an AE-only intent blocks before classification returns.
- The registry carries a `registryVersion`, stamped on every contract, so downstream engines detect drift.
- Loaders: single JSON file, directory of per-intent files, or composition of registries.

Scale reference: the canonical Meterless runtime registry ships 131 intents (31 foundation + 100 expansion) plus 8 topology vectors (`pipeline`, `fan_out`, `debate`, `loop`, `hierarchical`, `star`, `tree`, `mesh`) emitted as `scout_topology_pattern` for orchestrator DAG selection. The registries in this folder's `evals/fixtures/` and examples are deliberately small teaching registries (3-13 intents); do not mistake them for the production catalog.

Anti-patterns: one giant do-anything intent (that is `if (true)`, not Scout); an intent per minor variation (parameterize instead); capabilities embedded in intent logic (they belong in the graph).

---

## 4) Scoring (Sense stage)

Two execution stages, one canonical formula (`docs/scoring.md`).

### 4.1 Stage 1: deterministic trigger scan

- Weighted trigger-word/substring scan over the FULL registry. Pure rules, no model call.
- Winner = highest weighted-match sum; confidence = winner's score as a fraction of matched weight.
- Hard latency budget: a full-registry scan completes in under 16 ms, enforced by a startup self-test over a fixed probe set that fails loudly when exceeded.
- Runs on every keystroke (UI feedback) and on submit (routing).

### 4.2 Stage 2: hybrid rescoring (optional, recommended for routing)

- Small local classifier (embedding model, 50-200 MB, ONNX/WebLLM class) adds semantic similarity.
- Conversation window, active workflow, and retrieved memory add the contextual term.
- If Stage 2 is unavailable (no model, cold start), Stage 1's result stands. Graceful degradation, never a hard dependency.

### 4.3 The canonical formula

```
finalScore(intent) =
  0.40 * lexical(intent)      // trigger phrases, synonyms, n-grams
+ 0.35 * semantic(intent)     // embedding similarity vs intent prototypes
+ 0.20 * contextual(intent)   // recent turns, active workflow, retrieved memory
+ 0.05 * recency(intent)      // used recently in-session
- riskPenalty(intent)         // down-rank intents requesting blocked actions
```

Stage 1 alone yields `lexical` and `recency`; `semantic` and `contextual` default to 0 until Stage 2 runs. The merge is a single dot product. All weights are config data, not code, tunable per surface.

### 4.4 Confidence bands (the load-bearing numbers)

| Band | Range | Action |
|---|---|---|
| High | >= 0.80 | Proceed. Direct routing. |
| Medium | 0.55 - 0.79 | Proceed and log for review; offer "did you mean?" inline |
| Low | 0.40 - 0.54 | Ask for clarification; offer top-3 as options |
| Reject | < 0.40 | Fall back to the safe `GENERAL` intent; explain; never guess a high-risk intent |

Bands are configurable per surface (tighten for high-risk, loosen for low-risk), but these are the canonical defaults and the values the examples and evals assume.

### 4.5 Multi-intent

When two candidates are both in the High band and reference disjoint spans of the prompt, return a plan containing both intents rather than choosing. Secondary intents are everything at or above 0.55 (the Medium floor). Each candidate carries its `span`.

### 4.6 Clarification triggers

Emit a structured clarification (question plus up to 4 options, each mapping to an intent) when ANY of:

1. Top-1 score is in the Low band (0.40 - 0.54).
2. Top-1 and top-2 are within 0.05 of each other in the Medium band.
3. Required parameters cannot be bound from the prompt.
4. The intent is risk-class `high` and confidence is below 0.95.

Clarification rate is a tracked metric with a hard ceiling (section 10).

---

## 5) Interpret Stage

- Bind `parameters` per the intent's schema; coerce and validate types and ranges.
- Bind `references` (entities) from the prompt and context to stable IDs; unresolved required references trigger clarification rule 3.
- Attach `alternates`: the remaining top-k candidates with scores, so downstream surfaces can offer corrections.
- Output feeds Guard unchanged; Interpret never mutates scores.

---

## 6) Guard Stage (risk and policy)

Five independent layers (`docs/risk-and-policy.md`), each returning `pass | warn | block` plus a structured reason:

1. **Injection check.** Multi-layered: known-pattern match (role-confusion markers, embedded control like `</system>`, `[INST]`), role-drift detection, out-of-band tool references (asking for tools not reachable from the current intent's capability set), and an optional small model check. Output includes `kind`, `score`, and `evidence`. Detected injection payloads are NOT logged in full by default; metadata only `(configurable per deployment)`.
2. **Policy gate.** RBAC plus declarative per-intent policy files: allowed roles and surfaces, parameter bounds, denied parameter combinations, and `require-approval` conditions.
3. **Scope check.** Does this intent fit this user, this surface, this session? Registry `surfaces`/`roles` are the floor.
4. **PII / sensitivity.** Redact or block by data class; redactions are recorded on the contract.
5. **Rate limit.** Per user, per intent, per surface `(implementer's choice of limits)`.

Aggregate output: `{ level: "low" | "medium" | "high" | "block", flags, redactions, reason? }`. Any layer's `block` blocks; `warn`s escalate the level. High-risk intents additionally require approval records (section 8).

---

## 7) Route Stage (capability graph)

Intents declare abstract capabilities (`world.query`, `memory.recall`, `swarm.run`, `email.send`); the graph maps each to concrete tools at runtime (`docs/capability-graph.md`). Edges carry availability, latency, cost, and permission annotations.

Selection rules, in priority order:

1. Required permissions: drop tools the user cannot use.
2. Availability: drop offline or rate-limited tools.
3. Surface preference: chat prefers conversational tools, inbox prefers email-first.
4. Cost/latency budget: cheapest tool that meets the latency target.
5. Tie-break: prefer local tools over remote. Local-first is the default.

Output is the ordered `toolPlan: { tool, input }[]`. A capability with no resolvable tool fails routing; the decision either degrades (drop optional steps) or triggers re-planning, never silently substitutes an out-of-scope tool.

---

## 8) Recommend Stage and the Execution Contract

### 8.1 Model routing

Model profiles declare provider, model, context, cost, latency p95, capabilities, and cleared `dataClasses` (`docs/model-routing.md`). The router scores profiles per task: compatibility (function calling, JSON mode, vision) is mandatory; the profile must be cleared for the input's data class; then cost/latency budgets pick among survivors. Sensitive data classes route to local profiles.

### 8.2 The contract (the only thing downstream engines accept)

Shape per `docs/execution-contract.md`:

```ts
type ExecutionContract = {
  contractId: string;            // ULID, monotonic
  parentId?: string;             // re-planning lineage
  traceId: string;               // telemetry correlation
  intent: { primary, parameters, references, confidence, alternates };
  risk: { level, flags, redactions, approvals };
  toolPlan: ToolStep[];
  modelProfile: ModelProfileRef;
  scope: { user, surface, capabilities, deadline?, budget? };
  issuedAt: ISODate;
  expiresAt: ISODate;            // default TTL: 5 minutes
  registryVersion: number;
  policyPackVersion: string;
  signature: string;             // HMAC_SHA256(secret, canonical_json(contract_without_signature))
  signedBy: "scout";
};
```

Hard rules:

- **Signature is mandatory at every boundary, including dev.** Downstream engines verify on receipt and refuse unsigned or tampered contracts. HMAC over the canonical JSON encoding is an integrity check, not cryptographic-grade defense; the signer interface is pluggable for stronger schemes.
- **Contracts expire; default TTL 5 minutes.** Engines refuse contracts past `expiresAt`. Never extend TTL; long-running work refreshes contracts per chunk/phase with the original as `parentId`.
- **Contracts are immutable post-signature.** Adding fields downstream means re-issuing.
- **Scope is enforced by the executor.** Every tool invoked downstream must be inside the contract's `capabilities` set; out-of-scope calls are refused at the executor boundary and logged as `contract.refused`.
- **High-risk contracts carry approval records** (`user-confirm`, `operator-review`); engines verify required approvals before acting.
- **Contracts are a handoff format, not a database.** Persist telemetry; do not build the system of record out of contracts.

### 8.3 Re-planning

When a downstream engine cannot fulfill a step (tool offline, verification failed, threshold tightened), it calls `scout.replan({ parent, reason, state })`. The new contract shares the trace ID; telemetry tracks the chain.

---

## 9) Telemetry and Learning

Structured events at minimum (`docs/telemetry-and-learning.md`, `docs/execution-contract.md`):

```
scout.decision       traceId=... intent=... band=... latencyMs=... stage2=used|skipped
contract.issued      contractId=... intent=... risk=... profile=...
contract.verified    contractId=... engine=...
contract.expired     contractId=... engine=...
contract.refused     contractId=... engine=... reason=scope-mismatch
scout.clarification  traceId=... trigger=low-band|tie|params|high-risk
scout.override       traceId=... from=... to=...   // user corrected the routing
```

The learning loop: every clarification, override, and operator correction is logged; the training set updates nightly; the classifier retrains weekly; the new model passes the eval gates before shipping. Telemetry answers "why did the system do that" for any past decision via trace ID.

---

## 10) Eval Gates (releases are gated, not vibes)

The eval harness (`evals/`, `docs/eval-harness.md`) runs the regression set against any implementation and scores per metric and per slice. Canonical thresholds (`evals/config/thresholds.yaml`):

| Metric | Target | Hard floor/ceiling |
|---|---|---|
| intent_top1 | 0.92 | floor 0.85 |
| intent_top3_recall | 0.98 | floor 0.94 |
| injection_precision | 0.95 | floor 0.90 |
| injection_recall | 0.90 | floor 0.82 |
| tool_precision | 0.88 | floor 0.80 |
| clarification_rate | max 0.15 | hard max 0.25 |
| override_frequency | max 0.08 | hard max 0.15 |

Slice floors prevent aggregate numbers from hiding a tanked slice: intent_top1 has a per-slice hard floor of 0.80 and injection_precision 0.85, sliced by surface, role, intent family, and risk class. Threshold changes require their own PR with historical comparison.

---

## 11) Suggested Service Boundaries

- `IntentRegistryService` (load, compose, validate, version)
- `ScoringService` (Stage-1 scanner with the startup self-test; Stage-2 rescorer; merge)
- `InterpretService` (parameter/reference binding, clarification decisions)
- `GuardService` (the five-layer stack, policy packs)
- `CapabilityGraphService` (graph, availability, tool-plan assembly)
- `ModelRouterService` (profiles, data classes, budgets)
- `ContractService` (issue, sign, verify, expire, replan lineage)
- `TelemetryService` (events, decision replay, learning-loop exports)

---

## 12) Operational Defaults (Recommended)

- Confidence bands: High >= 0.80, Medium 0.55-0.79, Low 0.40-0.54, Reject < 0.40
- Formula weights: 0.40 lexical / 0.35 semantic / 0.20 contextual / 0.05 recency, minus riskPenalty
- Medium-band tie window for clarification: 0.05
- High-risk proceed threshold: 0.95
- Secondary-intent floor (multi-intent plans): 0.55
- Stage-1 full-registry scan budget: 16 ms, self-tested at startup
- Contract TTL: 5 minutes
- Clarification options per prompt: max 4
- Stage-2 classifier: 50-200 MB local embedding model; 20-80 ms client-side typical

---

## 13) Implementation Checklist

- Define the intent registry schema, loaders, and versioning.
- Implement the Stage-1 trigger scanner with the 16 ms startup self-test.
- Implement Stage-2 rescoring behind an availability check; merge with the canonical weights.
- Implement bands, multi-intent span detection, and the four clarification triggers.
- Implement Interpret: schema-validated parameter binding and entity references.
- Implement the five-layer guard stack with structured pass/warn/block output.
- Implement the capability graph with the five selection rules and local-first tie-break.
- Implement model profiles with data-class clearance.
- Implement the contract: canonical encoding, HMAC signing, TTL, verification, replan lineage.
- Emit the telemetry events; wire the learning-loop exports.
- Run the eval harness; ship only above the thresholds.

---

## 14) Explicit Non-Goals

- Scout does not execute anything. It decides, guards, routes, and signs. Executors execute.
- No provider lock-in: Stage-2 models, signers, and tools are all pluggable interfaces.
- No UI assumptions: clarifications and telemetry are structured data; surfaces render them.

---

## Verify your implementation

This engine ships its verification harness. After implementing, point the eval runner at your build and iterate until the thresholds pass:

```bash
npm install
SCOUT_IMPL=/abs/path/to/your/scout/index.js npm run evals
```

The runner (`evals/runner/`) loads the regression set (`evals/regression-set/v1/`), runs each example through your `Scout` (constructor options `{ intentRegistry, policyPack }`, async `decide()`), and reports per-metric scores and per-slice breakdowns against `evals/config/thresholds.yaml`. A release-quality implementation clears every hard floor and ceiling. Disagree with a threshold? Open an engine-spec-feedback issue with historical comparison.
