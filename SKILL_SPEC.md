# SKILL_SPEC.md — The NEXUS Skill Format Standard

**Version:** 2.0.0  
**Status:** Canonical — All skills in this registry and in user projects must conform to this spec.  
**Maintained by:** GDA Africa  

> **New in v2.0.0 — the invocation axis.** Skills now split on *who may invoke
> them* (`invocation: model | user`), gain a `procedure` category for skills that
> are a discipline the agent **runs** rather than a reference it **reads**, and
> may declare themselves a `gate` on a class of work. See §6 for the composition
> invariant. **Every v1 skill remains valid** — `invocation` defaults to `model`
> — so nothing already in the registry needs to change. Migration: §13.

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

They are plain markdown. Any AI tool that can read a file can use a skill. The NEXUS CLI handles distributing them; the format is tool-agnostic by design.

### Two kinds of skill

| Kind | Answers | Category | Output |
|------|---------|----------|--------|
| **Reference** | "How do we do this *here*?" | `ui` `routing` `data` `testing` `api` `config` `workflow` | a file, written the project's way |
| **Procedure** | "What discipline do I run *now*?" | `procedure` | a changed state of understanding |

Reference skills are the original NEXUS skill: consulted before an artifact is
produced. Procedure skills are new in v2 — an interview, a diagnosis loop, a
review pass, a handoff. They have a start, an end, and a completion criterion
instead of an example.

The distinction is not cosmetic. A reference skill can be skimmed and partially
applied with no harm. A procedure skill that is half-run has not been run.

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
invocation: model
triggers:
  - "new component"
  - "add a component"
  - "build a UI element"
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
| Allowed values | `ui` · `routing` · `data` · `testing` · `api` · `config` · `workflow` · `procedure` · `integration` |

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
| `procedure` | **v2** — disciplines the agent runs: interviews, diagnosis loops, review passes, handoffs |
| `integration` | **v2** — wiring a specific third-party service into this project (a map provider, a payments SDK, an auth vendor) |

`procedure` changes which body sections are required: it takes
`## Completion Criteria` in place of `## Example`. See §4.

> **`workflow` vs `procedure`.** If the skill describes *how this project does
> a recurring thing* and can be usefully skimmed, it is `workflow`. If it is a
> sequence the agent executes to completion, and stopping halfway means it did
> not happen, it is `procedure`.

> **`integration` is not one category per vendor.** It is the category for
> skills whose subject is a named external service. `mapbox-integration` sits
> here; a `maps` category would not — that road ends with an enum that has one
> value per dependency and therefore means nothing.

---

#### `invocation`

| Attribute | Value |
|-----------|-------|
| Type | `string` |
| Allowed values | `model` · `user` |
| Default | `model` (when the field is absent) |

**New in v2.** Declares **who may invoke this skill**.

| Value | Reachable by | Write the description for | Typical role |
|-------|--------------|---------------------------|--------------|
| `model` | the agent **or** the human | the model — keep rich trigger phrasing so auto-invocation fires | reusable discipline |
| `user` | the human only | a human browsing a command list — drop the trigger phrasing | orchestration |

The test for `model`: *could the agent usefully reach for this on its own?*
Reuse is the reason to extract a skill, not the test for this field.

A `user` skill is one the human must consciously start — it drives a whole
session, asks for judgement, or produces something the human has to accept.
Making it `user` is what keeps it from firing in the middle of unrelated work.

```yaml
invocation: model   # grilling, tdd, code-review — the agent may reach for these
invocation: user    # a session-driving orchestrator the human starts deliberately
```

See §6 for what each may invoke.

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
- **Keep them short.** One distinct case per trigger, two to four words. A long
  descriptive phrase is a trigger that will not fire — see §7
- One trigger per distinct case. Synonyms that rename a single case are one
  case written twice; collapse them
- Aim for 3–6 triggers per skill

**Good triggers:**
```yaml
triggers:
  - "new component"
  - "add a component"
  - "build a UI element"
  - "page component"
```

**Weak triggers** — valid, but they will not match in practice:
```yaml
triggers:
  - "creating a reusable React component"   # too long to ever be contained
  - "when the user wants a new UI element"  # prose, not a task phrase
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
| `gate` | `object` | **v2** — declares this skill a precondition for a class of work (see below) |

**Example with optional fields:**
```yaml
---
skill: server-actions
version: 1.1.0
framework: next.js
category: api
invocation: model
triggers:
  - "server action"
  - "form submission"
  - "mutate data"
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

#### `gate` (v2)

A gate skill is one the brain will **require** before a class of work proceeds,
rather than merely offering when a trigger matches.

