// Engine loader. After `npm run setup`, the H-MEM reference lives in
// vendor/hmem (degit copy). Inside the monorepo, the sibling path works
// without setup. The startup line names which source loaded, so nobody
// debugs the wrong copy.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const CANDIDATES = [
  { label: "vendor/hmem", entry: path.join(here, "..", "vendor", "hmem", "src", "index.ts") },
  { label: "monorepo sibling", entry: path.join(here, "..", "..", "..", "engines", "hmem", "reference", "src", "index.ts") },
];

export interface LoadedEngine {
  HMEM: new (opts: { clock?: () => number; persistDir?: string }) => any;
  source: string;
}

export async function loadHMEM(): Promise<LoadedEngine> {
  for (const c of CANDIDATES) {
    if (fs.existsSync(c.entry)) {
      const mod = await import(pathToFileURL(c.entry).href);
      return { HMEM: mod.HMEM, source: c.label };
    }
  }
  console.error("H-MEM engine not found. Run the setup step first:\n\n  npm run setup\n");
  console.error("(It vendors the reference implementation into vendor/hmem via degit.)");
  process.exit(1);
}
