---
title: Latex 中文字体配置
slug: Latex-Chinese-Fonts
date: 2024-12-19T22:03:27+08:00
author: wenhq
description: 在Latex中使用中文，没有一个好字体怎么行？
draft: false
share: true
---
在LaTeX的世界中，处理中文文档时，字体配置常常是一个让人头疼的问题。当拿到一个中文LaTeX模板，使用XeLaTeX编译时常因为缺少特定的字体而报错，例如缺少Source Han Serif CN（思源黑体）字体。

我的方案是下载免费商用字体，在不安装的情况下使用这些字体。

1. 下载思源、方正，以及其他的免费商用字体。他们是：
	- 思源黑体字库下载链接：[Adobe Fonts](https://mirrors.tuna.tsinghua.edu.cn/adobe-fonts/)。主要的免费商用字体是`思源宋体`（SourceHanSerif）和`思源黑体`（SourceHanSans）。
	- 方正字库官网链接：[Founder Type](https://www.foundertype.com/)。主要的免费商用字体是`方正书宋`、`方正楷体`、`方正黑体`和`方正仿宋`。
	- 文源字体链接：[WenYuanFonts](https://github.com/takushun-wu/WenYuanFonts)。这是在2024年年底新发布，基于思源字体进行二次开发，使之更加适合在简体中文情景下使用以及简体中文TeX排版领域的中文字体，开源免费商用。主要的字体是文员。`文源宋体`（WenYuan Mincho）、`文源黑体`（WenYuan Gothic）、`文源圆体`（WenYuan Maru）
2. 在Latex源文件中，指定字体文件路径。
3. 设置伪粗体和伪斜体。

以下是目前我使用的字体设置的示例：
```latex
\documentclass[fontset=none]{ctexart} %关闭ctex宏包中的预设字体配置

\setCJKmainfont[Path={font/},BoldFont={WenYuanGothic-Medium.ttf}, ItalicFont=FZKai-Z03.ttf]{WenYuanMincho-Regular.ttf}
\setCJKsansfont[Path={font/}]{WenYuanGothic-Regular.ttf}
\setCJKmonofont[Path={font/},AutoFakeBold, AutoFakeSlant]{WenYuanMaru-Medium.ttf} 
```
