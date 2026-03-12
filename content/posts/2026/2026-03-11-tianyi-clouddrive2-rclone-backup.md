---
title: 天翼云盘 + CloudDrive2 + Rclone：打造稳定可靠的照片加密备份方案
slug: tianyi-clouddrive2-rclone-backup
date: 2026-03-11T10:00:00+08:00
author: wenhq
description: 利用天翼云盘配合 CloudDrive2 提供 WebDAV 服务，通过 Rclone 实现文件的加密同步与挂载，打造一套稳定可靠的照片备份方案
draft: false
share: true
---

> 随着照片和资料数量的增长，数据备份变得愈发重要。本文分享如何利用天翼云盘的大容量存储，配合 CloudDrive2 将其转化为 WebDAV 服务，再通过 Rclone 实现增量同步和加密备份的完整方案。

## 背景：为什么需要加密备份？

作为中国电信套餐用户，天翼云盘赠送了 **家庭共享 4TB** 空间。这么大的容量不用白不用，于是我计划用它来备份：

- **电子书**：使用 [Calibre](https://calibre-ebook.com/) 管理，多年积累的藏书
- **照片**：使用 [MTPhoto](https://github.com/mtphotos/MTPhotos) 管理，家庭照片和视频

但在实际使用中，发现天翼云盘存在**内容审查机制**：

1. **文件名敏感词检测**：文件名包含某些「敏感词」会直接拒绝上传。比如主席的著作，文件名中带有相关人名就无法上传；甚至文件名带有「黑客」等词汇，同样会被拦截。

2. **文件特征码校验**：云盘会对上传文件进行 MD5 或其他特征码计算，与黑名单比对。部分电子书即使文件名正常，也会因为内容特征码匹配而被拦截。

所以解决方案很明确：**加密后再上传**。Rclone 的 Crypt 加密模块可以实现：

- 文件名混淆 → 随机字符串，绕过敏感词检测
- 文件内容加密 → 改变文件特征码，绕过黑名单比对

加密后，云盘看到的就是一堆乱码，审查自然就失效了。这就是本方案的核心价值。

## 一、方案概述

### 1.1 为什么选择这套组合？

| 组件              | 作用   | 优势                     |
| --------------- | ---- | ---------------------- |
| **天翼云盘**        | 存储后端 | 家庭共享 4TB 空间，相当于是白送     |
| **CloudDrive2** | 协议转换 | 将云盘 API 转为标准 WebDAV 服务 |
| **Rclone**      | 同步工具 | 支持加密、分片、断点续传、多平台       |

**[CloudDrive2](https://www.clouddrive2.com/)** 是国内团队开发的一款云盘挂载工具，支持将天翼云盘、阿里云盘、百度网盘等主流网盘挂载为本地磁盘，或通过 WebDAV/SMB/NFS 协议共享。我已是终身会员，用起来很稳定。它的核心优势是**屏蔽了各云盘 API 的差异**，提供统一的文件系统接口，让 Rclone 这类标准工具可以无缝对接。

**[Rclone](https://github.com/rclone/rclone)** 是一款开源的命令行文件同步工具，被称为「云存储界的瑞士军刀」。它支持 40+ 种云存储服务，提供 sync、copy、mount 等丰富的命令，还内置了 Crypt 加密、Chunker 分片等高级功能。对于需要跨平台同步、加密备份的场景，Rclone 是目前最成熟的选择之一。

### 1.2 整体架构

```
┌─────────────────┐
│   Calibre       │  电子书库
│   MTPhoto       │  照片库
└────────┬────────┘
         │ 原始文件
         ▼
┌─────────────────┐
│    Rclone       │
│  ┌───────────┐  │
│  │   Crypt   │──┼── 文件名混淆 + 内容加密
│  └───────────┘  │
└────────┬────────┘
         │ 加密后数据
         ▼
┌─────────────────┐
│  CloudDrive2    │  WebDAV 服务
└────────┬────────┘
         │ API 调用
         ▼
┌─────────────────┐
│   天翼云盘       │  4TB 家庭共享空间
└─────────────────┘
```

**数据流向说明**：

1. **源头**：Calibre 管理的电子书、MTPhoto 管理的照片，保存在本地 NAS
2. **加密**：Rclone 的 Crypt 模块对文件名和内容进行加密，生成随机字符串
3. **协议转换**：CloudDrive2 将加密后的数据通过 WebDAV 接口暴露出来
4. **存储**：最终写入天翼云盘的家庭共享空间

**读取数据时**：

通过 `rclone mount` 命令可以将加密的远程存储挂载到 NAS 或 PC 上。挂载后，用户看到的是**解密后的原始文件名和内容**，整个过程对用户完全透明。

## 二、Rclone 配置

### 2.1 配置 WebDAV 远程存储

运行交互式配置：

```bash
rclone config --config /path/to/rclone.conf
```

配置步骤：

| 步骤 | 提示              | 输入值                    |
| ---- | ----------------- | ------------------------- |
| 1    | New remote        | `n`                       |
| 2    | name>             | `storeware`               |
| 3    | Storage>          | 输入 `webdav` 对应编号    |
| 4    | url>              | `http://NAS_IP:19798/dav` |
| 5    | vendor>           | `other`                   |
| 6    | user>             | `admin`                   |
| 7    | password          | 输入密码                  |
| 8    | Keep this remote? | `y`                       |

> 💡 **提示**：在 CloudDrive2 中添加 WebDAV 用户时，可以直接将天翼云盘的「家庭共享」目录映射到 WebDAV 服务的根目录。这样 Rclone 同步时就无需指定子目录路径，操作更简洁。

### 2.2 配置 Crypt 加密

Rclone Crypt 的工作：

- 文件名加密后变成随机字符串
- 文件内容加密，云盘无法识别文件类型和内容
- 需要时通过 Rclone 解密，对用户透明

开始配置：

```bash
rclone config --config /path/to/rclone.conf
```

| 步骤 | 提示       | 输入值                                                   |
| ---- | ---------- | -------------------------------------------------------- |
| 1    | New remote | `n`                                                      |
| 2    | name>      | `secure_backup`                                          |
| 3    | Storage>   | 输入 `crypt` 对应编号                                    |
| 4    | remote>    | `storeware:加密目录名`（如 `storeware:encrypted_books`） |
| 5    | password   | 设置加密密码（务必保存好！）                             |
| 6    | salt       | 设置盐值（可选，但推荐设置）                             |

> ⚠️ **警告**：密码丢失将无法恢复数据！建议将密码保存到密码管理器中。

### 2.3 挂载加密远程存储

配置完成后，可以挂载加密的远程存储：

```bash
rclone mount secure_backup: /mnt/encrypted \
  --config /path/to/rclone.conf \
  --vfs-cache-mode full \
  --allow-other
```

挂载后，用户看到的是**解密后的原始文件名和内容**，整个过程对用户完全透明。

## 三、文件同步命令

### 3.1 增量备份命令（推荐）

将本地照片文件夹备份到远端：

```bash
rclone sync /path/to/local/Photos/ storeware:Photos \
  --config /path/to/rclone.conf \
  --exclude-from exclude.txt \
  --delete-excluded \
  --fast-list \
  --transfers 4 \
  --checkers 4 \
  --ignore-existing \
  --timeout 5m \
  --contimeout 60s \
  --retries 5 \
  --retries-sleep 10s \
  --low-level-retries 10 \
  --check-first \
  --tpslimit 10 \
  --log-file=/path/to/rclonesync.log \
  -v
```

### 3.2 关键参数解读

| 参数                | 值  | 作用                             |
| ------------------- | --- | -------------------------------- |
| `--fast-list`       | -   | 大量小文件时减少 API 请求        |
| `--transfers`       | 4   | 并行传输数，与 `--tpslimit` 配合 |
| `--ignore-existing` | -   | 跳过目标已存在文件，增量备份必备 |
| `--check-first`     | -   | 先检查再传输，减少并发压力       |
| `--tpslimit`        | 10  | 限制每秒请求数，避免触发限流     |
| `--retries`         | 5   | 失败重试次数                     |
| `--timeout`         | 5m  | 单次操作超时时间                 |

### 3.3 输出状态解读

同步过程中的输出：

```
Checks:        38190 / 38190, 100%, Listed 151866
Transferred:   1241 / 21532, 6%
Errors:        15 (retrying may help)
```

| 字段            | 含义                                            |
| --------------- | ----------------------------------------------- |
| **Checks**      | 比对检查的文件数                                |
| **Transferred** | 实际传输的文件数                                |
| **Listed**      | 扫描列出的总文件数（源+目标）                   |
| **Errors**      | 错误数，`(no need to retry)` 表示跳过非传输错误 |

## 四、文件挂载

### 4.1 群晖挂载准备

群晖没有 fusermount3 命令，需要创建符号链接：

```bash
sudo ln -sf /bin/fusermount /usr/local/bin/fusermount3
```

### 4.2 开机自启动

创建 systemd 服务：

```bash
sudo vim /etc/systemd/system/rclone-photos.service
```

```ini
[Unit]
Description=Rclone Mount Photos
After=network-online.target
Wants=network-online.target

[Service]
Type=forking
ExecStart=/usr/local/bin/rclone mount storeware:Photos /mnt/photos \
    --config=/path/to/rclone.conf \
    --vfs-cache-mode full \
    --vfs-cache-max-size 50G \
    --allow-other \
    --daemon
ExecStop=/bin/fusermount -uz /mnt/photos
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

启用服务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable rclone-photos
sudo systemctl start rclone-photos
```

## 五、总结

通过天翼云盘 + CloudDrive2 + Rclone 的组合，我们实现了：

1. **大容量低成本存储**：利用天翼云盘的家庭会员空间
2. **标准化访问协议**：CloudDrive2（或 [Alist](https://github.com/alist-org/alist)、[OpenList](https://github.com/OpenListPlayer/OpenList) 等类似服务）提供 WebDAV 接口
3. **稳定可靠同步**：[Rclone](https://github.com/rclone/rclone) 的重试、超时、限流机制
4. **数据安全保护**：支持加密、分片、备份目录

这套方案特别适合：

- 大量照片/视频的增量备份
- 需要跨平台访问的文件共享
- 对数据安全性有要求的个人用户

希望本文对你搭建自己的云备份方案有所帮助！
