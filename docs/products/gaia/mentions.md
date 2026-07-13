# The mention system

Mentions are how you tell Gaia to do something specific without writing a whole paragraph. Type `@` in any chat input and a menu pops up with everything you can call by name: tools, sources to pull from, actions to schedule, plans to write, goals to chase, swarms to run, and the people and projects Gaia already knows about.

This page is the catalogue. Everything that follows is a real mention that exists in the app today.

## How it works in practice

Open any chat. Type `@`. A menu opens with suggestions. Start typing the name of the thing you want and the list filters. Press Enter or Tab to pick. The chip turns into a coloured pill, and whatever you type after it becomes the argument.

So `@plan organize my downloads folder` means "use the plan tool, with `organize my downloads folder` as the input." `@Reddit r/MachineLearning fine-tuning` means "use the Reddit tool, with `r/MachineLearning fine-tuning` as the input." Same shape every time.

Some mentions take an argument and some don't. The menu tells you which by showing a short hint next to each suggestion. If a mention doesn't need an argument (for example, `@Notes` to just open the Notes tool), you can press Enter immediately after picking it.

You can stack multiple mentions in one message. `@Web https://example.com summarize this for me` pulls the page first, then asks for a summary. `@Web https://en.wikipedia.org/wiki/European_robin @plan write a short essay about its mating habits` pulls the article and then plans the essay using it as context.

## Actions you can launch

These are the heavy ones. Each opens a dedicated panel and runs work on your behalf.

**`@plan`** generates a written plan in an editable viewer. You give it what you want planned, it writes a real document with context, steps, files involved, and a verification section. You can highlight any sentence and ask for a rewrite, edit by hand, then Execute or Schedule it. Plans are saved alongside your other documents.

**`@Goals`** opens a definition modal for an open-ended objective. You set what "done" looks like, set a budget (turns and minutes), and confirm. Gaia then works toward that goal autonomously, checking in when it needs a decision. Use this for things that would take you an afternoon, not for things that would take a minute.

**`@research`** decomposes a question into sub-questions, retrieves sources for each under a budget, and synthesizes an answer with verification and a sources appendix. Use it when you want cited research rather than a chat answer.

**`@Control`**, **`@Desktop`**, or **`@Take_control`** all do the same thing: open a window picker so you can choose which app on your desktop you want Gaia to drive. After you pick the window, Gaia uses real mouse and keyboard input on it. Whatever text you put after the mention becomes the goal for that session.

**`@Schedule`** opens a schedule picker for the current message. You set when it should run (a one-off time, a daily cadence, a weekly cadence) and confirm. Nothing happens until the scheduled time.

**`@Remind`** is the same picker but for a notification only. No chat run, no model call at the scheduled time, just a notification.

**`@Schedules`** opens the Manage Schedules calendar, where every scheduled rerun lives.

## Pulling in information from the web

These mentions fetch content and add it to the conversation as context. You can chain them with other mentions or just ask a question after.

**`@Web`**, **`@Fetch`**, or **`@URL`** all do the same thing: paste a URL on the same line and Gaia fetches the page through its reader engine. Strips the navigation and ads, keeps the actual content. The fetched text becomes part of the message context.

**`@Reddit`** pulls recent posts from a subreddit or a specific thread URL. `@Reddit r/MachineLearning` gets the top recent posts. `@Reddit https://reddit.com/r/.../comments/...` pulls that specific thread with its comments. Add keywords on the same line to bias which posts surface.

**`@RSS`** pulls the latest items from the RSS feeds you've added as sources in Discover. Useful if you want to ask "what's new across my feeds today" without opening the feed reader.

For everything else on the web — documentation pages, wikis, papers, Q&A threads — use `@Web` with the URL, or just ask and let Gaia's search retrieval find it.

## Attaching local files

**`@Files`** opens a file picker. Whatever you pick gets attached to the message as context. Works with text, code, spreadsheets, anything Gaia can read.

**`@PDF`** is the same idea but for PDFs specifically. The file picker opens, you pick a PDF, and the text is extracted and added to the message context.

