// When you build your own engine per AGENTS.md, import it here instead.
import { Markovian, resetRunSeq } from "../../reference/src/index.ts";

// Three config profiles and their projected curves. The third profile uses a
// non-zero overlap window, which the engine implements (never ignores).
// Run it: npx tsx index.ts
import { projectionCurve, resolveConfig } from "../../reference/src/index.ts";

const profiles = {
  "information-light": resolveConfig({ chunkSize: 4000, carryoverTokens: 256 }),
  "decision-heavy": resolveConfig({ chunkSize: 8000, carryoverTokens: 1600 }),
  "state-heavy-with-overlap": resolveConfig({ chunkSize: 8000, carryoverTokens: 3200, overlapTokens: 256 }),
};

for (const [name, config] of Object.entries(profiles)) {
  const curve = projectionCurve(config, 10);
  const last = curve[curve.length - 1];
  const saved = ((last.standard - last.markovian) / last.standard) * 100;
  console.log(`${name}: carryover=${config.carryoverTokens}, overlap=${config.overlapTokens}`);
  console.log(`  projected step 10: standard=${last.standard}, markovian=${last.markovian} (${saved.toFixed(0)}% smaller, modeled)`);
}
console.log("\nPick by task shape: light state for generation, heavy state for long decisions.");
