---
skill: database-patterns
version: 1.0.0
framework: shared
category: data
triggers:
  - "database patterns"
  - "database design"
  - "migrations"
  - "query optimization"
  - "database modeling"
author: "@nexus-framework/skills"
status: active
---

# Skill: Database Patterns (Shared)

## When to Read This
Read this skill when designing database schemas, writing queries, implementing migrations, or optimizing database performance.

## Context
This project follows database best practices for schema design, query optimization, and data integrity. We use ORMs or query builders for type safety and maintainability while ensuring efficient database operations. Database design should support the application's data access patterns and scale appropriately with data growth.

## Steps
1. Design database schema based on application requirements and relationships
2. Use proper data types and constraints for data integrity
3. Create indexes for frequently queried fields
4. Implement database migrations for schema changes
5. Write efficient queries avoiding N+1 problems and unnecessary data fetching
6. Use transactions for data consistency when needed
7. Implement proper error handling for database operations
8. Monitor and optimize query performance regularly

## Patterns We Use
- ORM/Query Builder: Prisma, TypeORM, Sequelize, or Knex based on project choice
- Migrations: Version-controlled schema changes with rollback capability
- Indexing: Strategic indexes on foreign keys, frequently filtered fields, and sort columns
- Relationships: Proper foreign key constraints and relationship modeling
- Transactions: Use transactions for multi-step operations requiring atomicity
- Connection pooling: Configure appropriate pool sizes for database connections
- Query optimization: Use EXPLAIN plans and monitor slow queries
- Data validation: Database-level constraints plus application-level validation

## Anti-Patterns — Never Do This
- ❌ Do not use SELECT * in production queries
- ❌ Do not ignore database connection limits and pooling
- ❌ Do not create migrations that can't be rolled back
- ❌ Do not forget to index foreign keys and frequently queried columns
- ❌ Do not write N+1 queries without eager loading
- ❌ Do not ignore database transaction isolation levels
- ❌ Do not store sensitive data without encryption
- ❌ Do not use string concatenation in SQL queries (SQL injection risk)

## Example

```typescript
// ✅ Database schema design with Prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relationships
  posts     Post[]
  profile   Profile?
  
  @@map("users")
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relationships
  authorId String
  author   User     @relation(fields: [authorId], references: [id])
  tags     Tag[]    @relation("PostTags")
  
  @@map("posts")
}

model Tag {
  id    String @id @default(cuid())
  name  String @unique
  
  // Relationships
  posts Post[] @relation("PostTags")
  
  @@map("tags")
}

model Profile {
  id     String @id @default(cuid())
  bio    String?
  userId String @unique
  
  // Relationships
  user   User   @relation(fields: [userId], references: [id])
  
  @@map("profiles")
}
```

```typescript
// ✅ Efficient querying with proper relationships
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ✅ Eager loading to avoid N+1 queries
export async function getUsersWithPosts() {
  return prisma.user.findMany({
    include: {
      posts: {
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      profile: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

// ✅ Pagination with cursor-based approach
export async function getPostsPaginated(cursor?: string, limit: number = 10) {
  const where = cursor ? { id: { gt: cursor } } : {};
  
  const [posts, totalCount] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1, // Get one extra to check if there's a next page
      include: {
        author: {
          select: { name: true, email: true },
        },
        tags: true,
      },
    }),
    prisma.post.count(),
  ]);

  const hasNextPage = posts.length > limit;
  if (hasNextPage) posts.pop(); // Remove the extra item

  return {
    posts,
    pagination: {
      hasNextPage,
      totalCount,
      cursor: posts[posts.length - 1]?.id,
    },
  };
}

// ✅ Transaction for data consistency
export async function createUserWithProfile(userData: {
  email: string;
  name: string;
  bio?: string;
}) {
  return prisma.$transaction(async (tx) => {
    // Create user
    const user = await tx.user.create({
      data: {
        email: userData.email.toLowerCase().trim(),
        name: userData.name,
      },
    });

    // Create profile in same transaction
    if (userData.bio) {
      await tx.profile.create({
        data: {
          bio: userData.bio,
          userId: user.id,
        },
      });
    }

    return user;
  });
}
```

```typescript
// ✅ Database migrations with proper rollback
// migration.sql
-- CreateTable
CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey (if needed)
ALTER TABLE "posts" ADD CONSTRAINT "posts_author_id_fkey" 
FOREIGN KEY ("author_id") REFERENCES "users"("id") 
ON DELETE RESTRICT ON UPDATE CASCADE;
```

```typescript
// ✅ Query optimization with proper indexing
// Database indexes for common query patterns
// These would be added via migrations

-- Index for user lookups by email
CREATE INDEX "idx_users_email" ON "users"("email");

-- Index for posts by author with published filter
CREATE INDEX "idx_posts_author_published" ON "posts"("author_id", "published");

-- Index for posts by creation date (common for pagination)
CREATE INDEX "idx_posts_created_at" ON "posts"("created_at");

-- Composite index for filtering and sorting
CREATE INDEX "idx_posts_published_created" ON "posts"("published", "created_at");
```

```typescript
// ✅ Connection pooling configuration
// database.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  errorFormat: 'pretty',
  // Connection pooling configuration
  __internal: {
    engine: {
      // Connection pool settings
      maxConnections: 10,
      idleTimeout: 30000, // 30 seconds
      connectionTimeout: 5000, // 5 seconds
    },
  },
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
```

```typescript
// ✅ Database error handling
export class DatabaseError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
  }
}

export async function handleDatabaseOperation<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error.code === 'P2002') {
      throw new DatabaseError(
        'DUPLICATE_ENTRY',
        'A record with this data already exists',
        error.meta
      );
    }
    
    if (error.code === 'P2025') {
      throw new DatabaseError(
        'RECORD_NOT_FOUND',
        'The requested record was not found',
        error.meta
      );
    }
    
    if (error.code === 'P2010') {
      throw new DatabaseError(
        'FOREIGN_KEY_CONSTRAINT',
        'Referenced record does not exist',
        error.meta
      );
    }
    
    // Generic database error
    throw new DatabaseError(
      'DATABASE_ERROR',
      'A database error occurred',
      error
    );
  }
}
```

## Notes
- Use database transactions for operations that must succeed or fail together
- Implement proper backup and recovery strategies
- Monitor slow queries and optimize with EXPLAIN ANALYZE
- Use connection pooling to manage database connections efficiently
- Consider read replicas for read-heavy workloads
- Implement proper data validation at both application and database levels
- Use database constraints for data integrity (NOT NULL, UNIQUE, FOREIGN KEY)
- Plan for database migrations in development and production
- Consider using database views for complex queries
- Implement proper indexing strategy based on query patterns