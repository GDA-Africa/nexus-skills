---
skill: styling
version: 1.0.0
framework: react-vite
category: ui
triggers:
  - "styling"
  - "CSS"
  - "SCSS"
  - "styled-components"
  - "CSS-in-JS"
author: "@nexus-framework/skills"
status: active
---

# Skill: Styling (React + Vite)

## When to Read This
Read this skill when implementing styles, creating components, or working with CSS in a React + Vite application.

## Context
This project uses a combination of CSS Modules, SCSS, and styled-components for styling. We follow a component-based approach with consistent naming conventions, responsive design principles, and accessibility considerations. The styling system supports theming, dark mode, and maintains consistency across the application while allowing for flexibility and maintainability.

## Steps
1. Choose appropriate styling approach for each component
2. Create component styles with CSS Modules or styled-components
3. Implement responsive design with mobile-first approach
4. Add proper CSS-in-JS for dynamic styles when needed
5. Implement theme system for consistent styling
6. Ensure accessibility with proper contrast and focus states
7. Optimize styles for performance and maintainability
8. Test styles across different devices and screen sizes

## Patterns We Use
- CSS Modules: Use for component-scoped styles with BEM-like naming
- SCSS: Use for shared styles, mixins, and variables
- styled-components: Use for dynamic styles and complex component styling
- CSS-in-JS: Use for runtime style calculations and conditional styling
- Theme system: Use CSS custom properties for theming and dark mode
- Responsive design: Use mobile-first approach with flexbox and grid
- Accessibility: Ensure proper contrast ratios and focus indicators
- Performance: Minimize CSS bundle size and avoid style duplication

## Anti-Patterns — Never Do This
- ❌ Do not use inline styles for complex styling
- ❌ Do not create overly specific CSS selectors
- ❌ Do not ignore responsive design principles
- ❌ Do not hardcode colors and spacing values
- ❌ Do not forget to test styles on different devices
- ❌ Do not ignore accessibility in styling decisions
- ❌ Do not create circular dependencies in styles
- ❌ Do not ignore performance implications of styling choices

## Example

```scss
// src/styles/variables.scss
:root {
  /* Colors */
  --color-primary: #007bff;
  --color-primary-hover: #0056b3;
  --color-secondary: #6c757d;
  --color-success: #28a745;
  --color-danger: #dc3545;
  --color-warning: #ffc107;
  --color-info: #17a2b8;

  /* Grays */
  --color-gray-50: #f8f9fa;
  --color-gray-100: #e9ecef;
  --color-gray-200: #dee2e6;
  --color-gray-300: #ced4da;
  --color-gray-400: #adb5bd;
  --color-gray-500: #6c757d;
  --color-gray-600: #495057;
  --color-gray-700: #343a40;
  --color-gray-800: #212529;
  --color-gray-900: #000000;

  /* Typography */
  --font-family-base: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  --font-family-monospace: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', monospace;
  
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  --font-size-4xl: 2.25rem;

  --font-weight-light: 300;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;

  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  --spacing-3xl: 4rem;

  /* Borders */
  --border-width: 1px;
  --border-radius-sm: 0.25rem;
  --border-radius-md: 0.375rem;
  --border-radius-lg: 0.5rem;
  --border-radius-xl: 0.75rem;
  --border-radius-2xl: 1rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);

  /* Z-index */
  --z-dropdown: 1000;
  --z-modal: 1050;
  --z-popover: 1060;
  --z-tooltip: 1070;

  /* Transitions */
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 300ms ease-in-out;
  --transition-slow: 500ms ease-in-out;
}

/* Dark theme overrides */
@media (prefers-color-scheme: dark) {
  :root {
    --color-gray-50: #121212;
    --color-gray-100: #1e1e1e;
    --color-gray-200: #2d2d2d;
    --color-gray-300: #3a3a3a;
    --color-gray-400: #4a4a4a;
    --color-gray-500: #8e8e93;
    --color-gray-600: #a1a1aa;
    --color-gray-700: #c7c7cc;
    --color-gray-800: #e5e5e7;
    --color-gray-900: #ffffff;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  :root {
    --shadow-sm: none;
    --shadow-md: none;
    --shadow-lg: none;
    --shadow-xl: none;
  }
}
```

