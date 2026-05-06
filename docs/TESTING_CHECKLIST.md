# TESTING_CHECKLIST.md
# SaaS Agentic Interior ERP

This document defines the MVP testing checklist before considering a feature complete.

---

## 1. Testing Philosophy

The MVP should be tested around real operational workflows, not just isolated UI components.

Focus areas:

```txt
- Auth and permissions
- Project visibility
- Daily PM updates
- Design/DED tracking
- Material issue tracking
- Sales leads snapshot
- Content readiness
- AI summary generation
- ImageKit upload flow
- Dashboard accuracy
```

---

## 2. General App Checklist

```txt
[ ] App runs locally with bun dev.
[ ] App builds successfully with bun run build.
[ ] No TypeScript errors.
[ ] No obvious console errors.
[ ] Sidebar navigation works.
[ ] Header/page title updates correctly.
[ ] Loading states exist for data-heavy pages.
[ ] Empty states exist for empty tables.
[ ] Error states are readable.
[ ] Mobile layout is usable.
[ ] Tables support horizontal scroll on small screens.
```

---

## 3. Auth Checklist

```txt
[ ] Unauthenticated user is redirected to login.
[ ] Authenticated user can access /app/dashboard.
[ ] User can logout.
[ ] Role is loaded correctly.
[ ] Sidebar items are role-aware.
[ ] Owner can access all modules.
[ ] Admin can access all operational modules.
[ ] PM cannot access user management.
[ ] Designer cannot manage materials.
[ ] Purchasing cannot manage leads.
[ ] Sales cannot generate AI summary.
[ ] Marketing cannot manage project core data.
```

---

## 4. Permission Checklist

For every server action:

```txt
[ ] Requires authenticated user.
[ ] Validates permission on server.
[ ] Validates input with Zod.
[ ] Rejects invalid input.
[ ] Rejects unauthorized user.
[ ] Does not expose private data.
```

---

## 5. Project Module Checklist

```txt
[ ] Owner/admin can create project.
[ ] Project form validates required fields.
[ ] Project list displays all seed projects.
[ ] Search works.
[ ] Filter by status works.
[ ] Filter by health works.
[ ] Project detail page loads.
[ ] Project overview shows latest status.
[ ] Project progress percentage updates correctly.
[ ] Health status badge displays correctly.
[ ] Project deadline warning displays when relevant.
```

---

## 6. Daily Updates Checklist

```txt
[ ] PM can create daily update.
[ ] Daily update is connected to the correct project.
[ ] Latest daily update appears on project detail.
[ ] Latest daily updates appear on owner dashboard.
[ ] Progress percentage update reflects correctly.
[ ] Health status can be updated from daily update.
[ ] Attachment upload works if enabled.
[ ] Empty state appears when project has no updates.
```

---

## 7. Design / DED Checklist

```txt
[ ] Designer can create design task.
[ ] Designer can update task status.
[ ] Approval status works.
[ ] Revision count is displayed.
[ ] Pending design tasks appear on dashboard.
[ ] Blocked design tasks are highlighted.
[ ] File link or media relation works.
```

---

## 8. Material Tracker Checklist

```txt
[ ] Purchasing can create material record.
[ ] Material can be linked to project and vendor.
[ ] Status can be updated.
[ ] Urgency level displays correctly.
[ ] Delayed/problem materials appear on dashboard.
[ ] Critical materials are visually emphasized.
[ ] ETA date displays correctly.
```

---

## 9. Sales / Leads Checklist

```txt
[ ] Sales can create lead.
[ ] Lead status can be updated.
[ ] Next follow-up date is displayed.
[ ] Hot/new leads appear in dashboard snapshot.
[ ] Converted lead can be linked to project if feature is enabled.
[ ] Lead form validates phone/source/status.
```

---

## 10. Content Readiness Checklist

```txt
[ ] Marketing can create content asset.
[ ] Content asset is linked to project.
[ ] Footage status displays correctly.
[ ] Content opportunity displays correctly.
[ ] Ready content appears on dashboard.
[ ] Publish URL can be stored.
[ ] Content status can move from ready_to_shoot to published.
```

---

## 11. ImageKit Upload Checklist

```txt
[ ] Upload authentication endpoint works.
[ ] User can upload image/video where allowed.
[ ] Uploaded file is stored in correct ImageKit folder.
[ ] ImageKit URL is saved to media_assets.
[ ] Thumbnail URL is saved when available.
[ ] Private key is never exposed to client.
[ ] Upload error is handled gracefully.
```

---

## 12. AI / Mastra Checklist

```txt
[ ] Mastra initializes correctly.
[ ] OwnerOpsAgent exists.
[ ] Gemini 3 Flash default model is configured.
[ ] High reasoning default path works.
[ ] Low reasoning fallback path works.
[ ] Agent uses tools, not arbitrary SQL.
[ ] Dashboard data tool returns structured data.
[ ] Morning summary workflow runs successfully.
[ ] AI summary is saved to ai_summaries.
[ ] AI run is saved to ai_runs.
[ ] Error run is logged to ai_runs.
[ ] AI output is in Bahasa Indonesia.
[ ] AI summary is concise and actionable.
[ ] Non-owner/non-admin cannot generate company summary.
```

---

## 13. Dashboard Checklist

```txt
[ ] Active project count is correct.
[ ] Urgent project count is correct.
[ ] Pending design count is correct.
[ ] Material issue count is correct.
[ ] New lead count is correct.
[ ] Content-ready count is correct.
[ ] Latest PM updates are shown.
[ ] AI summary card displays latest summary.
[ ] Dashboard handles empty data.
[ ] Dashboard handles loading state.
```

---

## 14. UI Quality Checklist

```txt
[ ] Uses shadcn components first.
[ ] Follows preset b5d2ZsMLI.
[ ] Does not hardcode random colors.
[ ] Status badges are consistent.
[ ] Forms are readable.
[ ] Tables are clean and usable.
[ ] Cards have consistent spacing and radius.
[ ] UI feels operational, not landing-page-like.
[ ] No unnecessary animations in ERP screens.
```

---

## 15. MVP Acceptance Checklist

MVP can be considered ready for internal testing when:

```txt
[ ] Owner can view company condition from dashboard.
[ ] PM can submit daily updates.
[ ] Designer can update DED/design status.
[ ] Purchasing can update material issues.
[ ] Sales can update leads.
[ ] Marketing can update content readiness.
[ ] Owner can generate AI morning summary.
[ ] All data is stored in NeonDB.
[ ] All media is stored in ImageKit.
[ ] Permissions are enforced server-side.
```
