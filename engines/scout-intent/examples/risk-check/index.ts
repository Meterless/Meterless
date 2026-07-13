import { Scout } from "@meterless/scout";

async function main() {
  const scout = new Scout({
    intentRegistry: "../classify-simple-intent/intents.json",
    policyPack: "default",
  });

  const tests = [
    {
      label: "Low risk",
      prompt: "Summarize the Q2 board prep",
      user: { id: "u-1", role: "exec" },
    },
    {
      label: "Medium risk — bulk action",
      prompt: "Send recovery emails to all 200 stuck deals",
      user: { id: "u-2", role: "ae" },
    },
    {
      label: "Block — role/surface mismatch",
      prompt: "Delete the Acme account",
      user: { id: "u-3", role: "viewer" },
    },
    {
      label: "PII redaction",
      prompt: "Email maya@acme.example about her phone number 415-555-0172",
      user: { id: "u-4", role: "ae" },
    },
  ];

  for (const t of tests) {
    const result = await scout.guard({ prompt: t.prompt, user: t.user, surface: "chat" });
    console.log(`\n[${t.label}] "${t.prompt}"`);
    console.log(`  level: ${result.level}`);
    if (result.flags.length) console.log(`  flags: ${result.flags.map((f) => f.kind).join(", ")}`);
    if (result.redactions.length) {
      console.log(`  redactions: ${result.redactions.map((r) => r.kind).join(", ")}`);
      console.log(`  redacted prompt: "${result.redactedPrompt}"`);
    }
    if (result.reason) console.log(`  reason: ${result.reason}`);
  }
}

main();
