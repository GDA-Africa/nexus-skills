# NEXUS CLI — Project Index

**Project:** NEXUS CLI (`@nexus-framework/cli`)  
**Status:** 🟢 LIVE ON NPM — v0.2.0 | 🔵 v0.3.0 SKILLS SYSTEM IN DESIGN  
**Last Updated:** March 6, 2026  
**Version:** 0.2.0 (next: 0.3.0)  
**Coverage:** Unit: 190/190 passing | Integration: Pending | E2E: Pending

---

## 🎯 Current Objective

**Phase 1–6:** ✅ COMPLETE  
**Phase 7: Polish & Distribution** — 🟡 IN PROGRESS (published, iterating)  
**Phase 8: Skills System** — 🔵 DESIGN COMPLETE — Implementation begins in `nexus-skills` repo  
**Next Focus:** Create `nexus-skills` repo → publish `@nexus-framework/skills@0.1.0` → implement `skills.generator.ts` → update `ai-config.ts`  
**Blocked:** `nexus-skills` npm package must be published before `skills.generator.ts` can source skill content

---

## 📊 Project Status Matrix

| Phase | Status | Notes |
|-------|--------|-------|
| 📝 Documentation | ✅ Complete | Vision, implementation, README, contributing guide |
| 🏗️ Phase 1: Core Infrastructure | ✅ Complete | CLI entry point, Commander.js, bin executable |
| 🎨 Phase 2: Prompts & Templates | ✅ Complete | 7 interactive prompt modules (including persona) |
| 📚 Phase 3: Documentation System | ✅ Complete | 8-file doc generator + brain + knowledge system |
| 🧪 Phase 4: Testing & CI/CD | ✅ Complete | 190 unit tests, GitHub Actions CI/CD on Node 20/22, auto-publish to npm |
| 🔮 Phase 5: Landing Pages | ✅ Complete | Branded pages for all 6 frameworks + favicon |
| 🛡️ Phase 6: Repo Governance | ✅ Complete | CODEOWNERS, PR template, issue templates, commitlint |
| ✨ Phase 7: Polish & Distribution | 🟡 75% | Published to npm, upgrade/repair built, persona system shipped, E2E tests remaining |
| 🧠 Phase 8: Skills System | 🔵 Designed | Full spec in `SKILL_SYSTEM.md` — implementation starts with `nexus-skills` repo |

---

## 📁 What Has Been Built

### CLI Commands

| Command | File | Description |
|---------|------|-------------|
| `nexus init [name]` | `src/commands/init.ts` | Scaffold a new project from scratch with interactive prompts |
| `nexus adopt [path]` | `src/commands/adopt.ts` | Add `.nexus/` docs + AI config to an existing project |
| `nexus upgrade [path]` | `src/commands/upgrade.ts` | Regenerate `.nexus/` with latest templates (smart file strategy) |
| `nexus repair [path]` | `src/commands/repair.ts` | Fix missing/corrupted `.nexus/` files without replacing valid ones |

### Source Modules (src/)

| Module | Files | Description |
|--------|-------|-------------|
| **Entry Points** | `cli.ts`, `index.ts`, `version.ts` | Commander.js CLI, public API, version 0.2.0 |
| **Commands** | `commands/init.ts`, `adopt.ts`, `upgrade.ts`, `repair.ts` | 4 CLI commands |
| **Prompts** | `prompts/index.ts` + 6 modules | Project type, data strategy, patterns, frameworks, features, persona |
| **Generators** | `generators/index.ts` + 7 modules | Structure, docs, config, tests, CI/CD, landing page, AI config |
| **Types** | `types/config.ts` + 3 modules | NexusConfig, NexusManifest, NexusPersona, GeneratedFile, TemplateContext |
| **Utils** | `utils/index.ts` + 6 modules | Logger, validator, package-manager, git, file-system, project-detector |

### Generator Modules (src/generators/)

| File | What It Generates |
|------|-------------------|
| `structure.ts` | Directories, package.json, .gitignore, README |
| `docs.ts` | 8 NEXUS docs + index.md brain + knowledge.md + .nexus/index.md + manifest.json |
| `config.ts` | tsconfig.json, .eslintrc.cjs, .prettierrc, .editorconfig |
| `tests.ts` | vitest.config.ts, example unit test, test helpers |
| `ci-cd.ts` | .github/workflows/ci.yml |
| `landing-page.ts` | Framework-specific homepage + nexus-logo.svg + favicon.svg |
| `ai-config.ts` | `.nexus/ai/instructions.md` + root pointer files + onboarding protocol |
| `index.ts` | Orchestrator: generateProject(), adoptProject(), upgradeProject(), repairProject() |
| `skills.ts` ⬅ **NEW v0.3.0** | `.nexus/skills/` — core + custom dirs, README index, framework-matched skill files |

