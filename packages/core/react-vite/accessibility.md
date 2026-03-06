---
skill: accessibility
version: 1.0.0
framework: react-vite
category: ui
triggers:
  - "accessibility"
  - "a11y"
  - "WCAG"
  - "screen reader"
  - "keyboard navigation"
author: "@nexus-framework/skills"
status: active
---

# Skill: Accessibility (React + Vite)

## When to Read This
Read this skill when designing or implementing user interfaces, forms, navigation, or any interactive elements in React components.

## Context
This project follows WCAG 2.1 AA guidelines and prioritizes accessibility for all users, including those with disabilities. We use semantic HTML, proper ARIA attributes, keyboard navigation, and screen reader compatibility. Accessibility is built into our development process with automated testing and manual verification.

## Steps
1. Use semantic HTML elements and proper heading hierarchy
2. Ensure all interactive elements are keyboard accessible
3. Add appropriate ARIA labels and roles for complex widgets
4. Implement proper form labels and error messages
5. Use sufficient color contrast and don't rely on color alone
6. Add focus management for modals and dynamic content
7. Test with screen readers and keyboard-only navigation
8. Validate accessibility with automated tools and manual testing

## Patterns We Use
- Semantic HTML: Use proper HTML elements (button, nav, main, section, etc.)
- Keyboard navigation: Tab order, focus indicators, keyboard shortcuts
- ARIA attributes: Labels, roles, live regions, and state management
- Screen reader support: Hidden text, aria-live regions, skip links
- Color accessibility: Minimum 4.5:1 contrast ratio, color-independent cues
- Focus management: Proper focus trapping in modals, focus restoration
- Form accessibility: Labels, error messages, validation feedback
- Testing: axe-core, eslint-plugin-jsx-a11y, manual screen reader testing

## Anti-Patterns — Never Do This
- ❌ Do not use div or span for interactive elements
- ❌ Do not remove focus outlines without providing alternatives
- ❌ Do not rely solely on color to convey information
- ❌ Do not use images of text without proper alternatives
- ❌ Do not create keyboard traps or skip navigation
- ❌ Do not ignore screen reader announcements
- ❌ Do not use flashing content that could trigger seizures
- ❌ Do not forget to test with real assistive technology users

## Example

```tsx
// src/components/Button/Button.tsx
import { forwardRef } from 'react';
import styles from './Button.module.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      className = '',
      disabled,
      'aria-label': ariaLabel,
      ...props
    },
    ref
  ) => {
    const buttonClasses = [
      styles.button,
      styles[`button--${variant}`],
      styles[`button--${size}`],
      isLoading && styles['button--loading'],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Generate accessible name if no aria-label provided
    const accessibleName = ariaLabel || (typeof children === 'string' ? children : undefined);

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || isLoading}
        aria-label={accessibleName}
        aria-disabled={disabled || isLoading}
        {...props}
      >
        {leftIcon && (
          <span className={styles.icon} aria-hidden="true">
            {leftIcon}
          </span>
        )}
        {children}
        {rightIcon && (
          <span className={styles.icon} aria-hidden="true">
            {rightIcon}
          </span>
        )}
        {isLoading && (
          <span className={styles.spinner} aria-hidden="true">
            <svg className={styles.spinnerIcon} viewBox="0 0 50 50">
              <circle className={styles.spinnerPath} cx="25" cy="25" r="20" fill="none" strokeWidth="4" />
            </svg>
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

```tsx
// src/components/Form/Form.tsx
import { useState } from 'react';
import { useForm } from './useForm';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  newsletter: boolean;
}

