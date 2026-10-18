# Relay privacy

Relay runs on your machine with the models you choose. Most of what it does happens on your computer. Some of it does not, and the difference matters, so this page is specific about which is which.

## What stays on your machine

| Data | What it is | Where it goes |
|---|---|---|
| Tracked windows | The windows you told Relay to pay attention to. | Never sent anywhere. |
| Past goals | Every instruction you typed. | Saved locally. Sent only as part of a model call you start. |
| Past plans | The missions Relay compiled for you. | Saved locally. Never sent on their own. |
| Skills and recordings | Distilled skills, macro recordings and their revisions. | Local. |
| Data Vault | Values your runs captured, with their history. | Local. |
| Schedules and watches | Your scheduled jobs and data watches. | Local. |
| Procedural memory and world model | The notes Relay keeps about what worked, per app, and its model of your desktop. | Local. |
| Tailor corpus | Documents you give Tailor. | Stored as text in Relay's local app data. |
| Workspace artifacts | Everything Relay captured from your screen for you: screenshots, extracted text, files it produced. | Local. |
| API keys | The keys you pasted for Gemini, Anthropic, OpenAI, OpenCode Go or OpenRouter. | Stored only in the local Tauri Store on desktop (localStorage in browser-only dev) and never bundled with the app. Sent only to that provider's servers when Relay calls them for you. |
| Settings | Model routing, agent bridge tiers and everything else in Settings. | Local. |

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

## What gets sent to a model provider

When you send a goal, Relay builds a request for the model provider you configured. That request contains:

- The text of your goal.
- A text description of your tracked windows (titles, the apps they belong to, rough sizes and positions).
- A short summary of relevant past plans and procedural memory, if any apply.
- For a vision check, the screenshot of the tracked window being checked.
- The schema the model fills in. It is the same every time and holds nothing personal.

That is all. Relay does not send a continuous feed of your screen. It does not send your file system. It does not send apps you have not tracked. It does not send keystrokes outside the goal box.

Much of Relay's work sends nothing at all. Step verification runs cheap UI Automation probes on your machine first, with no model in the loop. Vision is used only when needed. A skill replay takes the deterministic path and calls a model only to repair a step that drifted.

The provider you picked (Google, Anthropic, OpenAI, OpenCode Go or OpenRouter) handles that data under its own policy. Relay's network access is deliberately narrow. Its content security policy is locked to a limited set of model and loopback endpoints.

## Keeping model calls on your machine

You can keep model calls local. Relay can use the Meterless Runtime, which [Nightshift](../nightshift/README.md) serves as a [hotspot](../nightshift/hotspot.md) on `http://127.0.0.1:8088/v1` by default. The Private (on-device) routing preset pins every task to local, so nothing leaves the machine.

If you point Relay at a hotspot on another machine on your network, requests go to that machine instead.

## Coding agents and the agent bridge

The agent bridge lets coding agents such as Claude Code, Cursor, Codex, VS Code or Gemini CLI list windows, read text, click named controls and run your saved skills. The bridge runs on your machine, and you set each agent's tier.

Keep in mind that text an agent reads through the bridge goes into that agent's context. What the agent does with it, including sending it to its own model provider, is governed by that agent and its provider. Grant each agent only the tier it needs. Consequential steps still wait for you, whoever started the run.

## What is never sent anywhere

- Files on your computer that Relay did not open as part of a mission you started.
- Windows or apps you have not tracked.
- Keystrokes you type outside the Relay goal box.
- Your microphone or camera feeds. (The optional Speak dictation button uses your platform's Web Speech API and is hidden when the platform does not expose it.)
- Telemetry about how you use Relay. Relay ships with no crash analytics or usage analytics. Nothing phones home in the background.

Passwords get special handling. Password fields are captured as masked steps with a secret reference instead of plaintext, so credentials never land in saved recordings. Masked values are re-prompted at replay time.

## What you control

- Wipe your local data at any time. Everything Relay stores lives in its local store on your machine. Deleting it resets Relay.
- Delete individual items. Remove past goals, plans, skills, recordings, Data Vault values or artifacts from their lists.
- Switch providers at any time, for any reason. Your local data is not tied to a provider.
- Choose the model for every task. Route planning, vision and reasoning to different providers, force everything onto one model you trust, or keep everything local.
- Set each coding agent's tier in the agent bridge settings.

## Our commitment

We will not add analytics later as a surprise. If a future release changes what does or does not leave your machine, we will say so in the changelog, on first launch of that version, and at the top of this page.

If a future feature ever needs to send more data and cannot be made optional, we will say so clearly, and you can choose whether to update.

---

Have a question this page does not answer? Open an issue at [github.com/meterless/relay/issues](https://github.com/meterless/relay/issues), or see the [Relay overview](README.md). We would rather over-explain than leave you wondering.
