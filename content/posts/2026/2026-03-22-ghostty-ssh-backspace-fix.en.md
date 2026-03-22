---
title: Fixing Ghostty Terminal Backspace Not Working After SSH Connection
slug: ghostty-ssh-backspace-fix-en
date: 2026-03-22T10:00:00+08:00
author: wenhq
description: A troubleshooting guide for fixing Backspace key issues when using Ghostty to SSH into Synology NAS
draft: false
share: true
---

> Recently I switched my Mac terminal from iTerm2 to Ghostty. The experience has been smooth, but I encountered a Backspace malfunction when connecting to my Synology NAS via SSH. Here's how I solved it.

## Background

In a 2025 terminal ranking, Ghostty took the top spot. Drawn by its GPU acceleration and lower resource usage, I replaced iTerm2, which I'd been using for years, with Ghostty.

Everything worked fine locally, but after SSHing into my Synology NAS, problems arose:

- Pressing Backspace displayed `^?` instead of deleting characters
- Pressing ↑↓ arrow keys showed gibberish like `^[[A` `^[[B`
- Occasionally, spaces were inserted after deletion

After some research, I discovered this was a **terminal type compatibility issue**.

## Diagnosis

After SSHing into the NAS, first check the current terminal type:

```bash
echo $TERM
# Output
xterm-ghostty
```

Then check the backspace key settings:

```bash
stty -a | grep erase
# Output
intr = ^C; quit = ^\; erase = ^?; kill = ^U; eof = ^D; ...
```

Compare this with Tencent Cloud or Alibaba Cloud servers:

```bash
echo $TERM
# Output
xterm-256color
```

Found the problem: **The Synology NAS terminfo database doesn't have a definition for the `xterm-ghostty` terminal type.**

Ghostty comes with its own modern terminfo, but remote servers don't have it installed, causing terminal functionality issues. Mainstream cloud providers like Tencent Cloud and Alibaba Cloud default to `xterm-256color`, so they work fine.

## Solutions

### Option 1: Temporary Fix

After logging into the server, run:

```bash
export TERM=xterm-256color
```

If issues persist, add:

```bash
stty erase '^?'
```

Backspace should work normally now. The downside is you need to run this every time you log in.

### Option 2: Write to Config File

Add this to the server's `~/.bashrc`:

```bash
# Fix Ghostty TERM compatibility
if [ "$TERM" = "xterm-ghostty" ]; then
    export TERM=xterm-256color
fi
```

Then run:

```bash
source ~/.bashrc
```

A permanent fix that applies automatically on every login.

### Option 3: Install Ghostty terminfo (Official Recommendation)

If multiple people use the server, or if you want a perfect setup, install Ghostty's terminfo on the remote.

Run on your **local Mac**:

```bash
# Ghostty terminfo path
TI_PATH="/Applications/Ghostty.app/Contents/Resources/terminfo"

# Push to remote user-level (no sudo required)
infocmp -x -A "$TI_PATH" xterm-ghostty | ssh user@nas-host 'tic -x -'

# Verify
ssh user@nas-host 'infocmp xterm-ghostty'
```

For system-wide installation (available to all users):

```bash
infocmp -x -A "$TI_PATH" xterm-ghostty | ssh user@nas-host 'sudo tic -x -'
```

For more details, see [Ghostty Documentation - Terminfo](https://ghostty.org/docs/help/terminfo).

## Appendix: Starship vs Oh My Zsh Conflict

While configuring Ghostty, I ran into another issue.

Following online tutorials to set up Starship with a colorful status bar:

```bash
brew install starship
starship preset catppuccin-powerline -o ~/.config/starship.toml
```

Added this to the end of `~/.zshrc`:

```bash
eval "$(starship init zsh)"
```

After restarting the terminal, **the Starship theme didn't show up**. After some troubleshooting, I found it was conflicting with Oh My Zsh configuration.

**Solution**: Remove Oh My Zsh config files (or remove the relevant configurations), keeping only the Starship initialization:

```bash
# Make sure ~/.zshrc only has Starship, no Oh My Zsh theme settings
eval "$(starship init zsh)"
```

After removing Oh My Zsh configuration, the Starship theme displayed correctly.

## Related Links

- [Ghostty Official Site](https://ghostty.org/)
- [Ghostty - Terminfo](https://ghostty.org/docs/help/terminfo)
- [SSH Backspace Not Working? Ghostty + TERM Complete Troubleshooting Guide](https://blog.csdn.net/weixin_42587620/article/details/159314932)