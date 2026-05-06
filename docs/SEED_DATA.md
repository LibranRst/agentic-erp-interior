# SEED_DATA.md
# SaaS Agentic Interior ERP

This document defines realistic seed data for local development and MVP testing.

---

## 1. Purpose

Seed data helps developers and AI agents test:

```txt
- dashboard cards
- tables
- filters
- status badges
- AI summaries
- role-based access
- project detail pages
```

Seed data should represent a realistic interior design and contractor workflow.

---

## 2. Seed Script Location

Recommended file:

```txt
src/db/seed.ts
```

Recommended command:

```bash
bun run db:seed
```

Package script:

```json
{
  "scripts": {
    "db:seed": "bun src/db/seed.ts"
  }
}
```

---

## 3. Seed Data Scope

The MVP seed should include:

```txt
- roles
- users
- projects
- project stages
- daily updates
- design tasks
- vendors
- materials
- leads
- content assets
- ai summaries
- ai runs
- media assets
- notifications
```

---

## 4. Roles Seed

```txt
owner
admin
project_manager
designer
purchasing
sales
marketing
```

---

## 5. Users Seed

```txt
1. Owner User
   name: Dekoria Owner
   email: owner@dekoria.local
   role: owner

2. Admin User
   name: Admin Dekoria
   email: admin@dekoria.local
   role: admin

3. PM User
   name: Project Manager
   email: pm@dekoria.local
   role: project_manager

4. Designer User
   name: Interior Designer
   email: designer@dekoria.local
   role: designer

5. Purchasing User
   name: Purchasing Team
   email: purchasing@dekoria.local
   role: purchasing

6. Sales User
   name: Sales Consultant
   email: sales@dekoria.local
   role: sales

7. Marketing User
   name: Content Strategist
   email: marketing@dekoria.local
   role: marketing
```

---

## 6. Projects Seed

### Project 1

```txt
project_name: Sentul Modern Luxury Residence
client_name: Mr. S
location: Sentul, Bogor
status: installation
health_status: needs_attention
priority: high
progress_percentage: 72
content_ready_status: footage_available
```

### Project 2

```txt
project_name: JGC Smart Luxury Home
client_name: Mr. I
location: Jakarta Garden City
status: finishing
health_status: healthy
priority: medium
progress_percentage: 88
content_ready_status: ready_to_publish
```

### Project 3

```txt
project_name: Emerald Japandi Kitchen
client_name: Mr. D
location: Bogor
status: production
health_status: urgent
priority: high
progress_percentage: 54
content_ready_status: ready_to_shoot
```

### Project 4

```txt
project_name: Classic Elegant Master Suite
client_name: Mrs. L
location: South Jakarta
status: design_revision
health_status: needs_attention
priority: medium
progress_percentage: 35
content_ready_status: not_ready
```

### Project 5

```txt
project_name: Wabi Sabi Compact Kitchen
client_name: Mr. G
location: Depok
status: ded_progress
health_status: blocked
priority: high
progress_percentage: 42
content_ready_status: not_ready
```

### Project 6

```txt
project_name: Premium Dental Clinic Interior
client_name: Klinik A
location: Bogor
status: concept_design
health_status: healthy
priority: medium
progress_percentage: 20
content_ready_status: not_ready
```

---

## 7. Daily Updates Seed

```txt
Project: Sentul Modern Luxury Residence
Progress Summary: Installation cabinet area master bedroom sudah berjalan.
Work Completed: Wardrobe frame installed, panel alignment checked.
Issue Notes: Beberapa hardware soft-close belum lengkap.
Blocker Notes: Menunggu tambahan hardware dari vendor.
Next Action: Follow up vendor dan lanjut install panel samping.
Health Status: needs_attention
Progress Percentage: 72
```

```txt
Project: Emerald Japandi Kitchen
Progress Summary: Produksi cabinet kitchen masih berjalan.
Work Completed: Cutting panel dan finishing beberapa modul bawah.
Issue Notes: Material emerald laminate datang terlambat.
Blocker Notes: Vendor belum confirm ETA final.
Next Action: Purchasing follow up vendor hari ini.
Health Status: urgent
Progress Percentage: 54
```

```txt
Project: JGC Smart Luxury Home
Progress Summary: Final styling dan pengecekan detail.
Work Completed: LED checked, cabinet cleaned, furniture positioned.
Issue Notes: Minor touch up di area pantry.
Blocker Notes: None.
Next Action: Final walkthrough preparation.
Health Status: healthy
Progress Percentage: 88
```

---

## 8. Design Tasks Seed

```txt
Project: Classic Elegant Master Suite
Task Name: Master Bedroom Render Revision
Design Type: render
Status: revision
Approval Status: revision_needed
Revision Count: 2
Notes: Client wants softer wall panel detail and warmer lighting.
```

```txt
Project: Wabi Sabi Compact Kitchen
Task Name: Kitchen DED Package
Design Type: ded
Status: blocked
Approval Status: waiting_approval
Revision Count: 1
Notes: Waiting for final appliance dimensions.
```

```txt
Project: Premium Dental Clinic Interior
Task Name: Reception Area Concept
Design Type: concept
Status: concept_progress
Approval Status: not_submitted
Revision Count: 0
Notes: Need premium but calming healthcare atmosphere.
```

---

## 9. Vendors Seed

