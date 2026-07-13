# 01 · Add Memory

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

The smallest useful H-MEM operation: turn one statement into a governed, audited memory record.

Everything else in H-MEM — retrieval, dreaming, sleep, conflict resolution — operates on records created by this step. If `add` is not auditable, nothing downstream can be trusted.

Prerequisite reading: [`docs/memory-record.md`](../../docs/memory-record.md), [`docs/trust-ledger.md`](../../docs/trust-ledger.md).

---

## Scenario

A user states a durable preference in passing:

```text
The user prefers pnpm over npm for this project.
```

We want this captured as a `preference` memory, enriched, and written to the trust ledger in one mutation.

---

## Walkthrough

### TypeScript

```ts
import { MemoryStoreService } from "../../services/memoryStore";
import { TrustLedgerService } from "../../services/trustLedger";

const ledger = new TrustLedgerService({ db });
const store = new MemoryStoreService({ db, ledger });

const memory = await store.add({
  content: "The user prefers pnpm over npm for this project.",
  type: "preference",
  layer: "working",          // not session-only, but not yet validated
  confidence: 0.9,           // stated directly, but still inferred intent
  source: "manual:user:42",
  tags: ["tech:frontend"],
  entities: [
    { name: "pnpm", type: "technology" },
    { name: "npm",  type: "technology" }
  ]
});

console.log(memory.id, memory.domain, memory.namespace);
```

### Python

```python
from hmem.services import MemoryStore, TrustLedger

ledger = TrustLedger(db=db)
store = MemoryStore(db=db, ledger=ledger)

memory = await store.add(Memory(
    content="The user prefers pnpm over npm for this project.",
    type="preference",
    layer="working",
    confidence=0.9,
    source="manual:user:42",
    tags=["tech:frontend"],
    entities=[Entity("pnpm", "technology"), Entity("npm", "technology")],
))

print(memory.id, memory.domain, memory.namespace)
```

---

## What `store.add` does internally

`add` is never a raw insert. The store runs the enrichment + audit contract on every write:

```text
validate shape
  -> assign id + timestamps (timestamp, lastAccessed, accessCount=0)
  -> enrich domain         (tags + tech hints + project inference)
  -> enrich namespace      (e.g. tech/frontend)
  -> normalize entities    (cap at 10, dedupe, normalize names)
  -> discover relations    (relatedTo by shared entities/domain)
  -> persist to the tier   (layer = working)
  -> ledger.write(create)  <-- mutation is not "done" until this commits
```

---

## Expected record

```text
id:          mem_pnpm_pref_8f3a
content:     The user prefers pnpm over npm for this project.
type:        preference
layer:       working
domain:      tech/frontend          (inferred)
namespace:   tech/frontend          (generated)
entities:    pnpm (technology), npm (technology)
confidence:  0.9
source:      manual:user:42
tags:        tech:frontend
timestamp:   1730000000000
```

## Expected ledger entry

```json
{
  "memoryId": "mem_pnpm_pref_8f3a",
  "action": "create",
  "actor": "manual:user:42",
  "timestamp": 1730000000000,
  "newState": { "confidence": 0.9, "layer": "working" },
  "details": { "source": "manual:user:42", "enriched": ["domain", "namespace", "entities"] }
}
```

---

## Why it matters

- **`layer: working`, not `long_term`.** A directly stated preference is still inferred intent. Promotion to long-term is earned through repeated access and helpful feedback (see [`docs/tiered-storage.md`](../../docs/tiered-storage.md)), not granted at capture time.
- **`confidence: 0.9`, not `1.0`.** Reserve `1.0` for facts the system observed itself. Extracted or stated-intent memory starts below 1.0 so the ranker and conflict detector can reason about reliability.
- **The create is ledgered.** Without the ledger entry you can never answer "where did this memory come from?" — the first of the three failure modes H-MEM exists to prevent.

---

## Try a variant

| Change | Expected effect |
| --- | --- |
| `layer: "short_term"` | Memory decays under the forgetting curve; not hydrated next session unless promoted |
| Omit `source` | Store should reject — provenance is mandatory |
| `type: "factual"` | Different conflict-detection behavior; factual claims conflict on divergent values |

## Next

[`02-mine-from-chat`](../02-mine-from-chat/README.md) — the same record, but extracted by a model from a raw conversation instead of hand-built.
