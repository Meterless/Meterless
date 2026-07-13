// Unpublished spec packages: the swarm orchestration engine has not dropped
// yet. Build or wait for it, then point these imports at real implementations.
import { Swarm } from "@meterless/swarm";
import { Markovian } from "@meterless/markovian";

async function main() {
  const SECRET = "dev";
  const swarm = new Swarm({ verifyContractsWith: SECRET });
  const markovian = new Markovian();

  // Register a swarm task kind that uses Markovian inside.
  // Markovian verifies the same contract Swarm passed — once, at run start.
  swarm.registerTaskKind("plan-migration", async ({ input, contract }) => {
    const run = await markovian.runFromContract(contract, {
      secret: SECRET,
      goal: input.goal,
      chunkConfig: { chunkSize: 6000, carryoverTokens: 800 },
      stepFn: async ({ step }) => ({
        content: `Step ${step + 1} plan content. ${step >= 8 ? "<DONE>" : ""}`,
        step: step + 1,
      }),
      stopWhen: ({ output }) => output.includes("<DONE>"),
    });
    return { plan: run.output, chunks: run.chunks.length, markovianRunId: run.id };
  });

  // Mock contract for the example
  const mockContract = {
    contractId: "demo",
    scope: { capabilities: ["swarm.run", "markovian.chain"], user: { id: "u" }, surface: "chat" },
    intent: { primary: { id: "plan.long-horizon" }, parameters: {}, confidence: 0.95, alternates: [] },
    risk: { level: "low", flags: [], redactions: [], approvals: [] },
    issuedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 300_000).toISOString(),
    signature: "mock-signature",
  };

  // Single swarm task — uses Markovian transparently
  const result = await swarm.runSingle({
    contract: mockContract as any,
    kind: "plan-migration",
    input: { goal: "Plan the warehouse migration" },
  });

  console.log("Swarm task output:");
  console.log(`  chunks: ${result.chunks}`);
  console.log(`  plan: ${result.plan.slice(0, 120)}...`);
}

main();
