---
skill: nexus-plans-workflow
version: 1.0.0
framework: shared
category: workflow
triggers:
  - "plan"
  - "multi-step"
  - "task tracking"
  - "nexus plan"
  - "roadmap"
  - "milestone"
author: "@nexus-framework/skills"
status: active
---

# Skill: NEXUS Plans Workflow (Shared)

## When to Read This
Read this skill before starting any task with three or more steps, any task that may span sessions, or whenever you are tempted to keep a plan only in conversation memory.

## Context
Plans are the NEXUS unit of multi-step work: durable markdown files in `.nexus/plans/<id>.md` with frontmatter (id, title, status) and sections (Goal, Why, Acceptance Criteria, Steps, Notes, Evidence). They survive across sessions, diff cleanly in git, and are both human- and agent-writable. Lifecycle: draft → approved → in_progress → (blocked | done | abandoned). Conversation memory is ephemeral; plans are not.

## Steps
1. Check for an active plan first: `nexus_get_active_plan` (MCP) or `nexus plan list` (CLI). Never open a duplicate plan for work that already has one.
2. For new multi-step work: `nexus plan new "<title>" --type=feature|bug|refactor|spike|chore`.
3. Get the plan approved (human confirms scope), then `nexus plan start <id>` — this sets it active.
4. Work the Steps checklist top to bottom. Tick steps as you complete them (`nexus_plan_tick` / `nexus plan tick`).
5. Record decisions and surprises as you go with plan notes — future sessions read these to resume.
6. On completion: `nexus plan done <id>` — this auto-appends to the index.md Progress Log and prompts for a knowledge entry.
7. If blocked: mark it blocked with the reason in a note, so the next session knows why.

## Patterns We Use
- One plan = one unit of shippable work. Small plans (chore template) stay lightweight — plans are memory, not bureaucracy.
- Sub-plans via `parent:` frontmatter when multiple agents work in parallel; one agent owns the top-level plan.
- Evidence section collects proof (test counts, command output) for the human reviewing the plan.

## Anti-Patterns — Never Do This
- ❌ Do not re-derive a plan from scratch when an active plan exists — this is the single biggest source of wasted agent work
- ❌ Do not hold multi-step plans only in conversation context — sessions end, plans persist
- ❌ Do not mark a plan done with unchecked acceptance criteria — tick them or note why they were dropped
- ❌ Do not hand-edit frontmatter status — use the lifecycle commands/tools so transitions are validated

## Example

```bash
nexus plan new "Add user authentication" --type=feature
nexus plan start add-user-authentication
# …work…
nexus plan tick add-user-authentication 1
nexus plan note add-user-authentication "Chose lucia over next-auth: smaller, we own the session table"
nexus plan done add-user-authentication --summary "Auth shipped; 24 new tests"
```

## Validation
`.nexus/plans/index.md` shows the plan in the right status bucket; `index.md` Progress Log gained an entry on completion; no orphan in_progress plans linger (doctor D06/D07).
