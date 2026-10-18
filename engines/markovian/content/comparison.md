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

A bigger context window delays the failure, but the cost curve keeps the same shape. A 200K-token window runs out at maybe step 80 instead of step 30. The architecture problem is unchanged.

Markovian removes the ceiling because per-step cost stays flat.

## vs. "Summarize the transcript every N steps"

| | Markovian | Periodic summary |
|---|---|---|
| Drift over many steps | bounded by markers | accumulates |
| Decision preservation | ✓ (structured) | ⚠ (rephrased) |
| Entity preservation | ✓ (extractor pass) | ⚠ (depends on summary) |
| Cost predictability | ✓ | ⚠ (summary calls add cost) |

Periodic summary works for ~10 steps. By step 25, the summary has been re-summarized 3 times. Each pass can drop a fact, and later steps cannot recover it.

Structured markers are typed data the engine reads, so they do not drift the way prose summaries do.

## vs. LangGraph / state-machine agents

| | Markovian | State-machine agent |
|---|---|---|
| Long-horizon reasoning per node | ✓ | ⚠ (each node is one model call) |
| Bounded per-step cost | ✓ | ⚠ |
| Composable as a node inside a state machine | ✓ | n/a |
| Inspectable carryover diffs | ✓ | ⚠ |

These compose. LangGraph (or any state-machine framework) orchestrates work across tasks. Markovian runs inside a node when that node's job is long.

A node that needs 30 steps of reasoning calls Markovian. A node that needs one LLM call doesn't.

## vs. Sliding-window context

| | Markovian | Sliding window |
|---|---|---|
| Preserves decisions from step 1 at step 50 | ✓ | ✗ (window has dropped them) |
| Preserves entities introduced early | ✓ | ✗ |
| Bounded memory cost | ✓ | ✓ |

Sliding windows are bounded, but they drop information by position instead of importance. The fact you needed at step 47 was introduced at step 3, and the window dropped it at step 25.

Markovian keeps decisions and entities in the structured carryover regardless of when they first appeared.

## vs. Tree-of-thoughts / reflection-heavy frameworks

| | Markovian | Tree-of-thoughts |
|---|---|---|
| Optimized for long sequential reasoning | ✓ | ⚠ |
| Optimized for branching exploration | ⚠ | ✓ |
| Cost predictability | ✓ | ⚠ (branching multiplies cost) |

These solve different problems. Tree-of-thoughts explores alternatives. Markovian goes deep along one path. They compose: a tree-of-thoughts step can call Markovian to expand a branch.

## Summary

Markovian targets one problem: long sequential reasoning with bounded per-step cost. For that problem, the alternatives above delay or rename the failure mode without removing it.

If your work fits in one model call, you don't need Markovian. If it fits in three, probably still no. The engine starts saving tokens around step 5 and becomes necessary around step 20.

Past that point, use Markovian with the rest of the [Meterless engines](https://github.com/meterless/meterless).
