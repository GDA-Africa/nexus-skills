---
skill: dependency-management
version: 1.0.0
framework: shared
category: workflow
triggers:
  - "dependency management"
  - "package management"
  - "versioning"
  - "security scanning"
  - "npm packages"
author: "@nexus-framework/skills"
status: active
---

# Skill: Dependency Management (Shared)

## When to Read This
Read this skill when adding new dependencies, updating existing packages, or managing project dependencies.

## Context
Proper dependency management is crucial for security, stability, and maintainability. This project follows strict guidelines for selecting, updating, and monitoring dependencies. We prioritize security, compatibility, and minimal bundle size while avoiding dependency bloat. Regular audits and updates are essential to maintain a healthy codebase.

## Steps
1. Research and evaluate potential dependencies for security and maintenance
2. Check compatibility with current project versions and constraints
3. Add dependencies using appropriate commands (npm, yarn, pnpm)
4. Pin exact versions in package.json for production stability
5. Run security scans and vulnerability assessments
6. Test thoroughly after dependency updates
7. Document breaking changes and migration steps
8. Remove unused dependencies regularly

## Patterns We Use
- Package managers: npm, yarn, or pnpm based on project setup
- Version pinning: Use exact versions (^ or ~) for production dependencies
- Security scanning: Use npm audit, Snyk, or Dependabot for vulnerability detection
- Monorepo management: Use workspaces or pnpm workspaces for shared dependencies
- Bundle analysis: Use webpack-bundle-analyzer or similar tools to monitor size
- Peer dependencies: Declare peer dependencies correctly for libraries
- Lock files: Commit package-lock.json, yarn.lock, or pnpm-lock.yaml
- Automated updates: Use Dependabot or Renovate for automated dependency updates

## Anti-Patterns — Never Do This
- ❌ Do not install dependencies without reviewing their security and maintenance
- ❌ Do not use wildcard versions (*) in production
- ❌ Do not ignore security vulnerabilities in dependencies
- ❌ Do not install development dependencies as production dependencies
- ❌ Do not commit node_modules to version control
- ❌ Do not ignore peer dependency warnings
- ❌ Do not use deprecated or unmaintained packages
- ❌ Do not install multiple packages that provide the same functionality

## Example

```json
// ✅ package.json with proper dependency management
{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "@tanstack/react-query": "^4.24.0",
    "zod": "^3.20.0",
    "axios": "^1.3.0",
    "lucide-react": "^0.260.0",
    "clsx": "^1.2.1"
  },
  "devDependencies": {
    "@types/node": "^18.14.0",
    "@types/react": "^18.0.28",
    "@types/react-dom": "^18.0.11",
    "@typescript-eslint/eslint-plugin": "^5.54.0",
    "@typescript-eslint/parser": "^5.54.0",
    "@vitejs/plugin-react": "^4.0.0",
    "eslint": "^8.36.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.3.4",
    "typescript": "^5.0.2",
    "vite": "^4.1.0",
    "vitest": "^0.28.0"
  },
  "peerDependencies": {
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
  }
}
```

```bash
# ✅ Adding dependencies correctly
# Production dependency
npm install react-router-dom@^6.8.0

# Development dependency
npm install --save-dev @types/node@^18.14.0

# Peer dependency (for libraries)
npm install --save-peer react@^18.0.0

# Update all dependencies to latest compatible versions
npm update

# Update to latest major versions (breaking changes)
npm update --force
```

```typescript
// ✅ Dependency injection pattern to reduce coupling
interface HttpClient {
  get<T>(url: string): Promise<T>;
  post<T>(url: string, data: any): Promise<T>;
}

class AxiosClient implements HttpClient {
  async get<T>(url: string): Promise<T> {
    const response = await axios.get(url);
    return response.data;
  }

  async post<T>(url: string, data: any): Promise<T> {
    const response = await axios.post(url, data);
    return response.data;
  }
}

class FetchClient implements HttpClient {
  async get<T>(url: string): Promise<T> {
    const response = await fetch(url);
    return response.json();
  }

  async post<T>(url: string, data: any): Promise<T> {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}

// Usage
const client: HttpClient = new AxiosClient();
const data = await client.get<User>('/api/users/1');
```

```json
// ✅ .npmrc configuration for consistent behavior
# Use exact versions for reproducible builds
save-exact=true

# Use HTTPS for package downloads
registry=https://registry.npmjs.org/

# Enable audit fixes
audit-level=moderate

# Configure proxy if needed
# proxy=http://proxy.company.com:8080
# https-proxy=http://proxy.company.com:8080
```

```yaml
# ✅ Dependabot configuration for automated updates
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    reviewers:
      - "team-leads"
    assignees:
      - "maintainers"
    commit-message:
      prefix: "deps"
      include: "scope"
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
```

```typescript
// ✅ Lazy loading to reduce bundle size
// Instead of: import { heavyLibrary } from 'heavy-library';

const HeavyComponent = lazy(() => import('./HeavyComponent'));
const ChartLibrary = lazy(() => import('chart.js'));

function Dashboard() {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <HeavyComponent />
      </Suspense>
    </div>
  );
}
```

## Notes
- Regularly run `npm audit` and `npm audit fix` to address security vulnerabilities
- Use `npm ls` or `yarn why` to understand dependency trees and conflicts
- Monitor bundle size with tools like webpack-bundle-analyzer
- Consider tree-shaking capabilities when choosing libraries
- Use TypeScript declaration files for better type safety
- Document breaking changes in CHANGELOG.md
- Test thoroughly after major dependency updates
- Remove unused dependencies with `npm prune` or `depcheck`
- Use semantic versioning understanding for version ranges
- Consider using pnpm for better disk space usage and dependency isolation