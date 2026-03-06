# SKILL_SPEC.md — The NEXUS Skill Format Standard

**Version:** 1.0.0  
**Status:** Canonical — All skills in this registry and in user projects must conform to this spec.  
**Maintained by:** GDA Africa  

---

## What Is This Document?

This is the authoritative contract for what a valid NEXUS skill file looks like.

- **Authors** writing skills for `@nexus-framework/skills` must follow this spec exactly.
- **Contributors** submitting PRs will have their skills validated against this spec.
- **NEXUS CLI** uses this spec to validate skill files during `nexus repair` and `nexus skill new`.
- **AI agents** reading a skill file can use this spec to verify a skill is well-formed before following it.

Read this document fully before writing a skill.

---

## 1. What Is a Skill File?

A skill file is a structured markdown document stored in `.nexus/skills/`. It tells an AI agent exactly how to perform a specific class of task within a project — before the agent begins that task.

Skill files answer the question: **"How do we do this *here*?"**

They are plain markdown. Any AI tool that can read a file can use a skill. The NEXUS CLI handles distributing them; the format is tool-agnostic by design.

---

## 2. The Canonical Skill Format

Every skill file must have two parts:
1. **A YAML frontmatter block** — machine-readable metadata
2. **A markdown body** — human and agent-readable instructions

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
  - "new component"
author: "@nexus-framework/skills"
status: active
---

# Skill: Creating Components (Next.js)

## When to Read This
Read this skill before creating any new React component in this project.

## Context
[Brief description of how this project specifically handles this task and why.]

## Steps
1. [Exact step]
2. [Exact step]
3. [Exact step]

## Patterns We Use
[Specific patterns, naming conventions, file structures this project follows.]

## Anti-Patterns — Never Do This
[Things that look reasonable but are wrong for this project.]

## Example
[A concrete, minimal example of the correct output.]

## Notes
[Any edge cases, exceptions, or links to relevant docs.]
```

---

## 3. Frontmatter Field Reference

### Required Fields

All of the following fields are **required**. A skill file missing any required field is invalid and will be rejected by `nexus repair` and the CI validation workflow.

---

#### `skill`

| Attribute | Value |
|-----------|-------|
| Type | `string` |
| Format | kebab-case slug |
| Unique within | its `framework` + `category` combination |

The unique identifier for this skill. Used by the CLI to reference, install, and list skills. Must be kebab-case, lowercase, no spaces.

**Valid examples:**
```yaml
skill: component-creation
skill: api-route-convention
skill: error-boundary-pattern
```

**Invalid:**
```yaml
skill: Component Creation     # spaces not allowed
skill: componentCreation      # camelCase not allowed
skill: ROUTING                # uppercase not allowed
```

---

#### `version`

| Attribute | Value |
|-----------|-------|
| Type | `string` |
| Format | Semver (`MAJOR.MINOR.PATCH`) |

The version of this skill file. Increment `PATCH` for content fixes, `MINOR` for new sections, `MAJOR` for a breaking change to the recommended pattern.

**Valid examples:**
```yaml
version: 1.0.0
version: 1.2.3
version: 2.0.0
```

---

#### `framework`

| Attribute | Value |
|-----------|-------|
| Type | `string` |
| Allowed values | `next.js` · `react-vite` · `sveltekit` · `nuxt` · `astro` · `remix` · `shared` |

The framework this skill targets. Use `shared` for skills that apply to any project regardless of framework (e.g., git workflow, code review, debugging).

**Valid examples:**
```yaml
framework: next.js
framework: sveltekit
framework: shared
```

---

#### `category`

| Attribute | Value |
|-----------|-------|
| Type | `string` |
| Allowed values | `ui` · `routing` · `data` · `testing` · `api` · `config` · `workflow` |

The category this skill belongs to. Used by `nexus skill list` to group output and by the CLI to map tasks to skills.

| Category | Covers |
|----------|--------|
| `ui` | Components, layouts, design system patterns |
| `routing` | Pages, navigation, link conventions |
| `data` | Fetching, mutations, caching, state management |
| `testing` | Unit, integration, E2E test patterns |
| `api` | API routes, server actions, endpoint conventions |
| `config` | Environment variables, tooling, project configuration |
| `workflow` | Git, code review, debugging, documentation practices |

---

#### `triggers`

| Attribute | Value |
|-----------|-------|
| Type | `string[]` |
| Minimum | 2 items |
| Format | Natural language phrases |

An array of natural language phrases that describe when an AI agent should read this skill. These are the phrases an agent matches against the task it is about to perform.

**Critical rules for writing good triggers:**
- Write them as phrases a human would say when describing the task
- Cover multiple phrasings — agents express the same task many ways
- Do NOT use regex or code patterns — triggers are semantic, not syntactic
- Include both short forms (`"new component"`) and descriptive forms (`"creating a reusable React component"`)
- Aim for 3–6 triggers per skill

**Good triggers:**
```yaml
triggers:
  - "creating a new component"
  - "adding a React component"
  - "building a UI element"
  - "new component"
  - "add a page component"
