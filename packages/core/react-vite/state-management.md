---
skill: state-management
version: 1.0.0
framework: react-vite
category: workflow
triggers:
  - "state management"
  - "global state"
  - "zustand"
  - "redux"
  - "context"
author: "@nexus-framework/skills"
status: active
---

# Skill: State Management (React + Vite)

## When to Read This
Read this skill when implementing state management for application data, user preferences, or complex state logic in a React + Vite application.

## Context
This project uses Zustand for global state management due to its simplicity, performance, and TypeScript support. We follow a structured approach with separate stores for different concerns, proper TypeScript typing, and middleware for persistence and logging. Local component state is still managed with useState and useReducer for component-specific data.

## Steps
1. Choose appropriate state management approach (local vs global)
2. Create Zustand stores with proper TypeScript interfaces
3. Implement state persistence for user preferences and critical data
4. Add middleware for logging, persistence, and dev tools
5. Create selectors and actions following naming conventions
6. Integrate stores with components using proper patterns
7. Handle state initialization and cleanup
8. Test state management thoroughly

## Patterns We Use
- Zustand stores: Use for global state that needs to be shared across components
- Local state: Use useState/useReducer for component-specific state
- TypeScript interfaces: Define clear types for state structure
- Selectors: Use memoized selectors to optimize performance
- Actions: Use action creators for state mutations
- Persistence: Use persist middleware for critical user data
- Immer: Use for complex nested state updates
- Dev tools: Enable Redux DevTools in development

## Anti-Patterns — Never Do This
- ❌ Do not put all state in global stores - keep component state local
- ❌ Do not mutate state directly - always use actions
- ❌ Do not create circular dependencies between stores
- ❌ Do not store derived data in state - use selectors or computed values
- ❌ Do not ignore TypeScript for state interfaces
- ❌ Do not forget to handle state cleanup on unmount
- ❌ Do not over-optimize with memoization prematurely
- ❌ Do not store large amounts of data that should be in databases

## Example

```typescript
// src/stores/userStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface UserState {
  // State
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      user: null,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set((state) => {
        state.user = user;
      }),

      setLoading: (isLoading) => set((state) => {
        state.isLoading = isLoading;
      }),

      setError: (error) => set((state) => {
        state.error = error;
      }),

      clearError: () => set((state) => {
        state.error = null;
      }),

      logout: () => set((state) => {
        state.user = null;
        state.error = null;
      }),

      updateProfile: (updates) => set((state) => {
        if (state.user) {
          Object.assign(state.user, updates);
        }
      }),
    })),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        // Called after rehydration
        if (state?.user) {
          console.log('User state rehydrated:', state.user);
        }
      },
    }
  )
);
```

```typescript
// src/stores/themeStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  isHighContrast: boolean;
  
  setTheme: (theme: Theme) => void;
  toggleHighContrast: () => void;
  getEffectiveTheme: () => 'light' | 'dark';
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      isHighContrast: false,

      setTheme: (theme) => set({ theme }),
      
      toggleHighContrast: () => set((state) => ({
        isHighContrast: !state.isHighContrast,
      })),

      getEffectiveTheme: () => {
        const { theme, isHighContrast } = get();
        
        if (isHighContrast) return 'dark';
        
        if (theme === 'system') {
          return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        
        return theme;
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

```typescript
// src/stores/cartStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    immer((set, get) => ({
      items: [],
      isLoading: false,

      addItem: (item) => set((state) => {
        const existingItem = state.items.find(i => i.id === item.id);
        
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          state.items.push({ ...item, quantity: 1 });
        }
      }),

      removeItem: (id) => set((state) => {
        state.items = state.items.filter(item => item.id !== id);
      }),

      updateQuantity: (id, quantity) => set((state) => {
        const item = state.items.find(i => i.id === id);
        if (item) {
          if (quantity <= 0) {
            state.items = state.items.filter(i => i.id !== id);
          } else {
            item.quantity = quantity;
          }
        }
      }),

      clearCart: () => set((state) => {
        state.items = [];
      }),

      getTotal: () => {
        return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    })),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

```typescript
// src/stores/apiStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ApiState {
  requests: Record<string, { isLoading: boolean; error: string | null }>;
  
  startRequest: (key: string) => void;
  endRequest: (key: string, error?: string) => void;
  isRequestLoading: (key: string) => boolean;
  getRequestError: (key: string) => string | null;
}

export const useApiStore = create<ApiState>()(
  devtools((set, get) => ({
    requests: {},

    startRequest: (key) => set((state) => ({
      requests: {
        ...state.requests,
        [key]: { isLoading: true, error: null },
      },
    }), 'startRequest'),

    endRequest: (key, error) => set((state) => ({
      requests: {
        ...state.requests,
        [key]: { isLoading: false, error: error || null },
      },
    }), 'endRequest'),

    isRequestLoading: (key) => {
      return get().requests[key]?.isLoading || false;
    },

    getRequestError: (key) => {
      return get().requests[key]?.error || null;
    },
  }))
);
```

