---
title: "Practical Guide: NAS NFS Mount and Docker Root Directory Migration"
slug: nas-nfs-docker-migration
date: 2025-12-25T10:00:00+08:00
author: binwh
description: A complete guide to extending Ubuntu client storage using Synology NAS NFS shared storage and migrating Docker data directory to NFS mount point
draft: false
share: true
---
> When using Docker containers, as the number of containers and images grows, the default Docker storage path (usually `/var/lib/docker`) may fill up the system disk, affecting normal server operation. This article introduces how to expand storage space through Synology NAS's NFS service and migrate the Docker data directory to a new location.

## Scenario Description

**Problem Background:**
- Ubuntu server system disk space is insufficient
- Docker containers and images take up a large amount of storage space
- Synology NAS is available and you want to utilize its storage capacity

**Solution:**
1. Configure NFS service on Synology NAS
2. Mount NFS shared directory on Ubuntu client
3. Migrate Docker data directory to NFS mount point

## 1. Synology NAS Setup

### 1.1 Enable NFS Service

First, access the NAS management interface and open **Control Panel**:

1. In Control Panel, find the **File Services** feature
2. Enter File Services settings and switch to the **SMB/AFP/NFS** tab
3. Scroll to the bottom to find the **NFS** settings section
4. Check the **Enable NFS service** checkbox

### 1.2 Configure Shared Folder Permissions

Next, set permissions for the folder to be shared:

1. Return to **Control Panel** and click to enter **Shared Folder**
2. Select the target folder to mount (e.g., `docker`)
3. Click the **Edit** button on the toolbar
4. In the edit window, select the **NFS Permissions** tab at the top
5. Click **Add** and configure NFS permissions:

```
Client IP: 192.168.2.81 (or use IP segment like 192.168.2.0/24)
Privilege: Read/Write
Async: Check (improve performance)
```

## 2. Ubuntu Client Configuration

### 2.1 Install NFS Client

```bash
sudo apt update
sudo apt install nfs-common
```

### 2.2 Verify NFS Share

Use the `showmount` command to view the exports list from the NAS:

```bash
showmount -e 192.168.2.90
```

Example output:

```
Export list for 192.168.2.90:
/volume2/docker 192.168.2.81
```

### 2.3 Create Mount Point

```bash
# Create mount directory
sudo mkdir /opt/docker

# Set directory owner to current user
sudo chown ser9 /opt/docker
```

### 2.4 Manual NFS Mount

```bash
sudo mount -t nfs 192.168.2.90:/volume2/docker /opt/docker/
```

**Mount command format:**
```bash
mount -t nfs [NAS IP Address]:[Shared Folder Path] [Local Mount Point]
```

### 2.5 Verify Mount

```bash
# Method 1: Check disk usage
df -h

# Method 2: View NFS mounts
mount | grep nfs
```

### 2.6 Configure Auto-Mount on Boot

Edit `/etc/fstab` file to enable automatic mounting on boot:

```bash
sudo vim /etc/fstab
```

Add the following line:

```
192.168.2.90:/volume2/docker  /opt/docker    nfs     defaults        0       0
```

**fstab field descriptions:**
| Field | Value | Description |
|-------|-------|-------------|
| 1st | `192.168.2.90:/volume2/docker` | NFS server address and shared path |
| 2nd | `/opt/docker` | Local mount point |
| 3rd | `nfs` | File system type |
| 4th | `defaults` | Mount options (includes rw, suid, dev, exec, auto, nouser, async) |
| 5th | `0` | Whether to dump backup (0 means no backup) |
| 6th | `0` | FSCK order on boot (0 means no check) |

Test the configuration:

```bash
# Unmount current mount
sudo umount /opt/docker

# Remount (using fstab configuration)
sudo mount -a

# Verify
df -h
```

## 3. Docker Installation and Configuration

### 3.1 Install Docker

Refer to the [Official Docker Documentation](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository) for installation:

```bash
# 1. Update package index
sudo apt update

# 2. Install necessary dependencies
sudo apt install ca-certificates curl

# 3. Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# 4. Add Docker repository to Apt sources
sudo tee /etc/apt/sources.list.d/docker.sources <<EOF
Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}")
Components: stable
Signed-By: /etc/apt/keyrings/docker.asc
EOF

# 5. Update package index
sudo apt update

# 6. Install Docker and related components
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 7. Verify Docker status
sudo systemctl status docker
```

### 3.2 Check Current Docker Storage Path

```bash
sudo docker info | grep "Docker Root Dir"
```

Default output: `Docker Root Dir: /var/lib/docker`

## 4. Migrate Docker Data Directory

### 4.1 Stop Docker Service

```bash
sudo systemctl stop docker
```

### 4.2 Create Docker Data Directory on NFS Mount

```bash
# Create Docker configuration and data directory on NFS mount
mkdir -p /opt/docker/.docker

# Verify path
cd /opt/docker/.docker
pwd
```

Expected output: `/opt/docker/.docker`

### 4.3 Configure New Docker Storage Path

Create or edit the Docker configuration file:

```bash
sudo vim /etc/docker/daemon.json
```

Add the following content:

```json
{
  "data-root": "/opt/docker/.docker"
}
```

**Configuration notes:**
- `data-root`: Specifies the storage root directory for Docker containers, images, volumes, and other data
- Starting from Docker 20.10, `data-root` is recommended over the legacy `graph` option

### 4.4 Migrate Existing Data (Optional)

If you have existing Docker data that needs to be migrated:

```bash
# Sync old data to new location
sudo rsync -aP /var/lib/docker/ /opt/docker/.docker/

# Delete old data after confirmation (use caution)
# sudo rm -rf /var/lib/docker
```

### 4.5 Restart Docker Service

```bash
sudo systemctl start docker
```

### 4.6 Verify Configuration

```bash
# Check new storage path
sudo docker info | grep "Docker Root Dir"
```

Output should now show: `Docker Root Dir: /opt/docker/.docker`

## 5. Important Notes

### 5.1 NFS Performance Considerations

- **Network Latency**: NFS mounting depends on network, ensure stable connection between NAS and client
- **Async Writes**: Enabling async option improves performance but may increase risk of data loss during power failure
- **MTU Settings**: Consider enabling Jumbo Frames for better transfer efficiency if network devices support it

### 5.2 Security Recommendations

- Use firewall to restrict access to NFS port (TCP 2049)
- Only authorize necessary IP addresses or subnets in NFS permissions
- Regularly backup important data

### 5.3 Troubleshooting

```bash
# Check NFS mount status
mount | grep nfs

# View Docker service logs
sudo journalctl -u docker -f

# Test NFS connectivity
rpcinfo -p 192.168.2.90
```

## 6. Summary

Through the above steps, we have successfully achieved:

1. Configured NFS service on Synology NAS and set up shared folder permissions
2. Installed NFS client on Ubuntu and mounted remote shared directory
3. Installed Docker and migrated data directory to NFS mount point

The advantages of this solution include:

- Expanded effective server storage space
- Centralized Docker data management for easy backup and maintenance
- No need to reinstall the system or add physical hard drives

Hope this guide helps those facing similar storage challenges!
