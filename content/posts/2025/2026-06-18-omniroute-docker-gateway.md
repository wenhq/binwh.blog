---
title: OmniRoute 部署：自建 AI 网关聚合免费模型，统一接入Agent
slug: omniroute-docker-gateway
date: 2026-06-18T15:28:43+08:00
author: wenhq
description: OmniRoute 是一个开源 AI 路由网关，支持 160+ 提供商（50+ 免费），一个端点统一接入 Claude Code、Cursor、Cline、Copilot 等工具。本文记录完整的 VPS Docker 部署方案，包括 Docker Compose 配置、Cloudflare Tunnel / SSH 隧道接入、Dashboard 配置 Combo 自动 fallback，以及免费 AI 模型推荐。
draft: false
tags:
  - AI
  - AI_网关
  - Docker
  - OmniRoute
share: true
---

> 一个月前智谱以"检测到账号存在多人使用行为"为由封了我的号，申诉无果。
>
> 我的智谱 Plan 是给家里、公司、多个 VPS 上的各种 Code 和 Agent 统一提供 Key，属于中轻度使用。封号后这一个月我到处找免费模型，找到了不少，但用 cc-switch 频繁换源也很麻烦。
>
> 后来发现 **OmniRoute**——一个统一的 AI 网关，所有流量从 VPS 一个 IP 发出，流量来源都只有一个，不会触发"多人共用"的风控判定，同时还聚合了 50+ 免费模型，提高了稳定性。这篇文章记录我的完整部署和使用方案，同时也是为了保护好解禁后的智谱 Plan，避免再次触发风控。

<!-- more -->

## 一、OmniRoute 是什么

