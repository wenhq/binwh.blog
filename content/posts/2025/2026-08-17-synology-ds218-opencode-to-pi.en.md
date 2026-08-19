---
title: Swapping OpenCode for pi on My NAS
slug: ds218plus-opencode-to-pi
date: 2026-08-17T10:00:00+08:00
author: binwh
description: OpenCode was eating 500+ MB on my old DS218+. Switched to pi, a minimal coding agent that starts at 120 MB and exits when done. Perfect for photo processing tasks.
draft: false
share: true
tags:
  - NAS
  - Synology
  - AI-Agent
  - Pi
  - System Admin
---

OpenCode on the DS218+ was eating 500+ MB of resident memory — the old machine couldn't handle it. Switched to pi, a minimal terminal coding agent that starts at around 120 MB and exits when the job is done.

## Installation

```bash
# One-liner (auto-installs Node + pi)
curl -fsSL https://pi.dev/install.sh | sh
```

pi relies on `rg` (ripgrep) and `fd` for file search. Install them manually on DSM:

```bash
# ripgrep
curl -LO 'https://github.com/BurntSushi/ripgrep/releases/download/14.1.1/ripgrep-14.1.1-x86_64-unknown-linux-musl.tar.gz'
tar xf ripgrep-14.1.1-x86_64-unknown-linux-musl.tar.gz

# fd
curl -LO 'https://github.com/sharkdp/fd/releases/download/v10.2.0/fd-v10.2.0-x86_64-unknown-linux-musl.tar.gz'
tar xf fd-v10.2.0-x86_64-unknown-linux-musl.tar.gz

# Add to PATH (~/.profile)
export PATH="$HOME/package/bin:$PATH"
```

## Configure a Model

Edit `models.json` to connect your own model API — I'm using Stepfun. **Step 3.7 Flash** is notably fast and works well on a NAS.

```json
{
  "providers": {
    "stepfun": {
      "baseUrl": "https://api.stepfun.com/step_plan/v1",
      "api": "openai-completions",
      "apiKey": "your API key",
      "models": [
        { "id": "step-router-v1" },
        { "id": "step-3.7-flash", "input": ["text", "image"] }
      ]
    }
  }
}
```

Adding `"input": ["text", "image"]` to `step-3.7-flash` enables image recognition — you can paste screenshots directly into pi when working with photos.

## Daily Usage

```bash
# One-shot execution: runs the task and exits, no resident memory
cd /volume1/photos && pi -p "organize this month's photos into dated subdirectories"
```

Reduce startup overhead with environment variables:

```bash
export PI_SKIP_VERSION_CHECK=1
export PI_OFFLINE=1
```

## Why pi

A NAS doesn't need a resident AI service. pi starts on demand and exits when done, cutting memory from 500+ MB down to 120 MB — just right for scheduled photo processing tasks.
