---
skill: component-creation
version: 1.0.0
framework: nuxt
category: ui
triggers:
  - "component creation"
  - "Vue components"
  - "Nuxt components"
  - "component architecture"
author: "@nexus-framework/skills"
status: active
---

# Skill: Component Creation (Nuxt)

## When to Read This
Read this skill when creating new Vue components, designing component architecture, or establishing component patterns in a Nuxt application.

## Context
This project follows Vue 3's Composition API with Nuxt's conventions for component organization. We use TypeScript for type safety, proper component structure, and Nuxt's built-in features like composables and plugins. Components are designed to be composable, reactive, and maintainable with proper prop validation and accessibility considerations.

## Steps
1. Define component purpose and responsibilities
2. Create TypeScript interfaces for props and state
3. Implement component with Composition API and reactive state
4. Add proper event handling and lifecycle management
5. Implement accessibility features and keyboard navigation
6. Add proper styling with scoped styles or CSS Modules
7. Write comprehensive tests for the component
8. Document component usage and props

## Patterns We Use
- Composition API: Use setup() function with reactive state
- TypeScript: Define clear interfaces for all props and state
- Props validation: Use defineProps with TypeScript interfaces
- Emits: Use defineEmits for component communication
- Composables: Use Nuxt composables for shared logic
- Slots: Use slots for content projection and composition
- Accessibility: Implement proper ARIA attributes and keyboard navigation
- Error boundaries: Use Nuxt's error handling features

## Anti-Patterns — Never Do This
- ❌ Do not create overly complex components with too many responsibilities
- ❌ Do not ignore TypeScript for component props
- ❌ Do not hardcode values in components
- ❌ Do not forget to handle loading and error states
- ❌ Do not ignore accessibility in component design
- ❌ Do not create components that are too tightly coupled
- ❌ Do not forget to clean up reactive subscriptions and event listeners
- ❌ Do not ignore component testing

## Example

```vue
<!-- components/Button/Button.vue -->
<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || isLoading"
    :aria-disabled="disabled || isLoading"
    @click="handleClick"
  >
    <span v-if="leftIcon" class="btn__icon">
      <component :is="leftIcon" />
    </span>
    
    <slot />
    
    <span v-if="rightIcon" class="btn__icon">
      <component :is="rightIcon" />
    </span>
    
    <span v-if="isLoading" class="btn__spinner" aria-hidden="true">
      <svg class="btn__spinner-icon" viewBox="0 0 50 50">
        <circle class="btn__spinner-path" cx="25" cy="25" r="20" fill="none" stroke-width="4" />
      </svg>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'small' | 'medium' | 'large'

interface ButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: string
  rightIcon?: string
  disabled?: boolean
}

interface ButtonEmits {
  (e: 'click', event: MouseEvent): void
}

const props = withDefaults(defineProps<ButtonProps>(), {
  variant: 'primary',
  size: 'medium',
  isLoading: false,
  disabled: false,
})

const emit = defineEmits<ButtonEmits>()

const buttonClasses = computed(() => [
  'btn',
  `btn--${props.variant}`,
  `btn--${props.size}`,
  props.isLoading && 'btn--loading',
  props.leftIcon && 'btn--icon',
  props.rightIcon && 'btn--icon',
])

function handleClick(event: MouseEvent) {
  if (props.isLoading || props.disabled) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>

<style scoped>
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

```vue
<!-- components/Card/Card.vue -->
<template>
  <div
    :class="cardClasses"
    @click="onClick"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'small' | 'medium' | 'large'
  onClick?: () => void
}

const props = withDefaults(defineProps<CardProps>(), {
  variant: 'default',
  padding: 'medium',
})

const cardClasses = computed(() => [
  'card',
  `card--${props.variant}`,
  `card--${props.padding}`,
  props.onClick && 'card--clickable',
])
</script>

<style scoped>
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

