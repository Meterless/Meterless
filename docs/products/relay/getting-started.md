# Getting started

This walks you from "I just downloaded the installer" to "Relay just did a real thing on my computer" in about five minutes. No prior setup needed.

## 1. Install it

Run the installer you downloaded from the [releases page](https://github.com/meterless/relay/releases) — either the `.msi` or the NSIS setup `.exe`. It's a normal Windows installer, the kind that asks where to put the app and then puts it there. Click through. The app will land in your Start menu under **Meterless Relay**.

First time you launch it, give it a minute. Relay is unpacking some things and getting its local storage in order. After the first launch, it opens in a couple of seconds.

If Windows SmartScreen pops up and tells you it's an unrecognized app, click **More info** and then **Run anyway**. SmartScreen builds reputation for new apps over time. We mention this in the troubleshooting page too.

## 2. Add an API key

Relay does the thinking by calling out to an AI model. You bring the key for whichever model you want to use. Out of the box, Relay supports Google Gemini, Anthropic, OpenAI, OpenCode Go, and OpenRouter.

Click the gear icon in the top right of the app. Pick **Models**. Paste your key into the box for the provider you want to use. Click **Test connection**. If you see a green check, you're set.

If you don't have a key, the easiest one to get started with is a free Gemini API key from Google AI Studio. It takes about a minute to sign up.

## 3. Track a window

This is the part that makes Relay different from other automation tools, and it's also the part new users skip and then wonder why nothing works. Take thirty seconds and do this properly.

Open the app you want Relay to control. Anything counts. A browser. Excel. QuickBooks. Your CRM. Whatever you actually use.

In Relay, click the **Tracked Windows** panel on the left. Click **Add window**. A list of every open window on your computer appears. Find the one you just opened and click it. It now shows up in the tracked windows panel with a little preview thumbnail.

You can track up to eight windows at the same time. Most useful workflows use two or three.

## 4. Describe what you want done

Click the big text box in the middle. Type what you want, in normal English. Don't try to write it like a script. The more it sounds like something you'd say to a coworker, the better Relay handles it.

Some examples that work well:

> *Open Notepad and write a one-line note that says "Reviewed at 3pm."*

> *In the Chrome window I tracked, go to my dashboard and screenshot the top chart.*

> *Open the spreadsheet on my second monitor, copy the values in column B, and paste them into a new email in Outlook.*

When you're ready, press **Enter** or click the send arrow.

## 5. Look at the plan before you run it

Relay does not jump straight to clicking. It takes a moment to research, look at your tracked windows, and write a plan. The plan appears in a panel on the right side of the app, broken into numbered phases like *open the app*, *find the chart*, *capture the screenshot*.

Read it. If anything looks wrong, click **Cancel** and try rewording your goal. If it looks right, click **Run**.

This step is worth the few seconds it takes. It's the difference between automation that you trust and automation you have to babysit.

## 6. Watch the first run

While Relay runs, your mouse will move on its own. Don't fight it. If you need to stop, use the pause control in Relay — the workflow engine pauses cleanly between steps and you can resume when you're ready.

When a phase needs your approval (this happens by default for anything that sends, posts, pays, or deletes), Relay will pause, surface a screenshot of what it's about to do, and wait for you to click **Continue** or **Cancel**.

When the run is done, anything Relay captured along the way lives in the **Workspace** tab. Files, screenshots, extracted data. It's all there, sorted by mission.

## 7. Now do it again, faster

Go back to the goal box and press **Ctrl+↑**. Your previous goal is right there. You can edit it, submit it, and run a variation. Or you can click any past plan in your history and rerun it as-is.

The third or fourth time you run a similar workflow, you'll notice Relay's plans get shorter and faster. That's procedural memory kicking in. You don't have to do anything to turn it on. It just happens.

---

## Where to go next

- The full list of things Relay can do is in [features.md](features.md).
- Keyboard shortcuts that will save you time are in [shortcuts.md](shortcuts.md).
- If something isn't working, [troubleshooting.md](troubleshooting.md) probably has it.

Welcome aboard.
