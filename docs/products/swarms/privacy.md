# Swarms privacy

Most of what Swarms does stays on your computer. Here is exactly what does not, and why.

Swarms is free and open source under Apache 2.0. You can read the code that handles your data on [GitHub](https://github.com/meterless/swarms).

We wrote this page so a person who does not work in software can read it once and understand what is happening with their data. If something is unclear, that is on us, and we want to fix it. Open an issue and tell us.

## What stays on your computer

| Data | How it is handled |
|---|---|
| Your prompts | Every word you type into the prompt box is stored locally. When you press send, it goes directly to whichever AI provider you chose and nowhere else. No copy goes to us. |
| The results that come back | Every variant the model generates is saved in a local database on your machine. We never see them. |
| Your files | Anything you drop onto the prompt box (PDFs, documents, images, audio) is read locally by the app. The text extracted from them goes into the prompt you are about to send, and only then does it leave your machine, on its way to the provider you picked. |
| Your API keys | The keys you paste into Settings are stored locally on your machine, in the app's local storage. They are stored the way browser apps store data rather than in a separately encrypted vault, so treat your machine's user account security as the boundary. The app reads them when it needs to make a request to a provider. They are never sent anywhere except to the provider they belong to. |
| Your memory | The running understanding the app builds across sessions is stored locally. It only gets included in a prompt when you send one, and only as much of it as is relevant. |
| Your settings, skills, scheduled runs, history and exports | All local. |

## What touches a server

When you press send, your prompt (with any context the app added, like skill instructions or memory snippets) goes to the model provider you selected. For a connected provider, that means over the internet. It goes directly from your computer to them. We are not in the middle.

The provider then sends back the result, also directly to your computer.

One more case: on the desktop app, research-style runs can use the built-in web search and web fetch tools, which retrieve public web pages directly from your machine to ground findings in sources. Those requests go straight to the sites in question.

If you route to a local provider, such as the [Nightshift hotspot](../nightshift/hotspot.md) at `http://127.0.0.1:8088/v1`, the request goes to the runtime on your own machine. The `meterless/local` routing mode never leaves the machine. Other routing modes follow the routes your runtime is configured for.

If you swap models per node, each node's request goes to the provider for that node. A graph can mix connected and local providers.

That is the network traffic the app makes for your work. Nothing routes through us.

## What we collect

Nothing. We collect nothing about your prompts, your results, your files, or what you typed today. There is no telemetry, no analytics, no phone-home, and no backend on our side at all.

There is no automatic crash reporting. If something breaks, you decide what (if anything) to paste into a GitHub issue when asking for help.

## What the AI provider sees

People often miss this part. When you send a prompt to a connected provider, the provider sees it. They have their own privacy policy that governs what they do with it. Most of the big providers (Google, OpenAI, Anthropic) have business terms that say they will not train on your prompts when you use an API key, but check their current terms to be sure for your specific situation.

If you are working with sensitive content (medical, financial, personal information that does not belong to you, anything proprietary), think about which provider you are sending it to and whether their terms cover your use. We cannot make those choices for you. We can only tell you that we are not in the loop.

## What you control

You can delete any single run from your history at any time. This removes the prompt, the results and the attached files for that run.

You can clear your entire history with one click in Settings. We will ask you to confirm because it cannot be undone.

You can delete memories one at a time, or wipe them all. A deleted memory is never injected into a future prompt.

You can delete a provider's API key, which immediately stops any of your data from going to that provider.

You can uninstall the app. The data folder stays behind when you uninstall, so if you also want to delete that, navigate to `%APPDATA%\com.swarms.meterless.lite` and delete the folder yourself. Once you do, everything is gone from your machine.

## Where things live on your computer

This section helps if you want to look at your data or back it up.

### Desktop version on Windows

Everything lives under the app's data directory, `%APPDATA%\com.swarms.meterless.lite\` (the app's webview profile). The app stores its data browser-style inside that profile:

- An IndexedDB database called `swarms-db`: your projects, runs, artifacts, memories, Markovian run history, memory audit/conflict records, scheduled runs, and missions
- Local storage: your settings, API keys, model-routing preferences, skills, and prompt history

These are not individual files you can pick apart by hand, but you can back the whole folder up by copying it somewhere, and the data survives uninstalling the app.

Mac and Linux desktop builds are planned; their data paths will be documented when those builds ship.

### Web version

Your data lives in your browser's local storage and IndexedDB for the site we serve the app from. You can see it through your browser's developer tools (the Application or Storage tab). Clearing site data for that URL wipes everything. If you use the same browser on multiple devices, each device has its own copy. The data does not sync between them.

If you want to move from the web version to the desktop version (or back), skills can be exported and imported, and artifacts can be downloaded and carried across by hand. The two installs otherwise keep separate data.

## A short note about why we built it this way

We do not want your data. Holding other people's prompts is a liability, and we did not want to run the kind of company that has to think hard about how to protect a database of millions of strangers' private thoughts. So we did not build that database. The app is the whole product. There is no companion service behind it pulling strings.

This means a few things are harder for us. We cannot ship a feature like "search your history from any device" because we do not have your history. We cannot send you a recovery email if you lose your local data because we do not have your email. That is the trade. We think it is the right one.

## Questions

If you read all of this and still are not sure about something specific, open an issue on the repo and ask. We will answer.

If you find something the app is doing that contradicts what is written here, that is a bug and we want to know about it immediately. Report it privately through the Security tab on the [GitHub repository](https://github.com/meterless/swarms) rather than a public issue.
