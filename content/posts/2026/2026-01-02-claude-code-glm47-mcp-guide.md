---
title: "Claude Code + GLM-4.7 + MCP 全方位配置指南"
slug: claude-code-glm47-mcp-guide
date: 2026-01-02T10:00:00+08:00
author: wenhq
description: "详解如何配置 Claude Code 使用 GLM-4.7 模型及 MCP 服务器"
draft: false
share: true
---

> 随着 GLM-4.7 的发布，Claude Code 的配置有了新的变化。本文详细介绍如何配置 settings.json 和 MCP 服务器。

## 🚀 为什么选择 GLM-4.7

GLM-4.7 是[智谱 AI](https://www.bigmodel.cn/claude-code?ic=XIUSJ4VJHF)最新发布的旗舰模型，在代码生成、复杂推理等方面表现出色。通过智谱提供的兼容 Anthropic API 端点，可以无缝集成到 Claude Code 中。

**核心优势：**
- 🎯 强大的代码生成和理解能力
- 💬 优秀的中文支持
- ⚡ 智能模型路由（主任务用 GLM-4.7，轻量任务自动切换到 GLM-4.5-Air）
- 💰 兼顾性能与成本


## 📋 一、settings.json 配置

配置文件位置：`~/.claude/settings.json`

### 核心配置

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your_api_key_here",
    "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.5-air",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-4.7",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.7"
  },
  "MCP_TOOL_TIMEOUT": "30000",
  "permissions": {
    "defaultMode": "bypassPermissions"
  }
}
```

### 配置项说明

| 环境变量 | 说明 | 推荐值 |
|:---------|:-----|:-------:|
| `ANTHROPIC_AUTH_TOKEN` | 智谱 API Key | 必填 |
| `ANTHROPIC_BASE_URL` | API 端点 | `https://open.bigmodel.cn/api/anthropic` |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | 轻量任务模型 | `glm-4.5-air` |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | 复杂推理模型 | `glm-4.7` |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | 默认模型 | `glm-4.7` |
| `MCP_TOOL_TIMEOUT` | MCP 工具超时(ms) | `30000` |

### 模型路由策略

Claude Code 会根据任务复杂度自动选择模型：

| 场景 | 使用模型 |
|:-----|:---------|
| 对话/规划/代码编写/复杂推理 | **GLM-4.7** |
| 轻量任务（如文件搜索） | **GLM-4.5-Air** |


## 🔌 二、MCP 服务器配置

配置文件位置：`~/.claude.json` 中的 `mcpServers` 字段

### 2.1 视觉理解 MCP (zai-mcp-server)

提供强大的图像理解能力，支持 UI 转代码、OCR、错误诊断等。

```json
{
  "mcpServers": {
    "zai-mcp-server": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@z_ai/mcp-server"],
      "env": {
        "Z_AI_API_KEY": "your_api_key_here",
        "Z_AI_MODE": "ZHIPU"
      }
    }
  }
}
```

**支持的工具：**
- `ui_to_artifact` - UI 截图转代码/设计规范
- `extract_text_from_screenshot` - OCR 文字提取
- `diagnose_error_screenshot` - 错误日志分析
- `understand_technical_diagram` - 技术图纸解读
- `analyze_data_visualization` - 数据图表分析
- `ui_diff_check` - UI 对比验证
- `video_analysis` - 视频场景解析

### 2.2 联网搜索 MCP (web-search-prime)

提供实时网络搜索能力。

```json
{
  "mcpServers": {
    "web-search-prime": {
      "type": "http",
      "url": "https://open.bigmodel.cn/api/mcp/web_search_prime/mcp",
      "headers": {
        "Authorization": "Bearer your_api_key_here"
      }
    }
  }
}
```

**使用示例：**
- "帮我搜索最新的 AI 技术发展"
- "查找 Python 异步编程的最佳实践"

### 2.3 网页阅读 MCP (web-reader)

解析网页内容为 LLM 友好的格式。

```json
{
  "mcpServers": {
    "web-reader": {
      "type": "http",
      "url": "https://open.bigmodel.cn/api/mcp/web_reader/mcp",
      "headers": {
        "Authorization": "Bearer your_api_key_here"
      }
    }
  }
}
```

---

## 🛠️ 三、完整配置示例

### settings.json

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "8fc5c5f9d47e4f5f8297cdad3e57a79e.Er9E5voGIm6Hgo1L",
    "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "glm-4.5-air",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "glm-4.7",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.7"
  },
  "MCP_TOOL_TIMEOUT": "30000",
  "permissions": {
    "defaultMode": "bypassPermissions"
  }
}
```

### .claude.json (MCP 部分)

```json
{
  "mcpServers": {
    "web-search-prime": {
      "type": "http",
      "url": "https://open.bigmodel.cn/api/mcp/web_search_prime/mcp",
      "headers": {
        "Authorization": "Bearer 8fc5c5f9d47e4f5f8297cdad3e57a79e.Er9E5voGIm6Hgo1L"
      }
    },
    "web-reader": {
      "type": "http",
      "url": "https://open.bigmodel.cn/api/mcp/web_reader/mcp",
      "headers": {
        "Authorization": "Bearer 8fc5c5f9d47e4f5f8297cdad3e57a79e.Er9E5voGIm6Hgo1L"
      }
    },
    "zai-mcp-server": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@z_ai/mcp-server"],
      "env": {
        "Z_AI_API_KEY": "8fc5c5f9d47e4f5f8297cdad3e57a79e.Er9E5voGIm6Hgo1L",
        "Z_AI_MODE": "ZHIPU"
      }
    }
  }
}
```


## ✅ 四、验证配置

### 1. 检查 Claude Code 版本

```bash
claude --version
# 推荐使用 2.0.14 或更高版本
```

### 2. 启动 Claude Code

```bash
cd /path/to/your/project
claude
```

### 3. 验证模型配置

在 Claude Code 中输入：
```
/status
```

应该显示当前使用的模型为 GLM-4.7。

### 4. 验证 MCP 服务器

在 Claude Code 中输入：
```
/mcp
```

应该列出所有已配置的 MCP 服务器及其工具。


## 📚 五、常见问题

### Q1: 配置修改后不生效？

**解决方案：**
1. 关闭所有 Claude Code 窗口
2. 打开新的终端窗口
3. 重新运行 `claude`

### Q2: MCP 服务器连接失败？

**排查步骤：**
```bash
# 手动测试 MCP 服务器
npx -y @z_ai/mcp-server
```

- 若安装成功，检查客户端配置
- 若安装失败，根据错误信息排查

### Q3: 如何切换模型？

编辑 `~/.claude/settings.json`：
```json
{
  "env": {
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.7"
  }
}
```


## 🔗 六、相关资源

- [智谱 AI 官方文档 - Claude Code 接入指南](https://docs.bigmodel.cn/cn/guide/develop/claude) | [注册获取 API Key](https://www.bigmodel.cn/claude-code?ic=XIUSJ4VJHF)
- [视觉理解 MCP 文档](https://docs.bigmodel.cn/cn/coding-plan/mcp/vision-mcp-server)
- [联网搜索 MCP 文档](https://docs.bigmodel.cn/cn/coding-plan/mcp/search-mcp-server)
- [网页阅读 MCP 文档](https://docs.bigmodel.cn/cn/coding-plan/mcp/reader-mcp-server)

