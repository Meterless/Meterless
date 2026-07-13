#!/usr/bin/env node
// Repo convention checks for the Meterless flagship.
// 1. No empty directories (working-tree drift guard).
// 2. Folder names are lowercase kebab-case. FOLDERS ONLY, files are exempt.
// 3. Root AGENTS.md stays under 100 lines (it is a router, not a manual).
// 4. Banned strings: old org paths, meterless-ai, workspace tooling files.
// 5. No package.json at repo root (spec v2 prohibition; engine-local is fine).
// 6. No em dashes in the root-authored file set (tone rule; migrated engine
//    prose is exempt and the list below is therefore an explicit include list).
// Exit 0 = clean, exit 1 = violations found.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKIP_DIRS = new Set([".git", "node_modules", ".notebook", "vendor"]);
// GitHub requires these exact names; they are exempt from kebab-case.
const FOLDER_NAME_EXEMPT = new Set([".github", "ISSUE_TEMPLATE"]);
const KEBAB = /^[a-z0-9][a-z0-9.-]*$/;

const problems = [];

function walkDirs(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const visible = entries.filter((e) => !SKIP_DIRS.has(e.name));
  if (dir !== ROOT && visible.length === 0 && entries.length === 0) {
    problems.push(`empty directory: ${path.relative(ROOT, dir)}`);
  }
  for (const e of visible) {
    if (!e.isDirectory()) continue;
    if (!FOLDER_NAME_EXEMPT.has(e.name) && !KEBAB.test(e.name)) {
      problems.push(`folder not lowercase kebab-case: ${path.relative(ROOT, path.join(dir, e.name))}`);
    }
    walkDirs(path.join(dir, e.name));
  }
}
walkDirs(ROOT);

// Root AGENTS.md line budget.
const agents = fs.readFileSync(path.join(ROOT, "AGENTS.md"), "utf-8");
const agentsLines = agents.split(/\r?\n/).length;
if (agentsLines >= 100) problems.push(`AGENTS.md has ${agentsLines} lines; the router must stay under 100`);

// Root tooling prohibition.
for (const banned of ["package.json", "pnpm-workspace.yaml", "turbo.json"]) {
  if (fs.existsSync(path.join(ROOT, banned))) problems.push(`root ${banned} exists; prohibited in v1`);
}

// Banned strings in text files. Concatenated so this checker never matches itself.
const GH = "github.com/";
const BANNED = [GH + "Meterless/", GH + "meterless-ai"];
const TEXT_EXT = new Set([".md", ".ts", ".mjs", ".js", ".json", ".yml", ".yaml", ".html", ".txt", ".tape"]);
function walkText(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkText(p);
    else if (TEXT_EXT.has(path.extname(e.name))) {
      const text = fs.readFileSync(p, "utf-8");
      for (const b of BANNED) {
        if (text.includes(b)) problems.push(`banned string "${b}" in ${path.relative(ROOT, p)}`);
      }
    }
  }
}
walkText(ROOT);

// Em-dash check: explicit include list of root-authored files only.
const EM_DASH_FILES = [
  "README.md", "AGENTS.md", "CONTRIBUTING.md", "ROADMAP.md", "CHANGELOG.md",
  "SECURITY.md", "CODE_OF_CONDUCT.md", "llms.txt", "docs/index.md",
  "docs/architecture/why-meterless.md", "docs/architecture/stack-overview.md",
  "docs/architecture/local-first-agentic-context.md",
  "docs/engines/hmem.md", "docs/engines/world-model.md", "docs/engines/markovian.md",
  "docs/agent-ready/using-with-claude-code.md", "docs/agent-ready/using-with-cursor.md",
  "docs/community/hackathon-guide.md",
  "docs/products/gaia/README.md", "docs/products/relay/README.md", "docs/products/swarms/README.md",
];
for (const rel of EM_DASH_FILES) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p)) continue;
  const text = fs.readFileSync(p, "utf-8");
  const idx = text.indexOf("—");
  if (idx !== -1) {
    const line = text.slice(0, idx).split("\n").length;
    problems.push(`em dash in ${rel}:${line} (tone rule: root-authored prose uses no em dashes)`);
  }
}

if (problems.length) {
  console.error(`check-conventions: ${problems.length} violation(s):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log("check-conventions: all conventions hold. PASS");
