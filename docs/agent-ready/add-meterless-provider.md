# Add Meterless as a provider

Point any app at the [Nightshift hotspot](../products/nightshift/hotspot.md). Text modes in your app, with the real token and an honest offline state.

Paste the prompt below into Cursor, Claude Code, Copilot or any coding agent working in your codebase. It carries the whole contract for Meterless Runtime 0.90.0.

```text
Add Meterless Runtime to this codebase as an OpenAI-compatible provider, next to the providers it already has.

The contract (Meterless Runtime 0.90.0):
- Provider id meterless, name Meterless Runtime, default base URL http://127.0.0.1:8088/v1.
  Accept a pasted URL with or without a scheme, /v1, /v1/chat/completions, /v1/models or /healthz,
  and normalise it to <host>/v1. Never produce /v1/v1.
- Auth is real. Send Authorization: Bearer <token> on every call. The runtime writes the token to
  <stateDir>/proxy-token. Store it under the key meterless_runtime_token. The placeholder rt-local is rejected.
- Send meterless-app: <a stable lowercase id for this app> on every request, and meterless-scope: user on chat.
- Model ids are routing modes, not models: meterless/<disposition> (auto, fast, deep, cheap, local, fusion),
  meterless/<class> and meterless/<class>.<disposition>. Read them from GET /v1/models and keep any
  meterless/* id you don't recognise.
- GET /healthz only proves the process is up. GET /v1/models decides: 401 or 403 is "unauthorized"
  (show a field to paste the token), 200 with meterless ids is "online", anything else is "offline".
- Auto Detect tries ports 8088, 8090, 8787 and 11434 on 127.0.0.1, localhost and [::1], and saves the
  first online or unauthorized hit.
- Plain text requests stay a string, exactly like OpenAI. Use a 180 s timeout, because a model load can
  take minutes.

You are done when a wrong token shows unauthorized (not offline), Auto Detect finds the runtime, and a
plain text request on meterless/auto returns a string.
```

## The contract at a glance

| Rule | Why |
|---|---|
| Normalize any pasted URL to `<host>/v1` | People paste whatever they copied. `/v1/v1` is the most common bug. |
| Bearer token from `<stateDir>/proxy-token` | Auth is real, even on localhost. `rt-local` is rejected. |
| `meterless-app` header on every request | The runtime keeps one open `app_stream` job per app, so each app's requests are recorded apart. |
| Routing modes, not model names | The runtime routes to whatever fleet the machine has. Unknown `meterless/*` ids are kept, not filtered. |
| `/v1/models` decides status, not `/healthz` | A process can be up and still refuse you. 401 or 403 means show a token field, not "offline". |
| 180 s timeout | A cold model load can take minutes. Short timeouts read as false outages. |

## Working examples

- [Sitcomify](../experiments/sitcomify/README.md) routes four roles to `meterless/vision`, `meterless/text`, `meterless/image` and `meterless/video`, with Auto Detect and a Quick Connect QR code.
- [Meterless City](../experiments/meterless-city/README.md) reaches the runtime over one connect link, on the same PC or a second machine in hotspot mode.
- [DataPlant](../experiments/dataplant/README.md) lists the Meterless Runtime next to OpenAI, Anthropic, Gemini and OpenRouter.
