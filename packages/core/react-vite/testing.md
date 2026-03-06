---
skill: testing
version: 1.0.0
framework: react-vite
category: workflow
triggers:
  - "testing"
  - "unit testing"
  - "integration testing"
  - "e2e testing"
  - "test strategy"
author: "@nexus-framework/skills"
status: active
---

# Skill: Testing Strategy (React + Vite)

## When to Read This
Read this skill when setting up testing infrastructure, writing tests, or establishing testing conventions for a React + Vite application.

## Context
This project follows a comprehensive testing strategy with unit tests, integration tests, and end-to-end tests. We use Vitest for unit and integration testing, and Playwright for E2E testing. Tests should be fast, reliable, and provide good coverage of critical functionality. Testing is integrated into the development workflow with pre-commit hooks and CI/CD pipelines.

## Steps
1. Set up testing framework and configuration
2. Write unit tests for utilities, hooks, and pure functions
3. Create integration tests for components and API interactions
4. Implement E2E tests for critical user flows
5. Set up test utilities and mocking strategies
6. Configure test coverage reporting
7. Integrate testing into CI/CD pipeline
8. Establish testing conventions and best practices

## Patterns We Use
- Testing pyramid: More unit tests, fewer integration tests, minimal E2E tests
- Test-driven development: Write tests before implementing features when possible
- Mocking: Use proper mocking for external dependencies and APIs
- Test utilities: Create custom render functions and test helpers
- Snapshot testing: Use for component output verification
- Coverage thresholds: Maintain minimum coverage requirements
- Parallel execution: Run tests in parallel for faster feedback
- Continuous testing: Run tests on every commit and PR

## Anti-Patterns — Never Do This
- ❌ Do not write tests that are too brittle or tightly coupled to implementation
- ❌ Do not skip tests or ignore failing tests
- ❌ Do not mock everything - test real interactions when possible
- ❌ Do not write tests that take too long to run
- ❌ Do not ignore test coverage or write meaningless tests
- ❌ Do not test implementation details instead of behavior
- ❌ Do not forget to test error cases and edge cases
- ❌ Do not write tests that depend on each other

## Example

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

```typescript
// src/test/utils.ts
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
}

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
      mutations: {
        retry: false,
      },
    },
  });
};

const customRender = (
  ui: ReactElement,
  options: CustomRenderOptions = {}
) => {
  const { initialEntries = ['/'], ...renderOptions } = options;
  const queryClient = createTestQueryClient();

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient,
  };
};

export * from '@testing-library/react';
export { customRender as render };
```

```typescript
// src/hooks/useUsers.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUsers } from './useUsers';
import { userService } from '../services/userService';

// Mock the user service
vi.mock('../services/userService');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch users successfully', async () => {
    const mockUsers = {
      users: [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Doe', email: 'jane@example.com' },
      ],
      total: 2,
      page: 1,
      totalPages: 1,
    };

    (userService.getUsers as any).mockResolvedValue(mockUsers);

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockUsers);
    expect(userService.getUsers).toHaveBeenCalledWith(undefined);
  });

  it('should handle errors', async () => {
    const errorMessage = 'Failed to fetch users';
    (userService.getUsers as any).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useUsers(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe(errorMessage);
  });

  it('should fetch users with parameters', async () => {
    const params = { page: 2, limit: 10, search: 'john' };
    const mockUsers = { users: [], total: 0, page: 2, totalPages: 5 };

    (userService.getUsers as any).mockResolvedValue(mockUsers);

    const { result } = renderHook(() => useUsers(params), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(userService.getUsers).toHaveBeenCalledWith(params);
  });
});
```

