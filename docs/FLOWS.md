# Flowchart & System Flow
## SaaS Agentic Interior ERP — Dekoria Living

**Version:** v1.1  
**Last updated:** 2026-05-06  
**Status:** Updated after recent technical direction changes

Dokumen ini berisi kumpulan flow penting untuk pengembangan sistem ERP/internal system Dekoria Living. Flow ini menjadi bridge antara PRD, MVP System Blueprint, database schema, wireframe, technical architecture, API structure, dan sprint development.

---

## 0. Recent Update Summary

Update terbaru yang sudah dimasukkan ke flow ini:

```txt
1. Backend database diarahkan ke NeonDB / PostgreSQL, bukan Supabase.
2. File/image storage diarahkan ke ImageKit untuk render, DED, foto progress, dan asset konten.
3. AI agent layer menggunakan Mastra sebagai agent framework/orchestrator.
4. Model utama AI menggunakan Gemini 3 Flash dengan reasoning cukup tinggi.
5. Fallback AI menggunakan Gemini 3 Flash dengan reasoning lebih rendah untuk task ringan/hemat resource.
6. Flow AI dipisahkan antara summary, alert detection, project health, dan content opportunity.
7. Flow upload asset sekarang melewati ImageKit, lalu metadata disimpan ke NeonDB.
8. Flow development disesuaikan dengan MVP System Blueprint dan agentic architecture.
```

---

## 1. Updated High-Level Architecture Flow

Flow arsitektur terbaru setelah perubahan ke NeonDB, ImageKit, Mastra, dan Gemini.

```mermaid
flowchart TD
    A[User Browser / App] --> B[Frontend App]
    B --> C[Server Actions / API Routes]

    C --> D[Auth & Role Access Layer]
    C --> E[Business Logic Layer]
    C --> F[File Upload Handler]
    C --> G[AI Agent Request]

    E --> H[(NeonDB / PostgreSQL)]
    F --> I[ImageKit Storage & CDN]
    I --> J[Asset URL / Metadata]
    J --> H

    G --> K[Mastra Agent Orchestrator]
    K --> L{Task Type}

    L -->|Complex Summary / Reasoning| M[Gemini 3 Flash - High Reasoning]
    L -->|Simple Classification / Fallback| N[Gemini 3 Flash - Low Reasoning]

    M --> O[AI Output]
    N --> O
    O --> H
    O --> P[Owner Dashboard / Alerts / Recommendations]

    H --> B
    P --> B
```

### Architecture Notes

```txt
Frontend App       = UI dashboard untuk owner dan team.
API Routes         = Gateway untuk CRUD, upload, AI request, dan role access.
NeonDB             = Primary relational database.
ImageKit           = Storage/CDN untuk gambar, render, DED, dan content assets.
Mastra             = AI agent framework untuk orchestration.
Gemini 3 Flash     = Main AI model untuk summary, classification, recommendation.
```

---

## 2. Overall System Flow

Flow besar sistem dari user login, masuk ke workspace berdasarkan role, menginput data, lalu data tersebut diproses menjadi insight untuk owner.

```mermaid
flowchart TD
    A[User Login] --> B{Role User}

    B -->|Owner| C[Owner Dashboard]
    B -->|Project Manager| D[PM Workspace]
    B -->|Designer| E[Design / DED Workspace]
    B -->|Purchasing| F[Material & Vendor Workspace]
    B -->|Sales| G[Sales / Leads Workspace]
    B -->|Marketing| H[Content Readiness Workspace]
    B -->|Admin / Finance| I[Admin / Finance Workspace]

    D --> J[Project Updates]
    E --> K[Design Progress Updates]
    F --> L[Material / Stock Updates]
    G --> M[Lead & Deal Updates]
    H --> N[Content Asset Updates]
    I --> O[Admin Notes / Budget Signals]

    J --> P[(NeonDB / PostgreSQL)]
    K --> P
    L --> P
    M --> P
    N --> P
    O --> P

    N --> X[ImageKit Asset Storage]
    K --> X
    J --> X
    X --> P

    P --> Q[Mastra AI Agent Layer]
    Q --> R[Owner Morning Summary]
    Q --> S[Urgent Alerts]
    Q --> T[Project Health Score]
    Q --> U[Company Performance Snapshot]
    Q --> V[Content Opportunity Detection]

    R --> C
    S --> C
    T --> C
    U --> C
    V --> H
```

