---
title: Putting the SER9's NPU to Work — First Steps with FastFlowLM Local Inference
slug: fastflowlm-npu-ser9
date: 2026-04-17T10:00:00+08:00
author: wenhq
description: The Beelink SER9 comes with an AMD XDNA 2 NPU sitting idle. FastFlowLM enables local LLM inference on Ryzen AI NPUs. This post documents the setup, usage, and a comparison with Ollama GPU inference.
draft: false
share: true
---

> [My previous post](https://www.binwh.com/en/2026/04/12/vulkan-ollama-amd-gpu/) covered getting Vulkan working so Ollama could run on the SER9's Radeon 890M integrated GPU. That post ended with an unresolved question — this machine also has an AMD XDNA 2 NPU that Ollama can't use. Which naturally leads to another question: **is there a tool that can run local models on the NPU?** The answer is [FastFlowLM](https://fastflowlm.com/).

<!-- more -->

## 1. 💻 Hardware & Tool of Choice

| Item   | Specs                |
| ------ | -------------------- |
| Model  | Beelink SER9         |
| CPU    | Ryzen AI 9 HX 370    |
| GPU    | Radeon 890M (iGPU)   |
| NPU    | AMD XDNA 2           |
| Memory | 32 GB                |
| OS     | Windows 11           |

The XDNA 2 NPU on the SER9 sits mostly idle — Ollama only supports CPU/GPU inference and can't use the NPU. Right now, the only tool that can run LLMs on this NPU is [FastFlowLM](https://fastflowlm.com/) (FLM for short). FLM is similar to Ollama in positioning but optimized specifically for AMD NPUs. It supports an OpenAI API-compatible interface, VLM vision models, and contexts up to 256K tokens (the NPU uses system memory, so it's not limited by VRAM). Usage is similar too: `flm run` to pull a model and chat, `flm serve` to start an API server.

The same applies to all Ryzen AI devices with XDNA 2.

## 2. ⚙️ Installation

**Prerequisites:**

