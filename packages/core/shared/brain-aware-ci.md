---
skill: brain-aware-ci
version: 1.0.1
framework: shared
category: workflow
triggers:
  - "ci"
  - "continuous integration"
  - "github actions"
  - "pull request"
  - "pr comment"
  - "doctor gate"
author: '@nexus-framework/skills'
status: active
invocation: model
---

# Skill: Brain-Aware CI (Shared)

## When to Read This
Read this skill before modifying CI workflows in a NEXUS project, or when asked to surface brain state (briefs, drift, plans) in pull requests.

## Context
This project enforces a strict, deterministic CI layer. We believe CI should be fast, reliable, and not dependent on non-deterministic processes (like LLMs). We utilize the `brain-aware-ci` workflow to run fast doctor checks (e.g., `nexus doctor`) and maintain concise PR comments that explicitly state if a change is safe to merge without human review, gating merges behind strict rules.

## Steps
1. Keep the `brain` job from the generated `.github/workflows/ci.yml` intact when editing CI — it needs `pull-requests: write` permission and the sticky-comment marker `<!-- nexus-brain-brief -->`.
2. The doctor gate (`nexus doctor --severity=error`) should stay in the quality job. Errors fail the build; warnings do not.
3. If doctor produces false positives (e.g. D01 on spec docs with template-like tokens in code fences), suppress per-doc rather than removing the gate.
4. Before merging brain-heavy PRs, run `nexus sync` locally so the Vital Signs block is fresh and the CI diff stays quiet.
5. Commit messages referencing a plan id (e.g. `feat: add auth (plan: add-user-authentication)`) make the brief's "shipped" section traceable back to plans.

## Patterns We Use
- CI gates: All merges must pass `nexus doctor` checks.
- PR comments: Brief and actionable. Avoid long explanations; focus on whether the change breaks rules or needs human review.
- No LLM dependency in CI: The CI environment uses only pre-compiled tools or fast deterministic scripts.

## Anti-Patterns — Never Do This
- ❌ Do not let the brain job block merges — it informs reviewers; only the doctor error gate blocks
- ❌ Do not post a new comment per push — always upsert the marker comment
- ❌ Do not add LLM calls to the deterministic CI tier
- ❌ Do not hand-edit the Vital Signs block to silence CI — run `nexus sync` instead

## Example

```yaml
- name: Render brief
  run: npx @nexus-framework/cli brief --md > nexus-brief.md || true
# …actions/github-script upserts the comment starting with <!-- nexus-brain-brief -->
```

## Validation
Open a PR: the 🧠 NEXUS Brain Brief comment appears once and updates on subsequent pushes; doctor errors fail the quality job; no extra comments accumulate.
