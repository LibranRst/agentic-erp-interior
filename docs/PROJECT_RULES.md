# PROJECT_RULES.md
# SaaS Agentic Interior ERP — Global Project Rules

## Core Rules

- Use Bun for package management and local runtime.
- Use `bun dev`, `bun install`, and `bun run ...` commands.
- Use `bunx --bun` for shadcn CLI.
- Do not use npm, pnpm, or yarn unless explicitly requested.
- Do not generate `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock`.
- Use shadcn/ui preset `b5d2ZsMLI` as the UI source of truth.
- Use NeonDB with Drizzle ORM for database.
- Use ImageKit for file storage and optimization.
- Use Mastra for AI agent workflows.
- Use Gemini 3 Flash as default AI model with high reasoning.
- Use Gemini 3 Flash low reasoning as fallback.
- Deploy to Vercel unless changed later.

## Do Not

- Do not use Supabase.
- Do not store files directly in NeonDB.
- Do not call Gemini directly from UI components.
- Do not let AI execute arbitrary SQL.
- Do not overwrite generated shadcn components casually.
- Do not create a separate design system.

## Required Docs

- MVP_SYSTEM_BLUEPRINT.md
- STACK_DECISION.md
- UI_SYSTEM_GUIDE.md
- UI_WIREFRAME.md
- DATABASE_SCHEMA.md
- API_ACTIONS.md
- AI_AGENT_INSTRUCTIONS.md
- DEVELOPMENT_PHASE_PROMPTS.md
