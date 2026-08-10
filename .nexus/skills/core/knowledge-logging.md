---
skill: knowledge-logging
version: 1.0.0
framework: shared
category: workflow
triggers:
  - "knowledge logging"
  - "knowledge.md"
  - "project knowledge"
  - "decision log"
  - "lessons learned"
author: "@nexus-framework/skills"
status: active
---

# Skill: Knowledge Logging (Shared)

## When to Read This
Read this skill when documenting project decisions, lessons learned, or important context that should be preserved for future reference.

## Context
Knowledge logging captures the "why" behind decisions, technical discoveries, and project evolution. This living document helps team members understand context, avoid repeating mistakes, and make informed decisions. It's particularly valuable for AI agents that need to understand project history and rationale.

## Steps
1. Identify significant decisions, discoveries, or patterns worth documenting
2. Categorize the entry (decision, discovery, pattern, warning, etc.)
3. Write a clear, concise entry with context and reasoning
4. Include relevant links, code examples, or references
5. Update existing entries when new information becomes available
6. Review and organize entries periodically for clarity

## Patterns We Use
- Decision log: Record major architectural and technical decisions with alternatives considered
- Discovery log: Document new findings about tools, libraries, or system behavior
- Pattern log: Capture recurring solutions and best practices discovered during development
- Warning log: Document pitfalls, workarounds, and lessons learned from mistakes
- Context log: Record external factors, constraints, or business requirements that influenced decisions

## Anti-Patterns — Never Do This
- ❌ Do not write vague entries without context or explanation
- ❌ Do not include personal complaints or blame
- ❌ Do not log trivial changes that don't provide lasting value
- ❌ Do not forget to update entries when circumstances change
- ❌ Do not make entries too technical for future team members to understand
- ❌ Do not ignore documenting successful patterns and solutions

## Example

```markdown
## 2024-03-15: Decision - Adopted Zustand for State Management

**Context:** Evaluating state management solutions for the new dashboard feature.

**Decision:** Chose Zustand over Redux Toolkit and Context API.

**Alternatives considered:**
- Redux Toolkit: Rejected due to boilerplate and complexity for our use case
- Context API: Rejected due to performance concerns with frequent updates

**Rationale:** Zustand provides a simple API with minimal boilerplate while maintaining good performance. It integrates well with our existing TypeScript setup and doesn't require additional dependencies.

**Impact:** Simplified state management across the application, reduced boilerplate by ~60%.

**Related:** [State management RFC](docs/rfcs/state-management.md)
```

```markdown
## 2024-04-02: Discovery - Database Connection Pooling Issue

**Issue:** Application experiencing intermittent timeouts under load.

**Discovery:** Database connection pool was configured with too few connections for our concurrent user load.

**Solution:** Increased pool size from 10 to 50 connections and implemented connection reuse patterns.

**Code change:** Updated `database.ts` configuration.

**Prevention:** Added monitoring for connection pool utilization and alerts for high usage.

**Note:** Document this pattern for future scaling considerations.
```

```markdown
## 2024-05-10: Pattern - API Error Handling Standardization

**Pattern:** Standardized error response format across all API endpoints.

**Implementation:**
```typescript
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}
```

**Benefits:**
- Consistent error handling across frontend and backend
- Better user experience with standardized error messages
- Easier debugging and logging

**Adoption:** Applied to all new endpoints, migrating existing ones gradually.
```

## Notes
- Use clear, descriptive titles for easy searching
- Include dates for temporal context and tracking evolution
- Link to related documentation, code, or issues when relevant
- Keep entries concise but include enough context for understanding
- Review and update entries during retrospectives or major milestones
- Use consistent formatting and categorization for easy navigation
- Consider the perspective of future team members reading this
- Document both successes and failures for balanced learning