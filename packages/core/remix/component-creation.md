---
skill: component-creation
version: 1.0.0
framework: remix
category: ui
triggers:
  - "component creation"
  - "Remix components"
  - "Remix patterns"
  - "component architecture"
author: "@nexus-framework/skills"
status: active
---

# Skill: Component Creation (Remix)

## When to Read This
Read this skill when creating new React components, designing component architecture, or establishing component patterns in a Remix application.

## Context
This project follows Remix's component-based architecture with a focus on server-side rendering, nested routes, and data loading. We use React with TypeScript for type safety, proper component structure, and Remix's built-in features like loaders, actions, and error boundaries. Components are designed to be composable, performant, and maintainable with proper prop validation and accessibility considerations.

## Steps
1. Define component purpose and responsibilities
2. Create TypeScript interfaces for props and state
3. Implement component with proper data loading patterns
4. Add proper event handling and lifecycle management
5. Implement accessibility features and keyboard navigation
6. Add proper styling with scoped styles or CSS Modules
7. Write comprehensive tests for the component
8. Document component usage and props

## Patterns We Use
- React components: Use functional components with hooks
- TypeScript: Define clear interfaces for all props and state
- Data loading: Use Remix loaders and useLoaderData
- Error boundaries: Use Remix error boundaries for error handling
- Nested routes: Design components for nested route patterns
- Forms: Use Remix forms with proper validation
- Accessibility: Implement proper ARIA attributes and keyboard navigation
- Performance: Optimize for server-side rendering and hydration

## Anti-Patterns — Never Do This
- ❌ Do not create overly complex components with too many responsibilities
- ❌ Do not ignore TypeScript for component props
- ❌ Do not hardcode values in components
- ❌ Do not forget to handle loading and error states
- ❌ Do not ignore accessibility in component design
- ❌ Do not create components that are too tightly coupled
- ❌ Do not forget to clean up subscriptions and event listeners
- ❌ Do not ignore component testing

## Example

```tsx
// app/components/Button/Button.tsx
import React from 'react';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'medium',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const buttonClasses = [
      styles.button,
      styles[`button--${variant}`],
      styles[`button--${size}`],
      isLoading && styles['button--loading'],
      leftIcon && styles['button--icon'],
      rightIcon && styles['button--icon'],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isLoading || disabled) {
        event.preventDefault();
        return;
      }
      
      onClick?.(event);
    };

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || isLoading}
        aria-disabled={disabled || isLoading}
        onClick={handleClick}
        {...props}
      >
        {leftIcon && <span className={styles.buttonIcon}>{leftIcon}</span>}
        {children}
        {rightIcon && <span className={styles.buttonIcon}>{rightIcon}</span>}
        {isLoading && (
          <span className={styles.buttonSpinner} aria-hidden="true">
            <svg className={styles.buttonSpinnerIcon} viewBox="0 0 50 50">
              <circle className={styles.buttonSpinnerPath} cx="25" cy="25" r="20" fill="none" strokeWidth="4" />
            </svg>
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

```css
/* app/components/Button/Button.module.css */
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  border-radius: var(--border-radius-md);
  border: var(--border-width) solid transparent;
  cursor: pointer;
  transition: all var(--transition-normal);
  text-decoration: none;
  user-select: none;
  position: relative;
  white-space: nowrap;
}

.button:hover {
  transform: translateY(-1px);
}

.button:active {
  transform: translateY(0);
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  pointer-events: none;
}

