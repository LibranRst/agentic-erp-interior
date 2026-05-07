# MVP Acceptance Checklist

Reviewed: 2026-05-07

Sprint: G - Final QA and beta readiness

Status legend:

- Done: implemented and verified by code inspection and/or command output.
- Partial: implemented enough for MVP use, but with documented limitation or unverified runtime path.
- Blocked: cannot be verified without safe credentials, safe database, or browser login access.
- Missing: not implemented.

Overall MVP beta status: Ready for internal beta with limitations

Reason: static verification, migration, seed, authenticated browser role workflows, non-owner route restrictions, and ImageKit upload-auth are verified. Live AI generation attempted but is blocked by an invalid Gemini API key; saved AI summaries remain viewable.

## 1. Owner Dashboard

Status: Partial

- [x] Dashboard route exists at `/dashboard`.
- [x] Shows active projects count from Drizzle-backed project metrics.
- [x] Shows urgent projects from live project health data.
- [x] Shows latest PM updates.
- [x] Shows pending DED/design tasks.
- [x] Shows material issues.
- [x] Shows sales/leads snapshot.
- [x] Shows content readiness snapshot.
- [x] Shows latest AI summary when saved.
- [x] Has protected loading state.
- [x] Has empty states for dashboard sections.
- [x] Has route-level error state at `app/(protected)/dashboard/error.tsx`.
- [x] Mobile/tablet layout has responsive grid/table wrappers by implementation.
- [x] Authenticated browser scenario verified with `owner@dekoria.local`.

Notes:

- `app/(protected)/dashboard/page.tsx` now uses live project health overview query data; no `projectRows` fixture remains in app code.
- Owner/admin can trigger AI summary from the dashboard UI.
- `/ai-summary` displays saved AI summary history. New generation currently fails because the configured Gemini API key is invalid.

## 2. Project Tracking

Status: Partial

- [x] Project list exists.
- [x] Project create form exists at `/projects/new`.
- [x] Project detail page exists at `/projects/[projectId]`.
- [x] Project status can be updated through owner/admin full edit and PM limited update actions.
- [x] Project health can be updated.
- [x] Project progress can be updated.
- [x] Project has PM/designer relation.
- [x] Data is persisted to database through Drizzle.
- [x] Form validation exists with Zod.
- [x] Permission checks exist in server actions.
- [x] Archive/restore/delete actions exist for owner/admin.
- [x] Authenticated project list/detail workflow verified with `owner@dekoria.local`.

Notes:

- Project-specific AI summaries remain a limitation: project detail returns an empty `aiSummaries` array.

## 3. Daily PM Updates

Status: Partial

- [x] PM can create daily update in server action when assigned to the project.
- [x] Update belongs to project.
- [x] Update includes progress summary.
- [x] Update includes issue/blocker fields.
- [x] Update includes next action.
- [x] Update appears on project detail through project relation query.
- [x] Update appears on dashboard through latest updates query.
- [x] Edit, archive, restore, and delete actions exist.
- [x] Authenticated PM create workflow verified with `pm@dekoria.local`.

Notes:

- Delete is owner/admin-only and archive-first behavior is available through the archived records area.

## 4. Design / DED Tracker

Status: Partial

- [x] Design task list exists.
- [x] Task belongs to project.
- [x] Status is trackable.
- [x] Approval status is trackable.
- [x] Revision count exists.
- [x] Due date exists.
- [x] Pending tasks appear on dashboard.
- [x] Designer assignment is checked for create/update flows.
- [x] Status-only and approval-only update actions exist.
- [x] Archive/restore/delete actions exist for owner/admin.
- [x] Authenticated designer create workflow verified with `designer@dekoria.local`.

Notes:

- Owner/admin can create tasks for projects; designer users are scoped to assigned project/task behavior.

## 5. Material Tracker

Status: Partial

- [x] Material issue list exists.
- [x] Material belongs to project.
- [x] Vendor relation exists.
- [x] Vendor management route exists at `/vendors`.
- [x] Status exists.
- [x] Urgency exists.
- [x] ETA exists.
- [x] Urgent issues appear on dashboard.
- [x] Status-only and urgency-only update actions exist.
- [x] Archive/restore/delete actions exist for owner/admin.
- [x] Authenticated purchasing create workflow verified with `purchasing@dekoria.local`.

Notes:

- Purchasing update scoping is MVP-light: ownership is based on updater/project validation, not a full purchasing assignment model.

## 6. Sales / Leads Snapshot

Status: Partial

