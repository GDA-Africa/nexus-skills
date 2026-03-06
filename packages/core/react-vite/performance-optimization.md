---
skill: performance-optimization
version: 1.0.0
framework: react-vite
category: workflow
triggers:
  - "performance optimization"
  - "React performance"
  - "render optimization"
  - "bundle optimization"
  - "Vite optimization"
author: "@nexus-framework/skills"
status: active
---

# Skill: Performance Optimization (React + Vite)

## When to Read This
Read this skill when experiencing slow render times, large bundle sizes, or when optimizing application performance in a React + Vite project.

## Context
This project prioritizes performance with a focus on fast load times, smooth interactions, and efficient resource usage. We use Vite's built-in optimizations along with React-specific performance patterns. Performance optimization should be considered throughout development, with regular monitoring and profiling to identify bottlenecks.

## Steps
1. Analyze bundle size and identify large dependencies
2. Implement code splitting and lazy loading for routes and components
3. Optimize render performance with memoization and virtualization
4. Minimize re-renders with proper state management and prop handling
5. Optimize images and assets for faster loading
6. Use Vite's build optimizations and tree shaking
7. Implement proper caching strategies
8. Monitor performance metrics and set performance budgets

## Patterns We Use
- Code splitting: Use React.lazy and dynamic imports for route-based splitting
- Memoization: Use useMemo and useCallback for expensive calculations
- Virtualization: Use react-window or react-virtualized for long lists
- Bundle analysis: Use vite-bundle-analyzer to identify large dependencies
- Image optimization: Use WebP format, responsive images, and lazy loading
- Tree shaking: Ensure unused code is eliminated in production builds
- Caching: Implement proper HTTP caching and service worker strategies
- Performance monitoring: Use Web Vitals and performance APIs

## Anti-Patterns — Never Do This
- ❌ Do not render large lists without virtualization
- ❌ Do not create new objects/functions in render methods
- ❌ Do not ignore bundle size growth
- ❌ Do not load all assets at application startup
- ❌ Do not ignore image optimization
- ❌ Do not use expensive operations in render methods
- ❌ Do not forget to clean up event listeners and subscriptions
- ❌ Do not ignore mobile performance constraints

## Example

```tsx
// src/components/LazyComponent.tsx
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';

// Lazy load heavy components
const HeavyChart = lazy(() => import('./HeavyChart'));
const AnalyticsDashboard = lazy(() => import('./AnalyticsDashboard'));
const ImageGallery = lazy(() => import('./ImageGallery'));

export function LazyComponent() {
  return (
    <ErrorBoundary fallback={<div>Failed to load component</div>}>
      <Suspense fallback={<div>Loading...</div>}>
        <HeavyChart />
        <AnalyticsDashboard />
        <ImageGallery />
      </Suspense>
    </ErrorBoundary>
  );
}
```

```tsx
// src/components/VirtualizedList.tsx
import { FixedSizeList as List } from 'react-window';
import { memo } from 'react';

interface ListItem {
  id: string;
  title: string;
  description: string;
}

interface VirtualizedListProps {
  items: ListItem[];
  height: number;
  itemHeight: number;
}

const ListItem = memo(({ index, style, data }: any) => {
  const item = data[index];
  
  return (
    <div style={style} className="list-item">
      <h3>{item.title}</h3>
      <p>{item.description}</p>
    </div>
  );
});

export function VirtualizedList({ items, height, itemHeight }: VirtualizedListProps) {
  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      itemData={items}
      className="virtualized-list"
    >
      {ListItem}
    </List>
  );
}
```

