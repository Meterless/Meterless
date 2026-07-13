# H-MEM Compared

Where H-MEM sits relative to the things people reach for instead — and why each alternative leaves one of the three failure modes (stale facts, black-box recall, memory rot) unsolved.

---

## H-MEM vs. a vector store

| Dimension | Vector store | H-MEM |
| --- | --- | --- |
| Primary object | Embedding | Memory record (content + provenance + lineage) |
| Recall | Cosine similarity | 8-signal hybrid ranking |
| Provenance | Weak or none | `source`, `confidence`, `derivedFrom`, `supersedes` |
| Lifecycle | None | Capture → enrich → retrieve → dream → sleep |
| Corrections | Manual delete/upsert | Detected, scored, audited resolution |
| Maintenance | Manual reindex | Preview-first sleep with backup/restore |
| Auditability | None | Append-only trust ledger |

A vector store is a *component* of H-MEM, not a competitor. H-MEM uses one underneath for the semantic signal — it is 0.35 of the score, not the whole score.

## H-MEM vs. chat history / context window

Chat history stores **what was said**. H-MEM stores **what is reusable**, extracted from what was said. A 200-turn history re-paid every request is not memory — it is a transcript with a token bill. H-MEM mines the three durable facts out of those 200 turns and leaves the pleasantries behind.

## H-MEM vs. a notes / knowledge base

Notes are human-authored, human-maintained, and human-trusted. H-MEM is **mined, enriched, ranked, consolidated, and audited for agent use** — and it never trusts a memory just because it exists. Trust is earned through use and feedback, and every change is on the record.

## H-MEM vs. fine-tuning

Fine-tuning bakes knowledge into weights: slow to update, impossible to correct precisely, impossible to audit, and it forgets nothing safely. H-MEM keeps knowledge **external, correctable, and explainable**. A user correction takes effect on the next query, not the next training run.

## H-MEM vs. the Meterless siblings

These compose; they do not compete.

| Engine | Gives the agent | Relationship to H-MEM |
| --- | --- | --- |
| **World Model** | Shared application state | H-MEM remembers; World Model holds the live truth |
| **Scout Intent** | What should happen next | Decides; H-MEM informs the decision with context |
| **Markovian Engine** | Long work in bounded chunks | H-MEM context enters chunk 0; completions mine back as `plan_completion` |
| **Agent Orchestration** | Many agents → governed outcome | H-MEM attaches to run settings; merged output mines back |

```text
User / Event → Scout Intent → H-MEM + World Model → Markovian / Swarm → Verified output → back into H-MEM
```

## The one-line summary

A vector store can tell you *what* it returned. Only an audited memory architecture can tell you *why it believed it, who changed it, and when.*

See also: [`one-pager.md`](one-pager.md) · [`launch-post.md`](launch-post.md) · architecture [`docs/architecture.md`](../docs/architecture.md)
