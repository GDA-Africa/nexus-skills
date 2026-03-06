---
skill: component-creation
version: 1.0.0
framework: sveltekit
category: ui
triggers:
  - "component creation"
  - "Svelte components"
  - "Svelte patterns"
  - "component architecture"
author: "@nexus-framework/skills"
status: active
---

# Skill: Component Creation (SvelteKit)

## When to Read This
Read this skill when creating new Svelte components, designing component architecture, or establishing component patterns in a SvelteKit application.

## Context
This project follows Svelte's component-based architecture with a focus on simplicity, reactivity, and performance. We use Svelte's built-in features like stores, actions, and lifecycle events. Components are designed to be composable, reactive, and maintainable with proper TypeScript support and accessibility considerations.

## Steps
1. Define component purpose and responsibilities
2. Create TypeScript interfaces for props and state
3. Implement component with Svelte's reactivity system
4. Add proper event handling and lifecycle management
5. Implement accessibility features and keyboard navigation
6. Add proper styling with scoped styles or CSS Modules
7. Write comprehensive tests for the component
8. Document component usage and props

## Patterns We Use
- Svelte components: Use .svelte files with proper structure
- Stores: Use writable, readable, and derived stores for state management
- Actions: Use custom actions for DOM manipulation and lifecycle events
- Slots: Use slots for content projection and composition
- Bindings: Use bind: for two-way data binding
- Events: Use createEventDispatcher for component communication
- TypeScript: Define clear interfaces for all props and state
- Accessibility: Implement proper ARIA attributes and keyboard navigation

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

```svelte
<!-- src/lib/components/Button/Button.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { ComponentEvents } from 'svelte/elements';

  type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
  type ButtonSize = 'small' | 'medium' | 'large';

  interface ButtonProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    leftIcon?: string;
    rightIcon?: string;
    disabled?: boolean;
  }

  interface ButtonEvents {
    click: MouseEvent;
  }

  const dispatch = createEventDispatcher<ButtonEvents>();

  let {
    variant = 'primary',
    size = 'medium',
    isLoading = false,
    leftIcon,
    rightIcon,
    disabled = false,
  }: ButtonProps = $props();

  function handleClick(event: MouseEvent) {
    if (isLoading || disabled) {
      event.preventDefault();
      return;
    }
    dispatch('click', event);
  }
</script>

<button
  class={[
    'btn',
    `btn--${variant}`,
    `btn--${size}`,
    isLoading && 'btn--loading',
    leftIcon && 'btn--icon',
    rightIcon && 'btn--icon',
  ]}
  disabled={disabled || isLoading}
  aria-disabled={disabled || isLoading}
  on:click={handleClick}
>
  {#if leftIcon}
    <span class="btn__icon">{leftIcon}</span>
  {/if}
  
  <slot />
  
  {#if rightIcon}
    <span class="btn__icon">{rightIcon}</span>
  {/if}
  
  {#if isLoading}
    <span class="btn__spinner" aria-hidden="true">
      <svg class="btn__spinner-icon" viewBox="0 0 50 50">
        <circle class="btn__spinner-path" cx="25" cy="25" r="20" fill="none" stroke-width="4" />
      </svg>
    </span>
  {/if}
</button>

<style>
  .btn {
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

  .btn:hover {
    transform: translateY(-1px);
  }

  .btn:active {
    transform: translateY(0);
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    pointer-events: none;
  }

  /* Variants */
  .btn--primary {
    background-color: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }

  .btn--primary:hover:not(:disabled) {
    background-color: var(--color-primary-hover);
    border-color: var(--color-primary-hover);
  }

  .btn--secondary {
    background-color: transparent;
    color: var(--color-primary);
    border-color: var(--color-primary);
  }

  .btn--secondary:hover:not(:disabled) {
    background-color: var(--color-primary);
    color: white;
  }

  .btn--ghost {
    background-color: transparent;
    color: var(--color-gray-700);
    border-color: transparent;
  }

  .btn--ghost:hover:not(:disabled) {
    background-color: var(--color-gray-100);
    color: var(--color-gray-900);
  }

  .btn--danger {
    background-color: var(--color-danger);
    color: white;
    border-color: var(--color-danger);
  }

  .btn--danger:hover:not(:disabled) {
    background-color: color-mix(in srgb, var(--color-danger) 90%, black);
    border-color: color-mix(in srgb, var(--color-danger) 90%, black);
  }

  /* Sizes */
  .btn--small {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-sm);
  }

  .btn--large {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--font-size-lg);
  }

  /* States */
  .btn--loading {
    pointer-events: none;
  }

  .btn--loading::after {
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
  .btn--icon .btn__icon {
    margin-right: var(--spacing-xs);
  }

  .btn--icon-only .btn__icon {
    margin-right: 0;
  }

  .btn__spinner {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .btn__spinner-icon {
    width: 16px;
    height: 16px;
    animation: button-spin 1s linear infinite;
  }

  .btn__spinner-path {
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
</style>
```

