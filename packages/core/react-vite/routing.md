---
skill: routing
version: 1.0.0
framework: react-vite
category: workflow
triggers:
  - "routing"
  - "React Router"
  - "navigation"
  - "URL parameters"
  - "route guards"
author: "@nexus-framework/skills"
status: active
---

# Skill: Routing (React + Vite)

## When to Read This
Read this skill when implementing navigation, URL routing, or page transitions in a React + Vite application.

## Context
This project uses React Router v6 for client-side routing with a structured approach to route organization, lazy loading, and route protection. We follow a file-based routing pattern where possible and implement proper error boundaries, loading states, and SEO considerations. Route guards and authentication checks are implemented consistently across protected routes.

## Steps
1. Set up React Router with proper configuration
2. Create route structure with lazy loading for performance
3. Implement route guards for authentication and authorization
4. Add proper error boundaries and loading states
5. Handle URL parameters and query strings
6. Implement nested routes for complex layouts
7. Add SEO and accessibility considerations
8. Set up route-based code splitting

## Patterns We Use
- React Router v6: Use latest version with modern patterns
- Lazy loading: Use React.lazy and Suspense for route components
- Route guards: Implement authentication and authorization checks
- Nested routes: Use for layout composition and shared navigation
- URL parameters: Use proper parameter naming and validation
- Error boundaries: Wrap routes with error handling
- Loading states: Show appropriate loading indicators
- SEO: Implement proper meta tags and structured data

## Anti-Patterns — Never Do This
- ❌ Do not use class components for route components
- ❌ Do not ignore error boundaries for routes
- ❌ Do not hardcode navigation paths
- ❌ Do not forget to handle 404 pages
- ❌ Do not ignore accessibility in navigation
- ❌ Do not use deprecated React Router patterns
- ❌ Do not forget to implement proper loading states
- ❌ Do not ignore SEO considerations for routes

## Example

```typescript
// src/router/index.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Suspense } from 'react';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Layout } from '../components/Layout';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { LoadingSpinner } from '../components/LoadingSpinner';

// Lazy load route components for better performance
const HomePage = lazy(() => import('../pages/Home'));
const AboutPage = lazy(() => import('../pages/About'));
const DashboardPage = lazy(() => import('../pages/Dashboard'));
const ProfilePage = lazy(() => import('../pages/Profile'));
const LoginPage = lazy(() => import('../pages/Login'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));
const UsersPage = lazy(() => import('../pages/Users'));
const UserDetailPage = lazy(() => import('../pages/UserDetail'));
const SettingsPage = lazy(() => import('../pages/Settings'));

// Create router configuration
const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ErrorBoundary>
        <Layout />
      </ErrorBoundary>
    ),
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute requiredRole="admin">
            <UsersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'users/:userId',
        element: (
          <ProtectedRoute>
            <UserDetailPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);

export function AppRouter() {
  return (
    <RouterProvider
      router={router}
      fallbackElement={
        <div className="app-loading">
          <LoadingSpinner />
        </div>
      }
    />
  );
}
```

```tsx
// src/components/ProtectedRoute.tsx
import { useUserStore } from '../stores';
import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading } = useUserStore();
  const location = useLocation();

  useEffect(() => {
    // Scroll to top when route changes
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="protected-route-loading">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
```

```tsx
// src/components/Layout.tsx
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useUserStore } from '../stores';
import { useState } from 'react';

export function Layout() {
  const { user, logout } = useUserStore();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', path: '/', protected: false },
    { name: 'About', path: '/about', protected: false },
    { name: 'Dashboard', path: '/dashboard', protected: true },
    { name: 'Profile', path: '/profile', protected: true },
    { name: 'Users', path: '/users', protected: true, role: 'admin' },
    { name: 'Settings', path: '/settings', protected: true },
  ];

  const filteredNavigation = navigation.filter(navItem => {
    // Show all non-protected routes
    if (!navItem.protected) return true;
    
    // Show protected routes only if user is authenticated
    if (!user) return false;
    
    // Check role requirements
    if (navItem.role && user.role !== navItem.role) return false;
    
    return true;
  });

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            MyApp
          </Link>
          
          <nav className="desktop-nav">
            {filteredNavigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                aria-current={location.pathname === item.path ? 'page' : undefined}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            {user ? (
              <>
                <span className="user-info">Welcome, {user.name}</span>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="login-btn">
                Login
              </Link>
            )}
            
            <button
              className="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              ☰
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <nav className="mobile-nav">
            {filteredNavigation.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className="main-content">
        <Suspense fallback={<div>Loading...</div>}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} MyApp. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/terms">Terms of Service</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
```

