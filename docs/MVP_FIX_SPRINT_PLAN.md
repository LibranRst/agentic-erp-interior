# MVP Fix Sprint Plan

Created: 2026-05-07

Purpose: prioritize the MVP gap fixes into small, safe batches that move Dekoria ERP toward internal testing readiness without expanding into V2/V3 scope.

Source docs read:

- `docs/MVP_GAP_REPORT.md`
- `docs/MVP_ACCEPTENCE_CHECKLIST.md`
- `AGENTS.md`
- `docs/PRD.md`
- `docs/FLOWS.md`

Note: `docs/MVP_ACCEPTANCE_CHECKLIST.md` was requested but does not exist. The current checklist file is misspelled as `docs/MVP_ACCEPTENCE_CHECKLIST.md`; Sprint A includes fixing this documentation issue.

## Sprint A: App-Breaking Issues

Goal:

Stabilize the MVP shell so all accepted routes are real, protected, recover gracefully, and do not ship obvious scaffold/demo content.

Files likely affected:

- `docs/MVP_ACCEPTENCE_CHECKLIST.md`
- `docs/MVP_ACCEPTANCE_CHECKLIST.md`
- `app/(protected)/media/page.tsx`
- `app/(protected)/settings/page.tsx`
- `app/(protected)/error.tsx`
- `app/error.tsx`
- `app/not-found.tsx`
- `components/shared/module-page.tsx`
- `components/shared/data-table.tsx`
- `components/layout/app-sidebar.tsx`
- `lib/navigation.ts`

Exact acceptance criteria:

- Canonical checklist exists at `docs/MVP_ACCEPTANCE_CHECKLIST.md`.
- Any old misspelled checklist path is either removed after safe migration or kept only with a clear pointer to the canonical file.
- No MVP route renders hardcoded `Scaffold`, `Planned`, or fake operational rows.
- `/media` is either a real read-only media library backed by `media_assets` or is removed from MVP navigation until functional.
- `/settings` is either reduced to a minimal real owner/admin settings/status page or removed from MVP navigation until functional.
- Protected route errors render a clear, calm error boundary instead of a raw crash.
- Not-found behavior exists for missing records/routes.
- Existing protected layout and login flow continue to work.

Verification commands:

- `bun run lint`
- `bun run typecheck`
- `bun run build`
- `rg -n "Scaffold|Planned|projectRows|placeholder page|ModulePage" app components src docs`
- Browser smoke check: `/dashboard`, `/projects`, `/daily-updates`, `/design`, `/materials`, `/sales`, `/content`, `/ai-summary`, `/users`

What must not be touched:

- Do not add finance, payroll, inventory, SaaS billing, client portal, WhatsApp automation, or advanced CRM.
- Do not change the database schema in this sprint unless required only for the checklist filename docs issue, which should not need schema work.
- Do not rewrite the app shell or design system.
- Do not replace Better Auth, Drizzle, ImageKit, Mastra, or shadcn/ui.

## Sprint B: Data Model / Server Action Issues

Goal:

Make core mutations reliable, permission-safe, and transaction-safe before deeper UI and AI integration work.

Files likely affected:

- `src/lib/auth/permissions.ts`
- `src/server/actions/projects.ts`
- `src/server/actions/daily-updates.ts`
- `src/server/actions/design.ts`
- `src/server/actions/materials.ts`
- `src/server/actions/leads.ts`
- `src/server/actions/content.ts`
- `src/server/actions/media.ts`
- `src/server/actions/users.ts`
- `src/features/projects/queries.ts`
- `src/features/daily-updates/queries.ts`
- `src/features/design/queries.ts`
- `src/features/materials/queries.ts`
- `src/features/leads/queries.ts`
- `src/features/content/queries.ts`
- `src/features/leads/schemas.ts`
- `src/lib/db/index.ts`
- `src/lib/db/schema.ts`
- `drizzle/*`

Exact acceptance criteria:

- Lead email input is validated as a real email when present.
- `convertLeadToProjectAction` is atomic: project creation and lead conversion either both succeed or both fail.
- PM users can only view/update assigned projects and assigned daily updates.
- Designers can only create/update design tasks for assigned projects unless owner/admin.
- Purchasing and marketing server actions have explicit MVP scoping rules, even if owner/admin remain full access.
- Server actions that mutate records have predictable return states and do not expose raw internal errors to users.
- Daily update edit/delete or archive decisions are explicitly implemented or documented as out of current MVP if intentionally deferred.
- Delete/archive behavior is conservative and does not destroy operational history unless explicitly required.
- Any schema change has a Drizzle migration and seed compatibility update.

