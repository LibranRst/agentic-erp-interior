# AGENTS.md

## Project Identity

This repository is the MVP for SaaS Agentic Interior ERP for Dekoria Living, a premium interior design and contractor company.

These are shared agent instructions for Codex, OpenCode, and Claude Code:
- Codex is the primary AI coding agent for this repository.
- OpenCode is the fallback AI coding agent when Codex reaches usage limits.
- Claude Code is the additional fallback agent when both Codex and OpenCode are unavailable.
- All agents must follow this AGENTS.md, the docs in docs/, official skills, and local project skills.
- Treat this repository as an agentic coding framework, not a Codex-only setup.

The product is an internal operations system focused on:
- Owner Dashboard
- Project Tracking
- Daily PM Updates
- Design / DED Tracker
- Material Issue Tracker
- Sales / Leads Snapshot
- Content Readiness
- AI Morning Summary
- User & Role Management

The MVP goal is operational visibility, tracking, reporting, and actionable AI summaries.

Do not expand into full ERP features unless explicitly requested.

Out of MVP unless explicitly requested:
- advanced finance
- invoice automation
- payroll
- advanced CRM
- client portal
- WhatsApp automation
- vendor payment tracking
- advanced inventory
- SaaS billing

## Source Of Truth

Before implementing anything, read the relevant docs in docs/.

Primary product docs:
- docs/PRD.md
- docs/FLOWS.md
- docs/MVP_SYSTEM_BLUEPRINT.md

Technical implementation docs:
- docs/STACK_DECISION.md
- docs/DATABASE_SCHEMA.md
- docs/API_ACTIONS.md
- docs/UI_WIREFRAME.md
- docs/UI_SYSTEM_GUIDE.md
- docs/AI_AGENT_INSTRUCTIONS.md
- docs/AUTH_AND_PERMISSION.md
- docs/ENV_SETUP.md
- docs/SEED_DATA.md
- docs/TESTING_CHECKLIST.md
- docs/MIGRATION_PLAN.md
- docs/PROJECT_RULES.md

Priority order:
1. Latest explicit user instruction
2. docs/PRD.md
3. docs/FLOWS.md
4. docs/MVP_SYSTEM_BLUEPRINT.md
5. Module-specific technical docs
6. Existing code patterns

If code and docs conflict:
- Prefer the latest explicit user instruction.
- Then prefer PRD and FLOWS.
- Then prefer technical docs.
- Update the affected docs after implementation if the implementation changes the decision.

## Tech Stack

Use:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Bun as package manager and local runtime
- NeonDB / PostgreSQL
- Drizzle ORM
- Better Auth by default
- Clerk only if explicitly requested as a faster MVP alternative
- ImageKit for media storage
- Mastra for AI workflows
- Gemini 3 Flash as the default AI model
- Gemini 3 Flash low reasoning as fallback
- Gemini Flash-Lite only for cheap formatting or classification if needed
- Vercel-managed Next.js runtime for production

Never use npm, pnpm, or yarn for project commands unless needed for a tool that has no Bun-compatible command and the user explicitly approves.

Use:
- bun install
- bun dev
- bun run lint
- bun run typecheck
- bun run build
- bunx --bun shadcn@latest ...

## Official Skills

This project should use official Skills when available.

Required official skills:
- shadcn/ui
- mastra-ai/skills

When working with UI:
- Prefer the official shadcn/ui skill before manually implementing component patterns.
- Use shadcn CLI and docs instead of guessing component APIs.

When working with AI:
- Prefer the official Mastra skill before implementing agents, tools, workflows, memory, evals, or streaming.
- Do not guess Mastra APIs.
- Use official Mastra skill resources or docs before writing Mastra code.

Local custom skills are for Dekoria-specific rules, business context, MVP boundaries, and review workflow.

## Agent Compatibility

Codex, OpenCode, and Claude Code must all use the canonical local skills location:
- .agents/skills/<skill-name>/SKILL.md

Official skills currently expected:
- .agents/skills/shadcn/SKILL.md
- .agents/skills/mastra/SKILL.md

Custom Dekoria skills:
- .agents/skills/dekoria-project-architect/SKILL.md
- .agents/skills/dekoria-ui-builder/SKILL.md
- .agents/skills/dekoria-db-drizzle/SKILL.md
- .agents/skills/dekoria-mastra-ai/SKILL.md
- .agents/skills/dekoria-quality-review/SKILL.md

OpenCode compatibility notes:
- Run `opencode` from the project root.
- Use `/init` carefully.
- Do not blindly overwrite this curated AGENTS.md.
- For bigger tasks, use Plan mode before Build mode.
- Use `@` file mentions to reference docs, for example `@AGENTS.md`, `@docs/PRD.md`, and `@docs/FLOWS.md`.
- OpenCode can discover skills from `.agents/skills/<name>/SKILL.md`.
- If OpenCode proposes new instructions, merge them carefully with this file instead of replacing the existing rules.

Claude Code compatibility notes:
- Run `claude` from the project root.
- Read CLAUDE.md first, then AGENTS.md — CLAUDE.md is the thin adapter that defers here.
- For large tasks, use Plan mode before writing code.
- Use `@` file mentions to reference docs — e.g. `@AGENTS.md`, `@docs/PRD.md`, `@docs/FLOWS.md`.
- Use skills by referencing them with `@` mentions: `.agents/skills/<name>/SKILL.md`.
- Use slash commands for repeated workflows: `/mvp-audit`, `/fix-sprint`, `/final-validation`.
- Claude Code does not auto-discover `.agents/skills/` — reference skills explicitly.
- Verify with lint/typecheck/build when available.

