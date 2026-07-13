# Features

The full picture of what the app does, written by what you can actually accomplish with it.

## Two ways to use it

There is a web version that runs at a URL in your browser, and a desktop version you install as a Windows app (.msi or .exe installer). They share the same codebase and features, with two desktop-only additions: agents can use the built-in web search and web fetch tools (the Forage stage for research runs), and you can pair a phone as a remote. The desktop version launches a little faster, stores your data in its own app data folder on disk, and opens fully offline. The web version is one click, works on any operating system with a modern browser, and stores your data inside the browser. Mac and Linux desktop installers are planned but not available yet.

You can use both, but they do not share data with each other automatically — each install keeps its own local storage. Skills can be exported from one and imported into the other; artifacts can be downloaded and carried across by hand.

## Running one prompt many ways at once

The headline feature. You write a prompt, you tell the app how many variations you want, and it runs that many at the same time, each from a meaningfully different angle. The angles are not random. Before the workers start, the app asks one model to plan distinct directions, so what comes back actually feels like different ideas instead of the same idea reworded.

You can ask for two variants or fifty. Most people sit between three and ten. The cards arrive on screen as they finish, not all at once, so you can start reading the early ones while later ones are still cooking.

If a variant fails (a network blip, a provider error, whatever), only that card fails. The rest keep going. The engine retries transient failures automatically (up to a configurable retry limit, default 2 per task), and rate-limit or quota failures are reported honestly instead of retried into a wall.

## Reading the room before you send

