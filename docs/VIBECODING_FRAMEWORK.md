# Vibe Coding Framework

## Principle

This project uses controlled vibe coding.

The goal is not to let AI freely generate large random code. The goal is to use Codex, OpenCode, or Claude Code as scoped implementation agents with:
- clear docs
- strict MVP boundaries
- official skills
- project-specific skills
- verification steps
- review loops

## Workflow

For every development phase:

1. Define the phase.
2. Tell the agent which skills to use.
3. Tell the agent which docs to read.
4. Give a small scoped task.
5. Add explicit constraints.
6. Require verification.
7. Ask for files changed and blockers.

## Good Prompt Example

Use dekoria-project-architect and dekoria-ui-builder skills.
Use official shadcn/ui skill if available.

Read:
- AGENTS.md
- docs/PRD.md
- docs/FLOWS.md
- docs/MVP_SYSTEM_BLUEPRINT.md
- docs/UI_SYSTEM_GUIDE.md

Task:
Implement Phase 1 app shell only:
- sidebar
- top header
- dashboard route
- responsive mobile drawer
- dashboard empty state

Constraints:
- Use shadcn/ui only.
- Use semantic tokens.
- Do not implement database.
- Do not implement auth.
- Do not implement AI.
- Do not add V2 features.
- Run lint and typecheck.

Return:
- files changed
- commands run
- verification result
- blockers

When using OpenCode, run `opencode` from the project root, use Plan mode before Build mode for bigger tasks, and reference docs with `@` file mentions such as `@AGENTS.md` and `@docs/PRD.md`.

When using Gemini CLI, activate relevant skills first and ensure it reads `GEMINI.md` (which imports `AGENTS.md`). Gemini CLI is best for the **Research** and **Strategy** phases of the development lifecycle.

When using Claude Code, run `claude` from the project root, read `@CLAUDE.md` first (which defers to `@AGENTS.md`), use Plan mode for large changes, reference docs with `@` file mentions, and use slash commands for repeated workflows. Claude Code is best for **targeted fixes**, **fallback coding**, and **review sessions**.

## Gemini CLI Prompt Templates

### Multi-File Architectural Review

```text
Activate skills:
- dekoria-project-architect
- dekoria-quality-review

Task:
Review the current implementation of <module> against docs/PRD.md and AGENTS.md.

Read:
- docs/PRD.md
- docs/FLOWS.md
- <relevant folder path>

Identify:
- Architectural drift from MVP.
- Inconsistent UI patterns.
- Missing permission checks.
- Type safety issues.

Return:
- Structural analysis report.
- Recommended refactoring plan.
```

### Complex Implementation Planning

```text
Activate skills:
- dekoria-project-architect
- dekoria-db-drizzle
- dekoria-ui-builder

Task:
Create a detailed implementation plan for Phase <N>.

Read:
- docs/PRD.md
- docs/DATABASE_SCHEMA.md
- docs/API_ACTIONS.md

Plan:
- Schema updates.
- Server action signatures.
- UI component composition.
- Verification steps.

Constraints:
- Must follow AGENTS.md.
- Must stay within MVP.
```

## Claude Code Prompt Templates

### Targeted Fix Session

```
Read:
- @CLAUDE.md
- @AGENTS.md
- @docs/PRD.md
- @docs/FLOWS.md
- @docs/<relevant technical doc>
- @.agents/skills/dekoria-quality-review/SKILL.md

Task:
Fix <specific bug or gap> in <module>.

Constraints:
- Follow AGENTS.md rules.
- Do not expand beyond MVP.
- Use Bun commands.
- Inspect existing code before editing.
- Run lint/typecheck/build.

Return:
- files changed
- commands run
- verification result
- blockers
```

### MVP Audit with Slash Command

```
/mvp-audit
```

Claude Code will read relevant docs, audit the codebase, and return a structured gap analysis.

### Review Session

```
Read:
- @CLAUDE.md
- @AGENTS.md
- @docs/PRD.md
- @.agents/skills/dekoria-quality-review/SKILL.md

Task:
Review <module> for correctness, type safety, MVP scope, permission checks, and UI consistency.
```

## Claude Code Workflow

For planning:

Read:
- CLAUDE.md
- AGENTS.md
- docs/PRD.md
- docs/FLOWS.md
- docs/MVP_SYSTEM_BLUEPRINT.md

Use Plan mode.

Task:
Create a plan for the requested MVP task only.

Constraints:
- Do not edit files yet.
- Do not expand beyond MVP.
- Use Bun.
- Follow existing code patterns.

