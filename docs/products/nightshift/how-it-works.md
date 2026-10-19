# How Nightshift works

Nightshift is a local AI production control plane. It sits above the runtimes you already have (llama.cpp for language; whisper, stable-diffusion.cpp, ACE-Step and TTS engines for media) and decides what runs, when, on how much of the machine, and whether the result is good enough to keep.

<img src="../../images/nightshift-night.svg" alt="Animated: the seven stages of one Nightshift night, from brief to distilled insight pack, with the continue loop back to the race" width="100%" />

## 01 · The attempt

This is how most people use agentic AI today. You prompt an agent, read the answer, adjust, prompt again. Every round is one attempt at the outcome you asked for.

The question Nightshift asks: what if you could explore the whole set of answers a model could give, instead of going with the first viable one you find?

## 02 · The variance filter

Give a model a job. Its lane sends out attempts while other workers explore, judge or verify. Point Nightshift at any model, local or cloud. A variance filter runs it across different personas and temperatures, so no two attempts are the same.

## 03 · The search

Complementary models explore different approaches: a lane per model. Local ones like Qwen, GPT-OSS and DeepSeek run on your machine. Cloud ones join only if you add a key. Attempts accumulate while you are away. A model too slow for a conversation has all night here. Every finished attempt is kept, so a useful idea does not disappear because it was not first.

## 04 · The scribes

A reading crew summarizes and tags what was made, which makes the whole night searchable. Judges and verifiers then separate promising work from work that meets your bar.

## 05 · The clusters

Related attempts gather into clusters, families of similar answers. You can see where ideas converge, where they disagree, and which directions deserve a closer look. Closer to the core means greater coherence. Agreement is a signal, not proof.

## 06 · Cluster synthesis

Gather a cluster's members, choose a direction, and synthesize a new answer from their useful details and different perspectives. The synthesis is kept beside the attempts it came from.

## 07 · The hotspot

Everything above is not locked inside Nightshift. Add Meterless as a provider in Cursor, Claude Code or any app that speaks the OpenAI API, and its requests land on your machine. Any computer running Nightshift becomes an AI hotspot for your apps. The hotspot runs on the Windows, Mac and DGX editions. See [hotspot.md](hotspot.md).

## 08 · Nights that build

Nightshift keeps every attempt, cluster, judgment and receipt from a finished night.

- **Continue run** folds last night's consensus, open disagreements and best rendition into tonight's attempts.
- **Compounds** join finished nights into one job.
- **Methods** are versioned job defaults mined from a successful night. **Skills** are attached text. Evidence rises only as nights test them.

The loop closes: brief, attempts, clusters, judgment, settled, and on to the next night.

---

## The parts underneath

| Part | What it is |
|---|---|
| **Jobs, not prompts** | A job is durable work. It is queued, checkpointed, survives a restart, and ends with a record, signed receipts and an outcome. |
| **Fleets and lanes** | A fleet is a named set of complementary local models sized to the machine. Each model runs in a lane with a duty: race, judge, verify, generate media, or embed (the scribe). The catalog holds 203 fleets, 130 text and 73 media. Swap a whole crew in one click; missing models download for you. |
| **Checks** | Artifact validators for HTML, code, Markdown, JSON, SVG and CSV. A headless-browser sandbox that opens generated web apps and presses their buttons. An NLI contradiction guard. Byte-level media gates: the file decodes, is the right size, and is not silent, frozen or noise. A check that could not run is recorded as `not_run` and never counts as a pass. |
| **Outcome Contract** | Before a night spends compute it commits to what a usable result is. Afterwards it answers in one of three words: Accepted, Not accepted, Not yet decided. |
| **Makes** | Media is a separate production plane. More than 40 transforms produce stills, clips, narration, music, transcripts, documents, decks and apps. A make is tracked apart from an attempt. |
| **Receipts** | Every routed answer carries a signed receipt. |
| **Two postures** | By day the box is an OpenAI-compatible endpoint for your other apps (Depth). In the quiet window, after ten minutes with no interactive traffic, it switches to Swarm and the night gets the machine. The first interactive request drains jobs back to one lane. |
| **Admission** | On a Mac, plans follow the memory actually free, because your other apps compete for the same unified memory. On a DGX Spark the whole fleet stays resident. |

## Where the work stays

Nightshift keeps every attempt, cluster, judgment, receipt, Method and Skill on your disk. Cloud models join a job only if you add them. Choose local-only and the job never leaves the box. The published September 7 night ran with zero cloud escalations and $0.00 cloud spend.

Next: [job modes](job-modes.md) for every way to shape a job.
