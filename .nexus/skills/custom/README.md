# Custom Skills

This directory is for **your** project-specific skills.

NEXUS will **never** read from, write to, or delete files in this directory.
It is entirely owned by you.

---

## How to Create a Custom Skill

Run:
```
nexus skill new <name>
```

This will scaffold a new skill file with the correct frontmatter and section structure.

## Skill File Format

Every skill must have YAML frontmatter:

```markdown
---
skill: your-skill-slug
version: 1.0.0
framework: shared
category: ui
triggers:
  - "phrase that activates this skill"
  - "another trigger phrase"
author: your-name
status: draft
---

# Skill: Title

## When to Read This
...

## Steps
1. ...

## Patterns We Use
...

## Anti-Patterns — Never Do This
...

## Example
...
```

## Status Values

- `active` — AI agents must follow this skill
- `draft` — Guidance only; not yet enforced
- `deprecated` — Outdated; flag for update

---

*Add your skills here. They take precedence over core and community skills.*