```tsx
// src/components/UserList.test.tsx
import { render, screen, fireEvent, waitFor } from '../test/utils';
import { UserList } from './UserList';
import { useUsers } from '../hooks/useUsers';
import { userService } from '../services/userService';

// Mock the hook
vi.mock('../hooks/useUsers');
const mockUseUsers = useUsers as any;

// Mock the service
vi.mock('../services/userService');

describe('UserList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state', () => {
    mockUseUsers.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    });

    render(<UserList />);
    
    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  it('should display error state', () => {
    const errorMessage = 'Failed to load users';
    mockUseUsers.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: { message: errorMessage },
    });

    render(<UserList />);
    
    expect(screen.getByText(`Error loading users: ${errorMessage}`)).toBeInTheDocument();
  });

  it('should display users list', async () => {
    const mockUsers = {
      users: [
        { id: '1', name: 'John Doe', email: 'john@example.com' },
        { id: '2', name: 'Jane Doe', email: 'jane@example.com' },
      ],
      total: 2,
      page: 1,
      totalPages: 1,
    };

    mockUseUsers.mockReturnValue({
      data: mockUsers,
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<UserList />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });
  });

  it('should handle search input', async () => {
    const mockUsers = { users: [], total: 0, page: 1, totalPages: 1 };
    
    mockUseUsers.mockReturnValue({
      data: mockUsers,
      isLoading: false,
      isError: false,
      error: null,
    });

    render(<UserList />);

    const searchInput = screen.getByPlaceholderText('Search users...');
    fireEvent.change(searchInput, { target: { value: 'john' } });

    // The search would trigger the hook to refetch with new parameters
    // This would be tested through the hook's behavior
  });

  it('should handle delete confirmation', async () => {
    const mockUsers = {
      users: [{ id: '1', name: 'John Doe', email: 'john@example.com' }],
      total: 1,
      page: 1,
      totalPages: 1,
    };

    mockUseUsers.mockReturnValue({
      data: mockUsers,
      isLoading: false,
      isError: false,
      error: null,
    });

    // Mock window.confirm
    window.confirm = vi.fn().mockReturnValue(true);
    (userService.deleteUser as any).mockResolvedValue(undefined);

    render(<UserList />);

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this user?');
    expect(userService.deleteUser).toHaveBeenCalledWith('1');
  });
});
```

```typescript
// src/utils/formatDate.test.ts
import { formatDate, formatRelativeTime } from './formatDate';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2023-12-25T10:30:00Z');
    expect(formatDate(date)).toBe('December 25, 2023');
  });

  it('should handle different locales', () => {
    const date = new Date('2023-12-25T10:30:00Z');
    expect(formatDate(date, 'fr-FR')).toBe('25 décembre 2023');
  });
});

describe('formatRelativeTime', () => {
  beforeEach(() => {
    // Mock Date.now() to return a consistent timestamp
    vi.spyOn(global, 'Date').mockImplementation(() => new Date('2023-12-25T12:00:00Z') as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return "just now" for recent dates', () => {
    const date = new Date('2023-12-25T11:59:30Z');
    expect(formatRelativeTime(date)).toBe('just now');
  });

  it('should return "2 hours ago" for 2 hours ago', () => {
    const date = new Date('2023-12-25T10:00:00Z');
    expect(formatRelativeTime(date)).toBe('2 hours ago');
  });

  it('should return "yesterday" for yesterday', () => {
    const date = new Date('2023-12-24T12:00:00Z');
    expect(formatRelativeTime(date)).toBe('yesterday');
  });

  it('should return formatted date for older dates', () => {
    const date = new Date('2023-12-01T12:00:00Z');
    expect(formatRelativeTime(date)).toBe('December 1, 2023');
  });
});
```

