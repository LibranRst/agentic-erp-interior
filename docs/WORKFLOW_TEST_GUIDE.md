# ERP Workflow Test Guide

Panduan end-to-end testing untuk seluruh workflow ERP dari awal project sampai closing. Gunakan fitur **Login As** (halaman `/users`) untuk berpindah role tanpa logout.

---

## Test Accounts

Semua akun menggunakan password: `password123`

| Email | Role | Nama |
|---|---|---|
| owner@dekoria.local | owner | Dekoria Owner |
| admin@dekoria.local | admin | Admin Dekoria |
| pm@dekoria.local | project_manager | Project Manager |
| designer@dekoria.local | designer | Interior Designer |
| purchasing@dekoria.local | purchasing | Purchasing Team |
| sales@dekoria.local | sales | Sales Consultant |
| marketing@dekoria.local | marketing | Content Strategist |

Seed command (jika perlu reset): `bun run db:seed-accounts`

---

## Cara Impersonation (Login As)

1. Login sebagai **owner@dekoria.local**
2. Buka `/users`
3. Di kolom Actions setiap user, klik ikon **User Switch** (Login As)
4. Banner kuning muncul: "Logged in as [Nama] ([Role])"
5. Semua akses dan permission sekarang = role tersebut
6. Untuk kembali ke owner: klik **Exit impersonation** di banner

---

## Test Flow: Dari Scratch Sampai Project Closing

### Flow 1 — Setup: Invite User (Owner/Admin)

**Role:** Owner
**Halaman:** `/users`

1. Di kolom kiri, isi form "Invite New Member"
2. Input nama, email, pilih role
3. Klik **Create Invite**
4. Invite muncul di tabel "Recent Invites"
5. User baru bisa daftar via setup link (production) atau langsung di-seed (development)

---

### Flow 2 — Input Lead Baru (Sales / Owner / Admin)

**Role:** Sales
**Halaman:** `/sales`

1. Klik **Add Lead** (atau "New Lead")
2. Isi form:
   - **Name:** "Bapak Andi"
   - **Contact:** "081234567890"
   - **Source:** referral
   - **Location:** "Jakarta Selatan"
   - **Project Type:** residential
   - **Estimated Budget:** 500000000
   - **Status:** hot
   - **Assigned To:** (Sales Consultant)
3. Klik **Create Lead**
4. Lead muncul di tabel leads

**Role yang bisa:** owner, admin, sales
**Permission:** `lead:create`

---

### Flow 3 — Update Lead Status (Sales / Owner / Admin)

**Role:** Sales
**Halaman:** `/sales`

1. Klik lead yang baru dibuat
2. Update status: `hot` → `contacted` → `consultation_scheduled` → `proposal_sent` → `negotiation`
3. Tambah follow-up notes
4. Simpan

**Permission:** `lead:update`

---

### Flow 4 — Convert Lead ke Project (Owner / Admin)

**Role:** Owner (kembali ke owner dengan Exit Impersonation)
**Halaman:** `/sales`

1. Cari lead yang sudah `negotiation` atau `hot`
2. Di halaman detail lead, klik **Convert to Project**
3. Form muncul — isi:
   - **Project Name:** "Residence Bapak Andi"
   - **PM:** (pilih Project Manager)
   - **Designer:** (pilih Interior Designer)
   - **Stage:** leave default (consultation)
   - **Target Date:** pilih tanggal 3 bulan ke depan
4. Klik **Convert**
5. Lead status berubah jadi `converted`, project baru dibuat
6. Redirect ke halaman project detail

**HANYA owner & admin yang bisa convert** (ada di action: `requireRole(currentUser, ["owner", "admin"])`)
**Permission:** `lead:convert`

---

### Flow 5 — Manage Project Detail (Owner / Admin / PM)

**Role:** PM (Login As PM)
**Halaman:** `/projects`

1. Buka project "Residence Bapak Andi"
2. **Update stage:** consultation → survey → design_concept → design_revision → ded → production → installation → finishing → handover → completed
3. **Update health status:** healthy / needs_attention / urgent / blocked / delayed
4. **Update progress %:** geser slider atau input angka
5. Tambah notes jika ada
6. Simpan

**Edit project detail:** owner, admin (`project:update`) — full edit
**Update progress/health:** owner, admin, project_manager (`project:update`)

---

### Flow 6 — Daily PM Update (PM / Owner / Admin)

**Role:** PM
**Halaman:** `/daily-updates` atau project detail → Updates tab

1. Klik **New Update**
2. Pilih project: "Residence Bapak Andi"
3. Isi:
   - **Progress Today:** "Survey lokasi selesai, ukuran sudah diukur"
   - **Work Completed:** "Pengukuran semua ruangan"
   - **Issue/Blocker:** (kosong atau "Akses lift sempit untuk material besar")
   - **Next Action:** "Mulai design concept"
   - **Need Owner Attention:** toggle jika urgent
   - **Status Health:** on_track / warning / critical
