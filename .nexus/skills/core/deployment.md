---
skill: deployment
version: 1.0.0
framework: shared
category: workflow
triggers:
  - "deployment"
  - "CI/CD"
  - "environment management"
  - "deployment strategies"
  - "production deployment"
author: "@nexus-framework/skills"
status: active
---

# Skill: Deployment (Shared)

## When to Read This
Read this skill when setting up deployment pipelines, configuring environments, or deploying applications to production.

## Context
This project follows modern deployment practices with automated CI/CD pipelines, environment isolation, and zero-downtime deployments. We use containerization, infrastructure as code, and monitoring to ensure reliable and scalable deployments. The deployment process should be repeatable, automated, and safe for production environments.

## Steps
1. Set up CI/CD pipeline with automated testing and deployment
2. Configure environment-specific settings and secrets
3. Use containerization (Docker) for consistent deployments
4. Implement proper environment isolation (dev, staging, production)
5. Set up monitoring, logging, and alerting
6. Use deployment strategies like blue-green or rolling updates
7. Implement rollback mechanisms for quick recovery
8. Document deployment procedures and runbooks

## Patterns We Use
- CI/CD: GitHub Actions, GitLab CI, or similar for automated pipelines
- Containerization: Docker with multi-stage builds for optimization
- Environment management: Separate configs for dev, staging, production
- Infrastructure as Code: Terraform, AWS CDK, or similar for infrastructure
- Secrets management: Environment variables, secret managers, or vaults
- Load balancing: Use load balancers for high availability
- Health checks: Implement health checks for service monitoring
- Rollback strategies: Automated rollback on deployment failures

## Anti-Patterns — Never Do This
- ❌ Do not deploy directly to production without testing
- ❌ Do not hardcode secrets or credentials in code
- ❌ Do not skip automated testing in deployment pipeline
- ❌ Do not ignore security scanning in CI/CD
- ❌ Do not deploy without proper monitoring and alerting
- ❌ Do not use the same database for multiple environments
- ❌ Do not skip database migrations in deployment process
- ❌ Do not deploy during high-traffic periods without planning

## Example

```yaml
# ✅ GitHub Actions CI/CD pipeline
# .github/workflows/deploy.yml
name: Deploy Application

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run build
      
      - name: Log in to Container Registry
        uses: docker/login-action@v2
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v4
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=sha,prefix={{branch}}-
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: staging
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to staging
        uses: azure/webapps-deploy@v2
        with:
          app-name: 'my-app-staging'
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE_STAGING }}
          images: '${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}'

  deploy-production:
    needs: [build-and-push, deploy-staging]
    runs-on: ubuntu-latest
    environment: production
    if: github.ref == 'refs/heads/main'
    
    steps:
      - name: Deploy to production
        uses: azure/webapps-deploy@v2
        with:
          app-name: 'my-app-production'
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE_PRODUCTION }}
          images: '${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ github.sha }}'
```

```dockerfile
# ✅ Multi-stage Dockerfile for optimization
# Dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./

USER nextjs

EXPOSE 3000

ENV NODE_ENV production
ENV PORT 3000

CMD ["node", "dist/server.js"]
```

```yaml
# ✅ Docker Compose for local development
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://user:password@db:5432/myapp_dev
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: myapp_dev
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

```typescript
// ✅ Environment configuration management
// config/environment.ts
interface EnvironmentConfig {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  database: {
    url: string;
    maxConnections: number;
  };
  redis: {
    url: string;
    maxRetries: number;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
  };
}

function loadEnvironment(): EnvironmentConfig {
  const nodeEnv = (process.env.NODE_ENV as EnvironmentConfig['nodeEnv']) || 'development';
  
  return {
    nodeEnv,
    port: parseInt(process.env.PORT || '3000', 10),
    database: {
      url: process.env.DATABASE_URL!,
      maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10', 10),
    },
    redis: {
      url: process.env.REDIS_URL!,
      maxRetries: parseInt(process.env.REDIS_MAX_RETRIES || '3', 10),
    },
    jwt: {
      secret: process.env.JWT_SECRET!,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    },
    logging: {
      level: (process.env.LOG_LEVEL as EnvironmentConfig['logging']['level']) || 'info',
    },
  };
}

export const config = loadEnvironment();
```

```yaml
# ✅ Terraform for infrastructure as code
# terraform/main.tf
provider "aws" {
  region = var.aws_region
}

resource "aws_s3_bucket" "app_bucket" {
  bucket = "${var.app_name}-assets-${random_id.bucket_suffix.hex}"
  acl    = "private"
  
  versioning {
    enabled = true
  }
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}

resource "aws_rds_cluster" "app_database" {
  cluster_identifier = "${var.app_name}-cluster"
  engine             = "aurora-postgresql"
  engine_version     = "14.9"
  database_name      = var.database_name
  master_username    = var.database_username
  master_password    = var.database_password
  
  backup_retention_period = 7
  preferred_backup_window = "03:00-04:00"
  
  vpc_security_group_ids = [aws_security_group.database.id]
  db_subnet_group_name   = aws_db_subnet_group.app_subnet_group.name
  
  tags = {
    Environment = var.environment
    Project     = var.app_name
  }
}

resource "aws_app_service" "app" {
  name       = var.app_name
  region     = var.aws_region
  account_id = var.aws_account_id
  
  source_configuration {
    bucket_name = aws_s3_bucket.app_bucket.bucket
    bucket_key  = "app.zip"
  }
  
  environment {
    NODE_ENV = var.environment
    PORT     = "3000"
  }
  
  scaling {
    min_capacity = 2
    max_capacity = 10
  }
}
```

```typescript
// ✅ Health check endpoint
// src/health.ts
import { Request, Response } from 'express';
import { database } from './database';
import { redis } from './redis';

interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
    };
    redis: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
    };
  };
}

export async function healthCheck(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  const health: HealthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      database: { status: 'healthy' },
      redis: { status: 'healthy' },
    },
  };

  try {
    // Check database
    const dbStart = Date.now();
    await database.$queryRaw`SELECT 1`;
    health.services.database.responseTime = Date.now() - dbStart;
  } catch (error) {
    health.services.database.status = 'unhealthy';
    health.status = 'unhealthy';
  }

  try {
    // Check Redis
    const redisStart = Date.now();
    await redis.ping();
    health.services.redis.responseTime = Date.now() - redisStart;
  } catch (error) {
    health.services.redis.status = 'unhealthy';
    health.status = 'unhealthy';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
}
```

## Notes
- Use blue-green or rolling deployments for zero-downtime deployments
- Implement proper health checks and readiness probes
- Use environment variables for all configuration
- Set up monitoring with tools like Prometheus, Grafana, or cloud-native solutions
- Implement proper logging with structured logs
- Use secrets management services (AWS Secrets Manager, HashiCorp Vault)
- Set up automated backups for databases and critical data
- Use feature flags for safer deployments
- Implement circuit breakers for external service dependencies
- Document rollback procedures and test them regularly