- [x] Lead list exists.
- [x] Lead create form exists.
- [x] Lead source exists.
- [x] Lead status exists.
- [x] Follow-up date exists.
- [x] Latest leads appear on dashboard.
- [x] Optional lead email validates as an email.
- [x] Lead conversion uses a single SQL CTE so lead update and project insert succeed/fail together.
- [x] Archive/restore/delete actions exist for owner/admin.
- [x] Authenticated sales create workflow verified with `sales@dekoria.local`.
- [ ] Owner/admin conversion workflow not separately exercised during browser QA.

Notes:

- Owner/admin lead assignment remains intentionally simple for MVP.

## 7. Content Readiness

Status: Partial

- [x] Content asset list exists.
- [x] Content asset belongs to project.
- [x] Room/area exists.
- [x] Footage status exists.
- [x] Content opportunity exists.
- [x] Content status exists.
- [x] Ready-to-post content appears on dashboard.
- [x] Content status-only action exists.
- [x] Project content-ready status sync exists.
- [x] Archive/restore/delete actions exist for owner/admin.
- [x] Authenticated marketing create workflow verified with `marketing@dekoria.local`.

Notes:

- Marketing scoping is MVP-light; there is no advanced content assignment workflow.

## 8. AI Morning Summary

Status: Partial

- [x] Generate summary action exists.
- [x] Action checks owner/admin permission.
- [x] Mastra workflow exists.
- [x] Tools fetch real DB data.
- [x] Gemini is called only through Mastra.
- [x] Summary is saved to `ai_summaries` on successful generation.
- [x] Run is logged to `ai_runs`, including data-fetch and model failure paths after user validation.
- [x] Dashboard displays latest summary.
- [x] Missing data handling is represented in OwnerOpsAgent instructions.
- [x] Output is instructed to be Bahasa Indonesia.
- [x] Live generation action was exercised in browser.
- [ ] Live generation did not succeed because the configured Gemini API key is invalid.

Notes:

- Mastra tools now require an active owner/admin user context before fetching dashboard data.
- AI run logging captured a `fallback_failed` run with `API key not valid. Please pass a valid API key.`

## 9. Auth & Roles

Status: Partial

- [x] Login page exists.
- [x] Protected routes require session cookie at proxy and active app user in page/action code.
- [x] Owner/admin access guards exist.
- [x] Non-owner route guards exist on role-specific routes.
- [x] Protected server actions check session.
- [x] Protected server actions check permission and role.
- [x] Users page supports invites, invite revoke, role changes, status changes, and avatar upload.
- [x] End-to-end owner login verified.
- [x] PM redirect away from owner/admin-only `/users` and `/ai-summary` verified.
- [ ] Full non-owner matrix for every role not separately exercised.

Notes:

- Seed app users are profiles only by default; Sprint G QA created Better Auth test credentials for seeded role users in the safe development database.

## 10. Media Assets

Status: Partial

- [x] `media_assets` table exists.
- [x] ImageKit upload auth route exists.
- [x] Media metadata persistence helper exists.
- [x] Module forms can attach media metadata.
- [x] `/media` is a real read-only media library backed by `media_assets`.
- [x] ImageKit upload-auth route returns signed upload payload for authenticated marketing/content upload context.
- [ ] End-to-end file upload to ImageKit CDN was not performed.

Notes:

- `/media` is intentionally read-only for MVP; upload entry points remain embedded in module forms.

## 11. System Quality

Status: Partial

- [x] `bun run typecheck` passes.
- [x] `bun run lint` passes.
- [x] `bun run build` passes.
- [x] No placeholder route code found in `app`, `components`, or `src` by Sprint G search.
- [x] Canonical checklist path exists at `docs/MVP_ACCEPTANCE_CHECKLIST.md`.
- [x] Protected/dashboard/global error boundaries exist.
- [x] Seed data script exists and includes bootstrap owner invite support.
- [x] `bun run db:migrate` passed against confirmed safe development database.
- [x] `bun run db:seed` passed against confirmed safe development database.
- [x] Browser smoke QA completed for authenticated owner and core role create workflows.

Notes:

- Static QA and authenticated browser QA are green enough for internal beta with documented limitations.

## Beta Readiness Categories

Must fix before internal beta:

- None blocking the start of internal beta if the team accepts AI generation as an env limitation.

Can ship with limitation:

- AI summary generation is blocked until `GOOGLE_GENERATIVE_AI_API_KEY` is replaced with a valid key; saved summaries are viewable.
- `/media` stays read-only while uploads live in module forms.
- `/settings` stays as owner/admin runtime status, not full workspace configuration.
- Project-specific AI summary tab can remain non-functional if company-level morning summary works.
- No automated browser test suite yet if manual QA is completed and documented.
- End-to-end ImageKit CDN upload was not performed; upload-auth is verified.

Post-MVP:

- Advanced finance, payroll, invoice automation, advanced CRM, client portal, WhatsApp automation, vendor payment tracking, advanced inventory, SaaS billing, advanced analytics, and autonomous AI actions.
