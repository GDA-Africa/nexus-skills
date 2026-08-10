---
nexus_doc: true
id: "08_deployment"
title: "Deployment"
status: template
confidence: low
last_updated: "2026-08-10"
---

# Deployment

**Project:** NEXUS CLI

---

## 🚀 Deployment Strategy
<!-- Where and how will this be deployed? Platform, region, scaling -->

## 🔧 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment | Yes | `development` |

## 📦 CI/CD

GitHub Actions workflow at `.github/workflows/ci.yml` runs on push/PR to `main`:
lint → typecheck → test → build