export function LoginForm() {
  const {
    values,
    errors,
    isValid,
    handleChange,
    handleSubmit,
    isSubmitting,
  } = useForm<FormData>({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      newsletter: false,
    },
    validate: (values) => {
      const errors: Partial<FormData> = {};
      
      if (!values.email) {
        errors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(values.email)) {
        errors.email = 'Please enter a valid email address';
      }
      
      if (!values.password) {
        errors.password = 'Password is required';
      } else if (values.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }
      
      if (values.password !== values.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
      
      return errors;
    },
  });

  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const onSubmit = async (data: FormData) => {
    try {
      // Submit form
      setSubmitMessage('Form submitted successfully!');
    } catch (error) {
      setSubmitMessage('An error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Live region for form messages */}
      {submitMessage && (
        <div 
          role="alert" 
          aria-live="polite"
          className="form-message"
        >
          {submitMessage}
        </div>
      )}

      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email Address <span aria-label="required">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={values.email}
          onChange={handleChange}
          className={`form-input ${errors.email ? 'error' : ''}`}
          aria-describedby={errors.email ? 'email-error' : undefined}
          required
          autoComplete="email"
        />
        {errors.email && (
          <div id="email-error" className="form-error" role="alert">
            {errors.email}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="password" className="form-label">
          Password <span aria-label="required">*</span>
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={values.password}
          onChange={handleChange}
          className={`form-input ${errors.password ? 'error' : ''}`}
          aria-describedby={errors.password ? 'password-error' : undefined}
          required
          autoComplete="current-password"
        />
        {errors.password && (
          <div id="password-error" className="form-error" role="alert">
            {errors.password}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword" className="form-label">
          Confirm Password <span aria-label="required">*</span>
        </label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={values.confirmPassword}
          onChange={handleChange}
          className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
          aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
          required
          autoComplete="current-password"
        />
        {errors.confirmPassword && (
          <div id="confirm-password-error" className="form-error" role="alert">
            {errors.confirmPassword}
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            name="newsletter"
            checked={values.newsletter}
            onChange={handleChange}
            className="checkbox-input"
          />
          <span className="checkbox-text">Subscribe to newsletter</span>
        </label>
      </div>

      <button 
        type="submit" 
        className="btn btn--primary"
        disabled={!isValid || isSubmitting}
        aria-describedby="submit-help"
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
      
      <div id="submit-help" className="form-help">
        Fields marked with * are required
      </div>
    </form>
  );
}
```

```tsx
// src/components/Modal/Modal.tsx
import { useEffect, useRef, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        ref={modalRef}
        className="modal-content"
        role="document"
      >
        <header className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            ×
          </button>
        </header>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
```

```tsx
// src/components/SkipLink/SkipLink.tsx
import { useEffect } from 'react';

export function SkipLink() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show skip link when Tab is pressed
      if (e.key === 'Tab' && !e.shiftKey) {
        const skipLink = document.getElementById('skip-to-content');
        if (skipLink) {
          skipLink.style.opacity = '1';
          skipLink.style.transform = 'translateY(0)';
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <a
      id="skip-to-content"
      href="#main-content"
      className="skip-link"
    >
      Skip to main content
    </a>
  );
}
```

```tsx
// src/hooks/useFocusTrap.ts
import { useEffect, useRef } from 'react';

export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            (lastElement as HTMLElement).focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            (firstElement as HTMLElement).focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  return containerRef;
}
```

```css
/* src/styles/accessibility.css */
/* Skip link styles */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  border-radius: 4px;
  z-index: 100;
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(10px);
}

.skip-link:focus {
  top: 6px;
  opacity: 1;
  transform: translateY(0);
}

/* Focus indicators */
.btn:focus,
input:focus,
select:focus,
textarea:focus,
a:focus {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(0, 95, 204, 0.3);
}

/* High contrast text */
.text-primary {
  color: #005fcc;
  /* Ensure contrast ratio meets WCAG AA standards */
}

/* Form accessibility */
.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-input:focus {
  border-color: #005fcc;
  box-shadow: 0 0 0 3px rgba(0, 95, 204, 0.2);
}

.form-input.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.form-error {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-help {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

/* Modal accessibility */
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
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.modal-close:hover {
  background: var(--gray-100);
}

/* Checkbox accessibility */
.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 0.5rem;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-text {
  font-size: 1rem;
  color: var(--text-primary);
}

/* Screen reader only utility */
.sr-only {
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
```

## Notes
- Use semantic HTML5 elements for better screen reader support
- Implement skip links for keyboard users
- Test color contrast with tools like WebAIM Contrast Checker
- Use aria-live regions for dynamic content updates
- Provide text alternatives for all non-text content
- Ensure all functionality is available via keyboard
- Use proper heading hierarchy (h1, h2, h3, etc.)
- Consider users with motor disabilities when designing interactions
- Regularly test with real assistive technology users
- Follow WCAG 2.1 guidelines for comprehensive accessibility