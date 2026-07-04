---
title: OmniRoute Combo：免费模型够干活，付费额度用在刀刃上
slug: omniroute-combo-free-model-strategy
date: 2026-07-04T14:00:00+08:00
author: wenhq
description: 付费模型有额度限制，用来做旅行规划太浪费。OmniRoute（237 家提供商，90+ 免费）的 Combo 组合策略实战：用免费模型（GLM-4.7、Step 3.7 Flash）扛日常，付费额度用在刀刃上。覆盖 OpenWebUI 免费对话、17 种路由策略、4 层 Fallback 和智谱 Coding Plan 优化。
draft: false
share: true
tags:
  - AI
  - AI_网关
  - OmniRoute
  - 免费AI
  - LLM
  - AI工具
---

>付费模型有 5 小时用量限制。写代码够用，但用来做旅行规划、闲聊、查资料——几个小时就没了。
>
>这些小事不需要最强模型，却吃掉最贵的额度。
>
>这篇讲 OmniRoute 的 Combo——怎么用免费模型拼出一条永不中断的 AI 之路，让付费额度用在刀刃上。

<!-- more -->

## 一、为什么写这篇

前文写了 Docker Compose、Cloudflare Tunnel、Dashboard 配置，那都是"怎么跑起来"。

跑起来之后呢？我遇到的实际问题：

**付费模型的用量限制太容易烧在小事上。**

我用的智谱 Coding Plan，用量有限。写代码够用，但用来做旅行规划、查资料、跟 OpenWebUI 闲聊——很快就没了。这些任务的模型强度要求不高，但吃掉的是付费额度。

更具体的问题：

- **OpenWebUI 断了**：家里的 OpenWebUI 连着 OmniRoute，某个免费提供商额度用完，对话直接断了
- **Agent coding 中断**：Claude Code 跑到一半，当前模型限速，整个 session 崩掉
- **付费额度浪费**：旅行规划、闲聊、简单问答，用的都是付费 Plan 的额度，太贵

这些问题的共同答案就是 **Combo**——把多个免费提供商串成一条链，OmniRoute 自动路由，完全无感知。付费额度用在刀刃上，小活交给免费模型。

## 二、Combo 是什么

Combo 是一系列来自不同提供商的模型链，搭配路由策略。用 Combo 名称作为"模型"字段发请求，OmniRoute 按策略遍历这条链。

举个例子：

```
Combo: "free-forever"     Strategy: priority
  Nodes:
    1. cerebras/glm-4.7 → Cerebras（主力，速度快）
    2. nvidia/step-3.7-flash → NVIDIA（中间层）
    3. openrouter/free            → OpenRouter 免费模型池（中间层）
    4. deepseek/deepseek-v4-flash     → DeepSeek Web（兜底）

请求到达 → 尝试 Node 1 → 限流则瞬间切 Node 2 → 依此类推
工具侧看到的只是一个成功响应，不知道背后试了 3 个提供商
```

一条链覆盖多个提供商，自动切换，工具侧零感知。

## 三、17 种路由策略

OmniRoute 支持 17 种路由策略：

| 策略 | 做什么 | 最佳场景 |
|------|--------|---------|
| **Priority** | 按顺序使用节点，仅在失败时 fallback | 最大化主提供商使用率 |
| **Fill First** | 耗尽一个账号再切下一个 | 确保用完免费额度 |
| **Weighted** | 给每个节点分配百分比权重 | 精细流量控制 |
| **Round Robin** | 循环切换节点 | 均匀分发 |
| **P2C** | 随机挑 2 个节点，选更健康的 | 带健康感知的负载均衡 |
| **Least Used** | 路由到当前负载最低的 | 长期均衡分配 |
| **Random** | 均匀随机 | 防指纹 |
| **Strict Random** | 无去重的真随机 | 无状态负载分发 |
| **Cost Optimized** | 选最便宜的 | 最小化花费 |
| **Headroom** | 选剩余额度最多的 | 额度敏感场景 |
| **Reset Window** | 选额度窗口即将重置的 | 等不及就切下一个 |
| **Reset Aware** | 按额度重置时间排序 | 短窗口优先 |
| **Context Optimized** | 选上下文窗口最大的 | 长上下文工作流 |
| **Context Relay** | 切换时传递会话摘要 | 跨提供商保持上下文 |
| **LKGP** | 粘上次成功的提供商 | 会话一致性 |
| **Auto** | 9 因子评分自动路由 | 免配置智能路由 |
| **Fusion** | 多模型投票 + judge 合成 | 高质量答案 |

### Auto-Combo：9 因子智能评分

不想手动调策略？用 Auto 模式。OmniRoute 对每个提供商做 9 因子实时评分，自动选最优：

| 因子 | 说明 |
|------|------|
| **Health** | 熔断器状态 |
| **Quota** | 剩余容量 |
| **Cost** | 每请求成本 |
| **Latency** | 真实 p95 延迟 |
| **Success Rate** | 请求成功率 |
| **Freshness** | 模型新鲜度 |
| **Stability** | 延迟/错误率低方差 |
| **Task Fit** | 模型 × 任务类型匹配度 |
| **Headroom** | 剩余额度空间 |

4 种预设模式包：**Ship Fast**、**Cost Saver**、**Quality First**、**Offline Friendly**

自愈机制：评分低于阈值（渐进退避最长 30 分钟）。

`auto` 还有 6 个子模式：`auto/coding`（编码优先）、`auto/fast`（延迟优先）、`auto/cheap`（便宜优先）、`auto/offline`（离线友好，最大额度空间）、`auto/smart`（质量优先 + 10% 探索新模型）。

