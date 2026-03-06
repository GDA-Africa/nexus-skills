---
skill: testing
version: 1.0.0
framework: next.js
category: testing
triggers:
  - "writing tests"
  - "adding tests"
  - "test file"
  - "Jest"
  - "React Testing Library"
author: "@nexus-framework/skills"
status: active
---

# Skill: Testing (Next.js)

## When to Read This
Read this skill before writing any tests for components, pages, API routes, or utilities in this project.

## Context
This project uses Jest with React Testing Library for component testing and Vitest for unit tests. Tests should follow the testing pyramid: many unit tests, fewer integration tests, and minimal E2E tests. All tests should be co-located with the code they test when possible, using the `.test.ts` or `.spec.ts` naming convention. Mock external dependencies and use realistic test data.

## Steps
1. Determine the type of test needed (unit, integration, or E2E).
2. Create test file alongside the component/file being tested.
3. Set up test environment and mocks if needed.
4. Write tests using the Arrange-Act-Assert pattern.
5. Use appropriate testing utilities (RTL for components, Jest for units).
6. Mock external dependencies (API calls, databases, etc.).
7. Run tests and ensure they pass consistently.
8. Add test coverage reporting if not already configured.

## Patterns We Use
- Test naming: `ComponentName.test.tsx` or `utility.test.ts`
- Testing library: React Testing Library for components
- Mocking: Jest.mock() for external dependencies
- Test data: Use factories or fixtures for consistent test data
- Setup: Global test setup in `jest.setup.ts` or `vitest.setup.ts`
- Coverage: Aim for 80%+ coverage on critical paths
- Async tests: Use `waitFor`, `findBy*` queries for async operations

## Anti-Patterns — Never Do This
- ❌ Do not test implementation details — test behavior, not internals
- ❌ Do not skip tests with `.skip` in production code
- ❌ Do not use `act()` wrapper unless absolutely necessary
- ❌ Do not mock everything — only mock external dependencies
- ❌ Do not write flaky tests that depend on timing or external state
- ❌ Do not ignore test failures — fix them immediately

## Example

```tsx
// components/UserCard.test.tsx
import { render, screen } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  const mockUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
  };

  it('renders user information correctly', () => {
    render(<UserCard user={mockUser} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    render(<UserCard user={mockUser} />);
    
    const card = screen.getByRole('article');
    expect(card).toHaveClass('rounded-lg', 'border', 'p-4');
  });
});
```

```typescript
// lib/api.test.ts
import { fetchUserData } from './api';

// Mock the fetch function
global.fetch = jest.fn();

describe('API functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches user data successfully', async () => {
    const mockResponse = { id: '1', name: 'John' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await fetchUserData('1');
    
    expect(fetch).toHaveBeenCalledWith('/api/users/1');
    expect(result).toEqual(mockResponse);
  });

  it('handles fetch errors', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(fetchUserData('1')).rejects.toThrow('User not found');
  });
});
```

```typescript
// __tests__/integration/api.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/users';

describe('/api/users', () => {
  it('returns user list', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: expect.any(String) })
      ])
    );
  });
});
```

## Notes
- Use `@testing-library/jest-dom` for additional matchers
- Mock Next.js router with `next-router-mock` for navigation tests
- Use `msw` (Mock Service Worker) for API mocking in integration tests
- Consider using Playwright or Cypress for E2E tests
- Run tests in CI/CD pipeline to catch regressions
- Use `test.each` for parameterized tests with multiple test cases
- Clean up after tests that modify global state or DOM