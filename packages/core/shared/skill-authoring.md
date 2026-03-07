---
skill: skill-authoring
version: 1.0.0
framework: shared
category: workflow
triggers:
  - "add a new skill"
  - "create a skill"
  - "write a skill"
  - "new skill file"
  - "skill authoring"
  - "skill creation"
  - "add skill to nexus"
  - "contribute a skill"
  - "write a nexus skill"
  - "skill for"
author: "@nexus-framework/skills"
status: active
updated: 2026-03-07
related:
  - knowledge-logging
  - documentation
  - code-review
---

# Skill: Skill Authoring (Shared)

## When to Read This
Read this skill before creating any new `.md` skill file — whether it goes in `packages/core/shared/`, a framework subfolder, or a project's `custom/` directory. A poorly written skill is worse than no skill at all, because it gives an AI agent false confidence.

## Context
NEXUS skills are the primary mechanism through which AI agents receive task-level instructions within a project. The quality of a skill directly determines the quality of the agent's output. This project follows the canonical NEXUS Skill Spec (`SKILL_SPEC.md`) and additional quality principles derived from Anthropic's guidance on prompt engineering, OpenAI's best practices for instruction clarity, and Google DeepMind's research on grounded, specific, and verifiable AI instructions. Skills are written for an AI audience first, a human audience second — but they must satisfy both.

---

## Steps

1. **Identify the task gap** — Before writing, ask: "Does this skill describe a task that recurs, has a right and wrong way to do it in this project, and would an agent get wrong without explicit guidance?" If no, don't write it.
2. **Name the skill** — Choose a kebab-case slug that describes the task, not the technology (`component-creation`, not `react-tsx`). Check `packages/core/` for an existing skill before creating a new one.
3. **Choose placement** — `shared/` for cross-framework concerns, a framework folder (`next.js/`, `react-vite/`, etc.) for framework-specific tasks, or a project's `custom/` for project-specific overrides.
4. **Write the frontmatter** — Fill every required field (`skill`, `version`, `framework`, `category`, `triggers`, `author`, `status`). Start `version` at `1.0.0`. Start `status` as `draft`. Add optional fields (`updated`, `related`, `requires`) when they add real value.
5. **Write 4–8 semantic triggers** — Write the phrases a developer would say in a standup, not code patterns or filenames. Cover synonyms and phrasing variations.
6. **Write `## Context` as a project-specific briefing** — Not generic documentation. Explain *why this project does it this way*. Two to four sentences maximum. If you find yourself summarising a framework's docs, stop — that belongs in `## Notes`.
7. **Write `## Steps` as executable instructions** — Number every step. Each step must be specific enough to perform without ambiguity. Prefer imperative verbs: *Create*, *Run*, *Confirm*, *Add*.
8. **Write `## Anti-Patterns`** before `## Patterns We Use` mentally — the anti-patterns are often the highest-value section. Think: what does an agent do by default that is wrong here?
9. **Write the `## Example`** — A real, runnable snippet. Not a pseudocode placeholder. If the skill is about a CLI command, show the command and its output. If it is about code, show the correct file.
10. **Self-review using the Skill Quality Rubric** (see below) before committing.
11. **Set `status: active`** only after a second reviewer (human or agent) has confirmed the skill is accurate and follows the spec. New contributions to `packages/core/` default to `draft` until reviewed in a PR.
12. **Append to `knowledge.md`** — After the skill is merged, log an entry: what the skill covers, why it was needed, any edge cases discovered during authoring.

---

## Patterns We Use

### Frontmatter Conventions
- `skill` slug is always **kebab-case**, all lowercase, no framework name in the slug (the framework field handles that)
- `version` starts at `1.0.0`; increment `PATCH` for typo/clarity fixes, `MINOR` for new sections, `MAJOR` for a change in the recommended pattern itself
- `status: draft` for all new skills; promoted to `active` after review
- `updated` field is always an ISO date (`2026-03-07`) and updated on every meaningful edit
- `related` lists skills the agent might also need; do not list skills that are unrelated just to seem comprehensive

### Writing for AI Agents — Core Principles
These are distilled from Anthropic's Claude prompt engineering guidelines, OpenAI's GPT system prompt best practices, and DeepMind's instruction-following research:

