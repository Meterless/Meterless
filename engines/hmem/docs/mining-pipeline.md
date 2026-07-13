# Mining Pipeline

Memory mining converts interactions and documents into candidate memories.

## Event types

The canonical seven:

- `chat_message`
- `user_correction`
- `file_save`
- `file_open`
- `file_edit`
- `model_response`
- `plan_completion`

## Interaction mining

For each event:

1. Build an extraction prompt specialized to the event type.
2. Ask a background model for a strict JSON array of memory strings.
3. Strip markdown fences and parse robustly.
4. Validate each item: must be a string with length ≥ 6; skip otherwise.
5. Add each item with event-derived type, tags, source, layer, provenance origin, and the active `chatId`/`goalRunId` scope.

## Document mining

For imported files:

1. Truncate to a safe token window.
2. Extract reusable facts, preferences, and technical knowledge.
3. Tag with `source:doc:<filename>`.
4. Save initially to the working layer.

## No-model fallback

If extraction fails, do not drop information.

```text
content = truncate(event.content, 240)
type = general
layer = short_term
tags = event:<event_type>, fallback:no-model
source = event.source
```

## Enrichment after mining

Every new or updated memory should run enrichment:

- Domain classification from tags, technology hints, project names, and weighted keywords.
- Namespace generation such as `work/meetings` or `tech/frontend`.
- Entity extraction for people, technologies, concepts, projects, and files.
- Relationship discovery by similarity, correction language, shared entities, and domain affinity.
- Supersession detection for updates and corrections.

## Source examples

| Source | Example memory |
|---|---|
| User correction | "The deadline is March 14, not March 4." |
| File save | "The onboarding policy requires manager approval." |
| Plan completion | "The migration plan uses a two-phase rollout." |
| Model response | "The agent proposed PostgreSQL advisory locks for single-writer control." |

## Quality rule

Mining should favor concise, reusable statements. Do not store entire turns unless fallback capture is required.
