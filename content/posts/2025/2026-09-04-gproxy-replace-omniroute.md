---
title: gproxy 替换 OmniRoute：给个人 AI 代理做减法
slug: gproxy-replace-omniroute
date: 2026-09-04T10:30:00+08:00
author: wenhq
description: OmniRoute 什么功能都有，但个人场景用得上就一条：别慢。cc-switch 测速 OmniRoute 1000ms，newapi 300ms，三倍差距。换成 Rust 写的 gproxy 做同协议透传，单容器，附 Docker 配置。
draft: false
share: true
tags:
  - AI
  - AI_网关
  - gproxy
  - OmniRoute
  - 自托管
---

> AI 网关三部曲的第三篇。六月部署 OmniRoute，七月玩 Combo，九月换成 [gproxy](https://github.com/LeenHawk/gproxy)。
>
> 换的理由就一个：慢。其他功能，个人场景基本用不上。

<!-- more -->

## 一、为什么换：那 1000ms

上篇留了个尾巴：同一台美国 VPS、同一条网络路径，cc-switch 测速 OmniRoute 1000ms，newapi 300ms，三倍多。后来看明白了，慢不是 bug，是设计。每个请求都要解析、协议翻译、在 17 种策略里挑路由，最后才发出去，每个环节都花时间。而这些环节干的事，个人多半用不上：渠道聚合常用就智谱 Coding Plan、DeepSeek 加一两个免费源，Fallback 一个月触发不了几次，Token 压缩怕改坏 prompt 不敢开。

真正要的就一句话：所有工具的流量从 VPS 一个 IP 出去，改个 Base URL 全接上，快，且不用管。这是反向代理的活，不是 AI 网关的。

## 二、gproxy 是什么

> **避坑：GitHub 上叫 gproxy 的不止一个。** 排名靠前的 [graphikDB/gproxy](https://github.com/graphikDB/gproxy) 是 Go 写的通用反代，跟 AI 无关。本文说的是 [LeenHawk/gproxy](https://github.com/LeenHawk/gproxy)，Rust 写的 LLM 代理网关，[文档](https://gproxy.leenhawk.com/)有中文版。

对症的是同协议透传：客户端和上游说同一种协议时，几乎不解析，字节直接转发。智谱的 Anthropic 兼容端点加 Claude Code 天然同协议，中间没有翻译层。那 1000ms，从设计上就没了。

其他方面也省事。单二进制，SQLite 内嵌，不用 Redis，一个容器就是全部；管理台编译在二进制里，访问 `/console` 就有，API Key、限速、配额都有，家里每人发个 key，用量清清楚楚。

## 三、部署

docker-compose：

```yaml
services:
  gproxy:
    image: ghcr.io/leenhawk/gproxy:latest
    container_name: gproxy
    restart: unless-stopped
    ports:
      - "8787:8787"
    volumes:
      - ./data:/app/data
```

`./data` 持久化 SQLite，升级换容器数据不丢。

```bash
docker compose up -d
```

初始管理员密码在日志里，`docker logs gproxy` 能看到，登进去新建一个管理员、删掉初始那个就行。

## 四、console 里配三步

进 `/console`，三步配完：

1. 「供应商」页面接入大模型 key，智谱 Coding Plan、DeepSeek、阶跃 Step 都在这里录
2. 「负载均衡」页面把不同能力的模型组织成组，类似 OpenRouter 的组合路由，上篇 OmniRoute 的 Combo 就是这个玩法
3. 「用户」页面配置对外的 key，可以设模型权限，谁能用哪些模型，这一层控制

配完拿「用户」页发的 key 验证，能拉到模型列表就是通了：

```bash
curl -s http://127.0.0.1:8787/v1/models -H "Authorization: Bearer 用户页发的key"
```

客户端接入和原来一样：cc-switch 加个源指向 `http://VPS:8787`，OpenAI 兼容工具走 `/v1`。

## 五、总结

**核心思路：能透传就别翻译，能少一个容器就少一个。**

这次部署在腾讯云，cc-switch 测速 30 多毫秒，OmniRoute 在美国 VPS 上是 1000ms。具体快在哪，分析不出来，反正用着快了。

现在的分工：gproxy 走平时的工作，要快要稳；OmniRoute 留着接 OpenWebUI，薅免费羊毛做日常对话，正好各干各的。

最后，文里的主力渠道就是智谱 Coding Plan，手上有 5 张 7 天体验卡，送完为止。最新的 GLM-5.3 和 GLM-5.3-Flash 都能用，接法就是这篇写的：Anthropic 兼容端点配 gproxy 透传，有需要的[领一张试试](https://bigmodel.cn/activity/trial-card/UMZRAQVWRH)。