### Purpose

Sistem menjadi satu pusat informasi operasional perusahaan. Semua update dari PM, designer, purchasing, sales, marketing, dan admin masuk ke database utama, asset visual masuk ke ImageKit, lalu Mastra agent membaca konteks dari NeonDB untuk menghasilkan summary, alert, health score, dan rekomendasi action.

---

## 3. Role-Based User Flow

Flow ini menjelaskan aktivitas utama tiap role di dalam sistem.

```mermaid
flowchart LR
    A[Login] --> B{Role User}

    B --> C[Owner]
    B --> D[PM]
    B --> E[Designer]
    B --> F[Purchasing]
    B --> G[Sales]
    B --> H[Marketing]
    B --> I[Admin / Finance]

    C --> C1[Lihat semua project]
    C --> C2[Lihat urgent issue]
    C --> C3[Lihat AI summary]
    C --> C4[Lihat company snapshot]
    C --> C5[Lihat recommended owner action]

    D --> D1[Update progress project]
    D --> D2[Upload foto lapangan]
    D --> D3[Catat issue]
    D --> D4[Update milestone]

    E --> E1[Update status design]
    E --> E2[Upload render / DED]
    E --> E3[Catat revisi]
    E --> E4[Submit design approval]

    F --> F1[Update material]
    F --> F2[Update vendor]
    F --> F3[Update stock urgent]
    F --> F4[Update delivery status]

    G --> G1[Input leads]
    G --> G2[Update deal stage]
    G --> G3[Convert lead to project]

    H --> H1[Lihat project siap konten]
    H --> H2[Tag footage available]
    H --> H3[Update content status]
    H --> H4[Generate content idea via AI]

    I --> I1[Input admin notes]
    I --> I2[Input budget signal ringan]
    I --> I3[Track document completeness]
```

### Role Summary

| Role | Main Responsibility |
|---|---|
| Owner | Melihat kondisi perusahaan, project, issue, sales, material, AI summary, dan recommended action |
| PM | Update progress harian, issue lapangan, milestone project, dan foto progress |
| Designer | Update status design, render, revisi, DED, approval, dan upload file visual |
| Purchasing | Update material, vendor, stok, PO, dan delivery |
| Sales | Input leads, update deal stage, convert lead menjadi project |
| Marketing | Melihat project siap konten, tagging asset, dan membuat content plan |
| Admin / Finance | Menginput data administratif dan budget signal ringan untuk MVP |

---

## 4. Project Lifecycle Flow

Flow utama perjalanan project dari lead sampai selesai dan siap dijadikan portfolio/content.

```mermaid
flowchart TD
    A[Lead Masuk] --> B[Consultation / Survey]
    B --> C{Lead Deal?}

    C -->|Tidak| D[Lead Archived / Follow Up Later]
    C -->|Ya| E[Create Project in NeonDB]

    E --> F[Project Brief]
    F --> G[Design Concept]
    G --> H[3D Render / Design Development]
    H --> H1[Upload Render to ImageKit]
    H1 --> I[Client Revision]
    I --> J{Design Approved?}

    J -->|Belum| H
    J -->|Ya| K[DED / Technical Drawing]
    K --> K1[Upload DED to ImageKit]

    K1 --> L[Material Planning]
    L --> M[Purchasing / Vendor Order]
    M --> N[Production / Fabrication]
    N --> O[Installation]
    O --> P[Site Progress Update]
    P --> P1[Upload Progress Photos to ImageKit]
    P1 --> Q{Issue Found?}

    Q -->|Ya| R[Create Issue / Alert Owner]
    R --> P

    Q -->|Tidak| S[Finishing]
    S --> T[Handover]
    T --> U[Project Completed]
    U --> V[Content Ready / Portfolio Ready]
    V --> W[Marketing Reviews Asset]
```

