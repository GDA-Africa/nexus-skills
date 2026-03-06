---
skill: error-handling
version: 1.0.0
framework: react-vite
category: workflow
triggers:
  - "error handling"
  - "error boundaries"
  - "error management"
  - "React errors"
  - "error recovery"
author: "@nexus-framework/skills"
status: active
---

# Skill: Error Handling (React + Vite)

## When to Read This
Read this skill when implementing error handling for components, API calls, or user interactions in a React + Vite application.

## Context
This project follows a comprehensive error handling strategy with multiple layers: React Error Boundaries for component errors, try-catch blocks for synchronous errors, error states for async operations, and global error handling for uncaught errors. All errors should be user-friendly, provide actionable feedback, and include proper logging for debugging.

## Steps
1. Implement Error Boundaries for component-level error catching
2. Use try-catch blocks for synchronous operations that might fail
3. Implement error states for async operations (API calls, data fetching)
4. Create user-friendly error messages with actionable guidance
5. Add proper error logging for debugging and monitoring
6. Implement graceful degradation for non-critical features
7. Handle network errors and timeouts appropriately
8. Provide fallback UIs for failed operations

## Patterns We Use
- Error Boundaries: Class components or hooks for catching component errors
- Error states: useState for managing error states in components
- Error boundaries: Use react-error-boundary library for modern error boundaries
- Global error handling: Window error and unhandled promise rejection handlers
- Error logging: Structured logging with error details and context
- User feedback: Clear error messages with recovery options
- Graceful degradation: Fallback UIs when features fail
- Error recovery: Retry mechanisms and user-initiated recovery

## Anti-Patterns — Never Do This
- ❌ Do not ignore errors — always handle them appropriately
- ❌ Do not show technical error messages to users
- ❌ Do not use console.error for user-facing errors
- ❌ Do not create error boundaries that catch all errors without proper handling
- ❌ Do not forget to log errors for debugging purposes
- ❌ Do not show error states indefinitely without recovery options
- ❌ Do not ignore network errors and timeouts
- ❌ Do not use alert() for error display

## Example

```tsx
// src/components/ErrorBoundary/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';
import { ErrorFallback } from './ErrorFallback';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Send error to logging service
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // Send to error tracking service (Sentry, LogRocket, etc.)
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Details');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <ErrorFallback
          error={this.state.error}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}
```

```tsx
// src/components/ErrorBoundary/ErrorFallback.tsx
import { ErrorInfo } from 'react';

interface ErrorFallbackProps {
  error?: Error;
  onRetry?: () => void;
}

export function ErrorFallback({ error, onRetry }: ErrorFallbackProps) {
  return (
    <div className="error-fallback">
      <div className="error-fallback__content">
        <h2>Oops! Something went wrong</h2>
        <p>
          We're sorry, but something unexpected happened. Don't worry, our team has been notified.
        </p>
        
        {error && (
          <details className="error-fallback__details">
            <summary>Error Details (for developers)</summary>
            <pre className="error-fallback__stack">
              {error.message}
              {error.stack && (
                <>
                  <br />
                  <br />
                  {error.stack}
                </>
              )}
            </pre>
          </details>
        )}
        
        <div className="error-fallback__actions">
          <button onClick={onRetry} className="btn btn--primary">
            Try Again
          </button>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn--secondary"
          >
            Refresh Page
          </button>
          <button 
            onClick={() => window.location.href = '/'} 
            className="btn btn--ghost"
          >
            Go Home
          </button>
        </div>
        
        <p className="error-fallback__help">
          If this problem persists, please contact our support team.
        </p>
      </div>
    </div>
  );
}
```

