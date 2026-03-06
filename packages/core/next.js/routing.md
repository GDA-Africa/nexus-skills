---
skill: routing
version: 1.0.0
framework: next.js
category: routing
triggers:
  - "adding a route"
  - "creating a new page"
  - "adding navigation"
  - "new page"
  - "URL handler"
author: "@nexus-framework/skills"
status: active
---

# Skill: Routing (Next.js)

## When to Read This
Read this skill before creating any new route or page in this project.

## Context
This project uses Next.js App Router with a feature-based structure. Routes are defined by folder structure in `app/` directory. Each feature has its own route segment with optional layout, page, and API endpoints. Dynamic routes use bracket syntax, and nested routes follow the folder hierarchy. All routes should include proper metadata and error handling.

## Steps
1. Determine the route path and whether it's dynamic or nested.
2. Create the route folder in `app/[feature]/[route-segment]/`.
3. Create `page.tsx` for the main route component.
4. Add route metadata using `generateMetadata` function.
5. Create `layout.tsx` if the route needs a shared layout.
6. Add the route to the main navigation in `app/layout.tsx` or feature navigation.
7. Run `npm run build` to verify the route is generated correctly.

## Patterns We Use
- Route structure: `app/[feature]/[route]/page.tsx`
- Dynamic routes: `app/[feature]/[id]/page.tsx` or `app/[feature]/[...slug]/page.tsx`
- Nested routes: `app/[feature]/[parent]/[child]/page.tsx`
- Metadata: Always include `generateMetadata` with title and description
- Layouts: Use `layout.tsx` for shared UI across route segments
- Navigation: Use Next.js `Link` component with absolute paths
- Error handling: Implement `error.tsx` for route-specific error boundaries

## Anti-Patterns — Never Do This
- ❌ Do not create routes outside the `app/` directory
- ❌ Do not use `pages/` directory — this project uses App Router only
- ❌ Do not hardcode navigation links — use the navigation configuration
- ❌ Do not omit metadata — every route must have proper SEO metadata
- ❌ Do not create deeply nested routes without considering URL structure
- ❌ Do not use client-side routing for initial page loads

## Example

```tsx
// app/dashboard/settings/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings | Dashboard',
  description: 'Manage your account and application settings',
};

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="space-y-6">
        {/* Settings content */}
      </div>
    </div>
  );
}
```

```tsx
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        {/* Dashboard navigation */}
      </nav>
      <main className="container mx-auto py-6">
        {children}
      </main>
    </div>
  );
}
```

## Notes
- All routes should be typed using Next.js route segment config if applicable
- Use `notFound()` for 404 pages and `redirect()` for client-side redirects
- Consider using `loading.tsx` for route-level loading states
- Route groups (folders starting with underscore) can be used to organize routes without affecting URL structure