---
title: Hermes Agent — A Self-Improving AI Assistant
slug: hermes-agent
date: 2026-05-05T10:00:00+08:00
author: wenhq
description: Hermes Agent is an open-source, self-improving AI agent by Nous Research. It creates skills from experience, improves them over time, recalls past conversations, and builds a user model across sessions. Install in two minutes, connect via WeChat/Telegram/Discord and 15+ platforms, run on a $20/year VPS.
draft: false
share: true
---

> After deploying OpenClaw via Docker and getting Alibaba Cloud's Coding Plan working, I discovered that Nous Research had launched Hermes Agent on top of OpenClaw — **an agent that genuinely improves as you use it**. Not marketing fluff: it has a real closed-loop learning mechanism. After roughly every 15 tool invocations, it pauses to reflect, writes lessons into skill files, and reuses them next time. The longer you use it, the better it understands you.

<!-- more -->

## Install in Two Minutes

Supports Linux / macOS / WSL2 / Android (Termux). Native Windows requires WSL2.

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

For networks in China, use the mirror:

```bash
curl -fsSL https://res1.hermesagent.org.cn/install.sh | bash
```

After installation:

```bash
source ~/.bashrc    # or: source ~/.zshrc
hermes              # start chatting
hermes model        # choose your LLM provider
hermes tools        # configure enabled tools
```

To use ModelScope's free models, select **Custom endpoint** in `hermes model` and fill in:

- **Provider**: `custom`
- **Base URL**: `https://api-inference.modelscope.cn/v1`
- **Model**: `inclusionAI/Ling-2.6-1T`

During setup you'll be prompted to configure WeChat — just scan the QR code with your phone and you're connected. Start chatting with Hermes directly in WeChat.

If you're coming from OpenClaw, migrate in one command:

```bash
hermes claw migrate    # imports SOUL.md, memories, skills, API keys — everything
```

## Daily Usage

Hermes has two entry points: the terminal UI (`hermes`) and the gateway mode (`hermes gateway`).

### Terminal Mode

A full-featured TUI with multiline editing, slash-command autocomplete, session history, and streaming tool output:

```bash
hermes                  # launch
/model custom:inclusionAI/Ling-2.6-1T    # switch model
/personality assistant  # set personality
/new                    # start a new conversation
/compress               # compress context
/usage                  # check token usage
```

### Messaging Platform Mode

Configure the gateway once, then chat from any platform:

```bash
hermes gateway setup    # interactive platform configuration
hermes gateway start    # start the gateway
```

Just send a message on WeChat — it works like chatting with a real person. All sessions are automatically saved. Use `hermes -c` to resume your last conversation next time you start. Or restore a specific session:

```bash
hermes sessions list
hermes --resume 20260505_180059_1977df46
```

### Scheduled Tasks

Describe tasks in natural language and Hermes creates cron jobs automatically:

- "Send me an email digest every morning at 8"
- "Check server disk space every Monday"
- "Backup the specified directory every night at 11"

Results are delivered to your configured platform — no need to keep a terminal open.

## Updates & Maintenance

```bash
hermes update           # one-command update: pull code → install deps → migrate config → auto-restart gateway
hermes update --check   # check if a new version is available
hermes doctor           # diagnose issues
hermes version          # show current version
```

You can also send `/update` directly from any messaging platform. The bot goes offline briefly (5–15 seconds) and comes back automatically.

## Summary

Hermes Agent is for two kinds of people:

1. **Those who need an "always-on" AI assistant**: interact via WeChat even when away from the computer, with scheduled tasks running automatically
2. **Those who value "growth" in an agent**: closed-loop learning means it gets better the more you use it, unlike traditional agents that start from scratch every time

Running costs are minimal — a $20/year VPS with 4GB RAM and 20GB storage is enough. For the LLM, you can use ModelScope or OpenRouter's free tiers at no extra cost. ModelScope's free models are a bit better, with 500 free API calls per day; OpenRouter's free models offer 50 calls per day. I'm currently running a scheduled task on a Hong Kong VPS — it automatically fetches my followed accounts' updates on X, categorizes them into AI, tech, economy, etc., generates a briefing, and sends it to me on WeChat. Just provide your x.com cookie and Hermes handles the rest.

If you haven't signed up for ModelScope yet, here's my referral link: [Register on ModelScope](https://www.modelscope.cn/register?inviteCode=ScepoMedol&invitorName=ScepoMedol)

> Project: [github.com/NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)
> Docs: [hermes-agent.nousresearch.com](https://hermes-agent.nousresearch.com/docs)
