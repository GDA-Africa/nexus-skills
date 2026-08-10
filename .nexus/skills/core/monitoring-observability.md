---
skill: monitoring-observability
version: 1.0.0
framework: shared
category: workflow
triggers:
  - "monitoring"
  - "observability"
  - "logging"
  - "metrics"
  - "alerting"
author: "@nexus-framework/skills"
status: active
---

# Skill: Monitoring and Observability (Shared)

## When to Read This
Read this skill when setting up monitoring, implementing logging, or configuring observability for applications and infrastructure.

## Context
Monitoring and observability are essential for maintaining system reliability, performance, and user experience. This project implements the three pillars of observability: logs, metrics, and traces. We use structured logging, comprehensive metrics collection, and distributed tracing to gain insights into system behavior and quickly identify and resolve issues.

## Steps
1. Implement structured logging with consistent formats and levels
2. Set up metrics collection for key performance indicators
3. Configure distributed tracing for request flows
4. Set up monitoring dashboards and alerting
5. Implement health checks and uptime monitoring
6. Configure log aggregation and analysis
7. Set up performance monitoring and error tracking
8. Create runbooks for common alert scenarios

## Patterns We Use
- Structured logging: JSON format with consistent fields (timestamp, level, service, traceId)
- Metrics: Use Prometheus, DataDog, or cloud-native metrics services
- Tracing: OpenTelemetry or Jaeger for distributed tracing
- Alerting: PagerDuty, Opsgenie, or cloud-native alerting services
- Dashboards: Grafana, DataDog, or cloud-native dashboard services
- Log aggregation: ELK stack, Loki, or cloud-native log services
- Error tracking: Sentry, Rollbar, or similar error monitoring services
- SLIs/SLOs: Define service level indicators and objectives

## Anti-Patterns — Never Do This
- ❌ Do not log sensitive information (passwords, tokens, PII)
- ❌ Do not ignore error logs or treat them as informational
- ❌ Do not create too many metrics without clear purpose
- ❌ Do not set up alerts without clear action plans
- ❌ Do not log at wrong levels (debug in production, errors as info)
- ❌ Do not ignore performance degradation trends
- ❌ Do not use inconsistent log formats across services
- ❌ Do not forget to monitor external dependencies and third-party services

## Example

```typescript
// ✅ Structured logging implementation
import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';

interface LogContext {
  service: string;
  version: string;
  traceId?: string;
  spanId?: string;
  userId?: string;
  requestId?: string;
}

class Logger {
  private logger: winston.Logger;

  constructor(context: LogContext) {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return JSON.stringify({
            timestamp,
            level,
            message,
            service: context.service,
            version: context.version,
            traceId: context.traceId || meta.traceId,
            spanId: context.spanId || meta.spanId,
            userId: context.userId || meta.userId,
            requestId: context.requestId || meta.requestId,
            ...meta,
          });
        })
      ),
      transports: [
        new winston.transports.Console(),
        // Add file transport for production
        // new winston.transports.File({ filename: 'error.log', level: 'error' }),
        // new winston.transports.File({ filename: 'combined.log' }),
      ],
    });
  }

  info(message: string, meta?: any) {
    this.logger.info(message, meta);
  }

  error(message: string, error?: Error, meta?: any) {
    this.logger.error(message, { error: error?.stack, ...meta });
  }

  warn(message: string, meta?: any) {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: any) {
    this.logger.debug(message, meta);
  }
}

// Usage
const logger = new Logger({
  service: 'user-service',
  version: '1.0.0',
  traceId: uuidv4(),
});

export { logger };
```

```typescript
// ✅ Metrics collection with Prometheus
import { register, Counter, Histogram, Gauge } from 'prom-client';

// Create metrics
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
});

const activeUsers = new Gauge({
  name: 'active_users_total',
  help: 'Number of active users',
});

const databaseConnections = new Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections',
});

// Middleware to track HTTP metrics
export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    
    httpRequestsTotal.inc({
      method: req.method,
      route: req.route?.path || req.path,
      status_code: res.statusCode,
    });
    
    httpRequestDuration.observe(
      {
        method: req.method,
        route: req.route?.path || req.path,
      },
      duration
    );
  });
  
  next();
}

// Update metrics
export function updateActiveUsers(count: number) {
  activeUsers.set(count);
}

export function updateDatabaseConnections(count: number) {
  databaseConnections.set(count);
}

// Metrics endpoint
export function metricsHandler(req: Request, res: Response) {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
}
```

