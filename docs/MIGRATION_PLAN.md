# MIGRATION_PLAN.md
# SaaS Agentic Interior ERP

This document defines the database migration workflow using NeonDB and Drizzle ORM.

---

## 1. Database Stack

```txt
Database: NeonDB / PostgreSQL
ORM: Drizzle ORM
Migration Tool: Drizzle Kit
Package Manager: Bun
```

---

## 2. Migration Principles

```txt
- Drizzle schema is the source of truth.
- Do not manually change production database schema from Neon console.
- All schema changes must be represented in code.
- All schema changes must generate a migration file.
- Review generated migrations before applying.
- Use Neon branches for risky schema changes.
```

---

## 3. Recommended Folder Structure

```txt
src/
  db/
    schema/
      users.ts
      roles.ts
      projects.ts
      daily-updates.ts
      design-tasks.ts
      materials.ts
      vendors.ts
      leads.ts
      content-assets.ts
      media-assets.ts
      ai-summaries.ts
      ai-runs.ts
      notifications.ts
      index.ts
    client.ts
    seed.ts

drizzle/
  migrations/
```

---

## 4. Drizzle Config

Recommended file:

```txt
drizzle.config.ts
```

Example:

```ts
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
```

For migration environments, use `DATABASE_URL_UNPOOLED` if required by Neon.

---

## 5. Package Scripts

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:seed": "bun src/db/seed.ts"
  }
}
```

---

## 6. Standard Migration Flow

### Step 1 — Update Schema

Edit files in:

```txt
src/db/schema/
```

### Step 2 — Generate Migration

```bash
bun run db:generate
```

### Step 3 — Review Migration

Review generated SQL in:

```txt
drizzle/migrations/
```

Check for:

```txt
- destructive changes
- dropped columns
- renamed columns
- missing indexes
- invalid default values
- foreign key issues
```

### Step 4 — Apply Migration Locally

```bash
bun run db:migrate
```

### Step 5 — Test App

```bash
bun dev
```

### Step 6 — Run Seed if Needed

```bash
bun run db:seed
```

---

## 7. Neon Branching Strategy

Recommended branches:

```txt
main        - production database
dev         - shared development database
feature/*   - optional feature-specific branches
preview/*   - optional Vercel preview database branches
```

Use Neon branches for:

```txt
- risky schema changes
- AI-agent generated migrations
- major refactors
- testing seed data
- testing production-like data safely
```

---

## 8. Schema Change Rules

Safe changes:

```txt
- add nullable column
- add table
- add index
- add optional relation
```

Risky changes:

```txt
- drop column
- rename column
- change column type
- add non-null column without default
- delete table
- change foreign key behavior
- modify enum values
```

Destructive changes to avoid in MVP:

```txt
- dropping production data
- truncating tables
- replacing tables manually
- force-pushing schema to production
```

---

## 9. Rename Strategy

Instead of direct rename:

```txt
1. Add new column.
2. Backfill data.
3. Update app code to use new column.
4. Deploy.
5. Remove old column in a later migration.
```

---

## 10. Enum Strategy

For MVP, prefer string columns with validation constants in TypeScript if enum changes are expected.

Example:

```txt
project.status: text
```

Validated with Zod/constants:

```txt
lead_converted
survey
concept_design
design_revision
ded_progress
production
installation
finishing
handover
completed
on_hold
cancelled
```

This is easier to iterate during MVP.

---

## 11. Indexing Strategy

Add indexes for common filters:

```txt
projects.status
projects.health_status
projects.pm_id
projects.designer_id
daily_updates.project_id
daily_updates.update_date
design_tasks.project_id
design_tasks.status
materials.project_id
materials.status
materials.urgency_level
leads.status
leads.assigned_sales_id
content_assets.project_id
content_assets.content_status
ai_summaries.summary_type
ai_summaries.summary_date
ai_runs.workflow_name
ai_runs.status
media_assets.project_id
media_assets.related_type
```

---

## 12. Migration Review Checklist

```txt
[ ] Migration file is generated from Drizzle schema.
[ ] No accidental table drop.
[ ] No accidental column drop.
[ ] No accidental data wipe.
[ ] Foreign keys are correct.
[ ] Indexes are reasonable.
[ ] Defaults are valid.
[ ] Migration runs locally.
[ ] Seed data still works.
[ ] Dashboard still loads.
```

---

## 13. Production Migration Checklist

```txt
[ ] Backup or Neon branch exists.
[ ] Migration tested on dev/staging branch.
[ ] App build passes.
[ ] Critical flows tested.
[ ] Migration reviewed manually.
[ ] Rollback strategy is known.
```

---

## 14. AI Agent Migration Rules

When Codex/AI agent works on database changes:

```txt
- AI agent must edit Drizzle schema files.
- AI agent must not manually edit production database.
- AI agent must not use raw SQL unless creating migration or explicitly requested.
- AI agent must explain risky schema changes.
- AI agent must include migration command in final notes.
- AI agent must update DATABASE_SCHEMA.md when schema changes.
```

---

## 15. Done Criteria

Migration workflow is ready when:

```txt
- Drizzle config exists.
- Schema files are modular.
- Migration scripts exist.
- Local migration runs.
- Seed script runs.
- Neon database connection works.
- Docs match the implemented schema.
```
