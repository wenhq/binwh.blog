---
title: 在 Windows 上用 Vulkan 为 Ollama 开启 AMD GPU 加速
slug: vulkan-ollama-amd-gpu
date: 2026-04-12T10:00:00+08:00
author: wenhq
description: 零刻 SER9 + Radeon 890M 核显，ROCm 走不通？一条环境变量切换 Vulkan，让 Ollama 跑满你的 AMD iGPU
draft: false
share: true
---

> 手里有一台零刻 SER9 迷你主机，CPU 是 Ryzen AI 9 HX 370，核显 Radeon 890M。最近在 Windows 上用 Ollama 跑本地模型，默认全是 CPU 推理，速度堪忧。于是开始折腾 GPU 加速，踩了一些坑——ROCm 在 Windows APU 上根本不支持，最终靠 Vulkan 一条环境变量搞定。

<!-- more -->

## 硬件环境

| 项目 | 规格 |
|---|---|
| 品牌 | 零刻（Beelink）SER9 |
| CPU | Ryzen AI 9 HX 370 |
| GPU | Radeon 890M（iGPU） |
| 架构 | GFX1150 / RDNA 3.5 (Strix Point) |
| NPU | AMD XDNA 2（Ryzen AI 引擎） |
| 系统 | Windows 11 |

Ollama 安装很简单，用 scoop 一行搞定：

```powershell
scoop install extras/ollama-full
```

装完直接 `ollama run qwen3-vl:4b` 就能用了。但问题在于——**默认跑的是 CPU**。

## Ollama 的 AMD GPU 两条路

Ollama 底层基于 [llama.cpp](https://github.com/ggml-org/llama.cpp)，对 AMD GPU 有两种加速路径：

|  | ROCm | Vulkan |
|---|---|---|
| **本质** | AMD 的专业 GPU 计算平台（对标 CUDA） | 跨平台图形/计算 API（Khronos 标准） |
| **实现** | `LLAMA_HIPBLAS=1`，GPU 直接执行推理 | `LLAMA_VULKAN=1`，通过 Compute Shader 执行推理 |
| **支持的 GPU** | 仅限官方支持的 gfx 架构 | 几乎所有支持 Vulkan 的 GPU |
| **性能** | 理论最优（需官方支持） | 实测有时反快 5-10%，社区反馈不错 |
| **驱动要求** | 需安装 ROCm 驱动 + HIP 运行时 | 只需普通显卡驱动，零额外安装 |

简单说：ROCm 性能最优但仅限官方支持的 GPU；Vulkan 兼容性更广，几乎零配置就能用。

## 尝试 ROCm：走不通

按照社区教程，我设置了环境变量 `HSA_OVERRIDE_GFX_VERSION=11.5.0` 来匹配 GPU 架构，满怀期待地启动 `ollama serve`。

结果：

```powershell
(base) PS D:\> ollama serve
# ...
OLLAMA_VULKAN:false
# ...
experimental Vulkan support disabled.  To enable, set OLLAMA_VULKAN=1
# ...
inference compute" id=cpu library=cpu  # 回退到 CPU
```

用 `ollama ps` 确认：

```powershell
(base) PS D:\> ollama ps
NAME           ID              SIZE      PROCESSOR    CONTEXT    UNTIL
qwen3-vl:4b    1343d82ebee3    8.9 GB    100% CPU     32768      4 minutes from now
```

**100% CPU，GPU 完全没参与。**

翻了一圈文档才搞清楚原因：根据 [Ollama 官方文档](https://docs.ollama.com/gpu#vulkan-gpu-support)，ROCm 在 **Windows 上仅支持 Radeon RX / PRO 独立显卡**，不包含任何 Ryzen AI 系列 APU。而 Ryzen AI 9 HX 370 仅在 **Linux ROCm** 支持列表中。

换句话说，在 Windows 上无论怎么配置 `HSA_OVERRIDE_GFX_VERSION`，ROCm 都不可能识别这块核显。不是配置问题，是压根不支持。

> 社区有 [ollama-for-amd](https://github.com/likelovewant/ollama-for-amd) 项目，通过扩展 GPU 兼容列表让更多 AMD 显卡走 ROCm。但它仍然是 ROCm 路线，对 Windows APU 同样无效，而且需要用社区版本，没法用 scoop 管理更新，所以直接放弃。

## 切换 Vulkan：一条环境变量搞定

既然 ROCm 走不通，那就换 Vulkan。只需要设置一个环境变量 `OLLAMA_VULKAN=1`。

**方式一：系统环境变量**（推荐，永久生效）

在 Windows 系统设置 → 环境变量中添加 `OLLAMA_VULKAN`，值为 `1`。

**方式二：终端临时启用**

```powershell
$env:OLLAMA_VULKAN = 1
```

设置好后启动 `ollama serve`，这次日志完全不一样了：

```powershell
(base) PS D:\> ollama serve
# ...
OLLAMA_VULKAN:true  # Vulkan 已启用
# ...
inference compute" library=Vulkan name=Vulkan0 \
  description="AMD Radeon(TM) 890M Graphics" \
  type=iGPU total="17.8 GiB" available="16.9 GiB"  # GPU 被正确识别
```

GPU 被正确识别了！再验证一下：

```powershell
(base) PS D:\> ollama ps
NAME           ID              SIZE      PROCESSOR    CONTEXT    UNTIL
qwen3-vl:4b    1343d82ebee3    9.1 GB    100% GPU     32768      4 minutes from now
```

**100% GPU**，Radeon 890M 开始干活了。

## 关于 NPU

这台机器还有 AMD XDNA 2 NPU，但 Ollama 目前**不能直接使用 NPU**。Ollama 走的是 GPU 路线（ROCm/Vulkan），NPU 主要给 Windows Studio Effects、实时翻译等系统级 AI 功能用。未来如果 llama.cpp 支持 NPU offload，那才是真正的好消息。

## 总结

对 Radeon 890M 这类 Ryzen AI APU 核显用户来说，在 Windows 上的 GPU 加速路径非常清晰：

| 步骤 | 操作 | 说明 |
|------|------|------|
| 1 | 确认 GPU 类型 | APU 核显 → 不走 ROCm |
| 2 | 设置 `OLLAMA_VULKAN=1` | 系统环境变量或终端临时设置 |
| 3 | `ollama serve` 验证 | 日志中看到 `library=Vulkan` 即成功 |

最终效果：一个环境变量，零额外依赖，Radeon 890M 核显 ~17.8 GiB 显存全部可用，本地跑 `qwen3-vl:4b` 完全够用。

## 相关链接

- [Ollama GPU Support 官方文档](https://docs.ollama.com/gpu#vulkan-gpu-support)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
- [ollama-for-amd](https://github.com/likelovewant/ollama-for-amd)
- [llamacpp-rocm issue #57](https://github.com/lemonade-sdk/llamacpp-rocm/issues/57)
