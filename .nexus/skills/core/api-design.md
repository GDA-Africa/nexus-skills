---
skill: api-design
version: 1.0.0
framework: shared
category: api
triggers:
  - "API design"
  - "REST API"
  - "GraphQL"
  - "API conventions"
  - "API documentation"
author: "@nexus-framework/skills"
status: active
---

# Skill: API Design (Shared)

## When to Read This
Read this skill when designing, implementing, or modifying APIs (REST, GraphQL, or other API types).

## Context
APIs are the contract between frontend and backend systems. This project follows RESTful principles for HTTP APIs and GraphQL best practices for GraphQL APIs. APIs should be consistent, predictable, well-documented, and versioned appropriately. Error handling, authentication, and rate limiting are essential considerations for all APIs.

## Steps
1. Define API endpoints following REST conventions or GraphQL schema design
2. Use consistent naming conventions and HTTP status codes
3. Implement proper authentication and authorization
4. Add comprehensive error handling with meaningful messages
5. Include API versioning for backward compatibility
6. Document APIs with OpenAPI/Swagger or GraphQL schema
7. Implement rate limiting and input validation
8. Add comprehensive tests for all endpoints

## Patterns We Use
- REST conventions: Use HTTP methods appropriately (GET, POST, PUT, DELETE, PATCH)
- Resource naming: Use plural nouns, kebab-case for paths
- HTTP status codes: Use appropriate codes (200, 201, 400, 401, 403, 404, 500)
- Pagination: Use cursor-based or offset-based pagination for lists
- Filtering: Support query parameters for filtering, sorting, and searching
- Versioning: Use URL versioning (/api/v1/) or header versioning
- Authentication: JWT tokens, API keys, or OAuth2 as appropriate
- Rate limiting: Implement per-user or per-IP rate limits

## Anti-Patterns — Never Do This
- ❌ Do not use HTTP verbs incorrectly (e.g., GET for mutations)
- ❌ Do not return inconsistent data structures
- ❌ Do not expose sensitive information in error messages
- ❌ Do not ignore input validation and sanitization
- ❌ Do not create overly complex nested endpoints
- ❌ Do not forget to handle edge cases and error scenarios
- ❌ Do not ignore API versioning for breaking changes
- ❌ Do not expose internal database structure in API responses

## Example

```typescript
// ✅ REST API endpoint design
// GET /api/v1/users - List users with filtering
// GET /api/v1/users/123 - Get specific user
// POST /api/v1/users - Create new user
// PUT /api/v1/users/123 - Update user (full update)
// PATCH /api/v1/users/123 - Update user (partial update)
// DELETE /api/v1/users/123 - Delete user

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface UserListQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// GET /api/v1/users
export async function getUsers(query: UserListQuery): Promise<{
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const { page = 1, limit = 20, search, sortBy, sortOrder } = query;
  
  const filters = search ? { name: { contains: search } } : {};
  const orderBy = sortBy ? { [sortBy]: sortOrder || 'asc' } : { createdAt: 'desc' };
  
  const [users, total] = await Promise.all([
    database.users.findMany({
      where: filters,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
    database.users.count({ where: filters }),
  ]);

  return {
    data: users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// POST /api/v1/users
export async function createUser(userData: {
  name: string;
  email: string;
}): Promise<User> {
  const existingUser = await database.users.findUnique({
    where: { email: userData.email }
  });

  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  return database.users.create({
    data: {
      ...userData,
      email: userData.email.toLowerCase().trim(),
    },
  });
}
```

```typescript
// ✅ GraphQL schema design
// schema.graphql
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Post {
  id: ID!
  title: String!
  content: String!
  author: User!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Query {
  users(
    page: Int = 1
    limit: Int = 20
    search: String
    sortBy: UserSortField = CREATED_AT
    sortOrder: SortOrder = DESC
  ): UserConnection!
  
  user(id: ID!): User
  
  posts(
    userId: ID
    page: Int = 1
    limit: Int = 20
  ): PostConnection!
}

type Mutation {
  createUser(input: CreateUserInput!): User!
  updateUser(id: ID!, input: UpdateUserInput!): User!
  deleteUser(id: ID!): Boolean!
}

input CreateUserInput {
  name: String!
  email: String!
}

input UpdateUserInput {
  name: String
  email: String
}

enum UserSortField {
  NAME
  EMAIL
  CREATED_AT
}

enum SortOrder {
  ASC
  DESC
}

type UserConnection {
  edges: [User!]!
  pageInfo: PageInfo!
}

type PostConnection {
  edges: [Post!]!
  pageInfo: PageInfo!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  totalCount: Int!
}
```

```typescript
// ✅ Error handling and responses
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    requestId: string;
    timestamp: string;
  };
}

class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: Record<string, any>
  ) {
    super(message);
  }
}

// Error handling middleware
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('API Error:', error);

  if (error instanceof ApiError) {
    return res.status(error.status).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
      meta: {
        requestId: req.headers['x-request-id'] as string,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Generic server error
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
    meta: {
      requestId: req.headers['x-request-id'] as string,
      timestamp: new Date().toISOString(),
    },
  });
}
```

```typescript
// ✅ Rate limiting and validation
import rateLimit from 'express-rate-limit';
import { z } from 'zod';

// Rate limiting middleware
const createRateLimit = (windowMs: number, max: number) =>
  rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

// Apply different rate limits for different endpoints
const authRateLimit = createRateLimit(15 * 60 * 1000, 5); // 5 attempts per 15 minutes
const apiRateLimit = createRateLimit(15 * 60 * 1000, 100); // 100 requests per 15 minutes

// Input validation schemas
const createUserSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
});

const updateUserSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().optional(),
});

// Validation middleware
function validateInput(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input data',
            details: error.errors,
          },
        });
      }
      next(error);
    }
  };
}
```

## Notes
- Use consistent API response formats across all endpoints
- Implement proper CORS configuration for cross-origin requests
- Use environment variables for API configuration
- Document APIs with OpenAPI/Swagger for REST or GraphQL schema
- Implement proper logging for API requests and responses
- Consider using API gateways for microservices architectures
- Use HATEOAS (Hypermedia as the Engine of Application State) for discoverable APIs
- Implement proper caching strategies with appropriate cache headers
- Use API versioning to maintain backward compatibility
- Test APIs thoroughly with both unit and integration tests