# Getting started

You just installed Gaia. This page takes you from "fresh install" to "did something useful" in under five minutes. No theory, no setup checklists, just real steps.

If something goes wrong during any of these steps, jump to [troubleshooting](troubleshooting.md). Most first-time issues have a one-line fix.

## 1. Download and install (about a minute)

Go to the [Releases page](https://github.com/meterless/gaia/releases). Grab the `.exe` installer. Double-click it. Windows is the supported desktop platform today.

Windows will probably show a SmartScreen warning the first time, because the app is new and not yet widely fingerprinted by Microsoft. Click "More info," then "Run anyway." This is normal for new desktop apps and goes away once enough people have installed it.

If you prefer the `.msi` installer (for example, if you are setting Gaia up on a work machine where you need an MSI for IT reasons), it is right next to the `.exe` on the same page.

## 2. Open it (a few minutes the first time, fast after that)

Find Gaia in your Start menu and open it. The very first launch downloads the local AI model into the app's cache. How long that takes depends on which model is selected (you can see and change it in Settings → Local Models; smaller models download faster and need less RAM). You will see a progress indicator while it happens. On a fast connection this is a few minutes for the smaller models, longer for the larger ones.

Every later launch loads the cached model and is fast.

There is no signup. There is no account. You do not need to give Gaia your email. It is just open and ready after the first download finishes.

## 3. Say hi (thirty seconds)

The main view has a chat input at the bottom. Type "what can you do?" and press Enter.

Gaia will give you a short tour of what it can do, based on what is installed. You don't have to read the whole thing. The point of this step is to confirm that everything is working: the model loaded, the input works, and you are getting real responses.

If you got an answer, you are set. Skip to step 4.

If the response takes a long time or never arrives, the model probably hasn't finished its first-time download or warm-up yet. Check the load status in Settings → Local Models, wait until the model shows as ready, and try again. If it still doesn't work, see [troubleshooting](troubleshooting.md).

## 4. Try your first real task (two minutes)

Pick whichever of these sounds most like something you would actually do.

**Quick one: write me something.** Type "draft a short message to my landlord asking about the broken radiator" and press Enter. You get a draft. Reply to Gaia with "make it a bit warmer" or "shorter" or "now also mention I tried turning it off and on" and watch it iterate. This is the bread-and-butter rhythm. You don't have to write perfect prompts. You just talk to it.

**See what desktop control feels like.** Type `@Control` followed by a goal, like `@Control take a screenshot of whatever window I'm pointing at`. A picker opens asking which window you mean. Pick one. Gaia takes the screenshot and shows it to you. This is the same mechanism it uses for bigger tasks. The picker exists so you always know which window it is about to touch. (Desktop control needs the desktop app; it isn't available in the browser build.)

**Make a plan you can edit.** Type `@plan organize my downloads folder by file type into subfolders`. Gaia generates a plan in a new panel. Read it. Highlight any sentence you want to change and ask for a different version. Edit text by hand if you want. When you like the plan, click Execute to run it now or Schedule to run it later.

Any of these three counts as your first real task. You are done with the tour.

## 5. Add your own AI keys (optional, two minutes)

You can keep using Gaia with the built-in local model forever and never set up anything else. If you want better answers on harder questions, this is the step.

Open Settings (gear icon, top right). Go to Neural Link. Paste in any keys you have for Google, Anthropic, OpenAI, Groq, Mistral, or the OpenCode Go / OpenRouter gateways. Keys are verified against the real provider when you add them.

Once a key is in, Gaia will start using that provider for the kinds of requests it is best at. You do not have to pick which model for which request. Gaia handles that. If you ever want to go back to local-only, remove the keys (or point routing back at the local models) on the same page.

## 6. Let it remember stuff (zero setup)

Gaia's memory builds itself. You do not have to organize anything. When you mention a person, a project, or a topic enough times across enough conversations, Gaia automatically promotes it from short-term context to permanent memory.

The first time this matters is usually about a week after install, when you say something like "what was that bookkeeping app I was looking at last week" and Gaia just answers. That is the memory system working.

You can see what Gaia has remembered about people, projects, and topics in Entity 360, and browse (or delete) individual memories in the long-term memory browser. Nothing is hidden and anything can be deleted.

## What to try next

- Open the [features](features.md) page to see what else is in the app. There are more than twenty built-in tools and launch surfaces, and a lot of them are useful in ways that are not obvious from the chat input.
- The [mentions](mentions.md) page is the full catalogue of every `@` command. Worth a five-minute skim after the first day.
- If you found yourself wishing for a keyboard shortcut, there is probably one. See [shortcuts](shortcuts.md).
- If anything was unexpectedly slow or weird, [troubleshooting](troubleshooting.md) probably covers it.
- If you are wondering exactly what stays on your machine and what gets sent to a cloud API, [privacy](privacy.md) is short and direct.

If you have a question this page didn't answer, [FAQ](faq.md) covers the ten or so things people ask most often in their first week.