```yaml
gate:
  plan_types:            # plan types this skill gates
    - feature
    - refactor
    - spike
  record: "## Grilling"  # the plan section that proves it ran
```

| Key | Type | Meaning |
|-----|------|---------|
| `plan_types` | `string[]` | Plan types (`feature` `bug` `refactor` `spike` `chore`) that require this skill |
| `record` | `string` | The plan section whose presence satisfies the gate |

Rules:

- **Only `invocation: model` skills may declare `gate`.** A gate is injected by
  the brain, and by §6 nothing but the human may invoke a `user` skill.
- **The gate keys off plan type, never off task wording.** A classifier reading
  the agent's own prose is gameable by the agent it is meant to catch — the same
  defect D11 v1 shipped with. Plan type is a structural fact.
- **The `record` must be a durable artifact**, not a claim in conversation.
  Presence of the section is what `nexus doctor` checks.

A gated skill is admitted to the context pack **regardless of trigger match**,
so its `triggers` matter for discovery but not for enforcement.

---

## 4. Body Section Reference

The markdown body must contain these sections in this order. All sections are **required** unless marked optional.

**Required sections differ by category:**

| Section | Reference skills | `procedure` skills |
|---------|------------------|--------------------|
| `# Skill: [Title]` | required | required |
| `## When to Read This` | required | required |
| `## Context` | required | required |
| `## Steps` | required | required |
| `## Patterns We Use` | required | required |
| `## Anti-Patterns — Never Do This` | required | required |
| `## Example` | **required** | optional |
| `## Completion Criteria` | — | **required** |
| `## Validation` | optional | optional |
| `## Notes` | optional | optional |

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

### `## Completion Criteria` (required for `procedure`)

**New in v2.** The checkable condition that ends the procedure. Required for
`procedure` skills, where it replaces `## Example`.

Two properties make a criterion work:

- **Clarity** — can the agent tell done from not-done? A vague bound
  ("understanding reached") invites the agent to declare itself finished early,
  with attention already sliding to the work it can see waiting after this step.
  A sharp bound is the resistance to that pull.
- **Demand** — how much it requires. "Every branch decided or recorded out of
  scope" forces real work where "ask some questions" does not.

State the not-done cases too. They are cheaper to recognise than the done case.

```markdown
## Completion Criteria
Done when every branch mapped in step 3 is either decided or explicitly
recorded as out of scope, and the human has confirmed the one-sentence
restatement of the ask.

Not done when: any branch is still "we'll figure that out later", the
acceptance criteria could be read two ways, or you could not explain to a
fresh agent why a rejected alternative was rejected.
```

---

### `## Validation` (optional)

How a human or the CLI can confirm the skill was followed. Prefer observable
facts — a file exists, a command exits clean, a doctor check passes.

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
invocation: model
triggers:
  - "new component"
  - "add a component"
  - "page component"
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

## 6. Composition and the Invocation Invariant

**New in v2.** Skills may now invoke other skills. One rule keeps that safe:

> A `user` skill may invoke `model` skills.
> A `model` skill may invoke `model` skills.
> **Nothing may invoke a `user` skill except the human.**

The call graph is therefore a DAG rooted at the human. Without the invariant,
orchestrators recurse into each other and a single task drags three separate
disciplines into one context.

### How to express a dependency

Name the skill as an instruction to invoke it, not as a file path:

```markdown
Invoke the `grilling` skill before drafting the plan.
```

Not `../grilling/SKILL.md`, and not a bare `/grilling` — a path makes the
skill's location part of its contract, and a bare slash-name assumes one
harness's command syntax. NEXUS skills are consumed by Claude Code, Codex,
Cursor, Cline, Windsurf and the `nexus-brain` MCP server; the reference has to
survive all of them.

One skill per instruction. A step needing two is two instructions.

### When the prerequisite is `user`-invoked

A `user` skill cannot be invoked by anything. Write the dependency as an
instruction for the human:

```markdown
If no project configuration exists, tell the user to run `nexus init` first.
```

### Reading versus invoking

Consulting a reference skill for vocabulary is not invocation — it is a read,
and a one-line pointer covers it. Reserve invocation language for a procedure
the agent must actually run to completion.

---

## 7. Trigger Matching

Triggers are **semantic in intent, substring in implementation.** Write them
knowing both.

### What the implementation does today

`nexus_get_context` matches with:

```ts
input.task.toLowerCase().includes(trigger.toLowerCase())
```

The **task** must contain the **trigger** as a substring. Three consequences
that decide how you write triggers:

1. **Shorter triggers match more.** A four-word trigger requires those four
   words, in that order, inside the task string. A long descriptive trigger is
   effectively dead weight — it costs registry bytes and never fires.