```svelte
<!-- src/lib/components/Card/Card.svelte -->
<script lang="ts">
  import type { ComponentEvents } from 'svelte/elements';

  interface CardProps {
    variant?: 'default' | 'elevated' | 'outlined';
    padding?: 'small' | 'medium' | 'large';
    onClick?: () => void;
  }

  let {
    variant = 'default',
    padding = 'medium',
    onClick,
  }: CardProps = $props();
</script>

<div
  class={[
    'card',
    `card--${variant}`,
    `card--${padding}`,
    onClick && 'card--clickable',
  ]}
  on:click={onClick}
>
  <slot />
</div>

<style>
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
</style>
```

```svelte
<!-- src/lib/components/Form/Input/Input.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  interface InputProps {
    label?: string;
    error?: string;
    helpText?: string;
    size?: 'small' | 'medium' | 'large';
    leftIcon?: string;
    rightIcon?: string;
    type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
  }

  interface InputEvents {
    input: Event;
    change: Event;
  }

  const dispatch = createEventDispatcher<InputEvents>();

  let {
    label,
    error,
    helpText,
    size = 'medium',
    leftIcon,
    rightIcon,
    type = 'text',
    value = '',
    placeholder,
    disabled = false,
    required = false,
  }: InputProps = $props();

  let inputId = Math.random().toString(36).substr(2, 9);
  let hasError = $derived(!!error);
</script>

<div class="input-wrapper">
  {#if label}
    <label for={inputId} class="input-label">
      {label}
      {#if required}
        <span class="required" aria-hidden="true">*</span>
      {/if}
    </label>
  {/if}
  
  <div class="input-container">
    {#if leftIcon}
      <span class="input-icon input-icon--left" aria-hidden="true">
        {leftIcon}
      </span>
    {/if}
    
    <input
      id={inputId}
      bind:value
      type={type}
      class={[
        'input',
        `input--${size}`,
        hasError && 'input--error',
        leftIcon && 'input--icon-left',
        rightIcon && 'input--icon-right',
      ]}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      aria-invalid={hasError}
      aria-describedby={
        [
          label && `${inputId}-label`,
          error && `${inputId}-error`,
          helpText && `${inputId}-help`
        ]
          .filter(Boolean)
          .join(' ')
      }
      on:input={(e) => dispatch('input', e)}
      on:change={(e) => dispatch('change', e)}
    />
    
    {#if rightIcon}
      <span class="input-icon input-icon--right" aria-hidden="true">
        {rightIcon}
      </span>
    {/if}
  </div>
  
  {#if error}
    <span id={`${inputId}-error`} class="input-error" role="alert">
      {error}
    </span>
  {/if}
  
  {#if helpText}
    <span id={`${inputId}-help`} class="input-help">
      {helpText}
    </span>
  {/if}
</div>

<style>
  .input-wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xs);
  }

  .input-label {
    font-weight: var(--font-weight-medium);
    color: var(--color-gray-700);
    font-size: var(--font-size-sm);
  }

  .required {
    color: var(--color-danger);
    margin-left: var(--spacing-xs);
  }

  .input-container {
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

  .input-icon {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-gray-500);
    pointer-events: none;
    z-index: 1;
  }

  .input-icon--left {
    left: var(--spacing-sm);
  }

  .input-icon--right {
    right: var(--spacing-sm);
  }

  .input-error {
    color: var(--color-danger);
    font-size: var(--font-size-sm);
  }

  .input-help {
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

    .input-label {
      color: var(--color-gray-200);
    }
  }
</style>
```

