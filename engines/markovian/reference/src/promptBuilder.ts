// Prompt builder (AGENTS.md section 4.4). Memory context enters chunk 0 only
// (section 5); continuation chunks carry the truncated goal + carryover.
// When overlapTokens > 0 the [OVERLAP] block is inserted after the carryover
// (section 2.1); this is implemented, never silently ignored.

import { estimateTokens } from "./types.ts";
import type { Attachment, ChunkConfig, Mode } from "./types.ts";

const MARKER_RULES =
  "End every non-final chunk with [STATE_CHECKPOINT] followed by a concise state block:\n" +
  "COMPLETED: ...\nREMAINING: ...\nDECISIONS: ...\nCONTEXT: ...\n" +
  "End the final chunk with [TASK_COMPLETE]. Exactly one marker per chunk. Never narrate the markers.";

export function buildPrompt(args: {
  mode: Mode;
  goal: string;
  step: number; // 1-based
  carryover: string;
  overlapText: string; // pre-sliced by orchestrator; "" when overlapTokens == 0
  memoryContext?: string;
  attachments: Attachment[];
  config: ChunkConfig;
}): string {
  const parts: string[] = [];
  const first = args.step === 1;

  if (first && args.memoryContext) {
    parts.push(args.memoryContext.trim());
    parts.push("");
  }

  if (first) {
    if (args.mode === "ARCHITECT") {
      parts.push("You are executing a long build task in bounded chunks. Analyze the goal, produce a plan, and start implementation.");
    } else {
      parts.push(
        "You are executing recursive research in bounded chunks. Log every action as '>> action'. " +
          "Produce multi-file style output where useful and keep a research-tree state snapshot."
      );
    }
    parts.push("");
    parts.push(`User Request: ${args.goal}`);
    if (args.attachments.length) {
      parts.push("");
      for (const a of args.attachments) parts.push(`[ATTACHMENT ${a.name}]\n${a.content}`);
    }
  } else {
    // Continuation: truncated goal (~200 chars) + carryover; no attachments by default.
    parts.push(`Continuing a chunked ${args.mode.toLowerCase()} run. Goal (truncated): ${args.goal.slice(0, 200)}`);
    parts.push("");
    parts.push(`[CARRYOVER STATE]\n${args.carryover}`);
    if (args.overlapText) {
      parts.push("");
      parts.push(`[OVERLAP]\n${args.overlapText}`);
    }
    parts.push("");
    parts.push("Continue exactly where the state leaves off. Do not repeat completed work.");
  }

  parts.push("");
  parts.push(MARKER_RULES);
  return parts.join("\n");
}

// Overlap window: final overlapTokens*4 chars of the previous cleaned output.
export function overlapSlice(previousCleaned: string, config: ChunkConfig): string {
  if (config.overlapTokens <= 0 || !previousCleaned) return "";
  return previousCleaned.slice(-config.overlapTokens * 4);
}

export function estimatePromptTokens(prompt: string): number {
  return estimateTokens(prompt);
}