```

**Bad triggers:**
```yaml
triggers:
  - "^Component"              # regex — not allowed
  - "component.tsx"           # file pattern — not allowed
  - "c"                       # too short / ambiguous
```

---

#### `author`

| Attribute | Value |
|-----------|-------|
| Type | `string` |

The package name or GitHub username that created this skill. For official NEXUS registry skills, this is always `"@nexus-framework/skills"`. For community packages, use the package name. For custom skills, use the project team's GitHub handle or org name.

```yaml
author: "@nexus-framework/skills"         # official registry
author: "@acme-corp/nexus-skills"         # community package
author: "@myhandle"                       # custom/personal skill
```

---

#### `status`

| Attribute | Value |
|-----------|-------|
| Type | `string` |
| Allowed values | `active` · `draft` · `deprecated` |

The enforcement status of this skill.

| Status | Meaning |
|--------|---------|
| `active` | AI agents **must** read and follow this skill before the matching task |
| `draft` | Skill exists but is not yet enforced. Agents may read it for guidance |
| `deprecated` | Skill is outdated. Agents should note this and flag it for update via `knowledge.md` |

**New skills start as `draft`** until reviewed and promoted to `active`.  
**Custom skills created by `nexus skill new`** always start as `draft`.

---

### Optional Fields

These fields are not required but are recommended for completeness.

| Field | Type | Description |
|-------|------|-------------|
| `updated` | `string` (ISO date) | Date the skill was last meaningfully updated (`2026-03-06`) |
| `related` | `string[]` | Slugs of related skills that an agent may also want to read |
| `requires` | `string[]` | Other skills that must be read first (prerequisites) |

**Example with optional fields:**
```yaml
---
skill: server-actions
version: 1.1.0
framework: next.js
category: api
triggers:
  - "adding a server action"
  - "form submission"
  - "mutating data from a component"
author: "@nexus-framework/skills"
status: active
updated: 2026-03-06
related:
  - data-fetching
  - error-handling
requires:
  - api-routes
---
```

---

## 4. Body Section Reference

The markdown body must contain these sections in this order. All sections are **required** unless marked optional.

---

### `# Skill: [Title]`

The H1 title. Format: `Skill: [Human-readable name] ([Framework])`

```markdown
# Skill: Creating Components (Next.js)
# Skill: API Route Conventions (Remix)
# Skill: Git Workflow (Shared)
```

---

### `## When to Read This`

One to two sentences. Tells the agent exactly when to pick up this skill.

```markdown
## When to Read This
Read this skill before creating any new React component in this project.
```

---

### `## Context`

A brief description (2–4 sentences) of how *this project* specifically handles this task and why. The key word is *specifically* — avoid generic framework documentation. Explain the project-level decisions.

