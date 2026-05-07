# MVP Gap Report

Audit date: 2026-05-07

Scope: current implementation audited against `AGENTS.md`, `docs/PRD.md`, `docs/FLOWS.md`, `docs/MVP_SYSTEM_BLUEPRINT.md`, `docs/DATABASE_SCHEMA.md`, `docs/API_ACTIONS.md`, `docs/UI_SYSTEM_GUIDE.md`, `docs/AI_AGENT_INSTRUCTIONS.md`, and `docs/MVP_ACCEPTENCE_CHECKLIST.md`.

Note: the requested checklist path `docs/MVP_ACCEPTANCE_CHECKLIST.md` does not exist. The repository currently contains `docs/MVP_ACCEPTENCE_CHECKLIST.md`.

Verification:

- `bun run lint` passed.
- `bun run typecheck` passed.
- `bun run build` passed.
- No implementation files were edited during this audit.

## 1. Owner Dashboard

Current status: Partial

Evidence from files:

- `app/(protected)/dashboard/page.tsx` loads live project metrics, design metrics, material metrics, sales metrics, latest PM updates, material issues, dashboard leads, content-ready projects, and latest AI summary.
- `app/(protected)/dashboard/page.tsx` still defines hardcoded `projectRows` for the Project Health Overview.
- `src/features/projects/queries.ts`, `src/features/daily-updates/queries.ts`, `src/features/design/queries.ts`, `src/features/materials/queries.ts`, `src/features/leads/queries.ts`, and `src/features/content/queries.ts` provide the dashboard data sources.
- `app/(protected)/loading.tsx` provides a protected-layout loading state.

Exact missing pieces:

- Project Health Overview still uses hardcoded demo rows instead of live database data.
- No route-level `error.tsx` exists for dashboard failure states.
- Dashboard data is not consistently role-scoped; any authenticated user with `dashboard:view` can see broad company metrics.
- No dedicated dashboard query/action module exists for the full dashboard data contract.

Risk level: High

Suggested fix order: 1

## 2. Project Tracking

Current status: Partial

Evidence from files:

- `app/(protected)/projects/page.tsx` implements project list, metrics, filters, table, and empty state.
- `app/(protected)/projects/new/page.tsx` implements owner/admin-only project creation.
- `app/(protected)/projects/[projectId]/page.tsx` implements project detail tabs and project edit access for owner/admin.
- `src/server/actions/projects.ts` implements `getProjects`, `getProjectById`, `createProjectAction`, and `updateProjectAction`.
- `src/features/projects/schemas.ts` validates project mutation input with Zod.
- `src/lib/db/schema.ts` includes project PM/designer relations, status, health, progress, deadlines, budget warning, and content-ready status.

Exact missing pieces:

- PM limited status/health/progress update is not implemented, despite the API blueprint allowing limited PM updates.
- Project list/detail access is not scoped for non-owner roles beyond authentication and `project:view`.
- No delete/archive action exists.
- No dedicated quick actions for `updateProjectStatus`, `updateProjectHealth`, or `updateProjectProgress`.
- Project detail AI Summary tab is scaffolded by an empty `aiSummaries` array from `getProjectByIdQuery`, so project-specific AI summaries are not functional.

Risk level: High

Suggested fix order: 2

## 3. Daily PM Updates

Current status: Partial

Evidence from files:

- `app/(protected)/daily-updates/page.tsx` implements Daily Updates route, metrics, filters, create dialog, table, and empty state.
- `src/server/actions/daily-updates.ts` implements `createDailyUpdateAction`, page data loading, latest updates, permission checks, PM assignment check on create, project progress/health sync, and media metadata creation.
- `src/features/daily-updates/schemas.ts` validates project, date, summary, issue/blocker, next action, progress, health, and media.
- `app/(protected)/projects/[projectId]/page.tsx` displays daily updates on project detail.
- `app/(protected)/dashboard/page.tsx` displays latest PM updates.

Exact missing pieces:

- No update action for daily updates.
- No delete action for daily updates.
- No edit UI for submitted PM updates.
- No route-level error state.
- Dashboard and page loading state is generic, not module-specific.

Risk level: Medium

Suggested fix order: 5

## 4. Design / DED Tracker

Current status: Partial

Evidence from files:

- `app/(protected)/design/page.tsx` implements design task list, metrics, filters, create/edit dialog, table, and empty state.
- `src/server/actions/design.ts` implements create/update design task actions with session, permission, role checks, Zod validation, media metadata creation, and designer-only update ownership checks.
- `src/features/design/schemas.ts` validates project, designer, task name, design type, status, approval status, revision count, due date, notes, and media.
- `src/lib/db/schema.ts` includes `design_tasks` with project, designer, design type, status, approval status, revision count, and due date.
- `app/(protected)/dashboard/page.tsx` shows pending design tasks.

