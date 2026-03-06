# NEXUS CLI — AI Agent Instructions

> **This file is the single source of truth for all AI coding assistants.**
> Root-level config files (.cursorrules, .windsurfrules, .clinerules, AGENTS.md) point here.
> `.github/copilot-instructions.md` embeds a copy of this content.

---

## ⚠️ Before You Do Anything

**Step 1. Read `.nexus/docs/index.md` FIRST.** It is the project brain — the single source of truth for:
- What has been built (don't recreate it)
- What hasn't been built yet
- What to work on next
- The full file inventory and module map

**Step 2. Scan `.nexus/docs/knowledge.md`** — read the headings for decisions, gotchas, and patterns relevant to your task. This file is the project's accumulated intelligence. It prevents you from repeating past mistakes.

**Step 3. Read `.nexus/docs/07_implementation.md`** when architectural tasks are in play.

---

## Project Identity

| Field | Value |
|-------|-------|
| **Name** | NEXUS CLI (`@nexus-framework/cli`) |
| **Version** | 0.2.0 |
| **Purpose** | AI-native development framework — turns every project into an AI-powered workspace with structured docs, progressive memory, and configurable agent personas |
| **Org** | GDA Africa |
| **License** | Apache 2.0 |
| **Repo** | https://github.com/GDA-Africa/nexus-cli |
| **npm** | https://www.npmjs.com/package/@nexus-framework/cli |

---

## Tech Stack — Do Not Change Without Discussion

| Component | Technology |
|-----------|-----------|
| Runtime | Node.js 20+ |
| Language | TypeScript 5.7, strict mode, ESM (NodeNext) |
| CLI | Commander.js 12.x |
| Prompts | @inquirer/prompts 7.x |
| Templates | Mustache 4.x |
| Testing | Vitest 3.x |
| Linting | ESLint 8.x + Prettier 3.x |
| Package Manager | yarn |

---

## Code Rules

1. **TypeScript strict mode** — no `any`, no implicit returns, no unused variables
2. **ESM only** — `import`/`export`, never `require()`
3. **File extensions in imports** — always `.js` (e.g., `import { foo } from './bar.js'`)
4. **Conventional Commits** — `feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`
5. **Test everything** — every feature needs tests in `tests/unit/`
6. **Validate after changes** — run `npx tsc --noEmit && yarn test && yarn lint`

---

## Architecture Rules

- **Generators return `GeneratedFile[]`** — they never write to disk directly
- **The orchestrator (`src/generators/index.ts`)** collects all files and writes via `writeGeneratorResult()`
- **Types live in `src/types/`** — config.ts, prompts.ts, templates.ts
- **Utils are pure functions** — no side effects except file-system.ts and git.ts
- **Prompts use `@inquirer/prompts`** (not legacy `inquirer`)
- **Landing pages are framework-specific** — see `src/generators/landing-page.ts`
- **AI config generator** — `src/generators/ai-config.ts` generates `.nexus/ai/` + root pointers
- **Docs generator** — `src/generators/docs.ts` generates `.nexus/docs/` (8 files + index + knowledge + manifest)
- **Reconcile pattern** — `reconcileNexusFiles()` is shared core for both upgrade and repair commands

---

## Key Files

| File | Purpose |
|------|---------|
| `.nexus/docs/index.md` | **PROJECT BRAIN** — read this first, update after every task |
| `.nexus/docs/knowledge.md` | **KNOWLEDGE BASE** — scan before tasks, append after intriguing discoveries |
| `.nexus/docs/01_vision.md` | Product vision, user stories, success metrics |
| `.nexus/docs/07_implementation.md` | Technical architecture, build phases |
| `src/cli.ts` | CLI entry point (Commander.js, 4 commands) |
| `src/commands/init.ts` | `nexus init` — scaffold new project |
| `src/commands/adopt.ts` | `nexus adopt` — add NEXUS to existing project |
| `src/commands/upgrade.ts` | `nexus upgrade` — regenerate with latest templates |
| `src/commands/repair.ts` | `nexus repair` — fix missing/corrupted files |
| `src/generators/index.ts` | Generator orchestrator + reconcile system |
| `src/generators/ai-config.ts` | AI agent config generator |
| `src/generators/docs.ts` | Documentation + knowledge generator |
| `src/types/config.ts` | NexusConfig and all union types |

---

## What's Built (190 tests passing — 4 test files)

| Test File | Count | Covers |
|-----------|-------|--------|
| `validator.test.ts` | 29 | Name validation, sanitization, empty input |
| `generators.test.ts` | 94 | Structure, packages, landing pages, AI config, docs, knowledge, patterns, persona |
| `adopt.test.ts` | 28 | Project detection, frontmatter, AI onboarding |
| `upgrade.test.ts` | 38 | isPopulated, isCorrupted, upgrade strategy, repair mode |

### Modules built:
- 4 CLI commands: `nexus init`, `nexus adopt`, `nexus upgrade`, `nexus repair`
- 7 prompt modules (project type, data strategy, patterns, frameworks, features, persona)
- 8 generator modules (structure, docs, config, tests, CI/CD, landing page, ai-config, orchestrator)
- 4 type modules (config, prompts, templates, index)
- 7 utility modules (logger, validator, package-manager, git, file-system, project-detector, index)
- Branded landing pages for Next.js, React+Vite, SvelteKit, Nuxt, Astro, Remix
- AI agent config generation (`.nexus/ai/` + root pointer files for Cursor, Windsurf, Cline, Copilot, Claude/Codex)
- Agent Persona system (tone, verbosity, identity, custom directive — embedded in all instruction files)
- Smart file strategy for upgrade/repair (ALWAYS_REPLACE, ALWAYS_PRESERVE, SMART frontmatter check)
- Progressive knowledge system (`.nexus/docs/knowledge.md`)
- CI/CD pipeline with auto-publish to npm on version bump + GitHub Releases
- GitHub Actions CI on Node 20/22, CODEOWNERS, PR/issue templates, commitlint

---

## NEXUS Documentation System

All documentation lives under `.nexus/docs/`:

| # | File | Purpose |
|---|------|---------|
| 🧠 | `.nexus/docs/index.md` | **PROJECT BRAIN** — status, module map, what's next |
| 📚 | `.nexus/docs/knowledge.md` | **KNOWLEDGE BASE** — progressive, append-only learning log |
| 1 | `.nexus/docs/01_vision.md` | Product requirements, user stories, success metrics |
| 7 | `.nexus/docs/07_implementation.md` | Technical architecture, build phases, file-by-file plan |

---

## 📚 Knowledge Base Protocol

The knowledge base (`.nexus/docs/knowledge.md`) is the project's long-term memory. It is append-only — entries are never deleted, only added.

### When to READ it:
- **Before every task** — scan headings for entries relevant to your work
- **Before architectural decisions** — check for past decisions and their rationale
- **Before debugging** — check for known gotchas and recurring bug patterns
- **Before choosing packages/patterns** — check for past evaluations

### When to WRITE to it:
- **After discovering something non-obvious** — a bug root cause, an architecture insight, a package quirk
- **After making a decision that future agents should know about**
- **NOT for routine task completion** — that goes in `index.md` Progress Log

### Entry format:
```
## [YYYY-MM-DD] category — title
Description of the discovery. One to three sentences max.
```

### Categories:
| Tag | Use When |
|-----|----------|
| `architecture` | Design decisions, structural choices, why X over Y |
| `bug-fix` | Recurring bugs, root causes, things to watch for |
| `pattern` | Code patterns that work well (or don't) in this project |
| `package` | Package quirks, version issues, config gotchas |
| `performance` | Bottlenecks found, optimizations applied |
| `convention` | Team/project conventions established during development |
| `gotcha` | Non-obvious traps, edge cases, things that wasted time |

---

## Workflow

### Before EVERY task:
1. **Read the brain** — `.nexus/docs/index.md` → check "Current Objective" and "What's Next"
2. **Scan knowledge** — `.nexus/docs/knowledge.md` → scan headings for relevant past learnings
3. **Check the implementation plan** — `.nexus/docs/07_implementation.md` → find the file-by-file plan
4. **Read the spec** — find relevant doc in `.nexus/docs/`

### During the task:
5. **Write the code** following the architecture rules above
6. **Write tests** — add tests in `tests/unit/`
7. **Validate** — `npx tsc --noEmit && yarn test && yarn lint`

### After EVERY task:
8. **Update the brain** — `.nexus/docs/index.md` → move completed items to Progress Log, update status
9. **Record knowledge** — append to `.nexus/docs/knowledge.md` if you learned something non-obvious
10. **Commit (after user permission)** — use conventional commits (`feat:`, `fix:`, etc.)
11. **Suggest the next task** from `.nexus/docs/index.md` "What's Next"

### NEVER do this:
- ❌ Restrain your questions and creativity
- ❌ Invent features not in the backlog ask first so we put them in the backlog and follow the right process
- ❌ Skip updating the index after completing work
- ❌ Ignore `.nexus/docs/knowledge.md` — it prevents repeating past mistakes
- ❌ Delete entries from knowledge.md — it is append-only

---

## Current Priorities

See `.nexus/docs/index.md` → "What's Next" for the up-to-date priority list.