### Recommended Project Status Enum

```txt
Lead
Survey
Design Concept
Design Revision
Design Approved
DED
Material Planning
Purchasing
Production
Installation
Finishing
Handover
Completed
Content Ready
Archived
```

---

## 5. Daily Project Update Flow

Flow untuk PM melakukan update progress harian.

```mermaid
flowchart TD
    A[PM Login] --> B[Open Assigned Project]
    B --> C[Submit Daily Update]

    C --> D[Input Progress Percentage]
    C --> E[Upload Site Photos]
    C --> F[Write Work Summary]
    C --> G[Report Issue / Blocker]
    C --> H[Update Next Action]

    E --> E1[Store Photo in ImageKit]
    E1 --> E2[Save Asset Metadata to NeonDB]

    D --> I[Save Update to NeonDB]
    F --> I
    G --> J{Is Issue Urgent?}
    H --> I
    E2 --> I

    J -->|No| I
    J -->|Yes| K[Create Alert Record]
    K --> L[Notify Owner Dashboard]

    I --> M[Trigger Mastra Summary Agent]
    M --> N[Gemini 3 Flash Generates Daily Project Summary]
    N --> O[Save AI Summary to NeonDB]
    O --> P[Show in Owner Dashboard]
```

### Daily Update Fields

```txt
project_id
updated_by
date
progress_percentage
work_summary
issue_status
issue_description
photos_asset_ids
next_action
ai_summary_id
created_at
updated_at
```

---

## 6. Asset Upload & Storage Flow

Flow baru untuk semua file visual: render, DED, progress photo, handover photo, dan content footage thumbnail.

```mermaid
flowchart TD
    A[User Selects File] --> B[Frontend Validates File]
    B --> C{File Valid?}

    C -->|No| D[Show Upload Error]
    C -->|Yes| E[Request Upload Signature / Upload Endpoint]

    E --> F[Upload File to ImageKit]
    F --> G{Upload Success?}

    G -->|No| H[Retry / Show Error]
    G -->|Yes| I[Receive ImageKit URL & File ID]

    I --> J[Save Asset Metadata to NeonDB]
    J --> K[Link Asset to Project / Update / Design / Content]
    K --> L[Asset Available in UI]
```

### Asset Metadata Fields

```txt
id
project_id
related_entity_type
related_entity_id
asset_type
file_name
file_url
imagekit_file_id
mime_type
file_size
uploaded_by
created_at
```

### Asset Type Enum

```txt
3d_render
ded_file
site_photo
progress_photo
handover_photo
before_photo
after_photo
content_footage
content_thumbnail
material_reference
client_document
```

---

## 7. Owner Morning Dashboard Flow

Flow ketika owner membuka dashboard setiap pagi.

```mermaid
flowchart TD
    A[Owner Opens Dashboard] --> B[Fetch Latest Data from NeonDB]

    B --> C[Active Projects]
    B --> D[Delayed Projects]
    B --> E[Urgent Issues]
    B --> F[Pending Design / DED]
    B --> G[Material Problems]
    B --> H[New Leads]
    B --> I[Content Ready Projects]
    B --> J[Recent AI Summaries]

    C --> K[Mastra Owner Brief Agent]
    D --> K
    E --> K
    F --> K
    G --> K
    H --> K
    I --> K
    J --> K

    K --> L[Gemini 3 Flash - High Reasoning]
    L --> M[Morning Brief]
    M --> N[What Needs Attention Today]
    M --> O[Project Health Overview]
    M --> P[Recommended Owner Actions]
    M --> Q[Content Opportunities]
```

### Example AI Morning Brief

