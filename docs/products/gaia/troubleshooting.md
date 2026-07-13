# Troubleshooting

If something is broken, start here. Most of the common problems have a fix that takes under a minute. They are ordered roughly by how often they come up.

If your specific issue isn't on this page, file a bug with whatever details you have under [Issues](https://github.com/meterless/gaia/issues).

## 1. First launch takes forever

This is normal and only happens once. The very first time Gaia runs, it downloads the local AI model into the app's cache. How long that takes depends on your internet connection and which model is selected. On a fast connection, a few minutes for the smaller models. On a slow connection or for the larger models, it can be ten or fifteen minutes.

You should see a progress indicator while this happens. If you see a progress bar moving, the download is working; just wait.

If the progress is stuck on zero for more than two minutes, the download has failed. The most common cause is your network blocking the model host. Try a different network, or skip the local model for now by adding any cloud API key in Settings → Neural Link (Gaia will route through that key and stop trying to download the local model). You can come back to the local model later.

Once the model has finished downloading once, every later launch loads it from cache in a few seconds. The slow first launch only happens once.

## 2. Antivirus or SmartScreen blocks the install or flags the app

This is the single most common first-day issue. Gaia is a new desktop app that uses real mouse and keyboard input to drive other windows, which is the exact behavior that antivirus heuristics flag as suspicious. There is nothing actually wrong with the app, but a freshly-released installer has not been fingerprinted by enough machines yet for Microsoft Defender or third-party AV to recognize it as safe.

The fix:

When SmartScreen warns you, click "More info," then "Run anyway." This is a one-time thing per major version.

If Defender or another AV moved the installer or any of the app files to quarantine, restore them and add an exception for the Gaia install folder (usually `C:\Program Files\Gaia OS` or `%LOCALAPPDATA%\Programs\Gaia OS`).

