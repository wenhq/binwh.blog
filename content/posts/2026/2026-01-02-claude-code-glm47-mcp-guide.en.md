---
title: "Complete Guide to Claude Code + GLM-4.7 + MCP Configuration"
slug: claude-code-glm47-mcp-guide
date: 2026-01-02T10:00:00+08:00
author: wenhq
description: "Detailed guide on configuring Claude Code with GLM-4.7 model and MCP servers"
draft: false
share: true
---

> With the release of GLM-4.7, Claude Code configuration has new changes. This article details how to configure settings.json and MCP servers.

## 🚀 Why Choose GLM-4.7

GLM-4.7 is [Zhipu AI](https://www.bigmodel.cn/claude-code?ic=XIUSJ4VJHF)'s latest flagship model, excelling in code generation, complex reasoning, and more. Through Zhipu's Anthropic-compatible API endpoint, it can be seamlessly integrated into Claude Code.

**Key Advantages:**
- 🎯 Powerful code generation and understanding
- 💬 Excellent Chinese language support
- ⚡ Smart model routing (GLM-4.7 for main tasks, auto-switch to GLM-4.5-Air for light tasks)
- 💰 Balanced performance and cost


## 📋 I. settings.json Configuration

Config file location: `~/.claude/settings.json`

### Core Configuration

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

### Configuration Options

| Environment Variable | Description | Recommended |
|:---------------------|:------------|:-----------:|
| `ANTHROPIC_AUTH_TOKEN` | Zhipu API Key | Required |
| `ANTHROPIC_BASE_URL` | API Endpoint | `https://open.bigmodel.cn/api/anthropic` |
| `ANTHROPIC_DEFAULT_HAIKU_MODEL` | Light task model | `glm-4.5-air` |
| `ANTHROPIC_DEFAULT_OPUS_MODEL` | Complex reasoning model | `glm-4.7` |
| `ANTHROPIC_DEFAULT_SONNET_MODEL` | Default model | `glm-4.7` |
| `MCP_TOOL_TIMEOUT` | MCP tool timeout (ms) | `30000` |

### Model Routing Strategy

Claude Code automatically selects models based on task complexity:

| Scenario | Model |
|:---------|-------:|
| Dialogue/Planning/Coding/Complex Reasoning | **GLM-4.7** |
| Light Tasks (e.g., file search) | **GLM-4.5-Air** |


## 🔌 II. MCP Server Configuration

Config file location: `mcpServers` field in `~/.claude.json`

### 2.1 Vision MCP (zai-mcp-server)

Provides powerful image understanding capabilities, supporting UI-to-code, OCR, error diagnosis, etc.

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

**Supported Tools:**
- `ui_to_artifact` - UI screenshot to code/design specs
- `extract_text_from_screenshot` - OCR text extraction
- `diagnose_error_screenshot` - Error log analysis
- `understand_technical_diagram` - Technical diagram interpretation
- `analyze_data_visualization` - Data chart analysis
- `ui_diff_check` - UI comparison verification
- `video_analysis` - Video scene parsing

### 2.2 Web Search MCP (web-search-prime)

Provides real-time web search capabilities.

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

**Usage Examples:**
- "Search for the latest AI technology developments"
- "Find best practices for Python async programming"

### 2.3 Web Reader MCP

Parses web content into LLM-friendly format.

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

## 🛠️ III. Complete Configuration Example

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

### .claude.json (MCP section)

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


## ✅ IV. Verify Configuration

### 1. Check Claude Code Version

```bash
claude --version
# Recommended: 2.0.14 or higher
```

### 2. Start Claude Code

```bash
cd /path/to/your/project
claude
```

### 3. Verify Model Configuration

In Claude Code, enter:
```
/status
```

Should display the current model as GLM-4.7.

### 4. Verify MCP Servers

In Claude Code, enter:
```
/mcp
```

Should list all configured MCP servers and their tools.


## 📚 V. Common Issues

### Q1: Configuration changes not taking effect?

**Solution:**
1. Close all Claude Code windows
2. Open a new terminal window
3. Run `claude` again

### Q2: MCP server connection failed?

**Troubleshooting:**
```bash
# Manually test MCP server
npx -y @z_ai/mcp-server
```

- If installation succeeds, check client configuration
- If installation fails, troubleshoot based on error messages

### Q3: How to switch models?

Edit `~/.claude/settings.json`:
```json
{
  "env": {
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "glm-4.7"
  }
}
```


## 🔗 VI. Related Resources

- [Zhipu AI Official Documentation - Claude Code Integration Guide](https://docs.bigmodel.cn/cn/guide/develop/claude) | [Get API Key](https://www.bigmodel.cn/claude-code?ic=XIUSJ4VJHF)
- [Vision MCP Documentation](https://docs.bigmodel.cn/cn/coding-plan/mcp/vision-mcp-server)
- [Web Search MCP Documentation](https://docs.bigmodel.cn/cn/coding-plan/mcp/search-mcp-server)
- [Web Reader MCP Documentation](https://docs.bigmodel.cn/cn/coding-plan/mcp/reader-mcp-server)
