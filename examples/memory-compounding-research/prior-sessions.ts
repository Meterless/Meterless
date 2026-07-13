// Three prior work sessions about choosing the storage layer for a
// local-first app. Session 2 contains a correction that supersedes a
// session 1 claim; H-MEM's ranking must prefer the correction. These are the
// memories the WARM run starts with and the COLD run lacks.

export const PRIOR_SESSIONS: { label: string; event: "chat_message" | "plan_completion"; text: string }[] = [
  {
    label: "session 1: storage evaluation",
    event: "chat_message",
    text:
      "We decided to use IndexedDB for local persistence because it ships in every browser. " +
      "We always keep writes behind a single queue to avoid corruption. " +
      "The sync layer should use WebRTC because we want peer-to-peer without a relay server.",
  },
  {
    label: "session 2: the correction",
    event: "chat_message",
    text:
      "Actually we should use sqlite instead of IndexedDB for local persistence because the desktop build needs real SQL and file-level backup. " +
      "We decided the browser build wraps sqlite compiled to wasm so both builds share one storage contract.",
  },
  {
    label: "session 3: constraints",
    event: "plan_completion",
    text:
      "We must always encrypt the local database at rest because enterprise pilots require it. " +
      "We prefer typescript for all new services because the team reviews it fastest. " +
      "Deploys happen because CI is green, never manually.",
  },
];
