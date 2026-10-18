# Getting started with Gaia

This page takes you from a fresh install to your first useful result in under five minutes. It skips the theory and the setup checklists.

Gaia is free and open source under Apache 2.0. The current release is v2.4.1. It is the AI workspace where your work compounds, and one of three free Meterless apps.

If something goes wrong during any of these steps, jump to [troubleshooting](troubleshooting.md). Most first-time issues have a one-line fix.

## 1. Get Gaia (about a minute)

There are three ways in. Pick the one that fits how you work.

- **The web version.** Open Gaia from [meterless.ai/gaia](https://meterless.ai/gaia.html). There is nothing to install, and it works on any platform with a modern browser. You get chat, memory, the built-in tools and in-browser local models. Desktop control needs the Windows app. In the web version, your data lives in the browser's local storage on the machine you opened it on.
- **The Windows app.** Download the latest installer from [meterless.ai/gaia](https://meterless.ai/gaia.html) or the [GitHub releases page](https://github.com/meterless/gaia/releases/latest). Grab the `.exe` installer and double-click it. If you need the `.msi` installer instead (for example, on a work machine where IT requires an MSI), it is next to the `.exe` on the same page.
- **The Meterless Suite.** One installer sets up Gaia, Relay and Swarms together, with the five engine primitives (H-MEM, Markovian, Scout, Swarm, World Model) preconfigured. Get it from the [free tools page](https://www.meterless.ai/tools.html).

Windows will probably show a SmartScreen warning the first time, because the app is new and Microsoft has not yet seen it on many machines. Click "More info," then "Run anyway." New desktop apps commonly trigger this, and the warning goes away once enough people have installed it.

## 2. Open it (a few minutes the first time, fast after that)

Find Gaia in your Start menu and open it, or open the web version. The first launch downloads the local AI model into the app's cache. How long that takes depends on which model is selected. You can see and change it in Settings → Local Models. Smaller models download faster and need less RAM. A progress indicator shows while the download runs. On a fast connection this takes a few minutes for the smaller models and longer for the larger ones.

<img src="media/local-models.webp" alt="Settings → Local Models in Gaia, showing the available in-app models and their load state" width="720" />

Every later launch loads the cached model and is fast.

There is no signup and no account. Gaia does not ask for your email. Once the first download finishes, it is ready to use.

## 3. Say hi (thirty seconds)

The main view has a chat input at the bottom. Type "what can you do?" and press Enter.

Gaia gives you a short tour of what it can do, based on what is installed. You do not need to read all of it. This step confirms that the model loaded, the input works, and you are getting real responses.

If you got an answer, skip to step 4.

If the response takes a long time or never arrives, the model probably has not finished its first-time download or warm-up. Check the load status in Settings → Local Models, wait until the model shows as ready, and try again. If it still does not work, see [troubleshooting](troubleshooting.md).

## 4. Try your first real task (two minutes)

Pick whichever of these sounds most like something you would do.

**Write something.** Type "draft a short message to my landlord asking about the broken radiator" and press Enter. You get a draft. Reply with "make it a bit warmer" or "shorter" or "now also mention I tried turning it off and on" and watch it iterate. Most daily use looks like this. Plain conversational requests work fine.

**Make a plan you can edit.** Type `@plan organize my downloads folder by file type into subfolders`. Gaia generates a plan in a new panel. Read it. Highlight any sentence you want to change and ask for a different version, or edit the text by hand. When you like the plan, click Execute to run it now or Schedule to run it later.

<img src="media/plan-viewer.webp" alt="The Gaia plan viewer with an editable plan for a task" width="720" />

**Set a goal.** Type `@Goals` followed by an outcome in plain language. A modal opens where you set what "done" looks like and a budget of turns and minutes. Gaia breaks the goal into an inspectable plan and hands the result back for review.

<img src="media/goal-setup.webp" alt="The Gaia goal setup modal with a done condition and a budget" width="720" />

**Try desktop control.** Type `@Control` followed by a goal, like `@Control take a screenshot of whatever window I'm pointing at`. A picker opens asking which window you mean. Pick one. Gaia takes the screenshot and shows it to you. Bigger tasks use the same mechanism. The picker means you always know which window Gaia is about to touch. Control stays bound to that one window, and Esc is an emergency stop. Desktop control needs the Windows app; it is not available in the web version.

Any of these counts as your first real task, and the tour is done.

## 5. Add a model provider (optional, two minutes)

You can keep using Gaia with the built-in local model and never set up anything else. Adding a provider gets you better answers on harder questions.

Open Settings (gear icon, top right). Go to Neural Link. Paste in any keys you have for Google, Anthropic, OpenAI, Groq, Mistral, or the OpenCode Go / OpenRouter gateways. Keys are verified against the real provider when you add them. A connected provider may receive the inputs you send and charge for model usage. When a cloud model is used, Gaia shows a context receipt listing which context was sent and why.

Once a key is in, Gaia starts using that provider for the kinds of requests it handles best. Gaia picks the model for each request, so you do not have to. To go back to local-only, remove the keys (or point routing back at the local models) on the same page.

If you run [Nightshift](../nightshift/README.md) on your own machine, you can use its hotspot as a local provider instead of a cloud key. See [the FAQ entry](faq.md#can-gaia-use-the-nightshift-hotspot-as-its-model-provider).

## 6. Let it remember stuff (zero setup)

Gaia's memory builds itself on [H-MEM](../../../engines/hmem/). You do not have to organize anything. When you mention a person, a project, or a topic enough times across enough conversations, Gaia promotes it from short-term context to permanent memory.

You usually notice this about a week after install. You ask something like "what was that bookkeeping app I was looking at last week" and Gaia answers.

<img src="media/hmem.webp" alt="The Gaia H-MEM view listing remembered items" width="720" />

Entity 360 shows what Gaia has remembered about people, projects, and topics. The long-term memory browser lets you browse or delete individual memories. Nothing is hidden and anything can be deleted.

## 7. Pair your phone and browser (optional)

Pair the Companion phone app with a QR code to watch runs, answer approvals and receive artifacts away from your desk. A new pairing replaces the old one.

<img src="media/phone-pairing.webp" alt="Pairing a phone with Gaia by scanning a QR code" width="720" />

Add the Lens browser extension and any page can queue a mission with a source receipt. Queued missions never auto-run. One switch on your desktop pauses the phone and the browser together. More in [features](features.md#leave-the-desk-keep-the-controls-companion-and-lens).

## What to try next

- Open the [features](features.md) page to see what else is in the app. There are more than twenty built-in tools and launch surfaces, and many are not obvious from the chat input.
- The [mentions](mentions.md) page is the full catalogue of every `@` command. Give it a five-minute skim after the first day.
- If you wished for a keyboard shortcut, there is probably one. See [shortcuts](shortcuts.md).
- If anything was slow or behaved oddly, [troubleshooting](troubleshooting.md) probably covers it.
- For exactly what stays on your machine and what goes to a cloud API, read [privacy](privacy.md). It is short.

If this page did not answer your question, the [FAQ](faq.md) covers what people ask most often in their first week.
