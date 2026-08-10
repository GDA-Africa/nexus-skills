---
skill: debugging
version: 1.0.0
framework: shared
category: workflow
triggers:
  - "debugging"
  - "debug issue"
  - "troubleshooting"
  - "bug fix"
  - "error investigation"
author: "@nexus-framework/skills"
status: active
---

# Skill: Debugging (Shared)

## When to Read This
Read this skill when investigating bugs, errors, or unexpected behavior in the codebase.

## Context
Effective debugging requires a systematic approach to isolate, reproduce, and fix issues. This project emphasizes understanding the root cause rather than applying quick fixes. Use debugging tools, logging, and systematic investigation to identify issues. Document findings to prevent similar problems in the future.

## Steps
1. Reproduce the issue consistently in a development environment
2. Gather relevant logs, error messages, and stack traces
3. Isolate the problem by narrowing down potential causes
4. Use debugging tools (breakpoints, logging, profiling) to investigate
5. Identify the root cause, not just the symptoms
6. Implement a fix that addresses the underlying issue
7. Test the fix thoroughly and verify it doesn't introduce regressions
8. Document the issue and solution for future reference

## Patterns We Use
- Start with the simplest explanation and work toward complexity
- Use version control to identify when the issue was introduced
- Create minimal reproduction cases to isolate problems
- Use console logging strategically, not excessively
- Leverage browser dev tools and IDE debugging features
- Check recent changes and dependencies for potential causes
- Use feature flags to isolate problematic code sections

## Anti-Patterns — Never Do This
- ❌ Do not make random changes hoping to fix the issue
- ❌ Do not ignore error messages or assume they're unrelated
- ❌ Do not fix symptoms without understanding the root cause
- ❌ Do not skip writing tests for the bug fix
- ❌ Do not commit debugging code (console.log, debugger statements)
- ❌ Do not assume the issue is in external dependencies without investigation

## Example

```typescript
// Before: Poor debugging approach
function calculateTotal(items) {
  let total = 0;
  for (let i = 0; i < items.length; i++) {
    total += items[i].price; // Potential error: undefined price
  }
  return total;
}

// After: Proper debugging and fix
function calculateTotal(items: Array<{ price: number }>) {
  if (!Array.isArray(items)) {
    throw new Error('Items must be an array');
  }
  
  let total = 0;
  for (const item of items) {
    if (typeof item.price !== 'number' || isNaN(item.price)) {
      console.warn('Invalid price found:', item);
      continue; // Skip invalid items instead of crashing
    }
    total += item.price;
  }
  return total;
}
```

```typescript
// Debugging with proper logging
function processUserInput(input: string) {
  try {
    console.log('Processing input:', input);
    
    if (!input || input.trim() === '') {
      throw new Error('Empty input provided');
    }
    
    const result = JSON.parse(input);
    console.log('Parsed result:', result);
    
    return result;
  } catch (error) {
    console.error('Error processing input:', {
      input,
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}
```

## Notes
- Use `debugger` statements sparingly and remove them before committing
- Create unit tests that reproduce the bug before fixing it
- Use git bisect to find when a regression was introduced
- Check browser console and network tabs for frontend issues
- Use performance profiling tools for performance-related bugs
- Document debugging steps in comments for complex issues
- Consider using error tracking services for production issues
- Always test edge cases after implementing a fix