```vue
<!-- components/Form/Input/Input.vue -->
<template>
  <div class="input-wrapper">
    <label v-if="label" :for="inputId" class="input-label">
      {{ label }}
      <span v-if="required" class="required" aria-hidden="true">*</span>
    </label>
    
    <div class="input-container">
      <span v-if="leftIcon" class="input-icon input-icon--left" aria-hidden="true">
        <component :is="leftIcon" />
      </span>
      
      <input
        :id="inputId"
        v-model="model"
        :type="type"
        :class="inputClasses"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :aria-invalid="hasError"
        :aria-describedby="ariaDescribedBy"
        @input="$emit('input', $event)"
        @change="$emit('change', $event)"
      />
      
      <span v-if="rightIcon" class="input-icon input-icon--right" aria-hidden="true">
        <component :is="rightIcon" />
      </span>
    </div>
    
    <span v-if="error" :id="`${inputId}-error`" class="input-error" role="alert">
      {{ error }}
    </span>
    
    <span v-if="helpText" :id="`${inputId}-help`" class="input-help">
      {{ helpText }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface InputProps {
  label?: string
  error?: string
  helpText?: string
  size?: 'small' | 'medium' | 'large'
  leftIcon?: string
  rightIcon?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
}

interface InputEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'input', event: Event): void
  (e: 'change', event: Event): void
}

const props = withDefaults(defineProps<InputProps>(), {
  size: 'medium',
  type: 'text',
  modelValue: '',
  disabled: false,
  required: false,
})

const emit = defineEmits<InputEmits>()

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const inputId = computed(() => Math.random().toString(36).substr(2, 9))
const hasError = computed(() => !!props.error)
const ariaDescribedBy = computed(() => [
  props.label && `${inputId.value}-label`,
  props.error && `${inputId.value}-error`,
  props.helpText && `${inputId.value}-help`,
].filter(Boolean).join(' '))

const inputClasses = computed(() => [
  'input',
  `input--${props.size}`,
  hasError.value && 'input--error',
  props.leftIcon && 'input--icon-left',
  props.rightIcon && 'input--icon-right',
])
</script>

<style scoped>
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

```vue
<!-- components/Modal/Modal.vue -->
<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="modal-overlay"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="title ? 'modal-title' : undefined"
      @click="handleOverlayClick"
    >
      <div
        ref="modalElement"
        class="modal-content"
        :class="`modal-content--${size}`"
        role="document"
        tabindex="-1"
      >
        <div v-if="title || closeOnEscape" class="modal-header">
          <h2 v-if="title" id="modal-title" class="modal-title">
            {{ title }}
          </h2>
          <button
            v-if="closeOnEscape"
            class="modal-close"
            @click="handleClose"
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
        </div>
        
        <div class="modal-body">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
interface ModalProps {
  isOpen: boolean
  title?: string
  size?: 'small' | 'medium' | 'large'
  closeOnOverlayClick?: boolean
  closeOnEscape?: boolean
}

interface ModalEmits {
  (e: 'close'): void
}

const props = withDefaults(defineProps<ModalProps>(), {
  size: 'medium',
  closeOnOverlayClick: true,
  closeOnEscape: true,
})

const emit = defineEmits<ModalEmits>()

const modalElement = ref<HTMLElement>()

const previousActiveElement = ref<HTMLElement | null>(null)

function handleClose() {
  emit('close')
}

function handleOverlayClick(event: MouseEvent) {
  if (props.closeOnOverlayClick && event.target === event.currentTarget) {
    handleClose()
  }
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.closeOnEscape) {
    handleClose()
  }
}

function focusFirstElement() {
  const focusableElement = modalElement.value?.querySelector(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as HTMLElement
  
  if (focusableElement) {
    focusableElement.focus()
  }
}

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    // Store the previously focused element
    previousActiveElement.value = document.activeElement as HTMLElement
    
    // Focus management
    nextTick(() => {
      focusFirstElement()
      document.addEventListener('keydown', handleKeyDown)
    })
  } else if (previousActiveElement.value) {
    previousActiveElement.value.focus()
    previousActiveElement.value = null
    document.removeEventListener('keydown', handleKeyDown)
  }
}, { immediate: true })

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
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

