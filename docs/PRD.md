# PRD v1 — Dekoria Agentic Interior ERP

## 1. Product Overview

Dekoria Agentic Interior ERP adalah sistem internal berbasis web untuk membantu owner dan tim Dekoria Living memantau operasional perusahaan secara lebih rapi, tercatat, dan mudah dikontrol.

MVP pertama difokuskan pada **Owner Command Center** yang menggabungkan data project, update harian PM, status desaign/DED, material urgent, sales/leads, content readiness, dan AI summary dalam satu dashboard utama.

Produk ini bukan hanya ERP internal biasa, tetapi diarahkan menjadi **Agentic Interior ERP**, yaitu sistem operasional yang memiliki AI assistant untuk membantu owner membaca kondisi perusahaan, mendeteksi risiko, dan menyarankan next action.

---

## 2. Background & Problem

Saat ini informasi operasional Dekoria masih tersebar di berbagai tempat, seperti WhatsApp, file designer, update PM, catatan purchasing, komunikasi vendor, dan dokumentasi marketing.

Akibatnya, owner sering harus bertanya ke banyak orang hanya untuk mengetahui kondisi perusahaan hari ini.

Masalah utama yang ingin diselesaikan:

1. Informasi project belum tercatat dalam satu sistem utama.
2. Progress project sulit dipantau secara cepat.
3. Update harian PM belum terstruktur.
4. Status design, revisi, dan DED masih perlu ditanyakan manual.
5. Material atau stock bermasalah kadang baru diketahui ketika sudah urgent.
6. Sales/leads belum terlihat sebagai snapshot yang mudah dibaca.
7. Project yang potensial untuk konten belum terdokumentasi dengan baik.
8. Owner belum punya AI assistant yang bisa merangkum kondisi perusahaan.
9. Miskomunikasi antar role masih sering terjadi karena data tersebar.

---

## 3. Product Goal

Membuat sistem internal yang membantu Dekoria Living memiliki satu pusat informasi operasional agar owner dapat melihat kondisi perusahaan dengan cepat, jelas, tercatat, dan actionable.

Target MVP v1:

Owner bisa membuka dashboard setiap pagi dan langsung tahu:

- Project mana yang sedang aktif.
- Project mana yang urgent atau bermasalah.
- Update terbaru dari PM.
- Status design, revisi, render, dan DED.
- Material atau stock yang pending.
- Lead/sales terbaru.
- Project mana yang siap dijadikan konten.
- AI summary kondisi perusahaan.
- Suggested next action dari AI assistant.

---

## 4. Product Vision

Menjadi sistem internal berbasis AI untuk bisnis interior design & contractor yang membantu owner, PM, designer, purchasing, admin, sales, dan marketing bekerja lebih sinkron, transparan, dan efisien.

Dalam jangka panjang, sistem ini bisa berkembang menjadi:

- Operational command center
- AI project assistant
- AI daily owner briefing
- Internal reporting system
- Content readiness tracker
- Sales pipeline tracker
- Material/vendor tracker
- Company performance dashboard
- AI risk detection system
- AI-generated weekly report

---

## 5. Product Positioning

Dekoria Agentic Interior ERP bukan ERP besar yang kompleks.

Produk ini adalah:

**Owner Command Center untuk bisnis interior design & contractor.**

Fokus MVP bukan membuat semua fitur bisnis langsung lengkap, tetapi membuat sistem yang:

- Membantu owner memahami kondisi perusahaan.
- Membuat data penting tercatat.
- Membuat tim lebih disiplin update.
- Membantu mendeteksi masalah lebih cepat.
- Menghubungkan project, sales, design, material, dan marketing dalam satu sistem.
- Menggunakan AI untuk merangkum dan memberi insight operasional.

---

## 6. Target Users

### 6.1 Owner

User utama MVP.

Kebutuhan owner:

- Melihat kondisi perusahaan setiap pagi.
- Tahu project mana yang urgent.
- Tidak perlu tanya satu-satu ke tim.
- Bisa melihat ringkasan progress project.
- Bisa melihat status DED/design.
- Bisa melihat material pending.
- Bisa melihat leads terbaru.
- Bisa melihat project yang siap dijadikan konten.
- Bisa mendapatkan AI summary cepat.
- Bisa mendapatkan rekomendasi next action.