```markdown
## Context
This project uses a feature-based folder structure where components live alongside their
feature module, not in a global `components/` directory. All components are server
components by default; add `'use client'` only when you need browser APIs or interactivity.
```

---

### `## Steps`

A numbered list of the exact steps the agent should follow. Steps should be precise enough to execute without ambiguity.

```markdown
## Steps
1. Determine whether the component is server or client (default: server).
2. Create the file at `src/features/[feature]/[ComponentName].tsx`.
3. Export the component as a named export (not default export).
4. Add a JSDoc comment above the function with a one-line description.
5. Run `yarn type-check` to confirm no type errors.
```

---

### `## Patterns We Use`

A description of the specific naming conventions, file structures, import styles, and code patterns this project follows. Be concrete — include actual examples of naming, paths, and code shape.

```markdown
## Patterns We Use
- File names: PascalCase (`UserCard.tsx`, `ProductList.tsx`)
- Props interfaces: Named `[ComponentName]Props` defined above the component
- Imports: Absolute paths using the `@/` alias for `src/`
- Exports: Named exports only — never `export default`
```

---

### `## Anti-Patterns — Never Do This`

Things that look reasonable from a generic framework perspective but are **wrong** for this project. This section is the highest-value part of a skill — it prevents the specific mistakes agents make most often.

```markdown
## Anti-Patterns — Never Do This
- ❌ Do not create components in `src/components/` — use the feature folder
- ❌ Do not use `export default` — all exports are named
- ❌ Do not add `'use client'` unless the component genuinely needs browser APIs
- ❌ Do not inline styles — use Tailwind classes only
```

---

### `## Example`

A concrete, minimal, correct example of the output this skill produces. Keep it short — enough to show the pattern, not a full implementation.

````markdown
## Example

```tsx
// src/features/user/UserCard.tsx

interface UserCardProps {
  name: string;
  email: string;
}

/** Displays a single user's name and email. */
export function UserCard({ name, email }: UserCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <p className="font-semibold">{name}</p>
      <p className="text-sm text-muted">{email}</p>
    </div>
  );
}
```
````

---

### `## Notes` (optional)

Edge cases, exceptions, framework version caveats, or links to relevant project docs. Include this section only when there is genuinely useful additional context.

```markdown
## Notes
- For components that use `useSearchParams()`, Next.js requires a Suspense boundary — see `docs/05_patterns.md` for the wrapper pattern.
- This convention was adopted in v0.2.0 — older files in `src/components/` are legacy and should be migrated gradually.
```

---

## 5. Minimal Valid Skill (for quick reference)

This is the smallest possible valid skill file. Every field and every required section is present.

```markdown
---
skill: component-creation
version: 1.0.0
framework: next.js
category: ui
triggers:
  - "creating a new component"
  - "adding a React component"
  - "new component"
author: "@nexus-framework/skills"
status: active
---

# Skill: Creating Components (Next.js)

## When to Read This
Read this skill before creating any new React component in this project.

## Context
Components in this project are server components by default and live in their feature folder.

## Steps
1. Create `src/features/[feature]/[ComponentName].tsx`.
2. Export as a named export.
3. Add a JSDoc comment above the function.

## Patterns We Use
- PascalCase file names
- Named exports only
- Props interface: `[ComponentName]Props`

## Anti-Patterns — Never Do This
- ❌ Do not use `export default`
- ❌ Do not create files in `src/components/`

## Example

```tsx
export function UserCard({ name }: UserCardProps) {
  return <div>{name}</div>;
}
```
```

---

## 6. The Trigger Matching Philosophy

Triggers are **semantic**, not syntactic.

An AI agent should match triggers by asking: *"Does the task I am about to perform conceptually match any of these phrases?"* — not by checking for exact string equality or regex patterns.

This means:

