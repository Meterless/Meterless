# Workshop 02 · Mine and Enrich

**Prereq:** [Lab 01](01-build-the-record.md). **Time:** ~75 min. **Builds on:** the record + ledger contract.

## Outcome

By the end you can turn raw interactions and documents into enriched memories, with a no-model fallback that never drops input.

Reference: [`docs/mining-pipeline.md`](../docs/mining-pipeline.md). Worked examples: [`examples/02`](../examples/02-mine-from-chat/README.md), [`examples/03`](../examples/03-mine-from-document/README.md).

---

## Exercise 1 — Event-specific extraction

Implement `mining.ingest(event)` for the seven canonical event types: `chat_message`, `user_correction`, `file_save`, `file_open`, `file_edit`, `model_response`, `plan_completion`. Each builds a prompt specialized to the event.

```text
build extraction prompt(eventType, content)
  -> generator returns STRICT JSON array of strings
  -> strip markdown fences, parse robustly
  -> validate each (string, length >= 6)
  -> infer type from event
  -> store.add(... layer: working)
```

**Checkpoint:** `"Please keep updates short — blockers and next steps only."` yields **one** memory, not the raw turn, typed `preference`.

## Exercise 2 — The no-model fallback

Wrap `ingest` so a generator failure does **not** lose the input:

```text
try ingest(event)
catch -> store.add({
  content: truncate(event.content, 240),
  type: "general", layer: "short_term",
  tags: ["event:"+type, "fallback:no-model"],
  source: event.source
})
```

**Checkpoint:** with the generator forced to throw, the turn still produces a `short_term` fallback memory and a `create` ledger entry tagged `fallback:no-model`.

## Exercise 3 — Document mining

Implement `ingestDocument({ path, content, maxTokens })`: truncate to a safe window, extract reusable facts (not a summary), tag every result `source:doc:<filename>`.

**Checkpoint:** a policy doc yields the rules but **not** the "optional but recommended" line. Recommendations are not durable knowledge.

## Exercise 4 — Enrichment

After every `add`, run enrichment:

- domain classification (tags → tech hints → project inference → weighted keywords → fallback)
- namespace generation (`tech/frontend`, `work/meetings`)
- entity extraction (normalize names, cap at 10)
- relationship discovery (`relatedTo` by shared entities/domain; `supersedes` by similarity + correction language)

**Checkpoint:** the pnpm preference comes back with `domain=tech/frontend`, `entities=[pnpm,npm]`, and a `supersedes` edge when a correcting statement is mined.

## Exercise 5 — Discussion

1. Why does extracted memory start at confidence ~0.78 while a Lab-01 hand-built record was 0.9?
2. The fallback stores worse data on purpose. Why is that strictly better than dropping the turn? Which failure mode does it defend?
3. Enrichment runs on *every* add, including fallback captures. What goes wrong if you enrich only model-extracted memories?

---

## Done when

- One turn → concise reusable memory, not a transcript.
- Generator failure degrades to audited short-term capture, never silent loss.
- Documents mine rules with `source:doc:` provenance.
- Every memory is enriched with domain, entities, and relations.

Validate against the **Memory mining** eval category in [`evals/tests`](../evals/tests/README.md).

## Next

[`03-retrieve-and-reinject.md`](03-retrieve-and-reinject.md) — get the right memory back at the right moment.
