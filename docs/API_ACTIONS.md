# API_ACTIONS.md
# SaaS Agentic Interior ERP — Server Actions & API Blueprint

## 1. Architecture Decision

```txt
App Framework: Next.js App Router
Package Manager: Bun
Database: NeonDB / PostgreSQL
ORM: Drizzle ORM
Auth: Better Auth by default; Clerk optional
Storage: ImageKit
AI Framework: Mastra
AI Model: Gemini 3 Flash
```

Rules:

- Use Server Actions for internal app mutations.
- Use Route Handlers for external callbacks, upload auth, and AI endpoints if needed.
- Use Drizzle for database queries.
- Use Zod for validation.
- Validate current user and role in every protected action.
- Do not use Supabase.
- Use Bun commands only.

---

## 2. Suggested Action Structure

```txt
src/
  actions/
    projects.ts
    daily-updates.ts
    design.ts
    materials.ts
    leads.ts
    content.ts
    media.ts
    ai-summary.ts
    users.ts

  lib/
    auth/
      get-current-user.ts
      require-role.ts
    db/
      index.ts
      schema.ts
    validations/
      project.ts
      daily-update.ts
      design.ts
      material.ts
      lead.ts
      content.ts
      media.ts
```

---

## 3. Auth Helper Pattern

Every protected action should follow this pattern:

```txt
1. Get current user.
2. Validate user exists.
3. Validate role permission.
4. Validate input with Zod.
5. Run Drizzle query.
6. Return typed result.
7. Revalidate relevant paths.
```

---

## 4. Project Actions

```txt
createProject(input)
updateProject(projectId, input)
updateProjectStatus(projectId, status)
updateProjectHealth(projectId, healthStatus)
deleteProject(projectId)
getProjects(filters)
getProjectById(projectId)
getProjectOverview(projectId)
```

Permissions:

```txt
Owner/Admin: full access
PM: view assigned projects, update limited status/health
Designer/Purchasing/Marketing: view relevant projects
Sales: limited view if converted lead is connected
```

---

## 5. Daily Update Actions

```txt
createDailyUpdate(input)
updateDailyUpdate(updateId, input)
deleteDailyUpdate(updateId)
getDailyUpdates(projectId)
getLatestDailyUpdates(limit)
```

Rules:

- PM can create updates.
- Owner/Admin can create or edit updates.
- Attachments are handled through `media_assets`.
- Creating an update may update project progress and health.

---

## 6. Design / DED Actions

```txt
createDesignTask(input)
updateDesignTask(taskId, input)
updateDesignStatus(taskId, status)
updateDesignApproval(taskId, approvalStatus)
getDesignTasks(filters)
getPendingDesignTasks()
```

Rules:

- Designer can update assigned tasks.
- Owner/Admin can view and update all.
- Design files should be uploaded to ImageKit and linked through `media_assets`.

---

## 7. Material Actions

```txt
createMaterial(input)
updateMaterial(materialId, input)
updateMaterialStatus(materialId, status)
updateMaterialUrgency(materialId, urgencyLevel)
getMaterials(filters)
getMaterialIssues()
```

Rules:

- Purchasing owns material updates.
- Owner/Admin can view and update all.
- High/critical urgency should appear on dashboard.

---

## 8. Lead Actions

```txt
createLead(input)
updateLead(leadId, input)
updateLeadStatus(leadId, status)
convertLeadToProject(leadId, projectInput)
getLeads(filters)
getSalesSnapshot()
```

Rules:

- Sales can update assigned leads.
- Owner/Admin can see all leads.
- Converted lead should link to `projects.id`.

---

## 9. Content Actions

```txt
createContentAsset(input)
updateContentAsset(assetId, input)
updateContentStatus(assetId, status)
getContentAssets(filters)
getContentReadyProjects()
```

Rules:

- Marketing owns content readiness.
- Project media should be linked through `media_assets`.
- Content-ready projects appear on dashboard.

---

## 10. Media Actions

Actual files are stored in ImageKit. Neon stores metadata only.

```txt
getImageKitUploadAuth()
createMediaAsset(input)
updateMediaAsset(mediaId, input)
deleteMediaAsset(mediaId)
getMediaByProject(projectId)
getMediaByRelated(relatedType, relatedId)
```

Rules:

- Do not upload files to Neon.
- Store ImageKit file ID, URL, thumbnail URL, folder path, and metadata.
- Validate upload permission before generating upload auth.
- Delete or archive media carefully because project documentation may be important.

---

## 11. Dashboard Actions

```txt
getDashboardSummary()
getProjectHealthOverview()
getLatestPmUpdates()
getDesignSnapshot()
getMaterialWarningSnapshot()
getSalesSnapshot()
getContentReadinessSnapshot()
```

Dashboard data is used by both UI and Mastra tools.

---

## 12. AI Summary Actions

AI actions should call Mastra workflows, not Gemini directly.

```txt
generateMorningSummary()
generateProjectRiskSummary()
generateDesignBottleneckSummary()
generateMaterialWarningSummary()
generateContentOpportunitySummary()
getAiSummaries(filters)
getLatestAiSummary(summaryType)
```

Flow:

```txt
Server Action
↓
Mastra Workflow
↓
Mastra Tools
↓
Drizzle Queries
↓
Gemini 3 Flash
↓
Save ai_runs
↓
Save ai_summaries
↓
Return summary
```

---

## 13. Validation Strategy

Use Zod schemas for every action input.

```txt
projectSchema
dailyUpdateSchema
designTaskSchema
materialSchema
leadSchema
contentAssetSchema
mediaAssetSchema
aiSummarySchema
```

Rules:

- Validate enums strictly.
- Validate dates.
- Validate role permissions separately from Zod.
- Never trust client-side validation only.

---

## 14. Revalidation Strategy

After mutations, revalidate relevant paths:

```txt
/dashboard
/projects
/projects/[projectId]
/daily-updates
/design
/materials
/sales
/content
/ai-summary
```

---

## 15. Error Handling

Return consistent action response:

```ts
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string }
```

Rules:

- Do not expose raw database errors to users.
- Log detailed errors server-side.
- Show human-friendly messages in UI.