```typescript
// src/stores/index.ts
// Re-export all stores for easy importing
export { useUserStore } from './userStore';
export { useThemeStore } from './themeStore';
export { useCartStore } from './cartStore';
export { useApiStore } from './apiStore';

// Combined store hooks for convenience
export const useAppStore = () => ({
  user: useUserStore(),
  theme: useThemeStore(),
  cart: useCartStore(),
  api: useApiStore(),
});
```

```tsx
// src/components/UserProfile.tsx
import { useUserStore, useThemeStore } from '../stores';
import { useState } from 'react';

export function UserProfile() {
  const { user, updateProfile, logout, isLoading } = useUserStore();
  const { theme, setTheme } = useThemeStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  const handleSave = () => {
    if (user) {
      updateProfile({
        name: formData.name,
        email: formData.email,
      });
      setIsEditing(false);
    }
  };

  if (!user) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="user-profile">
      <div className="profile-header">
        <h2>User Profile</h2>
        <button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
      </div>

      <div className="profile-form">
        <div className="form-group">
          <label>Name:</label>
          {isEditing ? (
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          ) : (
            <span>{user.name}</span>
          )}
        </div>

        <div className="form-group">
          <label>Email:</label>
          {isEditing ? (
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          ) : (
            <span>{user.email}</span>
          )}
        </div>

        {isEditing && (
          <button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        )}
      </div>

      <div className="profile-actions">
        <div className="theme-selector">
          <label>Theme:</label>
          <select value={theme} onChange={(e) => setTheme(e.target.value as any)}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>

        <button onClick={logout} className="logout-btn">
          Logout
        </button>
      </div>
    </div>
  );
}
```

```tsx
// src/components/Cart.tsx
import { useCartStore } from '../stores';
import { useState } from 'react';

export function Cart() {
  const { items, removeItem, updateQuantity, getTotal, getItemCount, isLoading } = useCartStore();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const handleCheckout = async () => {
    setIsCheckoutLoading(true);
    try {
      // Process checkout
      console.log('Processing checkout for:', items);
      // Clear cart after successful checkout
      // This would typically be handled by the checkout API response
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  if (items.length === 0) {
    return <div>Your cart is empty.</div>;
  }

  return (
    <div className="cart">
      <h2>Shopping Cart ({getItemCount()})</h2>
      
      <div className="cart-items">
        {items.map((item) => (
          <div key={item.id} className="cart-item">
            {item.image && (
              <img src={item.image} alt={item.name} className="item-image" />
            )}
            
            <div className="item-details">
              <h3>{item.name}</h3>
              <p>${item.price.toFixed(2)}</p>
              
              <div className="quantity-controls">
                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                  -
                </button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                  +
                </button>
              </div>
            </div>

            <button onClick={() => removeItem(item.id)} className="remove-btn">
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="total">
          Total: ${getTotal().toFixed(2)}
        </div>
        
        <button 
          onClick={handleCheckout} 
          disabled={isLoading || isCheckoutLoading}
          className="checkout-btn"
        >
          {isLoading || isCheckoutLoading ? 'Processing...' : 'Checkout'}
        </button>
      </div>
    </div>
  );
}
```

```typescript
// src/hooks/useStore.ts
import { useStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { useUserStore } from '../stores';

// Custom hook for optimized user store access
export const useUser = () => {
  return useStore(useUserStore, useShallow((state) => ({
    user: state.user,
    isLoading: state.isLoading,
    error: state.error,
  })));
};

// Hook for specific user data
export const useCurrentUser = () => {
  return useStore(useUserStore, (state) => state.user);
};

// Hook for user actions
export const useUserActions = () => {
  return useStore(useUserStore, useShallow((state) => ({
    setUser: state.setUser,
    setLoading: state.setLoading,
    setError: state.setError,
    clearError: state.clearError,
    logout: state.logout,
    updateProfile: state.updateProfile,
  })));
};
```

```typescript
// src/utils/storeUtils.ts
import { StateCreator } from 'zustand';

// Utility for creating stores with common middleware
export const createAppStore = <T extends object>(
  createState: StateCreator<T, [], [], T>
) => {
  return create<T>()(
    // Add devtools in development
    process.env.NODE_ENV === 'development' 
      ? devtools(createState, { name: 'app-store' })
      : createState
  );
};

// Utility for creating persistent stores
export const createPersistentStore = <T extends object>(
  createState: StateCreator<T, [], [], T>,
  persistOptions: any
) => {
  return createAppStore(
    persist(createState, {
      ...persistOptions,
      storage: createJSONStorage(() => localStorage),
    })
  );
};

// Utility for creating stores with Immer
export const createImmerStore = <T extends object>(
  createState: StateCreator<T, [['zustand/immer', never]], [], T>
) => {
  return createAppStore(immer(createState));
};
```

## Notes
- Use Zustand for its simplicity and performance benefits over Redux
- Keep state structure flat when possible to avoid deep nesting
- Use persist middleware for user preferences and critical data
- Implement proper error handling and loading states
- Use selectors to optimize re-renders and performance
- Test state management thoroughly with unit and integration tests
- Consider using Immer for complex nested state updates
- Use dev tools in development for debugging state changes
- Clean up subscriptions and side effects in store cleanup
- Document state structure and update patterns for team consistency