```svelte
<!-- src/lib/components/Modal/Modal.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  interface ModalProps {
    isOpen: boolean;
    title?: string;
    size?: 'small' | 'medium' | 'large';
    closeOnOverlayClick?: boolean;
    closeOnEscape?: boolean;
  }

  interface ModalEvents {
    close: void;
  }

  const dispatch = createEventDispatcher<ModalEvents>();

  let {
    isOpen = false,
    title,
    size = 'medium',
    closeOnOverlayClick = true,
    closeOnEscape = true,
  }: ModalProps = $props();

  let modalElement: HTMLElement;
  let previousActiveElement: HTMLElement | null = null;

  function handleClose() {
    dispatch('close');
  }

  function handleOverlayClick(event: MouseEvent) {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      handleClose();
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && closeOnEscape) {
      handleClose();
    }
  }

  function focusFirstElement() {
    const focusableElement = modalElement?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as HTMLElement;
    
    if (focusableElement) {
      focusableElement.focus();
    }
  }

  $: if (isOpen) {
    // Store the previously focused element
    previousActiveElement = document.activeElement as HTMLElement;
    
    // Focus management
    onMount(() => {
      focusFirstElement();
      
      // Add event listeners
      document.addEventListener('keydown', handleKeyDown);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    });
  }

  $: if (!isOpen && previousActiveElement) {
    onDestroy(() => {
      previousActiveElement.focus();
      previousActiveElement = null;
    });
  }
</script>

{#if isOpen}
  <div
    class="modal-overlay"
    role="dialog"
    aria-modal="true"
    aria-labelledby={title ? "modal-title" : undefined}
    on:click={handleOverlayClick}
  >
    <div
      bind:this={modalElement}
      class={['modal-content', `modal-content--${size}`]}
      role="document"
      tabindex="-1"
    >
      {#if title || closeOnEscape}
        <div class="modal-header">
          {#if title}
            <h2 id="modal-title" class="modal-title">
              {title}
            </h2>
          {/if}
          {#if closeOnEscape}
            <button
              class="modal-close"
              on:click={handleClose}
              aria-label="Close modal"
              type="button"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          {/if}
        </div>
      {/if}
      
      <div class="modal-body">
        <slot />
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
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

  .modal-content {
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

  .modal-content--small {
    max-width: 400px;
  }

  .modal-content--medium {
    max-width: 600px;
  }

  .modal-content--large {
    max-width: 800px;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--color-gray-200);
  }

  .modal-title {
    margin: 0;
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
    color: var(--color-gray-900);
  }

  .modal-close {
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

  .modal-close:hover {
    background-color: var(--color-gray-100);
  }

  .modal-close:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }

  .modal-body {
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
    .modal-content {
      background: var(--color-gray-800);
    }

    .modal-header {
      border-bottom-color: var(--color-gray-700);
    }

    .modal-title {
      color: var(--color-gray-100);
    }

    .modal-close:hover {
      background-color: var(--color-gray-700);
    }
  }
</style>
```