```scss
// src/styles/mixins.scss
@mixin flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

@mixin screen-reader-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@mixin visually-hidden-focusable {
  position: absolute !important;
  height: 1px;
  width: 1px;
  overflow: hidden;
  clip: rect(1px, 1px, 1px, 1px);
  
  &:focus {
    position: static !important;
    height: auto !important;
    width: auto !important;
    overflow: visible !important;
    clip: auto !important;
  }
}

@mixin button-variant($bg, $border, $color) {
  background-color: $bg;
  border-color: $border;
  color: $color;
  
  &:hover {
    background-color: darken($bg, 5%);
    border-color: darken($border, 5%);
  }
  
  &:focus {
    box-shadow: 0 0 0 3px rgba($bg, 0.25);
    outline: none;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

@mixin responsive($breakpoint) {
  @if $breakpoint == sm {
    @media (min-width: 640px) { @content; }
  }
  @if $breakpoint == md {
    @media (min-width: 768px) { @content; }
  }
  @if $breakpoint == lg {
    @media (min-width: 1024px) { @content; }
  }
  @if $breakpoint == xl {
    @media (min-width: 1280px) { @content; }
  }
}

@mixin container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-md);
  
  @include responsive(md) {
    padding: 0 var(--spacing-lg);
  }
  
  @include responsive(lg) {
    padding: 0 var(--spacing-xl);
  }
}
```

```scss
// src/styles/base.scss
@import './variables';
@import './mixins';

/* CSS Reset and Base Styles */
* {
  box-sizing: border-box;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-family-base);
  font-size: var(--font-size-base);
  line-height: 1.5;
  color: var(--color-gray-900);
  background-color: var(--color-gray-50);
  margin: 0;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  margin: 0 0 var(--spacing-md) 0;
  font-weight: var(--font-weight-semibold);
  line-height: 1.2;
}

h1 { font-size: var(--font-size-4xl); }
h2 { font-size: var(--font-size-3xl); }
h3 { font-size: var(--font-size-2xl); }
h4 { font-size: var(--font-size-xl); }
h5 { font-size: var(--font-size-lg); }
h6 { font-size: var(--font-size-base); }

p {
  margin: 0 0 var(--spacing-md) 0;
}

a {
  color: var(--color-primary);
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
  
  &:focus {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}

/* Lists */
ul, ol {
  padding-left: var(--spacing-lg);
  margin: 0 0 var(--spacing-md) 0;
}

li {
  margin-bottom: var(--spacing-xs);
}

/* Images */
img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* Focus management */
*:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

/* Skip link */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: var(--color-gray-900);
  color: white;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 100;
  transition: top 0.3s ease-in-out;
}

.skip-link:focus {
  top: 6px;
}
```

```scss
// src/styles/components/Button.module.scss
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  border-radius: var(--border-radius-md);
  border: var(--border-width) solid transparent;
  cursor: pointer;
  transition: all var(--transition-normal);
  text-decoration: none;
  user-select: none;
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  // Variants
  &--primary {
    background-color: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
    
    &:hover:not(:disabled) {
      background-color: var(--color-primary-hover);
      border-color: var(--color-primary-hover);
    }
  }
  
  &--secondary {
    background-color: transparent;
    color: var(--color-primary);
    border-color: var(--color-primary);
    
    &:hover:not(:disabled) {
      background-color: var(--color-primary);
      color: white;
    }
  }
  
  &--ghost {
    background-color: transparent;
    color: var(--color-gray-700);
    border-color: transparent;
    
    &:hover:not(:disabled) {
      background-color: var(--color-gray-100);
      color: var(--color-gray-900);
    }
  }
  
  &--danger {
    background-color: var(--color-danger);
    color: white;
    border-color: var(--color-danger);
    
    &:hover:not(:disabled) {
      background-color: darken(var(--color-danger), 10%);
      border-color: darken(var(--color-danger), 10%);
    }
  }
  
  // Sizes
  &--small {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-size-sm);
  }
  
  &--large {
    padding: var(--spacing-md) var(--spacing-lg);
    font-size: var(--font-size-lg);
  }
  
  // States
  &--loading {
    position: relative;
    pointer-events: none;
    
    &::after {
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
  }
  
  // Icon button
  &--icon {
    padding: var(--spacing-sm);
    
    .button__icon {
      margin-right: var(--spacing-xs);
    }
    
    &.button--icon-only {
      padding: var(--spacing-sm);
      
      .button__icon {
        margin-right: 0;
      }
    }
  }
}

@keyframes button-spin {
  to { transform: rotate(360deg); }
}
```

```tsx
// src/components/Button/Button.tsx
import React from 'react';
import styles from './Button.module.scss';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
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

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || isLoading}
        {...props}
      >
        {leftIcon && <span className={styles.button__icon}>{leftIcon}</span>}
        {children}
        {rightIcon && <span className={styles.button__icon}>{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

```tsx
// src/components/Card/Card.tsx
import React from 'react';
import styled from 'styled-components';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'small' | 'medium' | 'large';
  className?: string;
}

