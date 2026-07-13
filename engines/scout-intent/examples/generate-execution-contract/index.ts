import { Scout, verifyContract } from "@meterless/scout";

async function main() {
  const scout = new Scout({
    intentRegistry: "../classify-simple-intent/intents.json",
    policyPack: "default",
    modelProfiles: "./model-profiles.json",
    signingSecret: process.env.SCOUT_SECRET ?? "dev-secret",
  });

  const decision = await scout.decide({
    prompt: "Find the top 5 stuck deals and draft recovery emails",
    user: { id: "u-123", role: "ae" },
    surface: "chat",
  });

  console.log("Contract issued:");
  console.log(`  id:           ${decision.executionContract.contractId}`);
  console.log(`  intent:       ${decision.executionContract.intent.primary.id}`);
  console.log(`  confidence:   ${decision.executionContract.intent.confidence}`);
  console.log(`  risk:         ${decision.executionContract.risk.level}`);
  console.log(`  capabilities: ${decision.executionContract.scope.capabilities.join(", ")}`);
  console.log(`  expires at:   ${decision.executionContract.expiresAt}`);
  console.log(`  signature:    ${decision.executionContract.signature.slice(0, 32)}...`);

  // Downstream engine verifies the signature before acting.
  // Canonical API: verifyContract(contract, { secret }) → { ok, reason }
  const check = verifyContract(decision.executionContract, { secret: "dev-secret" });
  console.log(`\nVerification at downstream boundary: ${check.ok ? "PASS" : `FAIL (${check.reason})`}`);

  // Tampering check — flip a field
  const tampered = {
    ...decision.executionContract,
    scope: { ...decision.executionContract.scope, capabilities: ["DANGEROUS.tool"] },
  };
  const tamperedCheck = verifyContract(tampered, { secret: "dev-secret" });
  console.log(`Verification after tampering:        ${tamperedCheck.ok ? "PASS" : `FAIL (${tamperedCheck.reason}) — correct`}`);
}

main();
