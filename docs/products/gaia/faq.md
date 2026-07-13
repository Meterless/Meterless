# FAQ

The questions people actually ask, in the order they tend to come up. If your question isn't here, [file an issue](https://github.com/meterless/gaia/issues) and we'll add it.

## Is it really free?

Yes. The app is free to use under the [Meterless Permissive Use License](https://github.com/meterless/gaia/blob/main/LICENSE), which covers personal, commercial, research, and production use. The one thing you cannot do is resell or redistribute Gaia itself as a competing product. There is no paid tier of Gaia itself, no subscription, no in-app purchases.

The only thing you might pay for is your own usage of cloud AI providers, if you choose to plug in your own API keys. That money goes directly to the provider you chose — Google, Anthropic, OpenAI, Groq, Mistral, or a gateway like OpenCode Go or OpenRouter. It does not go to us. We do not see your keys and we do not take a cut.

If you only use the built-in local model, you will never pay anyone anything.

## Do I need an account?

No. There is no signup, no login, no email collected. You download the installer, run it, and start using the app.

If you want cloud AI capabilities, you create accounts with the cloud providers directly (the same way you would for any other app that uses their APIs) and paste the keys into Gaia. Those accounts are with them, not with us.

## Does it work offline?

Yes, once you've used it once. The first time Gaia needs a local model it downloads it into the app's cache, which needs a connection and takes a few minutes depending on which model you're using. After that download has happened, the model loads from cache on every later launch and the network is not involved at all.

With the local model cached, the following all work offline: chat, memory, planning, missions, swarms over local sources, desktop control, notes, code editing, image editing, and most of the built-in tools.

Things that always need a connection: the in-app browser, anything that pulls fresh data from the web, anything routed through a cloud API provider, and update checks. If you are on a plane, the local model has cached, and you avoid the web-dependent tools, Gaia keeps working.

## How is this different from ChatGPT, Claude, or Copilot?

Three real differences, in order of how much they matter.

First, Gaia can actually do things on your computer, not just tell you how to do them. When you ask ChatGPT how to clean up a folder, it gives you instructions. When you ask Gaia, it cleans up the folder. The mechanism is real mouse and keyboard input on your real desktop, which means it works with every app you have, not just the ones with an integration.

Second, Gaia remembers across conversations, days, and weeks. ChatGPT's memory is shallow and reset-prone. Gaia builds a real picture of the people, projects, and topics you care about, and it does this automatically based on what comes up, not because you tag anything.

Third, Gaia is local-first. The built-in model runs on your machine, so you can use the app without an account, without sending data to anyone, without an internet connection. Cloud routing is optional and explicit.

It is not better than the cloud models at every task. The frontier cloud models are still smarter on the hardest reasoning problems. Gaia is designed to use them when they help and not when they don't.

## Will it slow my computer down?

The very first launch is slow because the local model has to download into the app's cache (a few minutes for the small models, longer for the big ones, depending on your connection). After that, the model loads from cache on each launch in a few seconds, and normal use feels like any other desktop app.

The background brains (the twelve specialists that keep memory organized and watch for follow-ups) are deliberately light. They are not constantly computing — the brain registry ticks them on an interval and rate-limits them. You should not notice them.

If you are doing heavy work (a long mission, a swarm with many parallel subtasks, a big local model running on CPU), Gaia uses real CPU and RAM. Check Task Manager if you are curious.

## Is it safe to let it click around on my real desktop?

Three safety layers, all of which you can verify in the source.

Destructive-looking actions are risk-gated at the automation layer. A dedicated risk gate (the Oracle desktop-control service) evaluates corrective and planned actions, and anything judged destructive is refused rather than executed — the step fails as "refused destructive" instead of running.

Desktop control is session-based and explicit. Nothing gets driven until you pick the target window in the window picker, and every action goes through a typed action facade (focus, click, type, keys, scroll, move, bounds) that is validated against the active session.

You can watch every action live in the panel, every action is written to a persistent audit log you can inspect, and you can grab the mouse back or hit the emergency stop in the header at any time to end the session. Use it the first few times until you trust the system.

## What happens if I uninstall?

The uninstaller removes the application. Your data does not get deleted.

Your chats, memory, plans, missions, files, settings, and API keys all live in `%APPDATA%\com.meterless.gaia`. The uninstaller does not touch that folder. If you reinstall later, everything is exactly where you left it.

If you want a complete clean wipe, delete that folder yourself after uninstalling.

## What about Mac and Linux?

Windows installers exist today, and the desktop automation layer is currently Windows-only. Other desktop platforms are on the roadmap but have no committed dates.

Gaia also runs as a web build (browser mode) on any platform — you get the chat, memory, tools, and WebLLM local inference, but not native desktop control. If you are on Mac or Linux right now, that is the way to try it.

## Can I use Gaia for work?

Yes. The [Meterless Permissive Use License](https://github.com/meterless/gaia/blob/main/LICENSE) explicitly permits commercial, internal, and production use. The restriction is on reselling or redistributing Gaia itself as a product, not on using it for your work.

One practical note for work use. If your company is sensitive about data leaving the machine, run Gaia local-only: don't add cloud API keys (or remove them), and Gaia routes everything through the local WebLLM and Ollama paths. Nothing goes to a cloud provider without a key you added yourself.

If your IT department needs to approve the app, point them at this repository. The source is public and auditable.

## What models does it use?

Gaia routes between three kinds of providers and decides automatically which one to use for each request.

**Local, in-browser models via WebLLM.** The Llama 3.2 family (1B, 3B, and 8B) for chat, plus Phi-3.5 Vision and a local vision stack (Transformers.js / ONNX) for screen-reading. These run inside the app on your machine using WebGPU. The first time Gaia needs one, it downloads it into the app's cache (roughly a gigabyte for the smallest, several gigabytes for the larger ones). After that, it loads from cache. You can see and change the active local model in Settings → Local Models.

**External local models via Ollama.** If you install Ollama separately and pull models into it, Gaia talks to it on `localhost:11434` and treats it as another provider. This is the path for running much larger local models (anything Ollama supports).

**Cloud and gateway models via your own API keys.** Google, Anthropic, OpenAI, Groq, Mistral, plus the OpenCode Go and OpenRouter gateways, and a Meterless localhost router. Add a key in Settings → Neural Link and Gaia starts routing the kinds of requests that provider is best at.

You do not have to pick which model for which request. Gaia's model orchestrator handles routing based on what the request needs: vision tasks go to a vision-capable model, quick classification goes to a fast model, deep reasoning goes to your strongest model. You can override the routing in Settings if you want a specific model for a specific kind of task.

If you set up no cloud keys and never install Ollama, the WebLLM path is the default and everything stays on your machine.

## How does the memory really work?

Gaia's memory is [H-MEM](https://github.com/meterless/meterless/tree/main/engines/hmem), a three-layer hierarchical memory system that you do not have to manage.

The short-term layer holds recent context. The working layer holds the current session's mined facts and observations. The long-term layer is durable, and things get promoted into it based on how often they keep coming up and how useful they prove to be. Mention a person repeatedly across conversations and they become a tracked entity. Keep returning to a project and it gets promoted. There is no tagging, no manual organization. You just talk and the system pays attention.

Every memory carries provenance — a record of where it came from — and every promotion, edit, and deletion is written to an audit ledger, so you can always see *why* something was remembered.

## Can I see and edit what Gaia has remembered about me?

Yes. The long-term memory browser (the H-MEM view in the memory explorer) shows every promoted item, and you can forget, correct, or export any row individually. The memory audit view shows the provenance receipts — where each memory came from.

Entity 360 shows people, projects, and topics specifically, with the same visibility.

Nothing in memory is hidden from you, and nothing is unreachable for deletion.

## How do I get my data out if I want to leave?

Settings → Backup gives you two ways out: a native directory sync that mirrors your data to a folder you pick, and a universal ZIP export containing your world state, long-term memory, calendar, decisions, bookmarks, workspaces, and every workspace file as plain files (JSON for structured data, one file per artifact). Individual chats can also be exported from the chat view, and individual memory rows can be exported from the memory browser.

## Is this going to keep working after some funding round changes everything?

The source is public under a permissive license, so if the team behind Gaia disappears tomorrow, the code keeps working — you can build it and continue using it. Your data is in a folder on your hard drive, in formats designed to be readable without the app.

This is a deliberate design choice. We do not want Gaia to be the kind of tool that becomes useless when the company behind it changes direction.

## I have a question this didn't answer

[File an issue](https://github.com/meterless/gaia/issues). We try to add common questions back to this page so the next person doesn't have to ask.
