# Keyboard shortcuts

The shortcuts that exist in Gaia today, in the order you'll probably use them. The list is shorter than you might expect because Gaia leans more on chat and the `@` mention menu than on memorizing key combinations. Most actions you can do with a shortcut are also one click or a few typed characters away.

You can remap any of these in Settings → Controls. Profiles let you save your own set if you want.

## The ones that matter most

**Ctrl + K** — the quick-action palette. A federated search across everything you can open, run, or jump to. Learn it on day one.

**?** — open the shortcut reference overlay, a live list of what's bound right now (including anything you've remapped).

**Ctrl + F** — find in the current chat thread, with a search-everywhere escalation.

**Ctrl + ,** — open settings.

**Escape** — back, cancel, close. Closes modals, dismisses the mention menu, exits whatever overlay you're in.

**Ctrl + M** — toggle microphone. For voice input.

## Mention menu (the most-used surface in the app)

**@** in any chat input — open the mention menu.

**Tab** — autocomplete the highlighted mention.

**Enter** — confirm and insert.

**Escape** — close without picking anything.

The mention menu is the most-used surface in the app. Every tool, source, action, and integration is reachable from there. The full catalogue of mentions is in its own document: see [mentions](mentions.md).

## Inside chat

**Enter** — send your message.

**Shift + Enter** — newline without sending.

Up arrow in an empty input gives you the last message you sent. You can edit it and resend.

## Navigation (works in lists, menus, viewers)

**Arrow keys** — move focus.

**Enter** — confirm the highlighted thing.

**Escape** — go back.

**Tab / Shift + Tab** — next or previous tab inside a panel.

**Ctrl + Tab / Ctrl + Shift + Tab** — cycle between active system tabs in the side panel (mission, swarm, goal run, plan, desktop control). Only relevant when more than one is running at once.

## In a viewer (when something opened full-screen)

**F** — toggle fullscreen.

**Arrow Right / Arrow Left** — next or previous item, for things that have a sequence (presentations, image galleries, swarm node outputs).

**Escape** — close the viewer and go back.

## Media playback (videos, audio)

**Space** — play / pause.

**Arrow Right / Left** — seek forward or back ten seconds.

**Arrow Up / Down** — volume up or down.

## Camera and mic

**Ctrl + M** — toggle microphone.

**Ctrl + Shift + C** — toggle camera.

## The emergency one

**Force UI Return** — a dedicated control action that yanks focus back to the main UI if something has captured your input (a stuck overlay, an embedded game, a viewer that won't close). It ships bound in the default control profile, and you can put it on any key or gamepad button in Settings → Controls.

This does not stop a desktop control session by itself, but it gets you back to the main view where the header shows the active-control badge and its emergency stop. If a desktop mission is genuinely runaway, the safest move is to grab the mouse with your hand and click Cancel in the side panel — your physical input always wins.

## Customizing or adding your own

Settings → Controls lets you:

- Remap any of the actions above to a different key combination.
- Create a named profile (for example, one for desktop, one for when you have a gamepad plugged in).
- Map gamepad buttons to any of the same actions. Useful if you're using Gaia from across the room with a controller.
- Import and export profiles as JSON.

If you remap a shortcut and forget what you changed it to, Settings → Controls → Reset to defaults brings everything back.

## What about shortcuts for individual tools?

Most of the built-in tools (Notes, Code Editor, Image Studio, etc.) use the keyboard conventions you would expect for their kind. The Notes editor uses standard markdown shortcuts. The Code Editor uses standard text-editor shortcuts. The Image Studio uses standard image-editor shortcuts. We do not duplicate every one of those here. If a tool feels like it should have a particular shortcut and doesn't, file an issue.
