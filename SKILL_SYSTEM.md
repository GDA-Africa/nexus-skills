# NEXUS Skills System — Feature Idea Document

**Document Type:** Feature Specification & Implementation Guide  
**Status:** Proposed — v0.3.0 Target  
**Author:** GDA Africa Engineering  
**Relates To:** `@nexus-framework/cli`, `@nexus-framework/skills` (new package)

---

## 1. What This Document Is

This document defines the **NEXUS Skills System** — a new feature layer for the NEXUS CLI framework. It is written to be consumed by an AI agent who will implement this feature inside the existing NEXUS codebase. It covers the vision, the rationale, the full architecture, the implementation plan, the file spec, and the exact changes required to the existing codebase.

Read this document fully before writing any code.

---

## 2. The Problem This Solves

NEXUS currently gives AI agents **project understanding** — what the project is, why decisions were made, what to work on next. The doc system (`01_vision.md` → `08_deployment.md`), the project brain (`index.md`), and the knowledge base (`knowledge.md`) answer the question: *"What are we building?"*

But there is a second question AI agents consistently fail at: **"How do we do things here?"**

Even with full project context, agents default to generic patterns. They don't know:
- That this project creates route files a specific way
- That components always include a certain structure
- That API endpoints follow a custom convention
- That testing has a specific setup pattern

This causes drift — inconsistent code, broken conventions, re-explaining the same patterns repeatedly across sessions.

**Skills solve this.** A skill is a pre-read instruction file that tells an AI agent exactly how to execute a specific class of task within this project, before it starts.

---

## 3. The Core Concept

### What Is a Skill?

A skill is a structured markdown file stored in `.nexus/skills/`. Each skill covers one task category (e.g., "creating a component", "adding a route", "writing a test"). When an agent is about to perform a task that matches a skill's trigger, it reads the skill first and follows its instructions.

### The Relationship to Existing NEXUS Docs

| Layer | Files | Answers |
|-------|-------|---------|
| **Project Context** | `01_vision.md` → `08_deployment.md` | What are we building and why? |
| **Project State** | `index.md`, `knowledge.md` | What has been decided? What's next? |
| **Skills** | `.nexus/skills/**/*.md` | How do we execute tasks in this project? |

Skills do not replace any existing layer. They complete it.

### The Key Design Principle

Skills are just markdown files. They are framework-agnostic in format. Any AI agent that can read a file can use a skill — Cursor, Copilot, Windsurf, Cline, Claude Code, or any future tool. NEXUS handles distribution: one skill, every agent.

---

## 4. The npm Registry Strategy

### Existing Package
```
@nexus-framework/cli  →  github.com/GDA-Africa/nexus-cli
```

### New Package
```
@nexus-framework/skills  →  github.com/GDA-Africa/nexus-skills
```

### Why a Separate Package?

- Skills are **consumed by projects**, not by the CLI itself. A project can install skills independently.
- Skills are versioned and updated independently of the CLI.
- The community can contribute skills to `@nexus-framework/skills` without touching CLI code.
- Future integration skills (`supabase`, `stripe`, `prisma`) can be published as sub-packages under the same org: `@nexus-framework/skills-integrations`.

### Install Relationship

When a user runs `nexus init` or `nexus skill install`, the CLI fetches skill content from `@nexus-framework/skills` and copies the relevant skill files into the project's `.nexus/skills/` directory. Skills live in the project — not as a runtime dependency.

---

## 5. The Skill File Specification

Every skill file must conform to this format. This is the canonical standard.

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

### Frontmatter Fields

| Field | Required | Description |
|-------|----------|-------------|
| `skill` | Yes | Unique slug identifier for this skill |
| `version` | Yes | Semver version string |
| `framework` | Yes | Target framework or `shared` for universal skills |
| `category` | Yes | One of: `ui`, `routing`, `data`, `testing`, `api`, `config`, `workflow` |
| `triggers` | Yes | Array of natural language phrases that activate this skill |
| `author` | Yes | Package or username that created this skill |
| `status` | Yes | One of: `active`, `draft`, `deprecated` |

### Status Meanings

- `active` — AI agents must follow this skill
- `draft` — Skill exists but not yet enforced; agent may read for guidance
- `deprecated` — Skill is outdated; agent should note this and flag for update

