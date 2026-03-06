Let me dig into the actual codebase first before making concrete recommendations.I have enough from the README to work with — I can see the full architecture. Let me give you a thorough, systematic implementation plan grounded in what actually exists in the codebase.

---

## Yes — `@nexus-framework/skills` is the right call

It's a separate npm package for several important reasons. Skills are **consumed by projects**, not by the CLI itself. A project might want to install `@nexus-framework/skills` directly without reinstalling the CLI. The registry stays independently versioned and community-contributable. And the namespace is already yours — protect it.

---

## The Two Repositories You'll Need

```
@nexus-framework/cli     → github.com/GDA-Africa/nexus-cli     (exists)
@nexus-framework/skills  → github.com/GDA-Africa/nexus-skills  (new repo)
```

---

## Phase 1 — The Skill Format Standard (Do This First)

Before writing any code, lock down the skill file spec. Everything else depends on it.

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
Read before creating any new React component in this project.

## Steps
1. ...
2. ...

## Patterns We Use
...

## Anti-Patterns — Never Do This
...

## Example
...
```

The `triggers` array is critical — it's how agents know *when* to reach for a skill, and it's how the CLI's future `skill generate` command will match tasks to skills.

---

## Phase 2 — `nexus-skills` Repository Structure

```
nexus-skills/
  packages/
    core/                        ← @nexus-framework/skills (the base package)
      next.js/
        component-creation.md
        routing.md
        api-routes.md
        data-fetching.md
        testing.md
      react-vite/
        ...
      sveltekit/
        ...
      nuxt/
        ...
      astro/
        ...
      remix/
        ...
      shared/                    ← framework-agnostic
        git-workflow.md
        code-review.md
        debugging.md
    integrations/                ← @nexus-framework/skills-integrations (future)
      supabase.md
      stripe.md
      prisma.md
  SKILL_SPEC.md                  ← the canonical skill format standard
  package.json
```

Published as a single `@nexus-framework/skills` package. The user installs it and gets all core framework skills. Integration skills come later as a separate package or sub-path.

---

## Phase 3 — Changes to `nexus-cli` (Systematic, File by File)

Based on the existing architecture (8 generator modules + 7 prompt modules + 4 commands), here's exactly what changes and what's new:

### 3a. New Prompt Module — `skill-config.prompt.ts`

Added to the existing prompt pipeline alongside the persona prompt. Asks two questions:

```
? Enable NEXUS Skills System?  › Yes
? Install community skills for your framework? › Yes / No / Choose later
```

That's it for prompts. Skills are opt-in but default yes.

### 3b. New Generator Module — `skills.generator.ts`

Added as the 9th generator module, called by the orchestrator after `ai-config.generator.ts`. Responsibilities:

```typescript
// What it does:
// 1. Creates .nexus/skills/core/ and copies framework-matched skills from @nexus-framework/skills
// 2. Creates .nexus/skills/custom/ with a README placeholder
// 3. Creates .nexus/skills/README.md explaining the system
// 4. Returns the skill manifest for the AI config generator to consume
```

### 3c. Update `ai-config.generator.ts`

This is the most important change. The master AI instruction file (`.nexus/ai/`) needs one new section — the skills protocol:

```markdown
## Skills Protocol

Before performing any task, check `.nexus/skills/` for a relevant skill:
1. Look in `.nexus/skills/core/` for framework-specific skills
2. Look in `.nexus/skills/custom/` for project-specific skills
3. If a skill's `triggers` match your current task, read it fully before proceeding
4. After completing a task using a skill, note any deviations in `knowledge.md`

Available skills: [dynamically listed from manifest]
```

This single addition makes skills work across **every** AI tool simultaneously — because every tool rule file embeds the master AI config.

### 3d. Update `upgrade.generator.ts`

Add preserve-or-replace logic for skills — identical to what already exists for docs:

- `core/` skills: replaceable on upgrade (framework-generated)
- `custom/` skills: **never touched** (user-created)
- `community/` skills: replaceable if source package updates

### 3e. New Command — `nexus skill`

```typescript
// src/commands/skill.command.ts

nexus skill new <name>      // scaffold a custom skill interactively
nexus skill list            // list all skills in .nexus/skills/ with status
nexus skill install <pkg>   // install from @nexus-framework/skills or community
nexus skill remove <name>   // remove a community skill (never removes custom)
nexus skill status          // check for outdated core/community skills
```

### 3f. Update `repair.command.ts`

Skills can go corrupt too. Extend the existing repair logic:

- Detect missing `core/` skills and regenerate from package
- Detect skills with broken frontmatter
- Never repair `custom/` — flag it to the user instead

---

## Phase 4 — The `nexus adopt` Flow

When a user runs `nexus adopt` on an existing codebase, skills deserve a special path:

```
nexus adopt
→ [existing flow] add .nexus/docs/, .nexus/ai/, tool configs
→ [NEW] "Would you like to add NEXUS Skills?" 
  → Yes → detect framework → install matching core skills → done
  → "Scan codebase for patterns?" (future: auto-generate custom skills)
```

---

## Phase 5 — The `nexus skill generate` Command (v0.4.0 scope)

This is the crown jewel — deferred to the next version because it's the most complex. It scans the codebase, identifies repeated patterns, and drafts skill files. The flow:

```
nexus skill generate
→ Scan src/ for repeated file structures
→ Identify naming conventions, import patterns, component shapes
→ Draft .nexus/skills/custom/<detected-pattern>.md for each
→ Mark all as status: draft
→ Prompt: "Review generated skills and set status: active when ready"
```

---

## The Full Delivery Map

| Version | Deliverable |
|---------|-------------|
| **Now** | Create `nexus-skills` repo, publish `@nexus-framework/skills` with core skills for all 6 frameworks |
| **v0.3.0** | `skills.generator.ts`, `skill.command.ts` (new/list/install/remove), update ai-config + upgrade + repair |
| **v0.3.x** | `nexus adopt` skill integration, `nexus skill status` |
| **v0.4.0** | `nexus skill generate` (AI-powered codebase scanning) |
| **v0.5.0** | Community registry, `@nexus-framework/skills-integrations` |

---

## The Key Insight for Prioritization

The **highest leverage change** in the entire plan is just 3 files:

1. `@nexus-framework/skills` published with core skill content
2. `skills.generator.ts` that installs the right ones per framework
3. One paragraph added to `ai-config.generator.ts`

That's the MVP. Every AI tool that reads NEXUS instructions immediately gains skills awareness. The CLI commands (`nexus skill new`, etc.) are important but additive — the core value is unlocked the moment skills land in `.nexus/` and the master AI config tells agents to read them.

Want me to draft the actual code for any of these modules, or start with the `SKILL_SPEC.md` format document?