```tsx
// src/components/OptimizedComponent.tsx
import { useState, useMemo, useCallback, memo } from 'react';

interface Props {
  items: Array<{ id: string; name: string; value: number }>;
  filter: string;
  onItemSelect: (item: any) => void;
}

// Memoize expensive calculations
const ExpensiveCalculation = memo(({ items }: { items: Props['items'] }) => {
  const totalValue = useMemo(() => {
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]);

  const averageValue = useMemo(() => {
    return items.length > 0 ? totalValue / items.length : 0;
  }, [totalValue, items.length]);

  return (
    <div className="calculation-results">
      <p>Total: {totalValue}</p>
      <p>Average: {averageValue.toFixed(2)}</p>
    </div>
  );
});

export function OptimizedComponent({ items, filter, onItemSelect }: Props) {
  // Memoize filtered items to prevent recalculation on every render
  const filteredItems = useMemo(() => {
    if (!filter) return items;
    
    return items.filter(item =>
      item.name.toLowerCase().includes(filter.toLowerCase())
    );
  }, [items, filter]);

  // Memoize callback to prevent child re-renders
  const handleItemSelect = useCallback((item: any) => {
    onItemSelect(item);
  }, [onItemSelect]);

  // Memoize expensive calculations
  const expensiveResult = useMemo(() => {
    // Expensive calculation that depends on filteredItems
    return filteredItems.reduce((acc, item) => acc + item.value * Math.random(), 0);
  }, [filteredItems]);

  return (
    <div className="optimized-component">
      <ExpensiveCalculation items={filteredItems} />
      <div className="item-list">
        {filteredItems.map(item => (
          <ItemCard
            key={item.id}
            item={item}
            onSelect={handleItemSelect}
          />
        ))}
      </div>
      <p>Expensive result: {expensiveResult.toFixed(2)}</p>
    </div>
  );
}

const ItemCard = memo(({ item, onSelect }: any) => {
  const handleClick = useCallback(() => {
    onSelect(item);
  }, [item, onSelect]);

  return (
    <div className="item-card" onClick={handleClick}>
      <h4>{item.name}</h4>
      <p>Value: {item.value}</p>
    </div>
  );
});
```

```typescript
// src/utils/performance.ts
export class PerformanceMonitor {
  private static measurements: Map<string, number> = new Map();

  static startMeasurement(name: string) {
    this.measurements.set(name, performance.now());
  }

  static endMeasurement(name: string): number {
    const startTime = this.measurements.get(name);
    if (!startTime) {
      console.warn(`No measurement started for ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.measurements.delete(name);
    
    console.log(`${name}: ${duration.toFixed(2)}ms`);
    return duration;
  }

  static measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    return new Promise(async (resolve, reject) => {
      this.startMeasurement(name);
      
      try {
        const result = await fn();
        this.endMeasurement(name);
        resolve(result);
      } catch (error) {
        this.endMeasurement(name);
        reject(error);
      }
    });
  }

  static logWebVitals() {
    if ('web-vital' in window) {
      // Log Core Web Vitals
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      });
    }
  }
}
```

```typescript
// vite.config.ts - Performance optimizations
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  
  build: {
    // Enable minification
    minify: 'terser',
    
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
    
    // Rollup options for better tree shaking
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          state: ['zustand'],
          utils: ['lodash', 'date-fns'],
        },
      },
    },
    
    // Terser options for better minification
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },
  
  // Optimize dev server
  server: {
    hmr: {
      overlay: false,
    },
  },
  
  // Optimize assets
  assetsInclude: ['**/*.wasm', '**/*.glb'],
});
```

```tsx
// src/components/OptimizedImage.tsx
import { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  placeholder?: string;
  className?: string;
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  placeholder,
  className 
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const img = new Image();
    
    img.onload = () => {
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      setHasError(true);
    };
    
    img.src = src;
  }, [src]);

  const handleIntersection = (entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting && imgRef.current) {
      imgRef.current.src = src;
    }
  };

  return (
    <div className={`optimized-image ${className || ''}`}>
      {placeholder && !isLoaded && !hasError && (
        <img 
          src={placeholder} 
          alt="" 
          className="placeholder"
          style={{ width, height }}
        />
      )}
      
      <img
        ref={imgRef}
        src={isLoaded ? src : ''}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        className={`image ${isLoaded ? 'loaded' : ''}`}
        style={{ 
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
      />
      
      {hasError && (
        <div className="error-fallback">
          Failed to load image
        </div>
      )}
    </div>
  );
}
```

```css
/* src/styles/performance.css */
/* Optimize rendering */
.optimized-component {
  contain: layout style paint;
}

.list-item {
  will-change: transform;
  transform: translateZ(0);
}

/* Optimize animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.optimized-image {
  position: relative;
  overflow: hidden;
}

.optimized-image .image {
  transition: opacity 0.3s ease;
}

.optimized-image .placeholder {
  filter: blur(5px);
  transform: scale(1.1);
}

/* Optimize virtualization */
.virtualized-list {
  overflow: auto;
  contain: strict;
}

/* Optimize fonts */
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/CustomFont.woff2') format('woff2');
  font-display: swap; /* Optimize font loading */
}
```

## Notes
- Use React DevTools Profiler to identify performance bottlenecks
- Implement proper memoization for expensive calculations
- Use virtualization for long lists and tables
- Optimize bundle size with code splitting and tree shaking
- Monitor Core Web Vitals (LCP, FID, CLS) in production
- Use lazy loading for images and non-critical components
- Implement proper caching strategies for API responses
- Use service workers for offline functionality and caching
- Regularly audit bundle size and performance metrics
- Test performance on low-end devices and slow networks