4. Upload foto progress (opsional) via ImageKit uploader
5. Klik **Submit**

**Role yang bisa:** owner, admin, project_manager
**Permission:** `daily_update:create`

---

### Flow 7 — Design / DED Tracker (Designer / Owner / Admin)

**Role:** Designer (Login As Designer)
**Halaman:** `/design`

1. Klik **New Design Task**
2. Pilih project: "Residence Bapak Andi"
3. Isi:
   - **Design Type:** concept / render / revision / ded / layout / moodboard / material_spec
   - **Status:** not_started / concept_progress / render_progress / revision / waiting_approval / approved / ded_progress / ded_done
   - **Notes:** "Konsep minimalis modern dengan aksen kayu"
4. Upload render/DED file (opsional)
5. Klik **Create**

**Update design task:**
1. Buka task yang sudah dibuat
2. Update status (concept → render → revision → approval → DED)
3. Tambah catatan revisi jika ada
4. Tandai blocker jika ada

**Role yang bisa:** owner, admin, designer
**Permission:** `design_task:create`, `design_task:update`

---

### Flow 8 — Vendor Management (Purchasing / Owner / Admin)

**Role:** Purchasing (Login As Purchasing)
**Halaman:** `/vendors`

1. Klik **Add Vendor**
2. Isi:
   - **Name:** "Toko Kayu Jati Mas"
   - **Contact:** "081300000001"
   - **Category:** material_supplier
   - **Notes:** opsional
3. Simpan

**Role yang bisa:** owner, admin, purchasing
**Permission:** `vendor:create`, `vendor:update`

---

### Flow 9 — Material Tracker (Purchasing / Owner / Admin)

**Role:** Purchasing
**Halaman:** `/materials`

1. Klik **Add Material**
2. Pilih project: "Residence Bapak Andi"
3. Isi:
   - **Material Name:** "Kayu jati solid 4x6"
   - **Category:** kayu / finishing / hardware / etc
   - **Vendor:** "Toko Kayu Jati Mas"
   - **Status:** planned / requested / ordered / in_production / in_delivery / arrived / installed / delayed / problem / cancelled
   - **Required Date:** 2 minggu dari sekarang
   - **Quantity:** opsional
   - **PIC:** (Purchasing Team)
   - **Issue:** kosong jika tidak ada
4. Simpan

**Update material status:** planned → requested → ordered → in_production → in_delivery → arrived → installed

**Tandai delayed/problem:**
- Jika vendor telat → status `delayed`, isi issue
- Status `delayed` akan muncul di dashboard sebagai material warning

**Role yang bisa:** owner, admin, purchasing
**Permission:** `material:create`, `material:update`

---

### Flow 10 — Content Readiness (Marketing / Owner / Admin)

**Role:** Marketing (Login As Marketing)
**Halaman:** `/content`

1. Klik **Add Content Asset**
2. Pilih project yang sudah mendekati finishing/completed
3. Isi:
   - **Content Status:** not_ready / ready_to_shoot / footage_available / editing / ready_to_publish / published / archived
   - **Content Opportunity:** before_after / cinematic_showcase / detail_craftsmanship / room_tour / bts_installation / client_story / problem_solution / talking_head
   - **Notes:** "Master bedroom dengan wall panel detail — cocok untuk cinematic showcase"
4. Simpan

**Update content status:**
1. Buka content asset
2. Update status: ready_to_shoot → footage_available → editing → ready_to_publish → published
3. Tambah notes untuk tim marketing

**Role yang bisa:** owner, admin, marketing
**Permission:** `content_asset:create`, `content_asset:update`

---

### Flow 12 — AI Morning Summary (Owner / Admin)

**Role:** Owner
**Halaman:** `/ai-summary` atau `/dashboard`

1. Di dashboard, klik **Generate Morning Summary**
2. Tunggu beberapa detik — Mastra workflow berjalan:
   - Fetch active projects
   - Fetch latest PM updates
   - Fetch pending design/DED
   - Fetch urgent materials
   - Fetch new leads
   - Fetch content readiness
   - Gemini 3 Flash analisis semua data
   - Hasil disimpan ke `ai_summaries`
3. Summary muncul di dashboard dengan:
   - Ringkasan kondisi hari ini
   - Project yang perlu perhatian
   - Material/DED bottleneck
   - Lead highlight
   - Content opportunity
   - Suggested next actions

**HANYA owner & admin** yang bisa generate & view
**Permission:** `ai_summary:generate`, `ai_summary:view`

---

### Flow 13 — Archive & Cleanup (Owner / Admin)

Setelah project selesai, archive data yang sudah tidak aktif.

1. Project completed → klik **Archive** di project detail
2. Lead lost/cold → archive dari halaman leads
3. Design task selesai → archive
4. Material installed/cancelled → archive
5. Content published → archive