### Context Relay：跨账号切换的会话连续性

Combo 在会话中途切换账号时，OmniRoute 会在切换前**后台生成结构化摘要**，注入到下一个账号的系统消息中。继续对话时完全衔接之前的内容。

不用担心"换了个模型就不记得前面聊了什么"——OmniRoute 自动传话。

### 四层智能 Fallback

```
TIER 1: SUBSCRIPTION（付费订阅）
  Claude Pro, Codex Plus, GitHub Copilot → 优先用付费额度
  ↓ 额度耗尽

TIER 2: API KEY（低价按量付费）
  DeepSeek ($0.27/1M), xAI Grok-4 ($0.20/1M)
  ↓ 预算上限

TIER 3: CHEAP（超低价备用）
  GLM-5 ($0.50/1M), MiniMax M2.5 ($0.30/1M)
  ↓ 预算上限

TIER 4: FREE（完全免费，永不停止）
  Kiro, Qoder, Pollinations, LongCat, SiliconFlow,
  Z.AI GLM-Flash, OpenRouter, Cloudflare, Scaleway,
  Groq, NVIDIA, Cerebras → 11 个永久免费
```

关键设计：每一层不是"备用"，而是"续杯"。付费额度用完了自动切免费，免费额度用完了自动切更便宜的，永远不会因为某个提供商挂掉而中断。

## 七、实际场景

### OpenWebUI 对话断了

家里跑 OpenWebUI，连着 OmniRoute 单个免费提供商。某天那个提供商额度用完，对话直接断了。

**解法**：建了一个 Combo "free-forever"，Cerebras（glm-4.7）作为主力，NVIDIA（step-3.7-flash）和 OpenRouter 免费模型池作为中间层，DeepSeek Web（deepseek-v4-flash）兜底。

一个周末的实测：问了大概 200 条消息，大部分时候不用手动切源。高峰期偶尔会断连，目前还在定位原因、优化延迟，后续会继续调整。

### 旅行规划烧额度

孩子放暑假，准备全家去山东玩，需要制定一周多的行程计划。

**问题**：这类任务用 Coding Plan 做太浪费了。额度有限，花半小时规划个路线就占掉不少。但规划不需要最强模型——需要足够长的上下文窗口（塞下整个行程）和足够好的推理能力（路线衔接、时间分配、景点筛选）。

**解法**：用 Combo 里的 glm-4.7——速度快，128K 上下文，刚好够用。

模型输出了一份 8 天行程方案：先沿海（青岛、烟台、威海），再去泰山和曲阜，最后台儿庄战役纪念馆后返程。每天的路程、住宿建议、景点门票信息都列出来了。

另外，OmniRoute 可以配置免费的搜索 API，把搜索额度也省下来。不过在 OpenWebUI 里配置搜索还有点问题，后续再优化。

当然，方案需要自己验证——AI 给的酒店价格和实际可能有出入，路况信息也要查最新。但作为初始框架，比搜零散攻略效率高太多。

## 八、使用问题

Combo 策略再好用，也有实际问题。

我的 OmniRoute 和 newapi 都部署在同一台美国 VPS 上。用 cc-switch 连接测速：

| 工具                    | 延迟     |
| --------------------- | ------ |
| cc-switch → OmniRoute | 1000ms |
| cc-switch → newapi    | 300ms  |

同一个 VPS，同一个网络路径，cc-switch 测 OmniRoute 是 newapi 的三倍多。

都是 IP + 端口直连，没有域名和 HTTPS，所以 DNS 和 TLS 都不是问题。

目前没定位到原因。猜测几个方向：

1. **OmniRoute 网关本身多了一层转发**：newapi 是直接透传，OmniRoute 作为网关多了一层处理，可能产生额外开销
2. **连接池或并发处理差异**：两个服务的内部连接管理策略不同，cc-switch 测速时表现不一样

有类似经历的欢迎交流。等定位清楚了再写一篇。

## 九、实战 Playbook

### $0/月 — 永远免费编码

| 优先级 | 提供商        | 模型                 | 备注     |
| --- | ---------- | ------------------ | ------ |
| 1   | Cerebras   | glm-4.7   | 速度快，主力 |
| 2   | NVIDIA     | step-3.7-flash | 中间层，免费 |
| 3   | OpenRouter | free               | 免费模型池  |
| 4   | DeepSeek   | deepseek-v4-flash      | Web 兜底 |

### 最大化付费订阅

| 优先级 | 提供商            | 模型             | 备注                                          |
| --- | -------------- | -------------- | ------------------------------------------- |
| 1   | 智谱 Coding Plan | glm-5.2        | 最强编码，用满付费额度                                 |
| 2   | 阶跃星辰 Step Plan      | step-router-v1 | 路由到 deepseek v4 pro，Coding Plan 用完切 Step 兜底 |

## 十、总结

Combo 是 OmniRoute 的杀手锏。部署文章讲怎么跑起来，这篇讲怎么让它真正好用。

**核心思路：免费模型够干活，付费额度用在核心工作上。**

- 用 Combo 把多个提供商串成链，自动 fallback，工具零感知
- Priority 策略最简单实用：按偏好排优先级，挂了自动切下一个
- 免费层足够覆盖日常 coding、对话、旅行规划等轻量需求
- Context Relay 解决跨账号切换的会话连续性
- 四层 Fallback 设计让额度管理自动化——付费用完了自动切免费，永远不中断
- 延迟问题还在排查中——美国 VPS + 国内访问，优化空间还很大
