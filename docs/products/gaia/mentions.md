# Gaia mentions

Mentions tell Gaia to do something specific without a whole paragraph of instructions. Type `@` in any chat input and a menu pops up with everything you can call by name: tools, sources to pull from, actions to schedule, plans to write, goals to chase, swarms to run, and the people and projects Gaia already knows about.

This page is the catalogue. Every mention below exists in the app today.

## How it works in practice

Open any chat. Type `@`. A menu opens with suggestions. Start typing the name of the thing you want and the list filters. Press Enter or Tab to pick. The chip turns into a coloured pill, and whatever you type after it becomes the argument.

So `@plan organize my downloads folder` means "use the plan tool, with `organize my downloads folder` as the input." `@Reddit r/MachineLearning fine-tuning` means "use the Reddit tool, with `r/MachineLearning fine-tuning` as the input." The shape is the same every time.

Some mentions take an argument and some don't. The menu shows a short hint next to each suggestion to tell you which. If a mention doesn't need an argument (for example, `@Notes` to open the Notes tool), you can press Enter right after picking it.

You can stack multiple mentions in one message. `@Web https://example.com summarize this for me` pulls the page first, then asks for a summary. `@Web https://en.wikipedia.org/wiki/European_robin @plan write a short essay about its mating habits` pulls the article and then plans the essay using it as context.

## Actions you can launch

These are the heavy ones. Each opens a dedicated panel and runs work on your behalf.

### `@plan`

Generates a written plan in an editable viewer. You say what you want planned, and it writes a document with context, steps, files involved, and a verification section. You can highlight any sentence and ask for a rewrite, edit by hand, then Execute or Schedule it. Plans are saved alongside your other documents.

### `@Goals`

Opens a definition modal for an open-ended objective. You set what "done" looks like, set a budget (turns and minutes), and confirm. Gaia then works toward that goal autonomously, checking in when it needs a decision. Use it for jobs that would take you an afternoon. A one-minute task does not need it.

### `@research`

Decomposes a question into sub-questions, retrieves sources for each under a budget, and synthesizes an answer with verification and a sources appendix. Use it when you want cited research rather than a chat answer. Gaia researches in a dedicated browser workspace, so you can inspect which pages were visited, what was extracted, and how the conclusion was formed.

### `@Control`, `@Desktop`, `@Take_control`

All three do the same thing. They open a window picker so you can choose which app on your desktop Gaia should drive. After you pick the window, Gaia sends real mouse and keyboard input to it. Whatever text you put after the mention becomes the goal for that session. Control stays bound to that one window and works through your existing signed-in sessions. Every action is audited and rate-limited, dangerous key combinations are blocked, and Esc is an emergency stop. Desktop control needs the Windows app.

### `@Schedule`

Opens a schedule picker for the current message. You set when it should run (a one-off time, a daily cadence, a weekly cadence) and confirm. Nothing happens until the scheduled time.

### `@Remind`

The same picker, for a notification only. At the scheduled time you get a notification with no chat run and no model call.

### `@Schedules`

Opens the Manage Schedules calendar, where every scheduled rerun lives. Each run keeps its history, evidence, output, and any drift from the original. If Gaia was offline at the scheduled time, the missed run is recorded in the run log and the mission resumes on its next cadence.

## Pulling in information from the web

These mentions fetch content and add it to the conversation as context. You can chain them with other mentions or ask a question after.

| Mention | What it does |
|---|---|
| `@Web`, `@Fetch`, `@URL` | All three do the same thing. Paste a URL on the same line and Gaia fetches the page through its reader engine. It strips the navigation and ads and keeps the actual content. The fetched text becomes part of the message context. |
| `@Reddit` | Pulls recent posts from a subreddit or a specific thread URL. `@Reddit r/MachineLearning` gets the top recent posts. `@Reddit https://reddit.com/r/.../comments/...` pulls that specific thread with its comments. Add keywords on the same line to bias which posts surface. |
| `@RSS` | Pulls the latest items from the RSS feeds you've added as sources in Discover. Use it to ask "what's new across my feeds today" without opening the feed reader. |

For everything else on the web (documentation pages, wikis, papers, Q&A threads), use `@Web` with the URL, or ask and let Gaia's search retrieval find it.

## Attaching local files

