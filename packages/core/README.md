<div align="center">

# @nexus-framework/skills

**The official skill registry for the [NEXUS framework](https://www.npmjs.com/package/@nexus-framework/cli).**

Pre-read instruction files that teach AI agents *how* to execute tasks in your project — patterns, conventions, anti-patterns, validation steps.

[![npm](https://img.shields.io/npm/v/@nexus-framework/skills?style=flat-square&logo=npm&logoColor=white&label=npm&color=CB3837)](https://www.npmjs.com/package/@nexus-framework/skills)
[![License](https://img.shields.io/badge/license-Apache_2.0-blue?style=flat-square)](LICENSE)

</div>

---

## What skills are

Generic AI agents know how to write code. They don't know how *your project* writes code. Skills close that gap: each skill is a markdown file with YAML frontmatter (`triggers`, `framework`, `category`) and a fixed section structure — When to Read This, Context, Steps, Patterns We Use, Anti-Patterns, Example, Validation.

Agents match their current task against each skill's `triggers` before significant work, read the matching skill fully, and follow it. In NEXUS v1.0+ projects they do this through MCP tools (`nexus_list_skills` / `nexus_get_skill`) — see `shared/nexus-mcp-usage.md`.

## Installation

You usually don't install this package directly. The NEXUS CLI fetches it from npm:

- `nexus init` / `nexus adopt` — copies framework-matched skills into `.nexus/skills/core/`
- `nexus skill registry` — browses this package live (new skills appear without a CLI update)
- `nexus skill install <pack>` — installs additional packs into `.nexus/skills/community/`

Precedence in a project: `custom/` (yours, sacred) > `core/` (this package) > `community/`.

## What's inside

```
shared/        20 framework-agnostic skills
next.js/        8 skills (components, routing, API routes, data fetching, …)
react-vite/    12 skills
sveltekit/ nuxt/ astro/ remix/   starter sets (parity expansion in progress)
go/ python/ rust/                starter sets
```

### New in v0.2.0 — the MCP era

| Skill | Teaches agents to |
|-------|-------------------|
| `shared/nexus-mcp-usage.md` | Drive the `nexus-brain` MCP server: `nexus_wake` handshake, targeted knowledge queries, validated plan/knowledge writes |
| `shared/nexus-plans-workflow.md` | Track multi-step work in durable `.nexus/plans/` files instead of conversation memory |
| `shared/brain-aware-ci.md` | Maintain the deterministic CI layer: brief PR comments + doctor gates, no LLM dependency |

### Shared skill highlights

`git-workflow` · `code-review` · `testing-strategy` · `debugging` · `documentation` · `knowledge-logging` · `security-best-practices` · `api-design` · `database-patterns` · `performance-optimization` · `accessibility` · `internationalization` · `deployment` · `dependency-management` · `monitoring-observability` · `skill-authoring`

## Skill format

Defined in [`SKILL_SPEC.md`](https://github.com/GDA-Africa/nexus-skills/blob/main/SKILL_SPEC.md):

```yaml
---
skill: component-creation
version: 1.0.0
framework: next.js
category: ui
triggers:
  - "creating a new component"
  - "adding a React component"
author: "@nexus-framework/skills"
status: active
---
```

Honest triggers matter: agents match tasks against them, and vague triggers cause wrong skill reads.

## Programmatic API

```js
import { getSkillContent, listSkills, listFrameworks } from '@nexus-framework/skills';

listFrameworks();                          // ['shared', 'next.js', 'react-vite', …]
listSkills('shared');                      // ['git-workflow', 'nexus-mcp-usage', …]
getSkillContent('shared', 'git-workflow'); // full markdown
```

The registry is directory-driven — adding a `.md` file to a framework directory registers it. No manifest to maintain.

## Versioning

This package versions independently from the CLI. The CLI fetches `latest` at runtime, so publishing here ships skills to every NEXUS project immediately — old and new.

## Contributing

Write the skill against `SKILL_SPEC.md`, place it in the right framework directory, and open a PR at [GDA-Africa/nexus-skills](https://github.com/GDA-Africa/nexus-skills). `shared/skill-authoring.md` is the meta-skill for writing good skills.

## License

Apache 2.0 — built by [GDA Africa](https://gdaafrica.org).
