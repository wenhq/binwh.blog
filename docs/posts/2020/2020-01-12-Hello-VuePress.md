---
title: 2020年Blog改用VuePress
date: 2020-01-12T21:07:00
categories:
 - tech
tags:
 - vuejs
 - blog
---

>原先使用jekyll搭建博客，不是很会用。
>后面为了更好的学习vue，因此进行迁移。
>后续会陆续迁移以前的md文件，增加新的功能。

<!-- more -->
## VuePress
::: tip
VuePress官网：https://vuepress.vuejs.org/zh/
:::

## 配置
### 配置永久链接
使用全局配置来向所有页面应用永久链接：
```js
// .vuepress/config.js
module.exports = {
  permalink: "/:year/:month/:day/:slug.html"
};
```
修改之后可以看到URL路径已经是之前的路径了。副作用是是首页变成了```/1970/01/01/docs.html```，从文档看可以单独一个页面去设置永久链接，这种方式比全局配置拥有更高的优先级。
```markdown
<!-- docs/README.md -->
---
home: true
permalink: /
---
```

## 参考资料
- latte and cat [网站地址](https://blog.smallsunnyfox.com/) [github地址](https://github.com/smallsunnyfox/Blog)
- notev [网站地址](https://www.sigure.xyz/) [github地址](https://github.com/SigureMo/notev)
- danran [网站地址](https://blog.danran.site/) [github地址](https://github.com/danranVm/blog)
- zhuzhaohua [网站地址](https://zhuzhaohua.com/) [github地址](https://github.com/zhuzhaohua/myBlog)