```svelte
<!-- src/lib/components/DataTable/DataTable.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';

  interface Column<T> {
    key: keyof T;
    header: string;
    sortable?: boolean;
    width?: number | string;
    cell?: (value: any, row: T) => string;
  }

  interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    pageSize?: number;
    sortable?: boolean;
    paginated?: boolean;
    loading?: boolean;
    emptyMessage?: string;
    className?: string;
  }

  let {
    columns,
    data = [],
    pageSize = 10,
    sortable = true,
    paginated = true,
    loading = false,
    emptyMessage = 'No data available',
    className = '',
  }: DataTableProps<any> = $props();

  let pageIndex = $state(0);
  let sortBy: { key: string; desc: boolean } | null = $state(null);

  $: sortedData = sortable && sortBy 
    ? [...data].sort((a, b) => {
        const aValue = a[sortBy.key];
        const bValue = b[sortBy.key];
        
        if (aValue < bValue) return sortBy.desc ? 1 : -1;
        if (aValue > bValue) return sortBy.desc ? -1 : 1;
        return 0;
      })
    : data;

  $: displayedData = paginated ? sortedData.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize) : sortedData;

  $: pageCount = Math.ceil(data.length / pageSize);

  function handleSort(column: Column<any>) {
    if (!sortable || !column.sortable) return;

    if (sortBy?.key === column.key) {
      sortBy = { ...sortBy, desc: !sortBy.desc };
    } else {
      sortBy = { key: column.key as string, desc: false };
    }
  }

  function goToPage(page: number) {
    if (page >= 0 && page < pageCount) {
      pageIndex = page;
    }
  }

  function getCellValue(column: Column<any>, row: any) {
    if (column.cell) {
      return column.cell(row[column.key], row);
    }
    return row[column.key];
  }
</script>

<div class={['data-table', className]}>
  <div class="table-wrapper">
    <table class="table">
      <thead>
        <tr>
          {#each columns as column}
            <th
              class={[
                'table-header',
                column.sortable && 'table-header--sortable',
                sortBy?.key === column.key && (sortBy.desc ? 'sort-desc' : 'sort-asc')
              ]}
              style={column.width ? `width: ${column.width}` : undefined}
              on:click={() => handleSort(column)}
            >
              <div class="header-content">
                {column.header}
                {#if column.sortable}
                  <span class="sort-indicator">
                    {#if sortBy?.key === column.key}
                      {sortBy.desc ? ' ↓' : ' ↑'}
                    {:else}
                      '↕'
                    {/if}
                  </span>
                {/if}
              </div>
            </th>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#if loading}
          <tr>
            <td colspan={columns.length} class="loading-row">
              Loading...
            </td>
          </tr>
        {:else if displayedData.length === 0}
          <tr>
            <td colspan={columns.length} class="empty-row">
              {emptyMessage}
            </td>
          </tr>
        {:else}
          {#each displayedData as row, index}
            <tr class="table-row">
              {#each columns as column}
                <td class="table-cell">
                  {getCellValue(column, row)}
                </td>
              {/each}
            </tr>
          {/each}
        {/if}
      </tbody>
    </table>
  </div>

  {#if paginated && pageCount > 1}
    <div class="pagination">
      <div class="pagination-info">
        Page {pageIndex + 1} of {pageCount}
      </div>
      
      <div class="pagination-controls">
        <button
          on:click={() => goToPage(0)}
          disabled={pageIndex === 0}
          class="pagination-button"
        >
          First
        </button>
        <button
          on:click={() => goToPage(pageIndex - 1)}
          disabled={pageIndex === 0}
          class="pagination-button"
        >
          Previous
        </button>
        <button
          on:click={() => goToPage(pageIndex + 1)}
          disabled={pageIndex === pageCount - 1}
          class="pagination-button"
        >
          Next
        </button>
        <button
          on:click={() => goToPage(pageCount - 1)}
          disabled={pageIndex === pageCount - 1}
          class="pagination-button"
        >
          Last
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .data-table {
    width: 100%;
  }

  .table-wrapper {
    overflow-x: auto;
    border-radius: var(--border-radius-md);
    border: 1px solid var(--color-gray-200);
  }

  .table {
    width: 100%;
    border-collapse: collapse;
    background-color: white;
  }

  .table-header {
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

  .table-header:hover {
    background-color: var(--color-gray-100);
  }

  .table-header--sortable {
    user-select: none;
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm);
  }

  .sort-indicator {
    color: var(--color-gray-500);
    font-size: var(--font-size-xs);
  }

  .sort-asc .sort-indicator,
  .sort-desc .sort-indicator {
    color: var(--color-primary);
  }

  .table-cell {
    padding: var(--spacing-sm);
    border-bottom: 1px solid var(--color-gray-100);
    font-size: var(--font-size-base);
    color: var(--color-gray-900);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .loading-row,
  .empty-row {
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

  .pagination-info {
    color: var(--color-gray-600);
    font-size: var(--font-size-sm);
  }

  .pagination-controls {
    display: flex;
    gap: var(--spacing-xs);
  }

  .pagination-button {
    padding: var(--spacing-xs) var(--spacing-sm);
    border: 1px solid var(--color-gray-300);
    background-color: white;
    border-radius: var(--border-radius-md);
    cursor: pointer;
    font-size: var(--font-size-sm);
    transition: all var(--transition-normal);
  }

  .pagination-button:hover:not(:disabled) {
    background-color: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
  }

  .pagination-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (prefers-color-scheme: dark) {
    .table-wrapper {
      border-color: var(--color-gray-700);
    }

    .table {
      background-color: var(--color-gray-800);
    }

    .table-header {
      background-color: var(--color-gray-700);
      color: var(--color-gray-200);
      border-bottom-color: var(--color-gray-600);
    }

    .table-header:hover {
      background-color: var(--color-gray-600);
    }

    .table-cell {
      border-bottom-color: var(--color-gray-700);
      color: var(--color-gray-100);
    }

    .pagination {
      border-top-color: var(--color-gray-700);
      background-color: var(--color-gray-700);
    }
  }
</style>
```

## Notes
- Use TypeScript for all component props and state
- Follow consistent naming conventions (PascalCase for components)
- Implement proper accessibility features (ARIA attributes, keyboard navigation)
- Use Svelte's reactivity system effectively with $state and $derived
- Use stores for shared state management across components
- Implement proper event handling with createEventDispatcher
- Use slots for content projection and component composition
- Write comprehensive tests for all components
- Document component usage with prop types and examples
- Follow Svelte's best practices for performance and maintainability