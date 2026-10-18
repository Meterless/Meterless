# Relay FAQ

Common questions, roughly in the order they come up.

## What is Relay, in one sentence?

You describe a job, Relay plans it against the windows you have open, drives the real apps, verifies every step, stops before anything consequential, and remembers how for next time.

## Do I need to know how to code to use this?

No. If you can write an email describing what you want done, you can use Relay. You describe the workflow in plain language and Relay figures out the clicks.

The only setup step that is not plain language is connecting a model once: paste an API key, or point Relay at a local runtime. The [getting started guide](getting-started.md) walks you through it.

## How much does it cost?

Relay is free. There is no Relay subscription, no premium tier, and nothing locked.

You choose the model. With a cloud API key, you pay that provider directly for model calls. The free tier of Google Gemini is enough for a few missions a day. Heavier use is metered by the provider, not by us. With local models through the Meterless Runtime, there is no per-call bill at all.

Relay also gets cheaper the more you use it. A verified run becomes a skill, and skills replay deterministically. In the demo workspace, the AP reconciliation skill ran 14 times and 231 of its 238 steps used no model.

## How does Relay relate to Nightshift?

[Nightshift](../nightshift/README.md) is the flagship Meterless product. It turns the Mac or DGX Spark you already own into an AI hotspot that answers your apps and works through jobs while you are away. Relay is one of three free Meterless apps, alongside [Gaia](../gaia/README.md) and [Swarms](../swarms/README.md).

You do not need Nightshift to use Relay. Relay works with your own cloud API keys. If you do run Nightshift, its [hotspot](../nightshift/hotspot.md) serves models from your machine, and Relay can use it as a provider through the Meterless Runtime. That keeps model calls local and unmetered.

## Can I get Relay together with Gaia and Swarms?

Yes. The Meterless Suite installer bundles Gaia, Relay and Swarms with the engines preconfigured. Get it from the [free tools page](https://www.meterless.ai/tools.html). Relay on its own is at [meterless.ai/relay](https://meterless.ai/relay.html) and on [GitHub](https://github.com/meterless/relay/releases/latest).

## Does it work on Mac or Linux?

Not yet. The Relay desktop app is for Windows 10 and 11. Its desktop control layer is built on native Windows APIs, and porting that is a substantial piece of work. The UI can run in browser-only development mode on any platform, but there native window listing is empty and automation commands return platform errors.

To hear when that changes, watch [github.com/meterless/relay](https://github.com/meterless/relay).

## What about my privacy? Is my screen streamed to a server?

No. Relay does not stream your desktop anywhere. When a model needs to think about a step, the text of your goal and a description of what is on screen go to the provider you configured. For a vision check, a screenshot of the tracked window being checked goes too. Most checks use local UI Automation probes, and those send nothing. The desktop control happens locally.

With the Private (on-device) routing preset on a local runtime, nothing leaves the machine. The full version is in [privacy.md](privacy.md).

## Can it mess up my computer?

Relay only does what you ask, and it shows you the plan before anything runs. You can edit any step inline. Consequential steps (sending, posting, paying, deleting) stop at an approval gate and wait for you. If a step fails and its failure policy says to ask, Relay asks instead of guessing.

That said, if you give Relay a vague instruction and click run without reading the plan, it can surprise you. Read the plan the first few times. Once you trust the kinds of workflows you run, you can move faster.

## What happens if the AI makes something up?

Relay has three layers of protection.

First, you see the plan before any clicks happen. If the model hallucinated a step (a button that does not exist, an app you do not have), you can fix or cancel it.

Second, every step gets a verdict while the plan runs. Relay checks the real window with UI Automation first and uses vision only when needed. Absence of evidence is reported as unverifiable, never as a pass.

Third, a run that only looks finished never becomes a saved skill. Only verified runs are distilled, and you review the diff before anything is saved.

These layers are not perfect. Together, reviewing the plan first and checking every step catch the great majority of cases where a hallucination would have caused a problem.

## Which AI model should I use?

For most users, a Gemini model is the easiest default. It is fast, has a free tier, and supports native structured JSON output plus optional Google Search grounding for the research step.

Relay also supports Anthropic Claude, OpenAI GPT, the OpenCode Go open-weight gateway, OpenRouter's multi-vendor API, and the Meterless Runtime for local models. Model routing lets you pick a model per task (desktop planning, vision analysis, deep reasoning), or force everything onto one model with the override picker.

## What is a skill?

A skill is a verified run distilled into a parameterized, replayable plan. URLs, filenames and typed text become parameters. Replays take the deterministic path first and call a model only to repair a step that drifted. A learned repair is saved as a new version. Each skill shows its Deterministic Execution Ratio (DER), the share of steps that ran with no model.

## What are the Data Vault and watches?

The Data Vault keeps values your runs capture, across runs. Any plan can use a stored value, for example `{{vault.recon.summary}}`. A watch fires when a captured value changes and can notify you or queue a follow-up mission. Watches never interrupt a running mission.

## Can I schedule missions?

Yes. Any mission or skill can run once, daily, weekly or monthly. Before each run, Relay checks that the windows the plan needs are ready. A missed-run policy covers runs missed while the app was closed. A schedule that fails repeatedly is paused automatically. Approval gates still wait for you on scheduled runs.

## Will my workflows still work after I close and reopen the app?

Yes. Tracked windows are designed for exactly this. When you rerun a mission you saved last week, Relay first refreshes the list of live windows, remaps any IDs that drifted since the original run, and only then starts. Relay's world model remembers your desktop, so most missions survive a restart of the underlying app cleanly.

You need to reattach manually when the target app was uninstalled and reinstalled, or when the window's underlying identity changed in a way Relay cannot follow. In both cases, Relay tells you in the plan before running, so you can fix it.

## Can I record what I do and have Relay learn from it?

Yes, two ways. The macro recorder captures what you do, anchored to UI elements rather than pixels. Recordings can be replayed, scheduled, or compiled into a mission, and edited step by step in the Timeline Editor first. Or use Live mode to guide tracked windows one verified action at a time. When you finish, Relay can draft a skill from the session.

This is the fastest way to teach Relay something that is easier to show than describe.

## How is this different from a plain macro recorder?

A plain macro recorder replays a fixed sequence of clicks and keystrokes. If the screen changes even slightly, the macro breaks.

Relay is different in four ways. It plans against the actual state of your desktop when you run, rather than a recording from last week. Its steps target controls by name rather than pixel positions. It gives every step a verdict and pauses if something is off. And it remembers what worked, per app, so the next run improves on the last.

## Can my coding agent use Relay?

Yes. The agent bridge is a `relay` CLI and an MCP server. Claude Code, Cursor, Codex, VS Code and Gemini CLI can use it to list windows, read text, click named controls and run your saved skills.

## Is it safe to give a coding agent access to my desktop?

You stay in control. You decide each agent's tier in Settings → Agent Bridge, so each agent gets only the access you grant it. Consequential steps still wait for a human. If an agent starts a skill that sends, pays or deletes, that step stops at its approval gate until you approve it.

## Where do I get help if I am stuck?

Open an issue at [github.com/meterless/relay/issues](https://github.com/meterless/relay/issues). Tell us what you were trying to do, what happened, and which version you are on. We read every report.
