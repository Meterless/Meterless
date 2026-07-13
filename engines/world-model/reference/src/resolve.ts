// Entity resolution (AGENTS.md section on merge detection). Banded thresholds:
//
//   similarity >= 0.85            -> auto-merge   (0.85 EXACTLY is auto-merge)
//   0.82 <= similarity < 0.85     -> operator review queue (0.82 EXACTLY queues)
//   similarity < 0.82             -> new entity
//
// Similarity is Levenshtein-based: 1 - distance / max(lenA, lenB), computed on
// NORMALIZED names (stableIds.normalizeName). The spec names the bands but not
// the normalization input; this reference pins it to normalized names so that
// diacritics and whitespace never inflate distance.

import { normalizeName } from "./stableIds.ts";

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

export function nameSimilarity(rawA: string, rawB: string): number {
  const a = normalizeName(rawA);
  const b = normalizeName(rawB);
  if (a.length === 0 && b.length === 0) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - levenshtein(a, b) / maxLen;
}

export type ResolutionDecision = "auto-merge" | "review" | "new";

export function decide(similarity: number, autoMergeAt = 0.85, reviewLower = 0.82): ResolutionDecision {
  if (similarity >= autoMergeAt) return "auto-merge"; // boundary value merges
  if (similarity >= reviewLower) return "review";     // boundary value queues
  return "new";
}

// Clustering gate for the ingest pipeline: entity-overlap Jaccard >= 0.5
// co-clusters two observations.
export function jaccard(a: Iterable<string>, b: Iterable<string>): number {
  const sa = new Set(a);
  const sb = new Set(b);
  if (sa.size === 0 || sb.size === 0) return 0;
  let inter = 0;
  for (const x of sa) if (sb.has(x)) inter++;
  return inter / (sa.size + sb.size - inter);
}