---

## 6. The `.nexus/skills/` Directory Structure

```
.nexus/
  skills/
    README.md                  ← explains the skills system to humans and agents
    core/                      ← generated by NEXUS at init, updated on upgrade
      component-creation.md
      routing.md
      api-routes.md
      data-fetching.md
      testing.md
      styling.md
      error-handling.md
    custom/                    ← created by the user, NEVER overwritten by NEXUS
      README.md                ← placeholder with instructions on creating custom skills
    community/                 ← installed via `nexus skill install`
      [skill-name].md
```

### Directory Rules

| Directory | Created By | Updated By | Protected |
|-----------|-----------|------------|-----------|
| `core/` | `nexus init` / `nexus skill generate` | `nexus upgrade` | No — regenerated from framework template |
| `custom/` | User via `nexus skill new` | User only | **Yes — never touched by NEXUS** |
| `community/` | `nexus skill install` | `nexus skill install` | No — reinstallable from registry |

This mirrors the existing NEXUS preserve-or-replace logic for docs exactly.

---

## 7. The Agent Protocol

The most critical part of the implementation is updating the master AI instruction file. When an AI agent reads the NEXUS instructions, it must know the skills protocol.

### Addition to `.nexus/ai/` Master Config

The following section must be added to the master AI instructions template that `ai-config.generator.ts` produces:

```markdown
## Skills Protocol

NEXUS Skills are pre-read instruction files that define how to execute tasks in this project.

**Before performing any significant task:**
1. Check `.nexus/skills/` for a relevant skill
2. Look in `core/` for framework-specific skills
3. Look in `custom/` for project-specific overrides
4. Look in `community/` for installed integration skills
5. Match the task you are about to perform against each skill's `triggers` list
6. If a match is found, read the skill file fully before proceeding
7. Follow the skill's steps and patterns precisely
8. If you deviate from a skill for a valid reason, log it in `knowledge.md`

**Custom skills take precedence over core skills.**
**Core skills take precedence over community skills.**

Available skills are listed in `.nexus/skills/README.md`.
```

This single addition — propagated through the existing tool-config generation system into `.cursorrules`, `.windsurfrules`, `.clinerules`, `AGENTS.md`, and `copilot-instructions.md` — activates skills across every AI tool simultaneously.

---

## 8. The `@nexus-framework/skills` Repository Structure

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
  SKILL_SPEC.md               ← canonical skill format standard (public)
  CONTRIBUTING.md             ← how to contribute a skill to the registry
  package.json
  README.md
```

### `package.json` for `@nexus-framework/skills`

```json
{
  "name": "@nexus-framework/skills",
  "version": "0.1.0",
  "description": "Official NEXUS skills registry — AI task knowledge for every framework",
  "files": ["packages/"],
  "keywords": ["nexus", "ai", "skills", "scaffolding", "agents"],
  "repository": {
    "type": "git",
    "url": "https://github.com/GDA-Africa/nexus-skills"
  },
  "license": "Apache-2.0"
}
```

---

## 9. Changes Required to `nexus-cli`

### 9.1 New File: `src/prompts/skill-config.prompt.ts`

Add to the existing prompt pipeline (after the persona prompt). This module asks two questions:

```
? Enable NEXUS Skills System?                    › Yes
? Install framework skills for [framework]?      › Yes / No / Later
```

Both default to Yes. Skills are opt-in but recommended. The answers are passed to the orchestrator alongside all other prompt results.

### 9.2 New File: `src/generators/skills.generator.ts`

A new generator module — the 9th in the pipeline. Called by the orchestrator after `ai-config.generator.ts`.

**Responsibilities:**
1. Create `.nexus/skills/core/` and populate it with framework-matched skill files sourced from `@nexus-framework/skills`
2. Create `.nexus/skills/custom/` with a `README.md` placeholder
3. Create `.nexus/skills/README.md` — a human and agent-readable index of all installed skills
4. Return a skill manifest object for the AI config generator to embed in the master instructions

**Skill manifest format** (embedded in `.nexus/skills/README.md`):
```markdown
# NEXUS Skills Index

