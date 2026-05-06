# Agentic Coding Setup

## Purpose

This repository uses an agentic coding framework with AGENTS.md and Skills to keep implementation consistent, scoped, and high quality.

Codex is the primary AI coding agent. OpenCode is the fallback when Codex reaches usage limits.

Agents should not be treated as one-shot code generators. They should work as docs-first coding agents that:
- read product docs
- follow MVP boundaries
- use official shadcn and Mastra skills
- use Dekoria-specific local skills
- implement small scoped tasks
- verify changes with lint/typecheck/build when possible

## Required Reading Order

Before major implementation:
1. AGENTS.md
2. docs/PRD.md
3. docs/FLOWS.md
4. docs/MVP_SYSTEM_BLUEPRINT.md
5. relevant technical docs

## Agent Roles

Codex:
- primary implementation and review agent
- preferred for normal development tasks
- must follow AGENTS.md and relevant skills

OpenCode:
- fallback implementation and review agent when Codex reaches usage limits
- must run from the project root with `opencode`
- must follow AGENTS.md and relevant skills
- must not replace curated instructions blindly

Gemini CLI:
- additional fallback for long-context planning, repo review, research-heavy tasks, and documentation
- preferred for terminal-based coding assistance and complex multi-file planning
- must follow AGENTS.md, GEMINI.md, and relevant skills
- always uses Plan Mode by default in this repository

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

The canonical local skills location is:
- `.agents/skills/<skill-name>/SKILL.md`

OpenCode can discover skills from `.agents/skills/<name>/SKILL.md`.

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

## OpenCode Usage

Run OpenCode from the project root:

```bash
opencode
```

Use `/init` carefully. This repository already has a curated AGENTS.md, so do not blindly overwrite it with generated instructions.

For bigger tasks:
- use Plan mode before Build mode
- ask OpenCode to read `@AGENTS.md`
- mention relevant docs with `@` file references, such as `@docs/PRD.md`, `@docs/FLOWS.md`, and `@docs/MVP_SYSTEM_BLUEPRINT.md`
- mention relevant skills by name
- keep the task small and MVP-scoped

Recommended OpenCode prompt pattern:

```text
Use Plan mode first.

Read:
- @AGENTS.md
- @docs/PRD.md
- @docs/FLOWS.md
- @docs/MVP_SYSTEM_BLUEPRINT.md
- @docs/<relevant technical doc>

Use skills:
- dekoria-project-architect
- <other relevant local skill>
- <official skill if applicable>

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

## Gemini CLI Usage

### Installation

Install Gemini CLI only from official sources:

```bash
# Option 1: Run once
npx @google/gemini-cli

# Option 2: Global install via npm
npm install -g @google/gemini-cli

# Option 3: Install via Homebrew
brew install gemini-cli
```

**Warning:** Avoid fake "early access" Gemini CLI links. Only use official @google packages or the official Homebrew formula.

### Configuration

Gemini CLI is configured via `.gemini/settings.json`. It is set to **Plan Mode** by default.

### Usage Patterns

Gemini CLI excels at:
- **Planning:** Analyzing PRD and technical docs to create implementation plans.
- **Review:** Auditing existing code against AGENTS.md rules.
- **Refactoring:** Planning cross-file changes.
- **Research:** Searching the codebase for patterns or debt.

Example prompt pattern for Gemini CLI:

```text
Activate skills:
- dekoria-project-architect
- <relevant skill>

Read context:
- AGENTS.md
- docs/PRD.md
- docs/FLOWS.md
- <relevant file>

Task:
<complex planning or research task>

Constraints:
- Stay within MVP boundaries.
- No YOLO mode.
- Use Plan Mode.
```

## Bun Rules

Use Bun for all project commands:
- bun install
- bun dev
- bun run lint
- bun run typecheck
- bun run build
- bunx --bun shadcn@latest ...

Do not switch to npm, pnpm, or yarn unless explicitly requested.

## Recommended Agent Prompt Pattern

Use this pattern for future Codex or OpenCode tasks:

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

Agents must:
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
