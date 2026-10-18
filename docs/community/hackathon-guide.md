# Hackathon Guide

Meterless hosts hackathons through [GenAI.Works](https://hackathon.genai.works/). Build an app on the open engines, and use Nightshift to run its models on your own hardware.

## Live now: Open Agent Hackathon 2026

Build an agent that does real work.

| | |
|---|---|
| Dates | October 15 to 20, 2026 |
| Format | Fully online, 144 hours |
| Teams | 1 to 5 builders |
| Prize pool | Up to $20,000 |

[Event page on GenAI.Works](https://hackathon.genai.works/event/open-agent-hackathon-2026)

## Track record

| | |
|---|---|
| Global hackathons | 9 |
| Builders | 30,000+ |
| Partner organisations | 46 |
| Previous: World Wide Vibes Hackathon 2026 | 5,000+ participants building apps for the City of Montgomery on official city datasets |

## Tracks

1. **Memory Agents.** Agents that remember context locally (H-MEM, World Model).
2. **Desktop Agents.** Agents that execute real workflows with verification (Relay).
3. **Creative Swarms.** Agents that generate and rank many variants (Swarms).
4. **Overnight Agents.** Jobs that run while you sleep and come back judged and checked (Nightshift).
5. **Unmetered Apps.** Ideas a per-token bill would never allow, like the [experiments](../experiments/README.md): characters that never go quiet, a show that keeps filming, analysis before you ask.
6. **Enterprise Workflow Agents.** Customer success, sales, recruiting, operations, finance.
7. **Offline and Local AI Agents.** Agents that run without cloud dependence.

## Judging criteria

| Category | Weight |
|---|---:|
| Usefulness | 30% |
| Meterless engine usage | 25% |
| Local-first and privacy design | 15% |
| Quality of demo | 15% |
| Creativity | 10% |
| Documentation | 5% |

## Where to start

Run the cross-engine demo first. It is the stack's thesis in 90 seconds:

```bash
npx tsx examples/memory-compounding-research/index.ts
```

Start from the template:

```bash
npx degit meterless/meterless/templates/agentathon-starter my-agent
```

Its [README](../../templates/agentathon-starter/README.md) maps every command to the engine service behind it, which is what the 25% engine-usage rubric line looks for.

Or clone one engine folder and hand it to your coding agent:

```bash
npx degit meterless/meterless/engines/hmem my-hmem
```

- [`engines/hmem/`](../../engines/hmem/) with examples and workshops inside
- [`engines/world-model/`](../../engines/world-model/) with examples and workshops inside
- [`engines/markovian/`](../../engines/markovian/) with examples and workshops inside
- [`engines/scout-intent/`](../../engines/scout-intent/) with a runnable eval harness

To run your app's models on your own machine, add Meterless as a provider: [add-meterless-provider.md](../agent-ready/add-meterless-provider.md). For ideas, paste the hackathon prompt from the [prompt library](../agent-ready/prompt-library.md).