Return:
- files likely affected
- implementation steps
- risks
- verification commands

For implementation:

Implement the approved plan.

Rules:
- Follow CLAUDE.md and AGENTS.md.
- Use `.claude/skills/` for project-specific guidance (mirrored from `.agents/skills/`).
- Use Bun commands only.
- Keep changes minimal.
- Run lint/typecheck/build if available.

Return:
- files changed
- commands run
- verification result
- blockers

Available Claude slash commands:
- `/mvp-audit` — MVP readiness audit
- `/fix-sprint` — Execute fix sprint checklist
- `/final-validation` — Final validation before release
- `/staging-check` — Verify staging deployment readiness

## Bad Prompt Example

"Build the ERP app."

This is bad because it is too broad, invites hallucination, ignores docs, mixes UI, DB, auth, and AI, is hard to review, and is likely to create messy architecture.

## Phase Prompt Templates

### Phase 1 - Project Setup & UI Foundation

Use:
- dekoria-project-architect
- dekoria-ui-builder
- official shadcn/ui skill

Task:
Set up Next.js App Router with Bun and shadcn preset, then create app shell.

Constraints:
- Use the provided shadcn preset when initializing:
  bunx --bun shadcn@latest init --preset b5d2ZsMLI --template next --pointer
- Do not implement auth/db/AI yet.
- Use semantic tokens.
- Run lint/typecheck/build if available.

### Phase 2 - Auth & Roles

Use:
- dekoria-project-architect
- dekoria-quality-review

Task:
Set up Better Auth or selected auth provider and role model.

Constraints:
- Protected pages require auth.
- Server actions require session checks.
- Owner/admin have full MVP access.
- AI summary is owner/admin only.

### Phase 3 - Database Schema

Use:
- dekoria-db-drizzle

Task:
Create Drizzle schema for MVP tables only.

Constraints:
- PostgreSQL compatible.
- Include timestamps.
- Add relations.
- No arbitrary SQL.
- Run typecheck.

### Phase 4 - Project Module

Use:
- dekoria-project-architect
- dekoria-db-drizzle
- dekoria-ui-builder
- official shadcn/ui skill

Task:
Implement project list, create form, detail view, status/health/progress.

Constraints:
- Use typed queries.
- Validate server actions.
- Use shadcn tables/forms/cards.
- No AI yet.

### Phase 5 - Daily Updates

Use:
- dekoria-project-architect
- dekoria-db-drizzle
- dekoria-ui-builder

Task:
Implement PM daily update form and latest updates view.

Constraints:
- Link updates to projects.
- Validate input.
- Show latest updates on dashboard.

### Phase 6 - Design / DED

Use:
- dekoria-project-architect
- dekoria-db-drizzle
- dekoria-ui-builder

Task:
Implement design tracker and DED approval/revision status.

### Phase 7 - Material Tracker

Use:
- dekoria-project-architect
- dekoria-db-drizzle
- dekoria-ui-builder

Task:
Implement material issue table, vendor relation, urgency/ETA, dashboard warnings.

### Phase 8 - Sales Snapshot

Use:
- dekoria-project-architect
- dekoria-db-drizzle
- dekoria-ui-builder

Task:
Implement leads table/form, lead status, follow-up date, dashboard snapshot.

### Phase 9 - Content Readiness

Use:
- dekoria-project-architect
- dekoria-db-drizzle
- dekoria-ui-builder

Task:
Implement content asset tracker, footage/content opportunity/status, dashboard readiness.

### Phase 10 - AI Morning Summary

Use:
- dekoria-mastra-ai
- official mastra-ai/skills
- dekoria-db-drizzle
- dekoria-quality-review

Task:
Create Mastra OwnerOpsAgent and generateMorningSummary workflow.

Constraints:
- All AI code in src/mastra.
- No direct Gemini calls from UI.
- Server action calls Mastra workflow.
- Fetch data through typed tools.
- Save ai_runs.
- Save ai_summaries.
- Bahasa Indonesia output.
- Do not invent missing data.
- Run typecheck/build if available.

## Review Loop

After each major phase, run a review prompt:

Use dekoria-quality-review skill.

Read:
- AGENTS.md
- docs/PRD.md
- docs/FLOWS.md
- relevant technical docs

Review the latest implementation for:
- correctness
- type safety
- architecture consistency
- MVP scope
- UI consistency
- security
- permission checks
- hallucinated APIs

Return findings by severity and suggest concrete fixes.
