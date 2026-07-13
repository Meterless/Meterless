import { Scout } from "@meterless/scout";
import { Swarm } from "@meterless/swarm";

async function main() {
  const SECRET = process.env.SCOUT_SECRET ?? "dev";
  const scout = new Scout({ intentRegistry: "./intents.json", signingSecret: SECRET });
  const swarm = new Swarm({ verifyContractsWith: SECRET });

  const decision = await scout.decide({
    prompt: "Research the top 3 vector databases and produce a comparison memo",
    user: { id: "u-1", role: "principal-eng" },
    surface: "chat",
  });

  console.log(`Scout decision: ${decision.executionContract.intent.primary.id}`);
  console.log(`Scoped capabilities: ${decision.executionContract.scope.capabilities.join(", ")}`);

  // Canonical handoff: the signed contract IS the entire handoff.
  // Swarm verifies signature + expiry BEFORE building the DAG;
  // scope.capabilities is the DAG's hard ceiling.
  const run = await swarm.startFromContract(decision.executionContract, { secret: SECRET });

  console.log(`\nSwarm run: ${run.status}`);
  console.log(`Merged result preview: ${run.blackboard["__merged__"]?.slice(0, 200)}...`);
}

main();
