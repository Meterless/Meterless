#!/usr/bin/env node
// Smoke-runs every runnable example and reference test suite in the repo.
// - For each engines/<e>/reference/: npm ci (or npm install without lockfile), npm test.
// - For each engines/<e>/examples/*/index.ts and examples/*/index.ts: npx tsx with a
//   120s timeout, SKIPPED when it still imports an unpublished @meterless/* package
//   (expected for cross-engine examples until their sibling reference lands).
// Prints a run/skipped/failed table. Exit 0 when failed = 0.

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const results = { run: [], skipped: [], failed: [] };

function sh(cmd, args, cwd) {
  const isWin = process.platform === "win32";
  return spawnSync(isWin ? "cmd" : cmd, isWin ? ["/c", cmd, ...args] : args, {
    cwd,
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 120_000,
    env: { ...process.env, CI: "1" },
    encoding: "utf-8",
  });
}

const enginesDir = path.join(ROOT, "engines");
const engineNames = fs.existsSync(enginesDir)
  ? fs.readdirSync(enginesDir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name)
  : [];

// 1. Reference test suites.
for (const engine of engineNames) {
  const ref = path.join(enginesDir, engine, "reference");
  if (!fs.existsSync(path.join(ref, "package.json"))) continue;
  const installer = fs.existsSync(path.join(ref, "package-lock.json")) ? "ci" : "install";
  if (!fs.existsSync(path.join(ref, "node_modules"))) {
    const inst = sh("npm", [installer, "--no-audit", "--no-fund"], ref);
    if (inst.status !== 0) {
      results.failed.push(`${engine}/reference (npm ${installer}): ${String(inst.stderr).slice(-400)}`);
      continue;
    }
  }
  const test = sh("npm", ["test", "--silent"], ref);
  (test.status === 0 ? results.run : results.failed).push(
    test.status === 0 ? `${engine}/reference npm test` : `${engine}/reference npm test: ${String(test.stdout + test.stderr).slice(-600)}`
  );
}

// 2. Examples.
function exampleFiles() {
  const found = [];
  for (const engine of engineNames) {
    const ex = path.join(enginesDir, engine, "examples");
    if (!fs.existsSync(ex)) continue;
    for (const d of fs.readdirSync(ex, { withFileTypes: true })) {
      if (!d.isDirectory()) continue;
      const f = path.join(ex, d.name, "index.ts");
      if (fs.existsSync(f)) found.push({ engine, file: f, label: `${engine}/${d.name}` });
    }
  }
  const rootEx = path.join(ROOT, "examples");
  if (fs.existsSync(rootEx)) {
    for (const d of fs.readdirSync(rootEx, { withFileTypes: true })) {
      if (!d.isDirectory()) continue;
      const f = path.join(rootEx, d.name, "index.ts");
      if (fs.existsSync(f)) found.push({ engine: engineNames.find((e) => fs.existsSync(path.join(enginesDir, e, "reference"))) ?? null, file: f, label: `examples/${d.name}` });
    }
  }
  return found;
}

for (const { engine, file, label } of exampleFiles()) {
  const text = fs.readFileSync(file, "utf-8");
  const importsUnpublished = /from\s+["']@meterless\//.test(text);
  if (importsUnpublished) {
    results.skipped.push(`${label} (imports unpublished @meterless/* package)`);
    continue;
  }
  // Run from a cwd that has tsx installed (the owning engine's reference folder).
  const refDir = engine ? path.join(enginesDir, engine, "reference") : null;
  const cwd = refDir && fs.existsSync(path.join(refDir, "node_modules")) ? refDir : path.dirname(file);
  const res = sh("npx", ["--no-install", "tsx", file], cwd);
  if (res.status === 0) results.run.push(label);
  else if (res.error?.code === "ETIMEDOUT") results.failed.push(`${label}: TIMEOUT after 120s`);
  else results.failed.push(`${label}: exit ${res.status}\n${String(res.stdout + res.stderr).slice(-600)}`);
}

console.log("\nrun-examples summary");
console.log(`  ran:     ${results.run.length}`);
for (const r of results.run) console.log(`    PASS ${r}`);
console.log(`  skipped: ${results.skipped.length}`);
for (const s of results.skipped) console.log(`    SKIP ${s}`);
console.log(`  failed:  ${results.failed.length}`);
for (const f of results.failed) console.log(`    FAIL ${f}`);
process.exit(results.failed.length ? 1 : 0);
