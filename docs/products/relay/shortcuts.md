# Keyboard shortcuts

Relay is designed to be driven mostly from the UI, but a few keyboard behaviors are worth knowing.

## In the goal composer

**Ctrl+↑ / Ctrl+↓** — Scroll back and forward through the last 100 goals you've submitted, right inside the composer. Press Ctrl+↑ repeatedly to go further back; Ctrl+↓ brings you back toward a blank composer. This is the fastest way to rerun or iterate on something you asked for before.

## Buttons that live next to the composer

These aren't keyboard shortcuts, but they're the closest thing to power-user moves in the goal box:

- **Enhance** — rewrites a rough draft into a concrete, actionable goal (under 600 characters) without changing the apps you named. One-tap Undo if you prefer your original.
- **Speak** — continuous voice dictation via the Web Speech API that appends to whatever you've already typed. The button is hidden on platforms that don't expose the API.

## During a run

Runs are controlled from the workflow UI: the engine moves through explicit states (idle, running, paused, approval_needed, completed, failed), and you can pause a running mission and resume it later. When a plan reaches an approval gate, Relay pauses and waits for your explicit sign-off before continuing — nothing runs in the meantime.

---

For the full tour of what Relay can do, see [features.md](features.md).
