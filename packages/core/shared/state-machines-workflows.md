---
skill: state-machines-workflows
version: 1.0.0
framework: shared
category: workflow
invocation: model
triggers:
  - "state machines"
  - "durable execution"
  - "workflow orchestration"
  - "saga pattern"
  - "retry backoff"
  - "idempotency key"
author: "@nexus-framework/skills"
status: active
updated: 2026-10-03
related:
  - "api-design"
  - "database-patterns"
  - "debugging"
---

# Skill: State Machines & Durable Workflows (Shared)

## When to Read This
Read this skill when implementing multi-step business processes (e.g. checkout, onboarding, document verification), background task orchestration, distributed transactions across services, or resilient retry and compensation mechanisms.

## Context
Distributed operations inevitably encounter partial failures: networks drop, third-party APIs time out, and nodes restart mid-execution. Hardcoding multi-step logic with nested `try/catch` and ad-hoc flags leads to inconsistent state, lost orders, duplicate billing, and phantom records. This skill defines our patterns for **Finite State Machines (FSM)**, **Idempotency Keys**, **Durable Execution**, and the **Saga Pattern** with compensating actions.

## Steps
1. **Model the Process as an Explicit State Machine**:
   - List all valid states (`draft`, `pending_payment`, `paid`, `provisioning`, `completed`, `failed`, `refunded`).
   - Define a strict transition matrix: reject any event that attempts an illegal state transition (e.g. transitioning directly from `failed` to `completed`).
2. **Enforce Idempotency at the Ingress Boundary**:
   - Require an `Idempotency-Key` header for mutating actions.
   - Atomically store `(idempotency_key, request_hash, status, response)` in a persistence store with unique constraint. Return existing response if key is already processed.
3. **Structure Multi-Service Operations as a Saga**:
   - Break multi-service interactions into individual steps.
   - For every forward action that alters external state, define a corresponding **compensating action** (`chargeCard` $\leftrightarrow$ `refundCharge`, `reserveInventory` $\leftrightarrow$ `releaseInventory`).
4. **Implement Checkpointed Durable Execution**:
   - Record task progress at each discrete checkpoint. If the worker crashes, the orchestrator resumes from the last completed checkpoint rather than restarting from zero.
5. **Apply Exponential Backoff with Full Jitter**:
   - Calculate delay: $t = \text{random}(0, \min(\text{maxDelay}, \text{baseDelay} \times 2^{\text{attempt}}))$. Jitter prevents the thundering herd problem.
6. **Handle Poison Pills with Dead-Letter Queues (DLQ)**:
   - Cap maximum retries (e.g. 5). When exhausted, route the message to a DLQ with execution context and alert engineering.

## Patterns We Use
- **Strict Transition Matrix**: Represent states and events using TypeScript Discriminated Unions and Map-based transition guards.
- **Transactional Outbox**: When emitting events or triggering async steps upon database state change, write the outbox event in the same database transaction.
- **Saga Orchestrator**: Use a central orchestrator function to sequence forward steps; upon failure of step $N$, execute compensating actions for steps $N-1 \dots 1$ in reverse order.
- **Idempotency Checkpoints**: Cache and check intermediate results: `if (step.status === 'completed') return step.result;`.
- **Full Jitter Retries**: Avoid standard exponential backoff without jitter — randomized jitter decouples synchronized retrying clients.

## Anti-Patterns — Never Do This
- ❌ Do not use implicit string flags (e.g. `is_paid = true; is_cancelled = true`) where contradictory combinations can occur.
- ❌ Do not charge payments or invoke irreversible third-party APIs without a client-supplied idempotency key.
- ❌ Do not retry non-idempotent operations without verification (e.g. retrying a payment without querying its status first).
- ❌ Do not attempt distributed transactions using two-phase commit (2PC) across microservices; use the Saga pattern with compensating transactions.
- ❌ Do not write infinite retry loops without exponential backoff and a maximum retry ceiling.
- ❌ Do not discard errors silently when compensating actions fail; log critically and alert on partial saga compensation.

## Example

