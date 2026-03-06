# NEXUS CLI — Knowledge Base

> Append-only log of discoveries, decisions, and patterns learned while building this project.
> AI agents: scan before every task, append after completing work.

---

## [2026-02-07] architecture — Generator pattern: never write to disk
Generators return `GeneratedFile[]` arrays. Only the orchestrator (`src/generators/index.ts`) calls `writeGeneratorResult()` to flush files to disk. This separation makes testing trivial — every generator test just inspects the returned array without touching the file system.

## [2026-02-07] convention — ESM import extensions are mandatory
TypeScript with `moduleResolution: "NodeNext"` requires `.js` extensions on every relative import even though source files are `.ts`. Example: `import { foo } from './bar.js'`. Forgetting the extension causes runtime "ERR_MODULE_NOT_FOUND" errors that TypeScript won't catch at compile time.

## [2026-02-07] convention — @inquirer/prompts not legacy inquirer
The project uses the modern `@inquirer/prompts` package (functional API) not the legacy `inquirer` package (class-based). Import individual functions: `import { input, select, checkbox } from '@inquirer/prompts'`. The legacy API will not work.

## [2026-02-07] architecture — Type unions as source of truth
All valid option sets (frameworks, project types, data strategies, patterns) are defined as TypeScript union types in `src/types/config.ts`. Prompts and generators import these types — never hardcode option lists in multiple places.

## [2026-02-08] architecture — YAML frontmatter as file status tracker
All generated `.nexus/docs/` files include YAML frontmatter: `status: template` (freshly generated) or `status: populated` (user has filled in content). The upgrade system reads this frontmatter to decide whether to replace or preserve a file. Smart file strategy: template → safe to overwrite, populated → preserve user work.

## [2026-02-08] architecture — Reconcile pattern for upgrade/repair
`reconcileNexusFiles(targetDir, config, mode)` is a shared core used by both `nexus upgrade` and `nexus repair`. The mode parameter (`'upgrade' | 'repair'`) controls behavior: upgrade replaces template-status files + all AI config, repair only fixes missing/corrupted files. This avoids code duplication between two very similar commands.

## [2026-02-08] architecture — File strategy categories
Three categories in the reconcile system:
1. **ALWAYS_REPLACE** — AI instructions, manifest, tool-specific files (these are generated, never user-edited)
2. **ALWAYS_PRESERVE** — knowledge.md (sacred user data, never overwrite)
3. **SMART** — Doc files checked via frontmatter status (template=replace, populated=preserve)

## [2026-02-08] gotcha — isCorrupted() detection heuristics
A file is considered corrupted if: (a) it exists but is empty/whitespace-only, (b) it's a markdown doc that's missing YAML frontmatter (`---` delimiters), (c) it's manifest.json with invalid JSON. These heuristics avoid false positives — a file with *any* valid content and proper frontmatter is considered healthy.

## [2026-02-08] architecture — Manifest recovery for upgrade
`nexus upgrade` reads `.nexus/manifest.json` to recover the original `NexusConfig` without re-prompting the user. This means manifest.json must always contain the full config used to generate the project. If manifest is missing/corrupt, upgrade fails gracefully with a message to run `nexus adopt` instead.

## [2026-02-08] pattern — Token-efficient doc templates
Doc templates were slimmed ~40% by removing verbose placeholder text and TODO items. Instead, each section has a one-line instruction comment. AI agents fill in real content; humans aren't confused by walls of placeholder text. Less tokens = faster AI processing = lower cost.

## [2026-02-08] pattern — Progressive knowledge system
The knowledge.md file is an append-only log that AI agents are instructed to: (1) scan before every task for relevant context, (2) append new entries after completing work. Categories: architecture, bug-fix, pattern, package, performance, convention, gotcha. Format: `## [date] category — title` followed by description.

## [2026-02-08] gotcha — Tool instruction files vs master instructions
Two levels of AI instructions: (a) master file at `.nexus/ai/instructions.md` (~full verbose, includes 7-step onboarding protocol), (b) tool-specific files (`.cursorrules`, `.windsurfrules`, etc.) that now embed FULL instructions — not lean pointers. Cross-file pointers were unreliable; older LLMs ignore them. Every tool file is self-contained.

## [2026-02-08] pattern — Pattern-aware business logic generation
`generateBusinessLogic()` in `src/generators/docs.ts` conditionally includes sections based on `appPatterns` selected during setup. If user chose offline-first → generates sync strategy section. If i18n → generates locale management section. Etc. This makes generated docs immediately relevant rather than generic.

