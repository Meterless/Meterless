// Answer path. Two labeled modes:
//   retrieval-only (default): the answer is assembled from retrieved
//     memories; zero network access, zero keys.
//   model mode: when ANTHROPIC_API_KEY is set AND @anthropic-ai/sdk is
//     installed (npm install @anthropic-ai/sdk), the reinjection block goes
//     into a real model prompt. The SDK is never a hard dependency.

export interface AnswerResult {
  mode: "retrieval-only" | "model";
  text: string;
}

export async function answer(question: string, memoryContext: string, memories: { relevance: number; content: string }[]): Promise<AnswerResult> {
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const { default: Anthropic } = await import("@anthropic-ai/sdk");
      const client = new Anthropic();
      const response = await client.messages.create({
        model: "claude-sonnet-5",
        max_tokens: 400,
        messages: [
          {
            role: "user",
            content: `${memoryContext}\n\nAnswer using ONLY the memory context above. Cite memory ids inline.\n\nQuestion: ${question}`,
          },
        ],
      });
      const text = response.content.filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("");
      return { mode: "model", text };
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.includes("Cannot find") || msg.includes("Cannot resolve")) {
        return {
          mode: "retrieval-only",
          text: retrievalOnly(question, memories) + "\n\n(ANTHROPIC_API_KEY is set but @anthropic-ai/sdk is not installed; run: npm install @anthropic-ai/sdk)",
        };
      }
      throw err;
    }
  }
  return { mode: "retrieval-only", text: retrievalOnly(question, memories) };
}

function retrievalOnly(question: string, memories: { relevance: number; content: string }[]): string {
  if (memories.length === 0) {
    return `Nothing in memory answers "${question}" yet. Teach me: notebook remember "<fact>"`;
  }
  const lines = [`Based on what I remember about "${question}":`];
  for (const m of memories) lines.push(`- ${m.content} (relevance ${m.relevance.toFixed(2)})`);
  return lines.join("\n");
}