### 6.2 Project Manager / PM

Kebutuhan PM:

- Update progress harian project.
- Menandai kendala di lapangan.
- Upload atau mencatat bukti progress.
- Memberi status project harian.
- Menandai project yang mulai bermasalah.

### 6.3 Designer

Kebutuhan designer:

- Update status design.
- Update status revisi.
- Update status render.
- Update status DED.
- Memberi catatan jika ada file/render/DED yang belum selesai.
- Menandai blocking issue dari sisi design.

### 6.4 Purchasing / Material Team

Kebutuhan purchasing:

- Update material yang pending.
- Update material yang urgent.
- Update material yang sudah ready.
- Mencatat kendala vendor.
- Memberi warning jika material berpotensi menghambat project.

### 6.5 Sales / Admin

Kebutuhan sales/admin:

- Input leads baru.
- Update status lead.
- Melihat snapshot leads.
- Mencatat project potensial dari pipeline sales.

### 6.6 Marketing / Content Team

Kebutuhan marketing:

- Melihat project yang siap dijadikan konten.
- Melihat project dengan visual menarik.
- Menandai konten yang sudah shooting.
- Menandai konten yang sudah diedit.
- Menandai konten yang sudah diposting.

---

## 7. MVP Scope

### 7.1 In Scope — MVP v1

Fitur utama:

1. Owner Dashboard
2. Project Tracking
3. Daily Progress Update PM
4. Design / Render / DED Status Tracker
5. Material & Stock Urgent Tracker
6. Sales / Leads Snapshot
7. Content Readiness Tracker
8. AI Summary Dashboard
9. AI Operational Assistant basic
10. User Role Basic Access
11. File/image attachment support
12. Basic activity/history log

### 7.2 Out of Scope — MVP v1

Belum masuk prioritas utama:

1. Finance detail lengkap
2. Payroll
3. Invoice automation
4. Full accounting
5. Inventory detail kompleks
6. Vendor scoring detail
7. HR system
8. Client portal
9. Mobile app native
10. Advanced analytics
11. Approval workflow kompleks
12. WhatsApp automation penuh
13. Full AI autonomous action
14. Advanced scheduling engine

Finance hanya boleh masuk sebagai **warning ringan**, misalnya catatan material value, budget concern, atau project yang berpotensi overbudget.

---

## 8. Recommended Tech Stack

### 8.1 Frontend

Recommended:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query or equivalent data-fetching layer

Frontend harus fokus pada:

- Dashboard yang clean dan cepat dibaca.
- Data table yang nyaman untuk operasional.
- Form input yang simpel.
- UI yang modern, professional, dan tidak terlalu kompleks.
- Responsive web agar tetap usable di tablet/mobile browser.

### 8.2 Backend

Recommended:

- Next.js API Route / Server Actions, atau backend modular sesuai kebutuhan development.
- TypeScript-first backend logic.
- Role-based access control.
- Structured service layer untuk project, updates, leads, material, content, dan AI.

### 8.3 Database

Database utama menggunakan:

**Neon Postgres**

Alasan:

- Berbasis PostgreSQL.
- Cocok untuk structured operational data.
- Scalable untuk SaaS/internal system.
- Mendukung relational data yang dibutuhkan ERP.
- Bisa digunakan dengan ORM seperti Prisma atau Drizzle.

Recommended ORM:

- Prisma, atau
- Drizzle ORM

### 8.4 Storage

Storage/media management menggunakan:

**ImageKit**

Digunakan untuk:

- Foto progress project.
- Dokumentasi site.
- Render preview.
- Asset DED preview jika berbentuk image/pdf preview.
- Asset konten marketing.
- Before-after media.
- Compressed/optimized image delivery.

ImageKit dipilih karena sistem Dekoria sangat bergantung pada visual asset interior.

### 8.5 Authentication

Auth dapat menggunakan salah satu opsi:

- Clerk
- Auth.js
- Custom auth dengan session-based authentication

Untuk MVP, disarankan memilih solusi auth yang cepat dan stabil agar development tidak terlalu berat.

### 8.6 AI Model

AI model default:

**Gemini 3 Flash**

Usage:

- AI daily summary
- AI project risk analysis
- AI project status briefing
- AI content opportunity detection
- AI suggested next action
- AI weekly report draft