## [2026-02-08] convention — Feature→backlog pipeline
Vision doc (`01_vision.md`) and implementation doc (`07_implementation.md`) include instructions for agents to log new feature ideas to a backlog section rather than implementing them immediately. This prevents scope creep during focused development sessions.

## [2026-02-08] gotcha — yarn vs npm for development
This project uses `yarn` for development (workspace package manager) but the CLI it generates uses whatever package manager the user selected during setup. Don't confuse the two — always use `yarn test`, `yarn lint`, `yarn build` when working on the CLI itself.

## [2026-02-08] package — Commander.js action handler types
Commander.js action handlers receive positional args as individual parameters, then options as the last parameter. For `command('init [project-name]')`, the handler signature is `(projectName: string | undefined, options: { adopt?: boolean })`. Getting this wrong causes silent bugs where options appear as the first arg.

## [2026-02-08] convention — Release ritual
Release process: (1) bump version in `package.json` + `src/version.ts`, (2) validate with `npx tsc --noEmit && yarn test && yarn lint`, (3) `yarn build`, (4) `npm publish --access public`, (5) `git tag vX.Y.Z && git push && git push --tags`. The version.ts file is the runtime source of truth for `nexus --version`.

## [2026-02-08] architecture — adopt vs init vs upgrade vs repair
Four commands, clear boundaries:
- `nexus init` — scaffold a new project from scratch (prompts → generators → write all files)
- `nexus adopt` — add `.nexus/` to an existing project (no scaffolding, just docs + AI config)
- `nexus upgrade` — regenerate `.nexus/` with latest templates (reads manifest for config, smart file strategy)
- `nexus repair` — fix missing/corrupted `.nexus/` files only (no replacement of valid files)

## [2026-02-08] gotcha — Vitest mocking with ESM
Vitest `vi.mock()` with ESM requires careful handling. Mock the module path with `.js` extension matching the import. Use `vi.hoisted()` for variables that need to be available in the mock factory. The mock factory runs before imports, so you can't reference imported values inside it.

## [2026-02-08] performance — Generated file arrays are cheap
A full `generateProject()` call creates ~40-50 `GeneratedFile` objects in memory. These are just `{ path, content }` pairs — pure strings. The expensive operation is the disk write, which happens once at the end. This means we can freely compose generators without worrying about performance.

## [2026-02-09] gotcha — knowledge.md path must be .nexus/docs/knowledge.md everywhere
The docs generator creates knowledge.md at `.nexus/docs/knowledge.md`, but the tool instruction files (Cursor, Windsurf, etc.) were referencing `.nexus/knowledge.md` — a path that doesn't exist. This caused AI agents in generated projects to look for the file in the wrong place. Always use `.nexus/docs/knowledge.md` in all instruction text.

## [2026-02-09] pattern — Knowledge Base Protocol must be explicit, not implied
Simply saying "append to knowledge.md" is not enough — AI agents (especially older LLMs) need the full protocol: entry format (`## [date] category — title`), all 7 category tags, when to read vs write, and the append-only rule. Without this, agents either skip it or write unstructured entries. The protocol is now a dedicated section in all shipped instruction files.

## [2026-02-09] architecture — Cognitive scaffolding for older LLMs
Shipped instructions must work with weaker models too. Design principles: (1) numbered steps instead of prose, (2) explicit paths — never rely on the agent inferring them, (3) repeat critical rules — older models lose context mid-document, (4) dedicated sections — don't bury important protocols inside workflow steps, (5) "3 Mandatory Steps" framing at the top gives even the weakest agent a clear entry point.

## [2026-02-09] gotcha — Dev instructions vs shipped instructions drift
Our own `.nexus/ai/instructions.md` and `.github/copilot-instructions.md` can drift from what `ai-config.ts` generates for users. After any change to the shipped generator, manually verify the same principles apply to our own files. The dev files are hand-written; the shipped files are code-generated — they have no automatic sync mechanism.

## [2026-02-09] architecture — Agent Persona system design
Persona is stored as `NexusPersona` on `NexusConfig` with 4 fields: `tone` (union of 5 vibes), `verbosity` (3 levels), `identity` (string — name the AI uses, defaults to "Nexus"), `customDirective` (freeform string). `DEFAULT_PERSONA` is used in `buildAdoptConfig()` so adopt never prompts for persona. The `getPersonaSection()` helper in `ai-config.ts` generates explicit LLM-friendly text for each setting — no vague instructions, always concrete behavioral guidance.

## [2026-02-09] architecture — Required field cascade on NexusConfig
Adding a required field to `NexusConfig` breaks everything that constructs one: (1) `src/prompts/index.ts` config assembly, (2) `src/generators/index.ts` `buildAdoptConfig()`, (3) every `baseConfig` in test files. When adding a new required field, touch all four locations in the same pass to avoid leaving the codebase in a broken state.

