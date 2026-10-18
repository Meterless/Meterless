# Gaia keyboard shortcuts

These are the shortcuts that exist in Gaia today, roughly in the order you will use them. The list is short because Gaia leans on chat and the `@` mention menu more than on key combinations. Most actions with a shortcut are also one click or a few typed characters away.

You can remap any of these in Settings → Controls. Profiles let you save your own set.

## The ones that matter most

| Key | Action |
|---|---|
| Ctrl + K | The quick-action palette. A federated search across everything you can open, run, or jump to. Learn it on day one. |
| ? | Open the shortcut reference overlay, a live list of what's bound right now (including anything you've remapped). |
| Ctrl + F | Find in the current chat thread, with a search-everywhere escalation. |
| Ctrl + , | Open settings. |
| Escape | Back, cancel, close. Closes modals, dismisses the mention menu, exits whatever overlay you're in. |
| Ctrl + M | Toggle microphone, for voice input. |

## Mention menu (the most-used surface in the app)

| Key | Action |
|---|---|
| @ in any chat input | Open the mention menu. |
| Tab | Autocomplete the highlighted mention. |
| Enter | Confirm and insert. |
| Escape | Close without picking anything. |

Every tool, source, action, and integration is reachable from the mention menu. The full catalogue of mentions has its own page: see [mentions](mentions.md).

## Inside chat

| Key | Action |
|---|---|
| Enter | Send your message. |
| Shift + Enter | Newline without sending. |
| Up arrow in an empty input | Recall the last message you sent, so you can edit and resend it. |

## Navigation (works in lists, menus, viewers)

| Key | Action |
|---|---|
| Arrow keys | Move focus. |
| Enter | Confirm the highlighted item. |
| Escape | Go back. |
| Tab / Shift + Tab | Next or previous tab inside a panel. |
| Ctrl + Tab / Ctrl + Shift + Tab | Cycle between active system tabs in the side panel (mission, swarm, goal run, plan, desktop control). Only relevant when more than one is running at once. |

## In a viewer (when something opened full-screen)

| Key | Action |
|---|---|
| F | Toggle fullscreen. |
| Arrow Right / Arrow Left | Next or previous item, for things that have a sequence (presentations, image galleries, swarm node outputs). |
| Escape | Close the viewer and go back. |

## Media playback (videos, audio)

| Key | Action |
|---|---|
| Space | Play / pause. |
| Arrow Right / Left | Seek forward or back ten seconds. |
| Arrow Up / Down | Volume up or down. |

## Camera and mic

| Key | Action |
|---|---|
| Ctrl + M | Toggle microphone. |
| Ctrl + Shift + C | Toggle camera. |

## The emergency ones

| Key | Action |
|---|---|
| Esc during desktop control | Emergency stop. It ends the desktop control session and cancels every queued action. A stopped session cannot be resumed; start a new one with `@Control` to continue. |
| Force UI Return | A dedicated control action that pulls focus back to the main UI if something has captured your input (a stuck overlay, an embedded game, a viewer that won't close). It ships bound in the default control profile, and you can put it on any key or gamepad button in Settings → Controls. |

Force UI Return does not stop a desktop control session by itself. It gets you back to the main view, where the header shows the active-control badge and its emergency stop. If a desktop mission is running away, press Esc. You can also take the mouse and click Cancel in the side panel. Your physical input always wins.

Some key combinations are never sent during desktop control. Dangerous combinations such as Alt+F4 and Ctrl+Alt+Del are blocked at the runtime, so Gaia cannot press them on your behalf.

## Customizing or adding your own

Settings → Controls lets you:

- Remap any of the actions above to a different key combination.
- Create a named profile (for example, one for desktop, one for when you have a gamepad plugged in).
- Map gamepad buttons to any of the same actions. This helps if you use Gaia from across the room with a controller.
- Import and export profiles as JSON.

If you remap a shortcut and forget what you changed it to, Settings → Controls → Reset to defaults brings everything back.

## What about shortcuts for individual tools?

Most of the built-in tools (Notes, Code Editor, Image Studio, etc.) use the keyboard conventions you would expect for their kind. The Notes editor uses standard markdown shortcuts. The Code Editor uses standard text-editor shortcuts. The Image Studio uses standard image-editor shortcuts. This page does not repeat them. If a tool seems to be missing a shortcut it should have, file an issue.
