## 序言

本 blog 使用 Hugo 的 PaperMod 主题搭建，这里记录搭建过程，以及这个过程中的一些配置细节和错误处理。

## 1. 快速开始
安装环境，配置主题，以及本地编译和运行。

### 1.1. 安装 Hugo

在 windows 上安装，使用`scoop`安装环境。
```powershell
scoop install hugo
```

在 mac 上安装，使用`brew`安装环境。
```bash
brew install hugo
```

安装后，通过 `hugo version` 验证是否成功。

### 1.2. 安装主题

在初始化使用或者 reclone 项目代码的时候，需要执行以下代码来安装主题。

```bash
git submodule add -f --depth=1 https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
git submodule update --init --recursive
```

更新主题，需要执行以下代码。
```bash
git submodule update --remote --merge
```

### 1.3. 本地预览

编译，并启动本地预览服务，默认访问地址为`http://localhost:1313/`。

```bash
hugo build
hugo server -D
```

## 2. 核心概念

### 2.1. 项目结构
Hugo 项目包含包含如下图的目录结构。

```text
blog/
├── archetypes/         # 内容模板，不用管
├── assets/             # 自定义的 CSS 和 JS
├── config/
    ├── hugo.toml       # 核心配置文件
    └── ....toml        # 其他配置文件
├── content/            # 自己的内容，Markdown 格式
├── layouts/            # 自定义的模板布局
├── static/             # 静态文件 (图片, 字体)
├── themes/             # 主题目录
```

所有文章和页面都存放在`content`目录下，通过目录结构和`index.md`文件来组织列表页和文章页。

### 2.2. 配置文件
所有的配置文件都存放在`config`目录下，其中`hugo.toml`是和兴配置文件。

## 3. 自定义

### 3.1. 自定义字体

标题使用文源圆体，正文使用文源黑体，代码使用 Maple 等宽字体。字体来自这两个项目[文源字体](https://github.com/takushun-wu/WenYuanFonts)和[Maple 字体](https://github.com/subframe7536/maple-font)。

主要配置为：

1. 下载对应的字体，将字体文件存放在 cloudflare 的 R2 库中。直接上传到指定路径下即可。
2. 在 R2 对象存量的存储桶上，进入 *设置* ➡️ *CORS 策略* 配置跨域访问。不配置的话容易出现 `CORS Missing Allow Origin` 的错误，导致不能加载字体文件。配置如下，将`[domain]`和`[port]`替换为实际值。
```json
[
  {
    "AllowedOrigins": [
      "https://[domain].com",
      "https://*.[domain].com",
      "http://localhost:[port]"
    ],
    "AllowedMethods": [
      "GET"
    ]
  }
]
```
3. 在博客项目里的文件 `assets/css/extended/blank.css` 中通过 @font-face 规则引入字体。
```css
@font-face {
  font-family: "Maple Mono";
  src: url("[font url]");
}

.post-content pre code {
  font-family: 'Maple Mono';
  font-size: 13;
  line-height: 1.5;
}
```
4. 由于博客是通过 cloudflare pages 进行部署的，在代码提交、构建和部署之后，需要在 cf 对应的域名的管理页面里，进入 *缓存* ➡️ *配置* 中清除缓存内容。
![](https://static.binwh.com/img/2025/10/01/wNhinl.png)

### 3.2. 添加 Umami 统计

通过 self-hosting 的方式自己搭建了一套 umami 的服务，在 umami 的后台添加博客网站并获得追踪代码。

在博客项目里的文件 `layouts/partials/extend_head.html` 文件中直接添加追踪代码即可。如下所示，不需要添加`<head></head>`标签。 

```html
<script defer src="https://[url]" data-website-id="[id]"></script>
```

### 3.3. 中英双语支持

`Hugo` 框架对多语言支持非常方便，博客正文内容通过增加`.en.md`后缀的方式增加英文博客。在配置上增加了 `languages.toml` 来区分不同语音的配置。

## 4. 参考资料

- [Hugo offical website @ gohugo](https://gohugo.io/)
- [@font-face 语法说明 @ mozilla](https://developer.mozilla.org/zh-CN/docs/Web/CSS/@font-face)
- [Hugo PaperMod 主题搭建与配置完全指南 @ rzlnb.top # 2024-10-03](https://blog.rzlnb.top/posts/blog/hugo-blog-setup) 
- [魔改PaperMod主题和博客改动 @ yuk7 # 2024-08-13](https://blog.yuk7.com/posts/papermod)
- [Hugo+PaperMod 双语博客搭建 @ yunyitang # 2024-01-15](https://www.yunyitang.me/hugo-papermod-blog/)
- [Install / Update PaperMod @ hugo-PaperMod # 2021-01-20](https://adityatelange.github.io/hugo-PaperMod/posts/papermod/papermod-installation/)