### Prompt Modules (src/prompts/)

| File | What It Asks |
|------|--------------|
| `index.ts` | Orchestrates full prompt flow |
| `project-type.ts` | Project type selection |
| `frameworks.ts` | Framework selection |
| `features.ts` | Feature selection |
| `patterns.ts` | App pattern selection |
| `data-strategy.ts` | Data strategy selection |
| `persona.ts` | Agent persona configuration (tone, verbosity, identity) |
| `skill-config.ts` ⬅ **NEW v0.3.0** | Enable skills? Install framework skills? |

### CLI Commands

| Command | File | Description |
|---------|------|-------------|
| `nexus init [name]` | `src/commands/init.ts` | Scaffold a new project from scratch with interactive prompts |
| `nexus adopt [path]` | `src/commands/adopt.ts` | Add `.nexus/` docs + AI config to an existing project |
| `nexus upgrade [path]` | `src/commands/upgrade.ts` | Regenerate `.nexus/` with latest templates (smart file strategy) |
| `nexus repair [path]` | `src/commands/repair.ts` | Fix missing/corrupted `.nexus/` files without replacing valid ones |
| `nexus skill <sub>` ⬅ **NEW v0.3.0** | `src/commands/skill.ts` | Manage skills: new / list / install / remove / status |

| System | Description |
|--------|-------------|
| **Smart File Strategy** | Upgrade/repair reads YAML frontmatter (`status: template` vs `populated`) to decide replace vs preserve |
| **Corruption Detection** | `isCorrupted()` detects empty files, missing frontmatter, invalid JSON |
| **Progressive Knowledge** | `knowledge.md` — append-only log AI agents scan before tasks and write to after |
| **Token-Efficient Templates** | Doc templates slimmed ~40%, tool files ~60 lines (not 150) |
| **Pattern-Aware Docs** | Business logic doc includes conditional sections based on selected app patterns |
| **Agent Persona** | Configurable AI agent personality (tone, verbosity, identity, custom directive) — embedded in all instruction files |
| **Skills System** ⬅ **NEW v0.3.0** | `.nexus/skills/` — pre-read instruction files telling agents *how* to execute tasks in this project. Sourced from `@nexus-framework/skills`. Three dirs: `core/` (framework-matched, replaceable on upgrade), `custom/` (user-created, **sacred — never touched**), `community/` (installed via `nexus skill install`). Skills Protocol embedded in all AI instruction files. Precedence: custom > core > community. |

### Skills System — `.nexus/skills/` Directory Layout

```
.nexus/skills/
  README.md            ← agent-readable index of all installed skills (auto-generated)
  core/                ← generated at init, regenerated on upgrade — framework-matched
  custom/              ← user-created via `nexus skill new`, NEVER touched by NEXUS
    README.md          ← placeholder with instructions on creating custom skills
  community/           ← installed via `nexus skill install <pkg>`, reinstallable
```

### Tests

| File | Count | Covers |
|------|-------|--------|
| `tests/unit/validator.test.ts` | 29 | Name validation, sanitization, empty input |
| `tests/unit/generators.test.ts` | 95 | Structure, packages, landing pages, AI config, docs, knowledge, patterns, persona |
| `tests/unit/adopt.test.ts` | 28 | Project detection, frontmatter, AI onboarding |
| `tests/unit/upgrade.test.ts` | 38 | isPopulated, isCorrupted, upgrade strategy, repair mode |
| `tests/unit/skills.test.ts` ⬅ **NEW v0.3.0** | TBD | skills.generator, skill.command, skill-config.prompt, upgrade skills logic |
| **Total** | **190** | **All passing ✅** |

---

## 🗺️ Document Map

| Document | Purpose |
|----------|---------|
| `.nexus/docs/index.md` | **THIS FILE** — project brain, status, module map |
| `.nexus/docs/01_vision.md` | Product vision, user stories, success metrics |
| `.nexus/docs/07_implementation.md` | Technical architecture, build phases, file-by-file plan |
| `.nexus/docs/knowledge.md` | Progressive knowledge base — decisions, gotchas, patterns |
| `.nexus/ai/instructions.md` | Master AI agent instructions |
| `.github/copilot-instructions.md` | GitHub Copilot-specific pointer (embeds key rules) |
| `AGENTS.md` | Claude/Codex pointer to `.nexus/ai/instructions.md` |
| `CONTRIBUTING.md` | Contributor standards, PR process |
| `README.md` | Public-facing project overview |
| `SKILL_SYSTEM.md` ⬅ **NEW** | Full Skills System feature spec — read before implementing Phase 8 |
| `SKILLS_CHAT.md` ⬅ **NEW** | Architecture chat — delivery map, phased plan, key insights |

