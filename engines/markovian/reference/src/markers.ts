// Marker protocol (AGENTS.md section 3). Canonical markers are square-bracket:
// [STATE_CHECKPOINT] and [TASK_COMPLETE], with the listed backward-compatible
// variants. The angle-bracket forms (<CARRYOVER>, <DONE>, <PROGRESS>,
// <NEEDS_TOOL .../>) used across this engine's examples are accepted as
// additional detection aliases. Cleaning strips every form from display text.

export interface ParsedMarkers {
  state?: string;            // text captured after/inside a state marker
  done: boolean;             // final completion marker present
  progress?: string;         // optional progress note
  needsTool?: { tool: string; input: string };
  needsClarification?: string;
  cleaned: string;           // display-safe content, all markers stripped
}

const STATE_BLOCKS = [
  /<CARRYOVER>([\s\S]*?)<\/CARRYOVER>/g,
];
const STATE_TAILS = [
  /\[STATE_CHECKPOINT\]\s*([\s\S]*)$/,
  /@@@STATE@@@\s*([\s\S]*)$/,
  /(?<!_)\[STATE\]\s*([\s\S]*)$/,
  /---STATE---\s*([\s\S]*)$/,
];
const FINAL_MARKERS = [/\[TASK_COMPLETE\]/, /@@@FINAL@@@/, /(?<!_)\[FINAL\]/, /---FINAL---/, /<DONE\s*\/?>/];
const PROGRESS_BLOCK = /<PROGRESS>([\s\S]*?)<\/PROGRESS>/;
const NEEDS_TOOL = /[<[]NEEDS_TOOL\s+tool="([^"]+)"\s+input=(?:"([^"]*)"|'([^']*)')\s*\/?[\]>]/;
const NEEDS_CLARIFICATION = /[<[]NEEDS_CLARIFICATION[\]>]\s*([^\n]*)/;

export function parseMarkers(raw: string): ParsedMarkers {
  let state: string | undefined;
  let progress: string | undefined;
  let needsTool: ParsedMarkers["needsTool"];
  let needsClarification: string | undefined;

  for (const re of STATE_BLOCKS) {
    const matches = [...raw.matchAll(re)];
    if (matches.length) state = matches[matches.length - 1][1].trim();
  }
  if (state === undefined) {
    for (const re of STATE_TAILS) {
      const m = raw.match(re);
      if (m) {
        state = m[1].trim();
        break;
      }
    }
  }
  const done = FINAL_MARKERS.some((re) => re.test(raw));
  const p = raw.match(PROGRESS_BLOCK);
  if (p) progress = p[1].trim();
  const t = raw.match(NEEDS_TOOL);
  if (t) needsTool = { tool: t[1], input: t[2] ?? t[3] ?? "" };
  const c = raw.match(NEEDS_CLARIFICATION);
  if (c) needsClarification = c[1].trim();

  return { state, done, progress, needsTool, needsClarification, cleaned: cleanMarkers(raw) };
}

export function cleanMarkers(raw: string): string {
  let out = raw;
  out = out.replace(/<CARRYOVER>[\s\S]*?<\/CARRYOVER>/g, "");
  out = out.replace(/<PROGRESS>[\s\S]*?<\/PROGRESS>/g, "");
  out = out.replace(/[<[]NEEDS_TOOL[^\]>]*[\]>]/g, "");
  out = out.replace(/[<[]NEEDS_CLARIFICATION[\]>][^\n]*/g, "");
  out = out.replace(/\[STATE_CHECKPOINT\][\s\S]*$/, "");
  out = out.replace(/@@@STATE@@@[\s\S]*$/, "");
  out = out.replace(/---STATE---[\s\S]*$/, "");
  // bare [STATE] tail only when it starts a marker line, to avoid eating prose
  out = out.replace(/\n\[STATE\][\s\S]*$/, "");
  for (const re of [/\[TASK_COMPLETE\]/g, /@@@FINAL@@@/g, /---FINAL---/g, /<DONE\s*\/?>/g]) out = out.replace(re, "");
  out = out.replace(/\n\[FINAL\][\s\S]*$/, "");
  return out.replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").trim();
}
