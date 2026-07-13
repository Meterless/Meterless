// Canonical Markovian shapes per AGENTS.md sections 2, 4.6, 2.4.

export interface ChunkConfig {
  chunkSize: number;       // target generation budget per chunk
  maxChunks: number;       // recursion cap
  carryoverTokens: number; // carryover state budget
  overlapTokens: number;   // overlap window; implemented, never silently ignored
}

export const DEFAULT_CONFIG: ChunkConfig = {
  chunkSize: 8000,
  maxChunks: 24,
  carryoverTokens: 800,
  overlapTokens: 0,
};

export const BOUNDS = {
  chunkSize: { min: 1000, max: 128000, step: 1000 },
  maxChunks: { min: 1, max: 32, step: 1 },
  carryoverTokens: { min: 128, max: 32768, step: 128 },
  overlapTokens: { min: 0, max: 4096, step: 1 },
} as const;

// Engine constants (AGENTS.md section 2.1 load-time validation).
export const FRAMING_TOKENS = 400;
export const OUTPUT_BUDGET = 1200;

// Reference estimator everywhere: ceil(chars / 4). Numbers derived from it
// are labeled "estimated"; provider-reported usage is labeled "measured".
export const estimateTokens = (text: string): number => Math.ceil(text.length / 4);
export type TokenLabel = "estimated" | "measured";

export class ConfigValidationError extends Error {
  constructor(message: string) {
    super(`Markovian config: ${message}`);
    this.name = "ConfigValidationError";
  }
}

export interface ChunkInfo {
  id: number;        // 1-based step index
  tokens: number;    // estimated from output, ceil(chars/4)
  carryover: string; // state passed INTO this step
  content: string;   // display-safe (marker-cleaned) output
}

export type RunStatus = "completed" | "max-chunks" | "errored" | "aborted";

export interface MarkovianRun {
  id: string;
  timestamp: number;
  prompt: string;             // truncated for storage
  mode: Mode;
  chunkConfig: ChunkConfig;   // MANDATORY per-run snapshot (section 2.3)
  chunks: ChunkInfo[];
  totalTokensUsed: number;
  totalTokensSaved: number;
  efficiencyPercent: number;
  durationMs: number;
  status: RunStatus;
  tokenLabel: TokenLabel;
  output: string;             // joined cleaned content
  reflection?: string;
  error?: string;
}

export interface CumulativeStats {
  totalRuns: number;
  completedRuns: number;
  totalTokensUsed: number;
  totalTokensSaved: number;
  averageEfficiency: number;
  totalChunksProcessed: number;
  lastRunTimestamp: number;
  efficiencyHistory: { timestamp: number; efficiency: number; tokensSaved: number }[];
}

export type Mode = "ARCHITECT" | "RESEARCH";

export type Phase = "initializing" | "generating" | "compressing" | "reflecting" | "complete" | "error";

export interface ProgressState {
  isActive: boolean;
  phase: Phase;
  phaseDetail: string;
  currentChunk: number;
  maxChunks: number;
  tokensUsed: number;
  tokensSaved: number;
  carryoverSize: number;
  startTime: number;
  lastUpdateTime: number;
  logs: string[]; // bounded queue, last 15
  completedChunks: ChunkInfo[];
}

// Provider-agnostic generator (AGENTS.md section 12). The reference also
// accepts the simpler stepFn shape used across the examples and adapts it.
export type Generator = (
  prompt: string,
  attachments: Attachment[],
  systemPrompt?: string,
  onStream?: (delta: string) => void,
  abortSignal?: AbortSignal
) => Promise<{ text: string; metadata?: unknown }>;

export interface Attachment {
  name: string;
  content: string;
}

export type StepFn = (args: { goal: string; carryover: string; step: number; prompt: string }) => Promise<{ content: string }> | { content: string };

export interface RunOptions {
  prompt?: string;
  goal?: string; // alias used by the examples
  mode?: Mode;
  stepFn?: StepFn;
  generator?: Generator;
  stopWhen?: (args: { step: number; carryover: string }) => boolean;
  memoryContext?: string;
  attachments?: Attachment[];
  abortSignal?: AbortSignal;
  onStream?: (delta: string) => void;
  reflect?: boolean; // default true
}

export interface MarkovianOptions {
  chunkConfig?: Partial<ChunkConfig>;
  generator?: Generator;
  compressorFn?: (prompt: string, systemPrompt: string) => Promise<string>;
  clock?: () => number;
  historyDir?: string; // when set, runs persist to <dir>/history.json
}
