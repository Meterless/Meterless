# Workshop 01 — Build your first intent registry

**Time:** 30 minutes
**You'll leave with:** a working intent registry, three intents your system can act on, and an understanding of why the registry is the source of truth.

## Setup

```bash
mkdir my-scout && cd my-scout
npm init -y
npm install tsx
# @meterless/scout is not yet published — this repository is the implementation
# spec. Point the imports below at your spec-conforming implementation.
```

## Step 1 — Sketch your system's surface (5 min)

What does your system do? List 3-5 verbs.

- summarize a document
- look up an account
- draft an email

That's your starting registry.

## Step 2 — Write the first intent (10 min)

Create `intents.json`:

```json
{
  "version": 1,
  "intents": [
    {
      "id": "doc.summarize",
      "category": "doc",
      "description": "Summarize a document or document set",
      "parameters": {
        "type": "object",
        "properties": {
          "length": { "enum": ["short", "medium", "long"] }
        }
      },
      "capabilities": ["world.query", "markovian.chain"],
      "riskClass": "low",
      "surfaces": ["chat"],
      "examples": [
        "summarize this doc",
        "give me the tldr",
        "short summary of the Q2 notes"
      ]
    }
  ]
}
```

## Step 3 — Add two more (10 min)

Repeat for `account.lookup` and `email.draft`. Each gets at least 3 examples, a `riskClass`, and a declared `capabilities` list.

## Step 4 — Try it (5 min)

```ts
import { Scout } from "@meterless/scout";

const scout = new Scout({ intentRegistry: "./intents.json" });

const decision = await scout.classify({
  prompt: "give me a quick tldr of this doc",
  user: { id: "u-1", role: "user" },
  surface: "chat",
});

console.log(decision.candidates);
```

Run it. The classifier returns top-k candidates. The right intent should be on top.

## What you learned

- The registry is the surface area of your system.
- Examples are mandatory — they seed the classifier and the eval harness.
- Capabilities are declared, not embedded.
- Adding behavior = adding an intent.

## Next

[Workshop 02 — Block your first injection →](./02-block-an-injection.md)
