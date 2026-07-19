---
title: 群晖 DS218plus 装 AI Agent：Docker 不好用，不装容器直接跑 OpenCode
slug: ds218plus-ai-agent-opencode-no-docker
date: 2026-07-19T14:00:00+08:00
author: binwh
description: 群晖 DS218plus 安装 AI Agent 教程。Docker 方案不好用，无法操作 DSM。不用在 Docker 里运行，改用 OpenCode 直接安装。解决 /tmp noexec 报错，环境变量重定向临时目录，opencode 直接执行。老旧 NAS 也能跑 AI 助手。
draft: false
share: true
tags:
  - NAS
  - 群晖
  - 群晖NAS
  - DSM
  - AI-Agent
  - AI助手
  - OpenCode
  - Docker
  - 系统运维
  - Linux
  - 踩坑记录
  - 技术分享
---

> 群晖 DS218plus 安装 AI Agent 教程。Docker 方案不好用，无法操作 DSM。不用在 Docker 里运行，改用 OpenCode 直接安装。解决 /tmp noexec 报错，环境变量重定向临时目录，opencode 直接执行。老旧 NAS 也能跑 AI 助手。

<!-- more -->

## 三种方案的迭代 🎯

在 DS218+（DSM 7.1.1，Intel Celeron J3355）上安装 AI Agent，经历了三种方案的迭代。

### 方案一：直接安装，缺依赖 ❌

最先想到的是直接装。OpenClaw、Hermes、QwenPaw，挨个试。

问题出在老旧群晖的系统环境——**缺少必要的 Python 库和其他依赖**，安装过程根本走不完。

> 💡 老设备装新工具，第一步永远是检查依赖版本。

### 方案二：Docker 安装，能用但没用 🐳

直接装不通，转 Docker 路线。镜像拉下来，容器跑起来了。

但问题很现实：Agent 运行在容器里，**无法直接操作 DSM 系统**。文件管理、终端命令、系统配置，全都碰不到。

装了等于没装。

> ⚠️ Docker 的隔离性在开发环境是优点，但在"我要操作宿主机"这个场景下就是硬伤。

### 方案三：OpenCode + 解决 `/tmp` 问题 ✅

之前 Windows 上装 OpenCode，发现安装顺利，也很好用。就想着 DS218+ 上是不是也能直接跑，不需要 Docker，不需要容器。

```bash
curl -fsSL https://opencode.ai/install | bash
```

> ⚠️ 安装脚本从 GitHub 拉取，国内网络需自行解决代理/镜像问题。

安装完成后，执行 `source $HOME/.profile` 加载 PATH，再运行 `opencode`，报错：

```
Failed to initialize OpenTUI render library:
Failed to open library "/tmp/.79ef6fcffdbfeee5-00000001.so":
/tmp/.79ef6fcffdbfeee5-00000001.so: failed to map segment from shared object
```

进入主界面后打开代码文件，还会遇到第二个问题：

```
Code highlighting failed, falling back to plain text:
warn: TreeSitter client destroyed
...
```

这两个错误看似独立，实则同根。

#### 问题一：TUI 渲染库初始化崩溃（致命）

| 项目 | 内容 |
|------|------|
| **错误现象** | `Failed to initialize OpenTUI render library: Failed to open library "/tmp/.xxx.so": failed to map segment from shared object` |
| **发生阶段** | 启动早期，OpenCode 准备显示终端图形界面（TUI）时 |
| **影响** | 程序直接崩溃退出 |
| **原因** | OpenTUI 将 `libopentui.so` 解压到 `/tmp`，尝试加载执行，但因 `noexec` 被系统拒绝 |

#### 问题二：TreeSitter 代码高亮引擎失效（非致命降级）

| 项目       | 内容                                                                                            |
| -------- | --------------------------------------------------------------------------------------------- |
| **错误现象** | `Code highlighting failed, falling back to plain text: warn: TreeSitter client destroyed ...` |
| **发生阶段** | 使用过程中，任何需要语法高亮的内容（代码、结构化提示等）都会触发                                                                               |
| **影响**   | 语法高亮失效（代码及结构化内容回退为纯文本显示）                                                                      |
| **原因**   | TreeSitter 语法高亮引擎需要加载解析器库（`.so`）到临时目录，因 `noexec` 限制加载失败                                       |


## 问题根源：`/tmp` 的 `noexec` 🔍

群晖出于安全考虑，将 `/tmp` 挂载为 `noexec`——**禁止在该目录下执行任何程序**。

OpenCode 基于 Bun 运行时，启动时会解压 `.so` 动态库文件到 `/tmp` 并尝试加载执行。`noexec` 直接把这条路堵死了。

## 解决方案：重定向临时目录 🛠️

思路很简单——让 OpenCode 把临时文件放到一个有执行权限的地方。

### 1. 创建自定义临时目录

```bash
mkdir -p ~/opencode-temp
chmod 700 ~/opencode-temp
```

### 2. 设置环境变量

需要设置两个变量：

| 变量           | 作用          |
| ------------ | ----------- |
| `TMPDIR`     | 被底层库和运行时读取  |
| `BUN_TMPDIR` | Bun 运行时专用变量 |

`export TMPDIR=~/opencode-temp` 是为了绕开群晖 `/tmp` 目录的 `noexec`（禁止执行）限制。这是一个系统性根治方案，它同时修复了：

- ✅ TUI 界面无法启动（第一个错误）
- ✅ 代码高亮引擎崩溃（第二个错误，TreeSitter 告警）

两个错误的根本原因相同：Bun 运行时需要在 `/tmp` 加载 `.so` 动态库，`noexec` 导致全部失败。重定向临时目录后一并解决。

> **为什么必须同时设置两个变量？**
> - `TMPDIR`：被绝大多数 Linux 底层库（包括 TreeSitter 的依赖）识别
> - `BUN_TMPDIR`：被 OpenCode 底层运行时（Bun）专门读取，确保 TUI 组件走新路径

**临时生效**（仅当前会话）：

```bash
export TMPDIR=~/opencode-temp
export BUN_TMPDIR=~/opencode-temp
opencode
```

**永久生效**（写入 `$HOME/.profile`）：

```bash
echo 'export TMPDIR=$HOME/opencode-temp' >> $HOME/.profile
echo 'export BUN_TMPDIR=$HOME/opencode-temp' >> $HOME/.profile
source $HOME/.profile
```

下次登录后环境变量自动生效，`opencode` 直接可用。

## 跑起来之后能做什么

OpenCode 跑通之后，相当于群晖上有了一个能直接操作 DSM 系统的 AI 助手。

日常能做的事：

- **清理系统日志**：陈年的系统 log 一条命令让 OpenCode 帮你整理、筛选、删除
- **清理残留软件包**：卸载后没删干净的依赖、缓存，让它帮你找出来清掉
- **管理 Docker 容器**：查看运行状态、清理僵尸容器、整理镜像
- **批量文件操作**：重命名、归档、整理下载目录，交给 Agent 执行
- **归档照片**：整理相册、按日期/事件归类、清理重复照片
