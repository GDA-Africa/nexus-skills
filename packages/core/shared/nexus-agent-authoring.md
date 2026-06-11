---
skill: nexus-agent-authoring
version: 1.0.0
framework: shared
category: workflow
triggers:
  - "create agent"
  - "custom agent"
  - "agent definition"
  - "nexus agent new"
  - "subagent"
author: "@nexus-framework/skills"
status: active
---

# Skill: Authoring NEXUS Agents (Shared)

## When to Read This
Read this before creating or editing an agent definition in `.nexus/agents/` (v1.1+ projects).

## Context
Agents are brain-grounded role definitions: YAML frontmatter (machinery) + a markdown working agreement (behavior). They differ from skills — a skill teaches HOW to do a task; an agent defines WHO does a class of work, with what context and which tools. Custom agents (`custom/`) override core agents of the same name and are never touched by NEXUS.

## Steps
1. Scaffold with `nexus agent new <kebab-name>` — never hand-create the frontmatter.
2. Fill the frontmatter: honest `triggers` (agents are selected by matching tasks against them), a least-privilege `tools` allowlist (only the `nexus_*` tools this role needs — reviewers get NO write tools), and a `context` recipe (docs, knowledge categories, skills, plan_scope).
3. Write the body in four sections: **Mission** (one sentence, one outcome), **Working Agreement** (numbered behaviors, starting with the wake handshake), **Definition of Done**, **Anti-Patterns** (what this agent must never do).
4. Define the `handoff` — who this agent receives work from. Verification agents must never verify their own implementation.
5. Run `nexus agent status` (validates frontmatter + context recipe references) then `nexus agent sync` (regenerates `.claude/agents/` and the Agent Roles blocks).

## Patterns We Use
- Least privilege: every tool in the allowlist must be justified by the Mission.
- Narrow triggers beat broad ones — "migration" not "database stuff".
- The working agreement references MCP tools by exact name so any client can follow it.

## Anti-Patterns — Never Do This
- ❌ Giving every agent every tool — that's just the generic agent with extra steps
- ❌ Vague triggers that match everything ("help", "code")
- ❌ Editing core agents in place — override with a custom agent of the same name
- ❌ Skipping `nexus agent sync` after edits (client outputs go stale)

## Example

```bash
nexus agent new migration-runner
# edit .nexus/agents/custom/migration-runner.md
nexus agent status && nexus agent sync
```

## Validation
`nexus agent status` reports the agent healthy; `.claude/agents/<name>.md` exists and matches; the Agent Roles table in AGENTS.md lists it.