A small chip sits near the prompt box. As you type, it tells you what kind of work the app thinks this is. This build ships 107 intent modes across about eleven categories (code, memory, swarm, mission, workspace, specialized dev, quality, AI/automation, collaboration, admin, data/viz), each with its own color and label. The broader canonical intent taxonomy is specified in the [scout-intent engine](https://github.com/meterless/meterless/tree/main/engines/scout-intent). The chip also shows a confidence number.

High confidence means the app understood you. Low confidence means it has a guess but is not sure, and it is probably worth rephrasing. This is helpful because the detected intent drives which skills get injected into your prompt. Knowing it caught the right intent saves you a bad run.

You can ignore the chip entirely. It does not change anything unless you let it.

## Bringing your own AI

You connect the providers you want. Google Gemini, OpenAI, Anthropic Claude, OpenRouter, OpenCode Go, or any other endpoint that follows the OpenAI chat completions format. Add as many as you want. Switch between them per run.

Different models are good at different things. The app lets you assign a default model for each kind of work. Use Gemini Flash for fast drafts, Claude Opus for the long thinky stuff, GPT-5 for code. Pick whatever combination matches what you pay for.

The keys live on your machine. The app never sends them anywhere except to the provider they belong to.

## Working with your files

Drag any file onto the prompt box. PDFs, Word documents, plain text, Markdown, CSVs, code files, images, audio. The app figures out what kind of file it is and handles it the right way.

For text-readable files, the contents go straight into the prompt. The model sees them as if you had pasted them in. For PDFs, the app extracts the text first and feeds that in. Images and audio are handled through the local tool catalog — images can be OCR'd, converted, resized, cropped, or compressed, and audio files can be converted between formats — all on your machine.

Files dropped into the app never leave your computer except through the model call you explicitly send. There is no upload to our servers. We do not have servers for that.

## Generating real files back

You can ask the app to produce a PDF, a Markdown document, an HTML page, a CSV, an XLSX spreadsheet, a DOCX document, a PPTX deck, a chart, or a ZIP archive as output. It generates them locally, hands you a download, and the result sits in your history.

The document generators are real libraries running in the app (html2pdf.js for PDF, the `xlsx`, `docx`, and `pptxgenjs` packages for Office formats), the CSV generator escapes per RFC 4180 so commas and quotes inside fields do not break anything, charts render through matplotlib in a local Python (Pyodide) runtime, and audio conversion runs through ffmpeg compiled to WebAssembly.

This is useful when you want the model to produce a deliverable instead of just text on screen. "Write me a one-page report on X and give it back as a PDF" actually works.

## A memory that lasts across sessions

The app keeps a running understanding of what you have been working on. When you write a new prompt, it quietly checks whether anything from your past runs is relevant, and if so, includes a small block of that context with your prompt.

It is not all your history dumped on the model. It is a small, ranked, filtered slice (top five memories above a relevance threshold, blended across semantic similarity, keywords, tags, entities, and recency). You can see what got included in any run, and you can review and delete any memory the app is holding from the Memories panel.

The memory lives in a database on your computer. Nothing in it is sent anywhere except as part of the prompts you actively send to your AI provider.

## Skills you can switch on or off

A skill is a small block of instruction text that gets added to your prompt automatically when the app detects you are doing the matching kind of work. For example, a code-quality skill kicks in when you ask for a code review and asks the model to follow a structured review format.

The app registers 18 curated skills out of the box, and 17 of them ship enabled (one is off by default) — covering things like HTML output, data visualization, code quality, TypeScript, debugging, security, refactoring, architecture, commits/PRs/changelogs, and task decomposition. Alongside those, there is a larger discovery library of additional skills that ships disabled: browse it in Settings, read what each one does, and turn on the ones you want. Once enabled, a skill fires automatically whenever its matching intent comes up. You can also write your own skills to bake in a personal style or habit, and export or import them as files.

## Running things on a schedule

You can save any prompt as a scheduled run. Once a day at 8am, every Monday morning, the first of the month, whatever you want. When the schedule fires, the app runs the prompt and the results show up in your history.

The schedule lives on your computer. The app needs to be open at the scheduled time for the run to fire. If the app was closed when a slot was due, what happens next is up to the schedule's catch-up policy: skip the missed slots (the default), run once for the latest missed slot, or replay all of them. There is also a conflict policy for when a run is already in flight (skip, queue, or replace).

This is useful for the kind of work where the prompt is the same every time but the answer changes. A daily summary of the news headlines you care about. A weekly check on what changed in a competitor's documentation. A monthly draft of an internal report skeleton.

## History that actually helps

Every run you do is saved with its plan, per-task statuses, and every artifact that came back — written to the local database on every event, not just at the end, so even a crashed or cancelled run can be reopened later with its DAG and partial artifacts intact. The history view lists your runs and lets you reopen or re-run them.

## Exporting

Artifacts can be copied or downloaded. HTML artifacts download as a zip that bundles the page together with its referenced stylesheets, scripts, and images, plus a manifest, so what you save actually opens the way it rendered. On the desktop app this goes through the native save dialog; on the web it is a normal browser download.

Your skills can be exported and imported as files, which is the supported way to carry your custom skills to another install.

## Settings worth knowing about

There is more in Settings than you will probably need, but a few that matter:

The routing tab lets you say "use this model for code generation, this one for architecture, this one for research, this one for missions, and this one for merges." Each app mode is routed independently, and the merger route defaults to following the worker route unless you point it elsewhere. Two Mixed entries (Premium / Fast) rotate each task through a different keyed model from that tier.

The engine tab controls the Markovian chunk configuration, including the per-call token ceiling. If your variants are getting cut off mid-sentence, this is where you bump it up.

The swarm tab holds the fan-out knobs: maximum variants per run (default 300, up to 500), maximum concurrent agents (default 6, range 4–64), and the prompt-enrichment toggles (temperature variance, role postures, merger synthesis prompt).

The Memories view shows what the app has remembered and lets you delete any of it. The full picture of what does and does not leave your machine is in [privacy](privacy.md).

## Things the app does not do (yet)

It does not generate images from scratch. It can manipulate images you give it (resize, crop, convert formats, compress) but it does not call image generation APIs.

It does not stream voice in or out. You can give it an audio file and have a model transcribe or summarize it, but there is no live microphone mode.

It does not sync between machines. Your data stays on whichever computer you ran it on. If you want something elsewhere, you download artifacts or export skills and carry them across by hand.

It does not run any AI model locally. The model registry reserves a slot for local WebLLM inference, but it is disabled in this build — every model call goes through a cloud provider you have a key for.
