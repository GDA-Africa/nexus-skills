---
skill: testing-strategy
version: 1.0.0
framework: shared
category: testing
triggers:
  - "testing strategy"
  - "testing pyramid"
  - "unit tests"
  - "integration tests"
  - "E2E tests"
author: "@nexus-framework/skills"
status: active
---

# Skill: Testing Strategy (Shared)

## When to Read This
Read this skill when setting up testing infrastructure, writing tests, or determining the appropriate testing approach for a feature.

## Context
This project follows a testing pyramid approach with different levels of testing for different purposes. Unit tests form the foundation, integration tests verify component interactions, and E2E tests validate complete user workflows. Testing is automated in CI/CD and considered a critical part of the development process. All new features should include appropriate test coverage.

## Steps
1. Choose the appropriate test level based on what you're testing
2. Write tests before or alongside implementation (TDD when possible)
3. Use the appropriate testing framework and utilities for your stack
4. Mock external dependencies appropriately
5. Ensure tests are fast, reliable, and maintainable
6. Run tests locally and in CI/CD pipeline
7. Maintain test coverage targets and review coverage reports
8. Update tests when requirements or implementation changes

## Patterns We Use
- Testing pyramid: Many unit tests, fewer integration tests, minimal E2E tests
- Test frameworks: Jest, Vitest, or framework-specific testing libraries
- Mocking: Jest.mock(), MSW (Mock Service Worker) for API mocking
- Test utilities: React Testing Library, Testing Library for other frameworks
- Setup/teardown: beforeEach, afterEach, beforeAll, afterAll for test isolation
- Test data: Factories, fixtures, or test builders for consistent test data
- Coverage: Aim for 80%+ coverage on critical business logic
- Parallel execution: Run tests in parallel for faster feedback

## Anti-Patterns — Never Do This
- ❌ Do not write tests that are too broad or too specific
- ❌ Do not skip tests with `.skip` in production code
- ❌ Do not make tests dependent on each other
- ❌ Do not test implementation details instead of behavior
- ❌ Do not ignore flaky or slow tests
- ❌ Do not hardcode test data that makes tests brittle
- ❌ Do not skip running tests locally before committing
- ❌ Do not ignore test failures in CI/CD

## Example

```typescript
// ✅ Unit test for a utility function
import { calculateTotal } from './cart';

describe('calculateTotal', () => {
  it('should calculate total for empty cart', () => {
    const result = calculateTotal([]);
    expect(result).toBe(0);
  });

  it('should calculate total for single item', () => {
    const items = [{ price: 10.99, quantity: 1 }];
    const result = calculateTotal(items);
    expect(result).toBe(10.99);
  });

  it('should calculate total for multiple items', () => {
    const items = [
      { price: 10.99, quantity: 2 },
      { price: 5.50, quantity: 1 }
    ];
    const result = calculateTotal(items);
    expect(result).toBe(27.48);
  });

  it('should handle discount calculation', () => {
    const items = [{ price: 100, quantity: 1 }];
    const result = calculateTotal(items, 0.1); // 10% discount
    expect(result).toBe(90);
  });
});
```

```typescript
// ✅ Integration test for API endpoint
import { createMocks } from 'node-mocks-http';
import handler from '../../pages/api/users';

describe('/api/users', () => {
  beforeEach(() => {
    // Setup test database or mock data
  });

  afterEach(() => {
    // Clean up test data
  });

  it('should return user list', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          name: expect.any(String),
          email: expect.any(String)
        })
      ])
    );
  });

  it('should create new user', async () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com'
    };

    const { req, res } = createMocks({
      method: 'POST',
      body: userData,
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data).toMatchObject({
      id: expect.any(String),
      name: userData.name,
      email: userData.email
    });
  });
});
```

```typescript
// ✅ Component test with React Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

// Mock the translation hook
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { changeLanguage: jest.fn() }
  })
}));

describe('LoginForm', () => {
  it('should render form elements', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('should show validation errors', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /sign in/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('should submit form with valid data', async () => {
    const mockSubmit = jest.fn();
    render(<LoginForm onSubmit={mockSubmit} />);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /sign in/i });

    await userEvent.type(emailInput, 'test@example.com');
    await userEvent.type(passwordInput, 'password123');
    await userEvent.click(submitButton);

    expect(mockSubmit).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
});
```

```typescript
// ✅ E2E test with Playwright
import { test, expect } from '@playwright/test';

test.describe('User Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', 'user@example.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
  });

  test('should validate required fields', async ({ page }) => {
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="email-error"]')).toContainText('Email is required');
    await expect(page.locator('[data-testid="password-error"]')).toContainText('Password is required');
  });
});
```

```typescript
// ✅ Test utilities and setup
// src/__tests__/utils.ts
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

export const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
};

export const renderWithProviders = (ui: React.ReactElement, options = {}) => {
  const queryClient = createTestQueryClient();
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...options }),
    queryClient,
  };
};

// src/__tests__/factories.ts
export const createUser = (overrides = {}) => ({
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  createdAt: new Date().toISOString(),
  ...overrides,
});

export const createPost = (overrides = {}) => ({
  id: '1',
  title: 'Test Post',
  content: 'This is a test post',
  authorId: '1',
  createdAt: new Date().toISOString(),
  ...overrides,
});
```

## Notes
- Use `@testing-library/jest-dom` for additional matchers
- Mock external APIs with MSW for realistic integration tests
- Use `act()` wrapper only when necessary for state updates
- Clean up after tests to prevent state leakage
- Use `jest.runAllTimers()` for testing time-based functionality
- Consider visual regression testing for UI components
- Document test scenarios and edge cases
- Review test coverage reports and improve coverage on critical paths
- Use snapshot testing sparingly and update snapshots when needed
- Test error scenarios and edge cases, not just happy paths