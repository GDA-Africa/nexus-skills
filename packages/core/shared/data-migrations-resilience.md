---
skill: data-migrations-resilience
version: 1.0.0
framework: shared
category: data
invocation: model
triggers:
  - "data migrations"
  - "zero downtime migrations"
  - "database resilience"
  - "connection pooling"
  - "transaction isolation"
  - "database lock contention"
author: "@nexus-framework/skills"
status: active
updated: 2026-10-03
related:
  - "database-patterns"
  - "performance-optimization"
  - "monitoring-observability"
---

# Skill: Data Migrations & Database Resilience (Shared)

## When to Read This
Read this skill before modifying database schemas in production, creating indexes on large tables, configuring connection pools, handling database deadlocks, or designing zero-downtime schema migrations.

## Context
In production environments, running raw destructive DDL migrations (`DROP COLUMN`, `RENAME COLUMN`, unindexed `ALTER TABLE`) will acquire exclusive table locks (`AccessExclusiveLock`), blocking all concurrent reads and writes, and causing service outages. This skill defines our canonical patterns for the **Expand and Contract** migration methodology, safe DDL execution, connection pool governance, and transaction isolation resilience.

## Steps
1. **Apply the Expand and Contract Pattern**: Never rename or drop active columns in a single deployment.
   - **Phase 1 (Expand)**: Add the new column/table as nullable or with a safe default. Deploy application code that dual-writes to both old and new representations, reading from old.
   - **Phase 2 (Backfill)**: Run an asynchronous batch migration in small chunks to populate existing rows with `lock_timeout` enabled.
   - **Phase 3 (Switch)**: Deploy application code that reads from the new column/table and writes to the new.
   - **Phase 4 (Contract)**: Drop the old column/table only after complete verification and canary stability.
2. **Execute Non-Blocking DDL**:
   - In PostgreSQL, always create indexes using `CREATE INDEX CONCURRENTLY` to avoid write locks.
   - Set a conservative `statement_timeout` (e.g. 5s) and `lock_timeout` (e.g. 2s) on migration transactions so slow lock acquisition aborts before queuing traffic behind it.
3. **Batch High-Volume Backfills**: Break bulk updates into chunks of 1,000–5,000 rows with pauses (`sleep 50ms`) between batches to avoid replication lag and excessive WAL/disk I/O.
4. **Tune Connection Pooling**:
   - For traditional servers: configure pool size using the standard formula $N = 2 \times \text{CPU cores} + \text{disk spindles}$.
   - For serverless / edge (Lambda, Vercel, Cloudflare): use an external connection pooler (PgBouncer, Neon, Supabase Pooler) in transaction pooling mode.
5. **Handle Concurrency & Deadlocks**:
   - Use Optimistic Concurrency Control (OCC) with a numeric `version` column for high-contention records.
   - Acquire locks in a consistent, deterministic order across all application transactions.
6. **Implement Cache-Aside with Invalidation**:
   - Update database first in a transaction, then invalidate related cache keys (never update cache with stale uncommitted data).

## Patterns We Use
- **Expand-and-Contract Lifecycle**: Separate schema evolution across releases so existing running app instances never break when new schema arrives.
- **Concurrent Indexing**: Always add indexes in standalone transactions with `CONCURRENTLY`.
- **Lock Timeout Protection**: Prefix migrations with `SET lock_timeout = '2s';` so migration runners fail fast if another transaction holds a lock, rather than freezing the connection pool.
- **Optimistic Locking**: Update queries check `WHERE id = :id AND version = :currentVersion`, incrementing `version = version + 1`. If 0 rows updated, throw conflict error.
- **Idempotent Migration Scripts**: Ensure every migration script is safe to rerun if interrupted (`IF NOT EXISTS`, `IF EXISTS`).

