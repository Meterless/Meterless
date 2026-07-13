#!/usr/bin/env node
/**
 * Append a labeled example to the v1 regression set.
 *
 * Usage:
 *   npm run evals:add -- \
 *     --prompt "Recovery emails for stuck deals" \
 *     --intent "deal.recover" \
 *     --params '{"channel":"email"}' \
 *     --risk "medium"
 *
 * Optional flags:
 *   --toolPlan '["world.query","swarm.run"]'
 *   --injection true|false      (routes the example to injection/adversarial.jsonl)
 *   --role ae --surface chat
 *   --tags "deal,bulk"
 *   --file intents/deal.jsonl   (relative to evals/regression-set/v1/)
 *
 * The corpus is append-only at the example level: this tool never edits or
 * removes existing lines.
 */

import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { userInfo } from "node:os";

const __dirname = dirname(fileURLToPath(import.meta.url));
const V1 = join(__dirname, "../regression-set/v1");

function parseArgs(argv: string[]): Record<string, string> {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
      args[key] = val;
    }
  }
  return args;
}

function fail(msg: string): never {
  console.error(`evals:add — ${msg}`);
  process.exit(1);
}

const args = parseArgs(process.argv.slice(2));

if (!args.prompt) fail("--prompt is required");
const isInjection = args.injection !== undefined;
if (!args.intent && !isInjection) fail("--intent is required (or pass --injection true/false)");

let params: Record<string, unknown> | undefined;
if (args.params) {
  try { params = JSON.parse(args.params); } catch { fail(`--params is not valid JSON: ${args.params}`); }
}
let toolPlan: string[] | undefined;
if (args.toolPlan) {
  try { toolPlan = JSON.parse(args.toolPlan); } catch { fail(`--toolPlan is not valid JSON: ${args.toolPlan}`); }
}

// Pick the target file: explicit --file, or injection/adversarial.jsonl for
// injection labels, or intents/<family>.jsonl keyed by the intent family.
let relFile = args.file;
if (!relFile) {
  if (isInjection) {
    relFile = "injection/adversarial.jsonl";
  } else {
    const family = args.intent!.split(".")[0].toLowerCase();
    const familyFile = `intents/${family}.jsonl`;
    relFile = existsSync(join(V1, familyFile)) ? familyFile : "intents/added.jsonl";
  }
}
const target = join(V1, relFile);
mkdirSync(dirname(target), { recursive: true });

// Unique, human-scannable id: <slug>-<base36 timestamp>.
const slug = (args.intent ?? (isInjection ? "inj" : "example")).replace(/[^a-zA-Z0-9.]+/g, "-");
const id = `${slug}-${Date.now().toString(36)}`;

// Guard against accidental duplicate prompts in the same file.
if (existsSync(target)) {
  const existing = readFileSync(target, "utf-8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
  if (existing.some((e: any) => e.prompt === args.prompt)) {
    fail(`an example with this exact prompt already exists in ${relFile}`);
  }
}

const expected: Record<string, unknown> = {};
if (args.intent) expected.intent = args.intent;
if (params) expected.parameters = params;
if (args.risk) expected.risk = args.risk;
if (toolPlan) expected.toolPlan = toolPlan;
if (isInjection) expected.injection = args.injection === "true";

const example = {
  id,
  prompt: args.prompt,
  user: { role: args.role ?? "ae" },
  surface: args.surface ?? "chat",
  expected,
  tags: args.tags ? args.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
  meta: {
    createdAt: new Date().toISOString(),
    labeler: process.env.EVAL_LABELER ?? userInfo().username ?? "unknown",
  },
};

appendFileSync(target, JSON.stringify(example) + "\n");
console.log(`Added ${id} to evals/regression-set/v1/${relFile}`);
console.log(JSON.stringify(example, null, 2));
