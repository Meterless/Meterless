<div align="center">

# Meterless Nightshift

**Turn your computer into an AI hotspot.**

Your Mac, Windows PC or DGX Spark answers your apps while you work, then races hundreds of attempts at the jobs you leave it overnight.<br/>
In the morning you get the files that passed, with a receipt for every check.

[**Try it free in your browser**](https://meterless.ai/Nightshift/WEB/) · [Windows](https://www.meterless.ai/windows.html) · [Mac](https://www.meterless.ai/mac.html) · [DGX Spark](https://www.meterless.ai/dgx-spark.html) · [See real output](#open-the-files) · [Benchmarks](docs/benchmarks/README.md) · [Free apps](docs/products/README.md)

[![GitHub stars](https://img.shields.io/github/stars/meterless/meterless?style=flat&logo=github&color=yellow)](https://github.com/meterless/meterless/stargazers)
[![Product Hunt](https://img.shields.io/badge/Product_Hunt-Product_of_the_Day-DA552F?logo=producthunt&logoColor=white)](https://www.producthunt.com/products/meterless-ai)
[![NVIDIA Inception](https://img.shields.io/badge/NVIDIA-Inception_member-76B900?logo=nvidia&logoColor=white)](https://www.nvidia.com/en-us/startups/)
[![License: Apache 2.0](https://img.shields.io/badge/license-Apache_2.0-blue.svg)](LICENSE)
[![Benchmarks](https://img.shields.io/badge/benchmarks-failures_included-18E299.svg)](docs/benchmarks/README.md)

<a href="#open-the-files"><img src="docs/images/nightshift-one-night.webp" alt="Animation of real Nightshift output: a night in fast forward where three local models land 202 attempts into two clusters and one result passes every check, live captures of a raymarched HTML scene and a particle-life simulation, period-drama stills, a filmed and scored scene, real turntable renders of two finished 3D models next to the photos they came from, a go-to-market memo with its checks ticking in, and four races still finding new approaches after attempt 250" width="880" /></a>

<sub>Every frame is real Nightshift output: live captures of the generated files and renders from the 3D bench, each with the numbers from its job log.</sub>

| One published night on one DGX Spark | |
|:--|:--|
| Attempts | **202** across three local models |
| Accepted | **1**, after 12 were judged and 3 of 3 files verified |
| Unattended | **5h 15m**, with 72 lane errors survived |
| Cloud spend | **$0.00** |

</div>

---

## Pick your way in

| You want to | Do this | Time |
|---|---|---|
| See what it makes | [Open the files](#open-the-files) from real nights | 1 min |
| Run a job yourself | [Try Nightshift free in your browser](https://meterless.ai/Nightshift/WEB/). Nothing to install. | 2 min |
| Put your own machine to work overnight | [Download for Windows](https://www.meterless.ai/windows.html) (Windows 10 or 11, dedicated GPU, out now), [preorder for Mac](https://www.meterless.ai/mac.html) ($199 one-time, M5 or later), get the [free M1+ version](https://www.meterless.ai/mac.html) for M1 to M4 Macs, or [ask about DGX Spark](https://www.meterless.ai/dgx-spark.html) | |
| Point Cursor or Claude Code at your own hardware | Paste the [provider prompt](docs/agent-ready/add-meterless-provider.md) into your coding agent | 5 min |
| Use free AI apps | [Gaia, Relay and Swarms](#free-apps-on-the-same-runtime) | 2 min |
| Build on the open engines | Run the [90-second memory proof](#the-open-engines), no API keys | 90 s |

---

## Open the files

These came out of overnight Nightshift runs. Each one opens the original file on meterless.ai.

<table>
  <tr>
    <td width="33%" valign="top"><a href="https://www.meterless.ai/orbit-daylight-assets/cistern.html"><img src="docs/products/nightshift/media/card-cistern-lit-from-above.webp" alt="A raymarched cistern lit from above" width="100%" /></a><br/><b>A cistern, lit from above</b><br/><sub>One HTML file. 200 attempts, 94 validated, attempt 148 kept.</sub><br/><a href="https://www.meterless.ai/orbit-daylight-assets/cistern.html">Open it ↗</a></td>
    <td width="33%" valign="top"><a href="https://www.meterless.ai/orbit-daylight-assets/atlas.html"><img src="docs/products/nightshift/media/card-atlas-of-small-attractions.webp" alt="The Atlas of Small Attractions, a small interactive world" width="100%" /></a><br/><b>The Atlas of Small Attractions</b><br/><sub>A world to play in. Herd a living field with shifting rules.</sub><br/><a href="https://www.meterless.ai/orbit-daylight-assets/atlas.html">Play it ↗</a></td>
    <td width="33%" valign="top"><a href="https://www.meterless.ai/orbit-daylight-assets/after-hours.mp4"><img src="docs/products/nightshift/media/card-after-hours-film.webp" alt="After hours: a film still from a scene Nightshift filmed" width="100%" /></a><br/><b>After hours, and a scene scored</b><br/><sub>Film plus music. 141 attempts, 3 local models.</sub><br/><a href="https://www.meterless.ai/orbit-daylight-assets/after-hours.mp4">Watch</a> · <a href="https://www.meterless.ai/orbit-daylight-assets/scene-score.wav">Listen ↗</a></td>
  </tr>
  <tr>
    <td width="33%" valign="top"><a href="https://www.meterless.ai/orbit-daylight-assets/last-light.png"><img src="docs/products/nightshift/media/card-last-light.webp" alt="Last light: a vintage car at sunset on a coastal road" width="100%" /></a><br/><b>Last light, and 29 more frames</b><br/><sub>Stills from a story bible. 299 attempts, 1 local model, 5h 35m.</sub><br/><a href="https://www.meterless.ai/orbit-daylight-assets/last-light.png">Full size ↗</a></td>
    <td width="33%" valign="top"><a href="https://meterless.ai/Benchmarks/KnowledgeWork/nights/D1-gtm-strategy_1.3.0/index.html"><img src="docs/products/nightshift/media/card-gtm-memo.webp" alt="A go-to-market memo Nightshift wrote overnight, with the arithmetic checks it passed and the five drafts it beat" width="100%" /></a><br/><b>18 business deliverables</b><br/><sub>Memos, plans and RFP answers, each checked against an answer key. Every draft is published.</sub><br/><a href="https://meterless.ai/Benchmarks/KnowledgeWork/">Read them ↗</a> · <a href="https://meterless.ai/Benchmarks/KnowledgeWork/nights/D1-gtm-strategy_1.3.0/index.html">Replay a night in 3D ↗</a></td>
    <td width="33%" valign="top"><a href="https://meterless.ai/Benchmarks/3D/"><img src="docs/products/nightshift/media/card-3d-models.webp" alt="Two finished 3D models: a green glass desk lamp and a small green dragon" width="100%" /></a><br/><b>50 textured 3D models</b><br/><sub>From a sentence, a photo or a sketch. 246 of 246 pass the Khronos glTF validator.</sub><br/><a href="https://meterless.ai/Benchmarks/3D/">Turn them ↗</a></td>
  </tr>
</table>

More in the [gallery](docs/products/nightshift/gallery.md). The source records for these files are in [provenance.json](https://www.meterless.ai/orbit-daylight-assets/provenance.json).

---

## Many answers, not one

A prompt to one model returns one answer, and different models' first answers tend to look alike. Nightshift runs a job hundreds of times across several local models and groups the results into distinct approaches. In four real races, new approaches were still appearing after attempt 250.

<img src="docs/images/nightshift-race-clusters.svg" alt="Animated line chart: distinct clusters found as attempts landed in four Nightshift races. Race A reached 37, Race B 33, Race C 35 and Race D 25, all still rising near attempt 250, against a flat line of one answer for a single prompt" width="880" />

Each night ends by condensing its strongest cluster into an insight pack. The next night starts from that pack instead of a blank prompt, and recipes that keep winning are saved as Methods and Skills you can read. No model is retrained.

<img src="docs/images/nightshift-night.svg" alt="Animated: one Nightshift night. A brief goes in, lanes race attempts, scribes read them, clusters form, judges and checks score them, the night settles with signed receipts, and the strongest cluster is distilled for the next night" width="880" />

[How a night works](docs/products/nightshift/how-it-works.md) · [Every job mode, measured](docs/products/nightshift/job-modes.md)

---

## What Nightshift can do today

Nightshift has a broad execution surface for a local AI application.

| Capability | What it enables |
|---|---|
| Multi-model racing | Multiple attempts on the same task |
| Judge and tournament modes | Evaluate and select competing results |
| Deliberation | Multi-step reasoning workflows |
| App generation | Generate applications and check them in a headless browser |
| Refinement and repair | Improve or repair an existing output |
| Bulk operations | Process a corpus of files, such as receipts |
| Folder watchers and schedules | Run work when files change or on intervals |
| Media workloads | Run tasks on specialist media models |
| Thermal management | Protect a GPU during sustained work |

---

## Watch a night generate

<a href="https://www.meterless.ai/how-it-works.html"><img src="docs/images/nightshift-how-it-works.webp" alt="Animated recording of the How it works story: one attempt, then one model turned into many lanes, five models racing attempts, scribes reading the night, attempts gathering into clusters, cluster synthesis producing new answers, and the machine serving other apps as an AI hotspot" width="880" /></a>

<sub>Recorded from the Nightshift field renderer on the <a href="https://www.meterless.ai/how-it-works.html">How it works</a> page. The page drives the field with a sample job, marked DEMO.</sub>

1. **The attempt.** One prompt, one answer. This is how most people use agentic AI today.
2. **The variance filter.** One model runs across personas and temperatures, so no two attempts match.
3. **The search.** A lane per model. Every finished attempt is kept.
4. **The scribes.** Small readers summarize and tag each attempt, so the night becomes searchable.
5. **The cluster.** Related attempts gather into families. Closer to the core means more coherent, not proven.
6. **Cluster synthesis.** Members of a cluster are combined into a new, fuller answer.
7. **Your AI hotspot.** Any app that speaks the OpenAI API can send its requests to the same machine.

---

## How it compares

| | A chat with a model | A cloud agent | Nightshift |
|---|---|---|---|
| Approaches per task | One answer | One path through the task | 25 to 37 distinct approaches per race |
| What comes back | A reply | A result | Files, plus a signed receipt for each check |
| How it is checked | You read it | The agent reports success | A judge model, validators, a browser sandbox and media checks. A check that could not run never counts as a pass. |
| Cost model | Subscription or per token | Per token | Electricity on hardware you own. About 5 cents per verified business deliverable. |
| Where the work lives | Their chat history | Their cloud | Your disk |
| The next run | Starts from zero | Starts from zero | Starts from last night's insight pack |

During the day the same machine is an AI hotspot. Any app that speaks the OpenAI API can use it: Cursor, Claude Code, the Meterless apps, and the experiments below. [How the hotspot works](docs/products/nightshift/hotspot.md).

---

## Editions

| Edition | Runs on | AI hotspot for your apps | Status | Measured |
|---|---|---|---|---|
| **Web** | Your browser | No | [Free, live now](https://meterless.ai/Nightshift/WEB/) | |
| **Windows** 1.2.1 | Windows 10 or 11, 64-bit, dedicated GPU. CUDA on NVIDIA cards, Vulkan on others. | Yes | [Out now](https://www.meterless.ai/windows.html) | [108 of 108 jobs on an RTX 3090](docs/benchmarks/windows.md) |
| **Mac M5+** | Apple Silicon M5 or later, 16 GB or more, macOS 15 or later | Yes | [Preorder](https://www.meterless.ai/mac.html), $199 one-time, delivery Q4 2026 | [24 of 24 winners correct on a 16 GB M5](docs/benchmarks/mac-m5.md) |
| **Mac M1+** | Apple Silicon M1 or later. Small models on the Mac's own GPU. | A local endpoint | [Free download](https://www.meterless.ai/mac.html) | [8 models graded in the app](docs/benchmarks/mac-m1-m4.md) |
| **DGX** | NVIDIA DGX Spark | Yes | [On request](https://www.meterless.ai/dgx-spark.html) | [A month of real nights](docs/benchmarks/dgx-spark.md) |

Hardware notes for every edition are in [editions.md](docs/products/nightshift/editions.md).

---

## Benchmarks, failures included

Every number comes from a job log, a harness record or a test report, and names its machine. Every edition is now measured: Windows, Mac M5, Mac M1 to M4 and DGX Spark.

<a href="docs/benchmarks/README.md"><img src="docs/benchmarks/media/benchmark-library.svg" alt="Overview of eight published Meterless benchmark reports with one headline number each: Windows PC 108 of 108 catalog jobs; Mac M1 to M4 edition engine restarts 19 to 0; agent frameworks +4.29 on Haiku; 3D bench 246 of 246 valid GLBs; job modes 306 of 310 candidates scored; knowledge work 0 to 11 verified deliverables per run; Mac M5 24 of 24 winners correct; real nights 5,361 landed attempts" width="880" /></a>

| What we measured | Result |
|---|---|
| Windows PC, RTX 3090 24 GB, same catalog fleets as the Mac | 108 of 108 jobs completed, 100 winners correct, 3 to 33 s a job against 6 to 472 s on a 16 GB Mac. 553 of 553 jobs in a 3-hour run. |
| Mac M1 to M4 edition, eight on-device models graded in the shipped app | Llama 3.2 3B got 32 of 34 prompts right. Engine restarts with the window closed went from 19 to 0. |
| A month of real nights on one DGX Spark | 361 jobs, 5,361 landed attempts, 1,828 signed receipts, 98% of app requests served locally |
| Verified business deliverables per run, same briefs, four builds | 0, then 3, then 4, then 11 |
| Business briefs within a point of a frontier cloud model, same graders | 13 of 25 |
| Meterless context layer on Haiku 4.5, hidden graders | +4.29 quality points over the same-model baseline |
| Mac M5, 16 GB, catalog fleets after fixes | 24 of 24 jobs completed, 24 of 24 winners correct |
| What did not work, published anyway | Judging covered only 8% of shortlisted candidates until a dedicated judge model fixed it. 12 of 12 generated apps passed "verified", but only 6 of 12 worked. On Windows, a 3B judge crowned a wrong answer in 19 of 42 grid jobs where a correct one was on the table. |

[All benchmarks](docs/benchmarks/README.md) · [Live job replays](docs/benchmarks/knowledge-work.md) · [Example output](docs/benchmarks/examples/README.md) · [What they taught us](docs/architecture/learnings.md)

---

## Free apps on the same runtime

Nightshift is the paid product. These are free, and each can use your Nightshift hotspot as its model provider.

<table>
  <tr>
    <td width="33%" valign="top"><a href="docs/products/gaia/README.md"><img src="docs/products/gaia/media/card-gaia.webp" alt="Gaia, the persistent AI workspace" width="100%" /></a><br/><b>Gaia</b><br/><sub>A workspace that keeps projects, memory, decisions and artifacts across sessions and models. <a href="docs/products/gaia/media/gaia-builds-an-app.mp4">Watch it build an app</a>.</sub></td>
    <td width="33%" valign="top"><a href="docs/products/relay/README.md"><img src="docs/products/relay/media/card-relay.webp" alt="Relay running an AP reconciliation across four desktop windows" width="100%" /></a><br/><b>Relay</b><br/><sub>Describe a desktop job in one sentence. Relay plans it, runs it, checks each step, and replays it later with almost no model calls. <a href="docs/products/relay/media/relay-ap-reconciliation.mp4">Watch a run</a>.</sub></td>
    <td width="33%" valign="top"><a href="docs/products/swarms/README.md"><img src="docs/products/swarms/images/card-swarms.webp" alt="Swarms, an auto-generated agent team" width="100%" /></a><br/><b>Swarms</b><br/><sub>Type one goal and Swarms designs an agent team of 300+ agents in your browser. You keep the graph and can rerun it. <a href="https://meterless.ai/Swarms/">Launch it</a>.</sub></td>
  </tr>
</table>

### Experiments

Apps that only make sense when a model call costs electricity instead of a per-token fee. [All experiments](docs/experiments/README.md).

<table>
  <tr>
    <td width="33%" valign="top"><a href="docs/experiments/meterless-city/README.md"><img src="docs/experiments/meterless-city/media/card-meterless-city.webp" alt="Meterless City: hold C to talk to anyone on a photoreal street" width="100%" /></a><br/><b>Meterless City</b><br/><sub>Talk out loud to anyone in a photoreal city. About 700 NPC turns an active hour, $0 per conversation.</sub></td>
    <td width="33%" valign="top"><a href="docs/experiments/sitcomify/README.md"><img src="docs/experiments/sitcomify/media/card-sitcomify.webp" alt="Sitcomify: a 90s sitcom frame made from one photo" width="100%" /></a><br/><b>Sitcomify</b><br/><sub>One photo in, a 90s sitcom pilot out. Dream Mode keeps writing and filming until you stop it.</sub></td>
    <td width="33%" valign="top"><a href="docs/experiments/dataplant/README.md"><img src="docs/experiments/dataplant/media/card-dataplant.webp" alt="DataPlant: an account 360 with a synopsis written by a local model" width="100%" /></a><br/><b>DataPlant</b><br/><sub>A customer-success platform that re-scores every account in the background. 0 cloud calls.</sub></td>
  </tr>
</table>

---

## The open engines

Everything above runs on four open context engines: memory, state, long-run reasoning and intent routing. Each one is an AGENTS.md implementation spec with a runnable reference and a conformance suite, so a coding agent can build it into your stack and prove it got it right.

<table>
  <tr>
    <td width="50%"><a href="engines/hmem/"><img src="engines/hmem/images/H-MEM_Hero_Image.png" alt="H-MEM: a three-tier memory pyramid (short-term, working, long-term) that captures from every interaction, consolidates into lasting knowledge, dreams, sleeps, and audits with a trust ledger" width="100%" /></a></td>
    <td width="50%"><a href="engines/world-model/"><img src="engines/world-model/images/World_Model_Hero_Image.png" alt="World Model: documents, conversations, signals and actions unified into a living graph of entities, contexts and relationships that powers search, timeline, retrieval and agents" width="100%" /></a></td>
  </tr>
  <tr>
    <td width="50%"><a href="engines/markovian/"><img src="engines/markovian/images/Markovian_Engine_Hero_Image.png" alt="Markovian Engine: long work split into bounded chunks with safe carryover between steps and O(1) context per step" width="100%" /></a></td>
    <td width="50%"><a href="engines/scout-intent/"><img src="engines/scout-intent/images/Scout_Intent_Hero_Image.png" alt="Scout Intent: detects intent from raw input, captures entities and signals, and spots ambiguity before the model runs" width="100%" /></a></td>
  </tr>
</table>

The proof runs on your machine in 90 seconds with no API keys. The same 12-step task runs cold, then warm. The warm run starts with H-MEM memory and finishes in 8 chunks instead of 12. The output below is real; tokens are estimated at chars/4.

<img src="examples/memory-compounding-research/demo.gif" alt="Cold vs warm run: memory saves 4 chunks and 814 estimated tokens" width="560" />

```bash
npx tsx examples/memory-compounding-research/index.ts
```

| Engine | Role | Runs in | Verify |
|---|---|---|---|
| [H-MEM](engines/hmem/) | Hierarchical memory with provenance, dreaming, sleep and an audit trail | Gaia, Meterless City | [conformance](engines/hmem/conformance/) |
| [World Model](engines/world-model/) | Event-sourced state for users, tasks and environments | Relay, Sitcomify, Meterless City | [conformance](engines/world-model/conformance/) |
| [Markovian](engines/markovian/) | Bounded state for long runs, so cost per step stays flat | Nightshift `deliberate` jobs, Meterless City, Swarms | [conformance](engines/markovian/conformance/) |
| [Scout Intent](engines/scout-intent/) | Intent detection, risk checks, tool routing and signed execution contracts | Relay, Swarms | [eval harness](engines/scout-intent/evals/) |

Clone one engine and hand it to your coding agent:

```bash
npx degit meterless/meterless/engines/hmem my-hmem
cd my-hmem/reference && npm install && npm test    # a working reference, green in about a minute
```

Your agent is done when the conformance suite passes: `HMEM_IMPL=<your build> npx tsx conformance/runner.ts`. Read the [engines overview](engines/README.md) and the [architecture](docs/architecture/stack-overview.md).

---

## Paste one prompt

Any AI that can read a link can read this repo. Paste this into ChatGPT, Claude, Cursor or Copilot:

```text
Read the Meterless open-source repo at https://github.com/meterless/meterless.
Start with llms.txt and README.md, then AGENTS.md.
1. Tell me in five bullets what Nightshift and each engine do.
2. Ask me three questions about what I'm building.
3. Give me the exact steps for the one thing I should try first.
```

More in the [prompt library](docs/agent-ready/prompt-library.md).

---

## What we learned

From the benchmarks. The full list, with the run behind each lesson, is in [learnings.md](docs/architecture/learnings.md).

1. Count finished, accepted work. Tokens per second does not tell you that.
2. Use cloud models when someone is waiting. Use your own hardware for work nobody is waiting on.
3. Judging was the bottleneck. A dedicated judge model fixed it.
4. A generated app that loads may still not work. A check that could not run never counts as a pass.
5. Save what worked as written methods. No retraining is needed.

---

## Community

- **Hackathons.** The Open Agent Hackathon 2026 runs October 15 to 20, online, with up to $20,000 in prizes. Meterless has hosted 9 global hackathons with 30,000+ builders through GenAI.Works. [Hackathon guide](docs/community/hackathon-guide.md).
- **Roadmap.** Nightshift for Windows is out now. Nightshift for Mac ships Q4 2026. The next engine specs are swarm-orchestration and runtime. [ROADMAP.md](ROADMAP.md).
- **Contributing.** Start with [CONTRIBUTING.md](CONTRIBUTING.md). Coding agents start at [AGENTS.md](AGENTS.md); other agents at [llms.txt](llms.txt).

Everything in this repo is [Apache 2.0](LICENSE). App installers ship from each app's own repo and from [meterless.ai](https://www.meterless.ai).
