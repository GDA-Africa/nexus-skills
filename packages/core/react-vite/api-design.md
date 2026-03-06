---
skill: api-design
version: 1.0.0
framework: react-vite
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

# Skill: API Design (React + Vite)

## When to Read This
Read this skill when designing, implementing, or consuming APIs (REST, GraphQL, or other API types) in a React + Vite application.

## Context
This project follows RESTful principles for HTTP APIs and GraphQL best practices when using GraphQL. APIs should be consistent, predictable, well-documented, and versioned appropriately. Error handling, authentication, and rate limiting are essential considerations for all APIs. The frontend should handle API responses gracefully with proper loading states and error handling.

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
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  avatar?: string;
}
```

```tsx
// src/components/UserList.tsx
import { useState } from 'react';
import { useUsers } from '../hooks/useUsers';
import { ErrorBoundary } from '../components/ErrorBoundary';

export function UserList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  const { data, isLoading, error, isError } = useUsers({
    page,
    limit: 10,
    search,
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const handleDelete = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.deleteUser(userId);
        // Refetch users list
        // This would typically be handled by the hook's refetch function
      } catch (error) {
        console.error('Failed to delete user:', error);
        // Show error message to user
      }
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <button onClick={() => handleDelete(user.id)}>Delete</button>
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
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: ['users'] });
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
      
      // Invalidate users list
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
      
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      console.error('Failed to delete user:', error);
    },
  });
};
```

```typescript
// src/utils/apiErrorHandler.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public details?: any
  ) {
    super(message);
  }
}

export function handleApiError(error: any): ApiError {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return new ApiError(status, data?.message || 'Invalid request', data);
      case 401:
        return new ApiError(status, 'You need to log in to access this resource', data);
      case 403:
        return new ApiError(status, 'You do not have permission to access this resource', data);
      case 404:
        return new ApiError(status, 'The requested resource was not found', data);
      case 422:
        return new ApiError(status, data?.message || 'Validation failed', data);
      case 500:
        return new ApiError(status, 'Server error. Please try again later.', data);
      default:
        return new ApiError(status, data?.message || `Server error (${status})`, data);
    }
  } else if (error.request) {
    // Network error
    return new ApiError(0, 'Network error. Please check your connection.');
  } else {
    // Other error
    return new ApiError(-1, error.message || 'An unexpected error occurred');
  }
}
```

```typescript
// src/services/graphqlService.ts (if using GraphQL)
import { GraphQLClient, gql } from 'graphql-request';

class GraphQLService {
  private client: GraphQLClient;

  constructor() {
    this.client = new GraphQLClient(import.meta.env.VITE_GRAPHQL_ENDPOINT || '/graphql', {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async request<T>(document: string, variables?: any): Promise<T> {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        this.client.setHeader('Authorization', `Bearer ${token}`);
      }

      return await this.client.request<T>(document, variables);
    } catch (error) {
      console.error('GraphQL error:', error);
      throw error;
    }
  }
}

export const graphqlService = new GraphQLService();

// Example GraphQL queries
export const GET_USERS = gql`
  query GetUsers($page: Int, $limit: Int, $search: String) {
    users(page: $page, limit: $limit, search: $search) {
      data {
        id
        name
        email
        createdAt
      }
      total
      page
      totalPages
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
      createdAt
    }
  }
`;
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