```txt
Hari ini ada 3 project yang butuh perhatian.

1. Project A mengalami delay karena material belum datang.
2. Project B sudah masuk tahap finishing dan siap difoto untuk konten.
3. Project C masih menunggu approval DED dari client.

Rekomendasi:
- Follow up purchasing untuk material Project A.
- Jadwalkan shooting Project B.
- Minta designer follow up approval Project C.
```

---

## 8. Design / DED Flow

Flow kerja designer dari membaca brief sampai DED selesai.

```mermaid
flowchart TD
    A[Designer Opens Project] --> B[Review Project Brief]
    B --> C[Create Design Concept]
    C --> D[Upload 3D Render to ImageKit]
    D --> E[Save Render Metadata to NeonDB]
    E --> F[Submit for Internal Review]

    F --> G{Approved Internally?}

    G -->|No| H[Revise Design]
    H --> D

    G -->|Yes| I[Send to Client]
    I --> J{Client Approved?}

    J -->|No| K[Client Revision Notes]
    K --> H

    J -->|Yes| L[Create DED]
    L --> M[Upload Technical Drawing to ImageKit]
    M --> N[Save DED Metadata to NeonDB]
    N --> O[Mark Design Approved]
    O --> P[Notify PM / Purchasing]
    P --> Q[Trigger AI Summary Update]
```

### Recommended Design Status Enum

```txt
Not Started
Concepting
3D Render In Progress
Internal Review
Client Review
Revision
Approved
DED In Progress
DED Completed
```

---

## 9. Material / Purchasing Flow

Flow purchasing dari material list sampai material siap produksi atau instalasi.

```mermaid
flowchart TD
    A[Project Design Approved] --> B[Material List Created]
    B --> C[Purchasing Reviews Material Needs]

    C --> D{Material Available?}

    D -->|Yes| E[Reserve Stock]
    D -->|No| F[Request Vendor Quotation]

    F --> G[Choose Vendor]
    G --> H[Create Purchase Order]
    H --> I[Track Delivery]

    I --> J{Delivery On Time?}

    J -->|Yes| K[Material Received]
    J -->|No| L[Mark as Delayed]
    L --> M[Create Material Alert]
    M --> N[Mastra Detects Project Risk]
    N --> O[Owner Dashboard Warning]

    K --> P[Update Stock / Project Material Status]
    P --> Q[Ready for Production / Installation]
```

### Recommended Material Status Enum

```txt
Needed
Checking Stock
Available
Need Purchase
PO Created
Waiting Delivery
Delayed
Received
Installed
Cancelled
```

---

## 10. Sales to Project Flow

Flow dari lead masuk sampai menjadi project aktif.

```mermaid
flowchart TD
    A[Lead Input] --> B[Lead Qualification]
    B --> C{Qualified?}

    C -->|No| D[Archive / Nurture]
    C -->|Yes| E[Schedule Consultation]

    E --> F[Consultation Done]
    F --> G[Survey / Measurement]
    G --> H[Proposal / Estimate]

    H --> I{Deal Won?}

    I -->|No| J[Lost / Follow Up Later]
    I -->|Yes| K[Create Project in NeonDB]
    K --> L[Assign PM]
    L --> M[Assign Designer]
    M --> N[Project Kickoff]
    N --> O[AI Creates Project Kickoff Summary]
```

### Recommended Sales Stage Enum

```txt
New Lead
Hot
Contacted
Consultation Scheduled
Consultation Done
Survey Scheduled
Survey Done
Proposal Sent
Negotiation
Won
Lost
Converted to Project
```

---

## 11. Content Readiness Flow

Flow untuk melihat project mana yang sudah bisa dijadikan konten marketing.

