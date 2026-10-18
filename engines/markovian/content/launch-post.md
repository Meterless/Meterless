# Why Markovian keeps per-step cost flat

Long-horizon agents that carry their full transcript fail in a predictable way. The first ten steps run well. Step fifteen is slower. By step thirty, every call ships the full transcript and the model struggles with its own history. By step fifty the context window is full and the run stops.

Bigger models delay this failure. The cost curve keeps the same shape.

## What goes wrong

The naive shape of agent reasoning is transcript-shaped. Every step appends to history. The history is the model's memory. The history grows with step count. The cost per step grows with the history. The cost of the run grows quadratically.

Summarizing the transcript every N steps does not fix this. Summaries of summaries drift, and a fact lost early may be the one you need at step 25.

The architectural fix is to stop carrying the transcript and carry compressed state instead. That state is bounded, structured, and re-derivable.

Markovian is built on that fix.

## What it does

Every step gets a fixed-size prompt: the goal, the framing, a compressed carryover from the prior step, the current step's input. The carryover is bounded, typically a few hundred tokens of typed markers instead of prose. The model emits a fresh carryover for the next step at the end of its output. The engine reads it and starts the next step.

Total cost per step is flat. Total cost per run is linear, not quadratic. Step count goes up; per-step token use stays roughly constant.

This makes a 500-step run possible and a 50-step run cheap.

## The token economics demo

Documentation can claim "flat cost." The token economics demo is a chart you can drag the sliders on and watch the two curves diverge. The naive line grows quadratically. The Markovian line stays flat. At 50 steps the difference is meaningful. At 500 steps it decides whether the run can finish at all.

The demo is in the repo because that graph is the main argument for the engine.

## Why structured markers

The reason "summarize the transcript" fails is that summaries are prose, and prose drifts. The first time the model rephrases "decided Iceberg over Delta" as "explored Iceberg as a possibility," you've lost the decision. The drift compounds.

Structured markers are data, so they do not drift the way summaries do. `COMPLETED: ...`. `REMAINING: ...`. `DECISIONS: ...`. `CONTEXT: ...`. The engine reads them as data. The model fills the schema instead of summarizing the conversation.

Turning compression from "rephrase shorter" into "fill a schema" is what makes carryover reliable across 50+ steps.

## When you don't need it

If your task fits in one model call, you don't need Markovian. If it fits in three, probably still no. The engine starts saving tokens around step 5 and becomes necessary around step 20.

Below that bar, write a single prompt.

## How to start

Pick a multi-step task you've been avoiding because the context window made it ugly. Run Workshop 01. You'll have a working chain in 30 minutes.

Then plug it into your stack. You own the chain, the carryover, and the math.

[Get started →](../README.md)