| Mention | What it does |
|---|---|
| `@Files` | Opens a file picker. Whatever you pick gets attached to the message as context. Works with text, code, spreadsheets, and anything else Gaia can read. |
| `@PDF` | The same idea, for PDFs. The file picker opens, you pick a PDF, and the text is extracted and added to the message context. |

## Opening tools

These open one of Gaia's built-in tools with the current chat context.

| Mention | Opens |
|---|---|
| `@Notes` | The Notes editor (markdown). |
| `@Code_Editor` | The Code Editor (Code Studio). |
| `@Image_Studio` | The image editor. |
| `@Movie_Maker` | Dream Studio, for video and media composition. |
| `@Calendar` | The in-app calendar. |
| `@Browser` | The in-app web browser. |
| `@Foundry` | The Data Foundry (for CSVs, JSON, SQL, XLSX). |
| `@Data_Viewer` | The Data Visualization Viewer. |
| `@Entity_Matrix` | The Entity 360 view, where you can see what Gaia knows about a person, project, or concept. |
| `@Discover` | The Discover Hub. |
| `@Stream` | The Live Stream Viewer. |
| `@Presentation` | The Presentation Viewer. |
| `@Dashboard` | The Mission Control dashboard: a live overview of runs, schedules, and system activity. |

## Mentions with prefixes

A few mention types are big enough to have their own prefix instead of one mention each.

### `@swarm:`

Decomposes the rest of your message into a swarm of parallel subtasks. It suits research-heavy questions ("compare AWS, GCP, and Azure pricing for a 50-node Kubernetes cluster"), code decomposition, multi-part analysis, or parallel creative takes. Type `@swarm:` and the menu shows the available modes.

Swarms run with a default cap of fifty subtasks across up to five levels deep, with semantic deduplication so you don't pay for two subtasks asking the same thing. Watch progress live in the Swarm HUD.

### `@skill:`

Lists available skills. Skills are reusable patterns Gaia has been taught, either by you or by the team. Type `@skill:` and the menu shows everything available. Pick one and it runs.

### `@brain:`

Routes the request to a specific specialist brain instead of letting Gaia auto-pick. Gaia has twelve internal brains for different kinds of thinking (reasoning, memory, planning, observation, and so on). Most of the time you don't need to pick one. The prefix is there for when you do. Type `@brain:` and the menu shows them.

### `@persona:` and `@identity:`

Either prefix routes the request through a specific persona. Personas adjust tone and emphasis without changing the underlying model. Use one when you want a more formal voice for a specific message.

### `@artifact:`

References a Neural Asset, Gaia's term for a saved code snippet, image, document, or other artifact that lives in your workspace. Pick one and its content is attached to the message.

### `:markovian`

Routes the turn through the [Markovian Engine](../../../engines/markovian/), Gaia's long-horizon chunked-reasoning path that carries compressed state forward instead of growing the prompt. Long tasks that qualify are routed there automatically. The token exists for when you want to force it.

## The mentions you'll use most

If you only learn five mentions, learn these:

- `@plan` for anything you want planned out before you do it.
- `@Goals` for anything autonomous that should run while you do other things.
- `@Control` (or `@Desktop`) for anything you want Gaia to do on your actual screen.
- `@Web` for pulling a specific page into the context.
- `@Schedule` for anything you want to happen later.

The rest is there when you need it. To find the others, type `@` and browse the menu.

## When a mention fails

If a mention doesn't recognize what you wrote, Gaia falls back to running it as a normal chat message. So `@Reddit r/thingthatdoesntexist` doesn't error out. It returns whatever the fetch returned (probably nothing useful) and Gaia answers from general knowledge.

If a mention runs but the result isn't what you wanted, refine it in the next message. You don't have to retype the mention. Say "use a different subreddit" or "fetch a different page" and Gaia picks up the thread.

## Customizing or adding your own

You can't add new mention types from the UI today. You can save your own skills (which appear under `@skill:`) and configure personas (which appear under `@persona:`) from the Persona section in Settings.

## Where to go from here

- [Features](features.md) explains what each of these mention-launched tools does once it opens.
- [Shortcuts](shortcuts.md) covers the keyboard side of working with the mention menu (it's mostly `@`, Tab, Enter, Escape).
- [Getting started](getting-started.md) has the recommended first task using `@plan`.