If your IT department manages your antivirus and you can't whitelist on your own, send them the executable's hash from the [Releases page](https://github.com/meterless/gaia/releases) and ask them to add an exception.

## 3. Desktop control clicks don't land in a specific app

Desktop control uses real mouse and keyboard input, which works with almost every app — with one Windows caveat: Windows does not allow a normal app to send input to a window that is running elevated (as administrator). If Gaia's clicks and keystrokes land everywhere except one particular app, that app is probably running elevated.

Your options: run that app non-elevated if it doesn't actually need admin rights, or launch Gaia itself elevated for the session where you need to drive that app (right-click the Gaia shortcut → "Run as administrator").

Also make sure a control session is actually active: desktop actions only run against the window you picked in the window picker, so if the session ended, start it again with `@Control` and re-pick the window. Desktop control is only available in the desktop (Tauri) app, not the browser build.

## 4. The local model didn't load

If the chat input is responsive but every message you send returns an error like "no model available" or just hangs forever with no answer, the local model didn't finish loading. The most common reasons:

The first-time download failed or hasn't completed. Open Settings → Local Models and look at the status. If it says "downloading" with a progress bar, just wait. If it says "failed" or "error," click "Retry."

Your browser cache was cleared, which wiped the downloaded model. The model will re-download automatically the next time you send a request, but you have to wait through the download again. To avoid this, don't clear the app's site data.

You don't have enough free RAM or VRAM for the model that was selected. The WebLLM models range from the small Llama 3.2 1B up to 8B, and the bigger ones need several gigabytes of headroom. Close some other apps or switch to a smaller model in Settings → Local Models.

Your machine doesn't support WebGPU, which is what the local models run on. Most computers from 2020 onward support it, but older machines or some integrated graphics setups don't. If WebGPU is unavailable, the local model can't run; your options are to install Ollama and use that, or to add a cloud API key.

Once the model loads successfully, Settings → Local Models shows it as loaded and ready.

## 5. Cloud API key doesn't work

You added a key in Settings → Neural Link, clicked "Test," and it failed. There are only a few real causes.

The key is wrong (typo, missing character, extra space). Re-copy it from the provider's dashboard.

The key is correct but your account has run out of credit, or the provider rejects the key for billing reasons. Check your account on the provider's site.

You are behind a corporate proxy or firewall that blocks the provider's API endpoint. Test by going to the provider's documentation page in a normal browser. If that loads but Gaia can't reach the API, your network is filtering API calls. Your IT team can whitelist the API hostname.

The provider is having an outage. Check the provider's status page.

In all four cases, Gaia falls back to the local model automatically, so you can keep working while you sort it out.

## 6. Memory or chats seem to have disappeared after an update

If you opened Gaia after an update and your chats, plans, or memory look gone, do not start over yet. The data is almost certainly still there, just not visible because the workspace pointer reset.

Check which workspace is active in the workspace switcher. If it shows the default workspace but you had been using a custom one, switch back to your custom one. Workspaces live on disk under the app data folder (`%APPDATA%\com.meterless.gaia\workspaces`), so you can confirm the data is physically there.

If after that your chats are genuinely gone, do not start over yet. File an issue with what version you upgraded from, what version you're on now, and what is missing. We have not seen a case where data was actually lost during an update; the workspace pointer reset has happened a few times and looks identical to data loss until you check. If it's something other than that, we want to know about it before you wipe and start fresh, because the original data may be recoverable from inside the workspace folder by hand.

## 7. App won't open at all after an update

The app installed an update and now double-clicking does nothing. No error, no splash, no process in Task Manager.

Open Task Manager (Ctrl+Shift+Esc), go to the Details tab, and look for `gaia_os.exe`. If it's there but using zero CPU and zero memory, kill it. Then try opening Gaia again.

If that doesn't work, the update partially failed. Reinstall over the top of the existing install (download the latest installer and run it). Your data and settings stay put. Reinstalling does not wipe anything.

If that still doesn't work, fully uninstall and reinstall. Your data still survives, because it is stored in `%APPDATA%\com.meterless.gaia` and the uninstaller does not touch that folder.

## 8. GPU is not being used (or so it seems)

The in-app local models (WebLLM) run on WebGPU, so they need a GPU and driver combination that supports it. Settings → Local Models shows the model load state.

If WebGPU won't initialize, the usual causes:

Your graphics driver is out of date. Update it from your GPU vendor's site (NVIDIA, AMD, or Intel) and restart Gaia.

Your machine doesn't support WebGPU (older hardware or some integrated graphics setups). In that case, WebLLM can't run; install Ollama and use it as the local provider instead (Ollama has its own GPU and CPU paths that support more hardware), or add a cloud API key.

If you want faster local inference than the bundled WebLLM models give you, install Ollama, pull a larger model into it, and route Gaia to it under Settings → Neural Link → Ollama. Ollama uses your GPU natively without the WebGPU layer.

A working GPU does not make Gaia's *responses* faster if your bottleneck is the cloud API. GPU only matters for the local model.

## 9. App crashes shortly after launch, or randomly during use

This is rare but does happen. The most common cause is a stale cache from a previous version. Take a backup first (Settings → Backup), then try reinstalling the latest version over the top — your data and settings stay put.

The storage layer is self-healing: if a store is corrupted, Gaia's storage adapter detects it and recovers automatically on the next launch, and the storage health surface in Settings shows you the state of the local stores.

If crashes continue after a reinstall, please [file an issue](https://github.com/meterless/gaia/issues) describing what you were doing when it happened, along with your OS version and app version.

## 10. Settings reset themselves, or my API keys disappeared

If your settings reverted to defaults after an update or a crash, the settings file got rewritten before the writes were flushed. This is mostly fixed in the latest versions, but if it happens to you:

API keys live in a separate key vault, not the main settings file, so they usually survive. Check Settings → Neural Link first. They are probably still there.

Other settings (theme, shortcuts, model preferences) need to be reset by hand. There is no recovery for these because they are tiny and not worth a backup system. Set them again. They will stick.

If the reset happens more than once, please file a bug. It indicates the settings writer is failing for a reason we want to understand.

## Still stuck?

If your issue isn't here, [file a bug](https://github.com/meterless/gaia/issues) with as much detail as you can give: what you were doing when it happened, what you expected, what actually happened, and (if relevant) your OS version and how much RAM you have.

If you think you've found a security issue, do not file a public bug. Report it privately through [GitHub's security advisory form](https://github.com/meterless/gaia/security/advisories/new).
