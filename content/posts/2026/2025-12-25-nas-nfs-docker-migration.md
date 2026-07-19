---
title: NAS NFS 挂载与 Docker 根目录迁移实战指南
slug: nas-nfs-docker-migration
date: 2025-12-25T10:00:00+08:00
author: binwh
description: 使用群晖 NAS NFS 共享存储扩展 Ubuntu 客户端空间，并将 Docker 数据目录迁移到 NFS 挂载点的完整实战指南
draft: false
share: true
---
> 在实际使用 Docker 容器的过程中，随着容器和镜像数量的增加，默认的 Docker 存储路径（通常是 `/var/lib/docker`）可能会占满系统盘，影响服务器正常运行。本文介绍如何通过群晖 NAS 的 NFS 服务扩展存储空间，并将 Docker 数据目录迁移到新的存储位置。

## 场景说明

**问题背景：**
- Ubuntu 服务器系统盘空间不足
- Docker 容器和镜像占用大量存储空间
- 手头有群晖 NAS 可用，希望利用其存储容量

**解决方案：**
1. 在群晖 NAS 上配置 NFS 服务
2. 在 Ubuntu 客户端挂载 NFS 共享目录
3. 迁移 Docker 数据目录到 NFS 挂载点

## 一、群晖 NAS 设置

### 1.1 启用 NFS 服务

首先进入 NAS 管理界面，打开 **控制面板**：

1. 在控制面板中找到 **文件服务** 功能
2. 进入文件服务设置，切换到 **SMB/AFP/NFS** 标签页
3. 滚动到最下方找到 **NFS** 设置区域
4. 勾选 **启用 NFS 服务** 复选框

### 1.2 配置共享文件夹权限

接下来设置要共享的文件夹权限：

1. 返回 **控制面板**，点击进入 **共享文件夹**
2. 选择要挂载的目标文件夹（如 `docker`）
3. 点击工具栏的 **编辑** 按钮
4. 在编辑窗口顶部选择 **NFS 权限** 标签页
5. 点击 **新增** 按钮，配置 NFS 权限：

```
客户端 IP：192.168.2.81（或使用 IP 段如 192.168.2.0/24）
权限：读写
异步：勾选（提升性能）
```

## 二、Ubuntu 客户端配置

### 2.1 安装 NFS 客户端

```bash
sudo apt update
sudo apt install nfs-common
```

### 2.2 验证 NFS 共享

使用 `showmount` 命令查看 NAS 导出的共享列表：

```bash
showmount -e 192.168.2.90
```

输出示例：

```
Export list for 192.168.2.90:
/volume2/docker 192.168.2.81
```

### 2.3 创建挂载点

```bash
# 创建挂载目录
sudo mkdir /opt/docker

# 设置目录所有者为当前用户
sudo chown ser9 /opt/docker
```

### 2.4 手动挂载 NFS

```bash
sudo mount -t nfs 192.168.2.90:/volume2/docker /opt/docker/
```

**挂载命令格式：**
```bash
mount -t nfs [NAS IP 地址]:[共享文件夹路径] [本地挂载点]
```

### 2.5 验证挂载

```bash
# 方法1：查看磁盘使用情况
df -h

# 方法2：查看 NFS 挂载
mount | grep nfs
```

### 2.6 设置开机自动挂载

编辑 `/etc/fstab` 文件实现开机自动挂载：

```bash
sudo vim /etc/fstab
```

添加以下内容：

```
192.168.2.90:/volume2/docker  /opt/docker    nfs     defaults        0       0
```

**fstab 字段说明：**
| 字段 | 值 | 说明 |
|------|-----|------|
| 第1字段 | `192.168.2.90:/volume2/docker` | NFS 服务器地址和共享路径 |
| 第2字段 | `/opt/docker` | 本地挂载点 |
| 第3字段 | `nfs` | 文件系统类型 |
| 第4字段 | `defaults` | 挂载选项（包含 rw, suid, dev, exec, auto, nouser, async） |
| 第5字段 | `0` | 是否被 dump 备份（0 表示不备份） |
| 第6字段 | `0` | 开机自检顺序（0 表示不自检） |

