# Privacy

Most of what Relay does happens on your computer. Some of it doesn't, and it's worth being specific about which is which, because the difference matters.

## What stays on your machine

- **Your tracked windows.** The list of windows you've told Relay to pay attention to. Never sent anywhere.
- **Your past goals.** Every instruction you've ever typed. Saved in a local file. Never sent anywhere except as part of a model call you initiate.
- **Your past plans.** The structured workflows Relay generated for you. Saved locally. Never sent on their own.
- **Your procedural memory.** The notes Relay takes about workflows that succeeded. Local file.
- **Your workspace artifacts.** Everything Relay has captured from your screen for you, including screenshots, extracted text, files it produced. Local folder.
- **Your API keys.** The keys you've pasted for Gemini, Anthropic, OpenAI, OpenCode Go, or OpenRouter. Stored only in the local Tauri Store on desktop (localStorage in browser-only dev) and never bundled with the app. Sent only to that provider's servers when Relay calls them on your behalf.
- **Your settings.** Your model routing preferences and everything else in the settings panel. Local.

All of this lives in Relay's local store on your machine, under keys like:

```text
meterless_relay_mission_plan_history_v1
meterless_relay_mission_goal_history_v1
meterless_relay_procedural_memory_v1
meterless_relay_workspace_artifacts_v1
meterless_relay_recordings_v2
meterless_relay_scheduled_mission_jobs_v1
meterless_relay_desktop_world_v1
meterless_relay_skills_v1
meterless_relay_step_verdicts_v1
```

## What gets sent to an AI provider when you use Relay

When you type a goal and hit send, Relay puts together a request and sends it to whichever model provider you've configured. That request contains:

- The text of your goal.
- A text description of your tracked windows (their titles, the apps they belong to, their rough sizes and positions).
- A short summary of relevant past plans, if any apply to this goal.
- For vision verification steps, the actual screenshot of the tracked window that's being checked.
- The schema the model is supposed to fill in (which is the same every time and doesn't contain anything personal).

That's it. Relay doesn't send a continuous feed of your screen. It doesn't send your file system. It doesn't send your other open apps that aren't being tracked. It doesn't send your typing keystrokes outside of what's in the goal box.

The provider you picked (Google, Anthropic, OpenAI, OpenCode Go, or OpenRouter) handles that data according to their own policy. Relay's network access is deliberately narrow: its content security policy is locked down to a limited set of model and loopback endpoints.

## What is never sent anywhere

- Files on your computer that Relay didn't open as part of a mission you started.
- Windows or apps you haven't tracked.
- Keystrokes you type outside of the Relay goal box.
- Your microphone or camera feeds. (The optional Speak dictation button uses your platform's Web Speech API and is hidden when the platform doesn't expose it.)
- Telemetry about how you use Relay. We don't ship Relay with crash analytics or usage analytics. There's nothing phoning home in the background.

Passwords get special handling: password fields are captured as masked steps with a secret reference — never plaintext — so credentials never land in saved recordings, and masked values are re-prompted at replay time.

## What you control

- **You can wipe your local data at any time.** Everything Relay stores lives in its local store on your machine, and deleting it resets Relay fresh.
- **You can delete individual past goals, plans, or artifacts** from your history and workspace.
- **You can switch to a different provider** for any reason, at any time. Your local data isn't tied to a provider.
- **You choose the model for every task.** Per-task routing lets you send planning, vision, and reasoning to different providers, or force everything onto one model you trust.

## A note on what we'd like to keep doing

We don't add analytics later as a surprise. If a future release of Relay changes anything about what does or doesn't leave your machine, we'll say so in the changelog, on launch the first time you open that version, and in a paragraph at the top of this page.

If we ever can't keep that promise (say, a future feature genuinely requires sending more data and we can't make it optional), we'll be clear about it and you'll have the choice to update or not.

---

If you have a specific question that isn't answered here, send it to us. The contact info is in the [Relay overview](README.md). We'd rather over-explain than have you wondering.
