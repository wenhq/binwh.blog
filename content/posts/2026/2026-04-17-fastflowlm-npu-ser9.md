---
title: SER9 的 NPU 不该闲着——FastFlowLM 本地推理初探
slug: fastflowlm-npu-ser9
date: 2026-04-17T10:00:00+08:00
author: wenhq
description: 零刻 SER9 搭载 AMD XDNA 2 NPU，不跑 NPU 推理就是浪费。FastFlowLM 让 Ryzen AI NPU 跑本地 LLM，这篇文章记录安装、使用，以及和 Ollama GPU 的对比。
draft: false
share: true
---

> [上一篇文章](https://www.binwh.com/2026/04/12/vulkan-ollama-amd-gpu/)折腾了 Vulkan 让 Ollama 在 SER9 的 Radeon 890M 核显上跑起来。但那篇文章结尾提到了一个未解的问题——这台机器上还有 AMD XDNA 2 NPU，Ollama 用不了。于是自然引出了另一个问题：**有没有什么工具能让 NPU 也跑本地模型？** 答案是 [FastFlowLM](https://fastflowlm.com/)。

<!-- more -->

## 1. 💻 硬件环境与工具选择

| 项目 | 规格               |
| ---- | ------------------ |
| 机型 | 零刻 SER9          |
| CPU  | Ryzen AI 9 HX 370  |
| GPU  | Radeon 890M (iGPU) |
| NPU  | AMD XDNA 2         |
| 内存 | 32 GB              |
| 系统 | Windows 11         |

SER9 上的 XDNA 2 NPU 平时基本闲置——Ollama 只支持 CPU/GPU 推理，用不了 NPU。目前能让这块 NPU 跑 LLM 的工具，基本只有 [FastFlowLM](https://fastflowlm.com/)（简称 FLM）。FLM 定位类似 Ollama，但专门针对 AMD NPU 优化，支持 OpenAI API 兼容接口、VLM 视觉模型，上下文最高 256K tokens（NPU 使用系统内存，不受显存限制）。用法也类似：`flm run` 拉模型对话，`flm serve` 起 API 服务。

所有搭载 XDNA 2 的 Ryzen AI 设备同理。

## 2. ⚙️ 安装

**前提条件：**

- **CPU/NPU**：AMD Ryzen™ AI（XDNA2 架构）——Strix Point / Strix Halo / Kraken Point / Gorgon Point
- **内存**：最低 16 GB，**推荐 ≥ 32 GB**
- **系统**：Windows 11（Linux 也支持，见后文参考链接）
- **NPU 驱动**：版本必须 ≥ `32.0.203.304`，可在任务管理器 → 性能 → NPU 中查看，版本过低去 [AMD 官网](https://www.amd.com/en/support) 更新

> 升级驱动还有一个附带好处：官方文档提到新驱动能带来 5-10% 的速度提升。

从 [GitHub Releases](https://github.com/FastFlowLM/FastFlowLM/releases/latest/download/flm-setup.exe) 下载安装包，双击运行即可。遇到 SmartScreen 警告点 "More info" → "Run anyway"。安装完成后运行 `flm validate` 验证，看到 NPU 被正确识别就说明成功了。

## 3. 🚀 快速上手

### 3.1. 运行第一个模型

```powershell
flm run llama3.2:1b
```

如果模型还没下载，FLM 会自动从 HuggingFace 拉取。下载完成后进入交互模式，可以直接和模型对话。

模型默认存储在 `C:\Users\<username>\Documents\flm\models`，可以通过环境变量 `FLM_MODEL_PATH` 自定义。目前已支持 LLaMA、Gemma、Qwen、DeepSeek、Phi 等主流模型家族，完整列表见 [官方模型页面](https://fastflowlm.com/docs/models/)。

### 3.2. CLI 交互命令

进入 CLI 后常用的几个命令：

| 命令            | 功能                                   |
| --------------- | -------------------------------------- |
| `/show`         | 查看模型信息（架构、大小、最大上下文） |
| `/load [model]` | 切换模型                               |
| `/clear`        | 清除 KV cache                          |
| `/status`       | 显示运行时统计（token 数、吞吐量）     |
| `/verbose`      | 切换详细性能指标                       |
| `/history`      | 查看对话历史                           |
| `/bye`          | 退出                                   |

### 3.3. Server 模式

如果需要 OpenAI API 兼容的接口，可以用 server 模式：

```powershell
flm serve llama3.2:1b
```

默认监听 `http://127.0.0.1:52625/v1`，可以用 OpenAI Python SDK 直接调用：

```python
from openai import OpenAI

client = OpenAI(
    base_url="http://127.0.0.1:52625/v1",
    api_key="flm"  # 占位 key
)

response = client.chat.completions.create(
    model="llama3.2:1b",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

### 3.4. NPU 功率模式

FLM 默认以 `performance` 模式运行 NPU，也可以通过 `--pmode` 切换（可选 `performance`、`turbo`、`balanced`、`powersaver`）。

## 4. 📊 Ollama (GPU) vs FastFlowLM (NPU) 对比

用同一台 SER9，分别通过 Ollama (Vulkan GPU) 和 FastFlowLM (NPU) 运行 **Qwen3.5-4B** 模型，开启 Think Mode，对比推理速度。

**测试条件**：上下文长度 32000，Temperature 0，Top-p 1.0，Verbose 开启。

**测试提示词**（中文提示词）：

```text
我计划在秋天带家人去上海旅游，因为这个季节天气适宜，不像夏天那么炎热，也不像冬天那么寒冷，既适合户外活动，也方便老年人和孩子一起出行。我们家庭成员年龄跨度比较大，既有长辈，也有小孩，因此希望整个行程既轻松又丰富，既能欣赏上海的标志性景点，又能体验当地独特的文化、美食和休闲方式，而不希望过于赶行程或出现让人疲惫的长时间步行。在选择景点时，我希望能够兼顾历史文化、现代都市风貌以及自然景观，比如既想去外滩感受黄浦江的都市风情，又想参观豫园和城隍庙了解传统园林和民俗文化，同时也希望安排一些适合孩子的游乐或互动体验，比如迪士尼乐园或者科技馆，让全家人都能享受旅行的乐趣。

因此，我想请教，上海有哪些景点和活动是非常值得去的，尤其适合家庭游客、适合秋季出游的地方？在设计行程的时候，是否有必要按照区域集中游览，比如把浦东、浦西和郊区的景点分开，以减少交通时间和步行疲劳？我还想了解哪些景点在秋天特别美丽，比如公园的秋色、黄浦江沿岸的景观，或者适合拍照打卡的地方。除了景点本身，我也很关注餐饮和休闲方面的安排，因为老年人可能需要定时休息和饮食，而孩子可能喜欢一些特色小吃、甜点和互动餐厅。我希望在行程中能够兼顾老少的需求，比如在景点附近选择有座位、环境舒适的餐厅，或者安排适合休息的咖啡馆和公园散步时间，让大家在观光之余也能放松。

同时，我想请教一些旅行注意事项：秋天上海的天气比较舒适，但早晚温差较大，是否需要准备外套或雨具？在景点安排上，有哪些地方需要提前预约门票，避免现场排队过久？在交通方面，上海地铁线路虽然便利，但老年人乘坐地铁是否会有不便，是否需要考虑使用出租车或网约车作为补充？此外，对于一些热门景点，我们希望尽量避免人流过于拥挤的时间段，是否有建议的游览顺序和最佳时间？对于购物和纪念品购买，我也希望能得到一些建议，尤其是有特色的小店或手工艺品市场，而不是完全商业化的购物中心。

在行程设计上，我希望能够得到一个4～5天的推荐线路，包含每日的景点安排、交通建议、餐饮推荐和休息时间的规划。例如是否可以第一天安排外滩、南京路步行街和附近的博物馆，第二天去豫园、城隍庙和新天地，第三天安排浦东的东方明珠塔、上海中心大厦观景厅，以及科技馆或者自然博物馆，第四天带孩子去迪士尼乐园或者动物园，第五天安排一些小众景点或者郊区公园，既能缓解疲劳，也能补充文化和自然体验。希望整个行程既不会太紧凑，让长辈和孩子都能适应，也不会太松散，避免浪费时间。

此外，我还想了解一些家庭旅行的小技巧，比如哪些景点适合租用轮椅或者婴儿车？在景点附近是否有方便的停车场或者休息区？如果在景点附近有特色餐厅或者下午茶地点，是否有必要提前预定？对于拍照和打卡，我也希望能有一些建议，尤其是哪些角度或者时段光线最好，能够拍出美丽的全家福或者景观照片。总之，我希望这次上海之行不仅是一次观光旅行，更是一次全家人共同享受美好时光的体验，希望大家能够提供详细的建议，包括景点推荐、行程安排、餐饮选择、交通方式、注意事项、购物体验以及休息和娱乐的综合规划，让整个旅行既充实又轻松。
```

### 4.1. Ollama (Vulkan GPU)

Radeon 890M iGPU，Vulkan 加速。

```powershell
ollama run qwen3.5:4b --think --verbose

>>> /set parameter num_ctx 32000
>>> /set parameter temperature 0
>>> /set parameter top_p 1.0
```

verbose 输出：

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

XDNA 2 NPU，performance 模式。

```powershell
flm run qwen3.5:4b --ctx-len 32000

/think
/verbose
/set temp 0
/set topp 1.0
```

verbose 输出：

```
Verbose:
  Total tokens:        4680 (14.62%)
  TTFT:                2.22 s
  Prefill speed:       309.57 tokens/s
  Decoding speed:      11.99 tokens/s
```

![](https://static.binwh.com/img/2026/04/19/mbuAXs.png)

> 对比 [官方 benchmark](https://fastflowlm.com/docs/benchmarks/qwen3.5_results/)（Ryzen AI 7 350, Kraken Point），Qwen3.5-4B 在 32K 上下文下的 decode 速度为 9.6 tok/s，我的实测 11.99 tok/s，高出约 25%（Strix Point NPU 更强，合理）。Prefill 速度官方 ~1K prompt 为 378 tok/s，我的 ~683 token prompt 实测 309.57 tok/s，数值接近。

### 4.3. 数据对比

| 指标                     | Ollama (GPU) | FLM (NPU) |
| ------------------------ | ------------ | --------- |
| **Prefill 速度** (tok/s) | 208.43       | 309.57    |
| **Decode 速度** (tok/s)  | 16.06        | 11.99     |
| **首 token 延迟** (ms)   | 3277         | 2220      |
| **生成 token 数**        | 4694         | 4680      |

> 两次生成的 token 数接近（4694 / 4680），Think Mode 下推理链长度基本一致。

**结论：**

- **两个方案都远快于纯 CPU 推理**，本文对比的是 GPU 和 NPU 两个加速方案之间的高低。
- **Prefill：NPU 反超 GPU 约 1.5 倍**（长 prompt 下）。NPU 的 prefill 速度（309.57 tok/s）超过了 GPU（208.43 tok/s），处理较长 prompt 时 NPU 的内存带宽优势发挥了作用。但这个优势依赖 prompt 长度——我用短的中文提示词（如「上海有什么好玩的？」约 28 tokens）单独测试时，NPU prefill 只有 ~90 tok/s，远不如 GPU 的 ~176 tok/s。
- **Decode：GPU 快约 1.3 倍**。GPU（16.06 tok/s）略快于 NPU（11.99 tok/s），但差距不大。12 tok/s 的 decode 速度完全可接受——人眼阅读速度大约 5-8 tok/s。
- **NPU 和 GPU 各有擅长**：NPU 在处理长 prompt 时 prefill 更快，GPU 在短 prompt 和 decode 生成上更有优势。

## 5. 📝 最后

本文的测试条件并不严格——未控制生成长度、仅测试一轮对话、未采集功耗数据，结果仅供参考。

仅为个人学习研究记录，不构成任何软硬件推荐。

## 6. 🔗 相关链接

- [FastFlowLM 官方文档](https://fastflowlm.com/docs/)
- [FastFlowLM GitHub](https://github.com/FastFlowLM/FastFlowLM)
- [AMD NPU 驱动下载](https://www.amd.com/en/support)
- [上一篇：在 Windows 上用 Vulkan 为 Ollama 开启 AMD GPU 加速](https://www.binwh.com/2026/04/12/vulkan-ollama-amd-gpu/)
