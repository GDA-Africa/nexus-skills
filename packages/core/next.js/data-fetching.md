---
skill: data-fetching
version: 1.0.0
framework: next.js
category: data
triggers:
  - "fetching data"
  - "data fetching"
  - "API calls"
  - "server-side data"
  - "client-side data"
author: "@nexus-framework/skills"
status: active
---

# Skill: Data Fetching (Next.js)

## When to Read This
Read this skill before implementing data fetching in any component or route in this project.

## Context
This project uses Next.js App Router with server components by default. Data fetching should prioritize server-side fetching for SEO and performance. Use `fetch()` with proper caching strategies, and consider using TanStack Query (React Query) for client-side state management when needed. Always implement proper error handling and loading states.

## Steps
1. Determine if data should be fetched on the server or client.
2. For server components: Use `fetch()` directly in the component or create a server action.
3. For client components: Use TanStack Query or SWR for data fetching.
4. Implement proper caching strategies using Next.js cache options.
5. Add error boundaries for error handling.
6. Implement loading states with Suspense where appropriate.
7. Consider data validation using Zod schemas.

## Patterns We Use
- Server components: Direct `fetch()` calls with caching options
- Client components: TanStack Query with query keys and stale time
- Caching: Use `revalidate` and `tags` for ISR (Incremental Static Regeneration)
- Error handling: Custom error boundaries and error states
- Loading states: Suspense boundaries and skeleton loaders
- Data validation: Zod schemas for API response validation
- Query keys: Descriptive arrays for cache invalidation

## Anti-Patterns — Never Do This
- ❌ Do not use `useEffect` for data fetching in server components
- ❌ Do not fetch the same data multiple times without caching
- ❌ Do not ignore error states — always handle loading and error cases
- ❌ Do not use client-side fetching for SEO-critical data
- ❌ Do not hardcode API endpoints — use environment variables
- ❌ Do not fetch large datasets without pagination or virtualization

## Example

```tsx
// Server component with direct fetch
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const response = await fetch(`${process.env.API_URL}/dashboard`, {
    headers: {
      'Authorization': `Bearer ${process.env.API_TOKEN}`,
    },
    next: {
      revalidate: 60, // Revalidate every 60 seconds
      tags: ['dashboard'],
    },
  });
  
  const data = await response.json();
  
  return (
    <div>
      <h1>Dashboard</h1>
      <DashboardContent data={data} />
    </div>
  );
}
```

```tsx
// Client component with TanStack Query
// components/UserList.tsx
'use client';

import { useQuery } from '@tanstack/react-query';

interface User {
  id: string;
  name: string;
  email: string;
}

async function fetchUsers(): Promise<User[]> {
  const response = await fetch('/api/users');
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
}

export function UserList() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) return <div>Loading users...</div>;
  if (error) return <div>Error loading users</div>;

  return (
    <ul>
      {data?.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

```tsx
// With Suspense boundary
// app/dashboard/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="space-y-4">
      <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
      <div className="space-y-2">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-4 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    </div>
  );
}
```

## Notes
- Use `revalidatePath()` or `revalidateTag()` to manually trigger cache invalidation
- Consider using `streaming` for large datasets to improve performance
- Implement proper error boundaries to catch and handle errors gracefully
- Use `useTransition` for optimistic updates in client components
- Always validate API responses with TypeScript types or Zod schemas
- Consider using `fetch()` with `cache: 'no-store'` for real-time data that shouldn't be cached