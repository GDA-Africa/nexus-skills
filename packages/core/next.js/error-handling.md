---
skill: error-handling
version: 1.0.0
framework: next.js
category: workflow
triggers:
  - "error handling"
  - "error boundary"
  - "error management"
  - "handling errors"
  - "error states"
author: "@nexus-framework/skills"
status: active
---

# Skill: Error Handling (Next.js)

## When to Read This
Read this skill before implementing error handling in components, API routes, or server actions in this project.

## Context
This project uses Next.js error boundaries and error pages for client-side errors, and proper HTTP status codes for server-side errors. Error handling should be consistent across the application with user-friendly messages and proper logging. Always distinguish between expected errors (validation, not found) and unexpected errors (server errors, network issues).

## Steps
1. Identify the type of error (client-side, server-side, network, validation).
2. For client components: Use error boundaries with fallback UI.
3. For server components: Use try-catch with proper error responses.
4. For API routes: Return appropriate HTTP status codes and error messages.
5. Implement global error handling in `error.tsx` and `global-error.tsx`.
6. Add error logging for debugging and monitoring.
7. Provide user-friendly error messages with recovery options when possible.

## Patterns We Use
- Error boundaries: `error.tsx` files for route-level error handling
- Global error boundary: `app/global-error.tsx` for app-wide errors
- HTTP status codes: 400 for bad request, 404 for not found, 500 for server error
- Error messages: User-friendly with actionable guidance
- Logging: Structured logging with error context
- Error types: Custom error classes for different error categories
- Recovery: Provide retry mechanisms and fallback content

## Anti-Patterns — Never Do This
- ❌ Do not expose sensitive information in error messages
- ❌ Do not ignore errors — always handle them appropriately
- ❌ Do not use generic error messages for all error types
- ❌ Do not log errors without context or correlation IDs
- ❌ Do not throw errors in render methods
- ❌ Do not use `console.error` in production code

## Example

```tsx
// app/error.tsx - Route-level error boundary
'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Route error:', error);
  }, [error]);

  return (
    <div className="container mx-auto py-8 text-center">
      <h2 className="text-2xl font-bold text-destructive mb-4">
        Something went wrong!
      </h2>
      <p className="text-muted-foreground mb-6">
        We're sorry, but something unexpected happened. Please try again.
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Try again
      </button>
    </div>
  );
}
```

```tsx
// components/ErrorBoundary.tsx - Custom error boundary
'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-md">
          <h3 className="font-semibold text-destructive">Something went wrong</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Please refresh the page or contact support if the problem persists.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
```

```typescript
// lib/errors.ts - Custom error classes
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}
```

```typescript
// app/api/users/route.ts - API error handling
import { NextResponse } from 'next/server';
import { NotFoundError, ValidationError } from '@/lib/errors';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      throw new ValidationError('User ID is required');
    }
    
    const user = await getUserById(id);
    
    if (!user) {
      throw new NotFoundError('User');
    }
    
    return NextResponse.json({ data: user });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: error.message, field: error.field },
        { status: 400 }
      );
    }
    
    if (error instanceof NotFoundError) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    // Log unexpected errors
    console.error('Unexpected error in GET /api/users:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Notes
- Use `notFound()` function for 404 responses in server components
- Use `redirect()` function for client-side redirects
- Implement error boundaries at the route level for better error isolation
- Consider using error tracking services like Sentry for production monitoring
- Always validate user input to prevent unexpected errors
- Use TypeScript error types for better type safety in error handling
- Provide different error handling for development vs production environments