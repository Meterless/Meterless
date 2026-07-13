# Scenario · Chat Memory

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

A scenario deep-dive on the most common acquisition path: a multi-turn conversation that contains several different kinds of durable memory mixed with disposable chatter. Where [`02-mine-from-chat`](../02-mine-from-chat/README.md) shows one turn end to end, this shows how mining behaves across a real exchange.

---

## The conversation

```text
User:  Hey, quick one — can you keep status updates to just blockers and next steps?
Agent: Sure.
User:  Also the staging DB password rotated, it's in 1Password now not the wiki.
Agent: Noted.
User:  And actually the launch date is March 14, not March 4 like I said Monday.
User:  Thanks, that's all for now!
```

Four turns. Three durable memories, one correction, and two lines of pure pleasantry.

---

## What mining extracts (and what it drops)

| Turn | Mined? | Result |
| --- | --- | --- |
| "keep status updates to blockers and next steps" | ✓ | `preference` — communication style |
| "staging DB password is in 1Password now not the wiki" | ✓ | `factual` — but flagged for privacy review |
| "launch date is March 14, not March 4 like I said Monday" | ✓ | `factual` + **supersession** signal |
| "Hey, quick one" / "Thanks, that's all" | ✗ | pleasantry — never stored |

---

## Flow

```text
chat_message
  -> event-specific extraction prompt (capture preferences, facts, corrections; skip pleasantries)
  -> strict JSON array of candidate strings
  -> validate (string, length >= 6)
  -> infer type from event + language
  -> enrich (domain, namespace, entities, relations)
  -> supersession check on the correction
  -> store.add to working layer
  -> ledger create (one entry per mined memory)
```

## The correction is the interesting one

"March 14, not March 4 **like I said Monday**" does two things:

1. Creates `mem_launch_new` (`The launch date is March 14.`).
2. Triggers supersession detection against any existing `mem_launch_old` (`The launch date is March 4.`) from Monday's session — handing off to conflict resolution ([`07`](../07-conflict-resolution/README.md)).

## The privacy one

"password is in 1Password now" is a `factual` memory, but the secret value itself is **not** stored — only the location-of-truth fact, tagged `private`. A raw credential must never enter the memory store or a reinjected prompt (see [`docs/privacy-and-local-first.md`](../../docs/privacy-and-local-first.md)).

---

## Why it matters

- **Mining is selective, not a transcript.** A chat log stores what was said; chat memory stores what is *reusable*. The two pleasantry lines never become memories.
- **One conversation feeds three subsystems.** A single exchange produced a preference, a privacy-tagged fact, and a correction that flows into conflict resolution. This is why mining sits upstream of everything.

## Related

- Step-by-step single turn: [`02-mine-from-chat`](../02-mine-from-chat/README.md)
- The correction's downstream path: [`07-conflict-resolution`](../07-conflict-resolution/README.md)
- Pipeline reference: [`docs/mining-pipeline.md`](../../docs/mining-pipeline.md)
