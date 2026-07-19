---
title: OmniRoute Self-Host AI Gateway for Free Models
slug: omniroute-docker-gateway
date: 2026-06-18T15:28:43+08:00
author: binwh
description: OmniRoute is an open-source AI routing gateway supporting 160+ providers (50+ free), with a single endpoint for Claude Code, Cursor, Cline, Copilot and more. This tutorial covers the complete VPS Docker deployment, including Docker Compose configuration, Cloudflare Tunnel / SSH tunnel setup, Dashboard Combo auto-fallback configuration, and free AI model recommendations.
draft: false
share: true
---

> A month ago, Zhipu AI banned my account for "multi-user usage behavior," and my appeal was rejected.
>
> I had been using one Zhipu Plan to provide a unified API Key across my home, office, and multiple VPS instances for various Code and Agent tools — nothing heavy. After the ban, I spent a month searching for free models and found quite a few, but frequently switching between them with cc-switch was a hassle.
>
> Then I discovered **OmniRoute** — a unified AI gateway where all traffic exits from a single VPS IP, so there's only one traffic source. This eliminates the "multi-user sharing" risk flag while aggregating 50+ free models for better reliability. This article documents my complete deployment and usage workflow, and also serves as a way to protect my reinstated Zhipu Plan from triggering another ban.

<!-- more -->

## 1. What is OmniRoute

