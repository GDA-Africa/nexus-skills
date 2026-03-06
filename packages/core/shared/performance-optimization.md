---
skill: performance-optimization
version: 1.0.0
framework: shared
category: workflow
triggers:
  - "performance optimization"
  - "performance patterns"
  - "caching"
  - "optimization strategies"
  - "slow application"
author: "@nexus-framework/skills"
status: active
---

# Skill: Performance Optimization (Shared)

## When to Read This
Read this skill when experiencing slow application performance, high response times, or when building performance-critical features.

## Context
Performance is critical for user experience and business metrics. This project prioritizes fast load times, responsive interactions, and efficient resource usage. Performance optimization should be considered throughout development, not just as an afterthought. Use profiling tools to identify bottlenecks and measure improvements.

## Steps
1. Identify performance bottlenecks using profiling and monitoring tools
2. Optimize the critical rendering path for faster initial load
3. Implement caching strategies at appropriate layers
4. Minimize and optimize assets (JavaScript, CSS, images)
5. Use lazy loading and code splitting for large applications
6. Optimize database queries and data fetching
7. Implement efficient algorithms and data structures
8. Monitor performance metrics in production

## Patterns We Use
- Bundle optimization: Tree shaking, code splitting, lazy loading
- Caching: Browser caching, CDN, Redis for application data
- Database optimization: Indexing, query optimization, connection pooling
- Image optimization: WebP format, responsive images, lazy loading
- Frontend optimization: Virtualization for long lists, debouncing
- API optimization: Pagination, field selection, compression
- Memory management: Proper cleanup, avoiding memory leaks
- Performance budgets: Set limits for bundle size and load times

## Anti-Patterns — Never Do This
- ❌ Do not load all data at application startup
- ❌ Do not make synchronous operations that block the main thread
- ❌ Do not ignore database query performance
- ❌ Do not load unnecessary assets or dependencies
- ❌ Do not implement inefficient algorithms for large datasets
- ❌ Do not forget to clean up event listeners and subscriptions
- ❌ Do not ignore mobile performance constraints
- ❌ Do not skip performance testing in CI/CD

## Example

```typescript
// ✅ Efficient data fetching with pagination
export async function getUsers(page: number, limit: number = 20) {
  const offset = (page - 1) * limit;
  
  const [users, total] = await Promise.all([
    database.users.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
      },
    }),
    database.users.count(),
  ]);

  return {
    users,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
```

```typescript
// ✅ Lazy loading with React
import { lazy, Suspense } from 'react';

const LazyDashboard = lazy(() => import('./Dashboard'));
const LazyAnalytics = lazy(() => import('./Analytics'));

export function App() {
  return (
    <div>
      <Navigation />
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/dashboard" element={<LazyDashboard />} />
          <Route path="/analytics" element={<LazyAnalytics />} />
        </Routes>
      </Suspense>
    </div>
  );
}
```

```typescript
// ✅ Caching with Redis
import Redis from 'ioredis';

const redis = new Redis();

export async function getCachedUser(userId: string) {
  const cacheKey = `user:${userId}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from database
  const user = await database.users.findUnique({ where: { id: userId } });
  
  // Cache for 10 minutes
  if (user) {
    await redis.setex(cacheKey, 600, JSON.stringify(user));
  }
  
  return user;
}
```

```typescript
// ✅ Debounced search to prevent excessive API calls
import { useState, useCallback } from 'react';

export function useDebouncedSearch(searchFn: (query: string) => Promise<any>, delay: number = 300) {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const debouncedSearch = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      
      setLoading(true);
      try {
        const result = await searchFn(query);
        setResults(result);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    }, delay),
    [searchFn, delay]
  );
  
  return { results, loading, debouncedSearch };
}

function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
```

## Notes
- Use performance monitoring tools (Lighthouse, WebPageTest, New Relic)
- Implement performance budgets in build process
- Monitor Core Web Vitals (LCP, FID, CLS) in production
- Use service workers for offline caching strategies
- Consider using edge computing for global performance
- Optimize for mobile devices with slower networks
- Use compression (gzip, brotli) for text assets
- Implement proper image loading strategies (srcset, loading="lazy")
- Regularly audit bundle size and remove unused dependencies