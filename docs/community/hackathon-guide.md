# Hackathon Guide

Meterless hackathon tracks:

1. **Memory Agents.** Build agents that remember context locally (H-MEM, World Model).
2. **Desktop Agents.** Build agents that execute real workflows (Relay).
3. **Creative Swarms.** Build agents that generate and rank many variants (Swarms).
4. **Enterprise Workflow Agents.** Customer success, sales, recruiting, operations, finance.
5. **Offline/Local AI Agents.** Agents that run without cloud dependence.

## Judging criteria

| Category | Weight |
|---|---:|
| Usefulness | 30% |
| Meterless engine usage | 25% |
| Local-first/privacy design | 15% |
| Quality of demo | 15% |
| Creativity | 10% |
| Documentation | 5% |

## Where to start

Run the cross-engine demo first; it is the stack's thesis in 90 seconds:

```bash
npx tsx examples/memory-compounding-research/index.ts
```

The fastest entry points are the engine specs and their examples:

- [`engines/hmem/`](../../engines/hmem/) with examples and workshops inside
- [`engines/world-model/`](../../engines/world-model/) with examples and workshops inside
- [`engines/markovian/`](../../engines/markovian/) with examples and workshops inside

Clone one engine folder and hand it to your coding agent:

```bash
npx degit meterless/meterless/engines/hmem my-hmem
```

Start from the template: `npx degit meterless/meterless/templates/agentathon-starter my-agent` ([templates/agentathon-starter/](../../templates/agentathon-starter/)); its README maps every command to the engine service behind it, which is what the 25% engine-usage rubric line looks for.
