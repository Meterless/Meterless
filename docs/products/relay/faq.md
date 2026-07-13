# Frequently asked questions

The questions people actually ask us, in roughly the order they tend to come up.

## Do I need to know how to code to use this?

No. If you can write an email describing what you want done, you can use Relay. The whole point of the product is that you describe the workflow in plain language and Relay figures out the clicks.

The only thing you have to do that isn't typing English is paste an API key into the settings once, when you first install. We walk you through that in the [getting started guide](getting-started.md).

## Does it work on Mac or Linux?

Not yet. Relay's desktop control layer is built on native Windows APIs, and porting that to Mac or Linux is a substantial piece of work, not a flag we can flip. The UI can run in browser-only development mode on any platform, but on non-Windows platforms native window listing is empty and automation commands return platform errors.

If you want to be told when that changes, watch the repo at [github.com/meterless/relay](https://github.com/meterless/relay).

## How much does it cost?

The app itself is free. You bring your own API key for whichever AI provider you use, and you pay them directly for the model calls. The free tier of Google Gemini is enough for most people to do a few missions a day without paying anything. Heavier use eventually costs money, but it's metered by the provider, not by us.

There's no Relay subscription. There's no premium tier. There's nothing locked.

## What about my privacy? Is my screen being streamed to a server?

No. Relay does not stream your desktop anywhere. When the AI model needs to think about a step, the text of your goal and a description of what's on screen (or, for vision verification, a screenshot of the tracked window being checked) go to whichever provider you've configured. The desktop control happens locally.

The full version of this is in [privacy.md](privacy.md), and it's worth a read if privacy is a deciding factor for you.

## Can it mess up my computer?

Relay only does what you ask it to do, and it shows you the plan before anything runs. Sensitive steps (sending, posting, paying, deleting) pause and ask for your approval by default.

That said, if you give Relay a vague instruction and click run without reading the plan, you can absolutely end up surprised by what it does. The plan inspector exists for a reason. Read it the first few times. After you trust the kinds of workflows you run, you can move faster.

## What happens if the AI makes something up?

Two layers of protection.

First, the plan is shown to you before any clicks happen. If the AI hallucinated a step (clicking a button that doesn't exist, opening an app you don't have installed), you'll see it in the plan and can cancel.

Second, while the plan is running, Relay takes screenshots between important steps and checks them against what it expected to see. If reality doesn't match, it pauses instead of charging ahead.

It's not perfect. AI is still AI. But the combination of "you see the plan first" and "the app checks itself with vision" catches the great majority of cases where a hallucination would have caused a problem.

## Which AI model should I use?

For most users, a Gemini model is the easiest default: it's fast, has a free tier, and supports native structured JSON output plus optional Google Search grounding for the research step. Relay also supports Anthropic Claude, OpenAI GPT, the OpenCode Go open-weight gateway, and OpenRouter's multi-vendor API, and you can route different tasks (planning, vision, reasoning) to different models — or force everything onto one model with the override picker.

## Will my workflows still work after I close and reopen the app?

Yes. Relay's whole approach to tracked windows is designed for exactly this. When you rerun a mission you saved last week, Relay first refreshes the list of live windows on your computer, remaps any IDs that have drifted since the original run, and only then starts executing. Most missions survive a restart of the underlying app cleanly.

The cases where you do need to manually reattach are: when the target app was uninstalled and reinstalled, or when the window's underlying identity changed in a way Relay can't follow. In both cases, Relay tells you in the plan inspector before running, so you can fix it.

## Can I record what I do and have Relay learn from it?

Yes, two ways. Macro recording captures both Relay's own automation steps and your raw OS input; recordings can be replayed as macros or compiled into a mission plan, and edited step-by-step in the Timeline Editor first. Or use Live Mode to drive tracked windows one verified action at a time — when you finish, Relay can polish the session into a reusable macro or draft a Skill from it.

This is the fastest way to teach Relay something that's easier to demonstrate than describe.

## How is this different from just using a macro recorder?

A macro recorder replays a fixed sequence of clicks and keystrokes. If the screen changes even slightly, the macro breaks.

Relay does three things differently. It plans against the actual state of your desktop at the moment you run, not against a recording from last week. It checks the screen with vision between steps and pauses if something is off. And it remembers what worked, so the next run improves on the last one.

The short version: a macro is brittle. Relay is grounded.

## Where do I get help if I'm stuck?

Open an issue at [github.com/meterless/relay/issues](https://github.com/meterless/relay/issues). Tell us what you were trying to do, what happened, and what version you're on. We read every report.
