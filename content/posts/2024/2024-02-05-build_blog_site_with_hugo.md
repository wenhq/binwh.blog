---
title: Hugo编译出错：expected comma characteror or an array
slug: Build-blog-site-with-hugo
date: 2024-02-05T10:50:27+08:00
author: binwh
showToc: true
TocOpen: false
draft: false
hidemeta: false
comments: false
description: 困扰我一下午的问题，hugo编译出错：expected comma character or an array or object ending on line
disableHLJS: false
disableShare: false
hideSummary: false
searchHidden: true
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowWordCount: true
ShowRssButtonInSectionTermList: true
UseHugoToc: true
share: "true"
---
## 背景

使用 `hugo` 构建自己的博客时，执行：

```shell
hugo
```

出现如下提示错误：

```shell
expected comma character or an array or object ending on line 84 and column 40
```

## 处理方式

修改配置文件 `hugo.toml`，将其中 `minifyOutput = true` 改为 `minifyOutput = false`。 疑似这里存在bug。
