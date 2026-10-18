#!/usr/bin/env node
// Repo convention checks for the Meterless flagship.
// 1. No empty directories (working-tree drift guard).
// 2. Folder names are lowercase kebab-case. FOLDERS ONLY, files are exempt.
// 3. Root AGENTS.md stays under 100 lines (it is a router, not a manual).
// 4. Banned strings: old org paths, meterless-ai, workspace tooling files.
// 5. No package.json at repo root (spec v2 prohibition; engine-local is fine).
// 6. No em dashes in any Markdown, text or SVG file (tone rule). Generated
//    eval reports are exempt because the eval runner writes them.
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

// Em-dash check: every Markdown, text and SVG file, except generated eval reports.
const EM_DASH_EXT = new Set([".md", ".txt", ".svg"]);
const EM_DASH_SKIP = [path.join("evals", "reports") + path.sep];
function walkEmDash(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { walkEmDash(p); continue; }
    if (!EM_DASH_EXT.has(path.extname(e.name))) continue;
    const rel = path.relative(ROOT, p);
    if (EM_DASH_SKIP.some((s) => rel.includes(s))) continue;
    const text = fs.readFileSync(p, "utf-8");
    const m = text.match(/—|&#8212;/);
    if (m) {
      const line = text.slice(0, m.index).split("\n").length;
      problems.push(`em dash in ${rel}:${line} (tone rule: no em dashes in prose)`);
    }
  }
}
walkEmDash(ROOT);

if (problems.length) {
  console.error(`check-conventions: ${problems.length} violation(s):`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log("check-conventions: all conventions hold. PASS");