- **Be specific, not general** — "Create the file at `src/features/[feature]/[Name].tsx`" beats "Create the component file". Agents follow precise instructions better than vague directives.
- **Front-load the most important constraint** — The first sentence of every section is weighted highest by language models. Put the critical rule first.
- **Use positive and negative framing together** — Pair every "do this" with a "not that". The `## Anti-Patterns` section is the negative frame; `## Patterns We Use` is the positive. Both are required.
- **Avoid ambiguous pronouns and implicit references** — Never write "it" when you mean "the component", "the file", or "the command". Agents lose referential context more easily than humans.
- **Concrete > abstract** — "Run `yarn type-check` and confirm zero errors" is actionable. "Ensure type safety" is not.
- **One instruction per bullet** — Do not combine two instructions in one bullet point. Agents may execute only the first half.
- **Ground every claim** — Do not write "this is best practice" without specifying why. Agents trained on large corpora may override ungrounded claims with their prior training.
- **Calibrate length to task complexity** — A simple workflow skill needs 15–20 bullets. A complex integration skill may need 200+ lines with code examples. Match depth to complexity; do not pad or truncate artificially.
- **Write as if the agent has never seen the codebase** — It may not have. Do not assume implicit knowledge of file structure, naming, or conventions that are not written down.

### Trigger Writing
- Triggers are **semantic phrases**, not regex or file patterns
- Write in natural language a developer would use in conversation: "adding a new route", "writing a test for this function"
- Include **both short** (`"new component"`) **and long** (`"creating a reusable React component for the UI"`) forms
- Aim for 4–8 triggers; fewer than 2 is a validation error; more than 10 is usually a sign the skill covers too many tasks
- Triggers should be **task-level**, not technology-level: `"adding authentication"` not `"using JWT"`

### Example Quality Standard
- Examples must be **copy-paste ready** — no `// TODO` placeholders, no `...` ellipsis omitting critical code
- For code skills: show the complete file structure, not just the interesting parts
- For CLI skills: show the exact command and the expected output or file produced
- For workflow skills: show a complete, filled-in artefact (a commit message, a PR description, a checklist)
- Label examples clearly: `// ✅ Correct` / `// ❌ Wrong` when showing contrasts

### Category Selection
| If the skill covers… | Use category |
|---|---|
| Components, layouts, design system | `ui` |
| Pages, navigation, URL structure | `routing` |
| Data fetching, caching, state, mutations | `data` |
| Unit, integration, E2E tests | `testing` |
| API routes, server actions, endpoints | `api` |
| Config files, environment variables, tooling | `config` |
| Git, code review, debugging, documentation, meta-skills | `workflow` |

---

## Anti-Patterns — Never Do This

- ❌ **Do not write a skill that mirrors framework documentation** — skills are project-specific instructions, not tutorials. If the skill could be published in the framework's official docs unchanged, rewrite it to be project-specific.
- ❌ **Do not use vague instructions** — "Handle errors properly" is not a skill instruction. "Wrap every async function in a `try/catch` and pass caught errors to `handleApiError(error, res)`" is.
- ❌ **Do not write triggers that are too narrow** — A trigger of `"when creating a UserCard component"` will never match. A trigger of `"creating a new component"` will.
- ❌ **Do not write triggers that are too broad** — A trigger of `"writing code"` will match everything and provide no useful routing. Be specific at the task level.
- ❌ **Do not define multiple unrelated tasks in one skill** — one skill = one task category. If you find yourself writing "Step 1: Add the component. Step 6: Also configure the router.", split it into two skills.
- ❌ **Do not use `status: active` before review** — start every skill as `draft`. Promoting to `active` without review can mislead agents with incorrect instructions at scale.
- ❌ **Do not omit the `## Example` section** — it is required by the spec and is the highest-fidelity signal an agent has of the intended output. A skill without an example forces the agent to infer.
- ❌ **Do not write anti-patterns as generic warnings** — "Don't write bad code" is not an anti-pattern. "Don't create components in `src/components/` — use the feature folder instead" is.
- ❌ **Do not pad the skill with content that doesn't help an agent execute the task** — every sentence should answer: "Does knowing this help the agent do the task correctly?" If not, cut it.
- ❌ **Do not skip `knowledge.md` after authoring** — the rationale for creating the skill and any edge cases discovered are exactly the kind of thing knowledge.md exists for.
- ❌ **Do not write a skill for a one-time task** — skills are for recurring task patterns. If the task is a one-off migration or initialisation, document it in `knowledge.md` instead.

---

## Example

### Complete minimal valid skill file

