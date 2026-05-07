# MVP Acceptance Checklist

## 1. Owner Dashboard

- [ ] Dashboard route exists at `/dashboard`
- [ ] Shows active projects count
- [ ] Shows urgent projects
- [ ] Shows latest PM updates
- [ ] Shows pending DED/design tasks
- [ ] Shows material issues
- [ ] Shows sales/leads snapshot
- [ ] Shows content readiness snapshot
- [ ] Shows latest AI summary
- [ ] Has loading state
- [ ] Has empty state
- [ ] Has error state
- [ ] Mobile layout works

Status: Missing / Partial / Done
Notes:

## 2. Project Tracking

- [ ] Project list exists
- [ ] Project create form exists
- [ ] Project detail page exists
- [ ] Project status can be updated
- [ ] Project health can be updated
- [ ] Project progress can be updated
- [ ] Project has PM/designer relation
- [ ] Data is persisted to database
- [ ] Form validation exists
- [ ] Permission checks exist

Status:
Notes:

## 3. Daily PM Updates

- [ ] PM can create daily update
- [ ] Update belongs to project
- [ ] Update includes progress summary
- [ ] Update includes issue/blocker
- [ ] Update includes next action
- [ ] Update appears on project detail
- [ ] Update appears on dashboard

Status:
Notes:

## 4. Design / DED Tracker

- [ ] Design task list exists
- [ ] Task belongs to project
- [ ] Status is trackable
- [ ] Approval status is trackable
- [ ] Revision count exists
- [ ] Due date exists
- [ ] Pending tasks appear on dashboard

Status:
Notes:

## 5. Material Tracker

- [ ] Material issue list exists
- [ ] Material belongs to project
- [ ] Vendor relation exists
- [ ] Status exists
- [ ] Urgency exists
- [ ] ETA exists
- [ ] Urgent issues appear on dashboard

Status:
Notes:

## 6. Sales / Leads Snapshot

- [ ] Lead list exists
- [ ] Lead create form exists
- [ ] Lead source exists
- [ ] Lead status exists
- [ ] Follow-up date exists
- [ ] Latest leads appear on dashboard

Status:
Notes:

## 7. Content Readiness

- [ ] Content asset list exists
- [ ] Content asset belongs to project
- [ ] Room/area exists
- [ ] Footage status exists
- [ ] Content opportunity exists
- [ ] Content status exists
- [ ] Ready-to-post content appears on dashboard

Status:
Notes:

## 8. AI Morning Summary

- [ ] Generate summary action exists
- [ ] Action checks owner/admin permission
- [ ] Mastra workflow exists
- [ ] Tools fetch real DB data
- [ ] Gemini is called only through Mastra
- [ ] Summary is saved to `ai_summaries`
- [ ] Run is logged to `ai_runs`
- [ ] Dashboard displays latest summary
- [ ] Missing data is stated clearly
- [ ] Output is Bahasa Indonesia

Status:
Notes:

## 9. Auth & Roles

- [ ] Login works
- [ ] Protected routes work
- [ ] Owner/admin access works
- [ ] Non-owner restrictions work
- [ ] Protected server actions check session
- [ ] Protected server actions check permission

Status:
Notes:

## 10. System Quality

- [ ] `bun run lint` passes
- [ ] `bun run typecheck` passes
- [ ] `bun run build` passes
- [ ] No obvious console errors
- [ ] No broken navigation
- [ ] No placeholder pages in MVP routes
- [ ] Seed data works
- [ ] Empty state works
- [ ] Error state works
- [ ] Responsive enough for mobile/tablet
