---
name: dekoria-db-drizzle
description: Use for Neon Postgres, Drizzle ORM schema, migrations, seed data, database relations, enums, queries, and database-backed server actions.
---

# Dekoria Drizzle Database Skill

Use this skill for database schema and query work.

Before editing database code:
1. Read AGENTS.md.
2. Read docs/PRD.md.
3. Read docs/FLOWS.md.
4. Read docs/DATABASE_SCHEMA.md.
5. Inspect existing src/db files.
6. Preserve existing naming conventions.

Core database tables:
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

Rules:
- Use Drizzle ORM.
- Use PostgreSQL-compatible schema.
- Keep relations explicit.
- Use clear status enums or constrained string unions.
- Avoid nullable fields unless the workflow requires them.
- Include timestamps.
- Validate inputs before writes.
- Never expose raw database credentials.
- Never allow arbitrary SQL execution from users or AI.
- Do not create tables outside MVP scope unless explicitly requested.

Queries should be:
- typed
- scoped
- readable
- reusable where appropriate

Server action rules:
- Check session.
- Check permissions.
- Validate input.
- Use typed Drizzle queries.
- Return predictable success/error states.

After changes:
- Generate/check migrations if configured.
- Run typecheck.
- Update seed data if schema changes require it.
