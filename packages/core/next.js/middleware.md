---
skill: middleware
version: 1.0.0
framework: next.js
category: api
triggers:
  - "middleware"
  - "app middleware"
  - "route middleware"
  - "request handling"
  - "authentication middleware"
author: "@nexus-framework/skills"
status: active
---

# Skill: Middleware (Next.js)

## When to Read This
Read this skill before creating or modifying middleware for request handling, authentication, or route protection in this project.

## Context
This project uses Next.js middleware for request-level operations including authentication, redirects, and request/response modifications. Middleware runs before the request reaches the route handler and can modify the request, response, or redirect the user. It's ideal for cross-cutting concerns that affect multiple routes or the entire application.

## Steps
1. Determine if the functionality belongs in middleware vs route handlers.
2. Create or modify `middleware.ts` in the `app/` directory.
3. Define the matcher pattern for which routes the middleware should apply to.
4. Implement the middleware logic using the NextRequest and NextResponse APIs.
5. Test the middleware with various request scenarios.
6. Add appropriate error handling and logging.
7. Consider performance implications of middleware operations.

## Patterns We Use
- Location: `app/middleware.ts` for app directory middleware
- Matching: Use `matcher` array to specify which routes trigger middleware
- Authentication: Check for auth tokens and redirect unauthorized requests
- Redirects: Use `NextResponse.redirect()` for route changes
- Headers: Modify request/response headers as needed
- Edge runtime: Leverage edge functions for performance
- Rate limiting: Implement basic rate limiting when needed

## Anti-Patterns — Never Do This
- ❌ Do not perform heavy computations in middleware
- ❌ Do not make database calls in middleware unless absolutely necessary
- ❌ Do not use middleware for business logic that belongs in route handlers
- ❌ Do not ignore TypeScript types for request/response objects
- ❌ Do not create overly broad matchers that run middleware on static assets
- ❌ Do not forget to handle edge cases and error scenarios

## Example

```typescript
// app/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define which routes should be protected
const protectedRoutes = ['/dashboard', '/admin', '/profile'];
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isAuthRoute = authRoutes.some(route => path.startsWith(route));
  
  // Get auth token from cookies
  const token = request.cookies.get('auth_token')?.value;
  
  // Redirect authenticated users away from auth pages
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Protect routes that require authentication
  if (isProtectedRoute && !token) {
    const absoluteURL = new URL('/login', request.url);
    return NextResponse.redirect(absoluteURL.toString());
  }
  
  // Add custom headers
  const response = NextResponse.next();
  response.headers.set('x-custom-header', 'nexus-app');
  
  return response;
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

```typescript
// app/middleware.ts - Advanced example with rate limiting
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs });
    return false;
  }
  
  if (record.count >= limit) {
    return true;
  }
  
  record.count++;
  return false;
}

export function middleware(request: NextRequest) {
  const ip = request.ip || 'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const identifier = `${ip}-${userAgent}`;
  
  // Apply rate limiting to API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    if (isRateLimited(identifier, 100, 60000)) { // 100 requests per minute
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '60',
        },
      });
    }
  }
  
  // Add security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}
```

```typescript
// app/middleware.ts - Locale detection example
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const DEFAULT_LOCALE = 'en';
const SUPPORTED_LOCALES = ['en', 'fr', 'es', 'de'];

function getLocaleFromRequest(request: NextRequest): string {
  // Check URL first
  const urlLocale = request.nextUrl.pathname.split('/')[1];
  if (SUPPORTED_LOCALES.includes(urlLocale)) {
    return urlLocale;
  }
  
  // Check accept-language header
  const acceptLanguage = request.headers.get('accept-language');
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim())
      .find(lang => SUPPORTED_LOCALES.includes(lang));
    
    if (preferredLocale) {
      return preferredLocale;
    }
  }
  
  return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Skip middleware for API routes and static files
  if (pathname.startsWith('/api/') || pathname.includes('.')) {
    return NextResponse.next();
  }
  
  const locale = getLocaleFromRequest(request);
  
  // Redirect to locale-prefixed URL if not already present
  if (!SUPPORTED_LOCALES.some(loc => pathname.startsWith(`/${loc}/`)) && !SUPPORTED_LOCALES.includes(pathname.split('/')[1])) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${pathname}`;
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}
```

## Notes
- Middleware runs on the edge, so avoid heavy computations
- Use environment variables for configuration values
- Consider caching expensive operations when possible
- Always handle edge cases and provide fallback behavior
- Test middleware thoroughly with different request scenarios
- Use proper TypeScript types for request and response objects
- Document the purpose and behavior of each middleware function
- Consider using middleware chaining for complex logic