## [2026-02-09] convention — NEXUS identity evolution: scaffolding → framework
Starting v0.2.0, NEXUS is positioned as an "AI-native development framework" not just a "scaffolding tool." The scaffolding is one feature. The real value is the AI operating system: docs, knowledge, brain, persona, onboarding protocol. All public-facing text (README, package.json description, copilot instructions) should reflect this broader identity.

## [2026-02-09] architecture — Persona identity: string name not boolean
`NexusPersona.identity` was originally `boolean` ("Should the AI call itself Nexus? Y/N"). Changed to `string` so the AI introduces itself as "Nexus" and lets the user rename it to anything. Default is `'Nexus'`; an empty string means no custom identity. The name persists across `upgrade` and `repair` because `getPersonaSection()` embeds persistence language in the generated instructions. Touch points when changing a type on NexusPersona: type definition, DEFAULT_PERSONA, persona prompt, getPersonaSection(), all test baseConfigs.

## [2026-02-10] architecture — Pre-adoption interview for existing projects
Added `promptAdoption()` to gather context before running `nexus adopt` on existing projects. Collects project description, architecture type, tech stack, and pain points. This context is then passed to doc generators (`generateVision()`, `generateArchitecture()`, `generateProjectIndex()`) to pre-fill templates with actual project info instead of generic placeholders. Makes adopted projects feel AI-native from day one.

## [2026-02-10] architecture — Project detector signals for Spring Boot
Extended `ProjectSignals` with `hasPomXml` and `hasBuildGradle` to detect Maven/Gradle projects. Added Spring Boot detection logic: looks for `pom.xml` with `spring-boot-starter` or `build.gradle` with `org.springframework.boot`. This enables automatic framework detection when adopting existing Java projects.

## [2026-02-10] feature — Local-only mode with --local flag
Added `localOnly?: boolean` to `NexusConfig` and `--local` flag to `nexus init`. When enabled, the CLI skips creating git/CI files and appends `.nexus/` to `.gitignore`. Use case: experimenting with NEXUS structure without committing it to version control. The `writeGeneratorResult()` utility now skips writing files with empty content, which Spring Boot generator uses to avoid creating `package.json` for Maven projects.

## [2026-02-10] architecture — Visual CLI upgrades with gradient-string and boxen
Replaced plain text CLI output with gradient-string (cyan→blue→purple gradient for banner) and boxen (rounded border success messages). The `banner()` function now uses `nexusGradient()`, and `complete()`/`adoptComplete()` wrap output in boxen with padding. Makes the CLI feel more polished and modern while staying minimal.

## [2026-02-10] architecture — Spring Boot project generator
Created `src/generators/spring-boot.ts` with full Maven project generator: `pom.xml` (Spring Boot 3.2.0, Java 21), `application.properties`, `@SpringBootApplication` main class, sample REST controller (`/api/hello`, `/api/health`), and JUnit 5 test. The generator integrates with `generateDirectories()` to create proper Java package structure (`src/main/java/com/{packageName}/...`).

## [2026-02-10] architecture — Backend framework selection for API projects
Added `promptBackendFramework()` to prompt users building API projects for their backend framework choice (Express, Fastify, NestJS, Spring Boot). Also added `BackendFramework` type to `NexusConfig`. The prompts orchestrator now calls this for `projectType === 'api'`. This makes NEXUS framework-agnostic — works for Node.js and Java backends.

## [2026-02-10] architecture — UI library project type with Storybook
Added `'ui-library'` to `ProjectType` union for component library projects. When selected, `generateDirectories()` creates a Storybook-ready structure (components, stories, tests), and `getFrameworkDependencies()` adds Storybook 8.0 deps. UI library projects skip data strategy and pattern prompts since they're not full apps. Framework options include React, Vue, Svelte, Lit.

## [2026-02-10] convention — Feature branch workflow for organized PRs
When preparing multiple related changes for release, create separate feature branches from `develop` for each logical area (e.g., `feature/adoption-interview`, `feature/local-only-mode`, `feature/spring-boot-support`). Each branch gets focused commits with conventional commit messages. This makes PRs easier to review and allows independent merging if one feature needs more work.

## [2026-02-10] gotcha — Spring Boot needs empty package.json return
Spring Boot projects use Maven, not npm. The `generatePackageJson()` function now checks if `backendFramework === 'spring-boot'` and returns empty content. The `writeGeneratorResult()` utility was enhanced to skip writing files with empty content, preventing creation of unnecessary `package.json` in Java projects.

