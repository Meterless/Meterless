# Meterless Docs

Meterless turns the computer you already own into an AI hotspot. [Nightshift](products/nightshift/README.md) is the flagship. The open engines are the context layer underneath it.

<img src="images/meterless-stack.svg" alt="Animated: apps call the Meterless provider; the Meterless Runtime and Nightshift serve them by day and race jobs by night on the open engines and your own hardware" width="820" />

## Sections

- [Nightshift](products/nightshift/README.md): the flagship. How it works, job modes, the hotspot, editions and a gallery of real nights.
- [Benchmarks](benchmarks/README.md): every published run, failures included: Windows, Mac M5, Mac M1 to M4 and DGX Spark, plus live job replays and example output.
- [Products](products/README.md): Nightshift, the free apps (Gaia, Relay, Swarms) and the browser utilities.
- [Experiments](experiments/README.md): Meterless City, Sitcomify and DataPlant.
- [Architecture](architecture/): why Meterless exists, the stack, local-first context, and [learnings](architecture/learnings.md).
- [Engines](engines/): overview pages for H-MEM, World Model, Markovian and Scout Intent.
- [Agent-ready](agent-ready/): Claude Code, Cursor, the [prompt library](agent-ready/prompt-library.md) and the [provider contract](agent-ready/add-meterless-provider.md).
- [Community](community/hackathon-guide.md): hackathons, tracks and judging.

## Engine specs

Each engine ships its full spec and documentation inside its own folder:

- [`engines/hmem/`](../engines/hmem/)
- [`engines/world-model/`](../engines/world-model/)
- [`engines/markovian/`](../engines/markovian/)
- [`engines/scout-intent/`](../engines/scout-intent/)

Future engines (swarm-orchestration, runtime, fulcrum) land as new folders on drop day. See the [roadmap](../ROADMAP.md).

## Products

Product docs live here. Installers live on each app's repo and on [meterless.ai](https://www.meterless.ai).

- [Nightshift](products/nightshift/README.md): AI hotspot by day, overnight production by night
- [Gaia](products/gaia/README.md): the persistent workspace where your work compounds
- [Relay](products/relay/README.md): describe the job, watch it get done, replay it with no model calls
- [Swarms](products/swarms/README.md): the swarm builds itself, you keep it
