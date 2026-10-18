# Relay keyboard shortcuts

Relay is mostly driven from the UI, but a few keyboard behaviors are worth knowing.

## Anywhere in the app

| Key | Action |
|---|---|
| Ctrl + K | Opens the command palette. Use it to jump to any screen or action without leaving the keyboard. |

## In the goal composer

| Key | Action |
|---|---|
| Ctrl+↑ / Ctrl+↓ | Scroll back and forward through the last 100 goals you submitted, inside the composer. Press Ctrl+↑ repeatedly to go further back. Ctrl+↓ brings you back toward a blank composer. |
| Enter | Submits your goal so Relay can compile a plan. |

Ctrl+↑ is the fastest way to rerun or iterate on something you asked for before.

## Buttons next to the composer

These are not keyboard shortcuts, but they are the closest thing to power-user moves in the goal box:

- Enhance rewrites a rough draft into a concrete, actionable goal (under 600 characters) without changing the apps you named. One tap of Undo restores your original.
- Speak adds continuous voice dictation through the Web Speech API. It appends to what you already typed. The button is hidden on platforms that do not expose the API.

## During a run

Runs are controlled from the workflow UI. The engine moves through explicit states: idle, running, paused, approval_needed, completed and failed. You can pause a running mission and resume it later.

When a plan reaches an approval gate, Relay pauses and waits for your explicit sign-off. Nothing runs in the meantime. Approve and it finishes. Cancel and nothing was sent.

---

For the full tour of what Relay can do, see [features.md](features.md).
