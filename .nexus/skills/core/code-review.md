---
skill: code-review
version: 1.0.0
framework: shared
category: workflow
triggers:
  - "code review"
  - "reviewing code"
  - "pull request review"
  - "review feedback"
  - "review comments"
author: "@nexus-framework/skills"
status: active
---

# Skill: Code Review (Shared)

## When to Read This
Read this skill before reviewing pull requests or when your code is being reviewed.

## Context
Code review is a critical quality gate that ensures code correctness, maintainability, and knowledge sharing. Reviews should be constructive, thorough, and focused on the code rather than the person. The goal is to improve code quality while maintaining a positive team culture. All team members are expected to participate in code reviews.

## Steps
1. Understand the context and purpose of the changes
2. Review the code for correctness, readability, and maintainability
3. Check for security vulnerabilities and performance issues
4. Verify tests are comprehensive and passing
5. Provide constructive feedback with specific suggestions
6. Approve when satisfied or request changes if issues remain

## Patterns We Use
- Focus on logic, architecture, and potential edge cases
- Look for consistent coding style and naming conventions
- Verify error handling and input validation
- Check for appropriate use of abstractions and patterns
- Ensure new code follows existing project conventions
- Confirm tests cover the changes adequately

## Anti-Patterns — Never Do This
- ❌ Do not focus on minor style issues in the main review
- ❌ Do not make personal comments or use negative language
- ❌ Do not approve code with known security vulnerabilities
- ❌ Do not ignore test coverage requirements
- ❌ Do not leave vague comments like "fix this"
- ❌ Do not block reviews over trivial preferences

## Example

```markdown
## Good Review Comments

✅ "Consider extracting this logic into a separate function for better testability"
✅ "This function is getting long - would benefit from breaking into smaller functions"
✅ "Missing null check here could cause runtime errors"
✅ "Great use of TypeScript types here - makes the code more maintainable"

## Poor Review Comments

❌ "This is wrong" (too vague)
❌ "I don't like this approach" (no alternative suggested)
❌ "Fix the formatting" (use automated tools instead)
❌ "This looks good to me" (without actual review)
```

```typescript
// Before review
function processUser(user) {
  if (user) {
    return user.name.toUpperCase();
  }
}

// After review feedback
interface User {
  id: string;
  name: string;
}

function processUser(user: User | null): string {
  if (!user) {
    throw new Error('User is required');
  }
  return user.name.toUpperCase();
}
```

## Notes
- Use emojis to provide quick feedback (👍 approve, 🤔 request changes, 🚀 ready to merge)
- Focus on high-impact issues first (security, performance, correctness)
- Suggest improvements with reasoning, not just criticism
- Acknowledge good code practices when you see them
- Use inline comments for specific code issues
- Use general comments for architectural concerns
- Always assume positive intent from the author
- Be specific about what needs to change and why