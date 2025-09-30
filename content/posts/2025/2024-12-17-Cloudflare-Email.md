---
title: 使用 Cloudflare 为每次注册新建一个 Email 地址
slug: Cloudflare-Email
date: 2024-12-17T22:15:27+08:00
author: wenhq
description: 我是怎么用Cloudflare管理每个网站的注册邮箱的。
draft: false
share: true
---
现在主流的网站服务都提供注册功能，一般使用邮箱注册。然而我们面临的信息泄露、垃圾邮件等问题的困扰，如何做能在注册时保证每个网站都不同，还可以发现注册的网站是否存在泄露问题呢？我的方法是使用注册网站的域名建立一个新的邮箱，形式是 **{需要注册的网站域名}@{我自己的域名}.{域名后缀}**。

## 前提条件

拥有一个域名，并且该域名的 DNS 在 Cloudflare 管理。

## 接收邮件

使用 Cloudflare 的EMAIL功能来接收邮件，主要步骤为：

1. 登录 Cloudflare，进入域名下的**电子邮件路由**。
2. 找到路由规则标签，开启 **Catch-All** 功能并点击编辑。
3. 设置转发操作，将所有邮件转发到自己的实际邮件地址。
    - 自己的实际邮件地址即**目标地址**。需要先添加目标地址，例如我使用 foxmail 的实际邮箱，让所有邮件都发到这个实际邮箱里。添加目标地址时会收到确认邮件，点击确认即可。![](https://static.binwh.com/img/2024/12/17/SeexUq.png)
    - 设置**路由规则**，创建以自有域名为后缀的任意邮件地址。例如 `weibo@域名.com` 这个邮箱专门用于 weibo.com 网站的注册。在“自定义地址”里填`weibo`；在“操作”里选择`发送到电子邮件`；“目标位置”选择上一步添加的实际电子邮件。![](https://static.binwh.com/img/2024/12/17/xfJFeZ.png)
    - 如果这个自定义地址的邮箱都是垃圾邮件，可以在“操作”中选择`删除`。以后收到这个邮箱的邮件就会自动丢弃。

## 邮件后续处理

配置成功后，在目标地址（真实的电子邮箱）里可以收到网站的注册信息邮件，登录码邮件等。一般情况下，我们是不需要进行回复处理的。但是，如果想要回复邮件怎么操作呢？

### 使用Resend

[Resend](https://resend.com/)是为开发者设计的邮件工具，能确保邮件送到收件箱而不是垃圾箱的最佳 Email API。登录 Resend，在 **API Keys** 标签下申请新的 API Key。之后查看 SMTP 设置以获取发送邮件所需的信息。

在自己邮箱里添加其他邮箱，并填入 Resend 的 SMTP 服务信息。Username 填 `resend`；Password 输入获取的 `API Key` 。

> 这个方案我没有尝试过。

### 使用 EmailFlare

EmailFlare 是一个开源的 MIT 许可软件，允许用户通过自己的域名发送邮件，而无需注册任何服务。这个软件支持通过 Cloudflare 自动部署。

具体操作步骤可见“参考资料”中的第二条。

## 替代方案

如果不想使用 Cloudflare 的EMAIL功能来接收邮件，可以申请一个免费的企业微信，绑定自己的域名，再配置多个邮件地址。使用飞书可以达到类似的目的。

## 参考资料

- [域名搁着别浪费，Cloudflare + Gmail + Resend 十分钟轻松拥有免费的企业邮箱](https://cleanclip.cc/zh/developer/cloudflare-worker-gmail-resend-enterprise-email/)
- [EmailFlare: Send emails from your domain through Cloudflare for free](https://www.breakp.dev/blog/email-flare-send-from-worker-for-free/)