---

## 🔄 Release History

| Version | Date | Highlights |
|---------|------|------------|
| 0.1.0 | Feb 7, 2026 | Initial release: init, adopt, 5 frameworks, AI config, 73 tests |
| 0.1.1 | Feb 8, 2026 | Bug fixes, test improvements |
| 0.1.2 | Feb 8, 2026 | Sample project generation, README updates |
| 0.1.3 | Feb 8, 2026 | Knowledge system, upgrade/repair commands, token optimization, 179 tests |
| 0.1.4 | Feb 9, 2026 | Full AI instructions in all tool files, CD pipeline with auto-publish |
| 0.2.0 | Feb 9, 2026 | Agent Persona system, Knowledge Base Protocol in shipped instructions, README rewrite — NEXUS is now an AI-native development framework |
| **0.3.0** | **TBD** | **Skills System — `@nexus-framework/skills`, `nexus skill` command, skills generator, skills protocol in all AI files** |

---

## ⏭️ What's Next

### 🔵 Phase 8: Skills System (v0.3.0) — IMPLEMENTATION ORDER

> Full spec in `SKILL_SYSTEM.md`. Full delivery map in `SKILLS_CHAT.md`. Follow this exact sequence:

| Step | Task | Repo | Status |
|------|------|------|--------|
| 1 | Create `nexus-skills` repo (`github.com/GDA-Africa/nexus-skills`) | nexus-skills (new) | ⬜ |
| 2 | Write `SKILL_SPEC.md` — canonical skill frontmatter + section standard | nexus-skills | ⬜ |
| 3 | Write core skill content for all 6 frameworks (5 skills each minimum) | nexus-skills | ⬜ |
| 4 | Publish `@nexus-framework/skills@0.1.0` to npm | nexus-skills | ⬜ |
| 5 | Write `src/generators/skills.ts` in nexus-cli | nexus-cli | ⬜ |
| 6 | Update `src/generators/ai-config.ts` — add Skills Protocol section | nexus-cli | ⬜ |
| 7 | Write `src/commands/skill.ts` (`new / list / install / remove / status`) | nexus-cli | ⬜ |
| 8 | Update `src/generators/index.ts` — wire skills.generator into orchestrator | nexus-cli | ⬜ |
| 9 | Update `src/commands/upgrade.ts` / `repair.ts` — skills preserve logic | nexus-cli | ⬜ |
| 10 | Update `src/commands/adopt.ts` — skills step in adopt flow | nexus-cli | ⬜ |
| 11 | Write `src/prompts/skill-config.ts` — enable skills prompt | nexus-cli | ⬜ |
| 12 | Write unit tests in `tests/unit/skills.test.ts` | nexus-cli | ⬜ |
| 13 | Update `README.md` — document skills system | nexus-cli | ⬜ |
| 14 | Bump to v0.3.0, publish | nexus-cli | ⬜ |

### Key Constraints for Phase 8
- Step 4 (npm publish) must complete before Step 5 can source skill content from the package
- `custom/` skill files must **NEVER** be touched by NEXUS — this is the sacred rule of the system
- All 190 existing tests must continue passing — skills are additive, not replacing
- Skills generator follows the same `GeneratedFile[]` return pattern as all other generators

### Immediate (v0.3.x — after Skills MVP)
- [ ] E2E tests — generate a project, run its build, verify all files
- [ ] Framework-specific template content (not just landing pages)
- [ ] `nexus add <feature>` command for incremental additions
- [ ] `nexus skill status` — check core/community skills against package versions
- [ ] Strategy pattern generators (PWA service workers, i18n setup, theming engine)

### Near-term
- [ ] `nexus skill generate` (v0.4.0) — scan codebase, auto-draft custom skills from patterns
- [ ] `@nexus-framework/skills-integrations` — Supabase, Stripe, Prisma skill packs
- [ ] Plugin system for custom generators
- [ ] Template marketplace / community templates
- [ ] Web-based project configurator
- [ ] Persona presets — share your persona config as a shareable JSON

### Backlog
- [ ] `nexus eject` — remove NEXUS, keep code
- [ ] `nexus validate` — check project against NEXUS standards
- [ ] `nexus migrate` — migrate from CRA, etc.
- [ ] GitLab CI, Bitbucket Pipelines templates
- [ ] Pro tier features (paid AI-powered code generation)