[OmniRoute](https://github.com/diegosouzapw/OmniRoute) is an open-source AI routing gateway that runs locally (or on a VPS), supporting **160+ providers (50+ free)**.

The core idea is simple: **one endpoint aggregates all providers, all AI coding tools point to it, and all traffic goes through a single IP**.

- **One endpoint**: `localhost:20128` (Anthropic/Claude Code) or `localhost:20128/v1` (OpenAI-compatible tools), chosen based on the client protocol
- **Auto fallback**: Automatically switches to the next provider when the primary one is rate-limited — zero downtime
- **Token compression**: RTK + Caveman dual compression, saving 15–95% of tokens
- **Dashboard management**: GUI for adding providers, creating Combos, and monitoring usage

Configure once, and all your tools share one endpoint. OmniRoute automatically selects the best provider for you in the background.

---

## 2. VPS Deployment

### 2.1 Configuration

Create the deployment directory on your VPS:

```bash
mkdir -p /opt/omniroute && cd /opt/omniroute
```

Create `docker-compose.yml`:

```yaml
services:

  omniroute:
    image: diegosouzapw/omniroute:latest
    container_name: omniroute
    restart: unless-stopped
    stop_grace_period: 40s          # Give SQLite enough time to flush
    ports:
      - "20128:20128"                # Exposed port
    volumes:
      - ./data:/app/data            # Persistent data
    env_file:
      - .env
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      redis:
        condition: service_healthy

  redis:
    image: docker.io/valkey/valkey:8.0.1-alpine
    container_name: omniroute-redis
    restart: unless-stopped
    command: "valkey-server --save 30 1"
    volumes:
      - ./redis:/data
    healthcheck:
      test: ["CMD", "valkey-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

networks:
  default:
    external: true
    name: shared
```

> **About Docker networking**: The `docker-compose.yml` above uses a `shared` external network. Run `docker network create shared` first. If you don't want an extra network, remove the `networks` section — both containers will default to the same `omniroute_default` network. Functionality is unaffected; other projects will just create their own `xxx_default` networks.

Create the `.env` file:

```bash
# WebSocket secret (required, generate with the command below)
OMNIROUTE_WS_BRIDGE_SECRET=your-random-string

# Initial admin password (used on first login)
OMNIROUTE_SETUP_PASSWORD=your-admin-password

# Node.js memory limit (512MB is plenty for a gateway)
OMNIROUTE_MEMORY_MB=512
```

Generate a random secret:

```bash
openssl rand -hex 32
# Output looks like: a3b8c9... Copy this to .env's OMNIROUTE_WS_BRIDGE_SECRET
```

Initialize data directory permissions:

```bash
mkdir -p ./data ./redis
chmod 777 ./redis
chmod 600 .env
```

The `.env` file contains secrets and the initial password — set `600` permissions to prevent other users from reading it.

### 2.2 Start the Service

```bash
sudo docker compose up -d

# Check logs to confirm successful startup
sudo docker compose logs -f
```

You should see the following output on success:

```
▲ Next.js 16.2.7
- Local:         http://localhost:20128
- Network:       http://0.0.0.0:20128
✓ Ready in 0ms
[DB] SQLite database ready: /app/data/storage.sqlite
```

## 3. Access Methods

There are three ways to connect your local tools to OmniRoute on the VPS — pick one that suits your setup.

> **Note**: Regardless of which method you choose, set the admin password (`OMNIROUTE_SETUP_PASSWORD`) immediately after first accessing the Dashboard. Without it, the Dashboard has no authentication.

**Option A: Cloudflare Tunnel (with a domain)**

In the Cloudflare dashboard, go to Zero Trust → Tunnels, create a tunnel, and add a route rule `/*` → `http://localhost:20128`. No need to open extra ports on the VPS — HTTPS is automatic. You can also run cloudflared via Docker:

```bash
docker run -d --name cloudflared --restart unless-stopped \
  -v /opt/cloudflared:/home/nonroot/.cloudflared \
  cloudflare/cloudflared:latest \
  tunnel --no-autoupdate run --token YOUR_TOKEN_HERE
```

**Option B: SSH Local Port Forwarding (no domain)**

An SSH tunnel maps the VPS's port 20128 to your local machine. Use a non-default local port to avoid conflicts:

```bash
ssh -p 22 -f -N -L 12012:localhost:20128 user@vps-ip
```

Configure your local tools to use `http://localhost:12012`.

**Option C: Direct VPS Connection**

Open port 20128 in your VPS firewall, then access `http://VPS-IP:20128` directly.

---

## 4. Dashboard Configuration

Whichever method you chose, open your browser and access OmniRoute:

| Method             | Access URL                      |
| ----------------- | ------------------------ |
| Cloudflare Tunnel | `https://your-domain.com`   |
| SSH Tunnel        | `http://localhost:12012` |
| Direct VPS        | `http://VPS-IP:20128`    |

### 4.1 Connect Free Providers

Go to Dashboard → **Providers** → **+ Add Provider**.

OmniRoute includes many free providers that require no registration and no API key. The exact list and quotas change with each update, so check the **Providers** page in the Dashboard for current free options.

> **Note**: Free provider quotas and availability change frequently. Confirm the current status in the Dashboard before adding. Some providers may adjust their free quotas or switch to paid at any time.

### 4.2 Create a Combo

Go to Dashboard → **Combos** → **+ New Combo** to set up a fallback chain:

Combine multiple providers into one Combo with a **Priority** strategy. Arrange the node order by preference — primary providers first, backup providers last.

Once created, your API requests will be automatically routed in order — when the primary provider is busy, it seamlessly switches to the next one, completely transparent.

### 4.3 Generate an API Key

Go to Dashboard → **Endpoints** → **Create API Key**:

```
Copy the generated Key (looks like sk-xxxxxxxx)
→ This Key will be used in all AI tool configurations
```

---

## 5. Usage Summary

I ultimately went with a **Free Plan + Paid Plan + Free Provider Fallback** strategy:

- **Free Plan**: Access various free models through OmniRoute to cover lightweight tasks
- **Paid Plan**: A paid subscription ensures stability and capability ceiling for core Agent and coding tasks
- **Fallback**: OmniRoute's aggregated free providers automatically kick in when the primary is unavailable, ensuring your Agent never goes down

The beauty of this layered strategy: you get the stability and capability ceiling of paid models without downtime from quota exhaustion or service interruptions.

### Recommended: Step Plan (Free)

Step Plan is an all-in-one capability subscription from StepFun designed for Agent and Coding scenarios, offering standardized APIs, multi-model intelligent routing, and ready-to-use multimodal capabilities to help developers quickly build, run, and optimize intelligent workflows.

It's compatible with mainstream Agent frameworks and coding tools — no complex setup needed. Through intelligent routing, high-frequency lightweight tasks are handled efficiently by Flash models, while complex reasoning and critical decisions are handled precisely by Pro models. It's especially suited for long-chain Agents, code development, multi-step operations, and research pipelines.

Step Plan also integrates multimodal capabilities including TTS, ASR, and image processing, supporting text, voice, and visual input/output scenarios. With an on-demand, pay-as-you-go model, the system dynamically balances performance and cost, meeting needs from individual developers to team-level applications.

👉 Sign up here: [https://platform.stepfun.com?invite_code=NEWMHCBR](https://platform.stepfun.com?invite_code=NEWMHCBR)

### Recommended: Zhipu Coding Plan (Paid)

Top-tier coding model in China, compatible with 20+ mainstream tools, excellent value for money. Ideal for users who need higher stability and coding capability.

🙋 Looking for teammates to share a Zhipu Coding Plan! 👉 Join "Pin Hao Mo": [https://www.bigmodel.cn/glm-coding?ic=XIUSJ4VJHF](https://www.bigmodel.cn/glm-coding?ic=XIUSJ4VJHF)