## Opening tools

These open one of Gaia's built-in tools with the current chat context.

**`@Notes`** opens the Notes editor (markdown).

**`@Code_Editor`** opens the Code Editor (Code Studio).

**`@Image_Studio`** opens the image editor.

**`@Movie_Maker`** opens Dream Studio for video and media composition.

**`@Calendar`** opens the in-app calendar.

**`@Browser`** opens the in-app web browser.

**`@Foundry`** opens the Data Foundry (for CSVs, JSON, SQL, XLSX).

**`@Data_Viewer`** opens the Data Visualization Viewer.

**`@Entity_Matrix`** opens the Entity 360 view, where you can see what Gaia knows about a person, project, or concept.

**`@Discover`** opens the Discover Hub.

**`@Stream`** opens the Live Stream Viewer.

**`@Presentation`** opens the Presentation Viewer.

**`@Dashboard`** opens the Mission Control dashboard — a live overview of runs, schedules, and system activity.

## Mentions with prefixes

A few mention types are big enough that they have their own prefix instead of one mention each.

**`@swarm:`** decomposes the rest of your message into a swarm of parallel subtasks — research-heavy questions ("compare AWS, GCP, and Azure pricing for a 50-node Kubernetes cluster"), code decomposition, multi-part analysis, or parallel creative takes. Type `@swarm:` and the menu shows the available modes.

Swarms run with a default cap of fifty subtasks across up to five levels deep, with semantic deduplication so you don't pay for two subtasks asking the same thing. Watch progress live in the Swarm HUD.

**`@skill:`** lists available skills. Skills are reusable patterns Gaia has been taught, either by you or by the team. Type `@skill:` and the menu shows everything available. Pick one and it runs.

**`@brain:`** routes the request to a specific specialist brain instead of letting Gaia auto-pick. Gaia has twelve internal brains for different kinds of thinking (reasoning, memory, planning, observation, and so on). Most of the time you don't need to pick. When you do, the prefix exists. Type `@brain:` and the menu shows them.

**`@persona:`** or **`@identity:`** routes the request through a specific persona. Personas adjust tone and emphasis without changing the underlying model. Useful if you want a more formal voice for a specific message.

**`@artifact:`** references a Neural Asset — Gaia's term for a saved code snippet, image, document, or other artifact that lives in your workspace. Pick one and its content is attached to the message.

**`:markovian`** routes the turn through the [Markovian Engine](https://github.com/meterless/meterless/tree/main/engines/markovian), Gaia's long-horizon chunked-reasoning path that carries compressed state forward instead of growing the prompt. Long tasks that qualify are routed there automatically; the token exists for when you want to force it.

## The mentions you'll use most

If you only learn five mentions, learn these:

- `@plan` for anything you want planned out before you do it.
- `@Goals` for anything autonomous that should run while you do other things.
- `@Control` (or `@Desktop`) for anything you want Gaia to do on your actual screen.
- `@Web` for pulling a specific page into the context.
- `@Schedule` for anything you want to happen later, not now.

The rest is there when you need it. The menu is the fastest way to discover the others; type `@` and just look.

## When a mention fails

If a mention doesn't recognize what you wrote, Gaia falls back to running it as a normal chat message. So `@Reddit r/thingthatdoesntexist` doesn't error out, it just returns whatever the fetch returned (probably nothing useful) and Gaia answers from general knowledge.

If a mention runs but the result isn't what you wanted, refine in the next message. You don't have to retype the mention. Just say "use a different subreddit" or "fetch a different page" and Gaia picks up the thread.

## Customizing or adding your own

You can't add new mention types from the UI today, but you can save your own skills (which appear under `@skill:`) and configure personas (which appear under `@persona:`) from the Persona section in Settings.

## Where to go from here

- [Features](features.md) explains what each of these mention-launched tools actually does once it opens.
- [Shortcuts](shortcuts.md) covers the keyboard side of working with the mention menu (it's mostly `@`, Tab, Enter, Escape).
- [Getting started](getting-started.md) has the recommended first task using `@plan`.