Model behavior:

- Default reasoning level: medium/high untuk summary dan risk analysis.
- Fallback reasoning level: low untuk task ringan seperti formatting, short summary, atau label classification.
- Model routing harus mempertimbangkan cost, latency, dan complexity.

### 8.7 AI Agent Framework

AI agent framework:

**Mastra**

Mastra digunakan untuk membangun AI workflow dan agent layer.

Usage:

- AI summary workflow
- Project risk detection workflow
- Material issue analysis workflow
- Design/DED bottleneck workflow
- Content recommendation workflow
- Owner daily briefing workflow
- Tool calling ke internal database/service layer
- Context orchestration antar modul

Mastra tidak menggantikan backend utama, tetapi menjadi layer untuk menjalankan workflow AI.

---

## 9. AI Layer Requirements

### 9.1 AI Summary

AI Summary membantu owner membaca kondisi perusahaan secara cepat.

Input data:

- Project tracking
- Daily PM update
- Design/DED status
- Material urgent
- Sales/leads
- Content readiness

Output AI:

1. Ringkasan kondisi hari ini.
2. Project yang perlu perhatian.
3. Material issue.
4. Design/DED bottleneck.
5. Lead/sales highlight.
6. Content opportunity.
7. Suggested next action.

Example:

> Hari ini ada 8 project aktif. 5 project on track, 2 project warning, dan 1 project critical. Project Mr. H membutuhkan perhatian karena belum ada update PM selama 2 hari. Project Mrs. L menunggu DED final dari designer. Ada 2 material pending yang berpotensi menghambat instalasi minggu ini. Dari sisi sales, ada 3 leads baru dan 1 hot lead yang perlu follow-up hari ini. Dari sisi marketing, project Mr. S siap dijadikan konten cinematic showcase.

### 9.2 AI Project Risk Detection

AI harus bisa mendeteksi risiko berdasarkan pattern sederhana.

Risk signals:

- Project tidak update lebih dari 2 hari.
- Progress tidak berubah dalam beberapa hari.
- Status project critical.
- Material delayed mendekati required date.
- DED belum selesai sementara project mendekati production/install.
- Banyak issue terbuka dalam satu project.
- PM menandai need owner attention.

Output:

- Risk level: low, medium, high, critical.
- Reason.
- Suggested action.
- Related project.

### 9.3 AI Design / DED Bottleneck Detection

AI harus bisa mendeteksi bottleneck dari sisi design.

Signals:

- DED status pending.
- Render/revision terlalu lama.
- Project stage sudah production tapi DED belum approved.
- Designer note menunjukkan blocker.
- Waiting review terlalu lama.

Output:

- Project affected.
- Bottleneck type.
- Blocking reason.
- Suggested follow-up.

### 9.4 AI Material Issue Detection

AI harus bisa membaca data material urgent.

Signals:

- Material delayed.
- Waiting vendor terlalu lama.
- Required date dekat.
- Material issue terbuka.
- Project installation stage tapi material belum ready.

Output:

- Material risk.
- Project affected.
- Vendor/PIC.
- Suggested action.

### 9.5 AI Content Opportunity Detection

AI membantu marketing membaca project yang punya potensi konten.

Signals:

- Project completed.
- Visual quality high.
- Content potential high/hero.
- Room/area menarik.
- Before-after tersedia.
- Banyak detail craftsmanship.
- Project punya unique feature.

Output:

- Suggested content angle.
- Suggested format.
- Priority.
- Reason.

Example:

> Project Mr. S cocok dijadikan cinematic showcase karena visual quality tinggi, area master bedroom sudah completed, dan memiliki detail wall panel yang kuat sebagai hook visual.

---

## 10. Core Feature Requirements

## 10.1 Owner Dashboard

Dashboard utama yang menjadi pusat kontrol owner.

Dashboard sections:

### Top Summary Cards

- Active Projects
- Urgent Projects
- Pending DED
- Material Issues
- New Leads
- Ready Content

### AI Company Summary

- Daily executive summary
- Key alerts
- Suggested next actions

### Project Health Table

- Project
- PM
- Stage
- Progress
- Status
- Last Update

### Daily PM Updates

