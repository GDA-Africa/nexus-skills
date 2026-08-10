# NEXUS CLI — GitHub Copilot Instructions

> **This file is automatically read by GitHub Copilot on every interaction.**
> It ensures all AI-assisted development follows NEXUS project standards.
> Full instructions also at `.nexus/ai/instructions.md`.

## 🧠 Before You Do Anything

**READ THE PROJECT INDEX FIRST:** `.nexus/docs/index.md`

This file is the single source of truth for the project's current state, what has been built, what hasn't, and what to work on next. Do not assume — check the index.

**THEN SCAN THE KNOWLEDGE BASE:** `.nexus/docs/knowledge.md`

This file is the project's accumulated intelligence — decisions, gotchas, patterns, and bug fixes discovered during development. Scan the headings before making decisions. It prevents you from repeating past mistakes.

## Project Overview

- **Name:** NEXUS CLI (`@nexus-framework/cli`)
- **Version:** 0.2.0
- **Purpose:** AI-native development framework by GDA Africa
- **License:** Apache 2.0

## Key Documentation

| File | What It Tells You |
|------|-------------------|
| `.nexus/docs/index.md` | **START HERE** — Full project status, what's built, what's next |
| `.nexus/docs/knowledge.md` | Progressive knowledge base — scan before every task, append after discoveries |
| `.nexus/docs/01_vision.md` | Product requirements, user stories, success metrics |
| `.nexus/docs/07_implementation.md` | Technical architecture, build phases, file-by-file plan |
| `CONTRIBUTING.md` | Commit standards, PR process, code style |
| `README.md` | Public-facing project overview |

## Tech Stack (Do Not Change Without Discussion)

- **Runtime:** Node.js 20+
- **Language:** TypeScript 5.7, strict mode, ESM (NodeNext)
- **CLI:** Commander.js 12.x
- **Prompts:** @inquirer/prompts 7.x
- **Template Engine:** Mustache 4.x
- **Testing:** Vitest 3.x
- **Linting:** ESLint 8.x + Prettier 3.x
- **Package Manager:** yarn

## Code Standards

1. **TypeScript strict mode** — no `any`, no implicit returns
2. **ESM only** — use `import`/`export`, never `require()`
3. **File extensions in imports** — always use `.js` extension (e.g., `import { foo } from './bar.js'`)
4. **Conventional Commits** — every commit must be `feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`
5. **Test everything** — every new feature needs unit tests in `tests/unit/`
6. **Validate after changes** — run `npx tsc --noEmit`, `yarn test`, `yarn lint`

## Architecture Rules

- **Generators return `GeneratedFile[]`** — they never write to disk directly
- **The orchestrator (`src/generators/index.ts`)** collects all files and writes them via `writeGeneratorResult()`
- **Types live in `src/types/`** — config.ts, prompts.ts, templates.ts
- **Utils are pure functions** — no side effects except file-system.ts and git.ts
- **Prompts use @inquirer/prompts** (not legacy inquirer)

## What's Already Built (Don't Recreate)

- Full CLI with `nexus init`, `nexus adopt`, `nexus upgrade`, `nexus repair` commands
- Interactive prompt system (7 modules including persona)
- Generator engine (8 modules including landing page + ai-config)
- Reconcile system for upgrade/repair (smart file strategy + corruption detection)
- Progressive knowledge system (`.nexus/docs/knowledge.md`)
- Agent Persona system (tone, verbosity, identity, custom directive)
- Type system (4 modules)
- Utility layer (7 modules including project-detector, readFile, fileExists)
- 190 unit tests (all passing)
- AI config generation (`.nexus/ai/` + root pointer files + onboarding protocol)
- Centralized `.nexus/` folder (docs, AI config, manifest, knowledge base)
- GitHub Actions CI/CD with auto-publish to npm, commitlint, CODEOWNERS, PR/issue templates

## Knowledge Base Protocol

The knowledge base (`.nexus/docs/knowledge.md`) is the project's long-term memory.

- **Before every task:** Scan headings for entries relevant to your work
- **After completing work:** Append an entry if you discovered something non-obvious
- **Format:** `## [YYYY-MM-DD] category — title` + description (1-3 sentences)
- **Categories:** `architecture`, `bug-fix`, `pattern`, `package`, `performance`, `convention`, `gotcha`
- **NEVER delete entries** — it is append-only

## Current Priorities

Check `.nexus/docs/index.md` → "What's Next" section for the latest priorities.
