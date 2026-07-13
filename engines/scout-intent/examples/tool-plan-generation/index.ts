import { Scout } from "@meterless/scout";

async function main() {
  const scout = new Scout({ intentRegistry: "../classify-simple-intent/intents.json" });

  // Register tools against capabilities
  scout.capabilities.register({
    capability: "world.query",
    toolId: "meterless.world-model.graph",
    availability: () => true,
    cost: { perCall: 0 },
    latency: { p95Ms: 50 },
    invoke: async (input) => ({ ok: true, mock: "world result", input }),
  });

  scout.capabilities.register({
    capability: "swarm.run",
    toolId: "meterless.swarm.execute",
    availability: () => true,
    cost: { perCall: 0.05 },
    latency: { p95Ms: 8000 },
    invoke: async (input) => ({ ok: true, mock: "swarm result", input }),
  });

  scout.capabilities.register({
    capability: "email.draft",
    toolId: "meterless.local-template-drafter",
    availability: () => true,
    cost: { perCall: 0 },
    latency: { p95Ms: 200 },
    invoke: async (input) => ({ ok: true, mock: "draft", input }),
  });

  // Resolved plan
  const plan = await scout.plan({
    intent: "deal.recover",
    parameters: { count: 5, channel: "email" },
    user: { id: "u-1", role: "ae" },
    surface: "chat",
  });

  console.log("Resolved tool plan:");
  for (const step of plan.toolPlan) {
    console.log(`  ${step.capability.padEnd(15)} → ${step.tool}`);
  }

  // Try an intent whose capability has no registered tool
  scout.capabilities.register({
    capability: "world.query",
    toolId: "meterless.world-model.graph",
    availability: () => false, // offline
  });

  try {
    await scout.plan({
      intent: "deal.recover",
      parameters: { count: 5 },
      user: { id: "u-1", role: "ae" },
      surface: "chat",
    });
  } catch (err: any) {
    console.log(`\nGraceful failure: ${err.code} — ${err.message}`);
  }
}

main();