## Core Skills (next.js)
| Skill | Triggers | Status |
|-------|----------|--------|
| component-creation | creating a new component, adding a React component | active |
| routing | adding a route, new page, navigation | active |
...

## Custom Skills
No custom skills yet. Run `nexus skill new <name>` to create one.

## Community Skills
No community skills installed. Run `nexus skill install <pkg>` to install.
```

### 9.3 Update: `src/generators/ai-config.generator.ts`

Add the Skills Protocol section (defined in Section 7 above) to the master AI instructions template. The skills manifest from `skills.generator.ts` is injected dynamically so agents see the available skill list.

### 9.4 Update: `src/generators/upgrade.generator.ts`

Extend the existing preserve-or-replace logic to handle skills:

```typescript
// Upgrade rules for skills:
// - core/ skills: regenerate from @nexus-framework/skills based on current framework
// - custom/ skills: NEVER touch, NEVER read, flag in output that they were preserved
// - community/ skills: skip unless --force flag is passed
```

### 9.5 Update: `src/commands/repair.command.ts`

Extend the existing repair logic to detect and fix skill corruption:

- Missing `core/` skill files → regenerate from package
- Skill files with invalid or missing frontmatter → report to user with fix suggestion
- Missing `.nexus/skills/README.md` → regenerate from manifest
- Custom skill issues → **report only, never auto-repair**

### 9.6 New File: `src/commands/skill.command.ts`

A new top-level CLI command with five subcommands:

```
nexus skill new <name>
```
Interactive scaffold of a new custom skill. Prompts for: name, category, triggers (comma-separated), framework. Creates `.nexus/skills/custom/<name>.md` with template content and `status: draft`.

```
nexus skill list
```
Lists all skills in `.nexus/skills/` with their category, trigger count, and status. Groups by directory (core / custom / community).

```
nexus skill install <package>
```
Installs skills from `@nexus-framework/skills` or a community package. Copies skill files into `.nexus/skills/community/`. Updates the skills README index.

```
nexus skill remove <name>
```
Removes a community skill. Refuses to remove core or custom skills (with a clear message explaining why). Updates the README index.

```
nexus skill status
```
Checks if core skills are up to date against the installed `@nexus-framework/skills` version. Reports outdated skills and suggests running `nexus upgrade`.

### 9.7 Update: `src/commands/adopt.command.ts`

Add skills to the adopt flow. After the existing adopt logic runs, prompt:

```
? Add NEXUS Skills to this project?   › Yes
? This looks like a [detected-framework] project. Install matching skills?  › Yes
```

If yes, run the skills generator with the detected framework. This gives existing projects the same skills foundation as freshly initialized ones.

---

## 10. The `nexus adopt` Skills Detection Logic

When adopting an existing project, the CLI must detect the framework. This detection logic likely already exists in the adopt command — use it. Pass the detected framework to `skills.generator.ts` the same way `nexus init` would.

If framework cannot be detected:
```
? Could not detect framework automatically. Choose one:
  › Next.js / React+Vite / SvelteKit / Nuxt / Astro / Remix / Skip skills for now
