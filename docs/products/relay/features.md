# What Relay can do

This is the user-facing tour of the app. It's organized by what you're trying to get done, not by what's happening under the hood. If you want the architectural version, the [Relay overview](README.md) and the [Meterless architecture docs](../../architecture/stack-overview.md) have it.

## Turn a written instruction into a real workflow

You type what you want done. Relay writes a plan. You look at the plan. You run it. That's the core loop.

The instruction can be specific (*open Outlook, find the most recent email from Alex, forward it to Sam with a one-line note*) or it can be loose (*do the morning report*). When it's loose, Relay leans on what it's learned from past runs to fill in the blanks. When it's specific, Relay follows it more literally.

Plans are shown to you in plain English before any clicks happen. You can cancel at that step with no harm done.

## Pay attention to specific windows

Relay does its best work when you've told it which windows on your desktop matter. You can track up to eight windows at once. Each tracked window gets a stable identity, so Relay refers to it the same way today as it did yesterday, even if you closed and reopened the app.

This is also what fixes the problem most automation tools have with two windows that have the same title. Relay knows them apart at the OS level.

## Verify with screenshots between steps

After Relay clicks something important, it can take a screenshot and look at it before moving on. If the screen doesn't look the way it expected, it pauses and tells you what's off.

You don't have to configure this. The planner marks critical steps for verification, and a mechanical post-step check runs alongside it in shadow mode by default — logging verified / failed / unverifiable verdicts without ever blocking your run unless you opt in to enforcement.

## Pause for your approval before sensitive actions

Some steps shouldn't run without you watching. Sending an email. Submitting a payment. Posting publicly. Anything you'd want one last look at.

Relay marks these as approval gates. When a plan reaches one, the app pings you, shows you a screenshot of exactly what's about to happen, and waits. You click continue or cancel. Nothing happens in the meantime.

You can mark any step in a plan as an approval gate by hand, even ones Relay didn't flag itself.

## Capture what shows up on the screen

When a workflow produces something useful (an extracted table, a generated file, a vision read of a chart), Relay saves it into a workspace. You can scroll back through everything it has ever pulled off your screen for you, by mission.

The workspace holds the last 200 captures. Older ones get rolled off.

## Remember workflows so the next run is faster

Every time a mission succeeds, Relay quietly takes notes. Which apps were involved. What the goal looked like. Which steps were doing the real work.

The next time you ask for something similar, that note gets pulled in before the planner writes the new plan. The practical effect is that your second, third, and fourth runs of a similar workflow are shorter and faster. You don't have to do anything to turn this on.

Remembered procedures carry success and failure counters, and their influence fades over time if they stop being used (a 30-day half-life), so stale habits don't dominate fresh plans.

## Search the web before planning, when it helps

For goals where context matters (*find the current support email for company X and open a draft to them*), Relay can do a quick web search before it writes the plan. This is only on when the model you're using supports it. Gemini does it natively. The setting is in the per-mission options.

You'll see "Researched the web" as one of the early phases in the plan when this happens.

## Record what you do and play it back

If you can't describe what you want, you can show it. Macro recording captures both Relay's own automation steps and your raw OS-level input, anchors every recorded window to the Desktop World Model, and replays recordings later through a four-tier window resolver. Recordings can also be compiled into a mission plan for the workflow engine.

Recordings are editable assets, not opaque logs. The Timeline Editor lets you delete and reorder steps, edit typed text and delays, insert waits, mask a value as a secret, or promote a literal to a parameter — with edits kept as append-only revisions. Each recording carries a health badge and a 0–100 fidelity score so you know which routines are safe to rerun. If the UI drifts and a replayed step fails, a budgeted vision pass can correct the target — and the fix is offered as a new revision for you to accept, never silently applied.

Password fields are captured as masked steps, never plaintext, and masked values are re-prompted at replay time.

## Drive it live, one action at a time

Live Mode is a guided real-time loop: you issue one instruction at a time against tracked windows — including plain-language "click the Apply button" clicks that resolve to real UI elements, or point/region annotations you draw on the window — and Relay decides a single action, executes it, verifies the result, and records each successful step. Destructive actions (Send / Submit / Delete / Pay) pause the session for explicit confirmation. When you're done, a finalize-review lets you toggle, edit, and rename steps before saving, and Relay can draft a reusable Skill Card straight from the session. Sessions can be paused and resumed later.

## Turn successful runs into Skills

When a mission, macro, or Live session succeeds, Relay can distill it into a Skill: a versioned, parameterized mission plan (URLs, filenames, and typed text become `${placeholders}`) with per-step provenance, verification probes, and append-only version history. Distillation is always human-gated by a review diff before anything is saved. Each Skill tracks a Deterministic Execution Ratio (DER) — the share of steps that ran with zero model calls — so you can see which routines have hardened into repeatable muscle memory. Skills replay through the same workflow engine as any mission.

## Verify steps mechanically, not just visually

Alongside vision checks, Relay verifies steps against the OS itself with no model in the loop. After a step succeeds, a bounded UI-Automation snapshot of the real window is checked against the step's postconditions, yielding a three-valued verdict: verified, failed, or unverifiable. Absence of evidence is reported as unverifiable — never a false pass, never a false fail. Verification ships in shadow mode by default: it logs verdicts on every eligible run but never fails or alters your mission until you deliberately switch enforcement on.

## Schedule missions to run on their own

Any saved mission — or a macro recording, scheduled directly — can become a recurring job: once, daily, weekly, or monthly, anchored to a wall-clock time. Before each run, Relay resolves a window-readiness manifest derived from the plan's steps, finding, focusing, or opening every window the plan needs. Runs missed while the app was closed are caught up on next launch.

## Mix and match AI providers per phase

You don't have to commit to one model. You can have Gemini do the web research, Anthropic or OpenAI do the planning, and a lightweight vision model do the per-phase screen checks, in the same mission. Relay supports Google Gemini, Anthropic Claude, OpenAI GPT, the OpenCode Go open-weight gateway, and OpenRouter — and a right-sidebar override can force every task onto one model.

Most people leave the defaults alone. If you're doing high volume work and want to optimize for cost or speed, this is where to tune.

## Replay any past goal or plan

Every goal you've typed is saved (last 100). Every plan Relay has written is saved (last 80). You can scroll through past goals with **Ctrl+↑/↓** inside the composer, or browse your history to see them all.

Click any past plan to load it. Click run to do it again. Or fork it as the starting point for a new mission. History entries can be exported and imported (merge-by-id, later wins).

## Run the same mission across multiple windows

If your workflow needs to touch the same kind of window in several places (three Chrome tabs, two open spreadsheets, four CRM accounts), you can track them all and write one mission that handles them together. Relay keeps the windows distinct and won't confuse the data.

## Keep everything local

Your tracked windows, your past goals, your past plans, your procedural memory, your captured artifacts. All of it lives locally on your computer. The only thing that leaves the machine is what gets sent to whichever AI provider you've configured. There's a whole page about this in [privacy.md](privacy.md).

---

If something in here sounds interesting and you want to try it, the [getting started guide](getting-started.md) is the fastest way to feel any of this work in practice.
