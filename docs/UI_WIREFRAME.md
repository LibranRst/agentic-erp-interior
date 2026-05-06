# UI_WIREFRAME.md
# SaaS Agentic Interior ERP — UI Wireframe

## 1. UI Foundation

```txt
UI Library: shadcn/ui
Preset: b5d2ZsMLI
Template: Next.js
Package Manager: Bun
Local Runtime: Bun
```

Initialize with:

```bash
bunx --bun shadcn@latest init --preset b5d2ZsMLI --template next --pointer
```

Rules:

- Use shadcn components first.
- The preset is the UI source of truth.
- Do not hardcode random colors.
- Do not create a separate design system.
- Keep ERP screens clean, premium, readable, and data-dense.

---

## 2. Global App Shell

```txt
┌──────────────────────────────────────────────────────────────┐
│ Header: page title, search, user avatar                      │
├───────────────┬──────────────────────────────────────────────┤
│ Sidebar       │ Main Content                                 │
│               │                                              │
│ Dashboard     │ Page Header                                  │
│ Projects      │ Filters / Actions                            │
│ Daily Updates │ Cards / Tables / Forms                        │
│ Design / DED  │                                              │
│ Materials     │                                              │
│ Sales         │                                              │
│ Content       │                                              │
│ AI Summary    │                                              │
│ Users         │                                              │
│ Settings      │                                              │
└───────────────┴──────────────────────────────────────────────┘
```

Mobile:

```txt
Sidebar becomes sheet/drawer.
Tables use horizontal scroll.
Cards stack into one column.
Forms become full width.
```

---

## 3. Dashboard Page

Route:

```txt
/app/dashboard
```

Wireframe:

```txt
Page Header
- Title: Owner Dashboard
- Subtitle: Ringkasan kondisi operasional hari ini
- Action: Generate AI Summary

Summary Cards
[Active Projects] [Urgent Projects] [Pending Design] [Material Issues] [New Leads] [Content Ready]

Main Grid
Left Column:
- AI Morning Summary Card
- Project Health Overview
- Latest PM Updates

Right Column:
- Design Status Snapshot
- Material Warning Snapshot
- Sales Snapshot
- Content Readiness Snapshot
```

---

## 4. Projects Page

Route:

```txt
/app/projects
```

Wireframe:

```txt
Page Header
- Title: Projects
- Action: Add New Project

Toolbar
- Search
- Status filter
- Health filter
- PM filter
- Priority filter

Data Table
- Project
- Client
- Location
- PM
- Designer
- Status
- Health
- Progress
- Deadline
- Actions
```

---

## 5. Project Detail Page

Route:

```txt
/app/projects/[projectId]
```

Wireframe:

```txt
Project Detail Header
- Project name
- Client name
- Location
- Status badge
- Health badge
- Progress
- Deadline

Tabs
1. Overview
2. Daily Updates
3. Design / DED
4. Materials
5. Sales Info
6. Content
7. Media
8. AI Summary
```

### Overview Tab

```txt
- Progress card
- Latest update
- Open issues
- Next action
- Deadline warning
```

### Media Tab

```txt
- Upload button
- Filter by related type
- Grid/list of ImageKit media assets
- Preview image/video/document
```

---

## 6. Daily Updates Page

Route:

```txt
/app/daily-updates
```

Wireframe:

```txt
Page Header
- Title: Daily Updates
- Action: New Update

Toolbar
- Project filter
- Date filter
- Health filter

Timeline / Table
- Date
- Project
- Updated by
- Progress summary
- Issue
- Health
- Attachment count
- Actions
```

Form fields:

```txt
Project
Date
Progress summary
Work completed
Issue notes
Blocker notes
Next action
Progress percentage
Health status
Attachments via ImageKit
```

---

## 7. Design / DED Page

Route:

```txt
/app/design
```

Wireframe:

```txt
Page Header
- Title: Design / DED Tracker
- Action: Add Design Task

Summary Cards
- Pending Design
- Waiting Approval
- DED Progress
- Blocked

Data Table
- Project
- Designer
- Task
- Design type
- Status
- Approval
- Revision count
- Due date
- Actions
```

---

## 8. Materials Page

Route:

```txt
/app/materials
```

Wireframe:

```txt
Page Header
- Title: Material Tracker
- Action: Add Material

Summary Cards
- Delayed
- Critical
- In Delivery
- Arrived

Data Table
- Project
- Material
- Category
- Vendor
- Status
- Urgency
- ETA
- Issue notes
- Actions
```

---

## 9. Sales Page

Route:

```txt
/app/sales
```

Wireframe:

```txt
Page Header
- Title: Sales / Leads
- Action: Add Lead

Summary Cards
- New Leads
- Follow-up Needed
- Hot Leads
- Converted

Data Table
- Lead
- Contact
- Source
- Interest
- Estimated value
- Status
- Assigned sales
- Next follow-up
- Actions
```

---

## 10. Content Readiness Page

Route:

```txt
/app/content
```

Wireframe:

```txt
Page Header
- Title: Content Readiness
- Action: Add Content Opportunity

Summary Cards
- Ready to Shoot
- Footage Available
- Editing
- Published

Data Table
- Project
- Room / Area
- Visual status
- Footage status
- Opportunity
- Suggested angle
- Content status
- Publish link
- Actions
```

---

## 11. AI Summary Page

Route:

```txt
/app/ai-summary
```

Wireframe:

```txt
Page Header
- Title: AI Summary
- Action: Generate Summary

Filters
- Summary type
- Date

Latest Summary Card
- Summary type
- Generated at
- Generated by
- Content

History Table
- Date
- Type
- Model
- Reasoning
- Status
- Actions
```

---

## 12. Media Page

Route:

```txt
/app/media
```

Wireframe:

```txt
Page Header
- Title: Media Assets
- Action: Upload Media

Toolbar
- Project filter
- Related type filter
- File type filter

Gallery / Table Toggle
- Thumbnail
- File name
- Project
- Related type
- Uploaded by
- Created at
- Actions
```

---

## 13. Users Page

Route:

```txt
/app/users
```

Wireframe:

```txt
Page Header
- Title: Users
- Action: Invite User / Add User

Data Table
- Name
- Email
- Role
- Status
- Last active
- Actions
```

---

## 14. Shared UI Components

```txt
MetricCard
StatusBadge
HealthBadge
PriorityBadge
DataTable
EmptyState
LoadingState
PageToolbar
SectionHeader
MediaUploader
ImageKitPreview
AiSummaryCard
```

---

## 15. UI Success Criteria

- Owner understands company condition within 30 seconds.
- Tables are readable and easy to filter.
- Forms are simple and not overwhelming.
- Status and urgency are visually clear.
- AI summary feels like an executive briefing.
- UI remains consistent with the shadcn preset.
