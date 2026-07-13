# Control Plane Mock

An illustrative, single-file mock of the World Model operator UI. Open `index.html` in any browser — no server, no build step — and click through the five operator capabilities: **inspect, merge, edit, rebuild, repair**.

## What it is (and is not)

This is a **mock of the control-plane contract**, not a working operator tool:

- The **Inspect** and **Audit log** panels render three hard-coded sample entities and their events.
- In the static mock, the **Merge**, **Edit**, **Rebuild**, and **Repair** panels are badged PLACEHOLDER states showing what belongs there. The live version, [`live.html`](live.html), wires all five panels to the actual reference implementation.
- The **Rebuild** panel lists the built-in view names; nothing is rebuilt.
- There is no live World Model instance behind the page.

The deliverable is the contract the mock illustrates. The five capabilities and three roles below are the acceptance criteria for a real control plane — see [`docs/operator-control-plane.md`](../docs/operator-control-plane.md) for the full design and [`AGENTS.md`](../AGENTS.md) §10 for the implementation guide.

## Run it

Open `index.html` in any browser. That's it — the sample data is embedded in the page.

## The five capabilities (the spec)

| Panel | What an operator does here |
|---|---|
| **Inspect** | Browse entities, contexts, relationships. Click anything to see provenance, history, related facts |
| **Merge** | Pick two entities. See a side-by-side diff. Commit a merge as a single alias event. Reversible from audit |
| **Edit** | Correct a fact. The edit is a new event with operator provenance. Original fact is preserved |
| **Rebuild** | Select a view. Wipe and re-project from the event log. Canonical store is untouched |
| **Repair** | Select a source and time window. Replay ingest after a bug fix. Bad events get superseded |

## Audit browser (the spec)

Every state change in a World Model is an event, and a real control plane exposes the event log as a paginated, filterable browser — by entity, source, operator, kind, time window. The mock's Audit tab renders the embedded sample events to show the shape.

This is the answer to "how did the store get into this state?" — always inspectable, always replayable.

## Three roles (the spec)

- **Viewer** — read-only.
- **Editor** — inspect, merge, edit.
- **Admin** — all of the above plus rebuild and repair.

Permissions are enforced at the event-append layer, not just in the UI. A viewer trying to commit an edit gets rejected at the boundary.

## Extending a real control plane

In an implementation built from this spec, the control plane is a thin shell over the World Model library, and every panel is a regular component. The intended extension contract:

```ts
import { registerPanel } from "@meterless/world-model/control-plane";

registerPanel({
  id: "campaign-health",
  label: "Campaign Health",
  view: "campaign-health-view",
  render: (data) => /* your custom UI */,
});
```

## Why this matters

The "canonical store with derived views" pattern is well-understood in event-sourcing literature. What's almost never shipped is the operator surface — the place where a human inspects a bad merge, corrects a fact, and replays a pipeline.

That gap is why most event-sourced systems eventually rot into "we don't touch the data layer anymore, we just throw away the projection and rebuild it from scratch when something goes wrong."

This contract exists so that doesn't happen. A world model with no control plane calcifies.