```txt
Vendor: Premium Panel Supplier
Category: board_material
Contact Person: Budi
Phone: 081200000001

Vendor: LED & Lighting Partner
Category: lighting
Contact Person: Rina
Phone: 081200000002

Vendor: Hardware Soft-Close Supplier
Category: hardware
Contact Person: Andi
Phone: 081200000003

Vendor: Marble & Stone Vendor
Category: stone
Contact Person: Dimas
Phone: 081200000004
```

---

## 10. Materials Seed

```txt
Project: Emerald Japandi Kitchen
Material Name: Emerald Green Laminate
Category: laminate
Status: delayed
Urgency Level: critical
ETA Date: tomorrow
Issue Notes: Vendor has not confirmed final delivery schedule.
```

```txt
Project: Sentul Modern Luxury Residence
Material Name: Soft-Close Hinge Set
Category: hardware
Status: problem
Urgency Level: high
ETA Date: this week
Issue Notes: Quantity received is incomplete.
```

```txt
Project: JGC Smart Luxury Home
Material Name: Warm LED Strip 3000K
Category: lighting
Status: arrived
Urgency Level: low
ETA Date: already arrived
Issue Notes: Ready for final installation.
```

---

## 11. Leads Seed

```txt
Lead Name: Mrs. Nadia
Source: Instagram Ads
Interest: Modern luxury kitchen and living room
Estimated Project Value: 250000000
Status: consultation_scheduled
Next Follow Up: tomorrow
```

```txt
Lead Name: Mr. Raymond
Source: Referral
Interest: Full home interior
Estimated Project Value: 450000000
Status: proposal_sent
Next Follow Up: this week
```

```txt
Lead Name: Mrs. Amira
Source: Instagram Organic
Interest: Master bedroom renovation
Estimated Project Value: 120000000
Status: new
Next Follow Up: today
```

---

## 12. Content Assets Seed

```txt
Project: JGC Smart Luxury Home
Room Area: Pantry
Visual Status: final_visual_available
Footage Status: footage_available
Content Opportunity: luxury_feature
Suggested Angle: Pocket door pantry system yang bikin ruangan clean dan hidden.
Content Status: ready_to_publish
```

```txt
Project: Sentul Modern Luxury Residence
Room Area: Master Bedroom
Visual Status: progress_visual_available
Footage Status: footage_available
Content Opportunity: detail_craftsmanship
Suggested Angle: Detail wardrobe dan lighting yang bikin bedroom terasa expensive.
Content Status: editing
```

```txt
Project: Emerald Japandi Kitchen
Room Area: Kitchen
Visual Status: render_available
Footage Status: needs_shooting
Content Opportunity: before_after
Suggested Angle: Emerald kitchen yang bikin rumah terlihat bold tapi tetap elegant.
Content Status: ready_to_shoot
```

---

## 13. AI Summaries Seed

```txt
Summary Type: morning_summary
Content:
Hari ini ada 6 project aktif. Project Emerald Japandi Kitchen perlu perhatian utama karena material emerald laminate terlambat dan berpotensi menghambat produksi. Project Sentul juga perlu follow-up hardware soft-close. Dari sisi konten, JGC Smart Luxury Home dan Sentul memiliki footage yang siap diproses menjadi Reels.
```

---

## 14. AI Runs Seed

```txt
Agent Name: OwnerOpsAgent
Workflow Name: generateMorningSummary
Model Provider: google
Model Name: gemini-3-flash
Reasoning Level: high
Status: success
```

Fallback example:

```txt
Agent Name: OwnerOpsAgent
Workflow Name: generateMorningSummary
Model Provider: google
Model Name: gemini-3-flash
Reasoning Level: low
Status: success
```

---

## 15. Media Assets Seed

Use placeholder ImageKit URLs.

```txt
Related Type: daily_update
File Type: image
Folder Path: dekoria-erp/projects/sentul-modern-luxury/daily-updates
ImageKit URL: https://ik.imagekit.io/example/project-progress.jpg
```

```txt
Related Type: content_asset
File Type: video_thumbnail
Folder Path: dekoria-erp/projects/jgc-smart-luxury/content
ImageKit URL: https://ik.imagekit.io/example/pantry-thumbnail.jpg
```

---

## 16. Notifications Seed

```txt
User: Owner
Title: Material Issue Detected
Message: Emerald Green Laminate for Emerald Japandi Kitchen is delayed and marked critical.
Type: material_issue
Is Read: false
```

```txt
User: Owner
Title: Content Ready
Message: JGC Smart Luxury Home has footage available and is ready to publish.
Type: content_ready
Is Read: false
```

---

## 17. Seed Data Rules

```txt
- Seed data must be realistic enough for dashboard testing.
- Avoid random placeholder names like Test Project 1.
- Use deterministic IDs or slugs if needed.
- Seed script should be idempotent where possible.
- Running seed multiple times should not create duplicate roles.
```

---

## 18. Done Criteria

Seed data is complete when:

```txt
- Dashboard cards show non-zero values.
- Project list has mixed statuses and health states.
- Daily updates appear in project detail.
- Design tracker has pending and blocked tasks.
- Material tracker has delayed/critical items.
- Sales page has multiple lead statuses.
- Content page has ready/editing/published statuses.
- AI summary can generate from realistic data.
```