```

---

## 11. The `nexus skill generate` Command (Future — v0.4.0)

This command is **not in scope for v0.3.0** but must be designed for now so the architecture accommodates it.

**What it will do:**
1. Scan `src/` for repeated file structures, naming patterns, import shapes
2. Identify conventions the codebase already follows
3. Draft `.nexus/skills/custom/<pattern>.md` for each detected pattern
4. Set all generated skills to `status: draft`
5. Output a summary: "Generated 4 draft skills. Review and set status: active when ready."

**Why it matters:** This closes the loop. Instead of only teaching new projects good habits from the start, `skill generate` extracts the habits that already exist in a codebase. It makes skills self-documenting.

The architecture must ensure `custom/` skill files are never auto-overwritten, so draft skills generated by this command remain safe even after `nexus upgrade`.

---

## 12. The `SKILL_SPEC.md` Public Document

This file lives in the root of `nexus-skills` repo and is the canonical public standard for what a valid skill looks like. It should:

- Define every frontmatter field with type, constraints, and examples
- Define the required and optional markdown sections
- Include a minimal valid example and a full example
- Define what makes a skill `active` vs `draft` vs `deprecated`
- Explain the trigger matching philosophy (natural language, not regex)
- Explain the precedence rules (custom > core > community)

This document is the contract that community contributors write to. Publish it prominently.

---

## 13. Implementation Sequence (Ordered)

Do these in this exact order to avoid blocked dependencies:

1. **Create `nexus-skills` repo** and publish `@nexus-framework/skills@0.1.0` with at least Next.js core skills (the most used framework). This unblocks everything else.

2. **Write `SKILL_SPEC.md`** — the format standard. All skill content depends on this being settled.

3. **Write core skills content** for all 6 frameworks in the `nexus-skills` repo. Quality over quantity — 5 excellent skills per framework beats 15 thin ones.

4. **Write `skills.generator.ts`** in `nexus-cli` — the generator that creates `.nexus/skills/` at init time.

5. **Update `ai-config.generator.ts`** — add the Skills Protocol section. This is the highest-leverage change.

6. **Write `skill.command.ts`** — the `nexus skill` subcommand suite.

7. **Update `upgrade.generator.ts`** and `repair.command.ts` — extend existing logic.

8. **Update `adopt.command.ts`** — add skills to the adopt flow.

9. **Write `skill-config.prompt.ts`** — add to prompt pipeline.

10. **Update README.md** in `nexus-cli` — document the skills system for users.

11. **Bump version to `0.3.0`** and publish.

---

## 14. What Does Not Change

The following must remain exactly as-is:

- The 8-file NEXUS doc system (`01_vision.md` → `08_deployment.md`)
- `index.md` (Project Brain) structure
- `knowledge.md` (Knowledge Base) structure
- All existing prompt modules
- All existing generator modules (except additions noted above)
- The existing preserve-or-replace logic for user-populated docs
- All 6 framework scaffolding templates
- The existing tool config files (`.cursorrules`, etc.) — the skills protocol is *added*, not replacing anything
- The 190 existing unit tests — all must still pass

---

## 15. Testing Requirements

All new code must include unit tests consistent with the existing test suite (Vitest).

| New Module | Test Coverage Required |
|------------|----------------------|
| `skills.generator.ts` | Creates correct directory structure; installs correct skills for each framework; generates valid README index |
| `skill.command.ts` | `new` creates valid frontmatter; `list` returns correct output; `remove` refuses on core/custom; `install` copies files correctly |
| `skill-config.prompt.ts` | Returns correct defaults; handles skip case |
| `upgrade.generator.ts` (updated) | Custom skills preserved; core skills replaced; community skills untouched by default |
| `repair.command.ts` (updated) | Detects missing core skills; detects invalid frontmatter; never auto-repairs custom |

---

## 16. Definition of Done

The Skills System is complete when:

- [ ] `@nexus-framework/skills` is published on npm with core skills for all 6 frameworks
- [ ] `nexus init` creates `.nexus/skills/` with framework-matched core skills
- [ ] The master AI instructions include the Skills Protocol
- [ ] All tool rule files (`.cursorrules`, etc.) propagate the skills protocol
- [ ] `nexus skill new / list / install / remove / status` all work correctly
- [ ] `nexus adopt` includes the skills setup step
- [ ] `nexus upgrade` preserves custom skills and updates core skills
- [ ] `nexus repair` detects and reports skill issues
- [ ] All new code has unit tests
- [ ] All 190 existing tests still pass
- [ ] `README.md` documents the skills system
- [ ] `SKILL_SPEC.md` is published in the `nexus-skills` repo

---

## 17. The Bigger Picture

NEXUS starts as a scaffolding tool. With this feature, it becomes a knowledge system that grows with the project. 

The current NEXUS promise: *"AI agents understand your project."*  
The promise after Skills: *"AI agents understand your project and know exactly how to build within it."*

The knowledge base (`knowledge.md`) captures **what was decided**.  
Skills capture **how to execute decisions consistently**.

Together, they close the loop: context + execution methodology = a project where AI agents genuinely feel like teammates who have been here from the start — not generic autocompleters rediscovering conventions every session.

This is the AI-native development workflow. NEXUS is its infrastructure.

---

*Document ends. Begin implementation by reading the existing codebase structure, then follow the implementation sequence in Section 13.*