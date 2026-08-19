---
title: NAS 上从 OpenCode 换到 pi
slug: ds218plus-opencode-to-pi
date: 2026-08-17T10:00:00+08:00
author: binwh
description: 老 NAS 跑 OpenCode 太卡，换用轻量的 pi 做照片处理
draft: false
share: true
tags:
  - NAS
  - 群晖
  - AI-Agent
  - Pi
  - 系统运维
---

DS218+ 跑 OpenCode 常驻吃 500 多 MB 内存，老机器扛不住。换用极简终端智能体 pi，启动仅 120 MB，用多少开多少，用完即走。

## 安装

```bash
# 一键安装（自动装 Node + pi）
curl -fsSL https://pi.dev/install.sh | sh
```

pi 依赖 `rg` 和 `fd` 做文件搜索，DSM 上手动装一下：

```bash
# ripgrep
curl -LO 'https://github.com/BurntSushi/ripgrep/releases/download/14.1.1/ripgrep-14.1.1-x86_64-unknown-linux-musl.tar.gz'
tar xf ripgrep-14.1.1-x86_64-unknown-linux-musl.tar.gz

# fd
curl -LO 'https://github.com/sharkdp/fd/releases/download/v10.2.0/fd-v10.2.0-x86_64-unknown-linux-musl.tar.gz'
tar xf fd-v10.2.0-x86_64-unknown-linux-musl.tar.gz

# 加到 PATH（~/.profile）
export PATH="$HOME/package/bin:$PATH"
```

## 配置模型

编辑 `models.json` 接入自己的模型 API，比如 stepfun。用 **Step 3.7 Flash** 响应极快，NAS 上体验不错。文件位置在 pi 配置目录下。

```json
{
  "providers": {
    "stepfun": {
      "baseUrl": "https://api.stepfun.com/step_plan/v1",
      "api": "openai-completions",
      "apiKey": "你的 API Key",
      "models": [
        { "id": "step-router-v1" },
        { "id": "step-3.7-flash", "input": ["text", "image"] }
      ]
    }
  }
}
```

`step-3.7-flash` 加上 `"input": ["text", "image"]` 后支持图片识别，处理照片时可以直接截图发给 pi。

## 日常用法

```bash
# 一次性执行，用完退出，不占常驻内存
cd /volume1/photos && pi -p "整理本月照片，按日期归入子目录"
```

配合环境变量减少启动开销：

```bash
export PI_SKIP_VERSION_CHECK=1
export PI_OFFLINE=1
```

## 选型小结

NAS 上不需要常驻的 AI 服务。pi 按需启动、用完即走，内存从 500+ MB 降到 120 MB，正好用来处理照片这类定时任务。
