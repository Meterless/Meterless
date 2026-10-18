# Introducing H-MEM

## Most "AI memory" is a vector store with a summarizer attached

That works in a demo. After it ships, teams hit three problems:

1. **Stale facts.** The agent confidently uses something the user corrected two weeks ago.
2. **Black-box recall.** Nobody can answer "why did the model know that?" This includes support, the user, and you.
3. **Memory rot.** The store grows, retrieval gets noisier, latency creeps, quality decays.

A bigger embedding model does not fix any of these. They are architecture problems.

## H-MEM is the architecture

H-MEM treats memory as an audited knowledge graph with provenance instead of a pile of vectors.

- **Tiered.** Short-term (volatile), working (active local), long-term (validated durable). A forgetting curve decays the volatile tiers.
- **Mined.** Memory is extracted from chats, corrections, files, plans, and model responses, with a no-model fallback so input is never silently lost.
- **Enriched.** Every record carries domain, namespace, entities, relationships, source, confidence, and lineage.
- **Hybrid-retrieved.** Eight signals: semantic, keyword, tag, domain, entity, layer, recency, supersession. Cosine similarity is one of them.
- **Reinjected with trace.** The model gets grouped context; the operator gets the reason every item was selected.

## It also dreams and sleeps

Vector stores do not have these cycles.

**Dreaming builds.** It clusters related memories and proposes higher-order knowledge: insights and invariants that no single memory states. Nothing materializes without human approval, and every approved proposal carries `derivedFrom` lineage back to its sources. Every belief records where it came from.

**Sleep maintains.** It previews what to consolidate, archive, or synthesize, runs only the approved plan, backs up first, and writes every action to the ledger. Guardrails refuse to archive relationship hubs, derived memories, or superseding records.

## The trust ledger is the thesis

Every mutation is an append-only ledger entry. That covers create, read, update, delete, feedback, promote, conflict resolution, sleep action, dream approval, and restore. Ask "why did the agent say March 14?" and you get a five-line forensic trace: mined from a correction, conflicted with the stale value, resolved by a named human, retrieved at a known score, marked helpful, consolidated with a backup id.

Memory that ships to real users needs this kind of trace.

## What it is not

Not a vector database (it uses one underneath). Not a chat-history summarizer. Not a notes app. Not a replay/time-travel engine. Not provider-locked: the architecture is portable across TypeScript, Python, Rust, or whatever you ship.

## The line

> Agent memory should learn from use, change over time, and explain itself.

H-MEM is Apache 2.0. Read the [architecture](../docs/architecture.md), run the [lifecycle demo](../demos/memory-lifecycle-visual/README.md), ship the [first production slice](../docs/practical-how-to.md).