- Latest update feed
- Update hari ini
- Project belum update
- Project dengan issue

### Design / DED Bottleneck

- Pending design
- Pending revision
- Pending render
- Pending DED
- Waiting review

### Material Urgent

- Material delayed
- Material issue
- Vendor problem
- Required date

### Sales Snapshot

- New leads
- Hot leads
- Follow-up needed
- Deal/lost snapshot

### Content Opportunity

- Ready to shoot
- Ready to post
- Hero project candidates
- AI suggested content angle

---

## 10.2 Project Tracking

Data fields:

- Project name
- Client name
- Location
- Project type
- Room / area
- Project value optional
- Start date
- Target completion date
- PM assigned
- Designer assigned
- Current stage
- Progress percentage
- Status health
- Notes
- Attachments optional

Project stages:

1. Consultation
2. Survey
3. Design Concept
4. Design Revision
5. DED
6. Production
7. Installation
8. Finishing
9. Handover
10. Completed

Project health status:

- On Track
- Warning
- Critical
- Completed
- On Hold

Functional requirements:

- Create project
- Edit project
- Change project stage
- Update progress percentage
- Add notes
- View update history
- Mark project as urgent
- Mark project as completed
- Attach image/file link

---

## 10.3 Daily Progress Update PM

Data fields:

- Project
- Date
- Updated by
- Progress today
- Work completed
- Issue / blocker
- Next action
- Need owner attention
- Photo attachment optional
- Status

Functional requirements:

PM can:

- Input daily update
- Upload progress photo
- Mark issue/blocker
- Mark need owner attention
- View previous updates

Owner can:

- View latest daily updates
- Filter project without update
- Filter project with issue
- See AI summary from PM updates

---

## 10.4 Design / Render / DED Status Tracker

Data fields:

- Project
- Designer
- Design concept status
- Render status
- Revision status
- DED status
- Last update
- Blocking issue
- Notes
- File link optional

Status options:

- Not Started
- In Progress
- Waiting Review
- Revision
- Approved
- Done
- Blocked

Functional requirements:

Designer can:

- Update design status
- Update render status
- Update revision status
- Update DED status
- Add blocker note
- Add file/render/DED link

Owner can:

- View pending DED
- View design blocking production
- View designs waiting approval
- View AI bottleneck summary

---

## 10.5 Material & Stock Urgent Tracker

Data fields:

- Project
- Material name
- Category
- Quantity optional
- Vendor optional
- Status
- Required date
- Issue
- PIC
- Notes

Material status:

- Need Order
- Ordered
- Waiting Vendor
- Ready
- Delivered
- Delayed
- Issue

Functional requirements:

Purchasing can:

- Add urgent material
- Update material status
- Mark vendor issue
- Mark material delayed
- Add notes

Owner can:

- View urgent material on dashboard
- View delayed material
- View project blocked by material
- View AI material risk summary

---

## 10.6 Sales / Leads Snapshot

Data fields:

- Lead name
- Contact
- Source
- Location
- Project type
- Estimated budget optional
- Status
- Assigned to
- Last follow-up
- Next follow-up
- Notes

Lead status:

- New
- Hot
- Contacted
- Consultation Scheduled
- Proposal Sent
- Negotiation
- Converted
- Lost
- Cold

Functional requirements:

Sales/admin can:

- Input new lead
- Update lead status
- Add follow-up notes
- Add next follow-up schedule
- Mark hot/deal/lost

Owner can:

- View new leads
- View hot leads
- View latest deals
- View weekly sales snapshot

---

## 10.7 Content Readiness Tracker

Data fields:

- Project
- Room / area
- Content potential
- Visual quality
- Content type
- Shooting status
- Editing status
- Posting status
- Notes
- Asset link optional

Content potential:

- Low
- Medium
- High
- Hero Content

Content type:

- Before-after
- Cinematic showcase
- Detail craftsmanship
- Talking head education
- Client story
- BTS installation
- Room tour
- Problem-solution

Content status:

- Not Ready
- Ready to Shoot
- Shot
- Editing
- Ready to Post
- Posted

Functional requirements:

Marketing can:

- Mark project as ready for content
- Define content type
- Update shooting/editing/posting status
- Add content idea notes
- Add asset link

Owner can:

- View ready content project
- View unpublished content
- View hero content candidates
- View AI content angle recommendation

---

## 11. User Roles & Permissions

### Owner

Can:

- View all data
- Edit important project data
- Read AI summary
- See company-wide dashboard
- View all modules

### PM

Can:

- View assigned projects
- Create daily updates
- Update project progress
- Update issue status
- Upload project progress images

### Designer

Can:

- View assigned projects
- Update design/render/revision/DED status
- Add design file links
- Add design blocker notes

### Purchasing

Can:

- View project material needs
- Add material issue
- Update material status
- Update vendor issue

### Sales/Admin

Can:

- Manage leads
- Update sales pipeline
- Add follow-up notes

### Marketing

Can:

- View project/content readiness
- Update content status
- Add content notes
- Add asset links

---

## 12. Suggested MVP Pages

1. Dashboard
2. Projects
3. Project Detail
4. Daily Updates
5. Design Tracker
6. Material Tracker
7. Leads
8. Content Tracker
9. AI Summary
10. Settings / Team Management

---

## 13. Key Metrics

MVP success can be measured by:

1. Owner membuka dashboard minimal 1x per hari.
2. PM melakukan update harian untuk project aktif.
3. Project urgent lebih cepat terdeteksi.
4. DED/design pending lebih mudah dipantau.
5. Material issue lebih cepat terlihat.
6. Lead baru tercatat lebih rapi.
7. Project siap konten lebih mudah ditemukan.
8. Jumlah pertanyaan manual owner ke tim berkurang.
9. Data operasional lebih tercatat dibanding sebelumnya.
10. AI summary digunakan sebagai bahan briefing pagi.

---

## 14. MVP Acceptance Criteria

MVP dianggap berhasil jika:

1. Owner bisa melihat semua project aktif dari satu dashboard.
2. Owner bisa melihat project urgent/warning/critical.
3. PM bisa update progress harian.
4. Designer bisa update status design/render/DED.
5. Purchasing bisa update material urgent.
6. Sales/admin bisa input leads.
7. Marketing bisa menandai project siap konten.
8. AI bisa membuat summary dari data yang tersedia.
9. AI bisa memberikan suggested next action.
10. Dashboard bisa digunakan untuk briefing pagi.
11. Sistem terasa berguna dalam 30 hari pertama.

---

## 15. Suggested Data Model

### Project

```ts
type Project = {
  id: string
  name: string
  clientName: string
  location?: string
  projectType?: string
  rooms?: string[]
  startDate?: string
  targetDate?: string
  pmId?: string
  designerId?: string
  stage: ProjectStage
  progress: number
  healthStatus: "on_track" | "warning" | "critical" | "completed" | "on_hold"
  notes?: string
  createdAt: string
  updatedAt: string
}
```

### DailyUpdate

```ts
type DailyUpdate = {
  id: string
  projectId: string
  updatedBy: string
  date: string
  progressToday: string
  workCompleted?: string
  issue?: string
  nextAction?: string
  needOwnerAttention: boolean
  status: "on_track" | "warning" | "critical"
  attachments?: string[]
  createdAt: string
}
```

### DesignStatus

```ts
type DesignStatus = {
  id: string
  projectId: string
  designerId?: string
  conceptStatus: Status
  renderStatus: Status
  revisionStatus: Status
  dedStatus: Status
  blockingIssue?: string
  fileLink?: string
  notes?: string
  updatedAt: string
}
```

### MaterialIssue

```ts
type MaterialIssue = {
  id: string
  projectId: string
  materialName: string
  category?: string
  vendor?: string
  status: "need_order" | "ordered" | "waiting_vendor" | "ready" | "delivered" | "delayed" | "issue"
  requiredDate?: string
  issue?: string
  pic?: string
  notes?: string
  updatedAt: string
}
```

### Lead

```ts
type Lead = {
  id: string
  name: string
  contact?: string
  source?: string
  location?: string
  projectType?: string
  estimatedBudget?: number
  status: "new" | "contacted" | "warm" | "hot" | "survey_scheduled" | "proposal_sent" | "deal" | "lost"
  assignedTo?: string
  lastFollowUp?: string
  nextFollowUp?: string
  notes?: string
  createdAt: string
  updatedAt: string
}
```

### ContentReadiness

