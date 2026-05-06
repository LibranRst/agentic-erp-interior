# MVP_SYSTEM_BLUEPRINT.md
# SaaS Agentic Interior ERP — MVP System Blueprint

## 1. Product Objective

SaaS Agentic Interior ERP is an internal operating system for an interior design and contractor business. The first MVP is focused on visibility, project tracking, daily reporting, material/design bottleneck tracking, sales snapshot, content readiness, and AI-powered owner summaries.

The MVP should answer one main question:

> What is happening in the company today, what is urgent, and what should the owner pay attention to?

---

## 2. MVP Core Promise

The MVP helps:

1. Owner see all active projects from one dashboard.
2. PM update daily progress without scattered chat reports.
3. Designer update design, render, revision, and DED status.
4. Purchasing track material/vendor issues.
5. Sales record new and hot leads.
6. Marketing see which projects are ready for content.
7. AI summarize operational condition for the owner.

---

## 3. Final Tech Stack

```txt
Frontend: Next.js App Router + TypeScript
Package Manager: Bun
Local Runtime: Bun
UI: shadcn/ui custom preset b5d2ZsMLI
Styling: Tailwind CSS + shadcn CSS variables
Database: NeonDB / PostgreSQL
ORM: Drizzle ORM
Auth: Better Auth by default; Clerk acceptable for faster MVP
Storage: ImageKit
AI Framework: Mastra
AI Model: Gemini 3 Flash
AI Default Reasoning: High
AI Fallback: Gemini 3 Flash with low reasoning
Deployment: Vercel
```

### Initialization Command

```bash
bunx --bun shadcn@latest init --preset b5d2ZsMLI --template next --pointer
```

---

## 4. Roles

```txt
owner
admin
project_manager
designer
purchasing
sales
marketing
```

### Role Summary

| Role | Main Responsibility |
|---|---|
| Owner | See all operational condition and AI summary |
| Admin | Manage operational records and users |
| PM | Update project progress and field issues |
| Designer | Update design/render/revision/DED status |
| Purchasing | Update material/vendor/ETA issues |
| Sales | Update leads and follow-up status |
| Marketing | Update content readiness and published assets |

---

## 5. MVP Modules

```txt
1. Owner Dashboard
2. Project Tracking
3. Daily Updates
4. Design / DED Tracker
5. Material Issue Tracker
6. Sales / Leads Snapshot
7. Content Readiness
8. AI Summary
9. User & Role Management
10. Media Assets
```

---

## 6. App Sitemap

```txt
/app
  /dashboard
  /projects
  /projects/new
  /projects/[projectId]
  /daily-updates
  /design
  /materials
  /sales
  /content
  /ai-summary
  /media
  /users
  /settings
```

---

## 7. Dashboard Blueprint

### Summary Cards

- Active Projects
- Urgent Projects
- Pending Design / DED
- Material Issues
- New Leads
- Content Ready Projects

### Main Sections

- AI Morning Summary
- Project Health Overview
- Latest PM Updates
- Design Status Snapshot
- Material Warning Snapshot
- Sales Snapshot
- Content Readiness Snapshot

---

## 8. Core Data Model

Core tables:

```txt
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
```

---

## 9. AI Architecture

AI must not be built as a free-form chatbot in MVP. It should be an operational assistant that reads structured ERP data through safe tools.

### Main Agent

```txt
OwnerOpsAgent
```

### Responsibilities

- Generate morning summary
- Detect urgent projects
- Summarize PM updates
- Identify design / DED bottlenecks
- Identify material/vendor issues
- Summarize sales snapshot
- Suggest content opportunities

### Model Strategy

```txt
Default:
- Model: Gemini 3 Flash
- Reasoning: High

Fallback:
- Model: Gemini 3 Flash
- Reasoning: Low
```

### AI Flow

```txt
Owner clicks Generate Morning Summary
↓
Next.js server action calls Mastra workflow
↓
Mastra workflow calls safe ERP tools
↓
Tools query NeonDB via Drizzle
↓
OwnerOpsAgent analyzes data using Gemini 3 Flash
↓
Final summary is saved to ai_summaries
↓
Run metadata is saved to ai_runs
↓
Dashboard displays the summary
```

---

## 10. UI Foundation

The UI source of truth is the custom shadcn preset:

```bash
bunx --bun shadcn@latest init --preset b5d2ZsMLI --template next --pointer
```

### UI Direction

```txt
Clean
Quiet
Premium
Readable
Dashboard-first
Data-dense
Card-based
Table-heavy
Minimal decoration
```

### UI Rule

Use shadcn components first. Build custom ERP components only as composition wrappers around shadcn primitives.

---

## 11. Package & Runtime Rules

- Use Bun for all package installation and script execution.
- Use `bun dev` for local development.
- Use `bunx --bun` for shadcn CLI.
- Do not use npm, pnpm, or yarn unless explicitly requested.
- Keep Bun lockfile as the source of truth.
- Production is Vercel-managed Next.js runtime unless changed later.

---

## 12. MVP Exclusions

Not included in MVP V1:

- Full finance module
- Invoice system
- Payroll
- Advanced CRM
- Vendor payment tracking
- Client portal
- Native mobile app
- WhatsApp automation
- Advanced inventory
- Complex approval workflow
- SaaS billing

---

## 13. Development Phases

```txt
Phase 1 — Project Setup & UI Foundation
Phase 2 — NeonDB + Drizzle Setup
Phase 3 — Auth & Roles
Phase 4 — Database Schema & Seed Data
Phase 5 — Project Module
Phase 6 — Daily Updates Module
Phase 7 — Design / DED Module
Phase 8 — Material Tracker
Phase 9 — Sales Snapshot
Phase 10 — Content Readiness
Phase 11 — ImageKit Media Uploads
Phase 12 — Mastra AI Agent Setup
Phase 13 — AI Summary Dashboard Integration
Phase 14 — UI Polish & QA
```