## Anti-Patterns — Never Do This
- ❌ Do not rename columns directly in production databases (`ALTER TABLE RENAME COLUMN` breaks rolling deployments).
- ❌ Do not create indexes on large tables without `CONCURRENTLY` (locks out reads and writes).
- ❌ Do not perform massive multi-million row `UPDATE` or `DELETE` statements in a single transaction (bloats transaction logs and causes lock escalation).
- ❌ Do not add columns with complex, volatile default expressions (e.g. `DEFAULT random()`) that rewrite every row on disk during lock.
- ❌ Do not open thousands of direct client connections from serverless functions to PostgreSQL without a connection pooler.
- ❌ Do not leave transactions open across asynchronous network calls (e.g. calling Stripe or OpenAI inside an open DB transaction).
- ❌ Do not perform schema migrations without verifying the rollback/down script.

## Example

```sql
-- ✅ Phase 1: Expand — Safe, Non-Blocking Schema Evolution (PostgreSQL)

-- Guard against blocking live traffic: abort if locks cannot be acquired in 2s
SET lock_timeout = '2000ms';
SET statement_timeout = '5000ms';

-- Add new column as nullable first (instant metadata change, no row rewrite)
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_e164 VARCHAR(32);

-- Phase 1b: Create index concurrently in its own standalone transaction
COMMIT;
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_phone_e164 ON users(phone_e164);
```

```typescript
// ✅ Phase 2: Resilient Batch Backfill Script (Node.js / TypeScript)
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function batchMigrateUserPhoneNumbers(batchSize = 2000): Promise<void> {
  let lastProcessedId = '';
  let hasMore = true;
  let totalProcessed = 0;

  while (hasMore) {
    // 1. Fetch batch by primary key cursor (avoids OFFSET performance degradation)
    const users = await prisma.user.findMany({
      where: {
        id: { gt: lastProcessedId },
        phone_e164: null,
        legacy_phone: { not: null },
      },
      select: { id: true, legacy_phone: true },
      take: batchSize,
      orderBy: { id: 'asc' },
    });

    if (users.length === 0) {
      hasMore = false;
      break;
    }

    // 2. Perform batched update inside a lightweight transaction
    await prisma.$transaction(
      users.map((user) => {
        const formatted = normalizeToE164(user.legacy_phone!);
        return prisma.user.update({
          where: { id: user.id },
          data: { phone_e164: formatted },
        });
      }),
    );

    totalProcessed += users.length;
    lastProcessedId = users[users.length - 1].id;
    console.log(`Migrated ${totalProcessed} rows (last ID: ${lastProcessedId})...`);

    // 3. Pause briefly to allow WAL flush and read traffic prioritization
    await new Promise((res) => setTimeout(res, 50));
  }

  console.log(`Backfill complete. Total migrated: ${totalProcessed}`);
}

function normalizeToE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('1') ? `+${digits}` : `+1${digits}`;
}
```

```typescript
// ✅ Optimistic Concurrency Control (OCC) Pattern
export async function updateAccountBalance(
  accountId: string,
  amount: number,
  expectedVersion: number,
): Promise<void> {
  const result = await prisma.account.updateMany({
    where: {
      id: accountId,
      version: expectedVersion, // Enforce version match
    },
    data: {
      balance: { increment: amount },
      version: { increment: 1 }, // Atomically increment version
    },
  });

  if (result.count === 0) {
    throw new Error(
      `Conflict detected: Account ${accountId} was modified by another transaction. Expected version ${expectedVersion}.`,
    );
  }
}
```

## Validation
- Migrations define explicit `lock_timeout` and `statement_timeout` safeguards.
- Indexes on tables with $>10,000$ rows specify `CONCURRENTLY`.
- Backfill scripts operate on cursor-based pagination and pause between chunks.
- Concurrent updates with race conditions use OCC or explicit row-level locks (`SELECT ... FOR UPDATE`).
- Rolling deployments continue serving 100% of requests throughout all phases of migration.

## Notes
- In MySQL/InnoDB, use tools like `gh-ost` or `pt-online-schema-change` for non-blocking table alterations on large datasets.
- Always monitor database connection counts and replication lag metrics during active backfills.
