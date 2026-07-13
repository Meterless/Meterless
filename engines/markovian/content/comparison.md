# Markovian vs. the alternatives

Where Markovian fits and where it doesn't.

## vs. "Just use a bigger context window"

| | Markovian | Bigger context |
|---|---|---|
| Cost per step at N=50 | flat | linear-in-N |
| Run-total cost shape | O(N) | O(N²) |
| Works at N=500 | ✓ | ✗ (context exhausted) |
| Provider-portable | ✓ | ⚠ tied to model class |
| Inspectable per-step state | ✓ | ⚠ buried in transcript |

**Bigger context** delays the failure. It doesn't change the shape. A 200K-token window runs out at maybe step 80 instead of step 30 — the architecture problem is unchanged.

Markovian removes the ceiling.

## vs. "Summarize the transcript every N steps"

| | Markovian | Periodic summary |
|---|---|---|
| Drift over many steps | bounded by markers | accumulates |
| Decision preservation | ✓ (structured) | ⚠ (rephrased) |
| Entity preservation | ✓ (extractor pass) | ⚠ (depends on summary) |
| Cost predictability | ✓ | ⚠ (summary calls add cost) |

Periodic summary works for ~10 steps. By step 25, the summary has been re-summarized 3 times. The first lost fact is the one you needed.

Structured markers don't drift because they aren't summaries — they're typed data the engine reads.

## vs. LangGraph / state-machine agents

| | Markovian | State-machine agent |
|---|---|---|
| Long-horizon reasoning per node | ✓ | ⚠ (each node is one model call) |
| Bounded per-step cost | ✓ | ⚠ |
| Composable as a node inside a state machine | ✓ | n/a |
| Inspectable carryover diffs | ✓ | ⚠ |

These compose. LangGraph (or any state-machine framework) is a great way to orchestrate *across* tasks. Markovian is what runs *inside* a node when the node's job is genuinely long.

A node that needs 30 steps of reasoning calls Markovian. A node that needs one LLM call doesn't.

## vs. Sliding-window context

| | Markovian | Sliding window |
|---|---|---|
| Preserves decisions from step 1 at step 50 | ✓ | ✗ (window has dropped them) |
| Preserves entities introduced early | ✓ | ✗ |
| Bounded memory cost | ✓ | ✓ |

Sliding windows are bounded but **arbitrary**. They drop information by position, not by importance. The fact you needed at step 47 was introduced at step 3, and the window dropped it at step 25.

Markovian preserves by importance, not position.

## vs. Tree-of-thoughts / reflection-heavy frameworks

| | Markovian | Tree-of-thoughts |
|---|---|---|
| Optimized for long sequential reasoning | ✓ | ⚠ |
| Optimized for branching exploration | ⚠ | ✓ |
| Cost predictability | ✓ | ⚠ (branching multiplies cost) |

These solve different problems. Tree-of-thoughts is for *exploring alternatives*. Markovian is for *going deep along one path*. They compose — a tree-of-thoughts step can call Markovian to expand a branch.

## The honest summary

Markovian is opinionated. It's good at one specific thing: **long sequential reasoning with bounded per-step cost**. If that's your problem, the alternatives all delay or rename the failure mode without removing it.

If your work fits in one model call, you don't need Markovian. If it fits in three, probably still no. The engine starts winning around step 5 and becomes essential around step 20.

For everything beyond that bar, Markovian — with the rest of the [Meterless stack](https://github.com/meterless/meterless) — is the architecture.