```vue
<!-- components/DataTable/DataTable.vue -->
<template>
  <div class="data-table">
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key as string"
              :class="[
                'table-header',
                column.sortable && 'table-header--sortable',
                sortBy?.key === column.key && (sortBy.desc ? 'sort-desc' : 'sort-asc')
              ]"
              :style="column.width ? `width: ${column.width}` : undefined"
              @click="handleSort(column)"
            >
              <div class="header-content">
                {{ column.header }}
                <span v-if="column.sortable" class="sort-indicator">
                  {{ sortBy?.key === column.key ? (sortBy.desc ? ' ↓' : ' ↑') : '↕' }}
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="columns.length" class="loading-row">
              Loading...
            </td>
          </tr>
          <tr v-else-if="displayedData.length === 0">
            <td :colspan="columns.length" class="empty-row">
              {{ emptyMessage }}
            </td>
          </tr>
          <tr v-else v-for="row in displayedData" :key="row.id">
            <td v-for="column in columns" :key="column.key as string" class="table-cell">
              {{ getCellValue(column, row) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="paginated && pageCount > 1" class="pagination">
      <div class="pagination-info">
        Page {{ pageIndex + 1 }} of {{ pageCount }}
      </div>
      
      <div class="pagination-controls">
        <button
          @click="goToPage(0)"
          :disabled="pageIndex === 0"
          class="pagination-button"
        >
          First
        </button>
        <button
          @click="goToPage(pageIndex - 1)"
          :disabled="pageIndex === 0"
          class="pagination-button"
        >
          Previous
        </button>
        <button
          @click="goToPage(pageIndex + 1)"
          :disabled="pageIndex === pageCount - 1"
          class="pagination-button"
        >
          Next
        </button>
        <button
          @click="goToPage(pageCount - 1)"
          :disabled="pageIndex === pageCount - 1"
          class="pagination-button"
        >
          Last
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Column<T> {
  key: keyof T
  header: string
  sortable?: boolean
  width?: number | string
  cell?: (value: any, row: T) => string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  pageSize?: number
  sortable?: boolean
  paginated?: boolean
  loading?: boolean
  emptyMessage?: string
  className?: string
}

const props = withDefaults(defineProps<DataTableProps<any>>(), {
  pageSize: 10,
  sortable: true,
  paginated: true,
  loading: false,
  emptyMessage: 'No data available',
  className: '',
})

const pageIndex = ref(0)
const sortBy = ref<{ key: string; desc: boolean } | null>(null)

const sortedData = computed(() => {
  if (!props.sortable || !sortBy.value) return props.data

  return [...props.data].sort((a, b) => {
    const aValue = a[sortBy.value!.key]
    const bValue = b[sortBy.value!.key]
    
    if (aValue < bValue) return sortBy.value!.desc ? 1 : -1
    if (aValue > bValue) return sortBy.value!.desc ? -1 : 1
    return 0
  })
})

const displayedData = computed(() => {
  return props.paginated 
    ? sortedData.value.slice(pageIndex.value * props.pageSize, (pageIndex.value + 1) * props.pageSize)
    : sortedData.value
})

const pageCount = computed(() => Math.ceil(props.data.length / props.pageSize))

function handleSort(column: Column<any>) {
  if (!props.sortable || !column.sortable) return

  if (sortBy.value?.key === column.key) {
    sortBy.value = { ...sortBy.value, desc: !sortBy.value.desc }
  } else {
    sortBy.value = { key: column.key as string, desc: false }
  }
}

function goToPage(page: number) {
  if (page >= 0 && page < pageCount.value) {
    pageIndex.value = page
  }
}

function getCellValue(column: Column<any>, row: any) {
  if (column.cell) {
    return column.cell(row[column.key], row)
  }
  return row[column.key]
}
</script>

<style scoped>
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
- Use Composition API with reactive state management
- Use Nuxt composables for shared logic across components
- Implement proper event handling with defineEmits
- Use slots for content projection and component composition
- Write comprehensive tests for all components
- Document component usage with prop types and examples
- Follow Vue 3 and Nuxt best practices for performance and maintainability