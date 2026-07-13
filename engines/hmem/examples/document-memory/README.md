# Scenario · Document Memory (Corpora & Re-Ingest)

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

[`03-mine-from-document`](../03-mine-from-document/README.md) mines one small file. Real document memory means **corpora**: large files that must be chunked, documents that get re-imported when they change, and source material that must never leak verbatim into a prompt.

Prerequisite reading: [`docs/mining-pipeline.md`](../../docs/mining-pipeline.md), [`docs/privacy-and-local-first.md`](../../docs/privacy-and-local-first.md).

---

## Chunking a large document

A 60 KB architecture spec exceeds the extraction window. Chunk it, mine per chunk, keep one provenance tag across all chunks:

```ts
const chunks = splitByTokens(fileContents, 8000);   // safe windows
for (const [i, chunk] of chunks.entries()) {
  await mining.ingestDocument({
    path: "/docs/architecture-spec.md",
    content: chunk,
    maxTokens: 8000,
    chunkIndex: i,
    chunkCount: chunks.length
  });
}
```

Every memory mined from any chunk is tagged `source:doc:architecture-spec.md` — provenance is per *document*, not per chunk, so a later trace points at the file, not an internal offset.

## Re-ingest when the document changes

The spec is edited and re-imported. Naive re-mining would create duplicates. The correct flow:

```text
re-import architecture-spec.md
  -> mine candidates
  -> for each candidate: similarity check vs existing memories with same source tag
       - near-identical  -> skip (no-op, no ledger noise)
       - changed value   -> supersession signal -> conflict resolution
       - new             -> store.add
  -> stale memories whose facts vanished from the doc -> flagged for sleep review
```

This is why document memories carry a stable `source:doc:` tag: re-ingest can reconcile against prior extractions instead of blindly duplicating.

## Guardrails

| Guardrail | Why |
| --- | --- |
| Preserve file provenance on every memory | Trace any claim back to the source document |
| Never store the full document as memory | A doc is source material, not a memory; bloats retrieval |
| Tag confidential source material `private` | Blocks it from un-redacted reinjection |
| Extract rules, not narrative | Recommendations/examples are not durable knowledge |
| Reconcile on re-ingest | Prevents duplicate-memory rot |

---

## Why it matters

- **Provenance survives chunking.** An operator asking "where did this requirement come from?" gets the document, never an opaque chunk id.
- **Re-ingest is reconciliation, not re-insert.** Documents change. Treating re-import as a fresh mine is a primary source of memory rot; similarity-checking against the source tag is the fix.
- **Documents are private by default.** Imported files are treated as sensitive source material. The mined *fact* can be reused; the raw text cannot be reinjected without redaction.

## Related

- Single-file walkthrough: [`03-mine-from-document`](../03-mine-from-document/README.md)
- Duplicate cleanup: [`sleep-consolidation`](../sleep-consolidation/README.md)
