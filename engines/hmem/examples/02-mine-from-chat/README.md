# 02 · Mine From Chat

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

Example [01](../01-add-memory/README.md) hand-built a record. Real systems do not get hand-built records — they get conversation. This example extracts a reusable memory from a raw chat turn using an event-specific extraction prompt, with a no-model fallback so input is never dropped.

Prerequisite reading: [`docs/mining-pipeline.md`](../../docs/mining-pipeline.md).

---

## Scenario

```text
User: Please keep status updates short. I only want blockers and next steps.
```

This is a `chat_message` event. It contains exactly one reusable preference buried in a polite request. Mining's job is to extract the durable statement, not store the whole turn.

---

## Walkthrough

### TypeScript

```ts
import { MemoryMiningService } from "../../services/memoryMining";

const mining = new MemoryMiningService({ store, generator });

await mining.ingest({
  eventType: "chat_message",
  source: "session:abc",
  content: "Please keep status updates short. I only want blockers and next steps."
});
```

Internally, `ingest` builds an extraction prompt specialized to `chat_message`:

```text
SYSTEM: Extract durable, reusable memories from this chat message.
Return a strict JSON array of concise statements. No commentary.
Capture preferences, personal facts, project facts, and corrections.
Ignore pleasantries and one-off task instructions.

USER: "Please keep status updates short. I only want blockers and next steps."
```

Model returns:

```json
["The user prefers short status updates containing only blockers and next steps."]
```

Each item is validated (string, length >= 6), typed from the event, and added via `store.add`.

### Python

```python
from hmem.services import MemoryMining

mining = MemoryMining(store=store, generator=generator)

await mining.ingest(
    event_type="chat_message",
    source="session:abc",
    content="Please keep status updates short. I only want blockers and next steps."
)
```

---

## The no-model fallback

If the generator is unavailable, **do not drop the turn**. Capture a truncated short-term summary instead, so continuity is preserved and a later run can re-mine it.

```ts
async function ingestWithFallback(event) {
  try {
    return await mining.ingest(event);
  } catch {
    await store.add({
      content: truncate(event.content, 240),
      type: "general",
      layer: "short_term",
      tags: [`event:${event.eventType}`, "fallback:no-model"],
      source: event.source
    });
  }
}
```

---

## Expected memory

```text
content:   The user prefers short status updates containing only blockers and next steps.
type:      preference            (inferred from event: chat_message + intent language)
layer:     working
domain:    work/communication
tags:      event:chat_message, preference:communication
source:    session:abc
confidence: 0.78                 (model-extracted, below stated-intent 0.9)
```

## Expected ledger entry

```json
{ "memoryId": "mem_status_pref_1c2d", "action": "create", "actor": "mining:session:abc",
  "details": { "eventType": "chat_message", "extractor": "model" } }
```

On fallback the entry instead reads:

```json
{ "memoryId": "mem_fallback_9e0f", "action": "create", "actor": "mining:session:abc",
  "details": { "eventType": "chat_message", "extractor": "fallback:no-model" } }
```

---

## Why it matters

- **One turn, one durable statement.** Storing the whole message would pollute retrieval with conversational noise. Mining favors concise, reusable claims.
- **Extracted confidence < stated-intent confidence.** A model paraphrase is less reliable than a direct hand-built record, so it starts lower (`0.78` vs `0.9` in [example 01](../01-add-memory/README.md)). Helpful feedback can raise it later.
- **Fallback preserves continuity.** The second failure mode of agent memory is silent loss. A degraded capture that can be re-mined is always better than a dropped turn.

## Next

[`03-mine-from-document`](../03-mine-from-document/README.md) — extraction from a file instead of a turn, with document provenance tags.