```ts
type ContentReadiness = {
  id: string
  projectId: string
  room?: string
  contentPotential: "low" | "medium" | "high" | "hero"
  visualQuality?: string
  contentTypes: string[]
  status: "not_ready" | "ready_to_shoot" | "shot" | "editing" | "ready_to_post" | "posted"
  assetLink?: string
  notes?: string
  updatedAt: string
}
```

### AIInsight

```ts
type AIInsight = {
  id: string
  type: "daily_summary" | "project_risk" | "material_risk" | "design_bottleneck" | "content_opportunity" | "sales_highlight"
  title: string
  summary: string
  severity?: "low" | "medium" | "high" | "critical"
  relatedProjectId?: string
  suggestedAction?: string
  sourceData?: Record<string, unknown>
  modelUsed?: string
  createdAt: string
}
```

### MediaAsset

```ts
type MediaAsset = {
  id: string
  projectId?: string
  entityType: "project" | "daily_update" | "design" | "material" | "content"
  entityId?: string
  imagekitFileId?: string
  url: string
  fileType: "image" | "video" | "pdf" | "other"
  title?: string
  uploadedBy?: string
  createdAt: string
}
```

---

## 16. AI Workflow Requirements

### 16.1 Daily Owner Briefing Workflow

Trigger:

- Manual button on dashboard, or
- Scheduled daily generation later.

Steps:

1. Fetch active projects.
2. Fetch latest PM updates.
3. Fetch pending design/DED data.
4. Fetch urgent material issues.
5. Fetch new/hot leads.
6. Fetch content readiness data.
7. Generate AI summary.
8. Store summary in AIInsight.
9. Display on owner dashboard.

### 16.2 Project Risk Workflow

Trigger:

- When project updated.
- When PM update submitted.
- Manual dashboard refresh.

Steps:

1. Check last update date.
2. Check progress and health status.
3. Check material blockers.
4. Check design blockers.
5. Generate risk classification.
6. Store risk insight.
7. Display alert if medium/high/critical.

### 16.3 Content Opportunity Workflow

Trigger:

- Project marked completed.
- Content readiness updated.
- Manual marketing request.

Steps:

1. Read project data.
2. Read room/area data.
3. Read content potential status.
4. Read available media asset.
5. Generate content angle suggestion.
6. Store AI insight.
7. Display in content tracker.

---

## 17. Example Daily Owner Flow

Setiap pagi owner membuka dashboard.

Owner melihat:

1. Ada 9 project aktif.
2. 2 project warning.
3. 1 project critical.
4. 3 project belum diupdate PM hari ini.
5. 2 DED pending.
6. 1 material urgent.
7. 4 leads baru minggu ini.
8. 2 project siap dijadikan konten.
9. AI memberikan summary dan rekomendasi tindakan.

Owner kemudian bisa langsung follow-up:

- PM project critical
- Designer yang DED-nya pending
- Purchasing untuk material urgent
- Sales untuk hot lead
- Marketing untuk project ready content

---

## 18. Product Direction After MVP

Setelah MVP stabil, pengembangan berikutnya bisa masuk ke:

1. Finance tracker
2. Budget vs actual
3. Purchase order
4. Vendor database
5. Production tracker
6. Installation schedule
7. WhatsApp notification
8. Client approval system
9. AI project risk prediction
10. AI daily briefing automation
11. AI-generated weekly owner report
12. Marketing content calendar
13. CRM pipeline lebih detail
14. Client-facing project portal
15. Mobile app native

---

## 19. One-Liner Product Definition

Dekoria Agentic Interior ERP adalah dashboard operasional berbasis AI untuk membantu owner bisnis interior melihat project, progress, design, material, sales, dan content readiness dalam satu tempat yang rapi, cepat, dan actionable.

---

## 20. Final MVP Principle

Build the smallest useful command center first.

MVP v1 harus menjawab pertanyaan owner:

1. Project apa saja yang aktif?
2. Project mana yang bermasalah?
3. PM terakhir update apa?
4. Design/DED mana yang belum selesai?
5. Material apa yang pending?
6. Lead baru apa saja yang masuk?
7. Project mana yang siap dijadikan konten?
8. Apa rangkuman kondisi perusahaan hari ini?
9. Apa next action yang harus dilakukan?
