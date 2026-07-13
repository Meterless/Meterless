# The world model is the missing piece

Most AI systems built today are amnesiac. Every conversation starts from zero. Every agent re-discovers what the others already know. Every "context window" is a fresh import of the same domain knowledge, paid for by token.

The fix isn't a longer context window. The fix is a **canonical store with derived views**: a place where entities, contexts, relationships, and facts live, where every write is idempotent, every read is rebuildable, and every change is auditable.

That's what World Model is.

## What it does

You give it entities (the things), contexts (the situations they exist in), and relationships (how they connect). Writes are append-only. State is a fold over the event log. Views are projections — graph, timeline, search, custom — that you can throw away and rebuild from the canonical store at any time.

Agents read from views. Operators inspect and repair through a control plane. Pipelines ingest from sources, with provenance attached to every fact. When something goes wrong, you replay the pipeline. The store doesn't corrupt.

## Why it's different from a knowledge graph

Knowledge graphs are usually edit-in-place: you `MATCH ... SET ... MERGE` and the state moves forward. There's no audit trail unless you build one. There's no replay unless you build one. There's no operator UI unless you build one. There's no schema versioning unless you build one.

World Model is built around the assumption that you'll get the schema wrong, that sources will lie, that probabilistic merges will be wrong, that bug fixes will need replays. It treats those as **normal operations**, not emergencies.

## Why it's different from a vector database

Vector DBs are great at finding similar text. They are not domain models. They don't know what an account is, what a thread is, what a campaign is, or that the campaign has three open deals that haven't been touched in 18 days. World Model does, because that structure is what it was built to hold.

You can — and probably should — use both. Vector DBs for retrieval over corpora. World Model for the entities, contexts, and relationships that the rest of your system actually operates on.

## How to start

Pick a domain you know. Sketch the three or four entity types. Write down the contexts that scope facts. Run Workshop 01. You'll have a working world in 30 minutes.

Then plug it into your agents — or your CRM, or your news pipeline, or your narrative-football simulation that hit Year 145 last week and needs to remember what happened in Year 74.

The world is yours. The model is yours. The store is yours.

[Get started →](../README.md)
