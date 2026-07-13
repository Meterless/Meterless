# Flat cost or no agents

Every long-horizon agent dies the same way. The first ten steps look great. The fifteenth step is slower. The thirtieth step is shipping the full transcript and the model is choking on its own history. By step fifty the context window is full and the run just stops.

Bigger models delay the failure. They don't fix it. The shape is wrong.

## What's actually wrong

The naive shape of agent reasoning is *transcript-shaped*. Every step appends to history. The history is the model's memory. The history grows with step count. The cost per step grows with the history. The cost of the run grows quadratically.

Fixing this with "summarize the transcript every N steps" is theater. Summaries of summaries drift. The first lost fact is the one you needed at step 25.

The architectural fix is to **stop carrying the transcript**. Carry compressed state instead. Bounded. Structured. Re-derivable.

That's Markovian.

## What it does

Every step gets a fixed-size prompt: the goal, the framing, a compressed carryover from the prior step, the current step's input. The carryover is bounded — typically a few hundred tokens of typed markers, not prose. The model emits a fresh carryover for the next step at the end of its output. The engine reads it. The cycle continues.

Total cost per step is flat. Total cost per run is linear, not quadratic. Step count goes up; per-step token use stays roughly constant.

A 500-step run becomes possible. A 50-step run becomes cheap. The shape works.

## The token economics demo

Documentation can claim "flat cost." The token economics demo is a chart you can drag the sliders on and watch the two curves diverge. The naive line grows quadratically. The Markovian line stays flat. At 50 steps the difference is meaningful. At 500 it's the difference between runs and *doesn't run*.

That demo is in the repo because the whole engine is justified by that graph. If you can see it, the engine sells itself.

## Why structured markers

The reason "summarize the transcript" fails is that summaries are prose, and prose drifts. The first time the model rephrases "decided Iceberg over Delta" as "explored Iceberg as a possibility," you've lost the decision. The drift compounds.

Structured markers don't drift because they're not summaries — they're *data*. `COMPLETED: ...`. `REMAINING: ...`. `DECISIONS: ...`. `CONTEXT: ...`. The engine reads them as data. The model fills the schema instead of summarizing the conversation.

This single move — turning compression from "rephrase shorter" to "fill a schema" — is what makes carryover reliable across 50+ steps.

## When you don't need it

If your task fits in one model call, you don't need Markovian. If it fits in three, probably still no. The engine starts winning around step 5 and starts being *essential* around step 20.

For everything below that bar, write the prompt and ship.

## How to start

Pick a multi-step task you've been avoiding because the context window made it ugly. Run Workshop 01. You'll have a working chain in 30 minutes.

Then plug it into your stack. The chain is yours. The carryover is yours. The math is yours.

[Get started →](../README.md)
