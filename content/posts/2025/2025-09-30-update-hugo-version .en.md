---
title: Update Hugo Version And  Integrate Umami Analysis
slug: update-hugo-version
date: 2025-09-30T10:44:27+08:00
author: wenhq
description: Update Hugo Version And  Integrate Umami Analysis On PaperMod Theme
draft: false
share: true
---
> 很久没有更新站点了，最近抽时间做了一下hugo版本升级，顺带增加了一个umami的统计功能。

## Local compilation environment

To install the compilation envirionment, use `scoop install hugo` on Windows, or use  `brew install hugo` on Mac. With the command `hugo version` view the current version number and record it which will be used later.

Use the following command to process web page source code:

```bash
git clone [url]
git submodule add -f --depth=1 https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
git submodule update --init --recursive # needed when you reclone your repo (submodules may not get cloned automatically)
git submodule update --remote --merge # UPDATE: inside the folder of your Hugo site
```

Reference for the theme `PaperMod`  [wiki on Github](https://github.com/adityatelange/hugo-PaperMod/wiki/Installation)。

## Integrate umami

### Building a database
Verification found that the free PostgreSQL databases on *xata* or *aiven* both reported errors during data initialization，possibly dueto issues during the installation of the PG extesion. Finally, I chose the free database on *neon* with parameter pg18, and Singapore as the data center.

### Building Services

On my own cloud server, I use `docker compose` to establish the `umami` analysis service.

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

### Adding Template

Obtaining the tracking code in umami backend website, then add it to hugo  template. In the path `layouts\partials`  add new file named `extend_head.html`, and directly add the js code like `<script defer src="..." data-website-id="..."></script>` into the `extend_head.html` file.

Compile and test, everything is well.
```bash
hugo build
hugo server -D
```

## Deployment

Encountering an error during the deployment of CloudFlare pages is due to the update of PaperMod, which resulted in the previous compilation using a lower version of Hugo.

```text
ERROR => hugo v0.146.0 or greater is required for hugo-PaperMod to build
```

在 *设置*  ➡ *变量和机密* 中，修改`HUGO_VERSION`的值，就是前面记录下来的最新版本号。

In *Settings* ➡ *Variables and Secrets* , modify the value of `HUGO_VERSION` in the latest version number recorded that get the result earlier.

Finally, in the paths *Deployments*  ➡ *All deployments* find out the latest deployment record and click *retry deployment* .


## Others

[This article](en/2024/02/05/build-blog-site-with-hugo/) about hugo error reporting is outdated.