# MVP Gap Report

Audit date: 2026-05-07

Sprint: G - Final QA and beta readiness

Scope: current implementation audited against `AGENTS.md`, `docs/PRD.md`, `docs/FLOWS.md`, `docs/MVP_SYSTEM_BLUEPRINT.md`, `docs/DATABASE_SCHEMA.md`, `docs/API_ACTIONS.md`, `docs/UI_SYSTEM_GUIDE.md`, `docs/AI_AGENT_INSTRUCTIONS.md`, and `docs/MVP_ACCEPTANCE_CHECKLIST.md`.

Verification snapshot:

- `bun run typecheck` passed.
- `bun run lint` passed.
- `bun run build` passed.
- `bun run mastra:build` passed.
- `bun run db:migrate` passed against a confirmed safe development database.
- `bun run db:seed` passed against a confirmed safe development database.
- Authenticated browser QA ran with seeded role users and temporary QA credentials in the safe development database.

Overall status: Ready for internal beta with limitations

Reason: static app quality, migration, seed, owner login, main browser workflows, non-owner redirects, and ImageKit upload-auth are verified. Live AI generation is blocked by an invalid Gemini API key, but the exact blocker is documented and saved summaries are viewable.

## 1. Owner Dashboard

Current status: Partial

Evidence:

- `app/(protected)/dashboard/page.tsx` loads live project metrics, design metrics, material metrics, sales metrics, project health overview, urgent projects, latest PM updates, material issues, dashboard leads, content-ready projects, and latest AI summary.
- Project Health Overview uses `getProjectHealthOverviewQuery`, not a hardcoded `projectRows` array.
- `app/(protected)/dashboard/error.tsx` provides dashboard route-level error handling.
- `app/(protected)/loading.tsx` provides protected-layout loading.

Remaining gaps:

- Authenticated owner dashboard scenario is verified.
- Dashboard data is still a broad command-center view for every role with `dashboard:view`; role-specific dashboard redaction remains MVP-light.

Risk level: Medium

Category: Can ship with MVP-light dashboard role scoping

## 2. Project Tracking

Current status: Partial

Evidence:

- Project list, create, detail, edit, archive, restore, and delete paths exist.
- Server actions validate session, permission, role, UUIDs, and Zod form input.
- PM limited update actions exist for status, health, and progress, scoped to assigned project.
- Project detail shows linked daily updates, design tasks, materials, leads, content assets, and media.

Remaining gaps:

- Authenticated owner project list/detail workflow is verified.
- Owner/admin project create/edit and PM limited update were not separately exercised in browser.
- Project-specific AI summary tab is still not connected to persisted summaries.

Risk level: Medium

Category: Can ship with limitation

## 3. Daily PM Updates

Current status: Partial

Evidence:

- Daily update create/update actions exist.
- PM users can only create/update updates for assigned projects.
- Daily updates can update project progress and health.
- Media metadata can be attached through `media_assets`.
- Archive, restore, and delete actions exist for owner/admin.

Remaining gaps:

- Authenticated PM create workflow is verified through the browser.
- Delete remains available for owner/admin after archive; internal policy should favor archive for operational history.

Risk level: Medium

Category: Can ship with owner/admin-only destructive delete restriction

## 4. Design / DED Tracker

Current status: Partial

Evidence:

- Design task list, create/edit dialog, status badges, filters, and empty states exist.
- Designer create/update flows validate assignment to the project/task.
- Status-only and approval-only update actions exist.
- Media metadata attachment and archive/restore/delete actions exist.

Remaining gaps:

- Authenticated designer create workflow is verified through the browser.
- No advanced approval engine exists, intentionally out of MVP.

Risk level: Medium

Category: Can ship with limitation

## 5. Material Tracker And Vendors

Current status: Partial

Evidence:

- Material list, create/update, status-only, urgency-only, archive/restore/delete actions exist.
- Material records link to projects and vendors.
- `/vendors` route exists for owner/admin/purchasing.
- Material issue dashboard query exists.

Remaining gaps:

- Authenticated purchasing create workflow is verified through the browser.
- Purchasing ownership is MVP-light; no advanced team assignment model exists.

Risk level: Medium

Category: Must verify before internal beta; ownership model can ship with limitation

## 6. Sales / Leads Snapshot

Current status: Partial

Evidence:

- Sales page has lead list, filters, create/edit dialog, conversion dialog, and empty state.
- Optional lead email is validated with Zod email validation.
- Sales users can update assigned leads.
- `convertLeadToProjectAction` uses one SQL CTE for lead update and project insert, avoiding a split success state.
- Archive, restore, and delete actions exist for owner/admin.

Remaining gaps:

- Authenticated sales create workflow is verified through the browser.
- Owner/admin conversion workflow was not separately exercised.
- Owner/admin assignment guardrails remain simple by design.

Risk level: Medium

Category: Can ship with limitation

## 7. Content Readiness

Current status: Partial

Evidence:

- Content list, filters, create/update dialog, status-only update, media metadata, and dashboard readiness snapshot exist.
- Project content-ready status sync exists.
- Archive, restore, and delete actions exist for owner/admin.

