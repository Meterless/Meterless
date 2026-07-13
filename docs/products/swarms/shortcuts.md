# Keyboard shortcuts

The shortcuts most people end up using are at the top. Everything else is grouped after.

The bindings below are for Windows, the only desktop platform shipping today. (Mac builds are planned; when they ship, expect Cmd in place of Ctrl.)

## The ones you will actually use

**Ctrl+Enter** — send the prompt. You can also click the send button, but once you get used to this you will never go back.

**Ctrl+N** — start a new run with a clean prompt box. Whatever was in there gets cleared.

**Ctrl+K** — jump to the prompt box from anywhere in the app. If you are scrolling through history or buried in settings, this snaps you back.

**Ctrl+F** — search your history. Opens a search bar that scans through every prompt you have ever run.

**Esc** — cancel whatever is running right now. If a variant is mid-generation, this stops it. If you have a dialog open, it closes it.

## Working with the prompt box

**Shift+Enter** — new line inside the prompt without sending. Useful for multi-paragraph prompts.

**Ctrl+/** — toggle the intent chip details. Shows you exactly which keywords made the app guess what it guessed. Helpful when the chip lands on something unexpected.

**Ctrl+Shift+V** — paste without formatting. The normal paste keeps formatting from wherever you copied. This one strips it so the prompt stays clean.

**Ctrl+Up** and **Ctrl+Down** — cycle through your recent prompts. Like terminal history. Useful when you want to make a small tweak to something you sent a minute ago.

## On the variant board

**Click** — expand a card to see the full result.

**Ctrl+Click** — copy that card's content to your clipboard without opening it.

**Right-arrow** and **Left-arrow** when a card is open — move to the next or previous card without going back to the board.

**P** when a card is open — pin it. Pinned cards stay visible at the top of the board even when you start a new run.

**Delete** when a card is selected — remove it from the run. You can undo this with Ctrl+Z within a few seconds.

## Running and re-running

**Ctrl+R** — re-run the current prompt with the same settings. Useful when you want a second batch of variants from the same brief.

**Ctrl+Shift+R** — re-run with different settings. Opens a small panel to pick a different model or change the variant count before sending.

**Ctrl+Shift+N** — run with no memory injection. The app does not pull in any of your past context. For when you want a totally fresh perspective.

## Settings and panels

**Ctrl+,** — open Settings. Same panel the gear icon opens.

**Ctrl+H** — toggle the history sidebar.

**Ctrl+M** — toggle the memory panel. Shows you what the app currently remembers.

**Ctrl+Shift+T** — switch between light and dark themes.

## Files

**Drag a file onto the prompt box** — attach it. Multiple files at once is fine.

**Ctrl+Shift+O** — open the file picker if you would rather click than drag.

**Ctrl+Shift+X** — clear all attached files from the current prompt.

## The power-user stuff

**@skill:name** in the prompt — force a specific skill to fire on this run, even if the intent detection would not have picked it.

**@memory:name** — pull a specific saved memory into this prompt. Useful when you know what you want to reference.

**@format:pdf** (or markdown, csv, png, mp3, etc.) — tell the app to deliver the result in that format. Forces the right tool to be used.

**Type a number followed by the word "variants" or "versions" or "drafts"** — the app auto-detects you want a multi-variant run and sets the count to that number. "Give me 12 versions of..." just works.

## Window management

**F11** — fullscreen.

Note: the developer console (F12 / Ctrl+Shift+I) is intentionally disabled in the release desktop build; it is only available when running the app from source in dev mode.

## A few things worth knowing

Most shortcuts work even when the prompt box does not have focus. The exceptions are the text-editing ones (Ctrl+Up, Shift+Enter, etc.) which only apply inside the box.

If a shortcut feels wrong on your keyboard layout, the bindings are not currently customizable.

There is no global shortcut that summons the app from anywhere on your machine. Some people ask for this because they want to launch it like a quick-access tool. It is on the list too.