2. **Word order matters.** `"new component"` does not match the task
   `"component that is new"`.
3. **Matched skills are admitted in list order until the context budget is
   spent**, so a skill can be crowded out by whatever sorted ahead of it. A
   skill that must always be seen should declare a `gate` rather than rely on
   triggers.

### What to write

Task-level phrases, two to four words, one per distinct case:

> "I'm going to add a new component" → `"new component"` fires
> "I need data fetching for the dashboard" → `"data fetching"` fires
> "I'm writing a test for this function" → `"writing a test"` fires

Write triggers at the **task level**, never the file level (`"component.tsx"`
is not a trigger). Never use regex or glob patterns.

> **Planned change (v1.3, S7).** Substring containment is being replaced by
> token-overlap scoring with ranked admission, which will make longer triggers
> viable and make budget pressure drop the least relevant skill rather than an
> arbitrary one. Triggers written short stay correct under both.

---

## 8. Precedence Rules

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

## 9. Skill Lifecycle

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

## 10. Validation Rules Summary

Use this as a quick checklist before submitting a skill.

### Frontmatter
- [ ] `skill` is kebab-case and unique for its framework + category
- [ ] `version` is valid semver
- [ ] `framework` is one of the allowed values or `shared`
- [ ] `category` is one of the 9 allowed values
- [ ] `invocation` is `model` or `user` (omit to accept the `model` default)
- [ ] `triggers` has at least 2 natural language phrases, each 2–4 words
- [ ] `author` is present
- [ ] `status` is `active`, `draft`, or `deprecated`
- [ ] if `gate` is present: `invocation` is `model`, `plan_types` are valid plan types, and `record` names a plan section

### Body
- [ ] H1 title follows the `# Skill: [Name] ([Framework])` format
- [ ] All required sections are present (`When to Read This`, `Context`, `Steps`, `Patterns We Use`, `Anti-Patterns — Never Do This`)
- [ ] Reference skills have `## Example`; `procedure` skills have `## Completion Criteria`
- [ ] Steps are numbered and specific enough to execute
- [ ] Anti-Patterns uses `❌` markers and is concrete, not generic
- [ ] Example is a real code snippet, not a placeholder
- [ ] For `procedure`: the completion criterion is checkable, and states the not-done cases

### Content quality
- [ ] The skill is project-specific in tone — not generic framework documentation
- [ ] Triggers are semantic phrases, not regex or file patterns
- [ ] No trigger is long enough that it will never be contained in a task string
- [ ] Skill dependencies are written as invocation instructions, not file paths (§6)
- [ ] No dependency invokes a `user` skill (§6)
- [ ] The skill can be followed without needing to read other documentation first (or lists prerequisites in `requires`)

---

## 11. File Naming Convention

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

## 12. A Note on Quality

The goal of a skill is to replace the need for a developer to re-explain a pattern to an AI agent every session.

A high-quality skill makes an AI agent feel like a teammate who was here from the start.

A low-quality skill — one that is generic, incomplete, or inaccurate — is worse than no skill, because it gives the agent false confidence.

**Write skills you would be comfortable handing to a new team member on their first day. If it would confuse them, rewrite it.**

---

## 13. Migrating v1 → v2

**No existing skill is invalid.** v2 is additive. A v1 skill is a v2 skill with
`invocation: model` implied.

| Change | Breaks v1 skills? | Action |
|--------|-------------------|--------|
| `invocation` becomes a documented field | No — defaults to `model` | Add it explicitly when you next touch a skill |
| `procedure` and `integration` join the category enum | No — nothing is reclassified except `mapbox-integration`, which was never valid | Use them for new skills |
| `## Completion Criteria` required for `procedure` | No — no v1 skill is `procedure` | — |
| `gate` optional field | No | Only for skills the brain must require |
| Trigger guidance now favours short phrases | No — long triggers stay *valid* | Shorten on next edit; they were never firing |

**Forward compatibility with an older CLI.** A v2 skill loads without error on
a v1.2 CLI. Both readers — `parseSkillMeta` in `commands/skill.ts` and
`listSkillsTool` in `mcp/tools.ts` — extract known frontmatter keys
field-by-field and ignore the rest, so `invocation` and `gate` are simply not
seen. The skill degrades to v1 behaviour rather than failing. No coordinated
CLI + registry release is required.

**What a v1.3 CLI adds:** `procedure` in the `nexus skill new` category prompt,
`invocation` validation, gate injection in `nexus_get_context`, and the D13
check for a gated plan missing its record.

---

*This document is the contract. It does not change lightly. Any proposed change to the skill format must be discussed in an issue before a PR is opened.*  
*For questions, open a GitHub Discussion in this repository.*
