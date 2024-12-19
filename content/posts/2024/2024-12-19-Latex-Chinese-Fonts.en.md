---
title: Latex Chinese fonts configuration
slug: Latex-Chinese-Fonts
date: 2024-12-19T22:03:27+08:00
author: wenhq
description: How to use Chinese fonts in Latex?
draft: false
share: true
---
Using the LaTeX, font configuration is often a headache when dealing with Chinese documents. When you get a Chinese LaTeX template, using XeLaTeX to compile it often gets some error about the lack of specific fonts, such as the lack of Source Han Serif CN font.

To download free commercial fonts and use them without installing, it is my solution.

1. Download Source Han, Founder, and other free commercial fonts. They are:
	- Source Han Sans font library [Adobe Fonts](https://mirrors.tuna.tsinghua.edu.cn/adobe-fonts/). The main free commercial fonts are `Source Han Serif` and `Source Han Sans`.
	- Founder Type official website [Founder Type](https://www.foundertype.com/). The main free commercial fonts are `Founder Song`, `Founder Kai`, `Founder Hei` and `Founder Fang Song`.
	-  Wenyuan font [WenYuanFonts](https://github.com/takushun-wu/WenYuanFonts). This is newly released at the end of 2024, based on the Source Han font for secondary development, making it more suitable for use in simplified Chinese scenarios and simplified Chinese TeX typesetting fields. It is open source and free for commercial use. The main font is `WenYuan Mincho`, `WenYuan Gothic`, `WenYuan Maru`.
2. In the Latex source file, specify the font file path. 
3. Set `AutoFakeBold` and `AutoFakeSlant`.

Here is an example of the font settings.

```latex
\documentclass[fontset=none]{ctexart} %Turn off the default font configuration in the ctex package

\setCJKmainfont[Path={font/},BoldFont={WenYuanGothic-Medium.ttf}, ItalicFont=FZKai-Z03.ttf]{WenYuanMincho-Regular.ttf}
\setCJKsansfont[Path={font/}]{WenYuanGothic-Regular.ttf}
\setCJKmonofont[Path={font/},AutoFakeBold, AutoFakeSlant]{WenYuanMaru-Medium.ttf} 
```
