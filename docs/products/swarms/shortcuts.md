# Swarms keyboard shortcuts

The Swarms shortcuts most people end up using are at the top. Everything else is grouped after.

The bindings below are for Windows, the only desktop platform shipping today. Mac builds are planned. When they ship, expect Cmd in place of Ctrl.

## The ones you will use most

| Key | Action |
|---|---|
| Ctrl+Enter | Send the prompt. You can also click the send button. |
| Ctrl+N | Start a new run with a clean prompt box. Whatever was in there gets cleared. |
| Ctrl+K | Jump to the prompt box from anywhere in the app. If you are scrolling through history or deep in settings, this brings you back. |
| Ctrl+F | Search your history. Opens a search bar that scans through every prompt you have ever run. |
| Esc | Cancel whatever is running right now. If a variant is mid-generation, this stops it. If you have a dialog open, it closes it. |

## Working with the prompt box

| Key | Action |
|---|---|
| Shift+Enter | New line inside the prompt without sending. Useful for multi-paragraph prompts. |
| Ctrl+/ | Toggle the intent chip details. Shows which keywords led the app to its guess. Helpful when the chip lands on something unexpected. |
| Ctrl+Shift+V | Paste without formatting. The normal paste keeps formatting from wherever you copied. This one strips it so the prompt stays clean. |
| Ctrl+Up and Ctrl+Down | Cycle through your recent prompts, like terminal history. Useful when you want to make a small tweak to something you sent a minute ago. |

## In the gallery

| Key | Action |
|---|---|
| Click | Open a result in the gallery. |
| Ctrl+Click | Copy that result's content to your clipboard without opening it. |
| Right-arrow and Left-arrow, when a result is open | Move to the next or previous result without going back to the gallery. |
| P, when a result is open | Pin it. Pinned results stay visible at the top of the gallery even when you start a new run. |
| Delete, when a result is selected | Remove it from the run. You can undo this with Ctrl+Z within a few seconds. |

## Running and re-running

| Key | Action |
|---|---|
| Ctrl+R | Re-run the current prompt with the same settings. Useful when you want a second batch of variants from the same brief. |
| Ctrl+Shift+R | Re-run with different settings. Opens a small panel to pick a different model or change the variant count before sending. |
| Ctrl+Shift+N | Run with no memory injection. The app does not pull in any of your past context. Use it when you want a completely fresh perspective. |

## Settings and panels

| Key | Action |
|---|---|
| Ctrl+, | Open Settings. Same panel the gear icon opens. |
| Ctrl+H | Toggle the history sidebar. |
| Ctrl+M | Toggle the memory panel, which shows what the app currently remembers. |
| Ctrl+Shift+T | Switch between light and dark themes. |

## Files

| Key | Action |
|---|---|
| Drag a file onto the prompt box | Attach it. Multiple files at once is fine. |
| Ctrl+Shift+O | Open the file picker if you would rather click than drag. |
| Ctrl+Shift+X | Clear all attached files from the current prompt. |

## The power-user stuff

| Input | Action |
|---|---|
| `@skill:name` in the prompt | Force a specific skill to fire on this run, even if the intent detection would not have picked it. |
| `@memory:name` | Pull a specific saved memory into this prompt. Useful when you know what you want to reference. |
| `@format:pdf` (or markdown, csv, png, mp3, etc.) | Tell the app to deliver the result in that format. Forces the right tool to be used. |
| A number followed by the word "variants", "versions" or "drafts" | The app detects that you want a multi-variant run and sets the count to that number. "Give me 12 versions of..." works. |

## Window management

| Key | Action |
|---|---|
| F11 | Fullscreen. |

The developer console (F12 / Ctrl+Shift+I) is intentionally disabled in the release desktop build. It is only available when running the app from source in dev mode.

## A few things worth knowing

Most shortcuts work even when the prompt box does not have focus. The exceptions are the text-editing ones (Ctrl+Up, Shift+Enter, etc.), which only apply inside the box.

If a shortcut feels wrong on your keyboard layout, the bindings are not currently customizable.

There is no global shortcut that summons the app from anywhere on your machine. Some people ask for this because they want to launch it like a quick-access tool. It is on the list too.