const StyledCard = styled.div<CardProps>`
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: ${props => {
    switch (props.variant) {
      case 'elevated': return 'var(--shadow-lg)';
      case 'outlined': return 'none';
      default: return 'var(--shadow-md)';
    }
  }};
  border: ${props => props.variant === 'outlined' ? '1px solid var(--color-gray-200)' : 'none'};
  padding: ${props => {
    switch (props.padding) {
      case 'small': return 'var(--spacing-sm)';
      case 'large': return 'var(--spacing-xl)';
      default: return 'var(--spacing-md)';
    }
  }};
  
  transition: box-shadow var(--transition-normal), transform var(--transition-normal);
  
  &:hover {
    ${props => props.variant === 'elevated' && `
      transform: translateY(-2px);
      box-shadow: var(--shadow-xl);
    `}
  }
  
  @media (prefers-color-scheme: dark) {
    background-color: var(--color-gray-800);
    border-color: var(--color-gray-700);
  }
`;

export const Card: React.FC<CardProps> = ({ children, variant = 'default', padding = 'medium', className, ...props }) => {
  return (
    <StyledCard
      variant={variant}
      padding={padding}
      className={className}
      {...props}
    >
      {children}
    </StyledCard>
  );
};
```

```scss
// src/styles/components/Form.module.scss
.form {
  &-group {
    margin-bottom: var(--spacing-lg);
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  &-label {
    display: block;
    margin-bottom: var(--spacing-xs);
    font-weight: var(--font-weight-medium);
    color: var(--color-gray-700);
  }
  
  &-input {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    border: var(--border-width) solid var(--color-gray-300);
    border-radius: var(--border-radius-md);
    font-size: var(--font-size-base);
    transition: border-color var(--transition-normal), box-shadow var(--transition-normal);
    background-color: white;
    
    &:focus {
      outline: none;
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px rgba(var(--color-primary), 0.25);
    }
    
    &:hover {
      border-color: var(--color-gray-400);
    }
    
    &:disabled {
      background-color: var(--color-gray-100);
      color: var(--color-gray-500);
      cursor: not-allowed;
    }
    
    &::placeholder {
      color: var(--color-gray-400);
    }
    
    // Input variants
    &--error {
      border-color: var(--color-danger);
      
      &:focus {
        box-shadow: 0 0 0 3px rgba(var(--color-danger), 0.25);
      }
    }
    
    &--success {
      border-color: var(--color-success);
      
      &:focus {
        box-shadow: 0 0 0 3px rgba(var(--color-success), 0.25);
      }
    }
  }
  
  &-textarea {
    resize: vertical;
    min-height: 100px;
  }
  
  &-select {
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    padding-right: 2.5rem;
    appearance: none;
  }
  
  &-error {
    color: var(--color-danger);
    font-size: var(--font-size-sm);
    margin-top: var(--spacing-xs);
  }
  
  &-help {
    color: var(--color-gray-600);
    font-size: var(--font-size-sm);
    margin-top: var(--spacing-xs);
  }
  
  &-checkbox,
  &-radio {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    cursor: pointer;
    
    input {
      width: 18px;
      height: 18px;
      accent-color: var(--color-primary);
      cursor: pointer;
    }
  }
  
  &-submit {
    display: flex;
    gap: var(--spacing-md);
    justify-content: flex-end;
  }
}
```

```tsx
// src/components/ThemeToggle/ThemeToggle.tsx
import React from 'react';
import styled from 'styled-components';
import { useThemeStore } from '../../stores';

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-lg);
  background-color: var(--color-gray-100);
  border: 1px solid var(--color-gray-200);
  
  @media (prefers-color-scheme: dark) {
    background-color: var(--color-gray-800);
    border-color: var(--color-gray-700);
  }
`;

const ToggleButton = styled.button<{ isActive: boolean }>`
  padding: var(--spacing-xs) var(--spacing-sm);
  border: none;
  border-radius: var(--border-radius-md);
  background-color: ${props => props.isActive ? 'var(--color-primary)' : 'transparent'};
  color: ${props => props.isActive ? 'white' : 'var(--color-gray-700)'};
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-normal);
  
  &:hover {
    background-color: ${props => props.isActive ? 'var(--color-primary-hover)' : 'var(--color-gray-200)'};
  }
  
  @media (prefers-color-scheme: dark) {
    color: ${props => props.isActive ? 'white' : 'var(--color-gray-300)'};
    &:hover {
      background-color: ${props => props.isActive ? 'var(--color-primary-hover)' : 'var(--color-gray-700)'};
    }
  }
