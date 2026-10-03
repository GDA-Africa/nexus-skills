---
skill: grilling
version: 1.0.0
framework: shared
category: procedure
invocation: model
gate:
  plan_types:
    - feature
    - refactor
    - spike
  record: "## Grilling"
triggers:
  - "new feature"
  - "grill"
  - "major fix"
  - "refactor"
  - "redesign"
  - "rewrite"
  - "not sure"
  - "complex"
author: "@nexus-framework/skills"
status: active
updated: 2026-08-21
related:
  - nexus-plans-workflow
  - knowledge-logging
---

# Skill: Grilling (Shared)

## When to Read This
Read this skill before starting any new feature, any major fix, any refactor, or any task you would describe as complex — and before writing the first line of a plan for one. If you are about to start building and you cannot state what "done" looks like in one sentence, you are in scope.

## Context
The most expensive failure in this project is not bad code. It is well-built code that answers the wrong question, because the agent inferred an ask instead of resolving it. Grilling is the interview that closes that gap **before** work starts: relentless, one question at a time, until every branch of the design is decided rather than assumed.

This is a procedure, not a reference. It has a start, an end, and an artifact — the `## Grilling` section of the plan. The artifact is what makes alignment checkable later: the brain can verify a record exists, and a human reviewing the plan can see the decisions that shaped it.

Grilling is the primitive. Other procedures invoke it; it invokes nothing.

## Steps
1. **Read before you ask.** Compose context first (`nexus_get_context`), then scan the plan, `index.md`, and matching knowledge entries. Every question answerable from the brain is a question you have not earned — asking it spends the human's attention on something you could have read.
2. **State the ask back in one sentence.** Open with your current understanding, not a question. It gives the human something concrete to correct, and a wrong restatement surfaces the misalignment immediately.
3. **Map the branches.** List the decisions the work depends on: scope boundaries, data shape, failure behaviour, who the user is, what happens to existing state, what "done" means. Each undecided one is a branch.
4. **Ask one question at a time.** Wait for the answer before the next. Batched questions get batched answers, and batched answers are shallow — the human optimises for clearing the list instead of thinking about each one.
5. **Go depth-first.** Follow an answer to its consequences before moving to the next branch. An answer that opens two new questions is progress; note them and resolve them in place.
6. **Push back on vagueness.** "Handle it gracefully", "make it fast", "the usual way" are unresolved branches wearing an answer's clothes. Ask what specifically happens, to what, when.
7. **Record what is out of scope.** Every "not now" is a decision worth as much as a "yes", and it is the one that stops the same argument recurring three sessions later.
8. **Write the record.** Put the resolved questions, their answers, and the out-of-scope list into the plan's `## Grilling` section before the first code change.
9. **Log what surprised you.** If an answer contradicted a reasonable assumption, that belongs in `knowledge.md` — it will mislead the next agent too.

## Patterns We Use
- Questions are **specific and closed enough to answer**: "when two users edit the same record, does the second write win or fail?" beats "how should conflicts work?"
- Offer options when the human is likelier to recognise the right answer than generate it. Name a default and say why.
- Restate a long answer in one line and get confirmation before moving on.
- Small work gets a short grilling. Three resolved branches is a complete record for a small feature; the bar is *every open branch closed*, not a question quota.
- Grill the **change**, not the codebase. Facts about the repo are yours to read.

## Anti-Patterns — Never Do This
- ❌ Do not write code before the record exists — the record is the point, and code written first turns the interview into a justification
- ❌ Do not ask questions the brain already answers — read `index.md`, the plan, and `knowledge.md` first
- ❌ Do not batch questions into a numbered list and hand it over — one at a time, in sequence
- ❌ Do not accept a vague answer to close a branch faster
- ❌ Do not stop at the first plausible interpretation — the second question is where the misalignment usually surfaces
- ❌ Do not skip the out-of-scope list; it is the half that pays off later
- ❌ Do not grill a `chore` or a one-line fix — this is for work with branches

## Completion Criteria
Grilling is done when **every branch you mapped in step 3 is either decided or explicitly recorded as out of scope**, and the human has confirmed the one-sentence restatement of the ask.

Not done when: any branch is still "we'll figure that out when we get there", the acceptance criteria could be read two ways, or you could not explain to a fresh agent why a rejected alternative was rejected.

## Example

```markdown
## Grilling

**Ask:** Add per-project skill overrides so a team can shadow a core skill
without forking the registry.

**Resolved**
- Precedence — `custom/` wins outright; no merging of sections. Merging was
  rejected: a half-overridden skill is harder to reason about than a replaced one.
- Shadowing a core skill that later changes upstream — `nexus skill status`
  reports the drift; it does not auto-update. Silent updates to an override
  defeat the purpose of overriding.
- Scope of an override — whole file only, not per-section.
- Done means — `nexus skill list` shows the shadow, `nexus_get_context` returns
  the override and never both copies, and D-check flags a stale shadow.

**Out of scope**
- Partial/section-level overrides — revisit only if whole-file proves too blunt
- Overriding `community/` skills — same mechanism, no demand yet
- A UI for managing overrides
```

## Validation
The plan has a `## Grilling` section containing resolved branches and an out-of-scope list; the acceptance criteria in the plan trace back to a recorded answer; doctor reports no gated plan missing its record.

## Notes
- Grilling runs on the main thread, in conversation with the human. It cannot be delegated to a subagent — the whole value is the back-and-forth.
- When the human is unavailable and work must proceed, record your assumptions in the `## Grilling` section marked `ASSUMED`, and treat every one as a question outstanding rather than a branch closed.
- The gate that requires this skill keys off plan type, not off the wording of your task. Renaming the task does not exempt it.
