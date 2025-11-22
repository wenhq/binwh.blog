---
title: "A Small Practice with Claude Code and GLM-4.6 Model: Modifying Hugo Blog Content Width"
slug: claude-code-glm46-hugo-practice
date: 2025-11-22T18:24:27+08:00
author: wenhq
description: Complete process of configuring Claude Code with GLM-4.6 model and practicing Hugo blog PaperMod theme page width modification
draft: false
share: true
---

> This article records the configuration of Claude Code with Zhipu GLM-4.6 large model, as well as the process of modifying Hugo blog page width, sharing from environment setup to practical operation.

## Background Introduction

In recent years, domestic large language models have developed rapidly. Zhipu AI's GLM series models have gained widespread attention for their outstanding performance. GLM-4.6, as an important version launched by Zhipu, shows excellent performance in code generation, logical reasoning, and other aspects. At the same time, Anthropic's Claude Code provides developers with powerful AI-assisted programming capabilities.

This article will combine these two tools, using a practical Hugo blog style modification as an example to demonstrate how to leverage domestic large models to improve development efficiency.

## Understanding GLM-4.6 and Zhipu AI

### Zhipu AI and GLM Series

Zhipu AI is a leading artificial intelligence company in China, focusing on large language model research and development. The GLM (General Language Model) series is Zhipu AI's large language model product line with the following characteristics:

#### GLM-4.6 Core Features
- **Strong Code Capabilities**: Supports code generation, understanding, and optimization for multiple programming languages
- **Chinese Advantage**: As a domestic model, it has more natural understanding and generation of Chinese
- **Logical Reasoning**: Excellent performance in complex problem analysis and solution provision
- **Multimodal Support**: Supports multiple input/output forms such as text and images
- **Cost-Effective**: More advantageous usage costs compared to foreign models

#### Applicable Scenarios
- Software development and code writing
- Technical documentation writing and optimization
- Problem analysis and solution design
- Chinese content creation and editing

### Combined Advantages of Claude Code + GLM-4.6

Combining Claude Code's tool effectiveness with GLM-4.6's intelligent capabilities can:
- Get better Chinese interaction experience
- Reduce usage costs
- Maintain efficient development workflow
- Support localized deployment needs

## Part One: Environment Configuration and Preparation

### 1. Claude Code Installation and Configuration

#### Installing Claude Code Extension in VS Code
1. Open VS Code
2. Search for "Claude Code" in the extensions store
3. Install Anthropic's official Claude Code extension, make sure to identify the official Anthropic one
4. Restart VS Code

#### Configuring GLM-4.6 Model
Create or edit Claude Code configuration file:

**Location**: `~/.claude/config.json`

```json
{
  "env": {
    "ANTHROPIC_AUTH_TOKEN": "your-glm-api-key",
    "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL":"glm-4.5-air",
    "ANTHROPIC_DEFAULT_OPUS_MODEL":"glm-4.6",
    "ANTHROPIC_DEFAULT_SONNET_MODEL":"glm-4.6"
  },
  "MCP_TOOL_TIMEOUT": "30000",
  "permissions": {
    "defaultMode": "bypassPermissions"
  }
}
```

### 2. Getting Zhipu API Key