[OmniRoute](https://github.com/diegosouzapw/OmniRoute) 是一个开源的 AI 路由网关，本地运行（也可以部署到 VPS），支持 **160+ 提供商（其中 50+ 免费）**。

它的核心思路很简单：**一个端点聚合所有提供商，所有 AI 编码工具统一指向它，流量都走同一个 IP**。

- **一个端点**：`localhost:20128`（Anthropic/Claude Code）或 `localhost:20128/v1`（OpenAI 兼容工具），按客户端协议选择
- **自动 fallback**：主提供商限速时自动切换到下一个，零感知
- **Token 压缩**：RTK + Caveman 双重压缩，节省 15~95% Token
- **Dashboard 管理**：图形界面添加提供商、创建 Combo、查看用量

你只需要配置一次，之后所有工具共用一个端点，OmniRoute 在后端自动帮你选最优的提供商。

---

## 二、VPS 部署方案

### 2.1 编写配置

在 VPS 上创建部署目录并进入：

```bash
mkdir -p /opt/omniroute && cd /opt/omniroute
```

创建 `docker-compose.yml`：

```yaml
services:

  omniroute:
    image: diegosouzapw/omniroute:latest
    container_name: omniroute
    restart: unless-stopped
    stop_grace_period: 40s          # 给 SQLite 足够时间写盘
    ports:
      - "20128:20128"                # 对外暴露端口
    volumes:
      - ./data:/app/data            # 持久化数据
    env_file:
      - .env
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      redis:
        condition: service_healthy

  redis:
    image: docker.io/valkey/valkey:8.0.1-alpine
    container_name: omniroute-redis
    restart: unless-stopped
    command: "valkey-server --save 30 1"
    volumes:
      - ./redis:/data
    healthcheck:
      test: ["CMD", "valkey-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

networks:
  default:
    external: true
    name: shared
```

> **关于 Docker 网络**：上面的 `docker-compose.yml` 使用了 `shared` 外部网络，提前执行 `docker network create shared` 即可。如果你不想额外创建网络，去掉 `networks` 相关配置，两个容器会默认走同一个 `omniroute_default` 网络，功能不受影响——只是之后其他项目也会产生各自的 `xxx_default` 网络。

创建 `.env` 文件：

```bash
# WebSocket 密钥（必填，生成命令见下方）
OMNIROUTE_WS_BRIDGE_SECRET=你的随机字符串

# 管理员初始密码（首次登录用）
OMNIROUTE_SETUP_PASSWORD=你的管理员密码

# Node.js 内存上限（512MB 对网关够用）
OMNIROUTE_MEMORY_MB=512
```

生成随机密钥：

```bash
openssl rand -hex 32
# 输出形如：a3b8c9... 复制到 .env 的 OMNIROUTE_WS_BRIDGE_SECRET 后
```

初始化数据目录权限：

```bash
mkdir -p ./data ./redis
chmod 777 ./redis
chmod 600 .env
```

`.env` 包含密钥和初始密码，设置 `600` 权限避免其他用户读取。

### 2.2 启动服务

```bash
sudo docker compose up -d

# 查看日志确认启动成功
sudo docker compose logs -f
```

看到以下输出即表示成功：

```
▲ Next.js 16.2.7
- Local:         http://localhost:20128
- Network:       http://0.0.0.0:20128
✓ Ready in 0ms
[DB] SQLite database ready: /app/data/storage.sqlite
```

## 三、接入方式

有三种方式让本地工具访问 VPS 上的 OmniRoute，按需选一个即可。

> **注意**：无论哪种方案，首次访问 Dashboard 后都应立即设置管理员密码（`OMNIROUTE_SETUP_PASSWORD`），否则 Dashboard 无认证保护。

**方案 A：Cloudflare Tunnel（有域名）**

Cloudflare 面板 Zero Trust → Tunnels 创建隧道，添加一条路由规则 `/*` → `http://localhost:20128`，无需在 VPS 开放额外端口，自动 HTTPS。也可以用 Docker 方式运行 cloudflared：

```bash
docker run -d --name cloudflared --restart unless-stopped \
  -v /opt/cloudflared:/home/nonroot/.cloudflared \
  cloudflare/cloudflared:latest \
  tunnel --no-autoupdate run --token YOUR_TOKEN_HERE
```

**方案 B：SSH 本地端口转发（无域名）**

SSH 隧道将 VPS 的 20128 端口映射到本地，建议本地用一个非默认端口避免冲突：

```bash
ssh -p 22 -f -N -L 12012:localhost:20128 user@vps-ip
```

本地工具配置 `http://localhost:12012` 即可。

**方案 C：直连 VPS**

VPS 防火墙放行 20128 端口后，直接访问 `http://VPS-IP:20128`。

---

## 四、Dashboard 配置

无论使用哪种方案，打开浏览器访问 OmniRoute：

| 方案                | 访问地址                     |
| ----------------- | ------------------------ |
| Cloudflare Tunnel | `https://你的域名`           |
| SSH 隧道            | `http://localhost:12012` |
| 直连 VPS            | `http://VPS-IP:20128`    |

### 4.1 连接免费提供商

Dashboard → **Providers** → **+ Add Provider**。

OmniRoute 内置了大量免费提供商（无需注册、无需 Key 即可接入），具体列表和额度会随版本更新而变化，建议在 Dashboard 中直接浏览 **Providers** 页面查看当前可用的免费选项。

> **注意**：免费提供商的额度和可用性变化较快，添加前建议在 Dashboard 中确认当前状态。部分提供商可能随时调整免费额度或改为付费。

### 4.2 创建 Combo（组合）

Dashboard → **Combos** → **+ New Combo**，设置 fallback 链：

将多个提供商组合为一个 Combo，设置策略为**优先级（Priority）**。按偏好排列节点顺序——主力提供商放前面，备用提供商放后面。

创建后，你的 API 请求就会按这个顺序自动路由——主提供商忙了就自动切下一个，完全透明。

### 4.3 生成 API Key

Dashboard → **Endpoints** → **Create API Key**：

```
复制生成的 Key（形如 sk-xxxxxxxx）
→ 之后所有 AI 工具的配置都会用到这个 Key
```

---

## 五、使用方案总结

最终我采用的是**免费 Plan + 收费 Plan + 免费提供商兜底**的组合策略：

- **免费 Plan**：通过 OmniRoute 接入各类免费模型，覆盖轻量场景
- **收费 Plan**：付费订阅保障稳定性和能力上限，主力 Agent 和编码任务不中断
- **兜底**：OmniRoute 聚合的免费提供商，当主力不可用时自动 fallback，保证 Agent 不会中断

这种分层策略的好处是：既能享受付费模型的稳定性和能力上限，又不会因为额度用完或服务中断而停工。

### 推荐：Step Plan（免费）

Step Plan 是阶跃星辰推出的面向 Agent 与 Coding 场景的一体化能力订阅方案，提供标准化 API、多模型智能路由和开箱可用的多模态能力，帮助开发者快速构建、运行和优化智能工作流。

它兼容主流 Agent 框架与编码工具，无需复杂配置即可接入；通过智能路由机制，将高频轻量任务交由 Flash 模型高效处理，将复杂推理与关键决策任务交由 Pro 模型精准完成，尤其适合长链路 Agent、代码开发、多步操作和研究流水线等场景。

同时，Step Plan 集成 TTS、ASR、图像处理等多模态能力，支持文本、语音、视觉等输入输出场景，帮助开发者快速搭建一体化应用。基于按需调用和按任务量计费模式，系统可在性能与成本之间动态平衡，满足从个人开发者到团队级应用的不同需求。

👉 推荐注册地址：[https://platform.stepfun.com?invite_code=NEWMHCBR](https://platform.stepfun.com?invite_code=NEWMHCBR)

### 推荐：智谱 Coding Plan（收费）

国内顶流编程大模型，20+ 主流工具全适配，性价比拉满。适合对稳定性和编码能力有更高要求的用户。

🙋 蹲队友拼智谱 Coding Plan！👉 立即参与「拼好模」：[https://www.bigmodel.cn/glm-coding?ic=XIUSJ4VJHF](https://www.bigmodel.cn/glm-coding?ic=XIUSJ4VJHF)

