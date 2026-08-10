---
skill: documentation
version: 1.0.0
framework: shared
category: workflow
triggers:
  - "documentation"
  - "writing docs"
  - "API documentation"
  - "code comments"
  - "README"
author: "@nexus-framework/skills"
status: active
---

# Skill: Documentation (Shared)

## When to Read This
Read this skill when writing or updating documentation, code comments, or README files in this project.

## Context
Documentation is essential for code maintainability, onboarding new developers, and ensuring consistent understanding across the team. This project values clear, concise, and up-to-date documentation that serves both technical and non-technical audiences. Documentation should be treated with the same care as production code.

## Steps
1. Identify the audience and purpose of the documentation
2. Choose the appropriate format (README, inline comments, API docs, etc.)
3. Write clear, concise content focused on the reader's needs
4. Use consistent formatting and style throughout
5. Include examples and code snippets where helpful
6. Review and update documentation when code changes
7. Ensure documentation is easily discoverable

## Patterns We Use
- README files: Project overview, setup instructions, usage examples
- API documentation: JSDoc comments with parameter types and examples
- Code comments: Explain why, not what (code should be self-documenting)
- Changelogs: Track breaking changes, new features, and bug fixes
- Architecture docs: High-level system design and decision rationale
- Inline examples: Code snippets with clear context and explanation

## Anti-Patterns — Never Do This
- ❌ Do not write documentation that quickly becomes outdated
- ❌ Do not use overly technical jargon without explanation
- ❌ Do not assume readers have extensive domain knowledge
- ❌ Do not write vague statements without concrete examples
- ❌ Do not ignore documentation in code reviews
- ❌ Do not create documentation that's difficult to find or navigate

## Example

```typescript
/**
 * Validates user input for registration
 * 
 * @param email - User's email address
 * @param password - User's password (minimum 8 characters)
 * @param name - User's full name
 * @returns Promise resolving to validation result
 * 
 * @example
 * ```typescript
 * const result = await validateRegistration({
 *   email: 'user@example.com',
 *   password: 'securepassword123',
 *   name: 'John Doe'
 * });
 * 
 * if (result.isValid) {
 *   // Proceed with registration
 * } else {
 *   console.error(result.errors);
 * }
 * ```
 */
async function validateRegistration({
  email,
  password,
  name
}: {
  email: string;
  password: string;
  name: string;
}): Promise<{ isValid: boolean; errors: string[] }> {
  // Implementation
}
```

```markdown
# Project README Template

## Description
Brief description of what this project does and why it exists.

## Installation
```bash
npm install
npm run dev
```

## Usage
```typescript
import { exampleFunction } from './example';

const result = exampleFunction('input');
console.log(result);
```

## API Reference
- `exampleFunction(input: string): string` - Processes input and returns result

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License
MIT
```

## Notes
- Use Markdown for formatting documentation files
- Keep README files updated with current setup instructions
- Document breaking changes in a dedicated changelog
- Use consistent heading levels and formatting
- Include troubleshooting sections for common issues
- Add links to related documentation and resources
- Review documentation during code reviews
- Use tools like ESLint and Prettier to maintain consistency