```tsx
// src/pages/UserDetail.tsx
import { useParams, useNavigate, useLoaderData } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useUserStore } from '../stores';
import { userService } from '../services/userService';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface UserDetailLoaderData {
  user: any;
}

export async function userDetailLoader({ params }: any): Promise<UserDetailLoaderData> {
  try {
    const user = await userService.getUser(params.userId);
    return { user };
  } catch (error) {
    throw new Response('User not found', { status: 404 });
  }
}

export function UserDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useUserStore();
  const { user } = useLoaderData() as UserDetailLoaderData;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await userService.updateUser(user.id, formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(user.id);
        navigate('/users');
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  if (!user) {
    return <LoadingSpinner />;
  }

  return (
    <div className="user-detail">
      <div className="user-detail-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back
        </button>
        <h1>User Details</h1>
        <div className="user-detail-actions">
          {currentUser?.role === 'admin' && (
            <>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="edit-btn"
              >
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
              <button onClick={handleDelete} className="delete-btn">
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="user-detail-content">
        <div className="user-info">
          <div className="user-avatar">
            {user.avatar ? (
              <img src={user.avatar} alt={`${user.name}'s avatar`} />
            ) : (
              <div className="avatar-placeholder">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          
          <div className="user-details">
            {isEditing ? (
              <div className="user-form">
                <div className="form-group">
                  <label>Name:</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <button onClick={handleSave} className="save-btn">
                  Save
                </button>
              </div>
            ) : (
              <>
                <h2>{user.name}</h2>
                <p>Email: {user.email}</p>
                <p>Role: {user.role}</p>
                <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

```tsx
// src/pages/Dashboard.tsx
import { useUserStore } from '../stores';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export function DashboardPage() {
  const { user } = useUserStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user.name}!</p>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        <button
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-grid">
            <div className="card">
              <h3>Total Users</h3>
              <p className="metric">1,234</p>
            </div>
            <div className="card">
              <h3>Active Sessions</h3>
              <p className="metric">456</p>
            </div>
            <div className="card">
              <h3>Revenue</h3>
              <p className="metric">$12,345</p>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics">
            <h2>Analytics Coming Soon</h2>
            <p>This section is under development.</p>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports">
            <h2>Reports Coming Soon</h2>
            <p>This section is under development.</p>
          </div>
        )}
      </div>
    </div>
  );
}
```

```typescript
// src/hooks/useRouteParams.ts
import { useParams, useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';

export function useRouteParams() {
  const params = useParams();
  const [searchParams] = useSearchParams();

  const queryParams = useMemo(() => {
    const result: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }, [searchParams]);

  return {
    params,
    queryParams,
    getQueryParam: (key: string, defaultValue?: string) => {
      return searchParams.get(key) || defaultValue;
    },
    setQueryParam: (key: string, value: string) => {
      searchParams.set(key, value);
      return searchParams.toString();
    },
    removeQueryParam: (key: string) => {
      searchParams.delete(key);
      return searchParams.toString();
    },
  };
}
```

```typescript
// src/utils/routeUtils.ts
export const routes = {
  home: '/',
  about: '/about',
  login: '/login',
  dashboard: '/dashboard',
  profile: '/profile',
  users: '/users',
  userDetail: (id: string) => `/users/${id}`,
  settings: '/settings',
  notFound: '/404',
} as const;

export function getRoutePath(route: keyof typeof routes, ...args: any[]): string {
  const routeTemplate = routes[route];
  if (!routeTemplate) {
    throw new Error(`Unknown route: ${route}`);
  }
  
  // Replace placeholders with arguments
  let path = routeTemplate;
  let argIndex = 0;
  
  path = path.replace(/:[^/]+/g, () => {
    if (args[argIndex] === undefined) {
      throw new Error(`Missing parameter for route: ${route}`);
    }
    return args[argIndex++];
  });
  
  return path;
}

export function isProtectedRoute(path: string): boolean {
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/users',
    '/settings',
  ];
  
  return protectedRoutes.some(route => path.startsWith(route));
}

export function requiresAdminRole(path: string): boolean {
  const adminRoutes = [
    '/users',
  ];
  
  return adminRoutes.some(route => path.startsWith(route));
}
```

```tsx
// src/components/NotFound.tsx
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="not-found">
      <div className="not-found-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for doesn't exist.</p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn--primary">
            Go Home
          </Link>
          <Link to="/dashboard" className="btn btn--secondary">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
```

## Notes
- Use lazy loading for better performance and faster initial load times
- Implement proper error boundaries to handle route-level errors
- Use route guards for authentication and authorization
- Handle URL parameters safely with validation
- Implement proper loading states for async route data
- Use proper SEO meta tags for each route
- Consider accessibility in navigation components
- Use proper HTTP status codes for error routes
- Implement proper cleanup for route transitions
- Test routing thoroughly including edge cases and error scenarios