```mermaid
flowchart TD
    A[Project Progress Updated] --> B{Project Has Visual Asset?}

    B -->|No| C[Not Ready for Content]
    B -->|Yes| D[Fetch Assets from ImageKit Metadata]

    D --> E{Asset Type}

    E --> F[3D Render]
    E --> G[Site Progress Photo]
    E --> H[Installation Video]
    E --> I[Final Result Photo]
    E --> J[Before After]

    F --> K[Mastra Content Opportunity Agent]
    G --> K
    H --> K
    I --> K
    J --> K

    K --> L[AI Suggests Content Angle]
    L --> M{Marketing Review}

    M -->|Not Useful Yet| N[Keep as Archive]
    M -->|Useful| O[Mark as Content Ready]

    O --> P[Create Content Idea]
    P --> Q[Assign Content Format]
    Q --> R[Reels / Carousel / Story / Ads]
```

### Recommended Content Status Enum

```txt
No Asset
Raw Asset Available
Need Review
Content Ready
Script Needed
Editing
Scheduled
Published
Used for Ads
Archived
```

---

## 12. AI Agent Flow - Mastra + Gemini

Flow bagaimana Mastra mengatur AI task dan memilih reasoning mode.

```mermaid
flowchart TD
    A[AI Task Requested] --> B[Mastra Agent Orchestrator]
    B --> C{Task Category}

    C -->|Owner Morning Brief| D[High Context Summary Agent]
    C -->|Project Update Summary| E[Project Summary Agent]
    C -->|Urgent Detection| F[Alert Classification Agent]
    C -->|Health Score Explanation| G[Project Health Agent]
    C -->|Content Opportunity| H[Marketing Content Agent]

    D --> I[Gemini 3 Flash - High Reasoning]
    E --> I
    G --> I
    H --> I

    F --> J[Gemini 3 Flash - Low Reasoning]

    I --> K{AI Success?}
    J --> K

    K -->|Yes| L[Save Output to NeonDB]
    K -->|No| M[Fallback to Low Reasoning / Simpler Prompt]
    M --> N[Save Fallback Output + Error Metadata]

    L --> O[Show Output in UI]
    N --> O
```

### AI Task Priority

```txt
P0 - Owner Morning Brief
P0 - Urgent Alert Detection
P1 - Daily Project Summary
P1 - Project Health Explanation
P2 - Content Opportunity Suggestion
P2 - Sales Lead Summary
```

### Model Routing Rule

```txt
Use Gemini 3 Flash high reasoning for:
- Owner dashboard summary
- Cross-project analysis
- Recommended owner actions
- Project health explanation
- Content opportunity with strategy angle

Use Gemini 3 Flash low reasoning for:
- Urgent keyword detection
- Simple classification
- Status normalization
- Short daily update summary
- Fallback when high reasoning fails
```

---

## 13. AI Summary Flow

Flow bagaimana AI membaca data dan menghasilkan summary, alert, dan rekomendasi action.

```mermaid
flowchart TD
    A[New Data Entered] --> B[Data Stored in NeonDB]
    B --> C[Mastra Reads Relevant Context]
    C --> D[AI Classifies Information]

    D --> E[Project Progress]
    D --> F[Urgent Issue]
    D --> G[Design Delay]
    D --> H[Material Risk]
    D --> I[Sales Update]
    D --> J[Content Opportunity]

    E --> K[Generate Summary]
    F --> L[Generate Alert]
    G --> L
    H --> L
    I --> K
    J --> M[Generate Content Suggestion]

    K --> N[Owner Dashboard Summary]
    L --> O[Alert Notification]
    M --> P[Marketing Content Queue]

    N --> Q[Save AI Output to NeonDB]
    O --> Q
    P --> Q
```

### MVP AI Capability

Untuk MVP, AI tidak perlu langsung terlalu otomatis. Cukup mulai dari kemampuan berikut:

```txt
- Summarize latest project updates
- Detect urgent keywords
- List delayed projects
- Suggest owner action
- Identify project ready for content
- Explain project health status
- Suggest simple content angle from available visual assets
```

### Example Urgent Keywords

```txt
delay
belum datang
revisi
client belum approve
material kosong
vendor telat
install mundur
ded belum selesai
butuh keputusan owner
approval tertahan
site belum update
progress stuck
```

