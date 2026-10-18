# Learnings

What building Nightshift, the free apps and the experiments taught us, with the run behind each lesson. These are the reasons the stack looks the way it does. Every number links back to a published benchmark in [docs/benchmarks/](../benchmarks/README.md).

## 1. Measure finished work, not tokens per second

A night on a DGX Spark landed 202 attempts and produced one accepted outcome. Tokens per second says nothing about that. The useful questions are how much the machine finished while nobody watched, and whether any of it was worth keeping. Nightshift reports attempts, clusters, finalists, judged, accepted, and cloud spend, in that order.

## 2. Read and write speed are different numbers

Prefill on the Spark ran at 424 to 596 tokens a second. Decode ran at 6.2 to 7.7. That is almost two orders of magnitude. Prefill is compute-bound. Decode is bandwidth-bound. Averaging them into one speed hides the only fact you need to route work.

## 3. Use the cloud when someone is waiting

An agent that re-reads 100K tokens pays about 3 minutes 38 seconds of local prefill before its first word. Median routed latency on the box was 36.8 s. When someone is waiting, cloud wins. When nobody is waiting, time wins: the same 6.2 tokens-a-second model, left alone from 23:17 to 04:32, landed 36 full attempts while two other models landed 92 more beside it. A slow local model is costly when a person is waiting and cheap when nobody is. This is why Nightshift has two postures.

## 4. More lanes add approaches, not speed

One lane decoded 6.7 tokens a second. Three lanes together decoded 9.7. Separate models share one memory bus, so seats scale far slower than throughput. Overnight that is a good trade: three different models work on one problem for about the cost of one stream. In an editor during the day it is a bad trade.

## 5. Judging is the bottleneck

Across a month of real nights only 8% of shortlisted candidates were ever scored, and 92 of 104 outcomes stayed undecided. The cause was mechanical: on the owner's fleet the verifier panel kept choosing a 3B thinking model that never returned a verdict. With a dedicated judge lane that never races, the panel scored 99% of its shortlist and picked the best candidate 22 times in 26. Generating candidates is cheap. Scoring them needs its own dedicated model.

## 6. A passing check is not the same as working output

12 of 12 generated apps passed the runtime tier. Only 6 of 12 worked. An app that loads can still be broken. Every check now records `not_run` when it cannot run, and a check that did not run never counts as a pass. Relay applies the same rule on the desktop: a run that only looks finished never becomes a saved skill.

## 7. Many attempts find what one attempt cannot

Races of 250 to 300 attempts found 25 to 37 distinct solution clusters and were still finding new ones in their last 50 attempts. Different models' first answers tend to look alike. Breadth is how you escape that sameness. Swarms and Nightshift are both built on this.

## 8. Save the method instead of retraining

No model is retrained. Each night ends by distilling its strongest cluster into an insight pack, and the next night starts there. Recipes that keep winning become Methods and Skills you can read. In an illustrative three-night lineage, attempts to an accepted result fell from 180 to 61. Relay shows the same pattern on the desktop: its AP reconciliation skill ran 231 of 238 steps with no model call after 14 runs.

## 9. Context helps weaker models most

In the agent framework benchmark, the Meterless context layer (World State, H-MEM and Markovian through the reference engines) lifted Haiku 4.5 by 4.29 points. On Opus 5.5 the baseline already scored 99.06, and no framework moved quality clearly. Adding an audit step to Haiku cost 486% more for a lower score. Context is a lever for small and local models. It is not free polish for frontier ones.

## 10. Small models go further with memory and bounded state

Meterless City runs on an 8B model on a home runtime. Each character carries a bounded Markovian state plus the last four turns, never the whole transcript. H-MEM consolidates old episodes into chapters. A World Model keeps who said what, with provenance. Think-ahead writes likely replies before you speak, and 66% of lines are answered instantly. The 100th line of a conversation costs the same as the first.

## 11. Plan against the memory that is actually free

On a 16 GB M5 Mac with its owner's apps open, about 8.6 GB was available to models. Three rotated jobs took 1,201 s when plans assumed the full machine and 273 s once plans followed live free memory. 14B models were admitted only with about 11.4 GB free. On a Mac, the memory plan decides more of a job's time than the mode does.

## 12. Thinking models burn short jobs

On one hard prompt a 27B thinking model reasoned for 599 s, ran out of budget, then answered correctly in 48 s with thinking off. A 3B thinking lane wrote 17,000 characters of reasoning twice and never answered. Setting a zero reasoning budget on that llama-server build did not stop it. Match the model to the job length, and keep thinking models off judge seats.

## 13. Planners over-plan

Auto planned 256 attempts for answers a best-of-4 found in under 2 minutes. More attempts are not always more value. Stop rules matter: stop when the bar is met, stop when no new cluster appears, stop at a deadline with a labelled partial.

## 14. Per-call pricing limits what you can build

Hosted characters bill per line. One active hour of Meterless City is about 445 model calls and 22,500 characters of speech: $0.46 to $6.60 on metered APIs, $0.02 to $0.06 of electricity on your own runtime. A verified business deliverable costs about 5 cents of electricity. When a model call costs only electricity, some apps become affordable: characters who answer every line, a showrunner that keeps filming, and an analyst that rereads every account in the background.

## 15. Publish the failures

Every benchmark here keeps failures, refusals and wiped jobs in the denominators. The postmortem brief scored lower on a newer build, and that is published. Some deliverables carry dates the models invented, and that is published. A benchmark that hides its misses cannot be used to route work.