Verification commands:

- `bun run lint`
- `bun run typecheck`
- `bun run build`
- `bun run db:generate` if schema changes are made.
- `bun run db:migrate` against a safe development database if migrations are created.
- `bun run db:seed` against a safe development database.
- Targeted permission smoke checks using owner/admin, PM, designer, purchasing, sales, and marketing accounts.

What must not be touched:

- Do not introduce advanced approval workflow, vendor scoring, accounting, inventory, or HR.
- Do not allow arbitrary SQL execution.
- Do not loosen auth checks to make UI easier.
- Do not delete historical operational records by default.
- Do not change enum values without checking existing seed/migrations and all UI badges.

## Sprint C: Dashboard Data Integration

Goal:

Make the Owner Dashboard a live morning briefing surface with no fake rows and with role-safe, database-backed operational data.

Files likely affected:

- `app/(protected)/dashboard/page.tsx`
- `src/features/dashboard/queries.ts`
- `src/features/dashboard/types.ts`
- `src/server/actions/dashboard.ts`
- `src/features/projects/queries.ts`
- `src/features/daily-updates/queries.ts`
- `src/features/design/queries.ts`
- `src/features/materials/queries.ts`
- `src/features/leads/queries.ts`
- `src/features/content/queries.ts`
- `src/lib/auth/permissions.ts`
- `components/shared/data-table.tsx`
- `components/shared/metric-card.tsx`

Exact acceptance criteria:

- Project Health Overview uses live project risk data from Drizzle.
- Dashboard shows active projects count, urgent projects, latest PM updates, pending design/DED tasks, material issues, sales/leads snapshot, content readiness snapshot, and latest AI summary.
- Dashboard has clear empty states for every section.
- Dashboard has a route-level error state.
- Dashboard remains usable on tablet/mobile with no table or card overlap.
- Dashboard metrics and lists follow the MVP permission model.
- No hardcoded demo projects, fake metrics, or static operational records remain.
- Owner can understand company condition from the dashboard within 30 seconds.

Verification commands:

- `bun run lint`
- `bun run typecheck`
- `bun run build`
- `rg -n "projectRows|Kebayoran|Pondok|BSD|hardcoded|Scaffold|Planned" app/(protected)/dashboard src/features/dashboard src/server/actions`
- Browser smoke check `/dashboard` with seeded data.
- Browser smoke check `/dashboard` with empty or near-empty data.
- Responsive check for mobile/tablet widths.

What must not be touched:

- Do not add analytics dashboards beyond MVP summary cards and operational lists.
- Do not add charts unless required by existing shadcn/dashboard pattern and low-risk.
- Do not move business logic into route components.
- Do not change unrelated module CRUD flows in this sprint.

## Sprint D: Module Completeness

Goal:

Finish the minimum complete workflows for each MVP module: create, view, update where required, dashboard visibility, empty states, and role-appropriate access.

Files likely affected:

- `app/(protected)/projects/page.tsx`
- `app/(protected)/projects/new/page.tsx`
- `app/(protected)/projects/[projectId]/page.tsx`
- `app/(protected)/daily-updates/page.tsx`
- `app/(protected)/design/page.tsx`
- `app/(protected)/materials/page.tsx`
- `app/(protected)/sales/page.tsx`
- `app/(protected)/content/page.tsx`
- `app/(protected)/users/page.tsx`
- `src/features/projects/**`
- `src/features/daily-updates/**`
- `src/features/design/**`
- `src/features/materials/**`
- `src/features/leads/**`
- `src/features/content/**`
- `src/features/media/**`
- `src/server/actions/projects.ts`
- `src/server/actions/daily-updates.ts`
- `src/server/actions/design.ts`
- `src/server/actions/materials.ts`
- `src/server/actions/leads.ts`
- `src/server/actions/content.ts`
- `src/server/actions/users.ts`

Exact acceptance criteria:

