# Privacy and Local-First

H-MEM should be private by default and local-first where possible.

## Principles

- Store working and short-term memory locally when possible.
- Keep durable long-term memory user-controlled.
- Redact sensitive memory before remote model calls.
- Treat imported documents as private source material.
- Include source provenance but avoid leaking source text unnecessarily.
- Support export and deletion.
- Do not sync without explicit product policy.

## Redaction before reinjection

Apply redaction before prompt formatting:

```text
selected memories -> privacy filter -> grouped context -> model prompt
```

## Sensitive tags

Recommended tags:

- `private`
- `secret`
- `pii`
- `health`
- `financial`
- `work-confidential`

## Local-first topology

| Component | Local-first choice |
|---|---|
| Short-term | in-memory session |
| Working | SQLite or IndexedDB |
| Long-term | encrypted local DB or user-controlled server |
| Ledger | append-only local table with export |
