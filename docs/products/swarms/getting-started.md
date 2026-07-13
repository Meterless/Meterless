# Getting started

From "I just downloaded this" to "I just ran my first prompt" in about five minutes.

## Two ways to use the app

There is a web version and a desktop version. They do the same things. Pick the one that fits how you work.

The **web version** opens in your browser — find it via [meterless.ai](https://www.meterless.ai). Nothing to install. Works on Windows, Mac, Linux, anywhere with a modern browser (Chrome, Edge, Firefox, or Safari). Your data lives in the browser's local storage on the machine you opened it on.

The **desktop version** is a Windows installer (.msi or .exe) you download and run. Your data lives in the app's own data folder on your disk. The app launches a little faster and survives clearing your browser data. Mac and Linux installers are planned but not available yet.

Either way, the steps below are the same. The first step is the only one that differs.

## What you need before you start

An AI provider account with at least one API key. If you do not have one yet, the easiest place to start is Google AI Studio. They give you a free key in about thirty seconds, and the app's default routing points at Gemini on a fresh install, so that key works immediately.

That is it. You do not need to install anything else. No Python, no Node, no Docker.

## Step 1: Open the app

**If you are using the web version:** open your browser, find the app via [meterless.ai](https://www.meterless.ai), and that is it. Bookmark the page so you can find it again. The first load takes a few seconds longer than later ones because the browser is caching the app.

**If you are using the desktop version:** grab the latest installer from the [releases page](https://github.com/meterless/swarms/releases) on this repository. The file is called something like `Meterless Swarms Lite_0.1.1_x64-setup.exe` (NSIS) or `Meterless Swarms Lite_0.1.1_x64_en-US.msi`. Double-click it. Windows might pause for a moment to scan it. Click through the installer (it is the normal Next, Next, Install flow). When it finishes, the app opens on its own.

The first launch takes longer than the next ones. The app is setting up its local database, registering itself, and pre-loading a few things it needs. Give it up to thirty seconds. If you see a black or empty window for a moment, that is normal.

## Step 2: Get an API key

If you already have one for Google, OpenAI, Anthropic, or OpenRouter, skip this step.

If you do not, here is the quickest path:

Open your browser and go to aistudio.google.com. Sign in with a Google account. Click "Get API key" in the sidebar. Click "Create API key." Copy the long string that appears. Keep it somewhere you can paste from in a moment.

The free Google tier is generous enough to use the app casually for weeks without paying anything. You can switch to a paid provider later if you want.

## Step 3: Paste the key into the app

Back in the app, open Settings and go to the Cloud Models section, API Keys tab. Find the row for the provider whose key you copied (Google, in the example above). Paste the key into the field and save.

Once a valid key is in place, that provider's models light up in the model picker instead of showing as dimmed/unavailable. If they stay unavailable, the key probably has a typo or extra spaces. Delete it, paste again, save again.

## Step 4: Close Settings and look at the main window

There is one text box at the bottom of the window. There is space above it where results will appear. Near the text box there is a small chip that says something like "no intent yet."

That chip is the app reading along with you. Try typing the word "write" into the box. The chip changes color and label as the app figures out what kind of work you are asking for. You can ignore it for now. It is just there so you can see the app understanding you in real time.

## Step 5: Run your first prompt

Type something simple. Try this exactly:

> Write three different opening lines for an email asking a former colleague to grab coffee.

Press Enter, or click the send button on the right side of the text box.

The app sends your prompt to the model you set up in step 3. After a few seconds, three cards appear above the text box. Each one has a different opening line. Click on any card to expand it. Click the copy icon to copy that line to your clipboard.

Congratulations. You just ran your first swarm.

## Step 6: Try a bigger one

In the same text box, type:

> Give me ten different headline ideas for a blog post about learning to cook at thirty.

The number "ten" tells the app to fan out to ten parallel variants. Send it. Watch the cards roll in.

When they finish, you can scroll through them, copy the ones you like, and click the X on the ones you do not. The kept cards stay in your history.

## What just happened

The app took your prompt, asked the model for ten genuinely different angles first, then ran ten parallel writers, each starting from a different angle. That is why the variants do not feel like copies of each other. Without that step, you would get ten slight rephrasings of the same idea, which is not useful.

## What to try next

A few things people tend to explore after their first run:

Drop a file onto the text box and ask a question about it. PDFs, text files, code, CSVs, and Markdown all work. The app reads them and feeds the content into your prompt.

Open the Models tab in Settings and try a different model for the next run. The same prompt can feel very different on Claude versus Gemini versus an open-source model through OpenRouter. There is no wrong choice. The keys you set up stay set up.

Look at your history. Every run you do gets saved to your machine. You can open it next week and see exactly what you asked and what came back. Nothing of this leaves your computer unless you export it.

If you want the full picture of what the app can do, [features](features.md) has it. If something is not working, [troubleshooting](troubleshooting.md) is the next stop.