Remaining gaps:

- Authenticated marketing create workflow is verified through the browser.
- Marketing assignment/scoping remains MVP-light.

Risk level: Medium

Category: Can ship with limitation

## 8. AI Morning Summary

Current status: Partial

Evidence:

- `generateMorningSummaryAction` is owner/admin-only and calls the Mastra workflow.
- `src/mastra/workflows/generate-morning-summary.ts` logs `ai_runs`, fetches dashboard data, calls OwnerOpsAgent, saves `ai_summaries`, and records fallback/failure states.
- Mastra tool auth requires an active owner/admin user before fetching data.
- OwnerOpsAgent instructions require Bahasa Indonesia, grounded data, missing-data clarity, and concise owner-friendly output.

Remaining gaps:

- Browser generate-summary path was exercised with an authenticated owner.
- Live Gemini/Mastra generation failed because the configured API key is invalid.
- Only company-level morning summary is implemented; project risk/design/material/content summary actions remain post-MVP unless explicitly requested.

Risk level: High

Category: Can ship with limitation after replacing the invalid Gemini API key before AI generation demos

## 9. Auth, Permissions, Users

Current status: Partial

Evidence:

- Better Auth is configured.
- Proxy redirects unauthenticated protected requests to `/login`.
- Page and server action guards use active app user, permission, and role checks.
- Users page supports invite creation, invite revoke, role changes, status changes, and avatar upload.
- Invite acceptance creates Better Auth credentials and app user records.

Remaining gaps:

- End-to-end owner login is verified in browser.
- PM redirect away from owner/admin-only `/users` and `/ai-summary` is verified.
- Full non-owner matrix for every role was not separately exercised.
- Proxy is cookie-presence based, with full role checks happening in page/action code; this is acceptable for MVP but should remain documented.

Risk level: High

Category: Can ship with limitation

## 10. Media Assets And ImageKit

Current status: Partial

Evidence:

- `media_assets` schema and Drizzle queries exist.
- `app/api/imagekit/upload-auth/route.ts` validates session, role, upload context, and ImageKit env before signing uploads.
- Module forms use `MediaUploader`.
- `/media` is a read-only live library using `getMediaLibraryMetrics` and `getLatestMediaAssets`.

Remaining gaps:

- ImageKit upload-auth is verified and returns token, expire, signature, public key, folder path, and URL endpoint for an authenticated content upload context.
- End-to-end binary upload to ImageKit CDN was not performed.
- `/media` intentionally does not upload/delete media in MVP.

Risk level: Medium

Category: Can ship with limitation

## 11. Archived Records

Current status: Partial

Evidence:

- `/archived` route exists for owner/admin.
- Archived tabs exist for projects, design, materials, leads, content, and daily updates.
- Restore and delete actions are wired in archived tabs.

Remaining gaps:

- Authenticated owner/admin `/archived` route load is verified.
- Archive/restore action click workflow was not separately exercised.
- Hard delete should be used conservatively during internal beta.

Risk level: Medium

Category: Can ship with owner/admin-only limitation after workflow smoke check

## 12. Settings

Current status: Partial

Evidence:

- `/settings` is an owner/admin runtime status page.
- It shows configured/missing state for required app/auth/database env and optional ImageKit/Gemini/Mastra env.
- Secrets are not displayed.

Remaining gaps:

- This is not a full workspace settings system.

Risk level: Low

Category: Can ship with limitation

## 13. System Quality

Current status: Partial

Evidence:

- `bun run typecheck` passed.
- `bun run lint` passed.
- `bun run build` passed.
- `bun run mastra:build` passed.
- `bun run db:migrate` passed.
- `bun run db:seed` passed.
- Canonical checklist exists at `docs/MVP_ACCEPTANCE_CHECKLIST.md`.
- No placeholder route code was found in `app`, `components`, or `src` during Sprint G placeholder search.

Remaining gaps:

- No automated browser regression suite exists.
- Live AI generation is blocked by invalid Gemini API key.
- End-to-end ImageKit binary upload is not verified, but upload-auth is verified.

Risk level: Medium

Category: Can ship with limitations

## Readiness Categorization

Must fix before internal beta:

1. None blocking if the team accepts AI generation as an environment limitation for the first internal beta.

Can ship with limitation:

1. AI generation is blocked by invalid `GOOGLE_GENERATIVE_AI_API_KEY`; saved summaries are viewable.
2. `/media` remains a read-only library; uploads are embedded in module forms.
3. End-to-end ImageKit binary upload was not performed; upload-auth is verified.
4. `/settings` remains a runtime status page.
5. Project-specific AI summaries are not connected yet.
6. Purchasing and marketing scoping remain MVP-light.
7. Hard delete exists for owner/admin but archive should be preferred.
8. Manual QA may substitute for automated browser regression in the first internal beta.

Post-MVP:

1. Advanced finance, payroll, invoice automation, advanced CRM, client portal, WhatsApp automation, vendor payment tracking, advanced inventory, SaaS billing, advanced analytics, approval engines, autonomous AI actions, and native mobile apps.
