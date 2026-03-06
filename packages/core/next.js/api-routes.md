---
skill: api-routes
version: 1.0.0
framework: next.js
category: api
triggers:
  - "creating an API route"
  - "adding an endpoint"
  - "new API endpoint"
  - "server action"
  - "backend route"
author: "@nexus-framework/skills"
status: active
---

# Skill: API Routes (Next.js)

## When to Read This
Read this skill before creating any new API route or server action in this project.

## Context
This project uses Next.js App Router with the new route handlers in the `app/api/` directory. API routes are defined as `route.ts` files within feature-specific folders. All API routes should include proper error handling, validation, and security measures. Server actions are used for form submissions and mutations from client components.

## Steps
1. Determine if the endpoint should be a route handler or server action.
2. Create the route folder in `app/api/[feature]/[endpoint]/`.
3. Create `route.ts` for REST endpoints or `actions.ts` for server actions.
4. Implement proper request validation using Zod or similar.
5. Add error handling with appropriate HTTP status codes.
6. Include security headers and CORS configuration if needed.
7. Add rate limiting for public endpoints.
8. Write tests for the endpoint functionality.

## Patterns We Use
- Route structure: `app/api/[feature]/[endpoint]/route.ts`
- Server actions: `app/api/[feature]/[action]/actions.ts`
- Validation: Use Zod schemas for request validation
- Error handling: Custom error classes with HTTP status codes
- Authentication: Use NextAuth.js or custom auth middleware
- Rate limiting: Implement for public endpoints using Upstash or similar
- Response format: Consistent JSON structure with data, error, and metadata

## Anti-Patterns — Never Do This
- ❌ Do not expose sensitive data in API responses without proper filtering
- ❌ Do not skip input validation — always validate request data
- ❌ Do not hardcode API keys or secrets in route handlers
- ❌ Do not create overly complex nested routes without considering maintainability
- ❌ Do not ignore error handling — always return appropriate HTTP status codes
- ❌ Do not expose internal database structure in API responses

## Example

```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserById, createUser } from '@/lib/database/users';

const UserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const user = await getUserById(id);
      return NextResponse.json({ data: user });
    }
    
    return NextResponse.json({ error: 'User ID required' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = UserSchema.parse(body);
    
    const user = await createUser(validatedData);
    return NextResponse.json({ data: user }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

```typescript
// app/api/auth/login/actions.ts
'use server';

import { signIn } from '@/lib/auth';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function loginUser(formData: FormData) {
  try {
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };
    
    const validatedData = LoginSchema.parse(data);
    
    await signIn('credentials', {
      ...validatedData,
      redirect: false,
    });
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Invalid credentials' };
  }
}
```

## Notes
- Use `revalidatePath()` or `revalidateTag()` in server actions to trigger cache invalidation
- Implement proper CORS headers for cross-origin requests
- Consider using middleware for authentication and authorization
- Always sanitize and validate user input to prevent injection attacks
- Use environment variables for configuration and secrets
- Document API endpoints using OpenAPI/Swagger if the project requires it