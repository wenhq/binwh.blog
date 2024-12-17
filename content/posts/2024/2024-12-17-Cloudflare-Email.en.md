---
title: Create New Email for each SIGN UP using Cloudflare
slug: Cloudflare-Email
date: 2024-12-17T22:15:27+08:00
author: wenhq
description: How to manage my email for each sign up using Cloudflare.
draft: false
share: true
---
Currently, almost every website provide registration services, typically using email for registration. However, the issues such as information leaks and spam. How can we ensure that each website we register with is different and also check if the registered site has any leak issues? My method is to create a new email using the domain of the site being registered, in the format of **{website domain to be registered}@{my own domain}.{domain suffix}**.

## Prepare

You need to own a domain, and the DNS for that domain must be managed by Cloudflare.

## Receiving Emails

Use Cloudflare's EMAIL feature to receive emails, with the main steps as follows:

1. Log in to Cloudflare and navigate to **Email Routing** under your domain.
2. Find the `Routing rules` tab, enable the **Catch-All** feature, and click edit.
3. Set up forwarding to send all emails to your actual email address.
    - Your actual email address is the **destination address**. You need to add this address first. For example, I use my [Foxmail](foxmail.com) account to receive all emails. When adding the destination address, you will receive a confirmation email; just click confirm. 
    - Set up `Routing rules` to create any email address with your own domain suffix. For instance, `weibo@domain.com` can be used specifically for registering on [Weibo](weibo.com). In `Custom Address` fill in `weibo`; in `Action` select `Send to an Email`; and in `Destination` choose the actual email you added in the previous step. 
    - If this custom address receives only spam, you can select `Drop` in `Action`. Emails sent to this address will be automatically discarded.

## Follow-Up Email Processing

Once configured successfully, you can receive registration confirmation emails and login codes at your destination address (actual email). Generally, you do not need to reply. However, if you want to reply to an email, how can you do it?

### Using Resend

[Resend](https://resend.com/) is an email tool designed for developers that ensures emails reach the inbox instead of the spam folder. Log in to Resend and request a new API Key under the **API Keys** tab. Then check SMTP settings for the information needed to send emails.

Add other emails in your email account and fill in Resend's SMTP service information. For Username, enter `resend`; for Password, input the obtained `API Key`.

> I have not tried this solution.

### Using EmailFlare

EmailFlare is an open-source software licensed under MIT that allows users to send emails through their own domain without registering for any services. This software supports automatic deployment via Cloudflare. 

For specific operational steps, refer to the second item in "References."

## Alternatives

If you prefer not to use Cloudflare's EMAIL feature for receiving emails, you can apply for a free enterprise WeChat account, bind it to your domain, and configure multiple email addresses. Also using Feishu (Lark) can achieve similar goals.

## References

- [https://cleanclip.cc/zh/developer/cloudflare-worker-gmail-resend-enterprise-email/](https://cleanclip.cc/zh/developer/cloudflare-worker-gmail-resend-enterprise-email/)
- [EmailFlare: Send emails from your domain through Cloudflare for free](https://www.breakp.dev/blog/email-flare-send-from-worker-for-free/)