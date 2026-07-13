// When you build your own engine per AGENTS.md, import it here instead.
import { Markovian, resetRunSeq } from "../../reference/src/index.ts";

// Pause markers, tool calls, progress events. Run it: npx tsx index.ts
import { parseMarkers } from "../../reference/src/index.ts";

const chunkOutputs = [
  'Scanning candidate libraries. <PROGRESS>3 of 9 scanned</PROGRESS>\n[STATE_CHECKPOINT]\nCOMPLETED: 3 libraries scanned\nREMAINING: 6 more\nDECISIONS: none yet\nCONTEXT: evaluating http clients',
  'Need current download counts. <NEEDS_TOOL tool="registry-search" input="weekly downloads got, ky, axios"/>\n[STATE_CHECKPOINT]\nCOMPLETED: shortlist of 3\nREMAINING: verify popularity, decide\nDECISIONS: shortlist=got,ky,axios\nCONTEXT: awaiting tool result',
  "Final pick with rationale. [TASK_COMPLETE]",
];

for (const [i, raw] of chunkOutputs.entries()) {
  const parsed = parseMarkers(raw);
  console.log(`chunk ${i + 1}:`);
  if (parsed.progress) console.log(`  progress:   ${parsed.progress}`);
  if (parsed.needsTool) console.log(`  pause:      tool=${parsed.needsTool.tool} input="${parsed.needsTool.input}"`);
  if (parsed.state) console.log(`  state:      ${parsed.state.split("\n")[0]} ...`);
  console.log(`  done:       ${parsed.done}`);
  console.log(`  display:    ${parsed.cleaned.split("\n")[0]}`);
}
console.log("\nThe host fulfills NEEDS_TOOL, then resumes the run with the result injected.");
