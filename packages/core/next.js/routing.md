---
skill: routing
version: 1.0.1
framework: next.js
category: routing
triggers:
- adding a route
- creating a new page
- adding navigation
- new page
- URL handler
author: '@nexus-framework/skills'
status: active
invocation: model
---

# Skill: Routing (Next.js)

## When to Read This
Read this skill before creating any new route or page in this project.

## Context
This project strictly follows the Next.js App Router (`app/` directory) conventions. We avoid the old Pages router (`pages/`). We use nested layouts, route groups for organizational grouping without affecting the URL path, and parallel routes for advanced dashboard structures.

## Steps
1. Determine the route path and whether it's dynamic or nested.
2. Create the route folder in `app/[feature]/[route-segment]/`.
3. Create `page.tsx` for the main route component.
4. Add route metadata using `generateMetadata` function.
5. Create `layout.tsx` if the route needs a shared layout.
6. Add the route to the main navigation in `app/layout.tsx` or feature navigation.
7. Run `npm run build` to verify the route is generated correctly.

## Patterns We Use
- App Router: Place pages in `app/[route]/page.tsx`.
- Route Groups: Use `(group-name)` for logical organization without URL impact.
- Dynamic Routes: Use `[id]` for dynamic segments (e.g. `app/user/[id]/page.tsx`).
- Server-Centric: Data fetches should typically happen in server components in `page.tsx` or `layout.tsx`.

## Anti-Patterns — Never Do This
- ❌ Do not create routing files outside the `app/` directory.
- ❌ Do not fetch data in client-side routing components if it can be done on the server.
- ❌ Do not mix Pages Router patterns (like `getServerSideProps`) in the App Router.

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