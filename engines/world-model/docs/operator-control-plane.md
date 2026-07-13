# Operator control plane

The library is not enough. Real World Model deployments need a place where humans can **inspect, merge, edit, rebuild, and repair** the store.

That place is the control plane.

## What it is

A browser-native operator UI, specified here as acceptance criteria for any implementation. The five capabilities below — inspect, merge, edit, rebuild, repair — plus the audit browser and the three roles are the contract.

This repo ships an **illustrative single-file mock (see also [`control-plane/live.html`](../control-plane/live.html), which runs the actual reference implementation in-browser)** at [`control-plane/index.html`](../control-plane/index.html) (hard-coded sample entities; the Merge/Edit/Repair panels are placeholder states). It shows what the surface looks like; it is not a working operator tool. See [`control-plane/README.md`](../control-plane/README.md).

## The five operator capabilities

### 1. Inspect

Browse the canonical store. Click an entity, see its attributes, its relationships, its history, its facts, its provenance.

- Filter by type, by source, by context, by validity window.
- Click a fact to see which source asserted it and when.
- Click a relationship to see when it was created and whether it's still valid.
- Click an entity ID to see its alias graph (what it merged from, what merged into it).

This is the read-only mode. Operators spend most of their time here.

### 2. Merge

The most consequential operation. Two entities turn out to be the same person, account, article, player.

**The flow**:

1. Operator selects two entities.
2. Control plane shows a side-by-side diff: attributes, relationships, facts, provenance.
3. Operator chooses the primary.
4. The merge is committed as a single `alias` event.
5. All references to the alias resolve to the primary going forward.
6. The audit trail records who merged what, when, and why.

**Reversibility**: every merge is reversible from the audit trail by emitting an inverse `alias` event.

### 3. Edit

Correct a fact. Update an attribute. Add a missing relationship.

Every edit:

- Is recorded as a new event with operator provenance (`{ kind: "manual", by: operatorId }`).
- Supersedes — never overwrites — the prior fact.
- Is reversible by reverting the supersession.

If you find yourself wanting to "fix" the canonical store by editing past events directly, you don't want an edit — you want a **replay** (see Repair).

### 4. Rebuild

A view drifted. Wipe it and re-project from the event log.

```ts
await world.rebuild("graph");
```

Or from the control plane: select the view, click **Rebuild**. The control plane shows progress, replays the relevant events, and swaps the new projection in atomically.

Rebuilds are always safe. The canonical store is untouched.

### 5. Repair

Something is wrong with a source. A bug in the extractor produced bad facts for a week. The fix is in. Now what?

**Replay**:

1. Operator selects the source and the time window.
2. Control plane shows the events to be reprocessed.
3. Operator confirms.
4. The pipeline replays from the source with the fixed extractor.
5. New events tombstone or supersede the bad ones.
6. Affected views rebuild.

The bad events stay in the log for audit. The current state reflects the fixed version.

## Audit log browser

Every state change in World Model is an event. The control plane's audit browser is a paginated, filterable view of the event log.

- Filter by entity, source, operator, kind, time window.
- Click an event to see its full payload and provenance.
- "What changed in the last hour?" is a one-click query.

This is the answer to "how did the store get into this state?" The answer is always: read the log.

## Permissions

The control plane has three roles:

- **Viewer** — inspect only.
- **Editor** — inspect + edit + merge.
- **Admin** — all of the above, plus rebuild and repair.

Permissions are enforced at the event-append layer. A viewer trying to commit an edit gets rejected at the boundary, not in the UI.

## Why a UI, not a CLI

CLIs are fine for ingestion and replay. They are bad for **judgment**.

Merges need side-by-side diffs. Conflict resolution needs context. Repairs need a preview of what will change. None of these are good experiences in a terminal.

The control plane is the judgment surface. The library is the automation surface. They are deliberately separated.
