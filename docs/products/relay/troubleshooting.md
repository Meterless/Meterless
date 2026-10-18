# Relay troubleshooting

If something broke, start here. Most common problems have a fix that takes under a minute. The list runs roughly from most common to least common.

## Where do I get the right installer?

Download Relay from [meterless.ai/relay](https://meterless.ai/relay.html) or the [latest GitHub release](https://github.com/meterless/relay/releases/latest). The current version is v0.8.8, a 3.3 MB installer for Windows 10 and 11. The Meterless Suite installer on the [free tools page](https://www.meterless.ai/tools.html) includes Relay too. Do not install Relay from anywhere else.

## The app takes a while to open the first time

That is normal. The first launch can take longer while Relay sets up its local storage. After that, it opens in a couple of seconds.

If you have waited more than five minutes on the first launch and nothing has happened, see "The app will not open at all" below.

## Windows SmartScreen warned that the installer is unrecognized

Click More info, then Run anyway. SmartScreen builds reputation over time, and a new release may not have enough yet. Make sure you downloaded the installer from one of the official sources above.

If your antivirus quarantined the installer outright, see the next item.

## Antivirus flagged Relay as suspicious

Some antivirus tools mistake Relay's input injection code for malware. The same Windows APIs that drive automation are also used by some malware. The fix is to add an exception:

1. Open your antivirus settings.
2. Find the exclusions or allowlist section.
3. Add the Relay install folder (usually `C:\Program Files\Meterless Relay\`) and the executable inside it.
4. Reinstall Relay if the installer was quarantined and deleted.

This is a known cost of using the low-level Windows input APIs that make Relay reliable.

## An API key is not working

Open Settings → API Keys. Confirm the key has no extra spaces at the start or end. Click Test connection.

Common causes when the test fails:

- The key has regional restrictions that do not match where your machine is. Gemini has some regional gates on the free tier.
- The key is out of credits or hit a rate limit. Check the provider's console.
- A corporate firewall or VPN sits between Relay and the provider. Turn the VPN off briefly to confirm.

If the key tests fine but missions still fail with an auth error mid-run, force-close Relay, reopen it, and test the connection again.

## The model is not loading

This usually means one of three things:

1. The provider deprecated the model name in your settings. Open Settings → Model Routing and pick a current model from the dropdown.
2. Your account does not have access to that model. Some providers gate larger models behind paid tiers.
3. The provider is having an outage. Check their status page. Relay cannot fix their downtime, but you can switch to a different provider in Model Routing in the meantime.

## The Meterless Runtime is not answering

If you route tasks to local models, Relay talks to the Meterless Runtime at `http://127.0.0.1:8088/v1` by default. When the runtime is not answering, the Model Routing tab says so. Your routing preset still applies, but requests fail with a message to start the runtime until it is up.

1. Start Nightshift, or whatever serves your Meterless Runtime, on that machine.
2. Check the address under Settings → API Keys → Meterless Runtime.
3. If the runtime is on another machine on your network, point Relay at that hotspot instead of the loopback default.

The [hotspot page](../nightshift/hotspot.md) covers the runtime's address, token and Auto Detect ports.

## A mission fails because Relay cannot find a window

A tracked window was usually closed, or was never tracked. Open the Tracked Windows panel on the left. Confirm the window you expected is in the list and still has a thumbnail.

If the underlying app was restarted, click the refresh icon next to the tracked window. Relay reattaches to the new instance.

If your goal names an app you never tracked, Relay tells you in the plan. Track the window and run the plan again.

## A scheduled mission did not run, or stopped running

Check three things in the Schedule list:

- **Readiness.** Before each run, Relay finds, focuses or opens each window the plan needs. Make sure those apps are still installed and can open.
- **Auto-pause.** After repeated failures, Relay pauses the schedule automatically. Fix the cause, then turn the schedule back on.
- **Approval gates.** A scheduled run with consequential steps still stops at its gate and waits for you. Check Alerts.

Runs missed while the app was closed follow the schedule's missed-run policy.

## Multi-monitor clicks land in the wrong place

If your secondary monitor uses a different DPI scaling than your primary, clicks can land slightly off. The fix:

1. Right-click the desktop and pick Display settings.
2. Set both monitors to the same scaling (usually 100% or 125%).
3. Sign out and back in. Windows needs this for the scaling change to apply everywhere.

This is a Windows quirk, and the steps above fix it.

## A step is marked failed or unverifiable when it worked

Every step gets a verdict. Relay checks the real window with UI Automation first and uses a vision check only when needed. If the expectation was too strict (it looked for a text label that is now slightly different), the check can fail even though the workflow is fine.

Some background:

- A partial capture or an unreadable value yields unverifiable rather than a false fail.
- The verification policy has three levels: strict, standard (the default) and lenient. They govern how demanding the checks are.
- Enforcement defaults to shadow mode. It logs verdicts but does not fail or alter your mission. If a verdict is blocking your run, enforcement was switched to enforce. Switching back to shadow or off restores observe-only behavior.
- A run that is not verified cannot become a skill. If the step did work, fix the expectation in the plan and run it again.

## A skill or macro step fails after the app's UI changed

Steps target controls by name, so small layout changes usually do not matter. When a step does drift, a skill replay calls a model to repair it and saves the repair as a new version. For a macro, a budgeted vision pass can correct the target and offers the fix as a new revision for you to accept. Check the recording's health badge and fidelity score before you rerun it.

## Relay crashes after a Windows update

Windows updates sometimes change behavior Relay depends on, and Relay may need an update to keep up. Check the [latest release](https://github.com/meterless/relay/releases/latest) for a new version. If there is none, file an issue with the Windows version you updated to, and we will get a patch out.

## Settings reset after an update

Relay stores settings and history in the local Tauri Store on your machine. If settings did not survive an update, reconfigure your keys under Settings → API Keys first. Everything else (history, procedural memory, skills, artifacts) is stored under separate keys and usually survives.

## The app will not open at all

From most likely to least likely:

1. **A previous instance is still running.** Open Task Manager, find `meterless-relay.exe`, end it, and try again.
2. **A Visual C++ runtime or WebView2 component is missing.** Install the latest Visual C++ Redistributable and Microsoft Edge WebView2 Runtime from Microsoft. Most machines already have both. A fresh Windows install sometimes does not.
3. **The install is broken.** Uninstall and reinstall from the [latest release](https://github.com/meterless/relay/releases/latest).

If none of that works, file a bug report. Describe what happens when you launch, for example whether the process briefly shows in Task Manager and then exits. We will dig in.

---

## Still stuck?

Open an issue at [github.com/meterless/relay/issues](https://github.com/meterless/relay/issues). Include your Windows version, your Relay version, and what you were trying to do when it went wrong.
