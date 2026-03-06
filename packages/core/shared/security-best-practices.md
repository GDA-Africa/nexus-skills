---
skill: security-best-practices
version: 1.0.0
framework: shared
category: workflow
triggers:
  - "security best practices"
  - "security guidelines"
  - "input validation"
  - "authentication"
  - "security vulnerabilities"
author: "@nexus-framework/skills"
status: active
---

# Skill: Security Best Practices (Shared)

## When to Read This
Read this skill before implementing authentication, handling user input, working with APIs, or deploying applications.

## Context
Security is a fundamental requirement for all applications. This project follows security-first principles to protect user data, prevent common vulnerabilities, and maintain system integrity. Security measures should be implemented at every layer: input validation, authentication, authorization, data handling, and deployment.

## Steps
1. Validate and sanitize all user inputs at the application boundary
2. Implement proper authentication and session management
3. Use HTTPS and secure headers in all communications
4. Follow the principle of least privilege for access controls
5. Regularly update dependencies and scan for vulnerabilities
6. Implement proper error handling without exposing sensitive information
7. Use environment variables for secrets and configuration
8. Log security events for monitoring and auditing

## Patterns We Use
- Input validation: Use schema validation libraries (Zod, Joi, Yup) for all inputs
- Authentication: JWT tokens with proper expiration and refresh mechanisms
- Authorization: Role-based access control (RBAC) with middleware
- Passwords: bcrypt or Argon2 for hashing, never store plaintext
- CORS: Configure properly to prevent unauthorized cross-origin requests
- Rate limiting: Implement to prevent abuse and DoS attacks
- Security headers: Use helmet.js or equivalent for HTTP security headers
- Environment secrets: Use secure secret management (Vault, AWS Secrets Manager)

## Anti-Patterns — Never Do This
- ❌ Do not trust user input without validation
- ❌ Do not expose stack traces or internal errors to users
- ❌ Do not hardcode secrets or API keys in source code
- ❌ Do not use weak encryption or outdated algorithms
- ❌ Do not ignore security updates and patches
- ❌ Do not implement custom cryptographic functions
- ❌ Do not allow SQL injection through string concatenation
- ❌ Do not use predictable session IDs or tokens

## Example

```typescript
// ✅ Secure input validation
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  name: z.string().min(2).max(50),
});

export async function createUser(userData: unknown) {
  const validatedData = userSchema.parse(userData);
  
  // Hash password before storing
  const hashedPassword = await bcrypt.hash(validatedData.password, 12);
  
  return database.users.create({
    ...validatedData,
    password: hashedPassword,
  });
}
```

```typescript
// ✅ Secure authentication middleware
import jwt from 'jsonwebtoken';

export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}
```

```typescript
// ✅ Secure API endpoint
export async function getUserProfile(req: Request, res: Response) {
  try {
    const userId = req.user.id;
    const user = await database.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        // Never expose password or sensitive data
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    // Log error internally but don't expose details
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

## Notes
- Use Content Security Policy (CSP) headers to prevent XSS attacks
- Implement CSRF protection for state-changing operations
- Use parameterized queries or ORM to prevent SQL injection
- Regularly run security scans (SAST, DAST) in CI/CD pipeline
- Follow OWASP Top 10 guidelines for web application security
- Use secure session management with proper cookie settings
- Implement proper logout functionality that invalidates tokens
- Consider using security-focused frameworks and libraries