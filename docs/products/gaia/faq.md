# Gaia FAQ

Common questions, in the order they tend to come up. If your question isn't here, [file an issue](https://github.com/meterless/gaia/issues) and we'll add it.

## What is Gaia?

Gaia is the AI workspace where your work compounds. It remembers your projects, decisions, people and preferences, then turns each useful interaction into something you can keep, inspect and use again. Your memories, missions, research and artifacts stay under your control, independent of whichever model created them.

It is one of three free Meterless apps, alongside [Relay](../relay/README.md) and [Swarms](../swarms/README.md). The current release is v2.4.1. It runs on the web and on Windows.

## Is it free?

Yes. Gaia is a free app, released under the [Apache 2.0 license](https://github.com/meterless/gaia/blob/main/LICENSE). Apache 2.0 permits personal, commercial, research, and production use. There is no paid tier of Gaia, no subscription, no in-app purchases.

The only thing you might pay for is your own usage of cloud AI providers, if you choose to plug in your own API keys. A connected provider may receive the inputs you send and charge for model usage. That money goes directly to the provider you chose: Google, Anthropic, OpenAI, Groq, Mistral, or a gateway like OpenCode Go or OpenRouter. It does not go to us. We do not see your keys and we do not take a cut.

If you only use the built-in local model, Gaia costs nothing.

## Where do I get it?

Three ways:

- The web version, from [meterless.ai/gaia](https://meterless.ai/gaia.html). Nothing to install.
- The Windows app, from [meterless.ai/gaia](https://meterless.ai/gaia.html) or the [GitHub releases page](https://github.com/meterless/gaia/releases/latest).
- The Meterless Suite, from the [free tools page](https://www.meterless.ai/tools.html). One installer sets up Gaia, Relay and Swarms with the five engine primitives (H-MEM, Markovian, Scout, Swarm, World Model) preconfigured.

See [getting started](getting-started.md) for the first five minutes.

## Do I need an account?

No. There is no signup, no login, and no email collected. Open the web version or run the installer and start using the app.

If you want cloud AI capabilities, you create accounts with the cloud providers directly (the same way you would for any other app that uses their APIs) and paste the keys into Gaia. Those accounts are with them, not with us.

## How does Gaia relate to Nightshift?

[Nightshift](../nightshift/README.md) is the flagship Meterless product. It turns the computer you already own into an AI hotspot and gives bigger work the whole night. Gaia is a free app for the work you do every day: one persistent workspace where projects keep their memory, evidence, goals and artifacts.

You do not need Nightshift to use Gaia. Gaia runs on its own local models or on cloud keys you add. If you do run Nightshift, Gaia can use its hotspot as a model provider, and bigger jobs that should run overnight can go to Nightshift.

## Can Gaia use the Nightshift hotspot as its model provider?

Yes. Nightshift exposes the Meterless Runtime as an OpenAI-compatible provider, and Gaia supports a Meterless localhost router alongside its other providers in Settings → Neural Link.

- The default base URL is `http://127.0.0.1:8088/v1`.
- Auth is a bearer token. The runtime writes it to `<stateDir>/proxy-token`.
- Model ids are routing modes, not model files. `meterless/auto` lets the runtime decide. `meterless/fast`, `meterless/deep` and `meterless/cheap` pick a disposition. `meterless/local` never leaves the machine.

The hotspot runs on the Nightshift Windows, Mac and DGX editions. Details are in the [hotspot guide](../nightshift/hotspot.md). If Gaia cannot reach it, see [troubleshooting](troubleshooting.md#11-gaia-cannot-reach-the-nightshift-hotspot).

## Does it work offline?

Yes, after the first model download. The first time Gaia needs a local model it downloads it into the app's cache, which needs a connection and takes a few minutes depending on which model you're using. After that download has happened, the model loads from cache on every later launch and the network is not involved at all.

With the local model cached, the following all work offline: chat, memory, planning, missions, swarms over local sources, desktop control, notes, code editing, image editing, and most of the built-in tools.

Things that always need a connection: the in-app browser, anything that pulls fresh data from the web, anything routed through a cloud API provider, and update checks. On a plane, with the local model cached and the web-dependent tools avoided, Gaia keeps working.

## How is this different from ChatGPT, Claude, or Copilot?

Most AI tools give you an answer and leave the valuable structure behind in their cloud. The context disappears, the plan cannot be replayed, and the research becomes another isolated conversation. Gaia gives you one persistent workspace where every project keeps its memory, evidence, goals, artifacts and reusable workflows. You can change models and keep your work.

In practice, that shows up as four differences.

First, Gaia remembers across conversations, days, and weeks. It builds a picture of the people, projects, and topics you care about, automatically, based on what comes up. You never tag anything.

Second, Gaia researches with receipts. It browses live sources, captures evidence, and links important claims back to where they came from.

Third, Gaia can carry out tasks on your computer. Ask a chat assistant how to clean up a folder and it gives you instructions. Ask Gaia and it cleans up the folder. It uses real mouse and keyboard input on your real desktop, so it works with every app you have, including apps with no integration.

Fourth, Gaia is local-first. The built-in model runs on your machine, so the app works without an account or an internet connection. Cloud routing is optional and explicit.

The frontier cloud models are still stronger on the hardest reasoning problems. Gaia is designed to use them when they help and skip them when they don't.

## Will it slow my computer down?

The very first launch is slow because the local model has to download into the app's cache (a few minutes for the small models, longer for the big ones, depending on your connection). After that, the model loads from cache on each launch in a few seconds, and normal use feels like any other desktop app.

The background brains (the twelve specialists that keep memory organized and watch for follow-ups) are deliberately light. The brain registry ticks them on an interval and rate-limits them, so they are not constantly computing. You should not notice them.

If you are doing heavy work (a long mission, a swarm with many parallel subtasks, a big local model running on CPU), Gaia uses real CPU and RAM. Check Task Manager if you are curious.

## Is it safe to let it click around on my real desktop?

Desktop control has several safeguards, and you can verify each one in the source.

Gaia drives apps through your existing signed-in sessions. It never gets your passwords and has no root access. Nothing gets driven until you pick the target window in the window picker, and control stays bound to that one window. Every action goes through a typed action facade (focus, click, type, keys, scroll, move, bounds) that is validated against the active session.

Every action is audited and rate-limited to 60 a second. Dangerous key combinations, such as Alt+F4 and Ctrl+Alt+Del, are blocked at the runtime. Destructive-looking actions are risk-gated at the automation layer: a dedicated risk gate (the Oracle desktop-control service) evaluates corrective and planned actions, and anything judged destructive is refused rather than executed. The step fails as "refused destructive" instead of running.

You can watch every action live in the panel and read the persistent audit log afterward. Esc is an emergency stop: it ends the session and cancels every queued action. You can also grab the mouse back at any time. Watch it closely the first few times until you trust it.

## Is Gaia watching my screen?

Only when you ask it to. Observer can watch the workspace you approve and point out problems while the work is still in front of you, such as weak contrast in a design, a typo in a spreadsheet, or a number in an email that disagrees with memory. You choose what it observes, when observation begins, and when it stops. See [privacy](privacy.md#observer-screen-captures-and-desktop-control).

## What are Companion and Lens?

Companion is the phone app. Pair it with a QR code to watch runs, answer approvals and receive artifacts wherever you are. Lens is the browser extension. Any page can queue a mission with a source receipt, any copy leaves a receipt, and any selection can become memory. Queued missions never auto-run, and Lens draft assist never touches a submit button.

Your desktop stays in charge, and the phone and the browser act as its remote controls. A new pairing replaces the old one, and one switch on your desktop pauses everything.

## What happens if I uninstall?

The uninstaller removes the application. Your data does not get deleted.

Your chats, memory, plans, missions, files, settings, and API keys all live in `%APPDATA%\com.meterless.gaia`. The uninstaller does not touch that folder. If you reinstall later, everything is exactly where you left it.

If you want a complete clean wipe, delete that folder yourself after uninstalling.

## What about Mac and Linux?

The Windows app is the desktop build today, and the desktop automation layer is currently Windows-only. Other desktop platforms are on the roadmap but have no committed dates.

Gaia also runs on the web on any platform. You get the chat, memory, tools, and WebLLM local inference, but not native desktop control. If you are on Mac or Linux right now, that is the way to use it.

## Can I use Gaia for work?

Yes. Apache 2.0 permits commercial, internal, and production use.

If your company is sensitive about data leaving the machine, run Gaia local-only: don't add cloud API keys (or remove them), and Gaia routes everything through the local WebLLM and Ollama paths. Nothing goes to a cloud provider without a key you added yourself. When a cloud model is used, a context receipt shows which context was sent and why.

If your IT department needs to approve the app, point them at the [Gaia repository](https://github.com/meterless/gaia). The source is public and auditable.

## What models does it use?

Gaia runs on local or cloud models, and decides automatically which one to use for each request.

Local, in-browser models run via WebLLM. They include the Llama 3.2 family (1B, 3B, and 8B) for chat, plus Phi-3.5 Vision and a local vision stack (Transformers.js / ONNX) for screen-reading. These run inside the app on your machine using WebGPU. The first time Gaia needs one, it downloads it into the app's cache (roughly a gigabyte for the smallest, several gigabytes for the larger ones). After that, it loads from cache. You can see and change the active local model in Settings → Local Models.

External local models run via Ollama. If you install Ollama separately and pull models into it, Gaia talks to it on `localhost:11434` and treats it as another provider. This is the path for running much larger local models (anything Ollama supports).

Cloud and gateway models run via your own API keys. The supported providers are Google, Anthropic, OpenAI, Groq, Mistral, plus the OpenCode Go and OpenRouter gateways, and a Meterless localhost router (the [Nightshift hotspot](#can-gaia-use-the-nightshift-hotspot-as-its-model-provider)). Add a key in Settings → Neural Link and Gaia starts routing the kinds of requests that provider is best at.

You do not have to pick which model for which request. Gaia's model orchestrator handles routing based on what the request needs: vision tasks go to a vision-capable model, quick classification goes to a fast model, deep reasoning goes to your strongest model. You can override the routing in Settings if you want a specific model for a specific kind of task.

If you set up no cloud keys and never install Ollama, the WebLLM path is the default and everything stays on your machine.

## How does the memory work?

Gaia's memory is [H-MEM](../../../engines/hmem/), a three-layer hierarchical memory system that you do not have to manage.

The short-term layer holds recent context. The working layer holds the current session's mined facts and observations. The long-term layer is durable. Items get promoted into it based on how often they keep coming up and how useful they prove to be. Mention a person repeatedly across conversations and they become a tracked entity. Keep returning to a project and it gets promoted. You do not tag or organize anything.

Every memory carries provenance (a record of where it came from), and every promotion, edit, and deletion is written to an audit ledger, so you can always see why something was remembered.

## Can I see and edit what Gaia has remembered about me?

Yes. The long-term memory browser (the H-MEM view in the memory explorer) shows every promoted item, and you can forget, correct, or export any row individually. The memory audit view shows the provenance receipts: where each memory came from.

Entity 360 shows people, projects, and topics specifically, with the same visibility.

Nothing in memory is hidden from you, and nothing is unreachable for deletion.

## What happens when a scheduled mission misses its time?

Gaia records it. If Gaia was not available at the scheduled time, the mission resumes on its next cadence and the gap is recorded in the run log. Each run keeps its history, evidence, output, and any drift from the original mission, so you can see what changed.

## How do I get my data out if I want to leave?

Settings → Backup offers two ways out: a native directory sync that mirrors your data to a folder you pick, and a universal ZIP export containing your world state, long-term memory, calendar, decisions, bookmarks, workspaces, and every workspace file as plain files (JSON for structured data, one file per artifact). Individual chats can also be exported from the chat view, and individual memory rows can be exported from the memory browser.

## Is this going to keep working after some funding round changes everything?

The source is public under Apache 2.0, so if the team behind Gaia disappears tomorrow, the code keeps working. You can build it and continue using it. Your data is in a folder on your hard drive, in formats designed to be readable without the app.

This is a deliberate design choice. We do not want Gaia to be the kind of tool that becomes useless when the company behind it changes direction.

## I have a question this didn't answer

[File an issue](https://github.com/meterless/gaia/issues). We try to add common questions back to this page so the next person doesn't have to ask.