- PM can create daily updates with project, summary, issue/blocker, next action, progress, and optional media.
- Daily updates appear on project detail and dashboard.
- Designer can update design/render/revision/DED status, approval status, revision count, due date, notes, and files.
- Purchasing can update material status, urgency, ETA, vendor relation, and issue notes.
- Sales/admin can input leads, update status/source/follow-up, and convert qualified leads safely.
- Marketing can create/update content readiness with room/area, footage status, opportunity, content status, and media.
- Owner/admin can view and manage users/invites for MVP role access.
- Each module page has search/filter where already expected, table/list state, empty state, and no fake rows.
- Project detail tabs show real linked daily updates, design tasks, materials, leads, content assets, and media.

Verification commands:

- `bun run lint`
- `bun run typecheck`
- `bun run build`
- `bun run db:seed` against a safe development database.
- Browser workflow check for each role:
  - Owner/admin project create and edit.
  - PM daily update create.
  - Designer design task create/update.
  - Purchasing material create/update.
  - Sales lead create/update.
  - Owner/admin lead convert.
  - Marketing content asset create/update.
  - Owner/admin invite user.

What must not be touched:

- Do not build advanced CRM, invoicing, payroll, vendor payment tracking, inventory, or client portal.
- Do not introduce multi-step approval engines.
- Do not add new modules outside the MVP sitemap.
- Do not replace existing shadcn/ui primitives with a second component system.

## Sprint E: AI Summary Integration

Goal:

Make the AI morning summary reliable, grounded, logged, owner/admin-only, and useful for the daily owner briefing.

Files likely affected:

- `src/server/actions/ai-summary.ts`
- `src/features/ai-summary/queries.ts`
- `src/features/ai-summary/components/generate-ai-summary-button.tsx`
- `src/mastra/index.ts`
- `src/mastra/config.ts`
- `src/mastra/agents/owner-ops-agent.ts`
- `src/mastra/workflows/generate-morning-summary.ts`
- `src/mastra/tools/get-dashboard-data.ts`
- `src/mastra/tools/get-project-risk-data.ts`
- `src/mastra/tools/get-daily-updates.ts`
- `src/mastra/tools/get-design-bottlenecks.ts`
- `src/mastra/tools/get-material-issues.ts`
- `src/mastra/tools/get-sales-snapshot.ts`
- `src/mastra/tools/get-content-opportunities.ts`
- `src/mastra/persistence/ai-runs.ts`
- `src/mastra/persistence/ai-summaries.ts`
- `app/(protected)/dashboard/page.tsx`
- `app/(protected)/ai-summary/page.tsx`
- `app/(protected)/projects/[projectId]/page.tsx`

Exact acceptance criteria:

- Owner/admin can generate a morning summary from `/dashboard` and `/ai-summary`.
- Non-owner/non-admin users cannot generate AI summaries from UI or server action.
- Mastra tools fetch real Drizzle data and return sanitized, minimal operational data.
- Gemini is called only through Mastra.
- Every AI attempt creates an `ai_runs` record, including failures before model generation where feasible.
- Successful summaries are saved to `ai_summaries`.
- Dashboard displays the latest saved morning summary.
- Output is Bahasa Indonesia, concise, actionable, and owner-friendly.
- Missing data is stated clearly and not invented.
- Runtime generation is verified with real development AI credentials or documented as blocked by missing env.

Verification commands:

- `bun run lint`
- `bun run typecheck`
- `bun run build`
- `bun run mastra:build` if compatible with current setup.
- Manual owner/admin generate-summary browser check.
- Manual non-owner generate-summary rejection check.
- Database check that `ai_runs` and `ai_summaries` rows are created.
- Failure-path check with missing/invalid AI env in a safe local environment, confirming user-facing error and run logging behavior.

What must not be touched:

- Do not build a generic chatbot.
- Do not call Gemini directly from UI components or random server actions.
- Do not let AI execute arbitrary SQL.
- Do not let AI mutate operational records except for `ai_runs` and `ai_summaries`.
- Do not add autonomous actions, weekly reports, alert engines, or advanced AI agents beyond the MVP morning summary unless explicitly requested later.

## Sprint F: UI Polish And Responsive Cleanup

Goal:

Make the MVP feel calm, premium, operational, and usable across desktop, tablet, and mobile without changing core business behavior.

Files likely affected:

