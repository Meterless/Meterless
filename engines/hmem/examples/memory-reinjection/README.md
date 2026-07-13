# Scenario · Memory Reinjection (Targets & Safety)

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

[`04-retrieve-and-reinject`](../04-retrieve-and-reinject/README.md) covers ranking and the basic grouped format. This scenario covers the parts that matter in production: **where** reinjected context goes (chat is only one target), the **safety filter** that runs before formatting, and **composition with the other Meterless engines**.

Prerequisite reading: [`docs/reinjection.md`](../../docs/reinjection.md).

---

## The base case

```text
Query:  How should I install the frontend dependencies?

Context injected:
[tech/frontend] (long_term) Project uses pnpm, not npm. {entities: pnpm, npm}

Trace: strategy=comprehensive  reason="entity + domain match"  score=0.55
```

## Safety filter runs *before* formatting

Reinjection is not "retrieve → paste." A privacy/safety pass sits between:

```text
ranked memories
  -> drop memories tagged review / wrong (unless strategy explicitly asks for audit context)
  -> apply redaction to private / pii / secret tagged content
  -> respect product privacy policy
  -> THEN format grouped context
  -> source + trace go to the UI, not necessarily into the model prompt
```

Rule: **memory is context, not instruction.** A retrieved memory informs the model; it does not get to issue commands to it.

## Injection targets

The same grouped context feeds more than chat:

| Target | What gets reinjected |
| --- | --- |
| Chat generation | Domain-grouped memory ahead of the user turn |
| Planning agent | `comprehensive` strategy — broader context for decomposition |
| Swarm orchestration | Attached to run settings; merged output mined back as `plan_completion` |
| Debate / review agents | Memory as evidence the critics can cite |
| File-edit / optimize agents | Project conventions (e.g. the pnpm rule) as constraints |
| Markovian chunk 0 | Memory context goes into the first chunk **only** |

## Composition with Markovian

```text
H-MEM retrieve -> safety filter -> format -> Markovian chunk 0
                                              (continuation chunks rely on compressed carryover)
Markovian completion -> H-MEM mining as event: plan_completion
```

H-MEM's reinjected context becomes Markovian's `memoryContext` parameter, injected into the first chunk only — continuation chunks rely on Markovian's compressed carryover, so memory does not have to be re-paid every chunk.

## Composition with Swarm

H-MEM context attaches to the swarm run settings; when the swarm produces a merged verified output, that output is mined back as a `plan_completion` event — closing the loop so the swarm's conclusions become future memory.

---

## Why it matters

- **The safety filter is mandatory, not optional.** Skipping it reinjects `wrong`-tagged or private memory straight into a model prompt — the failure mode that turns a memory bug into a data-leak incident.
- **Reinjection is a system seam, not a chat feature.** Memory earns its keep by feeding planning, swarms, and long Markovian runs — not just the next chat reply.
- **Trace goes to the human, content goes to the model.** The model sees grouped facts; the operator sees *why*. Conflating the two either spams the prompt or hides the audit trail.

## Related

- Ranking + grouping mechanics: [`04-retrieve-and-reinject`](../04-retrieve-and-reinject/README.md)
- Privacy/redaction rules: [`docs/privacy-and-local-first.md`](../../docs/privacy-and-local-first.md)