---

## 14. Project Health Score Flow

Flow untuk menentukan status kesehatan project.

```mermaid
flowchart TD
    A[Project Data from NeonDB] --> B[Check Progress]
    A --> C[Check Timeline]
    A --> D[Check Design Status]
    A --> E[Check Material Status]
    A --> F[Check Issue Count]
    A --> G[Check Latest Update]
    A --> H[Check Client Approval]

    B --> I[Calculate Health Score]
    C --> I
    D --> I
    E --> I
    F --> I
    G --> I
    H --> I

    I --> J{Score Result}

    J -->|80-100| K[Healthy]
    J -->|50-79| L[Needs Attention]
    J -->|0-49| M[Critical]

    K --> N[Show Green Status]
    L --> O[Show Yellow Warning]
    M --> P[Show Red Alert]

    O --> Q[Mastra Explains Risk]
    P --> Q
    Q --> R[Recommended Action]
```

### Example Scoring Logic MVP

```txt
Start from 100 points.

- No update for more than 3 days: -20
- Material delayed: -20
- Design not approved after target date: -20
- Has urgent issue: -25
- Progress behind schedule: -30
- Client approval pending: -10
- DED not completed after design approval: -15

Final:
80-100 = Healthy
50-79 = Needs Attention
0-49 = Critical
```

---

## 15. Notification / Alert Flow

Flow untuk membuat alert otomatis berdasarkan event penting.

```mermaid
flowchart TD
    A[System Detects Event] --> B{Event Type}

    B --> C[Material Delayed]
    B --> D[Project No Update]
    B --> E[Design Approval Pending]
    B --> F[Urgent PM Issue]
    B --> G[New Lead]
    B --> H[Project Ready for Content]
    B --> I[DED Pending]

    C --> J[Create Alert Record]
    D --> J
    E --> J
    F --> J
    G --> J
    H --> J
    I --> J

    J --> K[Save Alert to NeonDB]
    K --> L[Show on Owner Dashboard]
    K --> M[Show to Related Role]
    K --> N[Mastra Adds Alert to Morning Brief]
```

### Recommended Alert Types

```txt
Project Delay
No Daily Update
Material Delay
Design Pending
DED Pending
Urgent Issue
Lead Needs Follow Up
Content Opportunity
Client Approval Pending
Production Risk
Installation Risk
```

---

## 16. Updated Database Entity Relationship Flow

Gambaran awal entity utama untuk NeonDB / PostgreSQL.

