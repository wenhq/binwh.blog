---
title: Enabling AMD GPU Acceleration for Ollama on Windows with Vulkan
slug: vulkan-ollama-amd-gpu
date: 2026-04-12T10:00:00+08:00
author: wenhq
description: ROCm doesn't work on Windows with AMD APU? One environment variable switches to Vulkan, letting Ollama fully utilize your AMD iGPU
draft: false
share: true
---

> I have a Beelink SER9 mini PC with a Ryzen AI 9 HX 370 CPU and Radeon 890M integrated GPU. Recently I've been running local models with Ollama on Windows, but the default CPU-only inference was painfully slow. After some trial and error — ROCm simply doesn't support Windows APUs — I got GPU acceleration working with Vulkan via a single environment variable.

<!-- more -->

## Hardware Setup

| Item | Specs |
|---|---|
| Model | Beelink SER9 |
| CPU | Ryzen AI 9 HX 370 |
| GPU | Radeon 890M (iGPU) |
| Architecture | GFX1150 / RDNA 3.5 (Strix Point) |
| NPU | AMD XDNA 2 (Ryzen AI Engine) |
| OS | Windows 11 |

Installing Ollama is straightforward with scoop:

```powershell
scoop install extras/ollama-full
```

After installation, `ollama run qwen3-vl:4b` works out of the box. The problem? **It runs on CPU by default.**

## Two Paths for AMD GPU Acceleration in Ollama

Ollama is built on top of [llama.cpp](https://github.com/ggml-org/llama.cpp), which provides two acceleration paths for AMD GPUs:

|  | ROCm | Vulkan |
|---|---|---|
| **What it is** | AMD's professional GPU compute platform (comparable to CUDA) | Cross-platform graphics/compute API (Khronos standard) |
| **Implementation** | `LLAMA_HIPBLAS=1`, GPU executes inference directly | `LLAMA_VULKAN=1`, inference via Vulkan Compute Shaders |
| **Supported GPUs** | Only officially supported gfx architectures | Nearly any GPU with Vulkan support |
| **Performance** | Theoretically optimal (requires official support) | Sometimes 5-10% faster in practice, good community feedback |
| **Driver requirements** | Requires ROCm driver + HIP runtime | Only a standard GPU driver, zero extra installation |

In short: ROCm delivers the best performance but is limited to officially supported GPUs; Vulkan offers broader compatibility with near-zero configuration.

## Attempting ROCm: Dead End

Following community guides, I set the environment variable `HSA_OVERRIDE_GFX_VERSION=11.5.0` to match the GPU architecture, and started `ollama serve` with high expectations.

The result:

```powershell
(base) PS D:\> ollama serve
# ...
OLLAMA_VULKAN:false
# ...
experimental Vulkan support disabled.  To enable, set OLLAMA_VULKAN=1
# ...
inference compute" id=cpu library=cpu  # Falls back to CPU
```

Confirmed with `ollama ps`:

```powershell
(base) PS D:\> ollama ps
NAME           ID              SIZE      PROCESSOR    CONTEXT    UNTIL
qwen3-vl:4b    1343d82ebee3    8.9 GB    100% CPU     32768      4 minutes from now
```

**100% CPU — the GPU was completely idle.**

After digging through the documentation, I found the root cause: according to the [Ollama official docs](https://docs.ollama.com/gpu#vulkan-gpu-support), ROCm on **Windows only supports Radeon RX / PRO discrete GPUs**, excluding all Ryzen AI series APUs. The Ryzen AI 9 HX 370 only appears on the **Linux ROCm** support list.

In other words, no matter how you configure `HSA_OVERRIDE_GFX_VERSION` on Windows, ROCm will never recognize this integrated GPU. It's not a configuration issue — it's simply unsupported.

> The community project [ollama-for-amd](https://github.com/likelovewant/ollama-for-amd) extends the GPU compatibility list to enable ROCm on more AMD GPUs. However, it still relies on the ROCm stack, which is equally ineffective for Windows APUs. Plus, it requires using a community fork that can't be managed via scoop, so I decided to skip it.

## Switching to Vulkan: One Environment Variable

With ROCm out of the picture, Vulkan is the way to go. All it takes is setting `OLLAMA_VULKAN=1`.

**Option 1: System environment variable** (recommended, persistent)

Add `OLLAMA_VULKAN` with value `1` in Windows Settings → Environment Variables.

**Option 2: Temporary session variable**

```powershell
$env:OLLAMA_VULKAN = 1
```

With the variable set, `ollama serve` outputs a completely different log:

```powershell
(base) PS D:\> ollama serve
# ...
OLLAMA_VULKAN:true  # Vulkan enabled
# ...
inference compute" library=Vulkan name=Vulkan0 \
  description="AMD Radeon(TM) 890M Graphics" \
  type=iGPU total="17.8 GiB" available="16.9 GiB"  # GPU correctly identified
```

The GPU is correctly recognized! Let's verify:

```powershell
(base) PS D:\> ollama ps
NAME           ID              SIZE      PROCESSOR    CONTEXT    UNTIL
qwen3-vl:4b    1343d82ebee3    9.1 GB    100% GPU     32768      4 minutes from now
```

**100% GPU** — the Radeon 890M is now doing the heavy lifting.

## A Note on the NPU

This machine also has an AMD XDNA 2 NPU, but Ollama currently **cannot utilize the NPU directly**. Ollama's acceleration paths are GPU-only (ROCm/Vulkan). The NPU is primarily used for Windows Studio Effects, real-time translation, and other system-level AI features. If llama.cpp adds NPU offload support in the future, that would be the real game-changer.

## Summary

For Radeon 890M and similar Ryzen AI APU iGPU users, the GPU acceleration path on Windows is straightforward:

| Step | Action | Note |
|------|--------|------|
| 1 | Confirm GPU type | APU iGPU → ROCm won't work |
| 2 | Set `OLLAMA_VULKAN=1` | System environment variable or session temporary |
| 3 | Verify with `ollama serve` | Look for `library=Vulkan` in the log |

The bottom line: one environment variable, zero extra dependencies, and the full ~17.8 GiB of Radeon 890M iGPU memory is available — more than enough for running `qwen3-vl:4b` locally.

## References

- [Ollama GPU Support — Official Docs](https://docs.ollama.com/gpu#vulkan-gpu-support)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
- [ollama-for-amd](https://github.com/likelovewant/ollama-for-amd)
- [llamacpp-rocm issue #57](https://github.com/lemonade-sdk/llamacpp-rocm/issues/57)
