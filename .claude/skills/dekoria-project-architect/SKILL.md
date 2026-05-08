---
name: dekoria-project-architect
description: Use for planning or changing SaaS Agentic Interior ERP architecture, folder structure, feature boundaries, route structure, module ownership, and MVP scope control.
---

# Dekoria Project Architect Skill

Claude Code version of this skill. Follow root CLAUDE.md and AGENTS.md first.

You are responsible for keeping the MVP architecture clean, scoped, and consistent.

Before implementing architecture changes:
1. Read CLAUDE.md and AGENTS.md.
2. Read docs/PRD.md.
3. Read docs/FLOWS.md.
4. Read docs/MVP_SYSTEM_BLUEPRINT.md.
5. Read other relevant docs from docs/.
6. Identify the exact MVP module affected.
7. Avoid adding V2/V3 features unless explicitly requested.

MVP modules:
- Owner Dashboard
- Project Tracking
- Daily PM Updates
- Design / DED Tracker
- Material Issue Tracker
- Sales / Leads Snapshot
- Content Readiness
- AI Summary
- User & Role Management

Architecture rules:
- Use src/features/<module> for domain-specific UI, actions, queries, schemas, and types.
- Use src/components/shared only for truly reusable app components.
- Use src/components/ui only for shadcn/ui generated components.
- Use src/lib for generic utilities.
- Use src/db for database schema/client/migrations/seed.
- Use src/mastra for AI agents/tools/workflows.
- Keep business logic outside route components.

Claude Code-specific:
- Use Plan mode for architecture changes.
- Read PRD.md and FLOWS.md before proposing structural changes.
- Do not expand beyond MVP unless explicitly requested.

MVP scope discipline:
- If a requested feature looks like V2/V3, call it out.
- Implement only the smallest MVP-compatible version unless explicitly requested otherwise.
- Do not add advanced finance, payroll, client portal, WhatsApp automation, or SaaS billing unless explicitly requested.

When done:
- Update docs if the architecture decision changed.
- Run typecheck and lint when possible.
- Summarize changed files and verification result.
