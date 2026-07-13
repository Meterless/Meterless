// When you build your own engine per AGENTS.md, import it here instead.
import { Markovian, resetRunSeq } from "../../reference/src/index.ts";

// Watch the cascade pick its level: marker override when the model provides
// state, heuristic extraction when it does not. Run it: npx tsx index.ts
import { CarryoverService, resolveConfig } from "../../reference/src/index.ts";

async function main(): Promise<void> {
  const config = resolveConfig({ chunkSize: 4000, carryoverTokens: 640 });
  const service = new CarryoverService(); // no compressorFn: level 2 is skipped

  const withMarker = await service.next({
    markerState: "COMPLETED: schema drafted\nREMAINING: indexes\nDECISIONS: postgres, jsonb columns\nCONTEXT: catalog service",
    previousCarryover: "",
    chunkText: "(chunk text)",
    config,
  });
  console.log(`explicit marker  -> level=${withMarker.level}\n${withMarker.carryover}\n`);

  const heuristic = await service.next({
    markerState: undefined,
    previousCarryover: "",
    chunkText: "We compared three options at length. Therefore the schema uses jsonb. Key insight: indexes can wait until read patterns exist. Status: schema done, indexes pending.",
    config,
  });
  console.log(`no marker        -> level=${heuristic.level}\n${heuristic.carryover}\n`);

  const truncation = await service.next({
    markerState: "too short",
    previousCarryover: "",
    chunkText: "plain words with no extractable key phrases at all just filler tokens",
    config: resolveConfig({ chunkSize: 4000, carryoverTokens: 128 }),
  });
  console.log(`nothing usable   -> level=${truncation.level}\n${truncation.carryover}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