Semua module di `/archived` bisa di-restore atau di-delete permanen.

**Permission archive/restore/delete:** owner, admin only (`project:archive`, dll)

---

### Flow 14 — User Role & Avatar (Owner / Admin)

**Role:** Owner
**Halaman:** `/users`

1. **Ganti role user:** klik dropdown Role → pilih role baru → otomatis tersimpan
2. **Toggle status user:** klik badge Status → active/inactive toggle
3. **Ganti avatar:** hover avatar di kolom Name → klik → pilih file gambar → auto upload ke ImageKit → avatar langsung ganti
4. **Revoke invite:** klik tombol revoke di tabel Recent Invites (hanya yang status pending)

---

## End-to-End Test Script (Daily Walkthrough)

Jalankan skrip ini untuk test penuh dalam 10-15 menit:

```
1. Login sebagai owner@dekoria.local
2. Buka /users → invite user baru (jika belum ada semua role)
3. Login As → Sales Consultant
4. /sales → Create 3 leads (1 hot, 1 new, 1 consultation)
5. Update lead status: new → contacted, hot → proposal_sent
6. Exit Impersonation → kembali ke owner
7. /sales → Convert lead "hot" ke project
8. Isi form project, assign PM & Designer
9. Login As → Project Manager
10. /projects → buka project baru → update stage ke "survey", progress 20%
11. /daily-updates → buat daily update untuk project tersebut
12. Upload foto progress (opsional)
13. Login As → Interior Designer
14. /design → buat design task baru untuk project
15. Upload render/concept image
16. Login As → Purchasing Team
17. /vendors → tambah 2 vendor
18. /materials → tambah material untuk project, link ke vendor
19. Update material status: planned → ordered
20. Login As → Content Strategist
21. /content → tambah content asset (project belum completed, tapi tandai "ready_to_shoot")
22. Exit Impersonation → kembali ke owner
23. /dashboard → lihat semua data di dashboard
24. /ai-summary → Generate Morning Summary
25. Baca summary — pastikan mention project, lead, material, content
```

---

## Permission Matrix (Actual — dari code)

| Permission | Owner | Admin | PM | Designer | Purchasing | Sales | Marketing |
|---|---|---|---|---|---|---|---|
| dashboard:view | yes | yes | yes | yes | yes | yes | yes |
| project:view | yes | yes | yes | yes | yes | yes | yes |
| project:create | yes | yes | - | - | - | - | - |
| project:update | yes | yes | yes | - | - | - | - |
| project:archive | yes | yes | - | - | - | - | - |
| daily_update:view | yes | yes | yes | - | - | - | - |
| daily_update:create | yes | yes | yes | - | - | - | - |
| daily_update:update | yes | yes | yes | - | - | - | - |
| design_task:view | yes | yes | - | yes | - | - | - |
| design_task:create | yes | yes | - | yes | - | - | - |
| design_task:update | yes | yes | - | yes | - | - | - |
| material:view | yes | yes | - | - | yes | - | - |
| material:create | yes | yes | - | - | yes | - | - |
| material:update | yes | yes | - | - | yes | - | - |
| vendor:view | yes | yes | - | - | yes | - | - |
| vendor:create | yes | yes | - | - | yes | - | - |
| vendor:update | yes | yes | - | - | yes | - | - |
| lead:view | yes | yes | - | - | - | yes | - |
| lead:create | yes | yes | - | - | - | yes | - |
| lead:update | yes | yes | - | - | - | yes | - |
| lead:convert | yes | yes | - | - | - | - | - |
| content_asset:view | yes | yes | - | - | - | - | yes |
| content_asset:create | yes | yes | - | - | - | - | yes |
| content_asset:update | yes | yes | - | - | - | - | yes |
| ai_summary:view | yes | yes | yes | yes | yes | yes | yes |
| ai_summary:generate | yes | yes | - | - | - | - | - |
| user:view/create/update | yes | yes | - | - | - | - | - |
| user:avatar:update | yes | yes | yes | yes | yes | yes | yes |

---

## Enum Values (Actual — dari schema)

**Project Health:** healthy, needs_attention, urgent, blocked, delayed

**Stage Status:** not_started, in_progress, blocked, completed

**Design Type:** layout, concept, render, revision, ded, moodboard, material_spec

**Design Status:** not_started, concept_progress, render_progress, revision, waiting_approval, approved, ded_progress, ded_done

**Material Status:** planned, requested, ordered, in_production, in_delivery, arrived, installed, delayed, problem, cancelled

**Lead Status:** new, hot, contacted, consultation_scheduled, proposal_sent, negotiation, converted, lost, cold

**Content Status:** not_ready, ready_to_shoot, footage_available, editing, ready_to_publish, published, archived

**Content Opportunity:** before_after, cinematic_showcase, detail_craftsmanship, room_tour, bts_installation, client_story, problem_solution, talking_head
