# Practical H-MEM How-To

This is the shortest implementation path.

## Minimal build order

1. Implement the memory record.
2. Add a store with `add`, `get`, `update`, `delete`, `query`.
3. Add the trust ledger before adding automated mutation.
4. Implement direct capture and no-model fallback.
5. Add mining for `chat_message` and `user_correction`.
6. Add enrichment for domain and entities.
7. Implement hybrid retrieval.
8. Format reinjection context.
9. Capture feedback.
10. Add sleep preview before sleep execute.
11. Add dreaming after approval UI exists.
12. Add conflict detection.

## First production slice

Ship these first:

- `01-add-memory`
- `02-mine-from-chat`
- `04-retrieve-and-reinject`
- `08-trust-ledger`

Then add sleep and dreaming once users can inspect trace and approve proposals.

## Common mistakes

| Mistake | Fix |
|---|---|
| Treating memory as only embeddings | Add tags, domains, entities, source, and confidence. |
| Auto-approving dreams | Require review. |
| Archiving relationship hubs | Enforce sleep guardrails. |
| Hiding retrieval reasons | Persist trace metadata. |
| Dropping input when extraction fails | Use short-term fallback capture. |

## Success criterion

The agent can answer: "What memory influenced this output, where did it come from, and who changed it?"