- A trigger of `"creating a new component"` should match when an agent is about to write any new React/Svelte/Vue component, even if the agent's internal description is `"scaffold a new UserCard"`.
- A trigger of `"adding a route"` should match regardless of whether the agent says "new page", "add navigation", or "create a URL handler".
- Triggers should be written at the **task level**, not the **file level**.

**Write triggers the way a developer would describe the task in a standup:**
> "I'm going to add a new component" → matches `component-creation`  
> "I need to set up data fetching for the dashboard" → matches `data-fetching`  
> "I'm writing a test for this function" → matches `testing`

---

## 7. Precedence Rules

When multiple skills in a project cover the same task, this order determines which one takes precedence:

```
custom/ (project-specific) > core/ (framework) > community/ (installed integrations)
```

| Directory | Precedence | Created by | Modifiable by NEXUS |
|-----------|-----------|------------|---------------------|
| `custom/` | Highest | User / project team | **Never** |
| `core/` | Middle | `nexus init` / `nexus upgrade` | Yes — regenerated on upgrade |
| `community/` | Lowest | `nexus skill install` | Yes — reinstallable |

**Custom skills are sacred.** They represent the project team's explicit decisions and are never overwritten, regenerated, or deleted by any NEXUS command. If you want to override a core skill for your specific project, create a custom skill with the same `skill` slug.

---

## 8. Skill Lifecycle

```
draft → active → deprecated
```

| Transition | When | Who |
|------------|------|-----|
| `draft` → `active` | Skill is reviewed, tested, and ready to enforce | Skill author / reviewer |
| `active` → `deprecated` | Underlying pattern has changed; skill is no longer accurate | Maintainer |
| `deprecated` → removed | After a deprecation notice period (minimum one minor version) | Maintainer |

Agents encountering a `deprecated` skill should:
1. Note the deprecation
2. Proceed with best judgment
3. Log an entry in `knowledge.md` flagging the skill for update

---

## 9. Validation Rules Summary

Use this as a quick checklist before submitting a skill.

### Frontmatter
- [ ] `skill` is kebab-case and unique for its framework + category
- [ ] `version` is valid semver
- [ ] `framework` is one of the allowed values or `shared`
- [ ] `category` is one of the 7 allowed values
- [ ] `triggers` has at least 2 natural language phrases
- [ ] `author` is present
- [ ] `status` is `active`, `draft`, or `deprecated`

### Body
- [ ] H1 title follows the `# Skill: [Name] ([Framework])` format
- [ ] All required sections are present (`When to Read This`, `Context`, `Steps`, `Patterns We Use`, `Anti-Patterns — Never Do This`, `Example`)
- [ ] Steps are numbered and specific enough to execute
- [ ] Anti-Patterns uses `❌` markers and is concrete, not generic
- [ ] Example is a real code snippet, not a placeholder

### Content quality
- [ ] The skill is project-specific in tone — not generic framework documentation
- [ ] Triggers are semantic phrases, not regex or file patterns
- [ ] The skill can be followed without needing to read other documentation first (or lists prerequisites in `requires`)

---

## 10. File Naming Convention

Skill files must be named after their `skill` slug, with a `.md` extension:

```
component-creation.md      → skill: component-creation
api-routes.md              → skill: api-routes
git-workflow.md            → skill: git-workflow
```

Place files in the correct directory based on their framework:

```
packages/core/next.js/component-creation.md
packages/core/sveltekit/routing.md
packages/core/shared/git-workflow.md
```

---

## 11. A Note on Quality

The goal of a skill is to replace the need for a developer to re-explain a pattern to an AI agent every session.

A high-quality skill makes an AI agent feel like a teammate who was here from the start.

A low-quality skill — one that is generic, incomplete, or inaccurate — is worse than no skill, because it gives the agent false confidence.

**Write skills you would be comfortable handing to a new team member on their first day. If it would confuse them, rewrite it.**

---

*This document is the contract. It does not change lightly. Any proposed change to the skill format must be discussed in an issue before a PR is opened.*  
*For questions, open a GitHub Discussion in this repository.*