```tsx
// src/hooks/useAsync.ts
import { useState, useCallback } from 'react';

interface UseAsyncOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  onLoading?: (isLoading: boolean) => void;
}

interface UseAsyncReturn<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

export function useAsync<T = any>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncOptions = {}
): UseAsyncReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (options.onLoading) {
          options.onLoading(true);
        }

        const result = await asyncFunction(...args);
        setData(result);
        
        if (options.onSuccess) {
          options.onSuccess(result);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An unexpected error occurred');
        setError(error);
        
        if (options.onError) {
          options.onError(error);
        }
        
        // Log error for debugging
        console.error('Async operation failed:', error);
      } finally {
        setIsLoading(false);
        
        if (options.onLoading) {
          options.onLoading(false);
        }
      }
    },
    [asyncFunction, options]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    data,
    error,
    isLoading,
    execute,
    reset,
  };
}
```

```tsx
// src/components/UserList.tsx
import { useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { ErrorFallback } from '../components/ErrorBoundary/ErrorFallback';

export function UserList() {
  const [retryCount, setRetryCount] = useState(0);
  
  const { data, error, isLoading, refetch } = useUsers({
    page: 1,
    limit: 10,
  });

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    refetch();
  };

  const handleGlobalError = (error: Error, errorInfo: ErrorInfo) => {
    // Custom error handling logic
    console.error('Global error caught:', error, errorInfo);
  };

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  if (error) {
    return (
      <div className="error-state">
        <h3>Failed to load users</h3>
        <p>{error.message}</p>
        <div className="error-actions">
          <button onClick={handleRetry} className="btn btn--primary">
            Retry ({retryCount})
          </button>
          <button onClick={() => window.location.reload()} className="btn btn--secondary">
            Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary
      onError={handleGlobalError}
      fallback={<ErrorFallback error={error} onRetry={handleRetry} />}
    >
      <div className="user-list">
        <h2>Users</h2>
        {data?.users.map(user => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </ErrorBoundary>
  );
}
```

```typescript
// src/utils/errorHandler.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleApiError(error: any): AppError {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return new AppError(
          data?.message || 'Invalid request',
          'BAD_REQUEST',
          status
        );
      case 401:
        return new AppError(
          'You need to log in to access this resource',
          'UNAUTHORIZED',
          status
        );
      case 403:
        return new AppError(
          'You do not have permission to access this resource',
          'FORBIDDEN',
          status
        );
      case 404:
        return new AppError(
          'The requested resource was not found',
          'NOT_FOUND',
          status
        );
      case 422:
        return new AppError(
          data?.message || 'Validation failed',
          'VALIDATION_ERROR',
          status
        );
      case 500:
        return new AppError(
          'Server error. Please try again later.',
          'SERVER_ERROR',
          status
        );
      default:
        return new AppError(
          data?.message || `Server error (${status})`,
          'SERVER_ERROR',
          status
        );
    }
  } else if (error.request) {
    // Network error
    return new AppError(
      'Network error. Please check your connection.',
      'NETWORK_ERROR'
    );
  } else {
    // Other error
    return new AppError(
      error.message || 'An unexpected error occurred',
      'UNKNOWN_ERROR',
      undefined,
      error
    );
  }
}

export function logError(error: Error, context?: Record<string, any>) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group('🚨 Application Error');
    console.error('Error:', error);
    if (context) {
      console.error('Context:', context);
    }
    console.groupEnd();
  }

  // Send to error tracking service
  try {
    // Example: Sentry.captureException(error, { extra: context });
    // Example: LogRocket.captureException(error, { extra: context });
  } catch (loggingError) {
    console.error('Failed to log error:', loggingError);
  }
}
```

```tsx
// src/App.tsx
import { useEffect } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  useEffect(() => {
    // Global error handlers
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      // Send to error tracking service
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      // Send to error tracking service
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <ErrorBoundary>
      <div className="app">
        {/* App content */}
      </div>
    </ErrorBoundary>
  );
}

export default App;
```

## Notes
- Use Error Boundaries to catch component-level errors gracefully
- Implement proper error states for async operations
- Always provide user-friendly error messages with recovery options
- Log errors for debugging but don't expose technical details to users
- Use structured error types for consistent error handling
- Implement retry mechanisms for transient failures
- Handle network errors and timeouts appropriately
- Provide fallback UIs for non-critical feature failures
- Test error scenarios to ensure proper handling
- Use error tracking services for production monitoring