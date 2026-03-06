---
skill: git-workflow
version: 1.0.0
framework: shared
category: workflow
triggers:
  - "git workflow"
  - "git commit"
  - "pull request"
  - "branching strategy"
  - "code review"
author: "@nexus-framework/skills"
status: active
---

# Skill: Git Workflow (Shared)

## When to Read This
Read this skill before creating branches, making commits, or submitting pull requests in this project.

## Context
This project follows a structured Git workflow to maintain code quality and collaboration efficiency. We use feature branches, conventional commits, and pull request reviews. The main branch is protected and requires passing CI checks and approvals before merging. This workflow ensures code stability and clear commit history.

## Steps
1. Create a new branch from the latest main branch
2. Use descriptive branch names with issue numbers when applicable
3. Make atomic commits with conventional commit messages
4. Push to remote and create a pull request
5. Address review feedback and ensure CI passes
6. Squash and merge using the pull request template

## Patterns We Use
- Branch naming: `feature/JIRA-123-descriptive-name`, `bugfix/JIRA-456-fix-issue`, `hotfix/critical-fix`
- Commit messages: Conventional commits format (`type(scope): description`)
- Pull requests: Always required, with descriptive titles and detailed descriptions
- Code review: At least one approval required, automated checks must pass
- Merge strategy: Squash and merge to keep clean history

## Anti-Patterns — Never Do This
- ❌ Do not commit directly to main branch
- ❌ Do not use vague commit messages like "fix", "update", "changes"
- ❌ Do not force push to shared branches
- ❌ Do not merge without code review
- ❌ Do not ignore CI failures
- ❌ Do not commit generated files or dependencies

## Example

```bash
# Create and checkout new feature branch
git checkout main
git pull origin main
git checkout -b feature/JIRA-123-add-user-authentication

# Make changes and commit
git add .
git commit -m "feat(auth): add user registration endpoint"
git commit -m "test(auth): add unit tests for registration"
git push -u origin feature/JIRA-123-add-user-authentication
```

```markdown
# Pull Request Template Example

## Summary
Add user authentication system with email verification

## Test plan
- [x] User can register with valid email and password
- [x] Email verification sent after registration
- [x] Unit tests cover all new functionality
- [x] Integration tests pass

## Screenshots (if applicable)
[Add screenshots showing the new authentication flow]

## Breaking changes
None

## Dependencies
None
```

## Notes
- Use `git rebase main` to keep branch up to date with main
- Write commit messages in active voice
- Include issue numbers in commit messages when applicable
- Use `git status` and `git diff` to review changes before committing
- Consider using `git stash` for temporary changes
- Always run tests locally before pushing to remote
- Use `git log --oneline` to review recent commit history
- Consider using `git bisect` for debugging regressions