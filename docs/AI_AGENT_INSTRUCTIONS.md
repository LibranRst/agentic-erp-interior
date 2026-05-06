# AI_AGENT_INSTRUCTIONS.md
# SaaS Agentic Interior ERP — AI Agent Instructions

## 1. Purpose

This file defines how AI agents should behave when building or operating the SaaS Agentic Interior ERP.

The system uses AI to support operational visibility, not to replace human decision-making.

---

## 2. Final AI Stack

```txt
AI Framework: Mastra
Provider: Google Gemini API
Default Model: Gemini 3 Flash
Default Reasoning: High
Fallback Model: Gemini 3 Flash
Fallback Reasoning: Low
Optional Utility Model: Lower-cost Flash/Lite model for simple formatting or classification
```

---

## 3. Runtime & Package Rules

```txt
Package Manager: Bun
Local Runtime: Bun
Production Runtime: Vercel-managed Next.js / Node-compatible runtime
```

Rules:

- Use Bun for all package installation and script execution.
- Use `bun dev` for local development.
- Use `bunx --bun` for shadcn CLI.
- Do not use npm, pnpm, or yarn unless explicitly requested.
- Do not generate `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock`.

---

## 4. UI Generation Rules

```txt
UI Foundation: shadcn/ui custom preset b5d2ZsMLI
Init Command: bunx --bun shadcn@latest init --preset b5d2ZsMLI --template next --pointer
```

Rules:

- The shadcn preset is the UI source of truth.
- Use shadcn components before custom UI.
- Do not create a separate design system.
- Do not overwrite `components/ui` casually.
- Create ERP components in `components/shared` or module folders.
- Use CSS variables and Tailwind tokens from the preset.
- Avoid unnecessary animations in ERP screens.
- Keep UI clean, premium, readable, and operational.

---

## 5. Database & Storage Rules

```txt
Database: NeonDB / PostgreSQL
ORM: Drizzle ORM
Storage: ImageKit
```

Rules:

- Use Drizzle ORM for application database access.
- Use SQL only for migrations or deliberate database maintenance.
- Do not use Supabase.
- Do not let AI agents execute arbitrary SQL.
- Do not store large files directly in Neon.
- Store file metadata in `media_assets`.
- Store actual images/videos/files in ImageKit.
- Use signed upload/auth endpoints for ImageKit where needed.

---

## 6. Mastra Architecture

All AI logic must live inside:

```txt
src/mastra/
```

Suggested structure:

```txt
src/
  mastra/
    index.ts
    agents/
      owner-ops-agent.ts
      project-risk-agent.ts
      content-opportunity-agent.ts
    tools/
      get-dashboard-data.ts
      get-active-projects.ts
      get-urgent-projects.ts
      get-latest-daily-updates.ts
      get-pending-design-tasks.ts
      get-material-issues.ts
      get-sales-snapshot.ts
      get-content-ready-projects.ts
      save-ai-summary.ts
      log-ai-run.ts
    workflows/
      generate-morning-summary.ts
      generate-project-risk-summary.ts
      generate-content-summary.ts
    evals/
      summary-quality.eval.ts
```

---

## 7. Main Agent

### OwnerOpsAgent

Purpose:

```txt
Operational AI assistant for the owner dashboard.
```

Responsibilities:

- Read structured ERP data through safe tools.
- Generate morning summary.
- Highlight urgent projects.
- Identify blockers.
- Summarize PM daily updates.
- Identify design/DED bottlenecks.
- Identify material/vendor issues.
- Summarize sales leads.
- Suggest content opportunities.
- Recommend next actions.

Output language:

```txt
Bahasa Indonesia by default.
```

Tone:

```txt
Clear, executive-friendly, concise, direct, calm, and actionable.
```

---

## 8. Model Strategy

### Default Call

```txt
Model: Gemini 3 Flash
Reasoning: High
Use for:
- Morning summary
- Risk summary
- Multi-module operational analysis
- Decision support for owner
```

### Fallback Call

```txt
Model: Gemini 3 Flash
Reasoning: Low
Use for:
- Retry when default call fails
- Faster summary generation
- Lower-cost simplified output
```

### Optional Utility Call

```txt
Model: lower-cost Flash/Lite model
Reasoning: Low
Use for:
- Formatting
- Short labels
- Severity classification
- Simple rewrite
```

---

## 9. AI Tooling Rules

The agent must not query database directly.

It must use predefined tools such as:

```txt
getDashboardData
getActiveProjects
getUrgentProjects
getLatestDailyUpdates
getPendingDesignTasks
getMaterialIssues
getSalesSnapshot
getContentReadyProjects
saveAiSummary
logAiRun
```

Rules:

- Tools use Drizzle to query NeonDB.
- Tools return structured, minimal, relevant data.
- Tools should not expose secrets.
- Tools should not return unnecessary PII.
- Tools should validate user permissions.

---

## 10. AI Run Logging

Every AI execution must be logged to `ai_runs`.

Required fields:

```txt
agent_name
workflow_name
model_provider
model_name
reasoning_level
status
error_message
started_at
completed_at
created_by
```

If token usage is available, also save:

```txt
input_tokens
output_tokens
total_tokens
```

---

## 11. AI Summary Storage

Final summaries shown to the owner must be saved to `ai_summaries`.

Summary types:

```txt
morning_summary
project_risk_summary
pm_update_summary
design_bottleneck_summary
material_warning_summary
sales_snapshot_summary
content_opportunity_summary
```

---

## 12. Owner Summary Prompt Template

```txt
You are an operational assistant for an interior design and contractor company.

Your task is to summarize the current company condition for the owner.

Focus on:
1. Urgent projects
2. Project progress
3. PM daily updates
4. Design / DED bottlenecks
5. Material or vendor issues
6. Sales leads snapshot
7. Content opportunities

Write the summary in Bahasa Indonesia.
Use a clear, direct, executive-friendly tone.
Do not exaggerate.
Prioritize actionable insights.
Do not invent data.
If data is missing, mention that the data has not been updated.

Data:
{{dashboard_data}}
```

---

## 13. Safety & Reliability Rules

- Do not invent project status.
- Do not assume missing updates as complete.
- If PM has not updated today, state that clearly.
- Do not expose private client information beyond what the owner is allowed to see.
- Do not generate financial claims unless the data exists.
- Do not change database records unless the workflow is specifically designed to do so.
- Summaries must distinguish facts, risks, and recommendations.

---

## 14. AI Success Criteria

AI layer is successful if:

- Owner can understand today’s company condition quickly.
- Urgent issues are visible.
- Missing updates are clearly identified.
- Recommendations are practical.
- AI output is grounded in ERP data.
- Every run is logged.
- Fallback behavior works when default call fails.
