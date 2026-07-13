# 03 · Mine From Document

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

Chat mining ([02](../02-mine-from-chat/README.md)) extracts from a turn. Document mining extracts durable knowledge from imported files — policies, specs, runbooks — and keeps file provenance so any mined fact traces back to its source line of origin.

Prerequisite reading: [`docs/mining-pipeline.md`](../../docs/mining-pipeline.md), [`docs/privacy-and-local-first.md`](../../docs/privacy-and-local-first.md).

---

## Scenario

A 4 KB onboarding policy is imported:

```text
/docs/onboarding-policy.md

New engineers must complete security training before any system access.
Production deploy access requires explicit manager approval.
All onboarding tasks must be finished within the first 10 business days.
The buddy program is optional but recommended.
```

We want the reusable, durable rules — not the prose, not the optional fluff.

---

## Walkthrough

### TypeScript

```ts
await mining.ingestDocument({
  path: "/docs/onboarding-policy.md",
  content: fileContents,
  maxTokens: 8000          // truncate to a safe window before extraction
});
```

The document extraction prompt asks for **reusable facts, preferences, and technical knowledge** — not a summary:

```text
SYSTEM: Extract durable, reusable facts and policies from this document.
Return a strict JSON array of concise statements.
Prefer rules, requirements, constraints, and decisions.
Skip recommendations, examples, and narrative.

USER: <truncated document content>
```

### Python

```python
await mining.ingest_document(
    path="/docs/onboarding-policy.md",
    content=file_contents,
    max_tokens=8000,
)
```

---

## Expected memories

```text
1. New engineers must complete security training before any system access.
   type=factual  layer=working  tags=source:doc:onboarding-policy.md, policy:onboarding

2. Production deploy access requires explicit manager approval.
   type=factual  layer=working  tags=source:doc:onboarding-policy.md, policy:access

3. All onboarding tasks must be finished within the first 10 business days.
   type=factual  layer=working  tags=source:doc:onboarding-policy.md, policy:onboarding
```

The "buddy program is optional but recommended" line is **not** stored — it is a recommendation, not a durable rule.

## Expected ledger entries

```json
[
  {"memoryId":"mem_sec_training","action":"create","actor":"mining:doc",
   "details":{"path":"/docs/onboarding-policy.md","extractor":"model"}},
  {"memoryId":"mem_deploy_approval","action":"create","actor":"mining:doc",
   "details":{"path":"/docs/onboarding-policy.md","extractor":"model"}},
  {"memoryId":"mem_onboard_10d","action":"create","actor":"mining:doc",
   "details":{"path":"/docs/onboarding-policy.md","extractor":"model"}}
]
```

---

## Why it matters

- **Provenance is mandatory.** Every mined memory is tagged `source:doc:onboarding-policy.md`. When the agent later says "you need manager approval to deploy," an operator can trace the claim to the exact source document.
- **Truncate before extraction, not after.** `maxTokens` bounds the model window so a huge file cannot blow the context budget. Long documents should be chunked and mined per chunk, each chunk keeping the same provenance tag.
- **Working layer, not long-term.** Imported policy is candidate knowledge until it earns durability through use. It is not auto-trusted just because it came from a file.
- **Privacy guardrail.** Do not store full sensitive documents as memory. Extract the reusable rule; tag confidential source material; never reinject raw document text without redaction (see [`docs/privacy-and-local-first.md`](../../docs/privacy-and-local-first.md)).

## Next

[`04-retrieve-and-reinject`](../04-retrieve-and-reinject/README.md) — putting these mined memories back into a prompt with trace metadata.
