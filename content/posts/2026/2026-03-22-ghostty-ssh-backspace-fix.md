---
title: Ghostty 终端 SSH 连接后 Backspace 失效的解决方案
slug: ghostty-ssh-backspace-fix
date: 2026-03-22T10:00:00+08:00
author: wenhq
description: 记录使用 Ghostty 通过 SSH 连接群晖 NAS 后 Backspace 键失效的问题排查与解决方案
draft: false
share: true
---

> 最近把 MAC 终端从 iTerm2 换成了 Ghostty，体验确实丝滑。但连接群晖 NAS 时遇到了 Backspace 失效的问题，踩坑一番后记录下解决方案。

## 问题背景

2025 年有个终端排行榜，Ghostty 排在了第一位。冲着 GPU 加速和更低的资源占用，我把用了多年的 [iTerm2](终端工具iterm2.md) 换成了 Ghostty。

本地使用一切正常，但通过 SSH 连接群晖 NAS 后，问题来了：

- 按 Backspace 键，屏幕显示 `^?` 而不是删除字符
- 按 ↑↓ 方向键，显示 `^[[A` `^[[B` 等乱码
- 偶尔删除后还会插入空格

通过查找资料发现这是**终端类型兼容问题**。

## 问题定位

SSH 登录 NAS 后，先看下当前终端类型：

```bash
echo $TERM
# 输出
xterm-ghostty
```

再看下退格键的设置：

```bash
stty -a | grep erase
# 输出
intr = ^C; quit = ^\; erase = ^?; kill = ^U; eof = ^D; ...
```

对比一下腾讯云或阿里云的服务器：

```bash
echo $TERM
# 输出
xterm-256color
```

问题找到了：**群晖 NAS 的 terminfo 数据库里没有 `xterm-ghostty` 这个终端类型的定义**。

Ghostty 自带了一套现代的 terminfo，但远端服务器没有安装，导致终端功能异常。腾讯云、阿里云等主流云服务器默认是 `xterm-256color`，所以没问题。

## 解决方案

### 方案一：临时修复

登录服务器后执行：

```bash
export TERM=xterm-256color
```

如果还有问题，再加一条：

```bash
stty erase '^?'
```

通常 Backspace 就恢复正常了。缺点是每次登录都要执行。

### 方案二：写入配置文件

在服务器的 `~/.bashrc` 中加入：

```bash
# Fix Ghostty TERM compatibility
if [ "$TERM" = "xterm-ghostty" ]; then
    export TERM=xterm-256color
fi
```

然后执行：

```bash
source ~/.bashrc
```

一劳永逸，每次登录自动修复。

### 方案三：安装 Ghostty terminfo（官方推荐）

如果有多人使用这台服务器，或者追求完美，可以把 Ghostty 的 terminfo 安装到远端。

在 **本地 Mac** 上执行：

```bash
# Ghostty terminfo 路径
TI_PATH="/Applications/Ghostty.app/Contents/Resources/terminfo"

# 推送到远端用户级（无需 sudo）
infocmp -x -A "$TI_PATH" xterm-ghostty | ssh user@nas-host 'tic -x -'

# 验证
ssh user@nas-host 'infocmp xterm-ghostty'
```

如果需要系统级安装（所有用户可用）：

```bash
infocmp -x -A "$TI_PATH" xterm-ghostty | ssh user@nas-host 'sudo tic -x -'
```

更多细节见 [Ghostty 官方文档 - Terminfo](https://ghostty.org/docs/help/terminfo)。

## 附：Starship 与 Oh My Zsh 的冲突

在折腾 Ghostty 配置时，还遇到一个坑。

按照网上的教程配置 Starship 彩虹状态栏：

```bash
brew install starship
starship preset catppuccin-powerline -o ~/.config/starship.toml
```

在 `~/.zshrc` 末尾添加：

```bash
eval "$(starship init zsh)"
```

重启终端后，**Starship 主题竟然没有生效**。折腾一番后发现是 Oh My Zsh 的配置和 Starship 冲突了。

**解决方案**：删除 Oh My Zsh 的配置文件（或移除相关配置），只保留 Starship 的初始化：

```bash
# 确保 ~/.zshrc 中只有 Starship，没有 Oh My Zsh 的主题设置
eval "$(starship init zsh)"
```

删除 Oh My Zsh 配置后，Starship 主题就能正常显示了。

## 相关链接

- [Ghostty 官网](https://ghostty.org/)
- [Ghostty - Terminfo](https://ghostty.org/docs/help/terminfo)
- [SSH 登录服务器后 Backspace 失效？Ghostty + TERM 踩坑完整解决方案](https://blog.csdn.net/weixin_42587620/article/details/159314932)
