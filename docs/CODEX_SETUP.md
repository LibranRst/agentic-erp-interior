# Codex Setup

## Purpose

This repository uses Codex with AGENTS.md and Skills to keep implementation consistent, scoped, and high quality.

Codex should not be treated as a one-shot code generator. It should work as a docs-first coding agent that:
- reads product docs
- follows MVP boundaries
- uses official shadcn and Mastra skills
- implements small scoped tasks
- verifies changes with lint/typecheck/build when possible

## Required Reading Order

Before major implementation:
1. AGENTS.md
2. docs/PRD.md
3. docs/FLOWS.md
4. docs/MVP_SYSTEM_BLUEPRINT.md
5. relevant technical docs

## Official Skills

### shadcn/ui

Purpose:
- component usage
- registry
- CLI
- theming
- component docs
- UI implementation patterns

Install:

```bash
bunx --bun skills add shadcn/ui
```

Use before:
- creating UI
- adding shadcn components
- composing forms/tables/dialogs/sheets
- changing theme or design system

Also use:
- bunx --bun shadcn@latest info
- bunx --bun shadcn@latest docs <component>
- bunx --bun shadcn@latest add <component>

Install status:
- Initial command reached the installer prompt and detected the skill.
- Non-interactive retry with `bunx --bun skills add shadcn/ui --yes` succeeded.
- Installed local skill path: `.agents/skills/shadcn`.

Fallback command to document only:

```bash
pnpm dlx skills add shadcn/ui
```

### Mastra

Purpose:
- Mastra agents
- workflows
- tools
- memory
- evals
- deployment
- current Mastra implementation patterns

Install:

```bash
bun x skills add mastra-ai/skills
```

Use before:
- creating src/mastra
- creating agents
- creating workflows
- creating tools
- adding memory/evals
- integrating Gemini through Mastra

The official Mastra skill is the source of truth for Mastra API usage.
The custom dekoria-mastra-ai skill defines Dekoria-specific AI behavior only.

Install status:
- Initial command reached the installer prompt and detected the skill.
- Non-interactive retry with `bun x skills add mastra-ai/skills --yes` succeeded.
- Installed local skill path: `.agents/skills/mastra`.

Fallback commands to document only:

```bash
npx skills add mastra-ai/skills
pnpm dlx skills add mastra-ai/skills
yarn dlx skills add mastra-ai/skills
bun x skills add mastra-ai/skills
```

## Local Skills

Local skills:
- dekoria-project-architect
- dekoria-ui-builder
- dekoria-db-drizzle
- dekoria-mastra-ai
- dekoria-quality-review

Use `dekoria-project-architect` for architecture, route structure, module boundaries, folder layout, and MVP scope control.

Use `dekoria-ui-builder` for dashboard UI, app shell, shadcn composition, responsive pages, cards, tables, forms, and visual consistency.

Use `dekoria-db-drizzle` for Neon Postgres, Drizzle schema, migrations, seed data, relations, typed queries, and database-backed server actions.

Use `dekoria-mastra-ai` for OwnerOpsAgent behavior, Mastra workflows, AI summary logic, data grounding, `ai_runs`, and `ai_summaries`.

Use `dekoria-quality-review` for code review, security checks, type safety, permission checks, UI consistency, and MVP readiness verification.

## Bun Rules

Use Bun for all project commands:
- bun install
- bun dev
- bun run lint
- bun run typecheck
- bun run build
- bunx --bun shadcn@latest ...

Do not switch to npm, pnpm, or yarn unless explicitly requested.

## Recommended Codex Prompt Pattern

Use this pattern for future tasks:

```text
Use the relevant skills:
- <skill-name>
- <official skill if applicable>

Read:
- AGENTS.md
- docs/PRD.md
- docs/FLOWS.md
- <relevant technical docs>

Task:
<clear small task>

Constraints:
- Do not expand beyond MVP.
- Follow existing patterns.
- Do not hallucinate APIs.
- Use Bun commands.
- Run lint/typecheck/build if available.

Return:
- files changed
- commands run
- verification result
- blockers
```

## Anti-Hallucination Rules

Codex must:
- inspect files before editing
- read docs before implementation
- check installed package APIs where possible
- use official skills for shadcn and Mastra
- prefer existing patterns
- avoid placeholder-heavy code
- stop and report blockers instead of faking completion

## Future Nested AGENTS.md

Do not create nested AGENTS.md files until the folders exist. When the app structure is initialized, consider adding:
- src/mastra/AGENTS.md
- src/db/AGENTS.md
- src/components/AGENTS.md
- src/features/AGENTS.md

Example for `src/mastra/AGENTS.md`:

```markdown
# Mastra Folder Instructions

All files in this folder are AI agent, tool, workflow, eval, or memory files.

Rules:
- Never call database directly from model prompts.
- Fetch data through typed tools.
- Log every workflow execution to ai_runs.
- Save user-facing output to ai_summaries.
- Output Bahasa Indonesia by default.
- Never invent missing data.
- Use official Mastra skill or docs before writing API-specific code.
```
