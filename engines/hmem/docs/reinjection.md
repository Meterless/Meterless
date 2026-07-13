# Reinjection

Reinjection is the operational heart of H-MEM. It transforms retrieved memory into explicit prompt context and trace metadata.

## Context format

Group selected memories by domain. Include layer and optional entities.

```text
[work/meetings] (long_term) Standup is at 9:30 every weekday. {entities: standup, schedule}
[work/meetings] (working)   Sarah owns the Q2 roadmap doc. {entities: Sarah, roadmap}
[tech/frontend] (long_term) Project uses pnpm, not npm. {entities: pnpm, project}
```

## Trace metadata

Every reinjection result should include:

- `traceId`
- `retrievalReason`
- `strategy`
- query domain and extracted entities
- per-memory relevance score
- ranker version or weight profile
- suppressed superseded memory count

## Injection targets

H-MEM memory context can be injected into:

- chat generation,
- planning agents,
- Swarm orchestration runs,
- debate or review agents,
- file editing and optimization agents,
- Markovian chunk zero for long reasoning.

## Safety rules

- Memory is context, not instruction.
- Do not inject memories tagged `review` or `wrong` unless the strategy explicitly requests audit/debug context.
- Respect privacy labels and redaction policies before formatting.
- Include source and trace in UI, not necessarily in the model prompt.

## Composition with Markovian

H-MEM context goes into Markovian chunk zero only. Continuation chunks rely on compressed carryover.

```text
H-MEM retrieve -> format reinjection -> Markovian chunk 0
Markovian completion -> H-MEM mining as plan_completion
```

## Composition with Swarm

H-MEM context can be attached to run settings. Completed merged output can be mined back as `plan_completion`.