1. Visit [Zhipu AI Open Platform](https://open.bigmodel.cn/)
2. Register and complete real-name authentication
3. Create API key in the console
4. Top up corresponding credits (usually has free credits for testing)

### 3. Configuration Verification

After completing the configuration, we need to verify whether the settings are correct. Open VS Code and click the Claude Code icon in the top right corner to start the conversation interface.

#### Verify Version Information
Enter the following command in the conversation to check the version:
```bash
claude --version
```
Normally, it should display version information similar to `2.0.50 (Claude Code)`.

#### Verify Model Configuration
Then ask about the currently used model:
```
Which model are you currently using?
```

If the configuration is correct, you should receive a reply similar to the following:
```
I am currently using the GLM-4.6 model. Through your updated configuration, you can see that Claude Code is now configured to use Zhipu AI's GLM model series:
- Haiku model maps to glm-4.5-air
- Opus and Sonnet models both map to glm-4.6

So I am currently running Zhipu AI's GLM-4.6 large model, which is also the model highlighted and practically used in your article.
```

Seeing such a reply indicates that the GLM-4.6 model has been successfully configured and can be used normally. Next, we can start our practical project.

## Part Two: A Small Try - Blog Page Content Width Adjustment

### 1. Project Background

My personal blog is based on Hugo static site generator, using PaperMod theme. During use, I found that the default page width is somewhat narrow for certain content displays and needs adjustment. However, I'm not very familiar with frontend technology, so I haven't made modifications yet.

### 2. Project Structure Analysis

#### Using Claude Code to Explore Project Structure
```
User: Please analyze the structure of this Hugo project and help me find the key files that control page width

Claude (GLM-4.6):
Analyzing project structure...
Key files found:
- assets/css/extended/blank.css (user custom style file)
- themes/PaperMod/assets/css/core/theme-vars.css (theme core variables)
- config/_default/params.toml (Hugo configuration file)
```

#### CSS Variable System Analysis
```
User: Explain the CSS variable system of PaperMod theme

Claude (GLM-4.6):
PaperMod uses CSS variables to control layout:
- --main-width: 720px (main content area width)
- --nav-width: 1024px (navigation bar maximum width)
- --gap: 24px (page margins and element spacing)

Actual content area calculation formula:
calc(720px + 24px * 2) = 768px
```

### 3. Intelligent Analysis and Suggestions

#### AI Analysis of Current Situation
```
User: I want to make the page content wider, what suggestions do you have?

Claude (GLM-4.6):
Based on the analysis of your project, I recommend adopting a gradual adjustment strategy:

1. Content width adjustment:
   --main-width: adjust from 720px to 840px (+120px)
   --nav-width: adjust from 1024px to 1200px (+176px)

2. Margin optimization:
   --gap: adjust from 24px to 28px (+4px, improve visual comfort)

3. Responsive considerations:
   Keep mobile 768px breakpoint unchanged
   Appropriately reduce margins on small screens

It is recommended to implement these modifications in assets/css/extended/blank.css to avoid directly modifying theme files.
```

#### Automatic CSS Code Generation
```
User: Please help me generate specific CSS code

Claude (GLM-4.6):
I generate the following CSS code for you, add to assets/css/extended/blank.css:

:root {
    /* Adjust main content area width to improve reading experience */
    --main-width: 840px;
    /* Adapt to wider navigation bar */
    --nav-width: 1200px;
    /* Appropriately increase margins to improve visual effect */
    --gap: 28px;
}

/* Mobile device optimization */
@media screen and (max-width: 768px) {
    :root {
        /* Reduce margins on mobile to fully utilize screen space */
        --gap: 16px;
    }
}

/* Tablet device optimization */
@media screen and (min-width: 769px) and (max-width: 1024px) {
    :root {
        --gap: 20px;
    }
}
```

### 4. Testing and Verification

#### AI-Assisted Testing Process
```
User: How to test the modification effects?

Claude (GLM-4.6):
It is recommended to test according to the following steps:

1. Start development server:
   hugo server -D

2. Local testing:
   - Visit http://localhost:1313
   - Use browser developer tools to simulate different screen sizes
   - Test display effects on mobile, tablet, and desktop

3. Key inspection items:
   - Article page content display
   - Adaptation of code blocks and images
   - Navigation menu responsive performance
   - Mobile touch experience

4. Performance verification:
   - Check page loading speed
   - Verify CSS rendering performance
```

#### Problem Diagnosis and Solution
```
User: Found text too long on mobile during testing, what solutions are there?

Claude (GLM-4.6):
Analyze the problem: Mobile text being too long may be caused by the following reasons:

1. Content width exceeds screen boundaries
2. Code blocks or tables not properly responsive
3. Image size issues

Recommended solutions:
- Add max-width: 100% restriction in CSS
- Add horizontal scrolling for code blocks
- Use overflow-wrap: break-word to handle long words

Do you need me to help you generate corresponding CSS fix code?
```

## Part Three: GLM-4.6 Usage Experience

### 1. Model Performance Evaluation

#### Advantages
- **Accurate Chinese Understanding**: More precise understanding of technical terms and Chinese expressions
- **High Code Quality**: Generated CSS code follows best practices
- **Clear Logic**: Clear thinking in problem analysis, practical solutions
- **Fast Response Speed**: Stable API call response times

#### Actual Performance
GLM-4.6 performed excellently in this project:
- Accurately identified Hugo project file structure
- Correctly analyzed PaperMod theme's CSS variable system
- Generated high-quality CSS code that follows responsive design principles
- Provided practical problem diagnosis and solutions

### 2. Cost-Benefit Analysis

#### Usage Costs
- **API Fees**: More affordable usage costs compared to foreign large models
- **Response Speed**: Lower domestic server access latency
- **Stability**: Stable and reliable service, suitable for production environment

#### Effect Comparison
| Metric | GLM-4.6 | Foreign Models |
|--------|---------|----------------|
| Chinese Understanding | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Code Quality | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Response Speed | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Usage Cost | ⭐⭐⭐⭐⭐ | ⭐⭐ |

## Part Four: Tool Integration and Optimization

### 1. Claude Code + Git Workflow

#### Intelligent Commit Message Generation
```
User: Help me generate Git commit message

Claude (GLM-4.6):
Based on your modification content, recommended commit message:

feat: Optimize blog page layout and reading experience

- Adjust main content width from 720px to 840px, improve large screen reading experience
- Optimize navigation bar width adaptation, maintain visual consistency
- Add margin design, improve overall aesthetics
- Complete mobile responsive layout, ensure multi-device compatibility
- Use CSS variable system for easy subsequent maintenance and adjustment

Test environment: Local development server verified
Impact scope: Site-wide page layout styles

Resolves: Improve blog reading experience
```

### 2. Automated Deployment Check

#### Deployment Compatibility Verification
```
User: Will this modification affect Cloudflare Pages deployment?

Claude (GLM-4.6):
Analyze deployment compatibility:

✅ **Safe modification**: Only modifies user custom CSS files
✅ **Theme compatible**: Does not involve PaperMod theme core files
✅ **Platform compatible**: CSS variable modification fully compatible with Cloudflare Pages
✅ **Functionally complete**: Will not affect existing functions and interactions

**Pre-deployment check recommendations**:
1. Confirm Hugo version compatibility
2. Verify CSS syntax correctness
3. Test multi-browser compatibility
4. Check mobile display effects

**Deployment strategy**:
- Recommend using preview branch for testing first
- Merge to main branch after confirmation
- Monitor page performance after deployment
```

## Part Five: Experience Summary and Best Practices

### 1. GLM-4.6 + Claude Code Usage Experience

#### Configuration Key Points
1. **API Configuration**: Correctly set Zhipu API key and address
2. **Parameter Optimization**: Set temperature to 0.1 to ensure code quality
3. **Tool Integration**: Enable all necessary development tools
4. **Context Management**: Reasonably set project context scope

#### Usage Tips
- **Clear Requirements**: Clearly describe specific problems and requirements to AI
- **Step-by-step Iteration**: Solve complex problems in steps
- **Verify Results**: Test AI-generated code in time
- **Feedback Optimization**: Adjust usage strategy based on results

### 2. Hugo Development Best Practices

#### Style Customization Principles
- Use CSS variable system for customization
- Maintain theme file integrity
- Customize in `assets/css/extended/` directory
- Fully consider responsive design

#### Development Workflow
1. Local development environment setup
2. AI-assisted analysis and code generation
3. Multi-device testing and verification
4. Git version control
5. Automated deployment online

### 3. Troubleshooting Guide

#### Common Problem Solutions
**CSS Styles Not Working**:
- Check file paths and syntax
- Clear browser cache
- Verify CSS variable override priority

**Poor AI Response Quality**:
- Optimize prompt description
- Check API configuration
- Adjust model parameters

**Deployment Anomalies**:
- Check build logs
- Verify Hugo version compatibility
- Confirm file permissions

## Extended Application Scenarios

### 1. Other Frontend Projects
This AI-assisted method is also applicable to:
- React component development and style optimization
- Vue project theme customization
- Angular application architecture design
- Next.js/Nuxt.js project configuration

### 2. Content Management Systems
- WordPress theme customization
- Drupal module development
- Ghost site configuration
- Strapi Headless CMS

### 3. Static Site Generators
- Jekyll theme customization
- Hexo plugin development
- Gatsby performance optimization
- Eleventy configuration management

## Conclusion

Through this practice, I deeply experienced the powerful capabilities of combining GLM-4.6 with Claude Code. Domestic large models indeed show surprising performance in Chinese environments and development scenarios, with accurate understanding and high-quality generated code.

For domestic developers, choosing domestic large models has obvious advantages:
- Better Chinese understanding and expression capabilities
- Lower network latency and usage costs
- More in line with domestic development habits and usage scenarios
- Better data security and compliance

With the continuous development of domestic AI technology, I believe more excellent tools and services will emerge in the future, providing better experiences for developers.

---

## 💡 Experience Recommendation

If you also want to try Zhipu's large model products, you can learn more through the following link:

🚀 **[Zhipu AI Open Platform](https://www.bigmodel.cn/claude-code?ic=XIUSJ4VJHF)**

Zhipu GLM series models have good support in 10+ mainstream programming tools such as Claude Code, Cline, etc. If you're looking for a cost-effective AI-assisted programming solution, it's worth a try. As a representative of domestic large models, GLM shows good performance in both Chinese understanding and code generation.