Exact missing pieces:

- Designer create flow can create tasks for any selected project; it does not validate that the designer is assigned to the project.
- Owner/admin can create tasks without requiring an assigned designer.
- No delete/archive action exists.
- No dedicated status-only or approval-only update action exists.
- No route-level error state.

Risk level: Medium

Suggested fix order: 6

## 5. Material Tracker

Current status: Partial

Evidence from files:

- `app/(protected)/materials/page.tsx` implements material list, metrics, filters, create/edit dialog, table, and empty state.
- `src/server/actions/materials.ts` implements create/update material actions with session, permission, role checks, Zod validation, media metadata creation, and dashboard/project revalidation.
- `src/features/materials/schemas.ts` validates project, material name, vendor, status, urgency, quantity, unit, ETA, issue notes, and media.
- `src/lib/db/schema.ts` includes `materials` and `vendors`.
- `app/(protected)/dashboard/page.tsx` shows material warnings.

Exact missing pieces:

- Vendor relation exists, but there is no vendor CRUD UI/action.
- Purchasing users can update all material records; no ownership or project/team scoping exists.
- No delete/archive action exists.
- No dedicated status-only or urgency-only update action exists.
- No route-level error state.

Risk level: Medium

Suggested fix order: 7

## 6. Sales / Leads Snapshot

Current status: Partial

Evidence from files:

- `app/(protected)/sales/page.tsx` implements lead list, metrics, filters, create/edit dialog, conversion dialog, table, and empty state.
- `src/server/actions/leads.ts` implements create/update/convert actions with session, permission, role checks, sales ownership scoping for updates, and project conversion.
- `src/features/leads/schemas.ts` validates lead name, source, interest, value, status, assigned sales, follow-up date, notes, media, and conversion fields.
- `app/(protected)/dashboard/page.tsx` shows sales snapshot and dashboard leads.
- `src/lib/db/schema.ts` includes leads and converted project relation.

Exact missing pieces:

- Lead email is stored as optional text and is not validated as an email address.
- `convertLeadToProjectAction` is not transactional. If project creation succeeds but lead update fails, an orphan project can be created.
- No delete/archive action exists.
- Sales can only update assigned leads, but owner/admin can assign broadly without further workflow guardrails.
- No route-level error state.

Risk level: Medium

Suggested fix order: 8

## 7. Content Readiness

Current status: Partial

Evidence from files:

- `app/(protected)/content/page.tsx` implements content list, metrics, filters, create/edit dialog, table, and empty state.
- `src/server/actions/content.ts` implements create/update content asset actions with session, permission, role checks, Zod validation, media metadata creation, and project content-ready status sync.
- `src/features/content/schemas.ts` validates project, room/area, visual status, footage status, content opportunity, suggested angle, status, publish URL, notes, and media.
- `app/(protected)/dashboard/page.tsx` shows content readiness.
- `src/lib/db/schema.ts` includes content assets and media assets.

Exact missing pieces:

- No delete/archive action exists.
- Marketing users can update all content assets; no assignee or project scoping exists.
- Dashboard shows content-ready assets, but project-level readiness is only partially reflected.
- No dedicated content status-only action exists.
- No route-level error state.

Risk level: Medium

Suggested fix order: 9

## 8. AI Morning Summary

Current status: Partial

Evidence from files:

- `src/server/actions/ai-summary.ts` implements owner/admin-only `generateMorningSummaryAction`.
- `src/mastra/workflows/generate-morning-summary.ts` implements a Mastra workflow, fetches dashboard data, calls OwnerOpsAgent, saves `ai_summaries`, and logs `ai_runs`.
- `src/mastra/agents/owner-ops-agent.ts` defines OwnerOpsAgent, Bahasa Indonesia instructions, grounded-data rules, and Mastra tools.
- `src/mastra/tools/get-dashboard-data.ts` builds the ERP data bundle from Drizzle queries.
- `src/mastra/persistence/ai-runs.ts` and `src/mastra/persistence/ai-summaries.ts` persist AI run and summary records.
- `app/(protected)/ai-summary/page.tsx` displays latest summary and history.
- `app/(protected)/dashboard/page.tsx` displays latest AI summary and generate button for owner/admin.

Exact missing pieces:

