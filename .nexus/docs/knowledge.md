# NEXUS CLI — Knowledge Base

> **Progressive learning file.** AI agents append entries here as they discover
> project-specific insights. This file grows organically — never delete entries.

---

## How This Works

- **When to add:** After discovering something non-obvious — a bug pattern, an architecture decision, a package quirk, a performance finding, a convention choice
- **When NOT to add:** Routine task completion (that goes in `index.md` Progress Log)
- **Format:** One entry = category tag + one-line insight + optional detail line
- **When to read:** Before making architectural decisions, debugging recurring issues, or choosing packages/patterns — scan for relevant categories first

---

## Categories

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

## Entries

<!-- AI: Append new entries below this line. Format:

### [CATEGORY] Short title
**2026-08-10** — One-line insight.
Optional: Brief supporting detail (1-2 sentences max).

-->

### [convention] Project scaffolded with NEXUS CLI
**2026-08-10** — This project was generated with NEXUS CLI. Follow the doc system in `.nexus/docs/` and always read `index.md` (the brain) before each task.
