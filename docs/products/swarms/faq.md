# Swarms FAQ

Common questions, from before you open Swarms through your first week with it.

## What does this thing do, in one sentence?

You type one goal, Swarms auto-generates an agent team that plans, parallelizes, reconciles and verifies the work, and you keep the reasoning graph it built.

## Why would I want many answers to the same prompt?

Because the first answer an AI gives you is rarely the best one. Different models' first answers also tend to look alike. Running the same prompt ten times in a chat window means rephrasing the same idea ten times. Running it once here gives you ten meaningfully different angles to pick from, ranked in a gallery. You read them, keep what works, and throw the rest away. Most people end up with a better final answer in less total time.

## Do I have to pay for this?

No. Swarms is free and open source under the Apache 2.0 license. The current release is v0.9.3.

You will need a model provider. Connected providers usually charge for usage. Google has a free tier that works for casual use. Some smaller providers and OpenRouter have free models too. You can also use a local provider, such as the Nightshift hotspot on your own machine.

If you start running fifty variants of long prompts on premium models all day, you will spend money. That money goes to the provider, not to us. We do not see it. Model swapping helps here. Keep a frontier model on the hard nodes and put cheap models on the rest.

## How do I get it?

There are three ways.

- Web: [launch Swarms in your browser](https://meterless.ai/Swarms/). There is nothing to install.
- Desktop: download the latest installer from the [Releases page](https://github.com/meterless/swarms/releases/latest). It is Windows only for now.
- Meterless Suite: one installer sets up Gaia, Relay and Swarms together, with the engines preconfigured. Get it from the [free tools page](https://www.meterless.ai/tools.html).

[Getting started](getting-started.md) walks through each one.

## Web version or desktop version?

The web version runs in your browser. The desktop version is a Windows app you install (.msi or .exe installer). Both do the same things, and your data stays on the same machine in both cases. The desktop version is a little faster to launch, survives clearing your browser data, and adds two desktop-only features: agent web search and fetch tools, and the mobile remote. Mac and Linux desktop installers are planned but not available yet.

You can use both, but they do not share data with each other. Skills can be exported from one install and imported into the other. Artifacts can be downloaded and carried across by hand.

## What is the reasoning graph, and why do I own it?

Every run is saved as a graph (a DAG) of the steps that produced the answer. Other AI tools make you pay to re-run the model every time. Swarms keeps the graph so you can run it again.

- Inspect any node to see its model, tokens and score.
- Edit the graph to refine it: select, describe, diff, apply.
- Swap any model onto any node.
- Rerun it from history, branch it, or schedule it.

## Can I use a different model on different steps?

Yes. Any model can run on any node. Use a frontier model for the hard parts and a cheap model for the rest. A first run can use a frontier model, and later runs can use cheaper models on the refined graph.

## What is the gallery?

Every output lands in a ranked gallery sorted by goal-fit, lineage and renderability. Artifacts include HTML, CSS patches, SVG, YAML graphs, TypeScript, SQL, JSON, Markdown and more. Patches reconcile against their target. Similar variants collapse into families, so fifty outputs stay readable.

## Do I have to re-run the whole swarm to fix one result?

No. Open the result and hit Refine. Click any element to comment on it, edit inline, and re-run from there. Only that branch re-runs. The rest of the swarm does not restart.

## Can it run on a schedule?

Yes. Any graph can be scheduled to run automatically, from once a day to the first of the month. The schedule lives on your computer, and the app needs to be open when a run is due. [Features](features.md#running-graphs-on-a-schedule) covers the catch-up and conflict policies.

## Can I use the Nightshift hotspot as a provider?

Yes. If you run [Nightshift](../nightshift/README.md) on your own machine, its [hotspot](../nightshift/hotspot.md) is an OpenAI-compatible provider. Point Swarms at `http://127.0.0.1:8088/v1` and send the bearer token the runtime writes to `<stateDir>/proxy-token`.

Model ids are routing modes, such as `meterless/auto`, `meterless/fast`, `meterless/deep`, `meterless/cheap`, `meterless/local` and `meterless/fusion`. Pick `meterless/local` when the work must never leave the machine.

## What is the difference between Swarms and Nightshift?

Swarms brings breadth to one prompt in your browser. You type a goal, a team fans out, and you get a ranked gallery and a graph you can keep refining.

[Nightshift](../nightshift/README.md) gives that breadth the whole night. It races hundreds of attempts overnight on your own hardware, with judges and checks. Nightshift races of 250 to 300 attempts found 25 to 37 distinct solution clusters and were still finding new ones after attempt 250.

Use Swarms when you want breadth right away. Use Nightshift when the work is big enough to run overnight.

## How does Swarms relate to Gaia and Relay?

They are the three free Meterless apps. Use [Gaia](../gaia/README.md) when the project, memory and results need to persist across sessions. Use [Relay](../relay/README.md) to turn a job into a repeatable workflow.

## Does it work offline?

The desktop version opens fully offline. The app is embedded in the installed binary, and your saved work lives in a local database, so you can browse and re-read everything you have done without a connection. The web version needs the network to load the page, but your saved work is stored locally in the browser, not on a server.

New runs need a model provider. A connected provider needs the internet. A local provider, such as the Nightshift hotspot on `meterless/local`, keeps the model calls on your machine.

## Is my data safe?

Your data does not leave your computer except as part of the prompts you actively send to your chosen model provider. We do not have a database of your prompts. We do not have a copy of your files. There is no account system, so we do not even know who you are. The full breakdown is in [privacy](privacy.md).

One caveat: a connected provider sees the prompts you send it. Their privacy practices apply to whatever you send them. Pick providers whose terms you are comfortable with.

## What is the difference between this and using ChatGPT or Claude directly?

A few things, depending on what matters to you.

| The provider's web app | Swarms |
|---|---|
| Gives you one answer per prompt. | Gives you many at the same time, with the angles already varied for you and the results ranked. |
| Makes you pay to re-run the model every time. | Keeps the reasoning graph, so you can rerun it on cheaper models. |
| Loses context the moment you start a new chat. | Remembers across sessions and carries forward whatever is relevant. |
| Shows you what the provider wants to show you. | Runs locally, so your prompts and results never sit on someone else's server the way they do in a web app. |
| Is hard to script or schedule. | Lets you set up runs to repeat on a schedule. |
| Is locked to that provider. | Lets you switch between providers per run, or per node. |

If you only ever need to ask one question at a time, you might not need Swarms. It is built for people who run the same kind of prompt over and over, want to compare what different models say, or want their AI work to live on their own computer.

## Can I use it for work things?

You can. The thing to think about is what your model provider's terms say about the kind of content you are sending them. We do not see your prompts, so the question is between you and them. The major providers' API terms (Google, OpenAI, Anthropic) usually allow business use and do not train on your inputs by default, but read their current terms to be sure for your case.

If you work in a regulated industry (healthcare, finance, legal), check with whoever handles compliance at your job before sending anything sensitive through any AI service, including this one.

## What happens if I delete the app?

For the desktop version, your data folder stays behind when you uninstall. Reinstalling later picks up where you left off. If you want everything gone, delete the data folder yourself. The path is in [privacy](privacy.md).

For the web version, closing the tab does nothing to your data. Clearing your browser's site data for our URL is what removes it. Doing that is permanent.

## Why is the first launch so slow?

The desktop app sets up its local database, registers itself, and pre-loads things it needs. This can take up to about a minute on a slow machine. Later launches are fast (usually under five seconds). If your second launch is still slow, see [troubleshooting](troubleshooting.md).

## Can I share my history with someone else?

Not as one bundle. Individual artifacts can be downloaded (HTML artifacts come as a self-contained zip) and sent to anyone, and your skills can be exported as a file that someone else can import into their own copy. Anything you share is a copy, not a link, so what they do with it does not affect your install.

## How do I report a bug?

Open an issue at [github.com/meterless/swarms/issues](https://github.com/meterless/swarms/issues). Tell us what you tried to do, what happened instead, your operating system, and the app version. A screenshot helps a lot.

## How do I report a security problem?

Do not open a public issue. Report it privately through the Security tab on the [GitHub repository](https://github.com/meterless/swarms) (a private vulnerability report or security advisory).

## Is there a mobile app?

There is no standalone mobile app. What ships today is a mobile remote built into the desktop version. The desktop shows a QR code, your phone scans it, and the two connect directly over your local network (WebRTC, no cloud relay). From the phone you can submit and enhance prompts and watch live run state mirrored from the desktop. The desktop app does the actual work.