- Live Gemini/Mastra generation was not verified with real API credentials during this audit.
- Mastra tools do not receive current user context and do not independently validate user permissions.
- If dashboard data fetching fails before `startAiRun`, no failed `ai_runs` record is created.
- Only morning summary exists; project risk/design/material/content summary actions named in `docs/API_ACTIONS.md` are not implemented.
- Project detail AI Summary tab is not connected to real summaries.

Risk level: High

Suggested fix order: 3

## 9. Auth & Roles

Current status: Partial

Evidence from files:

- `lib/auth.ts` configures Better Auth with Drizzle tables.
- `proxy.ts` redirects protected paths without a session cookie.
- `src/lib/auth/permissions.ts` defines roles, permissions, current user lookup, `requireUser`, `requirePermission`, `requireRole`, and protected page helpers.
- `app/(public)/login/page.tsx` and `app/(public)/login/login-form.tsx` implement login.
- `app/(protected)/users/page.tsx`, `app/(protected)/users/invite-user-form.tsx`, and `src/server/actions/users.ts` implement basic owner/admin invite flow and user listing.

Exact missing pieces:

- Proxy only checks session cookie presence; full active-user and app-role validation happens later in page/action code.
- Dashboard data is visible to all roles with `dashboard:view`, without module-level redaction or scoping.
- Sample seed users are app profiles only unless invite/auth account setup is completed.
- No non-owner restriction test matrix is present.
- No user status update, role update, or revoke UI is implemented, aside from invite revoke action.

Risk level: High

Suggested fix order: 4

## 10. Media Assets

Current status: Partial

Evidence from files:

- `src/lib/db/schema.ts` includes `media_assets` with ImageKit metadata fields.
- `app/api/imagekit/upload-auth/route.ts` generates ImageKit upload auth and validates upload context.
- `src/features/media/server.ts` persists uploaded media metadata.
- `src/features/media/queries.ts` fetches media by project and related record.
- Daily update, design, material, lead, content, project documentation, and avatar flows can save media metadata.
- `app/(protected)/media/page.tsx` exists.

Exact missing pieces:

- `/media` route is a scaffold using `ModulePage`, hardcoded metrics, and hardcoded rows.
- No real media library list/filter/view exists.
- No media delete/archive action exists.
- No upload UI exists on `/media`; uploads are embedded in module forms.
- No route-level error state.

Risk level: Medium

Suggested fix order: 10

## 11. User & Role Management

Current status: Partial

Evidence from files:

- `app/(protected)/users/page.tsx` lists active users and recent invites.
- `app/(protected)/users/invite-user-form.tsx` creates manual setup links.
- `app/(public)/invite/[token]/page.tsx` validates pending invites.
- `app/(public)/invite/[token]/accept-invite-form.tsx` accepts invites and creates Better Auth credentials.
- `src/server/actions/users.ts` implements create invite, revoke invite, accept invite, and user/invite query.

Exact missing pieces:

- No visible revoke invite button on the users page, despite server action existing.
- No role change UI/action.
- No user activation/deactivation UI/action.
- No user edit flow.
- No empty state for users/invites tables.

Risk level: Medium

Suggested fix order: 11

## 12. System Quality

Current status: Partial

Evidence from files:

- `bun run lint` passed.
- `bun run typecheck` passed.
- `bun run build` passed.
- `app/(protected)/loading.tsx` provides a generic loading state.
- `components/shared/data-table.tsx` provides shared table shell, empty state, and loading skeleton components.
- `app/(protected)/media/page.tsx` and `app/(protected)/settings/page.tsx` are scaffold pages.
- No `app/**/error.tsx` files exist.

Exact missing pieces:

- No route-level error boundaries.
- `/media` and `/settings` are placeholder/scaffold routes.
- The MVP checklist filename is misspelled as `MVP_ACCEPTENCE_CHECKLIST.md`.
- No browser smoke test was run during this audit.
- Seed command was not executed during this audit, so seed runtime success is not verified.
- No explicit automated permission/regression tests exist.

Risk level: Medium

Suggested fix order: 12

## Recommended Fix Order Summary

1. Replace hardcoded dashboard Project Health Overview with live scoped data.
2. Complete project tracking authorization and PM limited update flows.
3. Harden AI summary run logging, permission context, and runtime verification.
4. Tighten auth/role visibility and non-owner restriction behavior.
5. Add daily update edit/delete flows.
6. Scope design task creation/update behavior.
7. Complete material/vendor ownership gaps.
8. Make lead conversion transactional and validate lead email.
9. Scope content readiness updates and add archive/delete.
10. Replace `/media` scaffold with real media library or remove it from MVP navigation.
11. Finish user/invite management operations.
12. Add route error boundaries, browser smoke checks, seed verification, and fix the checklist filename.
