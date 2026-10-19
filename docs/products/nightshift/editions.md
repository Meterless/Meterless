# Nightshift editions and hardware

Start free in your browser. Then give whatever compute you already own its night shift.

## Editions

| | Web | Windows | Mac M5+ | Mac M1+ | DGX |
|---|---|---|---|---|---|
| **Runs on** | Your browser | Windows 10 or 11 PC with a dedicated GPU | Apple Silicon Mac, M5 or later | Apple Silicon Mac, M1 or later | NVIDIA DGX Spark |
| **Hotspot for your apps** | No | Yes | Yes | A local endpoint | Yes |
| **Overnight jobs** | Try a job | Yes | Yes | Yes, on small models | Yes, one job at a time |
| **Price** | Free | See the Windows page | $199 USD one-time, preorder | Free | On request |
| **Availability** | [Live now](https://meterless.ai/Nightshift/WEB/) | [Out now](https://www.meterless.ai/windows.html), Windows edition 1.2.1 | [Preorder](https://www.meterless.ai/mac.html), delivery Q4 2026 | [Free download](https://www.meterless.ai/mac.html) | [Release details](https://www.meterless.ai/dgx-spark.html) |
| **Measured** | | [RTX 3090, Oct 2026](../../benchmarks/windows.md) | [M5 16 GB, Sep 2026](../../benchmarks/mac-m5.md) | [8 models in the app, Oct 2026](../../benchmarks/mac-m1-m4.md) | [Real nights, Aug to Oct 2026](../../benchmarks/dgx-spark.md) |

### Windows requirements

- A 64-bit Windows 10 or 11 PC with a dedicated graphics card.
- NVIDIA cards run CUDA. Other cards run Vulkan: about the same speed on 1B models, 2 to 3× slower on an 8B.
- The measured run used an RTX 3090 with 24 GB, which kept 8 of 12 catalog fleets fully resident. A 12 GB or 8 GB card rotates models through memory instead. Jobs still finish, with about 21 s of switching per rotated job.
- Keep the models folder on an internal SSD. From a USB hard disk, one 5 GB model switch took about 4 minutes.
- Nightshift shares the GPU. Plans pack against the VRAM that is free right now, so a game or a large app shrinks what Nightshift runs. A model that would not fit waits rather than spilling onto the CPU.
- The installer stops every `llama-server.exe` on the PC, not only Nightshift's.

### Mac M1+ requirements

- Any Apple Silicon Mac, M1 or later. It runs small models (1B to 4B) on the Mac's GPU through WebGPU.
- Intel Macs are not supported.

### Mac requirements

- A Mac with an M5 or later chip: MacBook Air, MacBook Pro, iMac, Mac mini, Mac Studio or Mac Pro.
- 16 GB unified memory minimum. 32 GB or more recommended for larger local models.
- macOS 15 Sequoia or later.
- M1 to M4 Macs can run the free Mac M1+ edition instead. Intel Macs are not supported.

The preorder is one perpetual license for one Mac, for one person, with all 1.x updates. It transfers to a replacement Mac you own. Refunds are available on request any time before the Mac release ships, and within 14 days after the download link is sent. Contact admin@meterless.ai.

## The standard hardware card

Every machine gets the same five-part card: the machine, what fits, how fast it reads and writes, what a night produces, and what it costs. The DGX Spark and one Windows PC are measured. The Macs are projected from the Spark run.

### NVIDIA DGX Spark, measured September 17, 2026

| | |
|---|---|
| Memory | 128 GB unified, 273 GB/s bandwidth |
| Chip | GB10, 20-core Arm CPU, Blackwell GPU |
| Software | DGX OS 7.2.3, Ubuntu 24.04, driver 580.173.02, llama.cpp 0865990 |
| Resident fleet | Qwen2.5-Coder-32B, Qwen3.8-27B and Muse-Glimmer-30B, Q4 weights, q8_0 KV cache, plus an embedder and a media server |
| Lanes | 3 |
| Decode | 6.2 to 7.7 tokens/s on one lane. 9.7 tokens/s aggregate with all three running. |
| Prefill | 424 to 596 tokens/s |
| Time to first token | 0.9 to 1.9 s at about 0.8K prompt tokens. 5.5 to 13.7 s at 3K to 6K. |
| Attempts per night | About 130 landed in 5h 15m (202 dispatched) |
| Cloud spend on the published night | $0.00. Power was not measured. |

Two other GPU tenants were resident during the run and the GPU was about one-third busy. Your model mix and workload will change these figures.

### Linking more Sparks (projected)

| Setup | Biggest model that fits | Lanes | Overnight attempts |
|---|---|---:|---:|
| 1 × DGX Spark (measured) | 120B MoE, e.g. gpt-oss-120b | 3 | about 130 |
| 2 × DGX Spark over ConnectX-7 | 235B MoE, e.g. Qwen3-235B-A22B | 6 | about 260 |
| 3 × DGX Spark | 235B MoE | 9 | about 390 |
| 4 × DGX Spark | 671B MoE, e.g. DeepSeek-V3.1 | 12 | about 520 |

Only the single-Spark row is measured. Check NVIDIA's current guidance before linking more than two Sparks.

### Macs (projected from the Spark run)

| Mac | Bandwidth | Biggest model | Lanes | Overnight attempts |
|---|---:|---|---:|---:|
| Mac Studio, M5 Ultra | 1,200 GB/s | 235B MoE | 8 | about 709 |
| Mac Studio or MacBook Pro, M5 Max 40-core | 614 GB/s | 120B MoE | 4 | about 306 |
| Mac Studio, M5 Max 32-core | 460 GB/s | 32B dense | 1 | about 158 |
| Mac mini or MacBook Pro, M5 Pro | 307 GB/s | 70B dense | 2 | about 111 |
| Mac mini, M6 | 170 GB/s | 27B dense | 1 | about 68 |
| MacBook Pro, M5 | 153 GB/s | 27B dense | 1 | about 62 |
| MacBook Air, M5, fanless | 153 GB/s | 27B dense | 1 | about 49 |

How the estimate works: decode is chip bandwidth × 0.51 (the utilization measured on the Spark) ÷ the lane model's weight size. Prefill scales with GPU size. Lanes fill the memory left after a 15% macOS reserve (at least 6 GB). Attempts per night are combined writing speed over 5h 15m ÷ 1,410 tokens per attempt, the Spark run's average. Rows where only a 30B or 8B lane fits produce lighter drafts and are not compared with the Spark.

A real M5 Mac with 16 GB has been measured too. See the [Mac M5 benchmark](../../benchmarks/mac-m5.md). The free M1+ edition was graded inside the shipped app: see [Mac M1 to M4](../../benchmarks/mac-m1-m4.md).

### Windows PC, measured October 18 to 19, 2026

| | |
|---|---|
| Machine | AMD Ryzen 9 5900X, 64 GB RAM, NVIDIA GeForce RTX 3090 24 GB (driver 560.94), Windows 10 Pro 22H2 |
| Software | Windows edition 1.2.1, build 13. Lanes run CUDA through the app's own llama.cpp build: flash attention, q8_0 KV cache, every layer on the GPU. |
| What fits | Five or six 1B to 8B lanes. 8 of 12 catalog fleets fully resident beside the owner's apps. No 27B to 32B model fits beside anything else. |
| Decode | 190 to 355 tokens/s on a 1B lane. 50 to 70 on an 8B. |
| Catalog sweep | 108 of 108 jobs completed, 100 winners correct, median job 3 to 33 s |
| Sustained run | 553 of 553 best-of-6 jobs in 3 hours, 0 errors, lane memory flat at 20.3 GB |
| Energy | About 0.3 to 0.4 Wh of GPU energy per resident best-of-4 job. Wall-socket power was not measured. |
| Cloud spend | $0.00 |

The PC was in daily use: a browser, VS Code and a speech server holding 2 GB of VRAM stayed open throughout. Your card, model mix and desktop will change these figures. Full results in the [Windows benchmark](../../benchmarks/windows.md).

## Use, not idle

Illustrative daily use of the same machine: 3 to 8 hours a day hands-on, 14 to 24 hours a day with Nightshift. About 15 agent attempts an hour, or about 180 in 12 unattended hours, on a DGX Spark-class workstation. These count work produced, not results you accepted. The return is the work you accept, which the [benchmarks](../../benchmarks/README.md) count separately.
