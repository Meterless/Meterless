# Gaia privacy

This page describes what Gaia does with your data. If you find anything here that contradicts what the app does, please file a bug. We treat that as a real problem.

## The short version

Gaia keeps your persistent workspace under your control, independent of any single model.

Most of what Gaia does happens on your computer and never touches a network. The local AI model runs on your machine through WebGPU. Your chats, memory, files, plans, mission history, screenshots, and entity tracker all live on your own machine.

You only send data to a cloud provider when you have explicitly added that provider's API key in Settings, and even then, only the specific requests that get routed there. When a connected cloud model is used, Gaia shows a context receipt: which context is being sent and why. We do not run a server that mediates your requests. We do not log your activity to our infrastructure. We do not collect telemetry.

Gaia is free and open source under Apache 2.0. If you want to verify any of this for yourself, the source is public in the [Gaia repository](https://github.com/meterless/gaia), and you can watch the app's network activity with any standard network monitor.

## What stays on your computer, always

The following never leaves your machine unless you explicitly export it:

- Your chat history, including every message you've ever sent or received in Gaia.
- Your memory, including the short-term, working, and long-term layers, plus the promotion records that explain why something got remembered.
- The entity tracker, including everyone and everything Gaia has noticed.
- Your plans and the version history of each plan.
- Your missions, their run logs, and the full action log of every desktop control session, including which windows were touched and what was clicked.
- Your notes, code, generated images, mini-apps, and anything else you make in the built-in tools.
- Your settings, including theme, shortcuts, model preferences, and any API keys you've added. The keys are kept in a separate key vault, apart from the main settings file.
- Your screenshots, both the ones you take deliberately and the ones Gaia takes during desktop missions for verification.
- Workspace files you've imported or saved.

On the Windows app, all of this lives in the app data folder on your hard drive (`%APPDATA%\com.meterless.gaia`) as JSON stores and workspace files. In the web version, the same data lives in the browser's local storage (an IndexedDB database named `MeterlessMem`, plus localStorage). You can back the desktop folder up by copying it, and wipe it by deleting it. Settings → Backup also provides a directory-sync and ZIP snapshot of the same data.

## What goes to a cloud provider, only if you opt in

If you add an API key for a cloud provider (Google, Anthropic, OpenAI, Groq, Mistral) or a gateway (OpenCode Go, OpenRouter) in Settings, then requests that Gaia routes to that provider will be sent to that provider's API. This is the same thing that happens in any app that calls a cloud AI API with your key. A connected provider may receive the inputs you send and charge for model usage.

What gets sent: the prompt for that specific request, including whatever context Gaia decided to include (recent chat history, relevant memory, files you attached to that message). What comes back: the response from the model.

What does not get sent: anything that wasn't part of that specific request. Your other chats, your memory that wasn't selected as relevant, your other files, your screenshots, your settings, or your other API keys.

You can turn off cloud routing entirely at any time: remove your cloud keys, or point the model routing at the local providers (WebLLM and Ollama) in Settings. With no cloud key configured, no request can go to a cloud provider, because there is nothing to authenticate with.

## Context receipts

When a connected cloud model is used, Gaia shows a context receipt: which context is being sent and why. You do not have to guess what left your machine.

## Using the Nightshift hotspot

If you point Gaia at the [Nightshift hotspot](../nightshift/hotspot.md), requests go to the Meterless Runtime at the address you configured. By default that is `http://127.0.0.1:8088/v1`, on your own machine. If you connect to a hotspot on another machine on your network, requests go to that machine. The `meterless/local` routing mode never leaves the machine running the runtime.

## What we collect from you

Nothing. Gaia does not phone home. The app does not contain analytics, crash telemetry, or usage tracking. The telemetry panels you can find inside the app (enrichment telemetry, search efficacy, desktop automation logs) are local diagnostic surfaces. They are stored on your machine and never transmitted.

The desktop shell includes updater scaffolding from the Tauri updater plugin, but automatic update checking is not active in current builds. If that changes, this page and the release notes will say so first.

There is no crash-report upload. If the app crashes, the way to report it is to [file an issue](https://github.com/meterless/gaia/issues) yourself, with whatever logs you choose to include.

There is no outbound traffic from the app that you didn't initiate.

## Observer, screen captures and desktop control

Observer lets Gaia watch the workspace you approve and surface problems while the work is still in front of you. It is not silently monitoring your computer. You choose what it observes, when observation begins, and when it stops.

Observer captures a visual snapshot only when observer mode is active, and only significant changes (drift) get acted on. Those captures are processed by the local vision path unless you have explicitly set vision routing to a cloud provider. Observer tools are opt-in toggles on the control strip. With them off, Gaia only sees your screen when you explicitly share it or start a desktop control session.

When Gaia controls a desktop window, it works through your existing signed-in sessions. It never asks for your passwords and has no root access. Control is bound to the one window you picked. It takes window snapshots to verify that each step worked, and every action is recorded in a persistent audit log you can read (and clear) yourself. Snapshots and logs stay on your machine; they are not uploaded anywhere. Esc is an emergency stop.

If a desktop mission uses a cloud model for vision (because you routed vision tasks to a cloud provider you added a key for), then the screenshots for that mission's vision steps are sent to that provider as part of the prompt. If you don't want this, don't route vision to a cloud provider: the local vision path (Phi-3.5 Vision via WebLLM plus the local Transformers.js/ONNX vision stack) handles screen reading on your machine.

## Companion and Lens

The Companion phone app and the Lens browser extension act as remote controls for your desktop. Your desktop stays in charge.

- You pair each one with a QR code. A new pairing replaces the old one.
- One switch on your desktop pauses everything.
- Lens queues missions with a source receipt. Queued missions never auto-run.
- Smart Copy leaves a receipt for every copy.
- Lens draft assist fills forms only from facts you approved. It never touches a submit button.

## Memory and what gets remembered

Memory is built from your conversations and your file activity. There is no part of memory that uses a cloud service. The promotion logic that decides what becomes long-term lives entirely in the local app.

Every memory row carries provenance (a record of where it came from), and the memory audit view shows those receipts, so you can inspect what got remembered and why. You can browse the long-term layer in the memory browser and forget, correct, or export any row. Deleting a row removes it from the local database. It is not merely hidden.

## AI history import

If you import your conversation history from ChatGPT, Claude, or Gemini via that provider's export feature, the import happens locally. The export file you provide is read on your hard drive and the data is added to Gaia's local memory and workspace. It is not uploaded anywhere. After the import finishes, you can delete the file, and the import itself can be rolled back by its run id.

## Sharing and exports

If you click "Share" on a chat, plan, or document, Gaia generates a file or a copyable text snippet. You then decide what to do with it. Gaia does not have a sharing service that hosts anything. Anything shared leaves Gaia because you put it somewhere.

## API keys

Your API keys are handled by a dedicated key vault (`apiKeyVault`), separate from your main settings, with a managed secure storage path. That includes automatic migration of keys that older versions kept in plain localStorage. They are not synced anywhere. They are not transmitted to us. They only ever go to the provider they belong to, and they live on the machine you typed them into.

The uninstaller does not touch your app data folder, so your keys (like the rest of your data) survive an uninstall. For a complete wipe, delete `%APPDATA%\com.meterless.gaia` yourself.

## Children and consent

Gaia is not designed for children under 13. We do not knowingly collect any data about anyone, but the AI capabilities are not appropriate for young children unsupervised.

## Changes to this document

If we change anything about what data leaves your machine, the change shows up here first, and the release notes link to it. We do not silently change privacy behavior.

This document was last updated on 2026-10-17 for Gaia v2.4.1.

## Questions

If you have a question this page didn't answer, [file an issue](https://github.com/meterless/gaia/issues). If you believe you've found a security vulnerability, please report it privately through [GitHub's security advisory form](https://github.com/meterless/gaia/security/advisories/new) rather than a public issue.
