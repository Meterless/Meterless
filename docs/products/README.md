# Meterless Products

[Nightshift](nightshift/README.md) is the paid flagship. It turns the Mac or DGX Spark you already own into an AI hotspot for your apps during the day, and runs queued jobs at night. Gaia, Relay and Swarms are free apps, and five free browser utilities handle everyday files on your device. The [experiments](../experiments/README.md) are apps that only make sense when a model call costs electricity instead of a per-token fee.

All of them run on the same open engines in this repo: [H-MEM](../../engines/hmem/), [World Model](../../engines/world-model/), [Markovian](../../engines/markovian/) and [Scout Intent](../../engines/scout-intent/).

---

## Nightshift · the flagship

<a href="nightshift/README.md"><img src="../images/nightshift-night.svg" alt="Animated: one Nightshift night from brief to distilled insight pack" width="100%" /></a>

Create with text, code, images, video, audio and 3D on your own computer. Connect your apps, choose local or cloud models, and leave jobs running while you are away. Nightshift tries hundreds of approaches, sorts them into clusters, verifies and judges the outputs, and learns from each previous run.

| | |
|---|---|
| Web edition | [Free, in your browser](https://meterless.ai/Nightshift/WEB/) |
| Mac edition | [Preorder](https://www.meterless.ai/mac.html), $199 one-time, delivery Q4 2026 |
| DGX edition | [On request](https://www.meterless.ai/dgx-spark.html) |

**[Explore Nightshift →](nightshift/README.md)** · [How it works](nightshift/how-it-works.md) · [Job modes](nightshift/job-modes.md) · [Hotspot](nightshift/hotspot.md) · [Benchmarks](../benchmarks/README.md)

---

## The free apps

<table>
  <tr>
    <td width="33%" align="center" valign="top">
      <a href="gaia/README.md"><img src="gaia/media/card-gaia.webp" alt="Gaia" width="100%" /></a>
      <b>Gaia</b><br/>
      <sub>Persistent workspace · Remember, connect, continue</sub><br/><br/>
      Keep your projects, memory, decisions and artifacts connected across sessions and independent of any one model.<br/><br/>
      <a href="gaia/README.md"><b>Choose Gaia →</b></a>
    </td>
    <td width="33%" align="center" valign="top">
      <a href="relay/README.md"><img src="relay/media/card-relay.webp" alt="Relay" width="100%" /></a>
      <b>Relay</b><br/>
      <sub>Repeatable workflows · Plan, execute, verify</sub><br/><br/>
      Describe the job, inspect the plan, approve what matters, and keep what works as a skill.<br/><br/>
      <a href="relay/README.md"><b>Choose Relay →</b></a>
    </td>
    <td width="33%" align="center" valign="top">
      <a href="swarms/README.md"><img src="swarms/images/card-swarms.webp" alt="Swarms" width="100%" /></a>
      <b>Swarms</b><br/>
      <sub>Coordinated AI · Plan, run, check, synthesize</sub><br/><br/>
      One goal, an auto-generated agent team, and a reasoning graph you keep and rerun.<br/><br/>
      <a href="swarms/README.md"><b>Choose Swarms →</b></a>
    </td>
  </tr>
</table>

| You want | Choose |
|---|---|
| An AI workspace that remembers your projects, context and decisions across sessions, devices and models | [Gaia](gaia/README.md) |
| Agents that operate your real desktop with verification and approval gates, then replay what worked with no model calls | [Relay](relay/README.md) |
| One prompt turned into a coordinated agent team that produces, ranks and refines many distinct variants | [Swarms](swarms/README.md) |
| Hundreds of attempts at a big job while you sleep, judged and checked, on your own hardware | [Nightshift](nightshift/README.md) |

The Meterless Suite installs Gaia, Relay and Swarms in one setup with the five engine primitives (H-MEM, Markovian, Scout, Swarm, World Model) preconfigured. Get it from [meterless.ai/tools](https://www.meterless.ai/tools.html). AI apps support local or connected models. A connected provider may receive the inputs you send and charge for model usage.

---

## Everyday essentials

No account required. Files are processed on your device. An internet connection may be needed to load the app.

| Tool | What it does |
|---|---|
| [Anyfile](https://meterless.ai/FreeTools/anyfile-converter.html) | Convert almost anything, upload nothing: documents, spreadsheets, images, PDFs, Markdown, audio and video |
| [PDF Workbench](https://meterless.ai/FreeTools/pdf-workbench.html) | Merge, split, reorder, rotate, protect and export PDFs locally |
| [Image Batch Studio](https://meterless.ai/FreeTools/image-batch-studio.html) | Resize, compress, crop, watermark and strip metadata across whole batches |
| [Anymedia](https://meterless.ai/FreeTools/media-converter.html) | Convert audio and video: MP4, WebM, GIF, MP3, WAV and OPUS, plus trimming, audio extraction and frame grabs |
| [Watermark Remover](https://meterless.ai/FreeTools/watermark-remover.html) | Clean zero-width characters, unusual spaces and punctuation, with a report of what changed. Cleanup does not guarantee removal of every watermark. |
| WEBtoAPK | Coming soon: turn an HTML, CSS and JavaScript project into an Android app |

You can [vote for the next tool](https://www.meterless.ai/tools.html).

---

## Experiments

| Experiment | Unlocks | In numbers |
|---|---|---|
| [Meterless City](../experiments/meterless-city/README.md) | Characters that never go quiet | ~700 NPC turns an active hour, $0 per conversation |
| [Sitcomify](../experiments/sitcomify/README.md) | A show that keeps filming | One photo in, a 90s sitcom pilot out |
| [DataPlant](../experiments/dataplant/README.md) | Analysis before you ask | Every account re-scored in the background, 0 cloud calls |

---

Product documentation here is Apache 2.0, like everything in this repo. App installers ship from each app's own repo and from [meterless.ai](https://www.meterless.ai). They are never attached to releases on this repo.
