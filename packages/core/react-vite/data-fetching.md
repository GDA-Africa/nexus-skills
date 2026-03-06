---
skill: data-fetching
version: 1.0.0
framework: react-vite
category: workflow
triggers:
  - "data fetching"
  - "API calls"
  - "HTTP requests"
  - "data loading"
  - "caching"
author: "@nexus-framework/skills"
status: active
---

# Skill: Data Fetching (React + Vite)

## When to Read This
Read this skill when implementing API calls, data loading, caching, or state management for remote data in a React + Vite application.

## Context
This project uses TanStack Query (React Query) for server state management with built-in caching, background updates, and optimization features. We follow a structured approach with proper error handling, loading states, and data transformation. API calls are centralized in service files with consistent patterns for different data operations.

## Steps
1. Set up TanStack Query provider and configuration
2. Create service files for API endpoints
3. Implement hooks for data fetching with proper caching
4. Add error handling and loading states
5. Configure cache invalidation and background updates
6. Implement optimistic updates for mutations
7. Add data transformation and normalization
8. Handle pagination and infinite scrolling

## Patterns We Use
- TanStack Query: Use for server state management with caching
- Service layer: Centralize API calls in service files
- Custom hooks: Create hooks for data fetching patterns
- Error boundaries: Handle errors gracefully
- Loading states: Show appropriate loading indicators
- Cache management: Configure proper cache times and invalidation
- Data transformation: Normalize and transform API responses
- Background updates: Enable background refetching for fresh data

## Anti-Patterns — Never Do This
- ❌ Do not use useEffect for data fetching without proper cleanup
- ❌ Do not ignore error handling in API calls
- ❌ Do not create multiple fetch requests for the same data
- ❌ Do not forget to handle loading states
- ❌ Do not ignore cache invalidation after mutations
- ❌ Do not hardcode API endpoints in components
- ❌ Do not ignore pagination for large datasets
- ❌ Do not forget to handle network errors and retries

## Example

```typescript
// src/services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface ApiError {
  message: string;
  status: number;
  details?: any;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(this.formatError(error));
      }
    );
  }

  private formatError(error: any): ApiError {
    if (error.response) {
      return {
        message: error.response.data?.message || 'Server error',
        status: error.response.status,
        details: error.response.data,
      };
    } else if (error.request) {
      return {
        message: 'Network error - please check your connection',
        status: 0,
      };
    } else {
      return {
        message: error.message || 'An unexpected error occurred',
        status: -1,
      };
    }
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }
}

export const api = new ApiService();
```

```typescript
// src/services/userService.ts
import { api } from './api';
import { User, CreateUserRequest, UpdateUserRequest } from '../types/user';

export const userService = {
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    return api.get<{ users: User[]; total: number; page: number; totalPages: number }>('/users', {
      params,
    });
  },

  async getUser(id: string): Promise<User> {
    return api.get<User>(`/users/${id}`);
  },

  async createUser(userData: CreateUserRequest): Promise<User> {
    return api.post<User>('/users', userData);
  },

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    return api.put<User>(`/users/${id}`, userData);
  },

  async deleteUser(id: string): Promise<void> {
    return api.delete<void>(`/users/${id}`);
  },

  async getCurrentUser(): Promise<User> {
    return api.get<User>('/users/me');
  },
};
```

```typescript
// src/types/user.ts
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'user' | 'moderator';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role?: User['role'];
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  avatar?: string;
  role?: User['role'];
}
```

```typescript
// src/hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { User, CreateUserRequest, UpdateUserRequest } from '../types/user';

export const useUsers = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUser(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserRequest) => userService.createUser(userData),
    onSuccess: (newUser) => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      // Update cache with new user
      queryClient.setQueryData(['users'], (old: any) => {
        if (!old) return { users: [newUser], total: 1, page: 1, totalPages: 1 };
        
        return {
          ...old,
          users: [newUser, ...old.users],
          total: old.total + 1,
        };
      });
    },
    onError: (error) => {
      console.error('Failed to create user:', error);
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...userData }: { id: string } & UpdateUserRequest) =>
      userService.updateUser(id, userData),
    onSuccess: (updatedUser, variables) => {
      // Update the specific user in cache
      queryClient.setQueryData(['user', variables.id], updatedUser);
      
      // Update user in users list
      queryClient.setQueryData(['users'], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          users: old.users.map((user: User) =>
            user.id === variables.id ? updatedUser : user
          ),
        };
      });
      
      // Invalidate users list to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Failed to update user:', error);
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: (_, id) => {
      // Remove user from cache
      queryClient.removeQueries({ queryKey: ['user', id] });
      
      // Update users list
      queryClient.setQueryData(['users'], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          users: old.users.filter((user: User) => user.id !== id),
          total: old.total - 1,
        };
      });
      
      // Invalidate users list to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Failed to delete user:', error);
    },
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => userService.getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

```typescript
// src/hooks/useInfiniteUsers.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { User } from '../types/user';

