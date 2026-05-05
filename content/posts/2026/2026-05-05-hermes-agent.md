---
title: Hermes Agent一个会自我进化的助手
slug: hermes-agent
date: 2026-05-05T10:00:00+08:00
author: wenhq
description: Hermes Agent 是 Nous Research 开源的自改进 AI Agent，它能在使用中创建技能、改进技能、跨会话记忆、构建用户模型。两分钟安装，支持微信/飞书/钉钉等 15+ 平台，可运行在 20 美元一年的 VPS 上。这篇文章记录它的核心特性、安装配置和日常使用。
draft: false
share: true
---

> 之前折腾过 OpenClaw 做 Docker 部署，也跑通了阿里云百炼的 Coding Plan。后来发现 Nous Research 在 OpenClaw 基础上推出了 Hermes Agent——**一个会随着使用不断成长的 Agent**。不是营销话术，它真的有一个闭环学习机制：每调用约 15 次工具后自动暂停回顾，把经验写入技能文件，下次直接复用。用得越久，它越懂你。

<!-- more -->

## 两分钟安装

支持 Linux / macOS / WSL2 / Android (Termux)，原生 Windows 需走 WSL2。

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

国内网络可以用镜像：

```bash
curl -fsSL https://res1.hermesagent.org.cn/install.sh | bash
```

装完后：

```bash
source ~/.bashrc    # 或 source ~/.zshrc
hermes              # 开始对话
hermes model        # 选择模型提供商
hermes tools        # 配置工具集
```

如果用魔搭的免费模型，`hermes model` 里选 Custom endpoint，按以下配置填写：

- **Provider**：`custom`
- **Base URL**：`https://api-inference.modelscope.cn/v1`
- **Model**：`inclusionAI/Ling-2.6-1T`

安装过程中会提示配置微信，用手机扫一下码就完成配对，直接在微信里和 Hermes 对话。

如果之前在用 OpenClaw，一键迁移：

```bash
hermes claw migrate    # SOUL.md、记忆、技能、API 密钥全部保留
```

## 日常使用

Hermes 有两个入口：终端 UI（`hermes`）和网关模式（`hermes gateway`）。

### 终端模式

全功能 TUI，多行编辑、斜杠命令自动补全、会话历史、流式工具输出：

```bash
hermes                  # 启动
/model custom:inclusionAI/Ling-2.6-1T    # 切换模型
/personality assistant  # 设置人格
/new                    # 开启新对话
/compress               # 压缩上下文
/usage                  # 查看 token 用量
```

### 消息平台模式

配置一次网关，之后从任意平台直接对话：

```bash
hermes gateway setup    # 交互式配置各平台
hermes gateway start    # 启动网关
```

在微信里发消息就行，和真人聊天一样。所有会话自动保存，下次启动时 `hermes -c` 可以恢复上一次对话。或者使用如下命令来恢复指定会话。

```bash
hermes sessions list
hermes --resume 20260505_180059_1977df46
```

### 定时任务

用自然语言描述，Hermes 自动创建 cron 任务：

- "每天早上 8 点给我发一份邮件摘要"
- "每周一检查服务器磁盘空间"
- "每晚 11 点备份指定目录"

结果会投递到你设置的平台，不需要一直盯着终端。

## 更新与维护

```bash
hermes update           # 一键更新：拉代码 → 装依赖 → 配置迁移 → 网关自动重启
hermes update --check   # 检查是否有新版本
hermes doctor           # 诊断问题
hermes version          # 查看当前版本
```

从消息平台也可以直接发 `/update`，机器人会短暂离线 5–15 秒后自动恢复。

## 总结

Hermes Agent 适合两类人：

1. **需要一个"长期在线"的 AI 助手**：不在电脑前也能通过微信交互，定时任务自动执行
2. **看重 Agent 的"成长性"**：闭环学习意味着它越用越好用，不像传统 Agent 每次都从零开始

运行成本也很低，20 美元一年的 VPS，4GB 内存加 20GB 硬盘就够跑。大模型可以用 ModelScope 或 OpenRouter 的免费额度，不用额外花钱。ModelScope 上的免费模型更好一些，每天有 500 次免费调用；OpenRouter 的免费模型每天 50 次。我现在用香港的 VPS 跑了一个定时任务——定时自动抓取 X 上的关注动态，按 AI、科技、经济等分类汇总，生成简报发到微信上。只需要提供 x.com 的 cookie，剩下的交给 Hermes 就行。

还没注册魔搭的话可以用我的邀请链接：[注册 ModelScope](https://www.modelscope.cn/register?inviteCode=ScepoMedol&invitorName=ScepoMedol)

> 项目地址：[github.com/NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent)
> 中文社区：[hermesagent.org.cn](https://hermesagent.org.cn/docs/getting-started/quickstart)
