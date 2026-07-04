---
title: Hugo版本升级和集成umami功能
slug: update-hugo-version
date: 2025-09-30T10:44:27+08:00
author: wenhq
description: Hugo版本升级和集成umami功能
draft: false
share: true
---
> 很久没有更新站点了，最近抽时间做了一下hugo版本升级，顺带增加了一个umami的统计功能。

## 本地编译环境

在windows上使用`scoop install hugo`，在mac上使用`brew install hugo` 安装编译环境。使用命令`hugo version`命令查看当前使用的版本号并记录，后边还需要使用。

使用如下命令处理网页源代码：
```bash
git clone [url]
git submodule add -f --depth=1 https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
git submodule update --init --recursive # needed when you reclone your repo (submodules may not get cloned automatically)
git submodule update --remote --merge # UPDATE: inside the folder of your Hugo site
```

主题 `PaperMod` 的使用参考[github上的wiki](https://github.com/adityatelange/hugo-PaperMod/wiki/Installation)。

## 集成umami

### 建数据库
验证发现 *xata*、*aiven* 的免费postgre sql数据库在初始化数据时都报错，可能是在安装pg扩展的时候有问题。最后在 *neon* 上建立了免费数据库，参数为pg18，数据中心选择了新加坡。

### 搭服务

在自己的云服务器上，使用`docker compose`建立`umami`服务。

```docker-compose
services:
  umami:
    image: ghcr.milu.moe/umami-software/umami:postgresql-latest
    container_name: umami
    restart: on-failure:3
    network_mode: bridge
    ports:
      - [port-outer]:3000
    volumes:
      - ./data:/var/lib/postgresql/data
    environment:
      APP_SECRET: "20250929"
      DATABASE_TYPE: postgresql
      DATABASE_URL: postgresql://[url]
```

### 加模板

在umami后台获取跟踪代码后，添加到 hugo 的模板里。在 `layouts\partials` 路径下新增 `extend_head.html`，将`<script defer src="..." data-website-id="..."></script>`这样的跟踪代码直接放到`extend_head.html`文件中。


编译与测试，一切正常。
```bash
hugo build
hugo server -D
```

## 集成部署

在cloudflare pages 部署时遇到报错，是因为更新PaperMod之后，之前编译使用的hugo版太低了。
```text
ERROR => hugo v0.146.0 or greater is required for hugo-PaperMod to build
```

在 *设置*  ➡ *变量和机密* 中，修改`HUGO_VERSION`的值，就是前面记录下来的最新版本号。

最后在 *部署*  ➡ *所有部署*路径下找到最近的记录点击  *重试部署* ，一切正常。


## 其他

这篇有关 hugo 报错的 [文章](https://www.binwh.com/2024/02/05/build-blog-site-with-hugo/) 已经过时。

## 附：情绪调节方法

![](https://img.binwh.com/file/pictures-tigcat/2025/03/09/GkDEn0IXUAAN6kb.JPG)