/* Variants */
.button--primary {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.button--primary:hover:not(:disabled) {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

.button--secondary {
  background-color: transparent;
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.button--secondary:hover:not(:disabled) {
  background-color: var(--color-primary);
  color: white;
}

.button--ghost {
  background-color: transparent;
  color: var(--color-gray-700);
  border-color: transparent;
}

.button--ghost:hover:not(:disabled) {
  background-color: var(--color-gray-100);
  color: var(--color-gray-900);
}

.button--danger {
  background-color: var(--color-danger);
  color: white;
  border-color: var(--color-danger);
}

.button--danger:hover:not(:disabled) {
  background-color: color-mix(in srgb, var(--color-danger) 90%, black);
  border-color: color-mix(in srgb, var(--color-danger) 90%, black);
}

/* Sizes */
.button--small {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.button--large {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-lg);
}

/* States */
.button--loading {
  pointer-events: none;
}

.button--loading::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 16px;
  height: 16px;
  margin: -8px 0 0 -8px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: button-spin 1s linear infinite;
}

/* Icons */
.button--icon .buttonIcon {
  margin-right: var(--spacing-xs);
}

.button--icon-only .buttonIcon {
  margin-right: 0;
}

.buttonSpinner {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.buttonSpinnerIcon {
  width: 16px;
  height: 16px;
  animation: button-spin 1s linear infinite;
}

.buttonSpinnerPath {
  stroke: currentColor;
  stroke-linecap: round;
  animation: spinner-dash 1.5s ease-in-out infinite;
}

@keyframes button-spin {
  to { transform: rotate(360deg); }
}

@keyframes spinner-dash {
  0% {
    stroke-dasharray: 1, 150;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -40;
  }
  100% {
    stroke-dasharray: 90, 150;
    stroke-dashoffset: -120;
  }
}
```

```tsx
// app/components/Card/Card.tsx
import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'small' | 'medium' | 'large';
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'default', 
  padding = 'medium', 
  className, 
  onClick,
  ...props 
}) => {
  return (
    <div
      className={[
        styles.card,
        styles[`card--${variant}`],
        styles[`card--${padding}`],
        onClick && styles['card--clickable'],
        className,
      ].filter(Boolean).join(' ')}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};
```

```css
/* app/components/Card/Card.module.css */
.card {
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-md);
  transition: box-shadow var(--transition-normal), transform var(--transition-normal);
}

.card--elevated {
  box-shadow: var(--shadow-lg);
}

.card--outlined {
  box-shadow: none;
  border: 1px solid var(--color-gray-200);
}

.card--small {
  padding: var(--spacing-sm);
}

.card--large {
  padding: var(--spacing-xl);
}

.card--clickable {
  cursor: pointer;
}

.card--clickable:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}

@media (prefers-color-scheme: dark) {
  .card {
    background-color: var(--color-gray-800);
  }
  
  .card--outlined {
    border-color: var(--color-gray-700);
  }
}
```

```tsx
// app/components/Form/Input/Input.tsx
import React from 'react';
import styles from './Input.module.css';

