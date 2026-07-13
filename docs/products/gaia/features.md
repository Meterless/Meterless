# Features

What Gaia can do for you, organized by what you are trying to accomplish. Not by which menu the thing is under.

If you are looking for one specific feature, use Ctrl-F. Otherwise, read top to bottom. Most people find at least three things they didn't know were in the app.

## Talk to it like you would a person

The chat input is the starting point for everything. You don't have to write careful prompts. You just talk. "Draft an email to my accountant about the missing receipt from October." "Why is my code not compiling, here's the error." "Help me think through whether to move." Gaia reads what you said, picks the right model for the kind of request, and answers. If the answer needs more work, you reply normally and it iterates. There is no "regenerate" button to hunt for, and you do not have to copy your last message into a new chat to try again.

You can also paste images, drag in files (PDFs, spreadsheets, text, code, screenshots), or share your screen mid-conversation. Whatever you give it becomes part of the context for the rest of the conversation.

If you want to send a request to a specific tool or behavior, type `@` and a menu of mentions appears. The most useful ones are explained later in this page.

## Let it use your computer

Type `@Control` (or `@Desktop`, or `@Take_control`) followed by a goal and Gaia opens a window picker so you can choose which app you want it to drive. It then uses real mouse and keyboard input on the actual window. This means it works with every desktop app you have, not just the ones with a special integration.

You can watch every action live in a side panel. You can grab the mouse back at any time. You can pause, cancel, or change direction mid-run. Actions the risk gate judges destructive are refused at the automation layer rather than executed. Every action is written to a persistent audit log so you can see exactly what was clicked and typed.

This is the feature that turns Gaia from "AI in a window" into "AI that touches the world."

## Plan something, then refine it before running

Type `@plan` followed by what you want planned. Gaia generates a real plan in its own panel: context, steps, files involved, how to verify it worked. You can read it like a document.

What makes the plan view different from a normal AI response is that you can edit it. Highlight any sentence and a small menu appears with options to explain it, suggest a different version, or compare to an alternative approach. Edit text directly with the keyboard. Move steps around. When you are happy with the plan, click Execute to run it now or Schedule to run it later. Plans are saved alongside your other documents, so weeks later you can come back, pull up the same plan, and run it again.

This is useful for anything where you want to see the shape of the work before it happens. Migrations, cleanups, onboarding checklists, weekly routines, anything you want to do consistently.

## Set a goal and let Gaia work toward it

Type `@Goals` followed by an open-ended objective. A definition modal opens where you set what "done" looks like (for example, "inbox under fifty unread and all the rest labeled by sender") and a budget (how many turns, how many minutes). Confirm.

Gaia then works toward the goal autonomously, in the background, while you do other things. It checks in when it needs a decision. Completion is verification-driven: the run checks its own done-conditions rather than just declaring victory. When the goal is met or the budget runs out, it stops and gives you a summary.

This is the heaviest single feature in the app. Use it for the things that would take you an afternoon, not for things that would take you a minute.

## Decompose a big question into parallel research

Some questions are too big for a single thought. "Compare AWS, GCP, and Azure pricing for a fifty-node Kubernetes cluster, then write a recommendation memo." "Survey what every major open-source project does about their code of conduct." "Find the five best public datasets on global tree cover and assess their reliability."

For these, Gaia uses a Swarm. It breaks your question into a graph of subtasks, runs them in parallel, deduplicates redundant work semantically, and merges the result. You can watch every node in the graph run live in a HUD that shows progress, status, and outputs. When everything finishes, the synthesis is delivered as a single readable result.

Swarms are bounded so they don't run forever: fifty subtasks maximum by default, five levels deep, with cycle detection and revert-on-violation. That keeps them fast and predictable. (The same decomposition pattern will ship as the swarm orchestration engine in the [Meterless flagship repo](https://github.com/meterless/meterless); see the roadmap there.)

## Reflect on what just happened, then suggest what's next

Gaia's background work doesn't disappear when a run ends. The Ambient Work Strip curates a rolling tape of what the system has been doing — mission progress, desktop sessions, goal runs, Markovian reasoning, observer signals — and surfaces it in the foreground without modal interruptions.

