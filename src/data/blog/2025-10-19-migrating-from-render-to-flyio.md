---
title: "Migrating from Render to Fly.io: 4x More RAM, Lower Cost"
pubDatetime: 2025-10-19T20:00:00.000Z
modDatetime: 2025-10-19T20:12:44.329Z
slug: migrating-from-render-to-flyio
featured: true
draft: false
tags:
    - DevOps
    - Infrastructure
    - Go
    - Fly.io
    - Migration
    - Performance
    - Cost Optimization
description: |
    A complete walkthrough of migrating the Image Optimizer API from Render to Fly.io, achieving 4x memory increase (512MB → 2GB) at a lower cost while solving memory limit issues with large image processing.
---

> **TL;DR**: Migrated [Image Optimizer API](https://api.sosquishy.io) from Render to Fly.io to solve memory limitations. Got 4x more RAM (512MB → 2GB) while reducing monthly costs by $17. The API was hitting memory limits on Render with large spritesheet files, making the migration essential.

## Why Migrate?

The Image Optimizer API was running on Render with **512MB RAM**, and I was hitting hard limits.

Processing large spritesheets (5-8MB files) with libvips requires significant memory, especially when:

- Decompressing PNG files
- Running deduplication algorithms on 200+ frames
- Packing multiple atlas sheets
- Optimizing with oxipng

**The problem:** Large files were failing or running dangerously close to the 512MB limit. The 7.8MB Convict spritesheet with 202 frames was consistently pushing memory usage to the edge.

**The options:**

1. Upgrade to Render's Standard tier: **$25/month** for 2GB
2. Find a cheaper alternative with more memory

Enter **Fly.io**. Their pricing for 2GB RAM was **~$8/month** — a third of Render's cost for the same resources.

Since the API wasn't officially launched yet, downtime wasn't a concern. This was the perfect time to migrate.

## The Economics

**Render pricing:**

- 512MB (current): $7-15/month
- 2GB (needed): $25/month

**Fly.io pricing:**

- 2GB: ~$8/month
- 1GB persistent volume: $0.15/month
- Total: ~$8.15/month

**Savings: ~$17/month** (~$200/year) while getting 4x the memory.

The decision was obvious.

## The Migration

### 1. Installing Fly CLI

```bash
brew install flyctl
flyctl auth login
```

### 2. Initializing the App

```bash
cd /path/to/image-optimizer/api
flyctl launch --no-deploy
```

This scanned my `Dockerfile` and generated a `fly.toml` config.

**Configuration choices:**

- App name: `image-optimizer`
- Region: `iad` (US East)
- PostgreSQL: No (using SQLite)
- Redis: No
- Deploy now: No (wanted to configure first)

### 3. Creating Persistent Volume

Since the API uses SQLite for API key storage, I needed a persistent volume:

```bash
flyctl volumes create image_optimizer_data \
  --region iad \
  --size 1
```

The volume must be in the same region as the app. This creates a 1GB volume that persists across deployments.

### 4. Configuring fly.toml

```toml
app = 'image-optimizer'
primary_region = 'iad'

[build]
  dockerfile = 'Dockerfile'

[env]
  PORT = '8080'

# Persistent volume for SQLite
[[mounts]]
  source = 'image_optimizer_data'
  destination = '/app/data'
  initial_size = '1gb'

# HTTP service configuration
[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = 'off'
  auto_start_machines = true
  min_machines_running = 1

# Health checks
[[services.http_checks]]
  interval = '30s'
  timeout = '5s'
  grace_period = '10s'
  method = 'GET'
  path = '/health'
  protocol = 'http'

# VM resources
[[vm]]
  cpu_kind = 'shared'
  cpus = 1
  memory_mb = 2048  # 2GB RAM
```

**Critical settings:**

- `memory_mb = 2048` — 2GB RAM (4x more than Render's 512MB)
- `auto_stop_machines = 'off'` — Keep running 24/7
- Health checks point to `/health` endpoint

### 5. Setting Environment Variables

Fly.io uses encrypted "secrets" for environment variables:

```bash
flyctl secrets set \
  CORS_ORIGINS="https://sosquishy.io,https://www.sosquishy.io" \
  PUBLIC_OPTIMIZATION_ENABLED=true \
  API_KEY_AUTH_ENABLED=true \
  RATE_LIMIT_ENABLED=true \
  RATE_LIMIT_MAX=100 \
  RATE_LIMIT_WINDOW=1m \
  DB_PATH=/app/data/api_keys.db
```

### 6. First Deployment

```bash
flyctl deploy
```

**What happened:**

1. Docker image built locally
2. Pushed to Fly's registry
3. VM created with 2GB RAM
4. Volume mounted at `/app/data`
5. Health checks started
6. Application started

**Time:** ~2 minutes

Watched the logs:

```bash
flyctl logs
```

```
Image Optimizer API
Version: dev
Commit: a6353bc
Build Time: 2025-10-19T15:30:00Z
Starting server on port 8080
```

### 7. Testing the Deployment

```bash
curl https://image-optimizer.fly.dev/health
```

```json
{
    "status": "ok",
    "version": "a6353bc",
    "commit": "a6353bc",
    "timestamp": "2025-10-19T15:35:00Z"
}
```

The API was live on Fly.io.

### 8. Custom Domain Setup

Moving `api.sosquishy.io` from Render to Fly.io:

```bash
flyctl certs add api.sosquishy.io
```

**Output:**

```
Your certificate for api.sosquishy.io is being issued.

Add the following DNS record:
CNAME: api → image-optimizer.fly.dev
```

Updated DNS (Cloudflare):

```
Type: CNAME
Name: api
Target: image-optimizer.fly.dev
Proxy: OFF (important!)
TTL: Auto
```

**Certificate verification:**

```bash
flyctl certs show api.sosquishy.io
```

After ~2 minutes:

```
Status: Issued
```

Let's Encrypt certificate, automatically managed, auto-renewing. Free.

### 9. Final Testing

```bash
curl https://api.sosquishy.io/health
```

```json
{
    "status": "ok",
    "version": "a6353bc",
    "commit": "a6353bc",
    "timestamp": "2025-10-19T15:45:00Z"
}
```

Migration complete. Total time: **~30 minutes**.

## Adding Build-Time Version Tracking

While migrating, I added build-time version information to the health endpoint.

### The Problem

Before:

```json
{
    "status": "ok"
}
```

This didn't tell me:

- What version is deployed?
- What commit is running?
- When was it built?

### The Solution

Added build-time variables injected via Docker `ARG` and Go's `-ldflags`:

**1. Version variables in `version.go`:**

```go
package main

var (
    version   = "dev"     // Replaced at build time
    commit    = "none"    // Replaced at build time
    buildTime = "unknown" // Replaced at build time
)
```

**2. Updated `Dockerfile`:**

```dockerfile
# Build arguments
ARG APP_VERSION=dev
ARG GIT_COMMIT=none
ARG BUILD_TIME=unknown

# Inject via ldflags
RUN CGO_ENABLED=1 GOOS=linux go build \
    -ldflags="-X main.version=${APP_VERSION} -X main.commit=${GIT_COMMIT} -X main.buildTime=${BUILD_TIME}" \
    -o main .
```

**3. Deploy with version info:**

```bash
flyctl deploy \
  --build-arg APP_VERSION=$(git describe --tags --always) \
  --build-arg GIT_COMMIT=$(git rev-parse --short HEAD) \
  --build-arg BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)
```

**4. Automated deployment script (`deploy.sh`):**

```bash
#!/bin/bash
set -e

APP_VERSION=$(git describe --tags --always)
GIT_COMMIT=$(git rev-parse --short HEAD)
BUILD_TIME=$(date -u +%Y-%m-%dT%H:%M:%SZ)

echo "Deploying version $APP_VERSION ($GIT_COMMIT)"

flyctl deploy \
  --build-arg APP_VERSION="$APP_VERSION" \
  --build-arg GIT_COMMIT="$GIT_COMMIT" \
  --build-arg BUILD_TIME="$BUILD_TIME"

# Verify deployment
curl -s https://api.sosquishy.io/health | jq .
```

**Result:**

```json
{
    "status": "ok",
    "version": "v1.0.0",
    "commit": "a6353bc",
    "timestamp": "2025-10-19T16:00:00Z"
}
```

Now I can verify deployments at a glance:

- **Monitoring** — Which version is in production?
- **Debugging** — What commit introduced this bug?
- **Auditing** — When was this version deployed?

### Startup Logging

Also added version logging on startup:

```go
func main() {
    log.Printf("Image Optimizer API")
    log.Printf("Version: %s", version)
    log.Printf("Commit: %s", commit)
    log.Printf("Build Time: %s", buildTime)
    // ... rest of startup
}
```

When checking logs:

```bash
flyctl logs
```

I immediately see what's running:

```
Image Optimizer API
Version: v1.0.0
Commit: a6353bc
Build Time: 2025-10-19T15:30:00Z
Starting server on port 8080
```

## Performance Impact

### Memory Usage: Before and After

**Before (Render - 512MB):**

- 7.8MB custom spritesheet: Hitting memory limits
- Had to be conservative with deduplication
- Risk of OOM errors on large files

**After (Fly.io - 2GB):**

- Same 7.8MB spritesheet: Plenty of headroom
- Successfully processed 202 frames → 118 unique (42% reduction)
- Can handle 4096x4096 atlas sheets comfortably
- No more memory anxiety

### Real-World Test Results

After migration, I re-ran all test spritesheets:

| Spritesheet   | Size  | Original | Unique | Memory (Before)  | Memory (After) |
| ------------- | ----- | -------- | ------ | ---------------- | -------------- |
| Small_example | 1.7MB | 104      | 31     | ~200MB           | ~200MB         |
| Med_example   | 5.1MB | 165      | 41     | ~400MB (close)   | ~400MB (safe)  |
| Lrg_example   | 7.8MB | 202      | 118    | ~500MB (failing) | ~500MB (safe)  |

The Convict spritesheet went from **failing/unstable** on Render to **processing reliably** on Fly.io.

### Deployment Speed

**Before (Render):**

- Deploy time: 3-5 minutes
- No version tracking
- Manual verification needed

**After (Fly.io):**

- Deploy time: 1-2 minutes
- Automatic version tracking
- Script verifies deployment

**Example deployment output:**

```
================================
Image Optimizer API Deployment
================================

Build Information:
  Version:    v1.0.0
  Commit:     a6353bc
  Build Time: 2025-10-19T16:00:00Z

Deploy to Fly.io with these settings? (y/N) y

Starting deployment...
Deployment complete!

Verifying deployment...
{
  "status": "ok",
  "version": "v1.0.0",
  "commit": "a6353bc",
  "timestamp": "2025-10-19T16:05:00Z"
}

Version verified: v1.0.0
Deployment verified!
```

## Cost Comparison

### Monthly Costs

| Service       | Render (2GB) | Fly.io (2GB) | Savings        |
| ------------- | ------------ | ------------ | -------------- |
| Compute       | $25          | $8           | $17            |
| Storage (1GB) | Included     | $0.15        | -$0.15         |
| HTTPS Certs   | Free         | Free         | $0             |
| Bandwidth     | Included     | Free tier    | $0             |
| **Total**     | **$25**      | **~$8**      | **~$17/month** |

**Annual savings: ~$200**

For a side project that's not officially launched, saving $200/year while getting better performance was a no-brainer.

## Lessons Learned

### 1. Memory Limits Are Real

On Render's 512MB tier, I was constantly worrying about memory limits. The 7.8MB spritesheet test kept failing — hitting memory limits.

With 2GB on Fly.io, those concerns disappeared. The same workload that pushed Render to its limits uses only ~25% of Fly.io's available memory.

### 2. Fly.io's CLI is Better

The `flyctl` command provides more control than Render's web-only interface:

```bash
flyctl logs           # Real-time logs
flyctl ssh console    # SSH into running container
flyctl status         # Detailed app status
flyctl metrics        # Resource usage
```

This makes debugging and monitoring significantly easier.

### 3. Health Checks Matter

Fly.io's health check configuration is more flexible:

```toml
[[services.http_checks]]
  interval = '30s'
  timeout = '5s'
  grace_period = '10s'  # Critical for slow starts
  method = 'GET'
  path = '/health'
```

The `grace_period` setting is important for Go applications that take a few seconds to initialize libvips and connect to the database.

### 4. Version Tracking Pays Off

Adding build-time version info has already saved time. When testing deployments, I can immediately verify:

```bash
curl -s https://api.sosquishy.io/health | jq -r .version
```

If the version doesn't match my local git tag, I know the deployment didn't work correctly.

### 5. SQLite on Fly.io Works Well

I was initially concerned about using SQLite with Fly.io's VMs, but with persistent volumes it's been solid:

```toml
[[mounts]]
  source = 'image_optimizer_data'
  destination = '/app/data'
```

The database survives deployments, restarts, and crashes. Perfect for a low-traffic API.

### 6. Document Everything

I created comprehensive migration docs:

- `FLY_MIGRATION_GUIDE.md` — Step-by-step guide
- `FLY_COMMANDS_CHEATSHEET.md` — Quick CLI reference
- `FLY_DOMAIN_SETUP.md` — DNS configuration
- `HEALTH_ENDPOINT.md` — Health endpoint implementation

**Time investment:** ~2 hours
**Value:** When I need to set up another Fly.io app or help someone else migrate, the docs are there.

## The Migration Process

For anyone considering a similar migration:

### Pre-Migration

- Document all environment variables
- Test Dockerfile builds locally
- Backup databases (if applicable)
- Review current resource usage

### Migration Steps

1. Install Fly CLI
2. Initialize app with `flyctl launch --no-deploy`
3. Create persistent volumes (if needed)
4. Configure `fly.toml`
5. Set environment secrets
6. Deploy and verify
7. Add custom domain
8. Update DNS records
9. Verify HTTPS certificate

### Post-Migration

- Monitor logs for 24-48 hours
- Test all endpoints thoroughly
- Verify database persistence
- Update documentation

Total time: **~30 minutes** for the migration, **~2 hours** for documentation.

## Conclusion

Migrating from Render to Fly.io solved my immediate problem: **memory limitations**.

The results:

- **4x more memory** (512MB → 2GB)
- **$17/month savings** (~$200/year)
- **Faster deployments** (3-5min → 1-2min)
- **Better tooling** (CLI vs web-only)
- **Enhanced monitoring** with version tracking

Most importantly: **Large spritesheet processing now works reliably**. The 7.8MB Convict spritesheet that was failing on Render now processes without issues.

For a pre-launch API where downtime wasn't a concern, this migration was the right move. The cost savings alone justified it, but getting 4x the memory and better tooling made it an easy decision.

If you're running a containerized service on Render and hitting memory or cost constraints, Fly.io is worth evaluating. The migration is straightforward, and for my use case, it's been a clear improvement.

## Resources

- **Image Optimizer API**: [api.sosquishy.io](https://api.sosquishy.io)
- **Fly.io Docs**: [fly.io/docs](https://fly.io/docs/)
- **Migration Guide**: [GitHub - keif/image-optimizer](https://github.com/keif/image-optimizer)
- **Fly.io Pricing**: [fly.io/pricing](https://fly.io/pricing)

---

The API is still in development and not officially launched, but it's now running on infrastructure that can handle the workload without memory constraints.
