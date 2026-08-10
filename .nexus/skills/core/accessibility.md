---
skill: accessibility
version: 1.0.0
framework: shared
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

# Skill: Accessibility (Shared)

## When to Read This
Read this skill when designing or implementing user interfaces, forms, navigation, or any interactive elements.

## Context
Accessibility ensures that all users, including those with disabilities, can use our application effectively. This project follows WCAG 2.1 AA guidelines and prioritizes semantic HTML, keyboard navigation, screen reader compatibility, and inclusive design patterns. Accessibility is not an afterthought—it's built into our development process.

## Steps
1. Use semantic HTML elements for proper document structure
2. Ensure all interactive elements are keyboard accessible
3. Provide alternative text for images and non-text content
4. Implement proper form labels and error messages
5. Use sufficient color contrast and don't rely on color alone
6. Add ARIA labels and roles where needed for complex widgets
7. Test with screen readers and keyboard-only navigation
8. Validate accessibility with automated tools and manual testing

## Patterns We Use
- Semantic HTML: Use `<button>`, `<nav>`, `<main>`, `<section>`, etc. appropriately
- Keyboard navigation: Tab order, focus indicators, keyboard shortcuts
- Screen reader support: ARIA labels, landmarks, live regions
- Color accessibility: Minimum 4.5:1 contrast ratio, color-independent cues
- Form accessibility: Labels, error messages, validation feedback
- Focus management: Proper focus trapping in modals, focus restoration
- Responsive design: Accessible on all devices and screen sizes
- Testing: axe-core, Lighthouse, manual screen reader testing

## Anti-Patterns — Never Do This
- ❌ Do not use `<div>` or `<span>` for interactive elements
- ❌ Do not remove focus outlines without providing alternatives
- ❌ Do not rely solely on color to convey information
- ❌ Do not use images of text without proper alternatives
- ❌ Do not create keyboard traps or skip navigation
- ❌ Do not ignore screen reader announcements
- ❌ Do not use flashing content that could trigger seizures
- ❌ Do not forget to test with real assistive technology users

## Example

```tsx
// ✅ Accessible button component
export function Button({ 
  children, 
  onClick, 
  variant = 'primary',
  disabled = false 
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}) {
  return (
    <button
      className={`btn btn-${variant}`}
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
}
```

```tsx
// ✅ Accessible form with proper labels and error handling
export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: typeof errors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      // Submit form
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label htmlFor="email" className="form-label">
          Email Address <span aria-label="required">*</span>
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={errors.email ? 'form-input error' : 'form-input'}
          aria-describedby={errors.email ? 'email-error' : undefined}
          required
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
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={errors.password ? 'form-input error' : 'form-input'}
          aria-describedby={errors.password ? 'password-error' : undefined}
          required
        />
        {errors.password && (
          <div id="password-error" className="form-error" role="alert">
            {errors.password}
          </div>
        )}
      </div>

      <button type="submit" className="btn btn-primary">
        Sign In
      </button>
    </form>
  );
}
```

```tsx
// ✅ Accessible modal with focus management
export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children 
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (isOpen) {
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        } else if (e.key === 'Tab') {
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
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-content">
        <header className="modal-header">
          <h2 id="modal-title">{title}</h2>
          <button
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </header>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
```

```css
/* ✅ Accessible focus indicators */
.btn:focus,
input:focus,
select:focus,
textarea:focus {
  outline: 2px solid #005fcc;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(0, 95, 204, 0.3);
}

/* ✅ High contrast text */
.text-primary {
  color: #005fcc;
  /* Ensure contrast ratio meets WCAG AA standards */
}

/* ✅ Skip link for keyboard users */
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
}

.skip-link:focus {
  top: 6px;
}
```

## Notes
- Use semantic HTML5 elements for better screen reader support
- Implement skip links for keyboard navigation
- Test color contrast with tools like WebAIM Contrast Checker
- Use `aria-live` regions for dynamic content updates
- Provide text alternatives for all non-text content
- Ensure all functionality is available via keyboard
- Use proper heading hierarchy (h1, h2, h3, etc.)
- Consider users with motor disabilities when designing interactions
- Regularly test with real assistive technology users
- Follow WCAG 2.1 guidelines for comprehensive accessibility