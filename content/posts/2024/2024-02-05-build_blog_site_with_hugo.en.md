---
title: "Hugo build error:  expected comma characteror or an array"
slug: Build-blog-site-with-hugo
date: 2024-02-05T10:50:27+08:00
author: binwh
description: "Desc Thugo build error: expected comma character or an array or object ending on lineext."
draft: false
share: "true"
---
## Background

When building my blog using `hugo` , executing:

```shell
hugo
```

There are error message following bellow: 

```shell
expected comma character or an array or object ending on line 84 and column 40
```

## Solution

To resolve this issue, modify the configuration file `hugo.toml`, changing  `minifyOutput = true` to `minifyOutput = false`. I think this is a bug.

