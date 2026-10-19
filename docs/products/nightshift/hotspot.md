# The Nightshift hotspot

The hotspot lets one machine serve AI to many apps at once. Connect your compatible AI apps to Nightshift. While it runs, it serves each of them text, image, video and speech generation from your own machine. A laptop chat app asks for a contract summary. A phone voice app asks for a read-aloud. A desktop transcriber sends a standup recording. A tablet image tool asks for a vintage car at sunset. A studio PC queues an eight-second night drive. All of them are answered by the same box.

The hotspot runs on the Windows, Mac and DGX editions. The free web edition lets you try a job in your browser.

## How an app connects

Nightshift exposes the Meterless Runtime as an OpenAI-compatible provider.

| Setting | Value |
|---|---|
| Default base URL | `http://127.0.0.1:8088/v1` |
| Auth | `Authorization: Bearer <token>`. The runtime writes the token to `<stateDir>/proxy-token`. |
| App header | `meterless-app: <a stable lowercase id for your app>` on every request |
| Discovery | `GET /v1/models` lists the routing modes. `GET /healthz` only proves the process is up. |
| Auto Detect | Ports 8088, 8090, 8787 and 11434 on `127.0.0.1`, `localhost` and `[::1]` |

To share one hotspot across machines on your network, turn on hotspot mode and paste its connect link once. Meterless City, for example, can run on one PC with the runtime on a second machine.

## Model ids are routing modes

Your app does not pick a model file. It picks a disposition, and the runtime routes to the fleet you have.

| Id | Meaning |
|---|---|
| `meterless/auto` | Let the runtime decide |
| `meterless/fast` | Lowest latency |
| `meterless/deep` | Most capable route |
| `meterless/cheap` | Lowest cost |
| `meterless/local` | Never leave the machine |
| `meterless/fusion` | Combine routes |
| `meterless/<class>` and `meterless/<class>.<disposition>` | A class such as `vision`, `text`, `image` or `video`, optionally with a disposition |

Sitcomify is a working example. It routes its four roles to `meterless/vision`, `meterless/text`, `meterless/image` and `meterless/video`, and needs no cloud key at all when the runtime is on your machine.

## Who already uses it

| App | What it draws from the hotspot |
|---|---|
| Cursor, Claude Code and other coding agents | Chat and code completions on `meterless/*` |
| [Gaia](../gaia/README.md), [Relay](../relay/README.md), [Swarms](../swarms/README.md) | Local or connected models for the free apps |
| [Meterless City](../../experiments/meterless-city/README.md) | About 700 NPC turns an active hour, voice included, with no metered cloud fallback for text |
| [Sitcomify](../../experiments/sitcomify/README.md) | Vision, writing, image frames and video clips |
| [DataPlant](../../experiments/dataplant/README.md) | Background account scoring and Ask DataPlant on Qwen 2.5 14B |

## Add Meterless to your own app

The full provider contract, written as a prompt your coding agent can execute, is in [docs/agent-ready/add-meterless-provider.md](../../agent-ready/add-meterless-provider.md). You are done when a wrong token shows unauthorized (not offline), Auto Detect finds the runtime, and a plain text request on `meterless/auto` returns a string.

## When the hotspot is the wrong tool

Local prefill on a DGX Spark runs at about 458 tokens a second. An agent that re-reads 100K tokens of context pays about 3 minutes 38 seconds before its first word. Across every request Nightshift routed on that box, median latency was 36.8 s and p95 was 5 minutes 7 seconds. That is not an editor experience. When someone is waiting, rent latency from the cloud. When nobody is waiting, own the throughput. More in [learnings](../../architecture/learnings.md).
