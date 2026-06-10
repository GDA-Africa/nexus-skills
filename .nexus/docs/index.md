---
nexus_doc: true
id: "project_index"
title: "NEXUS Skills — Project Brain"
status: populated
confidence: high
last_updated: "2026-06-10"
---

# NEXUS Skills — Project Index

**Project:** `@nexus-framework/skills`
**Status:** 🟢 LIVE on npm — v0.1.1 published | v0.2.0 ready (MCP-era skills)
**Last Updated:** June 10, 2026
**Package root:** `packages/core/` (the npm package is published from there)

> ⚠️ This file previously contained a stale copy of the nexus-cli index (March 2026).
> Rewritten 2026-06-10 to reflect the actual state of THIS project.

---

## 🎯 Current Objective

**v0.2.0 — MCP-era skills release** (alongside nexus-cli v1.0.0)

Three new shared skills teach agents the v1.0 Alive Brain + MCP workflow:

| Skill | Purpose |
|-------|---------|
| `shared/nexus-mcp-usage.md` | How to use the `nexus-brain` MCP tools (wake → plan → knowledge loop) |
| `shared/nexus-plans-workflow.md` | Durable multi-step plans in `.nexus/plans/` |
| `shared/brain-aware-ci.md` | Brief PR comments + doctor gates (deterministic CI tier) |

**Release step:** `npm publish` from `packages/core/` (version bumped to 0.2.0).

---

## 📁 What Has Been Built

### Package layout
- `packages/core/index.js` — path/content resolvers (`getSkillPath`, `getSkillContent`, `listSkills`, `listFrameworks`); directory-driven, so adding a `.md` file is enough to register a skill
- `packages/core/{shared,next.js,react-vite,sveltekit,nuxt,astro,remix,go,python,rust}/` — skill content
- `skills-template/` — authoring template
- Spec: `SKILL_SPEC.md` (frontmatter + section standard), `SKILL_SYSTEM.md` (system design)

### Content coverage (2026-06-10)
| Area | Skills | State |
|------|--------|-------|
| `shared/` | 20 (incl. 3 new MCP-era) | 🟢 Strong |
| `next.js/` | 8 | 🟢 Complete set |
| `react-vite/` | 12 | 🟢 Complete set |
| `sveltekit/`, `nuxt/`, `astro/`, `remix/` | 1 each (component-creation) | 🔴 Parity gap |
| `go/`, `python/`, `rust/` | 1 each | 🔴 Parity gap |

---

## 🔄 Release History

| Version | Date | Highlights |
|---------|------|------------|
| 0.1.0 | Mar 2026 | Initial registry: shared + next.js + react-vite skills |
| 0.1.1 | Mar 2026 | Packaging fixes; consumed by nexus-cli skill registry |
| **0.2.0** | **2026-06-10 (ready)** | **MCP-era skills: nexus-mcp-usage, nexus-plans-workflow, brain-aware-ci** |

---

## ⏭️ What's Next (Prioritized)

1. **Publish v0.2.0** — `cd packages/core && npm publish --access public` (human step; same token renewal as nexus-cli — see nexus-cli `docs/publish-runbook.md`)
2. **Framework parity** — bring sveltekit/nuxt/astro/remix to ≥5 skills each (the v0.1 promise); reuse next.js/react-vite structure
3. **Language packs** — go/python/rust beyond component-creation
4. **Skill lint** — small script validating frontmatter against SKILL_SPEC.md in CI
5. **`nexus skill generate` support** — content conventions that make auto-drafted skills mergeable

---

## ⚠️ Operating Rules

1. Every skill follows `SKILL_SPEC.md` frontmatter (skill, version, framework, category, triggers, status)
2. `index.js` is directory-driven — never maintain a manual skill list
3. nexus-cli fetches this package live from npm — publishing is the only deploy step
4. Keep triggers honest: agents match tasks against them; vague triggers cause wrong skill reads
