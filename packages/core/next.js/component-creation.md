---
skill: component-creation
version: 1.0.0
framework: next.js
category: ui
triggers:
  - "creating a new component"
  - "adding a React component"
  - "building a UI element"
  - "new component"
  - "add a page component"
author: "@nexus-framework/skills"
status: active
---

# Skill: Creating Components (Next.js)

## When to Read This
Read this skill before creating any new React component in this project.

## Context
This project uses a feature-based folder structure where components live alongside their feature module, not in a global `components/` directory. All components are server components by default; add `'use client'` only when you need browser APIs or interactivity. Components follow a consistent naming pattern and export structure to maintain type safety and predictability.

## Steps
1. Determine whether the component is server or client (default: server).
2. Create the file at `src/features/[feature]/[ComponentName].tsx`.
3. Export the component as a named export (not default export).
4. Add a JSDoc comment above the function with a one-line description.
5. Define props interface as `[ComponentName]Props` above the component.
6. Run `npm run type-check` or `yarn type-check` to confirm no type errors.

## Patterns We Use
- File names: PascalCase (`UserCard.tsx`, `ProductList.tsx`)
- Props interfaces: Named `[ComponentName]Props` defined above the component
- Imports: Absolute paths using the `@/` alias for `src/`
- Exports: Named exports only — never `export default`
- Server components: Default unless browser APIs or interactivity required
- Styling: Tailwind CSS classes only, no inline styles or CSS modules

## Anti-Patterns — Never Do This
- ❌ Do not create components in `src/components/` — use the feature folder
- ❌ Do not use `export default` — all exports are named
- ❌ Do not add `'use client'` unless the component genuinely needs browser APIs
- ❌ Do not inline styles — use Tailwind classes only
- ❌ Do not use global CSS imports in components
- ❌ Do not create deeply nested component hierarchies without considering reusability

## Example

```tsx
// src/features/user/UserCard.tsx
import { Avatar } from '@/components/ui/avatar';

interface UserCardProps {
  name: string;
  email: string;
  avatarUrl?: string;
}

/** Displays a single user's name, email, and avatar. */
export function UserCard({ name, email, avatarUrl }: UserCardProps) {
  return (
    <div className="rounded-lg border p-4 bg-card hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3">
        <Avatar src={avatarUrl} alt={name} size="md" />
        <div>
          <p className="font-semibold text-foreground">{name}</p>
          <p className="text-sm text-muted-foreground">{email}</p>
        </div>
      </div>
    </div>
  );
}
```

## Notes
- For components that use `useSearchParams()`, Next.js requires a Suspense boundary — see `docs/05_patterns.md` for the wrapper pattern.
- This convention was adopted in v0.2.0 — older files in `src/components/` are legacy and should be migrated gradually.
- Always consider if the component should be a server component first, then add `'use client'` only if necessary for interactivity.