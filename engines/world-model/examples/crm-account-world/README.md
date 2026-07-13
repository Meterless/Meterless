# CRM account world

> Run it: `npx tsx index.ts` (uses the reference implementation in [`../../reference`](../../reference)).

Replace your CRM schema with a World Model. Accounts, contacts, threads, deals — all entities, contexts, and relationships. The CRM "workflow" becomes a set of queries over derived views, and a custom projection replaces the dashboard.

## What it shows

- Accounts and contacts as entities (Salesforce external keys)
- Threads (email, Slack, calls) as **contexts**
- Deals as **relationships** scoped to a campaign context
- A **custom "stuck deals" projection** — the kind of view a CRM ships as a hard-coded report

Prerequisite reading: [`docs/entity-context-relationship-model.md`](../../docs/entity-context-relationship-model.md), [`docs/read-surface.md`](../../docs/read-surface.md).

---

## Scenario

Two accounts, their contacts, deals in flight, and last-touch threads:

```text
account:acme   ── employs ──▶ contact:jane@acme.com
account:globex ── employs ──▶ contact:raj@globex.com

deal (Acme · $80k · stage=negotiation · last touch 31d ago)   ← stuck
deal (Globex · $40k · stage=proposal  · last touch  3d ago)
```

## Walkthrough

```ts
import { WorldModel } from "@meterless/world-model";

const world = new WorldModel({ storage: "local", namespace: "crm" });

// Accounts + contacts: stable IDs pinned to the Salesforce external key.
for (const acc of [
  { sf: "0015g00000ACME", name: "Acme Corp" },
  { sf: "0015g00000GLBX", name: "Globex" },
]) {
  await world.upsertEntity({
    type: "account",
    externalKey: { system: "salesforce", id: acc.sf },
    attrs: { name: acc.name },
    source: { kind: "api", at: new Date() },
  });
}

for (const c of [
  { email: "jane@acme.com", name: "Jane Doe", acc: "0015g00000ACME" },
  { email: "raj@globex.com", name: "Raj Patel", acc: "0015g00000GLBX" },
]) {
  await world.upsertEntity({
    type: "contact",
    externalKey: { system: "email", id: c.email },
    attrs: { name: c.name },
    source: { kind: "api", at: new Date() },
  });
  await world.relate({
    from: `account:salesforce:${c.acc}`,
    type: "employs",
    to: `contact:email:${c.email}`,
    source: { kind: "api", at: new Date() },
  });
}

// A campaign context scopes the deals.
await world.upsertContext({
  type: "campaign",
  externalKey: { system: "internal", id: "q2-expansion" },
  attrs: { name: "Q2 Expansion" },
  source: { kind: "manual", at: new Date() },
});

// Deals as relationships scoped to the campaign, with stage + last-touch facts.
const now = Date.now();
const DAY = 86_400_000;
await world.relate({
  from: "account:salesforce:0015g00000ACME", type: "has-deal", to: "campaign:internal:q2-expansion",
  attrs: { amount: 80_000, stage: "negotiation", lastTouchAt: now - 31 * DAY },
  source: { kind: "api", at: new Date() },
});
await world.relate({
  from: "account:salesforce:0015g00000GLBX", type: "has-deal", to: "campaign:internal:q2-expansion",
  attrs: { amount: 40_000, stage: "proposal", lastTouchAt: now - 3 * DAY },
  source: { kind: "api", at: new Date() },
});

// "Stuck deals" — a custom projection. This is the CRM report, as a view.
world.registerView("stuck-deals", {
  events: ["relate"],
  initialState: [] as Array<{ account: string; amount: number; idleDays: number }>,
  reducer: (state, event) => {
    if (event.kind === "relate" && event.payload.type === "has-deal") {
      const idleDays = (Date.now() - event.payload.attrs.lastTouchAt) / 86_400_000;
      if (idleDays > 14 && event.payload.attrs.stage !== "closed") {
        state.push({ account: event.payload.from, amount: event.payload.attrs.amount, idleDays: Math.round(idleDays) });
      }
    }
    return state;
  },
});

console.log(await world.view("stuck-deals").get());
```

## Run it

This repo is an implementation spec — `@meterless/world-model` is not a published package. Treat `index.ts` as a reference program against the contract in [`/docs`](../../docs/architecture.md): point the import at your own implementation (built per [`AGENTS.md`](../../AGENTS.md)), then run `npx tsx ./index.ts`.

## Expected output

```text
[{ account: "account:salesforce:0015g00000ACME", amount: 80000, idleDays: 31 }]
```

The Acme deal (31 idle days, still negotiating) is flagged. The Globex deal (3 days) is not.

---

## Why it matters

- **The CRM schema is just entity types.** Accounts, contacts, threads, deals — you did not design a database, you declared types. Add `renewal` next quarter without a migration ceremony.
- **Reports are views, not tables.** "Stuck deals" is a projection over the event log. Change the rule (14 → 21 days) and re-derive; you never wrote a reporting table that can drift from the source of truth.
- **External keys make sync lossless.** Pinning the Salesforce ID means re-importing the same account is a no-op, and every system that knows that account agrees on its World Model ID.
- **Provenance answers the audit question CRMs cannot.** "Why does this deal show negotiation?" → the `relate` event's `source` block, six months later.

## Next

- [`swarm-planning-with-world-context`](../swarm-planning-with-world-context/README.md) — a planner reads this world before generating outreach tasks.
- [`docs/operator-control-plane.md`](../../docs/operator-control-plane.md) — merging the duplicate accounts a real CRM import will create.