```typescript
// src/services/userService.test.ts
import { userService } from './userService';
import { api } from './api';

// Mock the API service
vi.mock('./api');

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should fetch users with default parameters', async () => {
      const mockResponse = {
        users: [],
        total: 0,
        page: 1,
        totalPages: 1,
      };

      (api.get as any).mockResolvedValue(mockResponse);

      const result = await userService.getUsers();

      expect(api.get).toHaveBeenCalledWith('/users', { params: undefined });
      expect(result).toEqual(mockResponse);
    });

    it('should fetch users with parameters', async () => {
      const params = { page: 2, limit: 10, search: 'john' };
      const mockResponse = { users: [], total: 0, page: 2, totalPages: 1 };

      (api.get as any).mockResolvedValue(mockResponse);

      const result = await userService.getUsers(params);

      expect(api.get).toHaveBeenCalledWith('/users', { params });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getUser', () => {
    it('should fetch a single user', async () => {
      const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };

      (api.get as any).mockResolvedValue(mockUser);

      const result = await userService.getUser('1');

      expect(api.get).toHaveBeenCalledWith('/users/1');
      expect(result).toEqual(mockUser);
    });
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const userData = { name: 'John Doe', email: 'john@example.com', password: 'password123' };
      const mockUser = { id: '1', name: 'John Doe', email: 'john@example.com' };

      (api.post as any).mockResolvedValue(mockUser);

      const result = await userService.createUser(userData);

      expect(api.post).toHaveBeenCalledWith('/users', userData);
      expect(result).toEqual(mockUser);
    });
  });
});
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

```typescript
// e2e/userList.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User List', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API responses
    await page.route('/api/users', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          users: [
            { id: '1', name: 'John Doe', email: 'john@example.com' },
            { id: '2', name: 'Jane Doe', email: 'jane@example.com' },
          ],
          total: 2,
          page: 1,
          totalPages: 1,
        }),
      });
    });

    await page.goto('/users');
  });

  test('should display users list', async ({ page }) => {
    await expect(page.locator('text=Users')).toBeVisible();
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=jane@example.com')).toBeVisible();
  });

  test('should search for users', async ({ page }) => {
    await page.fill('input[placeholder="Search users..."]', 'john');
    await page.click('button:has-text("Search")');

    // Verify the search was performed (this would depend on your implementation)
    await expect(page.locator('text=John Doe')).toBeVisible();
  });

  test('should handle delete confirmation', async ({ page }) => {
    page.on('dialog', async (dialog) => {
      expect(dialog.message()).toBe('Are you sure you want to delete this user?');
      await dialog.accept();
    });

    await page.click('button:has-text("Delete")');
    
    // Verify user was deleted (this would depend on your implementation)
    await expect(page.locator('text=John Doe')).not.toBeVisible();
  });

  test('should handle pagination', async ({ page }) => {
    // Mock API response for page 2
    await page.route('/api/users?page=2', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          users: [
            { id: '3', name: 'Bob Smith', email: 'bob@example.com' },
          ],
          total: 3,
          page: 2,
          totalPages: 2,
        }),
      });
    });

    await page.click('button:has-text("Next")');
    
    await expect(page.locator('text=Bob Smith')).toBeVisible();
    await expect(page.locator('text=Page 2 of 2')).toBeVisible();
  });
});
```

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    // Mock login API
    await page.route('/api/auth/login', async (route, request) => {
      const body = JSON.parse(await request.postData() || '{}');
      
      if (body.email === 'test@example.com' && body.password === 'password') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            token: 'mock-jwt-token',
            user: { id: '1', name: 'Test User', email: 'test@example.com' },
          }),
        });
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Invalid credentials' }),
        });
      }
    });

    await page.goto('/login');
    
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'password');
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="user-name"]')).toContainText('Test User');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.route('/api/auth/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Invalid credentials' }),
      });
    });

    await page.goto('/login');
    
    await page.fill('[data-testid="email-input"]', 'wrong@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');

    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
  });
});
```

## Notes
- Use test-driven development for better code quality and design
- Mock external dependencies to make tests fast and reliable
- Test both happy path and error scenarios
- Use meaningful test names that describe the behavior being tested
- Keep tests focused and avoid testing implementation details
- Use snapshot testing sparingly and only for stable component output
- Run tests in CI/CD to catch regressions early
- Maintain good test coverage but focus on critical paths
- Use Playwright for E2E tests that simulate real user interactions
- Regularly review and refactor tests as the codebase evolves