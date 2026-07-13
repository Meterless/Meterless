/**
 * Stable, deterministic, content-addressable IDs (docs/stable-ids.md).
 *
 * Same input, same ID, on every machine, every re-run, every backfill.
 * This module has zero dependencies: sha-256 is implemented inline so the
 * same code runs in Node and in the browser bundle.
 */

/* ------------------------------------------------------------------ */
/* sha-256 (pure TypeScript, synchronous)                              */
/* ------------------------------------------------------------------ */

const K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function rotr(x: number, n: number): number {
  return (x >>> n) | (x << (32 - n));
}

/** Hex-encoded sha-256 of a UTF-8 string. */
export function sha256Hex(input: string): string {
  const data = new TextEncoder().encode(input);
  const len = data.length;
  const bitLenHi = Math.floor((len / 0x20000000)) >>> 0;
  const bitLenLo = (len << 3) >>> 0;

  const paddedLen = (((len + 8) >> 6) + 1) << 6;
  const padded = new Uint8Array(paddedLen);
  padded.set(data);
  padded[len] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(paddedLen - 8, bitLenHi);
  dv.setUint32(paddedLen - 4, bitLenLo);

  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  const w = new Uint32Array(64);
  for (let i = 0; i < paddedLen; i += 64) {
    for (let t = 0; t < 16; t++) w[t] = dv.getUint32(i + t * 4);
    for (let t = 16; t < 64; t++) {
      const s0 = rotr(w[t - 15], 7) ^ rotr(w[t - 15], 18) ^ (w[t - 15] >>> 3);
      const s1 = rotr(w[t - 2], 17) ^ rotr(w[t - 2], 19) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let t = 0; t < 64; t++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[t] + w[t]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;
      h = g; g = f; f = e;
      e = (d + temp1) >>> 0;
      d = c; c = b; b = a;
      a = (temp1 + temp2) >>> 0;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((x) => x.toString(16).padStart(8, "0"))
    .join("");
}

/* ------------------------------------------------------------------ */
/* Canonical JSON                                                      */
/* ------------------------------------------------------------------ */

/**
 * Deterministic JSON serialization: object keys sorted, undefined members
 * dropped. JSON key order in JS is insertion order, so a naive
 * JSON.stringify comparison gives false negatives; the idempotency diff
 * (scripts/idempotency-check.ts) depends on this function instead.
 */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") {
    const s = JSON.stringify(value);
    return s === undefined ? "null" : s;
  }
  if (Array.isArray(value)) {
    return "[" + value.map((v) => canonicalJson(v)).join(",") + "]";
  }
  const obj = value as Record<string, unknown>;
  const keys = Object.keys(obj)
    .filter((k) => obj[k] !== undefined)
    .sort();
  return "{" + keys.map((k) => JSON.stringify(k) + ":" + canonicalJson(obj[k])).join(",") + "}";
}

/* ------------------------------------------------------------------ */
/* Name normalization                                                  */
/* ------------------------------------------------------------------ */

/**
 * normalizeName per docs/stable-ids.md:
 *   NFKD normalize -> strip combining marks -> lowercase -> collapse whitespace -> trim
 *
 * Notes on the edge cases this must catch (dedupe correctness depends on it):
 * - Diacritics: "Jose Garcia" and the accented spelling must normalize identically
 *   (NFKD decomposes the accents into combining marks, which are then stripped).
 * - Non-breaking space (U+00A0): NFKD decomposes it to a regular space; the
 *   whitespace collapse then folds runs of any whitespace into one space.
 * - Zero-width characters (U+200B..U+200D, U+FEFF) carry no name content and are
 *   stripped explicitly, since NFKD leaves them alone.
 * - Over-normalization is the opposite failure: "Acme Corp" and
 *   "Acme Corporation" are DIFFERENT names and must produce DIFFERENT ids.
 *   Normalization never abbreviates, stems, or drops word characters.
 */
export function normalizeName(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining marks
    .replace(/[​-‍﻿]/g, "") // strip zero-width chars
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/* ------------------------------------------------------------------ */
/* ID derivation                                                       */
/* ------------------------------------------------------------------ */

/** Externally keyed entity or context: the literal grammar `type:system:externalId`. */
export function externalId(type: string, system: string, id: string): string {
  return `${type}:${system}:${id}`;
}

/** Name-keyed entity: ent_<first 16 hex of sha256(`${type}:${normalizeName(name)}`)>. */
export function entityIdFromName(type: string, name: string): string {
  return `ent_${sha256Hex(`${type}:${normalizeName(name)}`).slice(0, 16)}`;
}

/**
 * Context id.
 *
 * Ruling: docs/stable-ids.md derives context ids as hash(type + canonicalKey +
 * parent), but every shipped example references externally keyed contexts by
 * the literal `type:system:externalId` grammar (e.g. "season:gridiron:145").
 * So: externally keyed contexts use the literal grammar (the caller's external
 * id is already unique within its system, parent included by construction);
 * attr-keyed contexts (no external key) are hashed WITH the parent, which is
 * what makes week:14 under season:145 a different id than under season:144.
 */
export function contextIdFromAttrs(
  type: string,
  attrs: Record<string, unknown>,
  parent?: string,
): string {
  return `ctx_${sha256Hex(`${type}:${canonicalJson(attrs)}:${parent ?? ""}`).slice(0, 16)}`;
}

/** Relationship id: hash(from + type + to + context? + validFrom?). Re-adding the same edge is a no-op. */
export function relationshipId(
  from: string,
  type: string,
  to: string,
  context?: string,
  validFrom?: string,
): string {
  return `rel_${sha256Hex(`${from}|${type}|${to}|${context ?? ""}|${validFrom ?? ""}`).slice(0, 16)}`;
}

/** Fact id: content-addressed dedupe key. Asserting the identical fact twice is a no-op. */
export function factId(
  about: string,
  predicate: string,
  value: unknown,
  assertedAt: string,
  sourceKind: string,
  sourceUrl?: string,
): string {
  return `fact_${sha256Hex(
    `${about}|${predicate}|${canonicalJson(value)}|${assertedAt}|${sourceKind}|${sourceUrl ?? ""}`,
  ).slice(0, 16)}`;
}
