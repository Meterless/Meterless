#!/usr/bin/env node
// Internal link and image checker for the Meterless flagship repo.
// Checks every relative markdown link, image src, and flagship-absolute URL
// against the working tree, with CASE-SENSITIVE path comparison (Windows and
// macOS filesystems hide casing mismatches that break on Linux and on GitHub).
// External URLs are counted and skipped by design; external checking belongs
// to the launch checklist. Exit 0 = clean, exit 1 = broken links found.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKIP_DIRS = new Set([".git", "node_modules", ".notebook", "vendor"]);

// Case-sensitive existence check: walk each segment via readdir.
const dirCache = new Map();
function listDir(dir) {
  if (!dirCache.has(dir)) {
    try {
      dirCache.set(dir, new Set(fs.readdirSync(dir)));
    } catch {
      dirCache.set(dir, null);
    }
  }
  return dirCache.get(dir);
}
function existsCaseSensitive(absPath) {
  const rel = path.relative(ROOT, absPath);
  if (rel.startsWith("..")) return fs.existsSync(absPath); // outside repo: best effort
  let cur = ROOT;
  for (const seg of rel.split(path.sep)) {
    if (seg === "" || seg === ".") continue;
    const entries = listDir(cur);
    if (!entries || !entries.has(seg)) return false;
    cur = path.join(cur, seg);
  }
  return true;
}

function* walkMarkdown(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) yield* walkMarkdown(path.join(dir, entry.name));
    } else if (entry.name.endsWith(".md")) {
      yield path.join(dir, entry.name);
    }
  }
}

const LINK_RE = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const IMG_RE = /src="([^"]+)"/g;
const FLAGSHIP_RE = /github\.com\/meterless\/meterless\/(?:tree|blob)\/main\/([^)\s"'<>\]]+)/g;

let broken = [];
let externalCount = 0;

for (const file of walkMarkdown(ROOT)) {
  const text = fs.readFileSync(file, "utf-8");
  const dir = path.dirname(file);
  const targets = [];
  for (const m of text.matchAll(LINK_RE)) targets.push({ href: m[1], kind: "link" });
  for (const m of text.matchAll(IMG_RE)) targets.push({ href: m[1], kind: "img" });
  for (const { href, kind } of targets) {
    if (/^(https?:|mailto:|data:)/.test(href)) {
      externalCount++;
      continue;
    }
    if (href.startsWith("#")) continue;
    const target = decodeURIComponent(href.split("#")[0]);
    if (!target) continue;
    const abs = path.normalize(path.join(dir, target));
    if (!existsCaseSensitive(abs)) {
      broken.push({ file: path.relative(ROOT, file), href, kind });
    }
  }
  // Flagship-absolute URLs must map to real paths in this tree.
  for (const m of text.matchAll(FLAGSHIP_RE)) {
    const target = decodeURIComponent(m[1].split("#")[0]).replace(/\/$/, "");
    const abs = path.join(ROOT, target);
    if (!existsCaseSensitive(abs)) {
      broken.push({ file: path.relative(ROOT, file), href: m[0], kind: "flagship-url" });
    }
  }
}

console.log(`check-links: external URLs skipped by design: ${externalCount}`);
if (broken.length) {
  console.error(`check-links: ${broken.length} broken internal reference(s):`);
  for (const b of broken) console.error(`  ${b.file} -> [${b.kind}] ${b.href}`);
  process.exit(1);
}
console.log("check-links: all internal references resolve (case-sensitive). PASS");
