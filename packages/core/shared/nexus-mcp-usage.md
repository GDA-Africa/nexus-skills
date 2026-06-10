---
skill: nexus-mcp-usage
version: 1.0.0
framework: shared
category: workflow
triggers:
  - "mcp"
  - "nexus mcp"
  - "brain tools"
  - "session start"
  - "wake"
  - "handshake"
author: "@nexus-framework/skills"
status: active
---

# Skill: NEXUS Brain MCP Usage (Shared)

## When to Read This
Read this skill at the start of every session in a project that has a `.mcp.json` registering the `nexus-brain` server, and whenever you are unsure whether to read brain files directly or call MCP tools.

## Context
NEXUS v1.0 ships an MCP server (`nexus mcp`) that exposes the project brain as schema-validated tools. The markdown files in `.nexus/` remain the source of truth — the MCP server is the preferred *interface* to them. Tools beat raw file reads because they return targeted data (less context pollution), run live sensors on demand, and validate every write (no malformed frontmatter).

## Steps
1. Session start: call `nexus_wake` and echo the returned `NX-WAKE-…` token in your first response. The result also gives you the active plan, its next step, and doctor warn/error counts.
2. Orient: call `nexus_get_active_plan`. If a plan is active, work its next unchecked step — do not re-derive a plan from scratch.
3. Before architectural decisions or debugging: call `nexus_query_knowledge` with keywords (e.g. `{"query": "upgrade frontmatter", "category": "gotcha"}`).
4. Before significant tasks: call `nexus_list_skills`, match your task against the triggers, then `nexus_get_skill` for any match.
5. During work: record progress with `nexus_plan_tick` (1-based step index) and `nexus_plan_note`.
6. After discovering something non-obvious: call `nexus_add_knowledge_entry` with a category, short title, and 1–3 sentence body (plus optional `why` / `howToApply`).
7. Need repo reality (branch, dirty tree, tests)? Call `nexus_get_vital_signs` — it runs sensors live and is fresher than the Vital Signs block in index.md.

## Patterns We Use
- One `nexus_wake` call replaces reading index.md + knowledge.md + plans in full at session start.
- Query-then-read: `nexus_query_knowledge` / `nexus_list_skills` first, full file reads only when the targeted result is insufficient.
- All brain writes go through tools. Hand-editing plan frontmatter is how the `status: backlog` TypeError class of bugs happened.

## Anti-Patterns — Never Do This
- ❌ Do not skip `nexus_wake` because "the brain files are already in context" — the token is the proof, and doctor D09 flags unwaked sessions
- ❌ Do not hand-edit plan checklists or frontmatter when `nexus_plan_tick` / `nexus_plan_note` are available
- ❌ Do not paste entire knowledge.md into context when a targeted query answers the question
- ❌ Do not write to the brain via shell redirection (`echo >> knowledge.md`) — entries must stay parseable

## Example

```
1. nexus_wake                       → { token: "NX-WAKE-7K9F-2026-06-10", activePlan: "add-auth", nextStep: "2. Write session middleware", … }
2. (echo token in first response)
3. nexus_query_knowledge {"query": "middleware auth"}  → 2 relevant gotchas
4. …implement step 2…
5. nexus_plan_tick {"id": "add-auth", "step": 2}       → { nextStep: "3. Add tests" }
6. nexus_add_knowledge_entry {"category": "gotcha", "title": "Session cookies need sameSite=lax", "body": "…"}
```

## Validation
The handshake token appears in your first response; plan progress is visible in `.nexus/plans/<id>.md`; `nexus doctor` reports no D09 finding for the session.