Desktop steps are verified after they run: post-action snapshots and vision checks confirm the state actually changed, and a closed recovery loop (detect → diagnose → act → re-verify) handles the cases where it didn't.

When the perception layer notices you repeatedly working at something, it can stage a proposed follow-up goal run. Staged proposals are approval-gated: nothing runs until you approve it, and rejecting it is one click. You get the momentum of an autonomous system with a human sign-off in the loop.

## Remember across days, weeks, and months

Memory in Gaia is not "the last fifty messages." It is [H-MEM](https://github.com/meterless/meterless/tree/main/engines/hmem), a three-layer hierarchical memory system that you do not have to manage.

The short-term layer holds recent context. The working layer holds what the current session has mined. The long-term layer is durable, and things get promoted into it based on how often they come up, not because you tagged them. Mention a person repeatedly across conversations and they become an entity. Keep returning to the same project and it becomes a tracked topic. Two weeks later, when you say "what was the thing about the broken radiator," Gaia knows what you mean.

You can browse everything in the long-term memory browser (forget, correct, or export any row), see where each memory came from in the provenance audit view, and explore tracked people, projects, and topics in Entity 360. Memory is stored on your hard drive, not in the cloud.

## More than twenty built-in tools, so you don't bounce between apps

The same Gaia window contains:

A notes editor with AI-assisted writing and a real markdown view. A code editor with syntax highlighting, AI completion, and the ability to run small things in place. An image studio with AI-powered erase, replace, and background removal. A canvas for video and media composition called Dream Studio. An app maker that generates a small one-off mini-app from a description (tip calculator, habit tracker, meal planner, anything small you would otherwise build in a spreadsheet) and lets you preview and iterate. A data foundry that loads CSVs, JSON, SQL databases, and Excel files for exploration and transformation. A calendar that lives in the same workspace as everything else. An in-app browser for looking things up without leaving Gaia. A presentation viewer. A stream viewer. A live news / content discovery panel. An entity 360 view for any person, project, or concept Gaia has tracked. A live data visualizer for whatever you load into the data foundry. A movie maker. A research panel that hits multiple sources at once. An app gallery for the mini-apps you've built.

You don't have to know which tool is which. They open automatically based on what you are doing. If you paste a CSV, the data foundry opens. If you ask Gaia to make you a mini-app, the app maker opens. If you ask it to edit a photo, the image studio opens.

## Run completely offline if you want to

Gaia includes a local AI option that runs in the app through WebGPU (WebLLM). No API key needed, no account needed. The first time you use the local model, Gaia downloads it into the app's cache (a few minutes, depending on which model you use). After that download has happened once, the model loads from cache on every later launch, you can disconnect from the internet, and most of Gaia keeps working: chat, memory, planning, missions, swarms over local sources, desktop control, every built-in tool except the ones that need fresh web data. If you want bigger local models than the WebLLM options, install Ollama separately and Gaia will talk to it as another provider.

If you have your own API keys for Google, Anthropic, OpenAI, Groq, Mistral, or the OpenCode Go / OpenRouter gateways, you can add them in Settings → Neural Link and Gaia will route the kinds of requests they are best at to those providers. Remove the keys and everything routes local again. The local model is not a fallback. It is a first-class path.

## Import your old AI history

If you've been using ChatGPT, Claude, or Gemini, you can request your conversation history export from that provider and import the file into Gaia. The source format is auto-detected, and old conversations become part of Gaia's memory and workspace — memories, entities, and preferences are derived from them — so switching does not mean starting from zero. Every imported record is stamped with an import-run id, so a whole import can be rolled back.

This is also useful for moving notes-via-AI workflows into one place.

## Use it from your phone while it works on the desktop

Gaia has a mobile companion, paired over your LAN with a QR code, that gives you remote control and a conversational phone view of the desktop instance — you can watch run status, answer its questions, and send it new instructions. The intended use case is monitoring or steering a long-running mission from across the room (or across the building) while the actual work happens on your computer.

## Where to go next

- For the full catalogue of every `@` command in the app, see [mentions](mentions.md).
- For the keyboard shortcuts that make daily use much faster, see [shortcuts](shortcuts.md).
- For exactly what stays on your computer and what doesn't, see [privacy](privacy.md).
- For the questions everyone asks in their first week, see [FAQ](faq.md).