```typescript
// ✅ Distributed tracing with OpenTelemetry
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

// Initialize tracing
const sdk = new NodeSDK({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'user-service',
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
  }),
  instrumentations: [getNodeAutoInstrumentations()],
  traceExporter: new JaegerExporter({
    endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
  }),
});

sdk.start();

// Manual tracing example
import { trace } from '@opentelemetry/api';

export async function getUserWithTracing(userId: string) {
  const tracer = trace.getTracer('user-service', '1.0.0');
  
  return tracer.startActiveSpan('get-user', async (span) => {
    try {
      span.setAttributes({
        'user.id': userId,
        'operation.type': 'database-query',
      });
      
      const user = await database.users.findUnique({ where: { id: userId } });
      
      if (!user) {
        span.setStatus({ code: 2, message: 'User not found' });
      } else {
        span.setAttributes({
          'user.email': user.email,
          'user.created_at': user.createdAt.toISOString(),
        });
      }
      
      return user;
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: 2, message: 'Internal server error' });
      throw error;
    } finally {
      span.end();
    }
  });
}
```

```typescript
// ✅ Error tracking with Sentry
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  integrations: [
    new ProfilingIntegration(),
  ],
  beforeSend(event) {
    // Filter out sensitive information
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers?.authorization;
    }
    return event;
  },
});

// Error handling middleware
export function sentryErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Capture exception
  Sentry.captureException(error, {
    tags: {
      component: 'api',
      endpoint: req.path,
    },
    extra: {
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    },
  });

  // Continue with error handling
  next(error);
}

// Performance monitoring
export function trackPerformance(operation: string, fn: () => Promise<any>) {
  return Sentry.startSpan({ name: operation }, async (span) => {
    try {
      const result = await fn();
      span.setStatus('ok');
      return result;
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus('internal_error');
      throw error;
    }
  });
}
```

```typescript
// ✅ Health checks and readiness probes
interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  version: string;
  checks: {
    [service: string]: {
      status: 'healthy' | 'unhealthy';
      responseTime?: number;
      error?: string;
    };
  };
}

export class HealthChecker {
  private checks: Map<string, () => Promise<void>> = new Map();

  addCheck(name: string, checkFn: () => Promise<void>) {
    this.checks.set(name, checkFn);
  }

  async checkAll(): Promise<HealthStatus> {
    const status: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.APP_VERSION || '1.0.0',
      checks: {},
    };

    const checkPromises = Array.from(this.checks.entries()).map(
      async ([name, checkFn]) => {
        const startTime = Date.now();
        try {
          await checkFn();
          status.checks[name] = {
            status: 'healthy',
            responseTime: Date.now() - startTime,
          };
        } catch (error) {
          status.checks[name] = {
            status: 'unhealthy',
            responseTime: Date.now() - startTime,
            error: (error as Error).message,
          };
          status.status = 'unhealthy';
        }
      }
    );

    await Promise.all(checkPromises);
    return status;
  }
}

// Usage
const healthChecker = new HealthChecker();

healthChecker.addCheck('database', async () => {
  await database.$queryRaw`SELECT 1`;
});

healthChecker.addCheck('redis', async () => {
  await redis.ping();
});

healthChecker.addCheck('external-api', async () => {
  const response = await fetch('https://api.example.com/health');
  if (!response.ok) {
    throw new Error('External API unhealthy');
  }
});
```

## Notes
- Use consistent log levels: DEBUG, INFO, WARN, ERROR
- Implement log rotation to prevent disk space issues
- Set up alerting thresholds based on historical data and SLOs
- Use correlation IDs to trace requests across services
- Monitor business metrics, not just technical metrics
- Implement circuit breakers for external service dependencies
- Use synthetic monitoring for critical user journeys
- Regularly review and tune alert thresholds
- Document runbooks for common failure scenarios
- Practice incident response with regular fire drills