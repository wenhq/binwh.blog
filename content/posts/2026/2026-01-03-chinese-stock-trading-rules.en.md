---
title: "Chinese A-Share Trading Rules Quick Reference"
slug: chinese-stock-trading-rules
date: 2026-01-03T10:00:00+08:00
author: wenhq
description: "Covering three core rules: odd lot trading, maximum order quantity, and margin accounts"
draft: false
share: true
---

> Covering three core rules: odd lot trading, maximum order quantity, and margin accounts


## I. 📋 Odd Lot Order Rules

Odd lots refer to scattered shares less than one board lot. Different sectors have different rules:

| Sector | Buy Rule | Sell Rule | Price Limit |
|:-------|:---------|:---------|:-----------:|
| **Shanghai/Shenzhen Main Board** | Must buy in integer multiples of **100 shares** | When holding less than 100 shares, must sell all at once | ±10% |
| **ChiNext** | Must buy in integer multiples of **100 shares** | When holding less than 100 shares, must sell all at once | ±20% |
| **STAR Market** | **Minimum 200 shares**, increment by **1 share**<br>Example: 200, 201, 250 shares, etc. | When holding less than 200 shares, must sell all at once | ±20% |
| **Beijing Stock Exchange** | **Minimum 100 shares**, increment by **1 share**<br>Example: 100, 110, 155 shares, etc. | When holding less than 100 shares, must sell all at once | ±30% |

### 📥 Buy Examples

```
✅ Shanghai/Shenzhen Main Board & ChiNext: 100, 200, 300 shares...
❌ Shanghai/Shenzhen Main Board & ChiNext: 101, 110 shares...

✅ STAR Market: 200, 201, 250 shares...
✅ Beijing Stock Exchange: 100, 110, 155 shares...
```



## II. 🔢 Maximum Order Quantity

The maximum number of shares allowed in a single order:

| Sector | Limit Order Max | Market Order Max |
|:-------|:---------------:|:----------------:|
| **Shanghai/Shenzhen Main Board** | 1 million shares | 1 million shares |
| **ChiNext** | 300,000 shares | 50,000 shares |
| **STAR Market** | 100,000 shares | 50,000 shares |
| **Beijing Stock Exchange** | 1 million shares | 1 million shares |



## III. 🏦 Margin Account Trading Rules

Margin accounts, also known as "two-financing accounts," have more granular buy/sell operations:

### 🟢 Buy Types

| Type | Description |
|:-----|:-----|
| **Margin Buy** | Borrow funds from securities company to buy target stocks |
| **Cash Buy**<br>**Collateral Buy** | Buy stocks using own funds in the margin account |

### 🔴 Sell Types

| Type | Description |
|:-----|:-----|
| **Sell to Repay** | Sell held stocks, proceeds **priority repay** account debt |
| **Cash Sell** | Sell held stocks, after debt repayment, remaining funds become available |

> **Note**: Regardless of sell type, proceeds from selling always prioritize debt repayment. Only when there's no debt do funds become available.



## 📊 Quick Comparison Summary


| Feature | Shanghai/Shenzhen Main Board | ChiNext | STAR Market | Beijing Stock Exchange |
|:--------|:----------------------------:|:-------:|:-----------:|:----------------------:|
| Minimum Buy Unit | 100 shares integer multiples | 100 shares integer multiples | 200 shares ± 1 share | 100 shares ± 1 share |
| Limit Order Max | 1 million shares | 300,000 shares | 100,000 shares | 1 million shares |
| Market Order Max | 1 million shares | 50,000 shares | 50,000 shares | 1 million shares |
| Price Limit | ±10% | ±20% | ±20% | ±30% |

Reference source: [bilibili](https://www.bilibili.com/video/BV1992oBvEJg)