```mermaid
erDiagram
    USERS ||--o{ PROJECT_ASSIGNMENTS : has
    USERS ||--o{ PROJECT_UPDATES : creates
    USERS ||--o{ ASSETS : uploads
    CLIENTS ||--o{ PROJECTS : owns
    LEADS ||--o| PROJECTS : converts_to
    PROJECTS ||--o{ PROJECT_ASSIGNMENTS : has
    PROJECTS ||--o{ PROJECT_UPDATES : has
    PROJECTS ||--o{ DESIGN_TASKS : has
    PROJECTS ||--o{ MATERIAL_ITEMS : needs
    PROJECTS ||--o{ ISSUES : has
    PROJECTS ||--o{ ASSETS : has
    PROJECTS ||--o{ CONTENT_ITEMS : produces
    PROJECTS ||--o{ AI_OUTPUTS : has
    VENDORS ||--o{ MATERIAL_ITEMS : supplies
    ISSUES ||--o{ ALERTS : creates

    USERS {
        uuid id
        string name
        string role
        string email
        datetime created_at
    }

    CLIENTS {
        uuid id
        string name
        string phone
        string address
        datetime created_at
    }

    LEADS {
        uuid id
        string name
        string source
        string status
        string budget_range
        datetime created_at
    }

    PROJECTS {
        uuid id
        uuid client_id
        string project_name
        string status
        string health_status
        int health_score
        date start_date
        date target_end_date
        datetime created_at
    }

    PROJECT_ASSIGNMENTS {
        uuid id
        uuid project_id
        uuid user_id
        string assignment_role
    }

    PROJECT_UPDATES {
        uuid id
        uuid project_id
        uuid updated_by
        string summary
        int progress_percentage
        string issue_status
        datetime created_at
    }

    DESIGN_TASKS {
        uuid id
        uuid project_id
        string status
        string revision_notes
        datetime updated_at
    }

    MATERIAL_ITEMS {
        uuid id
        uuid project_id
        uuid vendor_id
        string name
        string status
        int quantity
        datetime updated_at
    }

    ISSUES {
        uuid id
        uuid project_id
        string severity
        string description
        string status
        datetime created_at
    }

    ALERTS {
        uuid id
        uuid project_id
        uuid issue_id
        string alert_type
        string severity
        string status
        datetime created_at
    }

    ASSETS {
        uuid id
        uuid project_id
        uuid uploaded_by
        string asset_type
        string file_url
        string imagekit_file_id
        datetime created_at
    }

    CONTENT_ITEMS {
        uuid id
        uuid project_id
        string content_type
        string status
        string angle
        datetime created_at
    }

    AI_OUTPUTS {
        uuid id
        uuid project_id
        string output_type
        string model_used
        string reasoning_mode
        string content
        datetime created_at
    }

    VENDORS {
        uuid id
        string name
        string contact
        string category
    }
```

---

## 17. MVP Development Flow

Flow development dari PRD sampai internal launch, disesuaikan dengan stack terbaru.

```mermaid
flowchart TD
    A[PRD Completed] --> B[Create Flows]
    B --> C[Create MVP System Blueprint]
    C --> D[Create Data Model]
    D --> E[Create Wireframe]
    E --> F[Create Design System]
    F --> G[Create Technical Architecture]

    G --> H[Setup Project Repository]
    H --> I[Setup NeonDB]
    I --> J[Setup ImageKit]
    J --> K[Setup Auth & Role Access]
    K --> L[Setup Mastra AI Layer]
    L --> M[Setup Gemini Model Routing]

    M --> N[Build Owner Dashboard]
    N --> O[Build Project Module]
    O --> P[Build Daily Update Module]
    P --> Q[Build Asset Upload Module]
    Q --> R[Build Design / DED Module]
    R --> S[Build Material Module]
    S --> T[Build Sales / Leads Module]
    T --> U[Build Content Readiness Module]

    U --> V[Build AI Summary MVP]
    V --> W[Build Alert & Health Score]
    W --> X[Internal Testing]
    X --> Y[Fix Bugs]
    Y --> Z[Deploy MVP]
    Z --> AA[Team Training]
    AA --> AB[Collect Feedback]
    AB --> AC[Plan V2]
```

---

## 18. Updated Recommended Documentation Structure

Struktur dokumentasi yang disarankan untuk project besar ini.

```txt
/docs
  /01-prd
    prd.md

  /02-flows
    flows.md

  /03-blueprint
    mvp-system-blueprint.md

  /04-data
    database-schema.md
    entity-relationship.md
    status-enums.md
    seed-data.md

  /05-ui-ux
    wireframe-owner-dashboard.md
    wireframe-project-detail.md
    wireframe-daily-update.md
    wireframe-mobile-view.md
    design-system.md

  /06-technical
    tech-architecture.md
    api-routes.md
    authentication-role-access.md
    neon-db-architecture.md
    imagekit-storage-architecture.md
    ai-agent-architecture.md
    mastra-agent-plan.md
    gemini-model-routing.md

  /07-development
    development-roadmap.md
    sprint-plan.md
    task-breakdown.md
    ai-coding-agent-instructions.md
```

---

## 19. Development Priority Flow

Urutan development yang paling masuk akal untuk MVP setelah update stack.

