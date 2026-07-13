// State carryover service (AGENTS.md section 4.3). The compression cascade
// runs in strict order: marker override, LLM compression, heuristic
// extraction, tail truncation. Each level falls through on failure so the
// chain survives model/API instability.

import { estimateTokens } from "./types.ts";
import type { ChunkConfig } from "./types.ts";

export type CascadeLevel = "marker" | "llm" | "heuristic" | "truncation";

export interface CarryoverResult {
  carryover: string;
  level: CascadeLevel;
}

const KEY_PHRASE = /(?:^|\n|\.\s+)((?:Therefore|Key insight|Status|Decision|Decided|Next|Remaining|Completed)[^.\n]*)/gi;

export class CarryoverService {
  constructor(private compressorFn?: (prompt: string, systemPrompt: string) => Promise<string>) {}

  async next(args: {
    markerState: string | undefined;
    previousCarryover: string;
    chunkText: string;
    config: ChunkConfig;
  }): Promise<CarryoverResult> {
    const budget = args.config.carryoverTokens;

    // Level 1: explicit marker override. Accept iff >= 24 chars and within budget.
    if (args.markerState !== undefined) {
      const sanitized = args.markerState.replace(/[<>[\]@-]{3,}/g, "").trim();
      if (sanitized.length >= 24 && estimateTokens(sanitized) <= budget) {
        return { carryover: sanitized, level: "marker" };
      }
    }

    // Level 2: LLM-based compression via the injected compressor.
    if (this.compressorFn) {
      try {
        const preview = args.chunkText.slice(-2000);
        const prompt =
          `Previous state:\n${args.previousCarryover || "(none)"}\n\nLatest chunk (tail):\n${preview}\n\n` +
          `Compress into 3-5 critical points as a labeled block:\nCOMPLETED: ...\nREMAINING: ...\nDECISIONS: ...\nCONTEXT: ...`;
        const compressed = (await this.compressorFn(prompt, "You compress reasoning state. Be terse and lossless on decisions.")).trim();
        if (compressed.length >= 24 && estimateTokens(compressed) <= budget) {
          return { carryover: compressed, level: "llm" };
        }
      } catch {
        // fall through to heuristics
      }
    }

    // Level 3: heuristic key-phrase extraction.
    const phrases = [...args.chunkText.matchAll(KEY_PHRASE)].map((m) => m[1].trim()).slice(0, 5);
    if (phrases.length > 0) {
      const summary = phrases.join("; ");
      if (estimateTokens(summary) <= budget) return { carryover: summary, level: "heuristic" };
    }

    // Level 4: absolute fallback, tail-truncate words to the token budget.
    const words = (args.chunkText || args.previousCarryover).split(/\s+/).filter(Boolean);
    let tail = "";
    for (let i = words.length - 1; i >= 0; i--) {
      const candidate = words[i] + (tail ? " " + tail : "");
      if (estimateTokens(candidate) > budget) break;
      tail = candidate;
    }
    return { carryover: tail, level: "truncation" };
  }
}

export function canonicalBlock(parts: { completed: string; remaining: string; decisions: string; context: string }): string {
  return `COMPLETED: ${parts.completed}\nREMAINING: ${parts.remaining}\nDECISIONS: ${parts.decisions}\nCONTEXT: ${parts.context}`;
}
