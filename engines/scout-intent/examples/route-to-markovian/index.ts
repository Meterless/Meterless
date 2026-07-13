import { Scout } from "@meterless/scout";
import { Markovian } from "@meterless/markovian";

async function main() {
  const SECRET = process.env.SCOUT_SECRET ?? "dev";
  const scout = new Scout({ intentRegistry: "./intents.json", signingSecret: SECRET });
  const markovian = new Markovian({ verifyContractsWith: SECRET });

  const decision = await scout.decide({
    prompt: "Plan a 6-month migration of our analytics warehouse to Iceberg, step by step",
    user: { id: "u-1", role: "principal-eng" },
    surface: "chat",
  });

  console.log(`Scout decision: ${decision.executionContract.intent.primary.id}`);
  console.log(`Routed capability: ${decision.toolPlan[0].capability}`);
  console.log(`→ Tool: ${decision.toolPlan[0].tool}`);

  // Canonical handoff: Markovian verifies the contract once at run start
  // (signature + expiry + markovian.chain in scope), then runs the chain.
  const run = await markovian.runFromContract(decision.executionContract, {
    secret: SECRET,
    chunkConfig: { tokensPerChunk: 6000, carryoverTokens: 800 },
  });

  console.log(`\nMarkovian completed ${run.chunks.length} chunks`);
  console.log(`Final answer:\n${run.output.slice(0, 200)}...`);
}

main();