```markdown
---
skill: error-handling
version: 1.0.0
framework: react-vite
category: data
triggers:
  - "error handling"
  - "handling errors"
  - "catching errors"
  - "error boundary"
  - "try catch"
author: "@nexus-framework/skills"
status: draft
updated: 2026-03-07
related:
  - data-fetching
  - testing
---

# Skill: Error Handling (React + Vite)

## When to Read This
Read this skill before implementing any error handling in async operations, API calls,
or component boundaries.

## Context
This project uses a centralized error handling approach: all async errors flow through
`src/lib/errorHandler.ts`, which logs to Sentry and returns a standardised
`AppError` object. Components receive errors as typed props, never raw `Error` instances.

## Steps
1. Import `handleError` from `src/lib/errorHandler.ts`.
2. Wrap every async operation in `try/catch`.
3. Pass the caught error to `handleError(error)` — it returns an `AppError`.
4. Pass the `AppError` to the component as a typed `error` prop.
5. In the component, render `<ErrorMessage error={error} />` from `src/components/ErrorMessage.tsx`.
6. For component boundaries, wrap with `<ErrorBoundary fallback={<ErrorFallback />}>`.

## Patterns We Use
- All errors go through `handleError()` — never `console.error` in production code
- Components receive `error: AppError | null`, not raw `Error` objects
- Error boundaries wrap every route-level component

## Anti-Patterns — Never Do This
- ❌ Do not `console.error` in production code — use `handleError()`
- ❌ Do not pass raw `Error` objects to components — convert via `handleError()` first
- ❌ Do not silently swallow errors — every catch block must call `handleError()`

## Example

\`\`\`typescript
// src/features/user/useUser.ts
import { handleError } from '@/lib/errorHandler';
import type { AppError } from '@/types/errors';

export async function fetchUser(id: string): Promise<User | AppError> {
  try {
    const res = await api.get(`/users/${id}`);
    return res.data;
  } catch (err) {
    return handleError(err);  // ✅ Always through handleError
  }
}
\`\`\`
```

---

### Skill Quality Rubric

Use this as a self-review checklist before every skill commit:

```markdown
## Skill Quality Rubric — Self-Review

### Spec Compliance
- [ ] All required frontmatter fields present (`skill`, `version`, `framework`, `category`, `triggers`, `author`, `status`)
- [ ] `skill` slug is kebab-case, matches the filename
- [ ] `version` is valid semver starting at `1.0.0`
- [ ] `framework` is `shared` or one of the allowed framework values
- [ ] `category` is one of the 7 allowed values
- [ ] `triggers` has 4–8 natural language phrases (minimum 2)
- [ ] `status` is `draft` for new/unreviewed skills
- [ ] All 6 required body sections are present in order

### Content Quality (Anthropic / AI-first standard)
- [ ] Every step is specific enough to execute without further clarification
- [ ] No step combines two actions — each step is a single, atomic instruction
- [ ] Front-loaded: the most important constraint is the first sentence of each section
- [ ] No ambiguous pronouns — every "it", "this", "that" is replaced with the explicit noun
- [ ] Context section describes THIS project's approach, not the framework's general approach
- [ ] Anti-Patterns are specific to this project, not generic advice
- [ ] Example is copy-paste ready (no placeholders, no `...` omissions)
- [ ] Length matches task complexity — not padded, not truncated

### Routing Quality
- [ ] Triggers are task-level phrases, not technology names or file patterns
- [ ] Triggers cover multiple synonym phrasings of the same task
- [ ] The skill covers exactly ONE task category — not multiple unrelated concerns

### Process
- [ ] `status` is `draft` (not `active`) until PR review is approved
- [ ] `knowledge.md` entry planned for post-merge
- [ ] Checked `packages/core/` — no existing skill already covers this task
```

---

## Notes

- **The Skill Spec is the contract** — `SKILL_SPEC.md` at the root of this repository is the authoritative format reference. This skill summarises the authoring workflow; the spec defines the rules. When they differ, the spec wins.
- **Skills in `packages/core/` are published** — they ship in `@nexus-framework/skills` and are installed into every project that runs `nexus init` or `nexus upgrade`. Hold them to a higher standard than custom project skills. Every word in a core skill is read by AI agents in every project that uses NEXUS.
- **Anthropic's key prompt engineering principle applied here** — per Anthropic's published guidance: *"Be specific about the desired output format and provide examples."* Every skill must follow this: specify the exact output shape and provide a working example. An agent that knows what the output should look like will produce it far more reliably than one given only rules.
- **OpenAI's system prompt best practice** — *"Use clear, direct language. Avoid hedging words like 'perhaps', 'maybe', 'you might want to'."* Skill instructions use declarative imperatives: *Create, Run, Add, Confirm, Wrap* — not *you could try, it might be a good idea to, consider*.
- **Token efficiency matters** — AI agents have context windows. A 5,000-line skill that covers everything is useless if it never fits in context alongside the task. Keep skills focused on one task. Reference other skills via `related` instead of duplicating content.
- **Version discipline** — When a pattern changes and the skill is updated to a `MAJOR` version, the previous version's behaviour may still exist in older projects. Add a `## Notes` entry explaining what changed and when, so agents in those older projects can reconcile the difference.
- **The `custom/` override pattern** — If a project team wants to override a core skill, they create a file with the same `skill` slug in their `.nexus/skills/custom/` directory. The NEXUS precedence rules (`custom/ > core/ > community/`) ensure the custom version is always used. Never modify files in `core/` directly for a single project — always use `custom/` overrides.
