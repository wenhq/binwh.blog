---
title: "Tianyi CloudDrive + CloudDrive2 + Rclone: A Stable and Reliable Photo Encryption Backup Solution"
slug: tianyi-clouddrive2-rclone-backup
date: 2026-03-11T10:00:00+08:00
author: wenhq
description: Leveraging Tianyi CloudDrive's large storage with CloudDrive2 to provide WebDAV service, and using Rclone for incremental sync and encrypted backup
draft: false
share: true
---

> As photos and data grow, backup becomes increasingly important. This article shares how to leverage Tianyi CloudDrive's large storage capacity, convert it to a WebDAV service using CloudDrive2, and achieve incremental sync and encrypted backup with Rclone.

## Background: Why Encrypted Backup?

As a China Telecom subscriber, 189 CloudDrive offers **4TB Family Shared** space for free. With such generous capacity, I decided to use it for backing up:

- **E-books**: Managed by [Calibre](https://calibre-ebook.com/), years of collected books
- **Photos**: Managed by [MTPhoto](https://github.com/mtphotos/MTPhotos), family photos and videos

However, in practice, I discovered that Tianyi CloudDrive has a **content censorship mechanism**:

1. **Filename sensitive word detection**: Files with certain "sensitive words" in the filename are rejected during upload. For example, works with certain political figures' names in the filename cannot be uploaded; even filenames containing words like "hacker" get blocked.

2. **File hash verification**: The cloud drive calculates MD5 or other hashes of uploaded files and compares them against a blacklist. Some e-books with normal filenames are still blocked due to content hash matching.

So the solution is clear: **encrypt before uploading**. Rclone's Crypt encryption module can achieve:

- Filename obfuscation → random strings, bypassing sensitive word detection
- Content encryption → changing file hash, bypassing blacklist comparison

Once encrypted, the cloud drive sees only garbled data, rendering censorship ineffective. This is the core value of this solution.

## 1. Solution Overview

### 1.1 Why This Combination?

| Component | Role | Advantage |
| --- | --- | --- |
| **Tianyi CloudDrive** | Storage backend | 4TB Family Shared space, essentially free |
| **CloudDrive2** | Protocol conversion | Converts cloud drive API to standard WebDAV service |
| **Rclone** | Sync tool | Supports encryption, chunking, resume, cross-platform |

**[CloudDrive2](https://www.clouddrive2.com/)** is a cloud drive mounting tool developed by a Chinese team. It supports mounting Tianyi CloudDrive, Aliyun Drive, Baidu Netdisk and other mainstream cloud drives as local disks, or sharing via WebDAV/SMB/NFS protocols. I'm a lifetime member and it's been very stable. Its core advantage is **abstracting away the differences between various cloud drive APIs**, providing a unified filesystem interface that allows standard tools like Rclone to integrate seamlessly.

**[Rclone](https://github.com/rclone/rclone)** is an open-source command-line file sync tool, known as the "Swiss Army Knife of cloud storage". It supports 40+ cloud storage services, provides rich commands like sync, copy, mount, and includes advanced features like Crypt encryption and Chunker chunking. For cross-platform sync and encrypted backup scenarios, Rclone is one of the most mature solutions available.

### 1.2 Overall Architecture

```
┌─────────────────┐
│   Calibre       │  E-book library
│   MTPhoto       │  Photo library
└────────┬────────┘
         │ Original files
         ▼
┌─────────────────┐
│    Rclone       │
│  ┌───────────┐  │
│  │   Crypt   │──┼── Filename obfuscation + Content encryption
│  └───────────┘  │
└────────┬────────┘
         │ Encrypted data
         ▼
┌─────────────────┐
│  CloudDrive2    │  WebDAV service
└────────┬────────┘
         │ API calls
         ▼
┌─────────────────┐
│   Tianyi Cloud  │  4TB Family Shared space
└─────────────────┘
```

**Data Flow**:

1. **Source**: E-books managed by Calibre, photos managed by MTPhoto, stored on local NAS
2. **Encryption**: Rclone's Crypt module encrypts filenames and content, generating random strings
3. **Protocol Conversion**: CloudDrive2 exposes encrypted data via WebDAV interface
4. **Storage**: Finally written to Tianyi CloudDrive's Family Shared space

**Reading Data**:

Using the `rclone mount` command, encrypted remote storage can be mounted to NAS or PC. Once mounted, users see **decrypted original filenames and content**, the entire process is transparent to the user.

## 2. Rclone Configuration

### 2.1 Configure WebDAV Remote Storage

Run interactive configuration:

```bash
rclone config --config /path/to/rclone.conf
```

Configuration steps:

| Step | Prompt | Input |
| ---- | ------ | ----- |
| 1 | New remote | `n` |
| 2 | name> | `storeware` |
| 3 | Storage> | Enter the number for `webdav` |
| 4 | url> | `http://NAS_IP:19798/dav` |
| 5 | vendor> | `other` |
| 6 | user> | `admin` |
| 7 | password | Enter password |
| 8 | Keep this remote? | `y` |

> 💡 **Tip**: When adding a WebDAV user in CloudDrive2, you can directly map Tianyi CloudDrive's "Family Shared" directory to the WebDAV service root. This way, Rclone sync doesn't need to specify a subdirectory path, making operations simpler.

### 2.2 Configure Crypt Encryption

Rclone Crypt features:

- Filenames become random strings after encryption
- File content is encrypted, cloud drive cannot identify file type or content
- Decryption via Rclone when needed, transparent to user

Start configuration:

```bash
rclone config --config /path/to/rclone.conf
```

| Step | Prompt | Input |
| ---- | ------ | ----- |
| 1 | New remote | `n` |
| 2 | name> | `secure_backup` |
| 3 | Storage> | Enter the number for `crypt` |
| 4 | remote> | `storeware:encrypted_dir` (e.g., `storeware:encrypted_books`) |
| 5 | password | Set encryption password (save it securely!) |
| 6 | salt | Set salt value (optional but recommended) |

> ⚠️ **Warning**: Lost password means unrecoverable data! Save your password in a password manager.

### 2.3 Mount Encrypted Remote Storage

After configuration, you can mount the encrypted remote storage:

```bash
rclone mount secure_backup: /mnt/encrypted \
  --config /path/to/rclone.conf \
  --vfs-cache-mode full \
  --allow-other
```

After mounting, users see **decrypted original filenames and content**, the entire process is transparent.

## 3. File Sync Commands

### 3.1 Incremental Backup Command (Recommended)

Backup local photo folder to remote:

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

### 3.2 Key Parameters Explained

| Parameter | Value | Purpose |
| --- | --- | --- |
| `--fast-list` | - | Reduce API requests for many small files |
| `--transfers` | 4 | Parallel transfers, works with `--tpslimit` |
| `--ignore-existing` | - | Skip existing files on destination, essential for incremental backup |
| `--check-first` | - | Check before transfer, reduce concurrent pressure |
| `--tpslimit` | 10 | Limit requests per second, avoid rate limiting |
| `--retries` | 5 | Retry count on failure |
| `--timeout` | 5m | Single operation timeout |

### 3.3 Output Status Explained

Output during sync:

```
Checks:        38190 / 38190, 100%, Listed 151866
Transferred:   1241 / 21532, 6%
Errors:        15 (retrying may help)
```

| Field | Meaning |
| --- | --- |
| **Checks** | Number of files compared |
| **Transferred** | Number of files actually transferred |
| **Listed** | Total files scanned (source + destination) |
| **Errors** | Error count, `(no need to retry)` means skipped non-transfer errors |

## 4. File Mounting

### 4.1 Synology Mount Preparation

Synology doesn't have the fusermount3 command, create a symbolic link:

```bash
sudo ln -sf /bin/fusermount /usr/local/bin/fusermount3
```

### 4.2 Auto-start on Boot

Create a systemd service:

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

Enable the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable rclone-photos
sudo systemctl start rclone-photos
```

## 5. Summary

Through the combination of Tianyi CloudDrive + CloudDrive2 + Rclone, we achieved:

1. **Large capacity, low-cost storage**: Utilizing Tianyi CloudDrive's Family Member space
2. **Standardized access protocol**: CloudDrive2 (or [Alist](https://github.com/alist-org/alist), [OpenList](https://github.com/OpenListPlayer/OpenList) and similar services) provides WebDAV interface
3. **Stable and reliable sync**: [Rclone](https://github.com/rclone/rclone)'s retry, timeout, and rate limiting mechanisms
4. **Data security protection**: Supports encryption, chunking, backup directories

This solution is particularly suitable for:

- Incremental backup of large amounts of photos/videos
- File sharing requiring cross-platform access
- Individual users with data security requirements

Hope this article helps you build your own cloud backup solution!