export const useInfiniteUsers = (search?: string) => {
  return useInfiniteQuery({
    queryKey: ['infiniteUsers', search],
    queryFn: ({ pageParam = 1 }) =>
      userService.getUsers({
        page: pageParam,
        limit: 20,
        search,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    getNextPageParam: (lastPage, pages) => {
      const totalPages = lastPage.totalPages;
      const currentPage = pages.length;
      
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};
```

```tsx
// src/components/UserList.tsx
import { useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import { useCreateUser } from '../hooks/useCreateUser';
import { useDeleteUser } from '../hooks/useDeleteUser';
import { ErrorBoundary } from '../components/ErrorBoundary';

export function UserList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const { data, isLoading, error, isError } = useUsers({
    page,
    limit: 10,
    search,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  const handleDelete = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
    }
  };

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  if (isError) {
    return (
      <ErrorBoundary>
        <div>
          <p>Error loading users: {error?.message}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <div className="user-list">
      <div className="user-list-header">
        <h2>Users</h2>
        <div className="user-list-controls">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={() => setPage(1)}>Search</button>
          <button onClick={() => setIsCreating(!isCreating)}>
            {isCreating ? 'Cancel' : 'Add User'}
          </button>
        </div>
      </div>

      <div className="user-list-content">
        {data?.users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button 
                      onClick={() => handleDelete(user.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && (
        <div className="pagination">
          <button 
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <span>Page {page} of {data.totalPages}</span>
          <button
            disabled={page === data.totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
```

```tsx
// src/components/UserDetail.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { useUpdateUser } from '../hooks/useUpdateUser';
import { useState } from 'react';

export function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { data: user, isLoading, error } = useUser(userId!);
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const handleEdit = () => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (user) {
      updateUser(
        { id: user.id, ...formData },
        {
          onSuccess: () => {
            setIsEditing(false);
          },
        }
      );
    }
  };

  if (isLoading) {
    return <div>Loading user...</div>;
  }

  if (error) {
    return <div>Error loading user: {error.message}</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="user-detail">
      <div className="user-detail-header">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back
        </button>
        <h1>User Details</h1>
        <div className="user-detail-actions">
          {isEditing ? (
            <>
              <button onClick={handleSave} disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => setIsEditing(false)}>Cancel</button>
            </>
          ) : (
            <button onClick={handleEdit}>Edit</button>
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

```typescript
// src/utils/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on 404 or 401 errors
        if (error?.status === 404 || error?.status === 401) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
    },
  },
});
```

```tsx
// src/App.tsx
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './utils/queryClient';
import { AppRouter } from './router';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

export default App;
```

```typescript
// src/hooks/useOptimisticUpdate.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useOptimisticUpdate<TData, TVariables>(
  queryKey: string[],
  updateFn: (oldData: TData, variables: TVariables) => TData,
  mutationFn: (variables: TVariables) => Promise<TData>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onMutate: async (variables: TVariables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<TData>(queryKey);

      // Optimistically update to the new value
      if (previousData) {
        queryClient.setQueryData(queryKey, (old) => updateFn(old as TData, variables));
      }

      // Return a context object with the snapshotted value
      return { previousData };
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (err, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
```

## Notes
- Use TanStack Query for server state management with built-in caching
- Implement proper error handling and loading states
- Use optimistic updates for better user experience
- Configure appropriate cache times and invalidation strategies
- Centralize API calls in service files for maintainability
- Use custom hooks to encapsulate data fetching logic
- Implement pagination for large datasets
- Handle background updates and refetching
- Use React Query DevTools in development for debugging
- Test data fetching thoroughly including error scenarios