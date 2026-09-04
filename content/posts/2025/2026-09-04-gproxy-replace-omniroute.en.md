---
title: gproxy Replaces OmniRoute - Trimming Down My Personal AI Proxy
slug: gproxy-replace-omniroute
date: 2026-09-04T10:30:00+08:00
author: wenhq
description: OmniRoute has every feature, but for personal use only one matters - don't be slow. cc-switch measured OmniRoute at 1000ms vs newapi's 300ms on the same VPS. Switched to gproxy, a Rust gateway doing same-protocol passthrough in a single container. Docker config included.
draft: false
share: true
tags:
  - AI
  - AI_Gateway
  - gproxy
  - OmniRoute
  - SelfHosting
---

>Part three of the AI gateway series. June: deployed OmniRoute. July: played with Combo. September: switched to [gproxy](https://github.com/LeenHawk/gproxy).
>
>One reason for the switch: slow. Everything else, a personal setup barely uses.

<!-- more -->

## Why the Switch: That 1000ms

The last post left a loose end: same US VPS, same network path, cc-switch measured OmniRoute at 1000ms and newapi at 300ms. Three times slower.

Eventually it clicked. The slowness isn't a bug, it's the design. Every request goes through parsing, protocol translation, routing across 17 strategies, and only then goes out. Every step costs time. And what those steps do is mostly unused here: of all the channel aggregation, daily use comes down to the Zhipu Coding Plan, DeepSeek, and one or two free sources; Fallback fires a handful of times a month; token compression stays off because rewriting prompts risks breaking coding work.

What I actually need fits in one sentence: all tool traffic leaves from one VPS IP, everything hooks up with a Base URL change, it's fast, and it needs no babysitting. That's a reverse proxy's job, not an AI gateway's.

## What Is gproxy

>**Heads-up: there's more than one project called gproxy on GitHub.** The one ranking high in search, [graphikDB/gproxy](https://github.com/graphikDB/gproxy), is a generic Go reverse proxy with nothing to do with AI. This post is about [LeenHawk/gproxy](https://github.com/LeenHawk/gproxy), an LLM proxy gateway written in Rust. [Docs](https://gproxy.leenhawk.com/) available in Chinese.

What fits the bill is same-protocol passthrough: when client and upstream speak the same protocol, it barely parses anything and forwards the bytes as-is. Zhipu's Anthropic-compatible endpoint plus Claude Code are natively same-protocol, so there's no translation layer in between. That 1000ms is gone by design.

The rest is low-maintenance too. Single binary, SQLite embedded, no Redis — one container is the whole stack. The console is compiled into the binary and served at `/console`. API keys, rate limits, and quotas are all built in; one key per family member, usage at a glance.

## Deployment

docker-compose:

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

`./data` persists SQLite, so data survives container upgrades.

```bash
docker compose up -d
```

The initial admin password shows up in the logs — `docker logs gproxy`. Log in with it, create your own admin, delete the initial one.

## Three Steps in the Console

Open `/console`, three steps and you're done:

1. "Providers" page: plug in model API keys. Zhipu Coding Plan, DeepSeek, StepFun all go here
2. "Load Balancing" page: group models of different tiers, similar to OpenRouter's model routing — that's what last post's OmniRoute Combo was doing
3. "Users" page: create outbound keys with per-user model permissions. Who gets which models is controlled at this layer

Verify with a key from the Users page — if the model list comes back, it works:

```bash
curl -s http://127.0.0.1:8787/v1/models -H "Authorization: Bearer key-from-users-page"
```

Client hookup is the same as before: add a source in cc-switch pointing to `http://VPS:8787`; OpenAI-compatible tools use `/v1`.

## Wrap-up

**Core idea: if you can passthrough, don't translate. If you can run one fewer container, do.**

This deployment sits on Tencent Cloud, and cc-switch measures 30-odd ms. OmniRoute on the US VPS was 1000ms. Exactly why it's faster, I can't say — it just is.

Current division of labor: gproxy handles daily work, where speed and stability matter; OmniRoute stays wired to OpenWebUI, farming free tiers for everyday chat. Each does its own thing.

Lastly, the main channel in this post is the Zhipu Coding Plan. I have five 7-day trial cards, first come first served. GLM-5.3 and GLM-5.3-Flash both work, and the hookup is exactly what this post describes: Anthropic-compatible endpoint with gproxy passthrough — [grab one if you need it](https://bigmodel.cn/activity/trial-card/UMZRAQVWRH).
