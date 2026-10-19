# Mac M5, 16 GB

**Nightshift for Mac · Apple M5, 16 GB, fanless · September 22 to 26, 2026 · Measured**

Every installed catalog fleet, best-of-4, on a working laptop with its owner's apps open: code, fact and extraction jobs, plus media. After the live fixes, the eight fleets that fit re-ran with every winner correct. Then a three-hour soak ran job after job, through a real sleep.

[**Read the Mac report ↗**](https://meterless.ai/Benchmarks/MAC/M5+/) · [Nightshift for Mac ↗](https://www.meterless.ai/mac.html) · [All benchmarks](README.md)

<a href="https://meterless.ai/Benchmarks/MAC/M5+/"><img src="media/report-mac-m5.webp" alt="The Mac M5 benchmark report on meterless.ai: what the machines finished, and what they did not" width="100%" /></a>

| 24 / 24 | 301 / 301 | 90% vs 82% | 273 s |
|:--:|:--:|:--:|:--:|
| winners correct, was 3 / 24 | soak jobs, 0 errors | best-of-4 winner vs one attempt | three rotated jobs, was 1,201 s |

---

| Measure | Value |
|---|---|
| Code winners correct | 21 of 21 |
| Catalog fleets after live fixes (8 fleets × 3 jobs) | 24 of 24 completed, 24 of 24 winners correct (were 3 of 24) |
| Best-of-4 winner vs one random attempt | 90% vs 82% correct, over 61 jobs |
| Three rotated jobs | 1,201 s down to 273 s once plans follow the memory actually free |
| Sustained 3-hour soak, 1B rotation | 301 of 301 jobs, 1,806 attempts, 0 errors; median job 20 s, p95 70 s; survived a real 15-minute sleep |
| Metal decode, Llama 3.2 1B | 120 to 144 tok/s |
| Model switches | median 1.8 to 2.5 s against a 7 s gate |
| Whisper base.en | about 32× real time |
| SD-Turbo at 512², 1 step | 3.0 s |
| Music, ACE-Step 1.5 turbo | 10 s cue in 6.4 to 8.2 s |

The same twelve catalog fleets later ran on a Windows PC with an RTX 3090. Where the Mac had to rotate models, the PC was 4 to 115× faster. See [Windows](windows.md).

## What is weak

- **Memory is the limit.** With the owner's apps open, about 8.6 GB is available to models, so larger fleets rotate models and each job takes minutes. 14B models need about 11.4 GB free and were never admitted at 8 to 9 GB.
- **Image edit and video do not fit in 16 GB.** They are refused by name.
- **Structural gates cannot see content.** A 768² SD-Turbo image with three fused foxes passed.
- **A small, easy suite:** 82% of all candidates were correct. Power was not measured, and no Mac above 16 GB was tested.
- **The Mac build was ad-hoc signed, not notarized.**

Projected numbers for larger M5 Macs are on the [hardware card](dgx-spark.md#the-hardware-card) and in [editions.md](../products/nightshift/editions.md).