- `app/(protected)/**/page.tsx`
- `app/(protected)/loading.tsx`
- `components/layout/app-shell.tsx`
- `components/layout/app-header.tsx`
- `components/layout/app-sidebar.tsx`
- `components/layout/page-container.tsx`
- `components/shared/data-table.tsx`
- `components/shared/metric-card.tsx`
- `components/shared/form-errors.ts`
- `components/shared/media-uploader.tsx`
- `src/features/*/components/*.tsx`
- `app/globals.css`
- `components.json`

Exact acceptance criteria:

- All MVP pages use semantic theme tokens, not raw random colors.
- Tables scroll horizontally on small screens without breaking layout.
- Buttons, badges, form fields, and dialogs do not overflow on mobile.
- Empty states are clear and operational, not placeholder-ish.
- Loading states exist for protected routes and any slow client flows.
- Error messages are clear for forms and server action failures.
- Sidebar/header navigation works at desktop and mobile sizes.
- No visible duplicate card-inside-card patterns that make dashboard pages feel cluttered.
- UI remains dashboard-first, not landing-page-like.

Verification commands:

- `bun run lint`
- `bun run typecheck`
- `bun run build`
- `rg -n "bg-blue-|text-purple-|#[0-9a-fA-F]{3,6}|Scaffold|Planned" app components src`
- Browser screenshot/smoke checks at desktop, tablet, and mobile widths for:
  - `/dashboard`
  - `/projects`
  - `/projects/[projectId]`
  - `/daily-updates`
  - `/design`
  - `/materials`
  - `/sales`
  - `/content`
  - `/ai-summary`
  - `/users`

What must not be touched:

- Do not redesign the product into a marketing site.
- Do not introduce a new design system or overwrite `components/ui` casually.
- Do not add decorative gradients, animations, or non-operational UI flourish.
- Do not change server action behavior only for visual convenience.

## Sprint G: Final QA

Goal:

Prove the MVP is ready for internal testing against the acceptance checklist and real role-based workflows.

Files likely affected:

- `docs/MVP_ACCEPTANCE_CHECKLIST.md`
- `docs/MVP_GAP_REPORT.md`
- `docs/MVP_FIX_SPRINT_PLAN.md`
- `docs/TESTING_CHECKLIST.md`
- `docs/SEED_DATA.md`
- `README.md`
- `src/lib/db/seed.ts`
- Any minimal test or QA helper files added by the team.

Exact acceptance criteria:

- `docs/MVP_ACCEPTANCE_CHECKLIST.md` is updated with current Done/Partial/Missing statuses.
- Every MVP route in the sitemap is either functional or intentionally removed/deferred from navigation.
- Owner can view company condition from dashboard.
- PM can submit daily updates.
- Designer can update design/DED status.
- Purchasing can update material issues.
- Sales/admin can update leads.
- Marketing can update content readiness.
- Owner/admin can generate AI morning summary or the exact environment blocker is documented.
- All data is stored in NeonDB and all media metadata is stored in `media_assets`.
- ImageKit upload flow is verified or the exact environment blocker is documented.
- Server-side permissions are verified for owner/admin and non-owner roles.
- No placeholder pages remain in MVP routes.
- No obvious console errors or broken navigation remain.

Verification commands:

- `bun install` if dependencies changed.
- `bun run lint`
- `bun run typecheck`
- `bun run build`
- `bun run db:migrate` against a safe development database if migrations exist.
- `bun run db:seed` against a safe development database.
- `bun run mastra:build` if Mastra build remains configured.
- Full browser QA pass across all MVP routes and key role workflows.
- Optional deployment dry run only after local QA passes.

What must not be touched:

- Do not introduce new feature work during final QA except fixes for failed acceptance criteria.
- Do not rename routes or data fields unless required to resolve a blocker.
- Do not change production environment variables or real production data during QA.
- Do not mark checklist items Done unless they were verified.

## Execution Notes

- Each sprint should be merged only after its verification commands pass or blockers are documented.
- Prefer small PRs/commits per sprint. Do not combine AI, dashboard, schema, and UI polish in one oversized change.
- If a later sprint exposes an earlier security or data integrity issue, pause and backport the fix into the earlier sprint category before continuing.
- Keep all fixes inside MVP scope from `AGENTS.md`, `docs/PRD.md`, and `docs/FLOWS.md`.
