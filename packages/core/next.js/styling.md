---
skill: styling
version: 1.0.0
framework: next.js
category: ui
triggers:
  - "styling component"
  - "adding styles"
  - "CSS"
  - "Tailwind"
  - "component styling"
author: "@nexus-framework/skills"
status: active
---

# Skill: Styling (Next.js)

## When to Read This
Read this skill before adding any styles to components or creating new styling files in this project.

## Context
This project uses Tailwind CSS as the primary styling solution with a design system built on top. All components should use utility classes from the configured design tokens. Avoid inline styles and CSS-in-JS libraries. Use CSS modules only for complex animations or when Tailwind utilities are insufficient. Maintain consistency with the established color palette, spacing scale, and typography hierarchy.

## Steps
1. Check if the style can be achieved with existing Tailwind utilities.
2. Use semantic class names that describe the purpose, not the appearance.
3. Apply responsive classes using Tailwind's breakpoint system.
4. Use dark mode variants where appropriate (`dark:` prefix).
5. Create reusable component styles when patterns emerge.
6. Add custom utilities to `tailwind.config.js` only when necessary.
7. Test styles across breakpoints and color schemes.

## Patterns We Use
- Tailwind CSS: Primary styling solution with custom design tokens
- Design tokens: Colors, spacing, typography defined in `tailwind.config.js`
- Responsive design: Mobile-first with `sm:`, `md:`, `lg:`, `xl:` breakpoints
- Dark mode: Support both light and dark themes using `dark:` variants
- Reusable components: Extract common patterns into shared components
- CSS modules: Only for complex animations or when Tailwind is insufficient
- Semantic naming: Use purpose-based class names, not appearance-based

## Anti-Patterns — Never Do This
- ❌ Do not use inline styles — always use Tailwind classes
- ❌ Do not use CSS-in-JS libraries like styled-components
- ❌ Do not hardcode colors or spacing values
- ❌ Do not create overly specific CSS selectors
- ❌ Do not ignore responsive design principles
- ❌ Do not use `!important` unless absolutely necessary for overrides

## Example

```tsx
// ✅ Correct: Using Tailwind utilities with semantic structure
export function Button({ children, variant = 'primary' }: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors duration-200';
  
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]}`}>
      {children}
    </button>
  );
}
```

```tsx
// ✅ Correct: Responsive and accessible styling
export function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card text-card-foreground rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
```

```css
/* ✅ Correct: CSS module for complex animation */
/* components/LoadingSpinner.module.css */
.spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

## Notes
- Use `@apply` directive in CSS to extract repeated utility patterns
- Leverage Tailwind's `group` and `peer` classes for interactive states
- Use `sr-only` class for screen reader only content
- Implement focus styles for keyboard navigation accessibility
- Use `aspect-ratio` utilities for responsive media elements
- Consider using `@layer` directives to organize custom styles
- Always test color contrast ratios for accessibility compliance
- Use `prefers-reduced-motion` media query for motion-sensitive users