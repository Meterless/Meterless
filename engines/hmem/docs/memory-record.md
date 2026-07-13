# Memory Record

The memory record is the portable contract across every H-MEM implementation.

## Required shape

```ts
type MemoryType = "personal" | "factual" | "preference" | "general";
type MemoryLayer = "short_term" | "working" | "long_term";
type MemoryOrigin =
  | "chat" | "import" | "web" | "decision" | "curiosity" | "goal_run"
  | "user_explicit" | "inference" | "plan_run" | "mission" | "swarm_run"
  | "tool" | "brain";

interface MemoryProvenance {
  origin: MemoryOrigin;
  learnedAt: number;
  label: string;                       // human-readable "how I learned this"
  refs?: {
    chatId?: string; importRunId?: string; importSource?: string;
    sourceUrl?: string; sourceDomain?: string; decisionId?: string; goalRunId?: string;
  };
}

interface Memory {
  id: string;
  content: string;
  type: MemoryType;
  layer: MemoryLayer;
  timestamp: number;
  lastAccessed: number;
  accessCount: number;
  tags: string[];
  domain?: string;
  namespace?: string;
  embedding?: number[];
  score?: number;                      // runtime only, never persisted as truth
  confidence: number;                  // MANDATORY
  source: string;                      // MANDATORY — reject records without it
  provenance?: MemoryProvenance;       // mandatory for NEW writes; derived for legacy rows
  // Recall scoping
  chatId?: string;
  missionId?: string;
  goalRunId?: string;
  // Graph
  entities: { name: string; type: string }[];
  relatedTo: string[];
  supersedes?: string;
  supersededBy?: string;               // set by conflict resolution; drives the ranking penalty
  derivedFrom: string[];
}
```

## Field guidance

| Field | Guidance |
|---|---|
| `id` | Stable unique memory identifier. |
| `content` | Concise remembered statement. |
| `type` | Use `preference` for user choices and `factual` for claims. |
| `layer` | Start mined memory in `working` unless it is session-only. |
| `confidence` | Mandatory. Initialize below 1.0 for extracted or inferred memory (reserve 1.0 for facts the system observed itself). |
| `source` | Mandatory. Include event, file, run, or service provenance. Reject records without it, by construction. |
| `provenance` | Mandatory for new writes: origin enum, when-learned timestamp, and a human-readable label. Derive it for legacy rows. |
| `chatId` / `missionId` / `goalRunId` | Recall scoping. Chat-turn recall filters by `chatId`; goal-run recall is isolated per `goalRunId`. Unscoped writes are a defect. |
| `entities` | Normalize names and cap at 10 per record. |
| `relatedTo` | Peer relationship edges, cap 5. |
| `supersedes` | Replacement edge for corrections. |
| `supersededBy` | Set by conflict resolution on the losing record; drives the −0.20 retrieval penalty. Superseded is never deleted. |
| `derivedFrom` | Required for dream and sleep synthesized records. |

## Mutation invariant

No create, update, delete, feedback, promotion, archive, synthesis, or resolution happens without a trust ledger entry.

## Example

```text
The user prefers pnpm over npm for this project.
type=preference layer=long_term source=session:abc tags=tech:frontend entities=pnpm,npm
```
