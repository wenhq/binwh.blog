---
title: 解决dyld Library not loaded
date: 2020-10-31T17:17:00
categories:
 - tech
tags:
 - tech
---

运行`npm run dev`竟然报错了，错误如下：
```
dyld: Library not loaded: /usr/local/opt/icu4c/lib/libicui18n.66.dylib
  Referenced from: /usr/local/bin/node
  Reason: image not found
```
我还以为命令敲错了，然后赶紧去查。

<!-- more -->
终于找到解决方法：
```
brew uninstall node

brew install node

npm i docsify-cli -g //这段没有用上就好了
```

大概是node版本对不上了吧，某天brew update了一下。



参考资料：
- [[FAQ] dyld: Library not loaded: /usr/local/opt/icu4c/lib/libicui18n.64.dylib](https://www.cnblogs.com/farwish/p/13202414.html)
- [解决dyld: Library not loaded: /usr/local/opt/icu4c/lib/libicui18n.66.dylib macos npm i docsify-cli -g](https://blog.csdn.net/weixin_41194171/article/details/107982950)