```typescript
// 1. Explicit State Machine Definition
export type OrderState = 'created' | 'payment_pending' | 'paid' | 'fulfilled' | 'cancelled';
export type OrderEvent = 'INITIATE_PAYMENT' | 'PAYMENT_SUCCEEDED' | 'PAYMENT_FAILED' | 'FULFILL' | 'CANCEL';

export const ORDER_TRANSITIONS: Record<OrderState, Partial<Record<OrderEvent, OrderState>>> = {
  created: {
    INITIATE_PAYMENT: 'payment_pending',
    CANCEL: 'cancelled',
  },
  payment_pending: {
    PAYMENT_SUCCEEDED: 'paid',
    PAYMENT_FAILED: 'created', // Allow customer to retry payment
    CANCEL: 'cancelled',
  },
  paid: {
    FULFILL: 'fulfilled',
    CANCEL: 'cancelled', // Triggers refund compensation
  },
  fulfilled: {}, // Terminal state
  cancelled: {}, // Terminal state
};

export function transitionOrder(current: OrderState, event: OrderEvent): OrderState {
  const next = ORDER_TRANSITIONS[current]?.[event];
  if (!next) {
    throw new Error(`Illegal state transition: Cannot process event "${event}" in state "${current}".`);
  }
  return next;
}

// 2. Exponential Backoff with Full Jitter
export async function retryWithFullJitter<T>(
  fn: () => Promise<T>,
  maxAttempts = 5,
  baseDelayMs = 500,
  maxDelayMs = 10_000,
): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= maxAttempts) throw err;

      // Full Jitter formula
      const maxExp = Math.min(maxDelayMs, baseDelayMs * Math.pow(2, attempt));
      const jitterDelay = Math.floor(Math.random() * maxExp);

      await new Promise((res) => setTimeout(res, jitterDelay));
    }
  }
}

// 3. Saga Orchestrator with Compensating Actions
export interface SagaStep<TContext> {
  name: string;
  execute: (ctx: TContext) => Promise<void>;
  compensate: (ctx: TContext) => Promise<void>;
}

export class SagaOrchestrator<TContext> {
  private steps: SagaStep<TContext>[] = [];

  addStep(step: SagaStep<TContext>): this {
    this.steps.push(step);
    return this;
  }

  async run(context: TContext): Promise<void> {
    const executedSteps: SagaStep<TContext>[] = [];

    for (const step of this.steps) {
      try {
        console.log(`Executing step: ${step.name}`);
        await step.execute(context);
        executedSteps.push(step);
      } catch (error) {
        console.error(`Step "${step.name}" failed:`, error);
        await this.rollback(executedSteps, context);
        throw new Error(`Saga failed at step "${step.name}". Successfully rolled back prior actions.`);
      }
    }
  }

  private async rollback(executedSteps: SagaStep<TContext>[], context: TContext): Promise<void> {
    console.warn(`Initiating rollback across ${executedSteps.length} completed steps...`);
    // Rollback in reverse order
    for (const step of executedSteps.reverse()) {
      try {
        console.warn(`Compensating step: ${step.name}`);
        await step.compensate(context);
      } catch (compensationError) {
        console.error(`CRITICAL: Compensation for step "${step.name}" failed:`, compensationError);
        // Alert pager / dead-letter queue
      }
    }
  }
}

// 4. Usage Example: Order Checkout Saga
interface CheckoutContext {
  orderId: string;
  userId: string;
  amount: number;
  paymentId?: string;
  inventoryReserved?: boolean;
}

export async function executeCheckoutSaga(context: CheckoutContext): Promise<void> {
  const saga = new SagaOrchestrator<CheckoutContext>()
    .addStep({
      name: 'Reserve Inventory',
      execute: async (ctx) => {
        // await inventoryService.reserve(ctx.orderId);
        ctx.inventoryReserved = true;
      },
      compensate: async (ctx) => {
        if (ctx.inventoryReserved) {
          // await inventoryService.release(ctx.orderId);
        }
      },
    })
    .addStep({
      name: 'Process Payment',
      execute: async (ctx) => {
        // ctx.paymentId = await paymentGateway.charge(ctx.userId, ctx.amount);
      },
      compensate: async (ctx) => {
        if (ctx.paymentId) {
          // await paymentGateway.refund(ctx.paymentId);
        }
      },
    })
    .addStep({
      name: 'Dispatch Order',
      execute: async (ctx) => {
        // await shippingService.ship(ctx.orderId);
      },
      compensate: async (ctx) => {
        // await shippingService.cancelLabel(ctx.orderId);
      },
    });

  await saga.run(context);
}
```

## Validation
- State transitions are strictly validated against a closed transition table.
- Mutating API endpoints require and enforce unique `Idempotency-Key` headers.
- Multi-step distributed transactions implement automated rollbacks using the Saga pattern.
- Asynchronous retries incorporate randomized Full Jitter and max retry ceilings.
- Failed sagas cleanly compensate all completed predecessor steps in reverse order.

## Notes
- For massive, enterprise-scale workflows, integrate dedicated durable orchestrators like Temporal, Cadence, or AWS Step Functions.
- Always store idempotency keys in Redis or a relational table with an automatic TTL (typically 24 hours).