## Development Rules

Act as a senior full-stack engineer.

Before editing:
- Inspect the existing repo structure.
- Read relevant docs and existing patterns.
- Search before creating new abstractions.
- Prefer small, coherent changes over huge speculative rewrites.

While coding:
- Keep TypeScript strict and clean.
- Avoid any.
- Avoid unsafe casts.
- Avoid broad try/catch.
- Avoid silent fallbacks.
- Reuse existing helpers and components.
- Keep server logic on the server.
- Keep client components minimal and intentional.
- Validate inputs on server actions.
- Check auth and permission in every protected server action.
- Do not expose DB credentials or secrets.
- Do not allow arbitrary SQL execution.

After coding:
- Run lint, typecheck, and build when relevant.
- Summarize changed files.
- Summarize verification result.
- Mention blockers clearly if something could not be verified.

## UI Rules

The UI should feel:
- clean
- calm
- premium
- operational
- dashboard-first
- elegant but readable
- inspired by Linear, Notion, and Vercel dashboard
- adapted with Dekoria premium interior design taste

Use shadcn/ui components first.
Do not reinvent base components.
Do not hardcode random colors.
Use theme tokens and CSS variables.

Use semantic Tailwind classes such as:
- bg-background
- text-foreground
- text-muted-foreground
- border-border
- bg-card
- text-card-foreground
- bg-primary
- text-primary-foreground

Do not use raw colors like:
- bg-blue-500
- text-purple-600
- arbitrary hex values

unless they are explicitly added to the theme.

For dashboard UI:
- desktop-first layout
- fixed sidebar
- top header
- summary cards
- data tables
- clean empty states
- clear status badges
- responsive mobile fallback

## shadcn/ui Rules

When working with shadcn/ui:
- Check components.json if it exists.
- Use bunx --bun shadcn@latest info to inspect the project after shadcn is initialized.
- Use bunx --bun shadcn@latest docs <component> before using unfamiliar components.
- Use bunx --bun shadcn@latest add <component> instead of manually creating shadcn components.
- Compose existing components before creating custom UI.
- Use official shadcn/ui skill when available.

Preferred dashboard components:
- Card
- Button
- Badge
- Table
- Dropdown Menu
- Dialog
- Sheet
- Tabs
- Separator
- Skeleton
- Avatar
- Form
- Input
- Textarea
- Select
- Calendar
- Command

## Architecture Rules

Suggested app routes:
- /dashboard
- /projects
- /projects/new
- /projects/[projectId]
- /daily-updates
- /design
- /materials
- /sales
- /content
- /ai-summary
- /users
- /settings

Suggested source layout:
- src/app for App Router routes
- src/components/ui for shadcn components only
- src/components/shared for reusable app components
- src/features/* for domain modules
- src/lib for shared utilities
- src/db for Drizzle schema, client, migrations, and seed
- src/server/actions for server actions
- src/mastra for all AI agents, tools, and workflows

Do not put business logic directly inside UI components.

## AI Rules

AI in this MVP is an operational assistant, not a generic chatbot.

All AI logic must live in src/mastra.

Server actions may call Mastra workflows, but must not call Gemini directly.

Main AI workflow:
Owner clicks “Generate Morning Summary”
-> server action checks auth and permission
-> calls Mastra workflow
-> Mastra tools fetch dashboard data through Drizzle
-> Gemini 3 Flash analyzes the data
-> save result to ai_summaries
-> save execution log to ai_runs
-> dashboard displays summary

AI output must be:
- Bahasa Indonesia by default
- concise
- actionable
- owner-friendly
- grounded in database data
- clear when data is missing
- never pretending if data is missing

Use the official Mastra skill before writing or modifying Mastra code.

## Database Rules

Use Drizzle ORM with PostgreSQL.

Core tables:
- users
- roles
- projects
- project_stages
- daily_updates
- design_tasks
- materials
- vendors
- leads
- content_assets
- media_assets
- ai_summaries
- ai_runs
- notifications

Prefer explicit enums or constrained values for:
- statuses
- health
- priority
- roles

Every table should have:
- id
- createdAt
- updatedAt where relevant

Use consistent camelCase in TypeScript and snake_case in database only if the existing Drizzle convention uses it.

## Auth & Permission Rules

Protected pages require authenticated users.
Protected server actions require session checks.
Owner/admin have full access in MVP.
AI summary generation is owner/admin only.

Permission helpers should live in:
src/lib/auth/permissions.ts

Expected helpers:
- hasPermission(user, permission)
- requirePermission(user, permission)
- requireRole(user, roles)

## Code Quality Bar

Do not generate placeholder-heavy code unless explicitly scaffolding.
Do not leave TODOs unless they are intentional and documented.
Do not hallucinate package APIs.
Check official docs, installed types, CLI docs, or official skills when unsure.
Prefer boring, reliable code over clever code.
Keep files focused.
Keep functions small.
Prefer named exports except for Next.js pages/layouts.

## Git Safety

Never run:
- git reset --hard
- git checkout -- .
- destructive cleanup commands

Do not overwrite user changes.
If unexpected unrelated changes are found, stop and report them.

## Final Response Style

Be concise.
Mention:
- what changed
- files touched
- commands run
- verification result
- remaining blockers if any

Do not paste entire files unless requested.
