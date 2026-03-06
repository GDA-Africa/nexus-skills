# `@nexus-framework/skills`

> **The official NEXUS skills registry.**  
> Pre-read instruction files that tell AI agents exactly how to execute tasks inside your project — before they start.

[![npm version](https://img.shields.io/npm/v/@nexus-framework/skills.svg)](https://www.npmjs.com/package/@nexus-framework/skills)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)
[![Status: In Development](https://img.shields.io/badge/status-in%20development-orange.svg)]()

---

## What Is This?

`@nexus-framework/skills` is a content registry — a curated collection of **skill files** for the [NEXUS CLI](https://github.com/GDA-Africa/nexus-cli) framework.

A **skill** is a structured markdown file that instructs an AI agent on how to perform a specific class of task within a project. Skills cover things like:

- How to create a component in this codebase
- How to add a new route
- How to write a test
- How to handle errors
- How to fetch and mutate data

Without skills, AI agents fall back to generic patterns — even when they have full project context. Skills solve that. They are the answer to the question every AI agent fails at: **"How do we do things *here*?"**

---

## How It Works

```
@nexus-framework/skills          ← this repo (skill content registry)
       ↓
nexus init / nexus skill install ← NEXUS CLI reads skill files from this package
       ↓
.nexus/skills/                   ← skill files are copied into your project
       ↓
AI agent reads skills before     ← agents pick up the right skill before each task
performing tasks
```

Skills are not a runtime dependency. They live in your project as plain markdown files — readable by every AI tool: Cursor, Copilot, Windsurf, Cline, Claude Code, and any future agent.

---

## Repository Structure

```
nexus-skills/
  packages/
    core/
      next.js/
        component-creation.md
        routing.md
        api-routes.md
        server-actions.md
        data-fetching.md
        testing.md
        styling.md
        error-handling.md
        middleware.md
      react-vite/
        component-creation.md
        routing.md
        state-management.md
        testing.md
        styling.md
      sveltekit/
        component-creation.md
        routing.md
        stores.md
        testing.md
      nuxt/
        component-creation.md
        routing.md
        composables.md
        testing.md
      astro/
        component-creation.md
        content-collections.md
        islands.md
        routing.md
      remix/
        routing.md
        loaders-actions.md
        error-boundaries.md
        testing.md
      shared/
        git-workflow.md
        code-review.md
        debugging.md
        documentation.md
        knowledge-logging.md
  SKILL_SPEC.md        ← canonical skill format standard (the contract for contributors)
  CONTRIBUTING.md      ← how to write and submit a skill to the registry
  skills-template      ← starter template for writing a new skill
  package.json
  README.md            ← you are here
```

---

## Skill File Format

Every skill in this registry follows the canonical format defined in [`SKILL_SPEC.md`](./SKILL_SPEC.md). Here is the structure at a glance:

```markdown
---
skill: component-creation
version: 1.0.0
framework: next.js
category: ui
triggers:
  - "creating a new component"
  - "adding a React component"
  - "building a UI element"
author: "@nexus-framework/skills"
status: active
---

# Skill: Creating Components (Next.js)

## When to Read This
## Context
## Steps
## Patterns We Use
## Anti-Patterns — Never Do This
## Example
## Notes
```

See [`SKILL_SPEC.md`](./SKILL_SPEC.md) for the full field reference, section definitions, and contribution rules.

---

## Skill Categories

| Category | Covers |
|----------|--------|
| `ui` | Components, layouts, design system patterns |
| `routing` | Pages, navigation, route conventions |
| `data` | Fetching, mutations, caching, state |
| `testing` | Unit, integration, E2E patterns |
| `api` | API routes, server actions, endpoint conventions |
| `config` | Environment, tooling, project configuration |
| `workflow` | Git, code review, debugging, documentation |

---

## Precedence Rules

When multiple skills cover the same task, this order wins:

```
custom/ (project-specific) > core/ (framework) > community/ (installed integrations)
```

Custom skills are never touched by NEXUS — they are owned entirely by the project team.

---

## Supported Frameworks

| Framework | Core Skills |
|-----------|------------|
| Next.js | ✅ Planned for v0.1.0 |
| React + Vite | ✅ Planned for v0.1.0 |
| SvelteKit | ✅ Planned for v0.1.0 |
| Nuxt | ✅ Planned for v0.1.0 |
| Astro | ✅ Planned for v0.1.0 |
| Remix | ✅ Planned for v0.1.0 |

---

## Using Skills in Your Project

Skills are distributed via the NEXUS CLI — not imported as a runtime package.

**At project init:**
```bash
npx @nexus-framework/cli init my-app
# Skills for your chosen framework are automatically installed into .nexus/skills/
```

**Installing skills manually:**
```bash
nexus skill install next.js         # Install all Next.js core skills
nexus skill install shared          # Install shared workflow skills
```

**Creating a custom skill:**
```bash
nexus skill new my-auth-flow
# Interactive prompt → creates .nexus/skills/custom/my-auth-flow.md
```

**Listing installed skills:**
```bash
nexus skill list
```

---

## The Agent Protocol

Once skills are installed, AI agents are automatically instructed (via `.nexus/ai/instructions.md` and all tool rule files) to follow this protocol:

1. Before performing a significant task, check `.nexus/skills/`
2. Match the task against each skill's `triggers` list
3. If a match is found, read the skill fully before proceeding
4. Follow the skill's steps and patterns precisely
5. If you deviate for a valid reason, log it in `.nexus/docs/knowledge.md`

This protocol is automatically propagated to `.cursorrules`, `.windsurfrules`, `.clinerules`, `AGENTS.md`, and `copilot-instructions.md` — covering every major AI coding tool simultaneously.

---

## Relationship to `@nexus-framework/cli`

| Package | Role |
|---------|------|
| [`@nexus-framework/cli`](https://github.com/GDA-Africa/nexus-cli) | The CLI tool — `nexus init`, `nexus adopt`, `nexus upgrade`, `nexus skill` |
| `@nexus-framework/skills` | The content registry — skill file templates sourced by the CLI |

The CLI reads skill content from this package and copies the relevant files into the project's `.nexus/skills/` directory. After that, skills belong to the project — not to any runtime dependency.

---

## Contributing

Contributions are welcome. See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for:

- How to write a skill that meets the `SKILL_SPEC.md` standard
- PR process and review criteria
- How to propose a new framework or category

**Quick rules:**
- Every skill must have all required frontmatter fields
- `triggers` must be natural language phrases (not regex)
- Skills should be opinionated and project-specific in style, not generic documentation
- Quality over quantity — one excellent, actionable skill beats five thin ones

---

## Roadmap

| Version | Target | Features |
|---------|--------|----------|
| **0.1.0** | v0.3.0 of CLI | Core skills for all 6 frameworks (5+ per framework), `SKILL_SPEC.md`, published to npm |
| **0.2.0** | v0.3.x | Community integration skills (`supabase`, `stripe`, `prisma`) |
| **0.3.0** | v0.4.0 | `@nexus-framework/skills-integrations` sub-package |

---

## License

Apache 2.0 — see [LICENSE](./LICENSE).

---

*Part of the [NEXUS Framework](https://github.com/GDA-Africa/nexus-cli) by GDA Africa.*  
*The AI-native development workflow. Skills are its execution layer.*
