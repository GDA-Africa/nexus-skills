# @nexus-framework/skills Core Package

This directory contains the core skills for the NEXUS Skills System, organized by framework and category.

## Structure

```
packages/core/
├── next.js/          # Next.js framework skills
├── react-vite/       # React + Vite framework skills
├── sveltekit/        # SvelteKit framework skills
├── nuxt/            # Nuxt framework skills
├── astro/           # Astro framework skills
├── remix/           # Remix framework skills
├── shared/          # Framework-agnostic skills
└── package.json     # Package configuration
```

## Framework Skills

Each framework directory contains skills specific to that framework's conventions and patterns:

### Next.js Skills
- `component-creation.md` - How to create React components
- `routing.md` - Route and page creation
- `api-routes.md` - API endpoints and server actions
- `data-fetching.md` - Server and client-side data fetching
- `testing.md` - Testing patterns and utilities
- `styling.md` - Styling conventions and best practices
- `error-handling.md` - Error boundaries and error management
- `middleware.md` - Request-level middleware

### Shared Skills
- `git-workflow.md` - Git branching and commit conventions
- `code-review.md` - Code review process and guidelines
- `debugging.md` - Debugging strategies and tools
- `documentation.md` - Documentation standards and practices
- `knowledge-logging.md` - Project knowledge management

## Skill Format

All skills follow the NEXUS skill format standard defined in `SKILL_SPEC.md`:

```yaml
---
skill: component-creation
version: 1.0.0
framework: next.js
category: ui
triggers:
  - "creating a new component"
  - "adding a React component"
author: "@nexus-framework/skills"
status: active
---
```

## Usage

These skills are consumed by the NEXUS CLI and installed into projects via:

```bash
nexus skill install next.js
nexus skill install shared
```

## Contributing

See `CONTRIBUTING.md` for guidelines on adding new skills or updating existing ones.

## License

Apache 2.0 - see LICENSE file for details.