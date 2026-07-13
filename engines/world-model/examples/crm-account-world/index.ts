// When you build your own engine per AGENTS.md, import it here instead.
import { WorldModel } from "../../reference/src/index.ts";

async function main() {
  const world = new WorldModel({ storage: "local", namespace: "crm" });

  // Accounts
  await world.upsertEntity({
    type: "account",
    externalKey: { system: "salesforce", id: "0015g00000A1b2cAAA" },
    attrs: { name: "Acme Corp", arr: 240_000, segment: "mid-market" },
    source: { kind: "api", at: new Date() },
  });

  // Contacts
  await world.upsertEntity({
    type: "contact",
    externalKey: { system: "salesforce", id: "0035g00000X9y8zBBB" },
    attrs: { name: "Maya Rodriguez", title: "VP Engineering", email: "maya@acme.example" },
    source: { kind: "api", at: new Date() },
  });

  await world.relate({
    from: "contact:salesforce:0035g00000X9y8zBBB",
    type: "works-at",
    to: "account:salesforce:0015g00000A1b2cAAA",
    source: { kind: "api", at: new Date() },
  });

  // Threads as contexts
  await world.upsertContext({
    type: "email-thread",
    externalKey: { system: "gmail", id: "thread-abc-123" },
    attrs: { subject: "Renewal discussion" },
    source: { kind: "api", at: new Date() },
  });

  // Deal as a relationship within a campaign context
  await world.upsertContext({
    type: "campaign",
    externalKey: { system: "salesforce", id: "renewal-q2-2026" },
    attrs: { name: "Q2 2026 Renewals" },
    source: { kind: "api", at: new Date() },
  });

  await world.relate({
    from: "account:salesforce:0015g00000A1b2cAAA",
    type: "open-deal",
    to: "campaign:salesforce:renewal-q2-2026",
    attrs: { stage: "negotiation", value: 280_000, daysInStage: 14 },
    source: { kind: "api", at: new Date() },
  });

  // Register a "stuck deals" view
  world.registerView("stuck-deals", {
    events: ["relate"],
    initialState: [] as any[],
    reducer: (state, event) => {
      if (
        event.kind === "relate" &&
        event.payload.type === "open-deal" &&
        event.payload.attrs?.daysInStage > 10
      ) {
        state.push({
          account: event.payload.from,
          stage: event.payload.attrs.stage,
          days: event.payload.attrs.daysInStage,
        });
      }
      return state;
    },
  });

  const stuck = await world.view("stuck-deals").get();
  console.log("Stuck deals:", stuck);
}

main();
