---
skill: authentication-patterns
version: 1.0.0
framework: shared
category: workflow
invocation: model
triggers:
  - "authentication patterns"
  - "auth implementation"
  - "session management"
  - "jwt tokens"
  - "oauth2 flow"
  - "role based access control"
author: "@nexus-framework/skills"
status: active
updated: 2026-10-03
related:
  - "security-best-practices"
  - "api-design"
  - "database-patterns"
---

# Skill: Authentication & Authorization Patterns (Shared)

## When to Read This
Read this skill when designing or implementing user login, session management, token issuance/refresh, OAuth2/OIDC integrations, password storage, or Role-Based Access Control (RBAC).

## Context
Authentication establishes identity; authorization governs permissions. Flaws in auth architecture are among the most dangerous security vulnerabilities (OWASP A01 & A07). This skill establishes secure, industry-standard patterns for session storage, cryptographic token validation, password hashing, and permission checks across web services and APIs.

## Steps
1. **Choose the Session Architecture**:
   - **Web Applications (BFF / SSR / Next.js)**: Use encrypted, `HttpOnly`, `Secure`, `SameSite=Lax` cookie-backed sessions (stored in Redis or DB).
   - **Decoupled APIs / Mobile**: Use short-lived Access Tokens (JWT, 15m lifetime) paired with rotatable, hashed Refresh Tokens.
2. **Hash Passwords Securely**: Use Argon2id or bcrypt (cost factor $\ge 12$). Never store plaintext or use weak hashes (MD5, SHA-1, SHA-256).
3. **Mitigate Timing Attacks**: Compare security tokens and hashes using constant-time equality functions (`crypto.timingSafeEqual`).
4. **Implement Refresh Token Rotation**: Invalidate old refresh tokens upon exchange; if an already-used refresh token is presented, revoke the entire token family (breach detection).
5. **Protect Against CSRF**: Use `SameSite=Lax` cookies by default, and double-submit CSRF tokens or custom headers (`X-Requested-With`) for mutating state (`POST`/`PUT`/`DELETE`).
6. **Implement PKCE for OAuth2**: Always use Authorization Code Flow with PKCE (Proof Key for Code Exchange) for browser, mobile, and desktop clients.
7. **Enforce Role-Based Access Control (RBAC)**: Validate permissions at the route handler and business logic layer, never solely in client UI components.
8. **Rate-Limit Auth Endpoints**: Guard `/login`, `/register`, and `/forgot-password` endpoints against brute-force attacks by IP and account identifier.

## Patterns We Use
- **HttpOnly Cookie Storage**: Web browser access tokens must never be accessible via `document.cookie` or stored in `localStorage` (XSS vulnerability).
- **Session Fixation Prevention**: Always regenerate the session ID immediately upon successful login.
- **Timing-Safe Verification**: Always verify signatures and HMACs using constant-time comparison.
- **Granular Permissions Matrix**: Map coarse user roles (`admin`, `editor`, `viewer`) to granular permissions (`posts:create`, `posts:delete`, `users:manage`) verified via middleware.
- **Stateless Verification with Blacklist / Short Expiry**: When using JWTs, keep expiry under 15 minutes. Revocations check a Redis Bloom filter or database blacklist.

## Anti-Patterns — Never Do This
- ❌ Do not store JWTs or sensitive session tokens in `localStorage` or `sessionStorage` (exposed to any XSS payload).
- ❌ Do not use custom cryptographic algorithms or hashing routines.
- ❌ Do not trust user claims in JWT payload without validating the cryptographic signature.
- ❌ Do not use `SameSite=None` without explicit necessity and mandatory CSRF token verification.
- ❌ Do not issue permanent or long-lived (>1 hour) access tokens without a revocation mechanism.
- ❌ Do not expose detailed authentication failures (e.g. "User does not exist" vs "Incorrect password") — return generic "Invalid email or password".
- ❌ Do not rely solely on frontend route guards for security; all API endpoints must verify credentials independently.

## Example

```typescript
import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const ACCESS_TOKEN_EXPIRY = '15m';

export interface TokenPayload {
  sub: string;       // User ID
  role: 'admin' | 'member' | 'viewer';
  permissions: string[];
}

// 1. Constant-time string comparison helper
export function safeStringCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

// 2. Secure Password Hashing
export async function hashPassword(plaintext: string): Promise<string> {
  const SALT_ROUNDS = 12;
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

export async function verifyPassword(plaintext: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}

// 3. Token Issuance & Verification
export function issueAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
    algorithm: 'HS256',
  });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as TokenPayload;
  } catch {
    return null;
  }
}

// 4. Refresh Token Generation with SHA-256 Storage Hash
export function generateRefreshToken(): { token: string; hashedToken: string } {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hashedToken };
}

// 5. RBAC Middleware Pattern
export type Permission = 'projects:read' | 'projects:write' | 'projects:delete';

export function requirePermission(permission: Permission) {
  return (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.slice(7);
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Role override or specific permission check
    if (decoded.role === 'admin' || decoded.permissions.includes(permission)) {
      req.user = decoded;
      return next();
    }

    return res.status(403).json({ error: 'Forbidden: insufficient permissions' });
  };
}

// 6. Secure Cookie Options (for Web Apps / Next.js / Express)
export const SECURE_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for refresh token
};
```

## Validation
- Password storage uses bcrypt (cost $\ge 12$) or Argon2id.
- Access tokens expire within 15 minutes.
- Refresh tokens are stored as hashes, and rotating them invalidates prior tokens.
- All mutating endpoints authenticate the user and enforce permission checks on the server.
- Auth cookies are configured with `httpOnly: true`, `secure: true`, and `sameSite: 'lax'`.

## Notes
- For Next.js App Router, manage auth state using middleware or secure server actions reading encrypted session cookies.
- For Single Sign-On (SSO), verify standard OpenID Connect discovery endpoints (`/.well-known/openid-configuration`) and JWKS key rotation.
