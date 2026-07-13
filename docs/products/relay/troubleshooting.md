# Troubleshooting

If something broke, start here. Most of the common stuff has a fix that takes under a minute. The list is roughly ordered from most-common to less-common.

## The app takes forever to open the first time

Normal. The first launch can take longer than usual depending on your machine while Relay sets up its local storage. After the first launch, it opens in a couple of seconds.

If you've waited more than five minutes on the first launch and nothing has happened, see "The app won't open at all" further down.

## Windows SmartScreen warned that the installer is unrecognized

Click **More info**, then **Run anyway**. SmartScreen builds reputation over time, and new releases sometimes haven't accumulated enough of it yet. Make sure you downloaded the installer from the official [releases page](https://github.com/meterless/relay/releases).

If your antivirus quarantined the installer outright, see the next item.

## Antivirus flagged Relay as suspicious

A few antivirus tools mistake Relay's input injection code for malware because the same Windows APIs that drive automation are also what some malware uses. The fix is to add an exception:

1. Open your antivirus settings.
2. Find the exclusions or allowlist section.
3. Add the Relay install folder (usually `C:\Program Files\Meterless Relay\`) and the executable inside it.
4. Reinstall Relay if the installer was quarantined and deleted.

This is annoying and we know it. It's a known cost of using the same low-level Windows input APIs that make Relay reliable.

## Login or API key isn't working

Open **Settings → Models**. Confirm the key is pasted with no extra spaces at the start or end. Click **Test connection**.

Common causes when the test fails:

- The key has regional restrictions that don't match where your machine is. Gemini in particular has some regional gates on the free tier.
- The key has run out of credits or hit a rate limit. Check the provider's console.
- There's a corporate firewall or VPN sitting between Relay and the model provider's servers. Try turning the VPN off briefly to confirm.

If the key tests fine in Relay but missions still fail with an auth error mid-run, force-close Relay and reopen it, then re-test the connection.

## The model isn't loading

This usually means one of three things:

1. The model name in your settings has been deprecated by the provider. Open **Settings → Models** and pick a current model from the dropdown.
2. Your account doesn't have access to that specific model. Some providers gate larger models behind paid tiers.
3. The provider is having an outage. Check their status page. Relay can't fix their downtime, but you can switch to a different provider in the meantime under **Model routing**.

## A mission fails because Relay can't find a window

This almost always means a tracked window got closed, or was never tracked in the first place. Open the **Tracked Windows** panel on the left and confirm the window you expected Relay to use is in the list and still has a thumbnail.

If the underlying app got restarted, click the refresh icon next to the tracked window. Relay will reattach to the new instance.

If you wrote a goal that mentions an app by name but never tracked it, Relay will tell you in the plan inspector. Track the window and run the plan again.

## Multi-monitor clicks land in the wrong place

If you're on Windows and your secondary monitor is set to a different DPI scaling than your primary, clicks can land slightly off. The fix:

1. Right-click the desktop and pick **Display settings**.
2. Set both monitors to the same scaling (usually 100% or 125%).
3. Sign out and back in. Windows requires this for the scaling change to apply everywhere.

This is a Windows quirk, not something Relay does wrong, but it can be fixed.

## Vision verification keeps failing on a step that actually worked

The vision check is comparing the live screen to what the planner expected. If the expectation was too strict (it was looking for a specific text label that's now slightly different), the check fails even though the workflow is fine.

Two things worth knowing:

- Relay's mechanical runtime verification is honest by design: a partial capture or an unreadable value yields **unverifiable**, not a false fail. The verification policy has three levels — **strict**, **standard** (the default), and **lenient** — that govern how demanding the checks are.
- Verification enforcement defaults to **shadow** mode, which logs verdicts but never fails or alters your mission. If a verdict is blocking your run, you (or someone on your machine) switched enforcement to **enforce** — switching it back to shadow or off restores observe-only behavior.

## Relay crashes after a Windows update

Windows updates occasionally change behavior Relay depends on, and Relay sometimes needs an update to keep up. Check the [releases page](https://github.com/meterless/relay/releases) for a new version. If there isn't one, file an issue including the version of Windows you updated to, and we'll get a patch out.

## Settings reset after an update

Relay stores settings and history in the local Tauri Store on your machine. If settings didn't survive an update, reconfigure your API keys under **Settings → Models** first — everything else (history, procedural memory, artifacts) is stored under separate keys and usually survives.

## The app won't open at all

In order from most-likely to least-likely:

1. **A previous instance is still running.** Open Task Manager, look for `meterless-relay.exe`, end it, and try again.
2. **A Windows Visual C++ runtime or WebView2 component is missing.** Install the latest Visual C++ Redistributable and Microsoft Edge WebView2 Runtime from Microsoft. Most machines already have both, but a fresh Windows install sometimes doesn't.
3. **The install is genuinely broken.** Uninstall and reinstall from the [releases page](https://github.com/meterless/relay/releases).

If none of that works, file a bug report. Include what happens when you try to launch (does the process briefly show in Task Manager and then die?), and we'll dig in.

---

## Still stuck?

Open an issue at [github.com/meterless/relay/issues](https://github.com/meterless/relay/issues). Tell us your Windows version, your Relay version, and what you were trying to do when it went wrong.
