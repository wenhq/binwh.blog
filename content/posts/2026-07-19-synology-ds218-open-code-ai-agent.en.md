---
title: "Running AI Agent on Synology DS218+: No Docker, Just OpenCode"
slug: ds218plus-ai-agent-opencode-no-docker
date: 2026-07-19T13:00:00+08:00
author: binwh
description: "Complete guide to running an AI Agent on Synology DS218+ (DSM 7.1.1). Docker approach doesn't work — containers can't access the DSM system. Skip the container: install OpenCode directly, fix the /tmp noexec issue, and run opencode natively."
draft: false
share: true
tags:
  - NAS
  - Synology
  - Synology NAS
  - DSM
  - AI-Agent
  - AI Assistant
  - OpenCode
  - Docker
  - System Admin
  - Linux
  - Troubleshooting
  - Tech Guide
---

> Complete guide to running an AI Agent on Synology DS218+. Docker approach doesn't work — containers can't access the DSM system. Skip the container: install OpenCode directly, fix the /tmp noexec issue, and run opencode natively. Old NAS can run AI assistants too.

<!-- more -->

## Three Approaches 🎯

Installing an AI Agent on the DS218+ (DSM 7.1.1, Intel Celeron J3355) went through three iterations.

### Approach 1: Direct Install, Missing Dependencies ❌

First attempt: install directly. OpenClaw, Hermes, QwenPaw — tried them all.

The problem: the old Synology system is missing necessary Python libraries and other dependencies. The installation never completes.

> 💡 With old hardware and new tools, always check dependency versions first.

### Approach 2: Docker Install, Works But Useless 🐳

Direct install failed, so switched to Docker. Images pulled, containers running.

But here's the reality: the Agent runs inside the container, **unable to directly access the DSM system**. File management, terminal commands, system config — all out of reach.

Might as well not have installed it.

> ⚠️ Docker's isolation is a strength in development, but a dealbreaker when you need to operate the host system.

### Approach 3: OpenCode + Fix `/tmp` ✅

Had OpenCode running smoothly on a Windows machine — install was seamless, worked great. So why not try it on the DS218+ directly? No Docker, no container.

```bash
curl -fsSL https://opencode.ai/install | bash
```

> ⚠️ The install script pulls from GitHub — you'll need to solve proxy/mirror issues on mainland China.

After installation, run `source $HOME/.profile` to load the PATH, then `opencode` —

```
Failed to initialize OpenTUI render library:
Failed to open library "/tmp/.79ef6fcffdbfeee5-00000001.so":
/tmp/.79ef6fcffdbfeee5-00000001.so: failed to map segment from shared object
```

After getting past the TUI crash, opening any code file triggers a second issue:

```
Code highlighting failed, falling back to plain text:
warn: TreeSitter client destroyed
...
```

#### Issue 1: TUI Render Library Init Crash (Fatal)

| Item | Details |
|------|--------|
| **Error** | `Failed to initialize OpenTUI render library: Failed to open library "/tmp/.xxx.so": failed to map segment from shared object` |
| **When** | Early startup, when OpenCode tries to display the terminal UI (TUI) |
| **Impact** | Program crashes and exits immediately |
| **Cause** | OpenTUI extracts `libopentui.so` to `/tmp` and tries to load it, but `noexec` blocks execution |

#### Issue 2: TreeSitter Syntax Highlighting Failure (Non-Fatal Degradation)

| Item | Details |
|------|--------|
| **Error** | `Code highlighting failed, falling back to plain text: warn: TreeSitter client destroyed ...` |
| **When** | During use, whenever syntax-highlighted content (code, structured prompts, etc.) is displayed |
| **Impact** | Syntax highlighting falls back to plain text for code and structured content |
| **Cause** | TreeSitter needs to load parser libraries (`.so`) to a temp directory; `noexec` blocks the load |

## Root Cause: `/tmp` is Mounted `noexec` 🔍

Synology mounts `/tmp` as `noexec` for security — no program can execute from that directory.

OpenCode, built on the Bun runtime, extracts `.so` shared library files to `/tmp` and tries to load them at startup. `noexec` blocks this entirely.

## Solution: Redirect the Temp Directory 🛠️

The idea is simple — tell OpenCode to use a directory with execute permissions for temporary files.

### 1. Create a Custom Temp Directory

```bash
mkdir -p ~/opencode-temp
chmod 700 ~/opencode-temp
```

### 2. Set Environment Variables

Two variables are needed:

| Variable | Purpose |
|----------|---------|
| `TMPDIR` | Read by system libraries and runtimes |
| `BUN_TMPDIR` | Bun runtime specific variable |

`export TMPDIR=~/opencode-temp` bypasses the `noexec` restriction on Synology's `/tmp` directory. This is a systematic fix that resolves both issues at once:

- ✅ TUI fails to launch (first error)
- ✅ Syntax highlighting engine crashes (second error, TreeSitter warning

Both errors share the same root cause: the Bun runtime needs to load `.so` dynamic libraries in `/tmp`, and `noexec` blocks all of them. Redirecting the temp directory fixes everything.

**Why both variables?**
- `TMPDIR`: recognized by most Linux libraries (including TreeSitter's dependencies)
- `BUN_TMPDIR`: read specifically by OpenCode's Bun runtime, ensuring TUI components use the new path

Temporary (current session only):

```bash
export TMPDIR=~/opencode-temp
export BUN_TMPDIR=~/opencode-temp
opencode
```

Permanent (write to `$HOME/.profile`):

```bash
echo 'export TMPDIR=$HOME/opencode-temp' >> $HOME/.profile
echo 'export BUN_TMPDIR=$HOME/opencode-temp' >> $HOME/.profile
source $HOME/.profile
```

The environment variables take effect on next login, and `opencode` works directly.

### Fallback Options

| Check | Solution |
|-------|----------|
| **glibc too old** | Run `ldd --version`. If below 2.28, upgrade OpenCode or fall back to Docker |
| **Cache corruption** | Run `rm -rf ~/.cache/opencode` to clear old cache, then restart |
| **Last resort** | Skip TUI mode entirely: run `opencode web` and use it in the browser |

## What You Can Do After

Once OpenCode is running, you effectively have an AI assistant on your Synology that can directly operate the DSM system.

Practical use cases:

- **Clean system logs**: Let OpenCode sort, filter, and delete years of accumulated system logs
- **Remove leftover packages**: Find and clean up dependencies and caches left behind after uninstalling software
- **Manage Docker containers**: Check status, clean up zombie containers, organize images — all without SSH
- **Batch file operations**: Rename, archive, organize download folders — hand it off to the Agent
- **Organize photos**: Sort your photo library by date or event, clean up duplicates

At its core, OpenCode solves one problem: an Agent that can directly touch the DSM system — no container in between, no wall in between.
