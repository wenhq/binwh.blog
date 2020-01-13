---
layout: post
title: "去哪儿SPA HTML应用架构——让HTML应用体验更贴近于Native应用"
date: '2015-02-27T17:52:00.004+08:00'
author: InfoQ
categories:
 - tech
tags:
 - web
modified_time: '2015-02-27T17:52:55.247+08:00'
blogger_id: tag:blogger.com,1999:blog-4961947611491238191.post-3061987891563706491
blogger_orig_url: http://binaryware.blogspot.com/2015/02/spa-htmlhtmlnative.html
---

![](https://images-blogger-opensocial.googleusercontent.com/gadgets/proxy?url=http%3A%2F%2Fwww.infoq.com%2Fresource%2Fpresentations%2Fquaner-spa-html-application-architecture%2Fzh%2Fmediumimage%2Fcaihuan_270.jpg&container=blogger&gadget=a&rewriteMime=image%2F*)

概要
去哪儿网2010年开始投入无线领域，发展过程中不断的探索寻找手机应用在降低部署成本及跨平台方面的解决方案，随着HTML5标准的成熟，使用HTML方案在性能及体验间寻求平衡的解决方案逐渐变得可行。本次分享主要介绍去哪儿无线团队在探索过程中遇到的问题以及目前应用的从开发到构建部署的一套整体解决方案。
分享要点： 1. AMD模块化开发，完全遵循commonJS规范 2.
基于SPI思想的组件化提供页面在浏览器及Native应用间的体验及能力的差异化。
3. Backbonejs：提供MVC框架、前端URL路由 4. underscore：提供前端模板 5.
Requirejs：前端资源加载器，负责模块化文件的载入和编译打包 6.
GruntJS：前端开发工具，提供前端开发环境和代码编译功能，和Jenkins结合，完成代码部署
7. rhino：使用JS开发后端，保留了JS调用jar的能力

个人简介
蔡欢，2010年加入去哪儿网，担任去哪儿网无线技术高级总监、架构师，无线事业部副总经理。有10年以上无线互联网开发经验。加入去哪儿网之前就职于高德软件，高德手机地图创始团队核心成员。对移动客户端及无线HTML应用从初创阶段发展到亿级用户过程中的技术解决方案演化和技术团队建设有深刻的理解。


来源：[视频演讲： 去哪儿SPA
HTML应用架构——让HTML应用体验更贴近于Native应用](http://www.infoq.com/cn/presentations/quaner-spa-html-application-architecture?utm_campaign=infoq_content&utm_source=infoq&utm_medium=feed&utm_term=global)
通过 [Wenhu Qiu的 InfoQ 个性](http://www.infoq.com/cn/)[化 RSS
Feed](http://www.infoq.com/cn/)
