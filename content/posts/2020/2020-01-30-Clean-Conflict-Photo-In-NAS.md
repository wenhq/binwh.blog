---
title: Nas上Cloud Sync同步照片的冲突文件清理
slug: clean_conflict_photo_in_nas
date: 2020-01-30T16:32:00
author: wenhq
description: " 在NAS里批量删除Conflict的照片- Mac里zsh的find报错问题"
draft: false
share: true
---

- 在NAS里批量删除Conflict的照片
- Mac里zsh的find报错问题

<!-- more -->
## 背景

群晖的NAS上开启了Cloud Sync，将照片自动与百度云同步。

这个春节实在无聊，在整理照片时发现目录中存在大量```***DiskStation_Dec-14-2319-2018_Conflict.JPG```类似的文件，因此想批量删除。

## 命令
查找，并确认
```bash
$ find 2016 -name *Conflict*
```

执行删除
```bash
$ find 2016 -name *Conflict* -exec rm -rf {} \;
```

## 问题
在 zsh 下使用 find 命令查找指定目录下所有头文件时出现问题：
```
no matches found: *Conflict*
```

解决办法：
在```~/.zshrc```中加入```setopt no_nomatch```，然后进行```source ~/.zshrc```命令