- **CPU/NPU**: AMD Ryzen™ AI (XDNA2 architecture) — Strix Point / Strix Halo / Kraken Point / Gorgon Point
- **Memory**: 16 GB minimum, **≥ 32 GB recommended**
- **OS**: Windows 11 (Linux also supported, see references at the end)
- **NPU driver**: version must be ≥ `32.0.203.304`. Check via Task Manager → Performance → NPU. If outdated, update from [AMD's website](https://www.amd.com/en/support)

> Upgrading the driver has a side benefit: the official docs mention a 5-10% speed improvement with newer drivers.

Download the installer from [GitHub Releases](https://github.com/FastFlowLM/FastFlowLM/releases/latest/download/flm-setup.exe), double-click to run. If you hit a SmartScreen warning, click "More info" → "Run anyway". After installation, run `flm validate` — if the NPU is correctly detected, you're good to go.

## 3. 🚀 Quick Start

### 3.1. Running Your First Model

```powershell
flm run llama3.2:1b
```

If the model hasn't been downloaded yet, FLM will automatically pull it from HuggingFace. Once downloaded, you'll enter interactive mode and can chat with the model directly.

Models are stored by default in `C:\Users\<username>\Documents\flm\models`, customizable via the `FLM_MODEL_PATH` environment variable. Supported model families include LLaMA, Gemma, Qwen, DeepSeek, Phi, and more — see the [full list](https://fastflowlm.com/docs/models/).

### 3.2. CLI Commands

Common commands inside the CLI:

| Command         | Description                                         |
| --------------- | --------------------------------------------------- |
| `/show`         | Show model info (architecture, size, max context)   |
| `/load [model]` | Switch model                                        |
| `/clear`        | Clear KV cache                                      |
| `/status`       | Show runtime stats (token count, throughput)        |
| `/verbose`      | Toggle detailed performance metrics                 |
| `/history`      | View conversation history                           |
| `/bye`          | Exit                                                |

### 3.3. Server Mode

For an OpenAI API-compatible endpoint, use server mode:

```powershell
flm serve llama3.2:1b
```

Listens on `http://127.0.0.1:52625/v1` by default. You can call it with the OpenAI Python SDK:

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://127.0.0.1:52625/v1",
    api_key="flm"  # placeholder key
)

response = client.chat.completions.create(
    model="llama3.2:1b",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### 3.4. NPU Power Modes

FLM runs the NPU in `performance` mode by default. Switch via `--pmode` (options: `performance`, `turbo`, `balanced`, `powersaver`).

## 4. 📊 Ollama (GPU) vs FastFlowLM (NPU) Comparison

Using the same SER9, I ran **Qwen3.5-4B** through Ollama (Vulkan GPU) and FastFlowLM (NPU) respectively, with Think Mode enabled, to compare inference speed.

**Test conditions**: context length 32000, Temperature 0, Top-p 1.0, Verbose on.

**Test prompt** (translated from Chinese):

```text
I'm planning to take my family to Shanghai for a trip this autumn, since the weather is pleasant — not as hot as summer, not as cold as winter, suitable for outdoor activities and convenient for both elderly and children. Our family spans a wide age range, with both seniors and young children, so I'd like the itinerary to be relaxed yet enriching. I want to see Shanghai's iconic landmarks, experience the local culture, food, and leisure, without a rushed schedule or exhausting long walks.

I'm interested in attractions and activities that are worth visiting, especially those suitable for families and autumn travel. When planning the itinerary, should I group attractions by area — Pudong, Puxi, and suburbs — to reduce travel time and walking fatigue? I'd also like to know which spots are particularly beautiful in autumn, such as parks with fall foliage, Huangpu River waterfront views, or photogenic locations. Beyond sightseeing, I care about dining and rest — seniors need regular meals and breaks, while kids enjoy special snacks, desserts, and interactive restaurants. I'd like to find comfortable restaurants near attractions with seating, or schedule café stops and park walks so everyone can relax between sightseeing.

Some practical questions: autumn in Shanghai is comfortable, but mornings and evenings can be cool — should we pack jackets or rain gear? Which attractions require advance booking to avoid long queues? Shanghai's metro is convenient, but is it suitable for seniors, or should we consider taxis or ride-hailing as backup? For popular spots, are there recommended visiting orders and times to avoid crowds? Any suggestions for unique shops or craft markets rather than commercial malls?

I'd appreciate a 4–5 day itinerary with daily attraction plans, transportation tips, dining recommendations, and rest time. For example: Day 1, the Bund, Nanjing Road, and nearby museums; Day 2, Yu Garden, City God Temple, and Xintiandi; Day 3, Oriental Pearl Tower, Shanghai Tower observation deck, and the Science & Technology Museum or Natural History Museum; Day 4, Disneyland or the zoo for the kids; Day 5, some lesser-known spots or suburban parks for a slower pace. I want the trip to be neither too packed nor too loose.

A few more tips: which attractions offer wheelchair or stroller rentals? Are there convenient parking lots or rest areas nearby? Should I make reservations at popular restaurants or afternoon tea spots in advance? Any photography tips — best angles or lighting times for family photos? In short, I want this to be more than sightseeing — a shared family experience with good food, culture, nature, and memories.
```

### 4.1. Ollama (Vulkan GPU)

Radeon 890M iGPU, Vulkan acceleration.

```powershell
ollama run qwen3.5:4b --think --verbose

>>> /set parameter num_ctx 32000
>>> /set parameter temperature 0
>>> /set parameter top_p 1.0
```

Verbose output:

```
total duration:       5m7.5029357s
load duration:        9.8956766s
prompt eval count:    683 token(s)
prompt eval duration: 3.2768775s
prompt eval rate:     208.43 tokens/s
eval count:           4694 token(s)
eval duration:        4m52.1924303s
eval rate:            16.06 tokens/s
```

![](https://static.binwh.com/img/2026/04/19/b2kWj7.png)

### 4.2. FastFlowLM (NPU)

XDNA 2 NPU, performance mode.

```powershell
flm run qwen3.5:4b --ctx-len 32000

/think
/verbose
/set temp 0
/set topp 1.0
```

Verbose output:

```
Verbose:
  Total tokens:        4680 (14.62%)
  TTFT:                2.22 s
  Prefill speed:       309.57 tokens/s
  Decoding speed:      11.99 tokens/s
```

![](https://static.binwh.com/img/2026/04/19/mbuAXs.png)

> Compared to the [official benchmark](https://fastflowlm.com/docs/benchmarks/qwen3.5_results/) (Ryzen AI 7 350, Kraken Point), Qwen3.5-4B at 32K context shows a decode speed of 9.6 tok/s. My result of 11.99 tok/s is ~25% higher (Strix Point NPU is more powerful, makes sense). For prefill speed, the official ~1K prompt result is 378 tok/s, while my ~683 token prompt measured 309.57 tok/s — reasonably close.

### 4.3. Data Comparison

| Metric                  | Ollama (GPU) | FLM (NPU) |
| ----------------------- | ------------ | --------- |
| **Prefill speed** (tok/s) | 208.43       | 309.57    |
| **Decode speed** (tok/s)  | 16.06        | 11.99     |
| **TTFT** (ms)             | 3277         | 2220      |
| **Generated tokens**      | 4694         | 4680      |

> The generated token counts are close (4694 / 4680), suggesting similar chain-of-thought lengths under Think Mode.

**Conclusions:**

- **Both solutions are significantly faster than CPU-only inference.** This post compares two acceleration approaches — GPU vs NPU.
- **Prefill: NPU outperforms GPU by ~1.5x** (with long prompts). The NPU's prefill speed (309.57 tok/s) exceeded the GPU (208.43 tok/s), leveraging its memory bandwidth advantage with longer prompts. However, this advantage depends on prompt length — when I tested with a short prompt (e.g., "What's fun to do in Shanghai?" ~28 tokens), NPU prefill was only ~90 tok/s, far behind the GPU's ~176 tok/s.
- **Decode: GPU is ~1.3x faster.** The GPU (16.06 tok/s) is slightly faster than the NPU (11.99 tok/s), but the gap is small. 12 tok/s decode speed is perfectly usable — human reading speed is roughly 5-8 tok/s.
- **NPU and GPU each have their strengths**: NPU is faster at prefill with long prompts, while GPU has the edge on short prompts and decode generation.

## 5. 📝 Final Notes

The test conditions in this post are not rigorous — generation length was not controlled, only one round of conversation was tested, and no power consumption data was collected. Results are for reference only.

This is a personal learning and research record, not a recommendation for any hardware or software.

## 6. 🔗 References

- [FastFlowLM Documentation](https://fastflowlm.com/docs/)
- [FastFlowLM GitHub](https://github.com/FastFlowLM/FastFlowLM)
- [AMD NPU Driver Downloads](https://www.amd.com/en/support)
- [Previous: Enabling AMD GPU Acceleration for Ollama on Windows with Vulkan](https://www.binwh.com/en/2026/04/12/vulkan-ollama-amd-gpu/)
