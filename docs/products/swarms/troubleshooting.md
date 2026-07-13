# Troubleshooting

If something is broken, start here. Most of the common stuff has a fix that takes under a minute.

The problems are ordered roughly by how often we see them, not by how serious they are. A few of the fixes are specific to the desktop .exe version or the web version, and we say so when it matters. Anything not marked applies to both.

## The first launch is taking forever (desktop)

What is happening: the app is setting up its local database, registering itself with Windows, and pre-loading some of the things it needs at runtime. It can take up to a minute on a slower machine the first time.

What to do: wait. If you have been staring at a blank window for more than two minutes, close it and reopen it. The second launch should be much faster (usually under five seconds). If the second launch is also slow, your disk is probably the bottleneck. Try moving the install to an SSD if you have one.

If launches keep taking minutes even after the first one, something else is wrong. Most likely an antivirus scanning the app's data folder on every read. See the next entry.

## The web version is slow to load or showing a blank page

What is happening: usually a stale cached version of the app, a flaky network on the first load, or a browser extension interfering with the page.

What to do: hard-refresh the page. On Windows that is Ctrl+F5. On Mac, Cmd+Shift+R. If the page is still blank after that, open a new private or incognito window and try the URL again. Private windows do not load most extensions, so if it works there, an extension is the culprit. Disable extensions one at a time until you find the one breaking things. Ad blockers and privacy-focused extensions are the most common offenders.

If a hard refresh and a private window both show a blank page, our servers might be having a moment. Try again in a few minutes.

## Antivirus flagged the installer or keeps slowing things down (desktop)

What is happening: new releases sometimes trip up Windows Defender or third-party antivirus tools because they have not seen the file before. This is annoying and we wish there was a way to skip it. There is not.

What to do: if Windows Defender SmartScreen blocks the installer, click "More info" on the warning, then "Run anyway." If your antivirus quarantines the installer, look in the quarantine list and click "Restore" or "Allow." This is safe to do for builds you downloaded from the official [releases page](https://github.com/meterless/swarms/releases), but please double-check the URL before you do anything like this for any installer, ours or otherwise.

If the antivirus keeps slowing the app down after install, add the install folder (the location you picked in the installer — by default under `Program Files`) to your antivirus exclusions list.

## Model is not loading or every run fails immediately

What is happening: the most common reason is that your API key is missing, wrong, or out of credits. The second most common is that the provider is having an outage. The third is that the model you have selected has been deprecated or renamed by the provider.

What to do: open Settings → Cloud Models → API Keys. Check that a key is saved for the provider you are routing to — if that provider's models show dimmed/unavailable in the model picker, the key is missing or invalid, so paste it in again. The app also tells you directly: if no usable key backs the routed model, it opens the API Keys tab with an amber "API key required" banner instead of failing silently. Double-check that the model you have routed for the failing mode still exists in your provider's current catalog; if you are not sure, pick one of the built-in defaults (Gemini on a fresh install) and try again.

If everything looks right and it still fails, the provider may be having an outage. Check their status page. Switch temporarily to a different provider if you have one configured.

## Cannot log in / cannot save settings

What is happening: the app does not have an account system, so there is nothing to log into. If you mean the app keeps forgetting your API keys or settings between launches, the cause depends on which version you are using.

What to do **(desktop)**: close the app. On Windows, open `%APPDATA%` in File Explorer. Find the `com.swarms.meterless.lite` folder (that is the app's data directory). Right-click it, choose Properties, then Security. Make sure your user account has Full Control. Click OK, restart the app, and try saving again. If the folder does not exist, the app could not create it on first launch. Run the app as administrator one time so it can set up the folder, then close it and reopen it normally.

What to do **(web)**: check that you are not running the app in a private or incognito window. Those windows wipe storage when you close them, so anything you saved is gone. Check that your browser is not set to clear site data on exit (this is a setting in most browsers' privacy controls). If you are using a browser like Brave or one with aggressive privacy defaults, the site might need to be added to an allowlist before it can keep data between sessions.

## Sync seems delayed or history is missing

What is happening: there is no cloud sync, so this is almost always a database issue rather than a network issue. Either the local database is locked by another instance of the app, or it has gotten too large for searches to be fast.

What to do: check that you do not have two copies of the app running. Close any duplicates and restart the app so the local database reopens cleanly. Run state is written continuously during a run, so even a crashed or cancelled run should reappear in history and be reopenable. If something important seems gone, back up the app's data folder (desktop: `%APPDATA%\com.swarms.meterless.lite`) before trying anything else.

## GPU is not detected or model calls feel slow

What is happening: this app does not use your GPU directly. Every model call goes to a cloud provider over the network, and the speed depends on the provider, not your hardware.

What to do: if your runs feel slow, the bottleneck is either your internet connection or the provider's response time (or, on big fanouts, the provider's rate limit). Switch to a faster model (Gemini Flash is a good default). Reduce your variant count, or raise the concurrency cap in Settings → Swarm if your provider tier can take it. Check whether the provider is having a slow day.

If you specifically came here looking for local-model support: the app does not run models locally. The registry reserves a slot for local WebLLM inference, but it is disabled in this build.

## App will not open at all (desktop)

What is happening: usually one of three things. A failed update left the install in a broken state. The app's data folder got corrupted. Or Windows is blocking the executable for some reason.

What to do: first try restarting your computer. About a third of "won't open" reports are fixed by this and we feel a little silly recommending it but it really does work.

If that does not help, uninstall the app from Add or Remove Programs and reinstall from a fresh download. Your data is in `%APPDATA%\com.swarms.meterless.lite` and uninstalling does not touch it, so your history and settings survive the reinstall.

If the reinstall also will not open, rename the data folder (just add `.backup` to the end) and launch the app. If it opens with no data, the data folder was the problem. You can copy bits of the backup folder back in carefully, or accept the loss and start fresh.

## Crashes right after an update (desktop)

What is happening: something persisted by the previous version is incompatible with the new one. The local database migrates itself forward automatically, but a corrupted profile can still trip things up.

What to do: close the app. Open `%APPDATA%` and rename the `com.swarms.meterless.lite` folder — just add `.backup` to the end. Reopen the app. It will start completely fresh (default settings, empty history). If it opens cleanly, the old data folder was the problem. Have your API keys handy to paste back in; note that renaming the folder set aside your history and memories along with the settings, so keep the `.backup` folder if you may want anything from it.

If it still crashes after that, open an issue at [github.com/meterless/swarms/issues](https://github.com/meterless/swarms/issues) with your Windows version and what you did right before the crash. We will look at it.

## Settings keep resetting to defaults

What is happening: the app cannot write to its settings file. Usually a permissions thing, occasionally a disk space thing, very rarely an antivirus blocking writes to the data folder.

What to do: check that your disk has at least a few hundred megabytes of free space. Check that the folder permissions on `%APPDATA%\com.swarms.meterless.lite` allow your user to write. If your antivirus has "Folder Protection" or "Controlled Folder Access" enabled (Windows Defender has this), add the app to the allowed list, or add the data folder to the exclusion list.

## Nothing here matches what is wrong

Open an issue at [github.com/meterless/swarms/issues](https://github.com/meterless/swarms/issues). Include a few things: what you tried to do, what happened instead, your operating system version, and the app version. The more concrete you can be, the faster we can help.

If you can attach a screenshot of what you saw, that doubles the chances of a quick fix.
