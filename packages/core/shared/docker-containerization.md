---
skill: docker-containerization
version: 1.0.0
framework: shared
category: config
invocation: model
triggers:
  - "docker containerization"
  - "dockerfile best practices"
  - "multi stage builds"
  - "container security"
  - "docker compose"
  - "minimal container images"
author: "@nexus-framework/skills"
status: active
updated: 2026-10-03
related:
  - deployment
  - security-best-practices
  - performance-optimization
---

# Skill: Docker Containerization & Security (Shared)

## When to Read This
Read this skill before authoring or modifying Dockerfiles, Docker Compose configurations, container build scripts, or deployment manifests for staging and production workloads.

## Context
Containers must be secure, lightweight, and fast to build. A poorly authored Dockerfile exposes root privileges to host attacks, bloats image sizes into gigabytes, leaks build secrets into image layers, and ruins build caches. This skill sets our standards for **multi-stage builds**, **non-root container execution**, **layer caching hygiene**, **signal handling (PID 1)**, and **reproducible multi-arch compilation**.

## Steps
1. **Use Multi-Stage Builds**:
   - Stage 1 (`builder`): Install compilers, development tools, and dependencies; compile binaries and bundles.
   - Stage 2 (`runner`): Copy only the compiled artifacts and production dependencies into a minimal base image (e.g. `alpine`, `distroless`, or `debian-slim`).
2. **Enforce Non-Root Execution**:
   - Create a dedicated non-root user and group (e.g. `appuser:appgroup` with UID 10001).
   - Set `USER appuser` before the entrypoint. Never run production containers as `root` (UID 0).
3. **Optimize Layer Caching**:
   - Copy dependency manifests (`package.json`, `pnpm-lock.yaml`, `go.mod`, `Cargo.toml`) and install dependencies *before* copying application source code.
   - Combine related commands using `&&` to minimize layer count.
4. **Implement Robust `.dockerignore`**:
   - Exclude `.git`, `node_modules`, `dist`, local secrets (`.env*`), test fixtures, and documentation from the build context.
5. **Handle OS Signals Gracefully (PID 1)**:
   - Ensure the main process receives and handles `SIGTERM` and `SIGINT` signals for graceful shutdown.
   - Use `exec` in shell wrapper scripts, or use `tini` / `dumb-init` when running runtimes that don't handle PID 1 signal forwarding.
6. **Add Healthchecks**:
   - Define a native `HEALTHCHECK` probe targeting a lightweight `/healthz` or `/livez` HTTP endpoint.
7. **Build for Multiple Architectures**:
   - Use `docker buildx` with `--platform linux/amd64,linux/arm64` to support cloud servers and Apple Silicon / ARM servers seamlessly.

## Patterns We Use
- **Distroless & Slim Bases**: Use `gcr.io/distroless/nodejs` or `alpine` / `debian-slim` to eliminate shell vulnerabilities and keep image sizes $<100\text{MB}$.
- **Read-Only Root Filesystems**: Configure containers to run with `--read-only`, mounting ephemeral `/tmp` volumes only where strictly necessary.
- **Cache Mounting**: Utilize `RUN --mount=type=cache,target=...` to preserve package manager caches across builds without bloating intermediate layers.
- **Explicit Signal Handlers**: Listen for `process.on('SIGTERM')` in Node.js, `signal.Notify` in Go, or signal handlers in Python to drain active connections before terminating.

## Anti-Patterns — Never Do This
- ❌ Do not run containers as `root` user in production.
- ❌ Do not embed build secrets or `.env` files into image layers (visible in `docker history`).
- ❌ Do not use the `latest` image tag in production Dockerfiles; pin specific image hashes or semantic versions.
- ❌ Do not install debugging tools (curl, wget, vim, bash) in production runtime containers.
- ❌ Do not copy the entire workspace before running `npm install` (invalidates cache on every single code edit).
- ❌ Do not ignore `SIGTERM`, forcing orchestrators (Kubernetes, ECS) to send hard `SIGKILL` after 30-second timeouts.
- ❌ Do not run package managers without cleaning cache directories (`npm cache clean --force`, `rm -rf /var/lib/apt/lists/*`).

## Example

```dockerfile
# ==============================================================================
# 1. Production Node.js / Next.js Multi-Stage Dockerfile
# ==============================================================================

# Stage 1: Dependencies
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy dependency manifests first for maximum layer cache reuse
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Stage 2: Builder
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Run build as unprivileged user
ENV NODE_ENV=production
RUN npm run build

# Stage 3: Minimal Production Runner
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Create dedicated non-root system group and user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy build artifacts with explicit ownership
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

EXPOSE 3000

# Configure healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Execute standalone server directly (PID 1 signal-aware)
CMD ["node", "server.js"]
```

```dockerfile
# ==============================================================================
# 2. Production Go Multi-Stage Dockerfile (Ultra-minimal scratch / distroless)
# ==============================================================================

FROM golang:1.24-alpine AS builder
WORKDIR /src

# Pre-fetch modules
COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Compile static binary without CGO, stripping debug symbols
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /bin/app ./cmd/server

# Stage 2: Scratch container (Zero attack surface, <15MB)
FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /
COPY --from=builder /bin/app /bin/app

USER nonroot:nonroot
EXPOSE 8080

ENTRYPOINT ["/bin/app"]
```

```dockerfile
# ==============================================================================
# 3. Production Python Multi-Stage Dockerfile
# ==============================================================================

FROM python:3.12-slim AS builder
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends gcc build-essential && rm -rf /var/lib/apt/lists/*
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Clean runtime
FROM python:3.12-slim AS runner
WORKDIR /app

COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /bin/false appuser

COPY . .
RUN chown -R appuser:appgroup /app

USER appuser
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

## Validation
- Images execute under a non-root UID (`USER` is specified and not 0).
- `.dockerignore` file exists in the repository root.
- Multi-stage separation prevents build toolchains from leaking into runtime images.
- Images build cleanly without warnings on both `linux/amd64` and `linux/arm64`.
- Containers respond to `SIGTERM` within 5 seconds without requiring `SIGKILL`.

## Notes
- To test image vulnerabilities locally, run `docker scout cves <image>` or `trivy image <image>`.
- Use Docker Compose strictly for local development and integration tests; manage production through Kubernetes, Nomad, or containerized serverless runtimes.