测试配置是否正确：

```bash
# 卸载当前挂载
sudo umount /opt/docker

# 重新挂载（使用 fstab 配置）
sudo mount -a

# 验证
df -h
```

## 三、Docker 安装与配置

### 3.1 安装 Docker

参考 [Docker 官方文档](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository) 进行安装：

```bash
# 1. 更新包索引
sudo apt update

# 2. 安装必要的依赖
sudo apt install ca-certificates curl

# 3. 添加 Docker 的官方 GPG 密钥
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# 4. 添加 Docker 仓库到 Apt 源
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF

# 5. 更新包索引
sudo apt update

# 6. 安装 Docker 及相关组件
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 7. 验证 Docker 状态
sudo systemctl status docker
```

### 3.2 查看当前 Docker 存储路径

```bash
sudo docker info | grep "Docker Root Dir"
```

默认输出：`Docker Root Dir: /var/lib/docker`

## 四、迁移 Docker 数据目录

### 4.1 停止 Docker 服务

```bash
sudo systemctl stop docker
```

### 4.2 在 NFS 挂载点创建 Docker 数据目录

```bash
# 在 NFS 挂载点创建 Docker 配置和数据目录
mkdir -p /opt/docker/.docker

# 验证路径
cd /opt/docker/.docker
pwd
```

预期输出：`/opt/docker/.docker`

### 4.3 配置 Docker 新的存储路径

创建或编辑 Docker 配置文件：

```bash
sudo vim /etc/docker/daemon.json
```

添加以下内容：

```json
{
  "data-root": "/opt/docker/.docker"
}
```

**配置说明：**
- `data-root`：指定 Docker 容器、镜像、卷等数据的存储根目录
- 从 Docker 20.10 版本开始，推荐使用 `data-root` 而非旧的 `graph` 选项

### 4.4 迁移现有数据（可选）

如果之前有 Docker 数据需要迁移：

```bash
# 同步旧数据到新位置
sudo rsync -aP /var/lib/docker/ /opt/docker/.docker/

# 确认无误后删除旧数据（谨慎操作）
# sudo rm -rf /var/lib/docker
```

### 4.5 重启 Docker 服务

```bash
sudo systemctl start docker
```

### 4.6 验证配置

```bash
# 检查新的存储路径
sudo docker info | grep "Docker Root Dir"
```

输出应该变为：`Docker Root Dir: /opt/docker/.docker`

## 五、注意事项

### 5.1 NFS 性能考虑

- **网络延迟**：NFS 挂载依赖网络，确保 NAS 与客户端之间的网络稳定
- **异步写入**：启用异步选项可提升性能，但可能增加断电时的数据丢失风险
- **MTU 设置**：在网络设备支持的情况下，可考虑启用 Jumbo Frame 提升传输效率

### 5.2 安全建议

- 使用防火墙限制 NFS 端口（TCP 2049）的访问
- 在 NFS 权限中仅授权必要的 IP 地址或网段
- 定期备份重要数据

### 5.3 故障排查

```bash
# 查看 NFS 挂载状态
mount | grep nfs

# 查看 Docker 服务日志
sudo journalctl -u docker -f

# 测试 NFS 连通性
rpcinfo -p 192.168.2.90
```

## 六、总结

通过以上步骤，我们成功实现了：

1. 在群晖 NAS 上配置 NFS 服务并设置共享文件夹权限
2. 在 Ubuntu 客户端安装 NFS 客户端并挂载远程共享目录
3. 安装 Docker 并将数据目录迁移到 NFS 挂载点

这种方案的优势在于：

- 扩展了服务器的有效存储空间
- 集中管理 Docker 数据，便于备份和维护
- 不需要重新安装系统或增加物理硬盘

希望本文对遇到类似存储问题的朋友有所帮助！
