# Vibe Coding Framework

## Principle

This project uses controlled vibe coding.

The goal is not to let AI freely generate large random code. The goal is to use Codex or OpenCode as scoped implementation agents with:
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