`;

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <ToggleContainer>
      <ToggleButton
        isActive={theme === 'light'}
        onClick={() => setTheme('light')}
      >
        Light
      </ToggleButton>
      <ToggleButton
        isActive={theme === 'system'}
        onClick={() => setTheme('system')}
      >
        System
      </ToggleButton>
      <ToggleButton
        isActive={theme === 'dark'}
        onClick={() => setTheme('dark')}
      >
        Dark
      </ToggleButton>
    </ToggleContainer>
  );
};
```

```scss
// src/styles/layout.scss
@import './variables';
@import './mixins';

.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: white;
  border-bottom: 1px solid var(--color-gray-200);
  position: sticky;
  top: 0;
  z-index: 50;
  
  @media (prefers-color-scheme: dark) {
    background-color: var(--color-gray-900);
    border-bottom-color: var(--color-gray-700);
  }
}

.header-content {
  @include container;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.logo {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  text-decoration: none;
  
  &:hover {
    color: var(--color-primary-hover);
  }
}

.desktop-nav {
  display: none;
  
  @include responsive(lg) {
    display: flex;
    gap: var(--spacing-lg);
  }
}

.nav-link {
  color: var(--color-gray-700);
  text-decoration: none;
  padding: var(--spacing-sm);
  border-radius: var(--border-radius-md);
  transition: all var(--transition-normal);
  
  &:hover {
    color: var(--color-primary);
    background-color: var(--color-gray-100);
  }
  
  &.active {
    color: var(--color-primary);
    font-weight: var(--font-weight-semibold);
  }
  
  @media (prefers-color-scheme: dark) {
    color: var(--color-gray-300);
    
    &:hover {
      color: var(--color-primary);
      background-color: var(--color-gray-800);
    }
  }
}

.mobile-menu-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: none;
  border-radius: var(--border-radius-md);
  cursor: pointer;
  font-size: 1.5rem;
  
  &:hover {
    background-color: var(--color-gray-100);
  }
  
  @media (prefers-color-scheme: dark) {
    &:hover {
      background-color: var(--color-gray-800);
    }
  }
  
  @include responsive(lg) {
    display: none;
  }
}

.mobile-nav {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border-bottom: 1px solid var(--color-gray-200);
  padding: var(--spacing-md);
  flex-direction: column;
  gap: var(--spacing-sm);
  
  @include responsive(lg) {
    display: none;
  }
  
  @media (prefers-color-scheme: dark) {
    background-color: var(--color-gray-900);
    border-bottom-color: var(--color-gray-700);
  }
}

.mobile-nav-link {
  display: block;
  padding: var(--spacing-sm);
  color: var(--color-gray-700);
  text-decoration: none;
  border-radius: var(--border-radius-md);
  
  &:hover {
    background-color: var(--color-gray-100);
  }
  
  &.active {
    color: var(--color-primary);
    font-weight: var(--font-weight-semibold);
  }
  
  @media (prefers-color-scheme: dark) {
    color: var(--color-gray-300);
    
    &:hover {
      background-color: var(--color-gray-800);
    }
  }
}

.main-content {
  flex: 1;
  @include container;
  padding-top: var(--spacing-xl);
  padding-bottom: var(--spacing-xl);
}

.footer {
  background-color: white;
  border-top: 1px solid var(--color-gray-200);
  margin-top: auto;
  
  @media (prefers-color-scheme: dark) {
    background-color: var(--color-gray-900);
    border-top-color: var(--color-gray-700);
  }
}

.footer-content {
  @include container;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) 0;
  
  @include responsive(md) {
    flex-direction: row;
  }
  
  @include responsive(sm) {
    flex-direction: column;
    gap: var(--spacing-md);
  }
}

.footer-links {
  display: flex;
  gap: var(--spacing-lg);
  
  a {
    color: var(--color-gray-600);
    text-decoration: none;
    
    &:hover {
      color: var(--color-primary);
    }
    
    @media (prefers-color-scheme: dark) {
      color: var(--color-gray-400);
      
      &:hover {
        color: var(--color-primary);
      }
    }
  }
}
```

## Notes
- Use CSS Modules for component-scoped styles to avoid conflicts
- Implement responsive design with mobile-first approach
- Use CSS custom properties for theming and dark mode support
- Ensure proper accessibility with focus states and contrast ratios
- Optimize performance by minimizing CSS bundle size
- Use semantic HTML elements for better accessibility
- Implement proper loading states for dynamic content
- Test styles across different browsers and devices
- Use consistent naming conventions for CSS classes
- Document custom properties and mixins for team consistency