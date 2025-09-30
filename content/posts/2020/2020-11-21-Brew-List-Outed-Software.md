---
title: 列出brew安装的非最新版本软件
slug: brew_list_outed_software
date: 2020-11-21T15:06:00
author: wenhq
description: 如何知道brew安装过的软件不是最新版本？这样知道之后，就可以根据自己的需要安装最新的版本。
draft: false
share: true
---

## 更新brew的软件列表
使用命令```brew update```更新brew上的软件列表，可以看到在“Updated 2 taps (homebrew/core and homebrew/cask).”的提示下面的软件，如果已经安装过的话后面会有“✔”。

但是brew下哪些软件是可以更新到最新版本呢？

## 查找过时软件
使用命令```brew outdated```就可以看到所有低版本软件，以及安装版本和最新版本都是多少。

```bash
~$ brew outdated --cask

appium (1.17.1-1) != 1.18.3
baidunetdisk (3.0.6.2) != 3.5.0
caffeine (1.1.1) != 1.1.3
calibre (3.36.0) != 5.5.0
eclipse-java (4.11.0,2019-03:R) != 4.17.0,2020-09:R
hiddenbar (1.4) != 1.6
kindle (58033) != 1.30.59055
kodi (17.6-Krypton) != 18.9-Leia
mono-mdk (5.12.0.226) != 6.12.0.90
motrix (1.4.1) != 1.5.15
mp3tag (2.99a) != 3.01
musicbrainz-picard (2.2.3) != 2.5.2
ocenaudio (3.8.1) != 3.9.5
qq (6.6.8) != 6.7.0.20123
rawtherapee (5.4) != 5.8
scratch (3.6.0) != 3.18.1
shotcut (20.07.11) != 20.10.31
sogouinput (46b,1519980135) != 58a,1588947491
stellarium (0.19.1) != 0.20.3.1
tencent-lemon (4.0.0) != 4.8.3
tuxera-ntfs (2018) != 2019
vagrant (2.1.1) != 2.2.13
virtualbox (6.0.14,133895) != 6.1.16,140961
wechat (2.4.2.18) != latest
wpsoffice (1.0.1(1354)) != 2.7.0,4476
youdaonote (3.6.2) != 3.6.3
zettlr (1.6.0) != 1.7.5
```

如果只看brew核心仓库的软件包，可以使用命令```brew outdated --formula```；如果只看brew扩展仓库的软件包，可以使用命令```brew outdated --cask```。

一般在cask扩展仓库的应用都是桌面软件，为了使用最新功能，可以保持更新到最新。而core仓库的软件，一般都是底层命令，为了保持稳定可以有选择的进行更新。

## 更新软件
```brew upgrade xxx```