type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helpText?: string;
  size?: 'small' | 'medium' | 'large';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helpText,
      size = 'medium',
      leftIcon,
      rightIcon,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();
    const hasError = Boolean(error);
    
    const inputClasses = [
      styles.input,
      styles[`input--${size}`],
      hasError && styles['input--error'],
      leftIcon && styles['input--icon-left'],
      rightIcon && styles['input--icon-right'],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={styles.inputWrapper}>
        {label && (
          <label htmlFor={inputId} className={styles.inputLabel}>
            {label}
          </label>
        )}
        
        <div className={styles.inputContainer}>
          {leftIcon && (
            <span className={styles.inputIconLeft} aria-hidden="true">
              {leftIcon}
            </span>
          )}
          
          <input
            ref={ref}
            id={inputId}
            className={inputClasses}
            aria-invalid={hasError}
            aria-describedby={
              [label && `${inputId}-label`, error && `${inputId}-error`, helpText && `${inputId}-help`]
                .filter(Boolean)
                .join(' ')
            }
            {...props}
          />
          
          {rightIcon && (
            <span className={styles.inputIconRight} aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </div>
        
        {error && (
          <span id={`${inputId}-error`} className={styles.inputError} role="alert">
            {error}
          </span>
        )}
        
        {helpText && (
          <span id={`${inputId}-help`} className={styles.inputHelp}>
            {helpText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

```css
/* app/components/Form/Input/Input.module.css */
.inputWrapper {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.inputLabel {
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-700);
  font-size: var(--font-size-sm);
}

.inputContainer {
  position: relative;
  display: flex;
  align-items: center;
}

.input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: var(--border-width) solid var(--color-gray-300);
  border-radius: var(--border-radius-md);
  font-size: var(--font-size-base);
  transition: border-color var(--transition-normal), box-shadow var(--transition-normal);
  background-color: white;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(var(--color-primary), 0.25);
}

.input:hover {
  border-color: var(--color-gray-400);
}

.input:disabled {
  background-color: var(--color-gray-100);
  color: var(--color-gray-500);
  cursor: not-allowed;
}

.input::placeholder {
  color: var(--color-gray-400);
}

/* Sizes */
.input--small {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.input--large {
  padding: var(--spacing-md) var(--spacing-lg);
  font-size: var(--font-size-lg);
}

/* States */
.input--error {
  border-color: var(--color-danger);
}

.input--error:focus {
  box-shadow: 0 0 0 3px rgba(var(--color-danger), 0.25);
}

/* Icons */
.input--icon-left {
  padding-left: var(--spacing-lg);
}

.input--icon-right {
  padding-right: var(--spacing-lg);
}

.inputIconLeft,
.inputIconRight {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-gray-500);
  pointer-events: none;
  z-index: 1;
}

.inputIconLeft {
  left: var(--spacing-sm);
}

.inputIconRight {
  right: var(--spacing-sm);
}

.inputError {
  color: var(--color-danger);
  font-size: var(--font-size-sm);
}

.inputHelp {
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
}

@media (prefers-color-scheme: dark) {
  .input {
    background-color: var(--color-gray-800);
    border-color: var(--color-gray-600);
    color: var(--color-gray-100);
  }

  .input::placeholder {
    color: var(--color-gray-400);
  }

  .inputLabel {
    color: var(--color-gray-200);
  }
}
```

```tsx
// app/components/Modal/Modal.tsx
import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  closeOnOverlayClick = true,
  closeOnEscape = true 
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && closeOnOverlayClick && modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, closeOnOverlayClick, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, closeOnEscape, onClose]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Focus the modal
      const focusableElement = modalRef.current?.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
      
      if (focusableElement) {
        focusableElement.focus();
      }
    } else if (previousActiveElement.current) {
      // Restore focus to the previously focused element
      previousActiveElement.current.focus();
      previousActiveElement.current = null;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      onClick={(e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className={`${styles.modalContent} ${styles[`modalContent--${size}`]}`}
        role="document"
      >
        {(title || onClose) && (
          <div className={styles.modalHeader}>
            {title && (
              <h2 id="modal-title" className={styles.modalTitle}>
                {title}
              </h2>
            )}
            {onClose && (
              <button
                className={styles.modalClose}
                onClick={onClose}
                aria-label="Close modal"
                type="button"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M18 6L6 18M6 6l12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
        
        <div className={styles.modalBody}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
```

```css
/* app/components/Modal/Modal.module.css */
.modalOverlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--spacing-md);
}

.modalContent {
  background: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: modal-slide-in 0.3s ease-out;
}

.modalContent--small {
  max-width: 400px;
}

.modalContent--medium {
  max-width: 600px;
}

.modalContent--large {
  max-width: 800px;
}

.modalHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-gray-200);
}

.modalTitle {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-900);
}

.modalClose {
  background: none;
  border: none;
  cursor: pointer;
  padding: var(--spacing-xs);
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color var(--transition-normal);
}

.modalClose:hover {
  background-color: var(--color-gray-100);
}

.modalClose:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.modalBody {
  padding: var(--spacing-md);
  overflow: auto;
}

@keyframes modal-slide-in {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-color-scheme: dark) {
  .modalContent {
    background: var(--color-gray-800);
  }

  .modalHeader {
    border-bottom-color: var(--color-gray-700);
  }

  .modalTitle {
    color: var(--color-gray-100);
  }

  .modalClose:hover {
    background-color: var(--color-gray-700);
  }
}
```

```tsx
// app/components/DataTable/DataTable.tsx
import React, { useState, useMemo } from 'react';
import { useTable, useSortBy, usePagination } from 'react-table';
import { TableProps } from './types';
import styles from './DataTable.module.css';

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  pageSize = 10,
  sortable = true,
  paginated = true,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
}: TableProps<T>) {
  const [pageIndex, setPageIndex] = useState(0);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    state: { sortBy },
  } = useTable(
    {
      columns,
      data,
      initialState: {
        pageIndex: 0,
        pageSize,
      },
    },
    useSortBy,
    usePagination
  );

  const sortedData = useMemo(() => {
    if (!sortable || !sortBy.length) return data;
    
    const sorted = [...data].sort((a, b) => {
      const { id, desc } = sortBy[0];
      const aValue = a[id];
      const bValue = b[id];
      
      if (aValue < bValue) return desc ? 1 : -1;
      if (aValue > bValue) return desc ? -1 : 1;
      return 0;
    });
    
    return sorted;
  }, [data, sortBy, sortable]);

  const displayedData = paginated ? page : sortedData;

  return (
    <div className={`${styles.dataTable} ${className}`}>
      <div className={styles.tableWrapper}>
        <table {...getTableProps()} className={styles.table}>
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                {headerGroup.headers.map(column => (
                  <th
                    {...column.getHeaderProps(
                      sortable && column.getSortByToggleProps()
                    )}
                    className={`${styles.tableHeader} ${
                      column.isSorted ? (column.isSortedDesc ? styles.sortDesc : styles.sortAsc) : ''
                    }`}
                    key={column.id}
                  >
                    <div className={styles.headerContent}>
                      {column.render('Header')}
                      {sortable && (
                        <span className={styles.sortIndicator}>
                          {column.isSorted ? (
                            column.isSortedDesc ? ' ↓' : ' ↑'
                          ) : (
                            '↕'
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className={styles.loadingRow}>
                  Loading...
                </td>
              </tr>
            ) : displayedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className={styles.emptyRow}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              displayedData.map((row, index) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} key={row.id}>
                    {row.cells.map(cell => (
                      <td {...cell.getCellProps()} className={styles.tableCell} key={cell.column.id}>
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {paginated && pageCount > 1 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Page {pageIndex + 1} of {pageCount}
          </div>
          
          <div className={styles.paginationControls}>
            <button
              onClick={() => gotoPage(0)}
              disabled={!canPreviousPage}
              className={styles.paginationButton}
            >
              First
            </button>
            <button
              onClick={() => gotoPage(pageIndex - 1)}
              disabled={!canPreviousPage}
              className={styles.paginationButton}
            >
              Previous
            </button>
            <button
              onClick={() => gotoPage(pageIndex + 1)}
              disabled={!canNextPage}
              className={styles.paginationButton}
            >
              Next
            </button>
            <button
              onClick={() => gotoPage(pageCount - 1)}
              disabled={!canNextPage}
              className={styles.paginationButton}
            >
              Last
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

```typescript
// app/components/DataTable/types.ts
export interface Column<T extends Record<string, any>> {
  Header: string | React.ReactNode;
  accessor: keyof T | string;
  Cell?: (props: { value: any; row: { original: T } }) => React.ReactNode;
  sortable?: boolean;
  width?: number | string;
}

export interface TableProps<T extends Record<string, any>> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  sortable?: boolean;
  paginated?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}
```

```css
/* app/components/DataTable/DataTable.module.css */
.dataTable {
  width: 100%;
}

.tableWrapper {
  overflow-x: auto;
  border-radius: var(--border-radius-md);
  border: 1px solid var(--color-gray-200);
}

.table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
}

.tableHeader {
  background-color: var(--color-gray-50);
  text-align: left;
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  color: var(--color-gray-700);
  border-bottom: 2px solid var(--color-gray-200);
  position: sticky;
  top: 0;
  z-index: 1;
  cursor: pointer;
  transition: background-color var(--transition-normal);
}

.tableHeader:hover {
  background-color: var(--color-gray-100);
}

.sortAsc .sortIndicator {
  color: var(--color-primary);
}

.sortDesc .sortIndicator {
  color: var(--color-primary);
}

.headerContent {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-sm);
}

.sortIndicator {
  color: var(--color-gray-500);
  font-size: var(--font-size-xs);
}

.tableCell {
  padding: var(--spacing-sm);
  border-bottom: 1px solid var(--color-gray-100);
  font-size: var(--font-size-base);
  color: var(--color-gray-900);
}

.loadingRow,
.emptyRow {
  text-align: center;
  padding: var(--spacing-xl);
  color: var(--color-gray-500);
  font-style: italic;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-top: 1px solid var(--color-gray-200);
  background-color: var(--color-gray-50);
}

.paginationInfo {
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
}

.paginationControls {
  display: flex;
  gap: var(--spacing-xs);
}

.paginationButton {
  padding: var(--spacing-xs) var(--spacing-sm);
  border: 1px solid var(--color-gray-300);
  background-color: white;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  transition: all var(--transition-normal);
}

.paginationButton:hover:not(:disabled) {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.paginationButton:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (prefers-color-scheme: dark) {
  .tableWrapper {
    border-color: var(--color-gray-700);
  }

  .table {
    background-color: var(--color-gray-800);
  }

  .tableHeader {
    background-color: var(--color-gray-700);
    color: var(--color-gray-200);
    border-bottom-color: var(--color-gray-600);
  }

  .tableHeader:hover {
    background-color: var(--color-gray-600);
  }

  .tableCell {
    border-bottom-color: var(--color-gray-700);
    color: var(--color-gray-100);
  }

  .pagination {
    border-top-color: var(--color-gray-700);
    background-color: var(--color-gray-700);
  }
}
```

## Notes
- Use TypeScript for all component props and state
- Follow consistent naming conventions (PascalCase for components)
- Implement proper accessibility features (ARIA attributes, keyboard navigation)
- Use Remix's data loading patterns with loaders and useLoaderData
- Implement proper error handling with Remix error boundaries
- Design components for nested route patterns
- Use Remix forms for form handling and validation
- Write comprehensive tests for all components
- Document component usage with prop types and examples
- Follow Remix's best practices for server-side rendering and hydration