```mermaid
flowchart TD
    A[Phase 1: Foundation] --> B[Auth + Role Access]
    B --> C[NeonDB Schema]
    C --> D[ImageKit Upload Setup]
    D --> E[Basic Layout / Dashboard Shell]

    E --> F[Phase 2: Core Project System]
    F --> G[Project List]
    G --> H[Project Detail]
    H --> I[Daily Update]
    I --> J[Asset Upload]
    J --> K[Issue Tracking]

    K --> L[Phase 3: Supporting Modules]
    L --> M[Design / DED Status]
    M --> N[Material Status]
    N --> O[Sales / Leads]
    O --> P[Content Readiness]

    P --> Q[Phase 4: Agentic Intelligence]
    Q --> R[Mastra Setup]
    R --> S[Gemini Model Routing]
    S --> T[AI Summary]
    T --> U[Project Health Score]
    U --> V[Alerts]
    V --> W[Content Opportunity Agent]

    W --> X[Phase 5: Polish & Internal Launch]
    X --> Y[UI Polish]
    Y --> Z[Testing]
    Z --> AA[Team Onboarding]
```

---

## 20. MVP Scope Recommendation

### Must Have

```txt
1. Login & role access
2. Owner dashboard
3. Project list
4. Project detail
5. Daily update PM
6. ImageKit upload for project photos/render/DED
7. NeonDB relational data structure
8. Design / DED status
9. Material status
10. Sales / leads snapshot
11. Content readiness status
12. Mastra AI summary simple
13. Urgent alerts
```

### Should Have

```txt
1. Project health score
2. AI recommended owner action
3. Filter project by status
4. Search project/client
5. Timeline activity
6. Basic notification
7. Content opportunity suggestion
8. Asset gallery per project
```

### Later

```txt
1. Finance deep tracking
2. Budget vs actual
3. Vendor performance
4. Advanced analytics
5. WhatsApp integration
6. Mobile app
7. Client portal
8. Full AI agent automation
9. Approval workflow with client-facing link
10. Advanced permission system
```

---

## 21. Most Important Flow to Build First

Flow inti yang sebaiknya dibangun paling awal agar sistem langsung terasa berguna.

```mermaid
flowchart TD
    A[Create Project in NeonDB] --> B[Assign PM & Designer]
    B --> C[PM Daily Update]
    C --> D[Upload Progress Asset to ImageKit]
    D --> E[Designer Status Update]
    E --> F[Material Status Update]
    F --> G[System Detects Issue]
    G --> H[Mastra Creates AI Summary]
    H --> I[Gemini Generates Recommended Action]
    I --> J[Owner Dashboard Shows Insight]
```

### Core Principle

```txt
Tim update data → asset tersimpan rapi → sistem membaca konteks → AI membuat insight → owner mengambil keputusan.
```

Kalau flow ini selesai dulu, sistem sudah punya value utama walaupun modul lain belum sempurna.

---

## 22. Next Recommended Documents

Setelah dokumen flow ini, dokumen berikutnya yang perlu dibuat atau disesuaikan adalah:

```txt
1. database-schema.md
2. status-enums.md
3. tech-architecture.md
4. neon-db-architecture.md
5. imagekit-storage-architecture.md
6. ai-agent-architecture.md
7. mastra-agent-plan.md
8. gemini-model-routing.md
9. api-routes.md
10. sprint-plan.md
11. task-breakdown.md
12. ai-coding-agent-instructions.md
```

---

## 23. Priority Summary

Flow paling penting untuk dijadikan dasar development awal:

```txt
1. Updated High-Level Architecture Flow
2. Project Lifecycle Flow
3. Daily Project Update Flow
4. Asset Upload & Storage Flow
5. Owner Morning Dashboard Flow
6. AI Agent Flow - Mastra + Gemini
7. AI Summary Flow
8. Project Health Score Flow
9. Database Entity Relationship Flow
10. MVP Development Flow
```

Dokumen ini bisa digunakan sebagai bridge antara PRD, MVP System Blueprint, dan technical planning.