## [2026-02-10] pattern — Commit organization by feature area
When working with multiple simultaneous changes across many files, organize commits by feature area rather than by file type. For example, "feat: add Spring Boot generator" (spring-boot.ts), then "feat: add backend framework selection" (prompts), then "feat: add directory structure for Spring Boot" (structure.ts). This makes git history tell a story instead of being a jumble of unrelated changes.

---

## [2026-03-06] architecture — Skills System: the third knowledge layer
The Skills System (v0.3.0) adds a third layer to NEXUS's knowledge model. Layer 1: Project context docs (`01_vision.md` → `08_deployment.md`) answer *what are we building?*. Layer 2: State files (`index.md`, `knowledge.md`) answer *what has been decided?*. Layer 3: Skills (`.nexus/skills/`) answer *how do we execute tasks in this project?*. All three layers are needed — context and decisions without execution methodology still leads to agent drift.

## [2026-03-06] architecture — Skills live in the project, not as a runtime dependency
`@nexus-framework/skills` is the source registry, but skill files are *copied into* the project's `.nexus/skills/` directory at init time. The project does not depend on the package at runtime. This mirrors how NEXUS docs work — generated once, then owned by the project. This means skills work offline and can be customized in-place.

## [2026-03-06] architecture — Three-directory skill layout with sacred custom/
`.nexus/skills/` has three subdirectories with strict ownership rules: `core/` is owned by NEXUS (replaced on upgrade, sourced from `@nexus-framework/skills`). `custom/` is owned by the user (NEVER read, NEVER written, NEVER deleted by NEXUS — ever). `community/` is owned by the package registry (replaceable on `nexus skill install --force`). Breaking the `custom/` rule would destroy user work irreversibly.

## [2026-03-06] architecture — Skills Protocol must be embedded in all AI instruction files
The Skills Protocol (the 7-step agent pre-task checklist for `.nexus/skills/`) must be added to the master template in `ai-config.ts`. Because every AI tool file (`.cursorrules`, `.windsurfrules`, `.clinerules`, `AGENTS.md`, `copilot-instructions.md`) embeds the master instructions, adding it once to the template activates skills awareness across every AI tool simultaneously. This is the highest-leverage single change in the entire v0.3.0 implementation.

## [2026-03-06] convention — Skill frontmatter is the contract, not decoration
Every skill file requires YAML frontmatter with: `skill` (unique slug), `version` (semver), `framework` (`next.js` | `react-vite` | `sveltekit` | `nuxt` | `astro` | `remix` | `shared`), `category` (`ui` | `routing` | `data` | `testing` | `api` | `config` | `workflow`), `triggers` (array of natural language phrases), `author`, `status` (`active` | `draft` | `deprecated`). The `triggers` array is how agents identify which skill to read — without it, the matching protocol breaks. The `status` field controls enforcement: only `active` skills are mandatory; `draft` are optional guidance.

## [2026-03-06] pattern — Skills generator follows the same GeneratedFile[] pattern
`skills.generator.ts` must return `GeneratedFile[]` like every other generator — it must not write to disk directly. The orchestrator in `generators/index.ts` handles all disk writes via `writeGeneratorResult()`. This maintains the architecture invariant and keeps the generator fully unit-testable by inspecting returned arrays without touching the file system.

## [2026-03-06] architecture — `nexus-skills` repo must be published before nexus-cli implementation
`skills.generator.ts` sources skill file content from `@nexus-framework/skills`. The npm package must exist and be published before any code in nexus-cli can import from it. Implementation sequence: create `nexus-skills` repo → write SKILL_SPEC.md → write core skills for all 6 frameworks → publish `@nexus-framework/skills@0.1.0` → then and only then begin work in nexus-cli.

## [2026-03-06] pattern — Skill precedence rule: custom > core > community
When an agent is looking for a skill and finds matches in multiple directories, custom skills override core skills, and core skills override community skills. This ensures user customizations always take precedence over framework defaults, and official framework skills take precedence over third-party community skills. This rule must be stated explicitly in the Skills Protocol embedded in AI instruction files.

## [2026-03-06] architecture — nexus skill generate is v0.4.0, not v0.3.0
`nexus skill generate` (scan codebase, auto-draft custom skills) is the most complex feature in the Skills System and is intentionally deferred to v0.4.0. The v0.3.0 MVP delivers skill distribution (`skills.generator.ts`), the CLI management commands (`nexus skill new/list/install/remove`), and the AI protocol injection. `skill generate` requires AST-level pattern analysis and is out of scope until the base system is stable.
