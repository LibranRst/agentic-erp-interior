# DEVELOPMENT_PHASE_PROMPTS.md
# SaaS Agentic Interior ERP — Development Phase Prompts

Use these prompts for Codex/AI agent development. All prompts assume the final stack below.

```txt
Package Manager: Bun
Local Runtime: Bun
Framework: Next.js App Router
UI: shadcn/ui custom preset b5d2ZsMLI
Database: NeonDB / PostgreSQL
ORM: Drizzle ORM
Auth: Better Auth by default; Clerk allowed if faster MVP is preferred
Storage: ImageKit
AI Framework: Mastra
AI Model: Gemini 3 Flash
Deployment: Vercel
```

Global rules:

- Use Bun for all commands.
- Use `bunx --bun` for shadcn CLI.
- Do not use npm, pnpm, or yarn.
- Do not use Supabase.
- Use Drizzle for database access.
- Use ImageKit for media storage.
- Use Mastra for AI workflows.
- Do not call Gemini directly from UI components or random server actions.
- Follow shadcn preset `b5d2ZsMLI` as UI source of truth.

---

## Phase 1 — Project Setup & UI Foundation

Prompt:

```txt
Initialize the SaaS Agentic Interior ERP project using Next.js App Router, TypeScript, Bun, Tailwind, and shadcn/ui.

Use this exact shadcn initialization command:

bunx --bun shadcn@latest init --preset b5d2ZsMLI --template next --pointer

Requirements:
1. Use Bun as package manager and local runtime.
2. Ensure the project runs with bun dev.
3. Do not use npm, pnpm, or yarn.
4. Install required shadcn components using bunx --bun.
5. Create app shell with sidebar and header.
6. Create base routes for dashboard, projects, daily-updates, design, materials, sales, content, ai-summary, media, users, and settings.
7. Keep UI aligned with the existing shadcn preset.
```

Suggested components:

```bash
bunx --bun shadcn@latest add button card badge input textarea select dropdown-menu dialog sheet tabs table separator skeleton alert form calendar popover command avatar breadcrumb sidebar
```

---

## Phase 2 — NeonDB + Drizzle Setup

Prompt:

```txt
Set up NeonDB and Drizzle ORM for the ERP project.

Requirements:
1. Install Drizzle dependencies using Bun.
2. Create db connection in src/lib/db.
3. Create Drizzle schema file.
4. Configure DATABASE_URL.
5. Add migration scripts using Bun.
6. Do not use Supabase.
7. Ensure all app queries are planned through Drizzle ORM.
```

---

## Phase 3 — Auth & Roles

Prompt:

```txt
Implement authentication and role-based access for the ERP.

Default choice: Better Auth with NeonDB and Drizzle.
Alternative: Clerk only if faster MVP setup is prioritized.

Requirements:
1. Create roles and users schema relationship.
2. Add current user helper.
3. Add requireRole helper.
4. Protect app routes.
5. Show role-based sidebar navigation.
6. Make sure server actions validate user role.
```

---

## Phase 4 — Database Schema & Seed Data

Prompt:

```txt
Create the MVP database schema using Drizzle for these tables:

roles
users
projects
project_stages
daily_updates
design_tasks
vendors
materials
leads
content_assets
media_assets
ai_summaries
ai_runs
notifications

Requirements:
1. Use UUID primary keys.
2. Add foreign key relationships.
3. Add created_at and updated_at timestamps.
4. Add recommended indexes.
5. Add seed data for roles and sample project statuses.
6. Do not store files in database; use media_assets metadata only.
```

---

## Phase 5 — Project Module

Prompt:

```txt
Build the Project module.

Requirements:
1. Create projects list page with search and filters.
2. Create project detail page with tabs.
3. Create new project form.
4. Create edit project action.
5. Use Drizzle server actions.
6. Use Zod validation.
7. Use shadcn UI components and preset styling.
8. Add status and health badges.
```

---

## Phase 6 — Daily Updates Module

Prompt:

```txt
Build the Daily Updates module for PM progress reports.

Requirements:
1. Create daily update form.
2. Create daily update table/timeline.
3. Connect updates to project detail page.
4. Allow progress percentage and health status update.
5. Support attachment linkage through media_assets.
6. Use ImageKit for uploads.
7. Show latest PM updates on dashboard.
```

---

## Phase 7 — Design / DED Module

Prompt:

```txt
Build the Design / DED Tracker.

Requirements:
1. Create design tasks table and form.
2. Support design type, status, approval status, revision count, due date, and notes.
3. Link design files through media_assets and ImageKit.
4. Show pending design tasks on dashboard.
5. Use role-based access for designer updates.
```

---

## Phase 8 — Material Tracker

Prompt:

```txt
Build the Material Issue Tracker.

Requirements:
1. Create material list page.
2. Create material form.
3. Support vendor relation, status, urgency level, ETA, issue notes.
4. Show delayed/high/critical material issues on dashboard.
5. Use Drizzle actions and Zod validation.
```

---

## Phase 9 — Sales Snapshot

Prompt:

```txt
Build the Sales / Leads Snapshot module.

Requirements:
1. Create leads table and form.
2. Support lead status, source, interest, estimated value, assigned sales, next follow-up.
3. Add convert lead to project action.
4. Show new/hot/follow-up leads on dashboard.
```

---

## Phase 10 — Content Readiness

Prompt:

```txt
Build the Content Readiness module.

Requirements:
1. Create content assets list and form.
2. Support room/area, visual status, footage status, content opportunity, suggested angle, content status, publish URL.
3. Connect media through ImageKit and media_assets.
4. Show content-ready projects on dashboard.
```

---

## Phase 11 — ImageKit Media Uploads

Prompt:

```txt
Set up ImageKit media upload flow.

Requirements:
1. Add ImageKit environment variables.
2. Create upload auth route or server action.
3. Create reusable MediaUploader component.
4. Store uploaded media metadata in media_assets table.
5. Support linking media to project, daily update, design task, material, content asset, lead attachment, and user avatar.
6. Never store actual files in NeonDB.
```

---

## Phase 12 — Mastra AI Agent Setup

Prompt:

```txt
Set up Mastra as the AI agent framework.

Requirements:
1. Install Mastra and Google Gemini provider using Bun.
2. Create src/mastra structure.
3. Configure Gemini API using GOOGLE_GENERATIVE_AI_API_KEY.
4. Create OwnerOpsAgent.
5. Use Gemini 3 Flash as default model with high reasoning.
6. Add fallback using Gemini 3 Flash with low reasoning.
7. Create safe tools that fetch ERP data through Drizzle.
8. Do not allow arbitrary SQL execution.
9. Log every AI run into ai_runs.
10. Save final summaries into ai_summaries.
```

---

## Phase 13 — AI Summary Dashboard Integration

Prompt:

```txt
Connect the AI summary workflow to the owner dashboard.

Requirements:
1. Add Generate AI Summary button.
2. Call Mastra workflow from server action.
3. Show loading state.
4. Display final AI summary in dashboard card.
5. Save and display AI summary history.
6. Show model name, reasoning level, generated time, and status in AI Summary page.
```

---

## Phase 14 — UI Polish & QA

Prompt:

```txt
Polish the ERP UI and run QA.

Requirements:
1. Keep shadcn preset as source of truth.
2. Improve spacing, table readability, badges, empty states, and loading states.
3. Ensure responsive behavior.
4. Ensure all forms have validation.
5. Ensure all protected actions check role permission.
6. Ensure Bun commands work:
   - bun dev
   - bun run build
   - bun run lint
7. Do not introduce npm, pnpm, or yarn lockfiles.
```
