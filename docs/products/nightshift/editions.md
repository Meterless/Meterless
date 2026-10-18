# Nightshift editions and hardware

Start free in your browser. Then give whatever compute you already own its night shift.

## Editions

| | Web | Mac | DGX |
|---|---|---|---|
| **Runs on** | Your browser | Apple Silicon Mac, M5 or later | NVIDIA DGX Spark |
| **Hotspot for your apps** | No | Yes | Yes |
| **Overnight jobs** | Try a job | Yes | Yes, one job at a time |
| **Price** | Free | $199 USD one-time, preorder | On request |
| **Availability** | [Live now](https://meterless.ai/Nightshift/WEB/) | [Preorder](https://www.meterless.ai/mac.html), delivery Q4 2026 | [Release details](https://www.meterless.ai/dgx-spark.html) |

### Mac requirements

- A Mac with an M5 or later chip: MacBook Air, MacBook Pro, iMac, Mac mini, Mac Studio or Mac Pro.
- 16 GB unified memory minimum. 32 GB or more recommended for larger local models.
- macOS 15 Sequoia or later.
- M1 to M4 and Intel Macs are not supported.

The preorder is one perpetual license for one Mac, for one person, with all 1.x updates. It transfers to a replacement Mac you own. Refunds are available on request any time before the Mac release ships, and within 14 days after the download link is sent. Contact admin@meterless.ai.

## The standard hardware card

Every machine gets the same five-part card: the machine, what fits, how fast it reads and writes, what a night produces, and what it costs. The DGX Spark is measured. The Macs are projected from that run.

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

A real M5 Mac with 16 GB has been measured too. See the [Mac M5 benchmark](../../benchmarks/README.md#mac-m5-16-gb).

## Use, not idle

Illustrative daily use of the same machine: 3 to 8 hours a day hands-on, 14 to 24 hours a day with Nightshift. About 15 agent attempts an hour, or about 180 in 12 unattended hours, on a DGX Spark-class workstation. These count work produced, not results you accepted. The return is the work you accept, which the [benchmarks](../../benchmarks/README.md) count separately.
