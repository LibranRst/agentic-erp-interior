Tolong rewrite / remake halaman Dashboard current project menjadi dashboard ERP Owner Overview yang secara struktur, layout, hierarchy, dan user experience mengikuti referensi gambar yang saya lampirkan.

PENTING:
Jangan copy plek-ketiplek desain referensi. Gunakan referensi hanya sebagai arahan layout, placement, density, hierarchy, dan feel dashboard modern-clean. Semua styling tetap harus mengikuti design system project yang sudah ada, terutama menggunakan shadcn/ui, Tailwind, existing tokens, existing components, dan style preset project ini.

Context project:
Ini adalah SaaS / internal ERP untuk perusahaan interior design & contractor, yaitu Dekoria Living. Dashboard ini adalah halaman utama untuk owner melihat kondisi perusahaan secara cepat. Fokus dashboard bukan finance detail, tapi ringkasan operasional: project aktif, progress PM, approval DED/design, material/stock urgent, sales/leads snapshot, project siap konten, dan AI summary.

Objective:
Redesign dashboard current project agar terlihat clean, premium, user friendly, data-dense tapi tetap ringan dibaca. UI harus terasa modern SaaS, cocok untuk owner dashboard, bukan terlalu dekoratif. Gunakan layout yang mirip referensi: sidebar kiri compact, topbar dengan breadcrumb + search + profile, metric cards di atas, tab navigation horizontal, lalu dashboard grid berisi AI brief, active project table, chart, approval cards, material alerts, leads snapshot, content-ready projects, dan next actions.

Scope utama:
Remake halaman dashboard saja.
Jangan tambahkan fitur baru yang tidak relevan.
Jangan mengubah business logic besar.
Jangan merusak routing atau struktur project existing.
Prioritaskan UI/UX, component structure, responsive behavior, dan dummy data yang rapi apabila belum ada data backend.
Tetap gunakan component shadcn/ui yang sudah tersedia di project.

Design direction:
Gunakan gaya modern premium dashboard.
Background utama soft off-white / neutral gray.
Cards menggunakan white surface, border subtle, rounded-xl / rounded-2xl, shadow sangat halus.
Hierarchy harus jelas: angka metric besar, label kecil, status badge jelas, CTA kecil.
Gunakan spacing lega tapi tetap data-dense.
Gunakan icon outline modern dari lucide-react.
Gunakan accent color sesuai brand / design system existing. Jika ada token primary, gunakan primary. Jangan hardcode warna berlebihan.
Hindari desain yang terlalu playful. Harus tetap professional, premium, dan operational.
Jangan membuat logo besar. Sidebar logo cukup kecil dan compact seperti referensi.
Typography clean, readable, dan konsisten dengan project.

Layout desktop yang diinginkan:

1. Sidebar kiri fixed / sticky dengan width compact.

* Area logo kecil di atas.
* Navigation icons vertical.
* Active state berupa card/pill background halus.
* Gunakan tooltip atau aria-label untuk icon nav jika sidebar icon-only.
* Menu yang relevan: Dashboard, Projects, Design & DED, Materials, Tasks, Sales/Leads, Content, Reports, Settings.
* Jangan buat sidebar terlalu lebar.

2. Topbar:

* Di area atas content.
* Kiri: breadcrumb “Dashboard / Owner Overview”.
* Tengah atau kanan: global search bar dengan placeholder seperti “Cari project, klien, material, atau dokumen...”.
* Kanan: notification icon, message/help icon opsional jika sudah ada, user avatar + name + role + dropdown chevron.
* Search bar tampil premium dan tidak terlalu besar.
* Gunakan Command shortcut visual kecil seperti “⌘ K” jika cocok.

3. Metric cards row:
   Buat 5 cards ringkasan utama dalam 1 row desktop:

* Active Projects
* Urgent Issues
* Design Approvals
* Material Alerts
* New Leads

Setiap card berisi:

* Icon dalam circular tinted background.
* Label kecil.
* Angka besar.
* Delta/change kecil seperti naik/turun dari kemarin.
* Status color sesuai konteks.
  Card harus ringkas dan konsisten.

Contoh data dummy:
Active Projects: 18, +2 dari kemarin.
Urgent Issues: 7, +3 dari kemarin.
Design Approvals: 12, 4 menunggu review.
Material Alerts: 9, 2 kritikal.
New Leads: 11, +5 dari kemarin.

4. Tab navigation horizontal:
   Letakkan di bawah metric cards.
   Gunakan tabs shadcn.
   Tab yang dibutuhkan:

* Overview
* Projects
* Design & DED
* Materials
* Sales & Leads
* Content

Tabs harus berbentuk clean nav bar dengan icon kecil dan active underline/pill yang subtle.
Untuk sekarang minimal tab Overview aktif. Tab lain boleh belum full functional, tapi struktur component harus siap dikembangkan.

5. Main dashboard grid:
   Gunakan grid 12 columns di desktop.

Row pertama:

* AI Brief card di kiri, sekitar 4 columns.
* Progress Project Aktif table di tengah, sekitar 5 columns.
* Health Project chart di kanan, sekitar 3 columns.

AI Brief card:
Isi dengan ringkasan prioritas hari ini.
Gunakan title “AI Brief”.
Subtext: “Ringkasan cerdas untuk membantu Anda fokus pada prioritas utama hari ini.”
Bullet insight:

* 3 project berisiko terlambat dari jadwal minggu ini.
* 12 approval DED menunggu review lebih dari 2 hari.
* 2 material kritikal mengalami keterlambatan pengiriman.
  Di bawahnya tambahkan quick action list kecil:
* Review approval DED yang tertunda
* Follow up pengiriman material tertunda
  Masing-masing action punya icon kecil, label, helper text, dan chevron kanan.
  Gunakan border-top separator subtle sebelum quick actions.

Progress Project Aktif:
Buat table compact dengan columns:

* Project
* Klien
* Ruang / Fungsi
* Progress
* Deadline
* Status
  Rows dummy:
  DL-2507 | Rumah A&A | Living Room | 72% | 30 Mei 2025 | On Track
  DL-2508 | Office BRI KCU | Workspace | 55% | 28 Mei 2025 | At Risk
  DL-2506 | Vita Uluwatu | Master Bedroom | 40% | 5 Jun 2025 | At Risk
  DL-2509 | Cafe Melania | Dining Area | 25% | 10 Jun 2025 | Delayed
  DL-2510 | Apartment T12 | Kitchen | 15% | 12 Jun 2025 | Delayed
  Progress ditampilkan pakai progress bar mini.
  Status pakai Badge shadcn dengan warna semantic.
  Ada link kecil “Lihat semua” di kanan atas card dan “Lihat semua project” di bawah.

Health Project chart:
Gunakan Recharts jika sudah ada di project. Kalau belum, install/use sesuai existing dependency. Jangan pakai chart library lain tanpa alasan.
Chart line untuk 3 status:

* On Track
* At Risk
* Delayed
  Sumbu x: 13 Mei sampai 19 Mei.
  Gunakan legend compact.
  Ada select/dropdown kecil “Mingguan”.
  Chart harus clean, gridline subtle, tidak ramai.

Row kedua:
Buat 4 card kecil sejajar desktop:

* Approval DED
* Material & Vendor Alert
* Leads & Sales Snapshot
* Project Siap Konten

Approval DED:
List 2 item pending:
DL-2507 – Rumah A&A, Living Room, Review Finishing dining & Ceiling, badge Review.
DL-2506 – Vita Uluwatu, Master Bedroom, HPL, Furniture Layout, badge Review.
Footer: Total Pending 12.

Material & Vendor Alert:
List 2 alert:
Marmer Calacatta Gold, Vendor: CV. Batu Alam, Terlambat 3 Hari, badge Kritikal.
Back Panel HPL Taco, Vendor: PT. Decovinindo, Terlambat 2 Hari, badge Tinggi.
Footer: Total Alert 9.

Leads & Sales Snapshot:
Tampilkan:
Total Leads (MoM): 11, +5 dari kemarin.
Hot Leads: 4.
Proposal Terkirim: 3.
Deal Potensial: 2.
Deal Won (Mo): 1.
Buat card ini clean seperti KPI snapshot.

Project Siap Konten:
List 2 item:
DL-2507 – Rumah A&A, Living Room, badge Siap Foto.
DL-2503 – Office Fintech, Pantry Area, badge Siap Video.
Jika ada image thumbnail component existing, gunakan thumbnail kecil. Kalau belum ada asset, gunakan placeholder gradient / neutral block yang clean.
Footer: Total Siap Konten 4.

Row ketiga:
Next Actions full width.
Buat horizontal task strip / card list seperti referensi.
Isi beberapa action:

* Review 7 approval DED yang tertunda, deadline hari ini, prioritas tinggi.
* Follow up 2 pengiriman material, Marmer Calacatta, Back Panel HPL, prioritas tinggi.
* Meeting progress DL-2508 Office BRI, bahas percepatan pekerjaan on site, prioritas menengah.
* Siapkan proposal untuk 2 leads, batas kirim 23 Mei 2025, prioritas menengah.
  Setiap action punya checkbox, icon tinted, title, helper text, dan priority badge.
  Ada link “Lihat semua tugas” di kanan atas.

Responsive behavior:
Desktop:

* Sidebar icon-only fixed.
* Content full width.
* Metric cards 5 columns.
* Main grid 12 columns.

Tablet:

* Metric cards jadi 2-3 columns.
* Chart turun ke row berikutnya jika sempit.
* Table tetap scroll horizontal jika perlu.

Mobile:

* Sidebar boleh jadi bottom nav atau collapsed drawer sesuai pattern existing project.
* Metric cards jadi 1-2 columns.
* Table wajib horizontal scroll.
* Cards stacked.
* Topbar search bisa lebih compact.

Implementation requirements:
Gunakan TypeScript.
Gunakan React components yang modular.
Pisahkan data dummy ke constant array agar gampang diganti backend nanti.
Jangan hardcode component berulang terlalu banyak.
Buat reusable components jika perlu:

* MetricCard
* DashboardCard
* StatusBadge
* ProjectProgressTable
* AiBriefCard
* HealthChart
* AlertListCard
* NextActionsCard
* SidebarNav
* DashboardTabs

Gunakan shadcn/ui components:

* Card
* Button
* Badge
* Tabs
* Avatar
* DropdownMenu
* Input
* Progress
* Checkbox
* Table
* Select
* Separator
* Tooltip jika dibutuhkan

Gunakan lucide-react icons:
LayoutDashboard, BriefcaseBusiness, FileText, PencilRuler, Package, Users, Folder, BarChart3, Settings, Bell, MessageCircle, Search, CheckCircle2, AlertCircle, Box, UserPlus, CalendarCheck, Truck, ChevronRight, Grid2X2, ClipboardList.

Code quality:
Pastikan tidak ada TypeScript error.
Pastikan import path sesuai struktur project.
Gunakan existing alias seperti @/components/ui/... jika project menggunakan alias tersebut.
Pastikan component client/server sesuai kebutuhan. Jika chart menggunakan Recharts, component chart harus client component dengan “use client”.
Jangan ubah file global yang tidak perlu.
Jangan introduce dependency baru kecuali benar-benar diperlukan.
Kalau dependency chart belum ada dan project tidak punya chart component, gunakan Recharts jika sudah tersedia. Kalau belum tersedia, buat fallback chart sederhana dengan CSS/SVG agar tidak memaksa dependency baru.

Visual details:

* Cards rounded 2xl.
* Border #e5e7eb atau token border.
* Shadow very subtle.
* Padding card sekitar p-5.
* Gap antar section sekitar gap-4 atau gap-5.
* Font size:

  * Page breadcrumb/title: text-lg / text-xl semibold.
  * Metric number: text-3xl font-semibold.
  * Card title: text-sm atau text-base semibold.
  * Helper text: text-xs / text-sm muted.
* Gunakan muted foreground untuk secondary text.
* Badge jangan terlalu mencolok, gunakan soft background.
* Progress bar kecil dan clean.
* Hindari gradient berlebihan. Tinted icon background boleh.

UX improvements:

* Owner harus bisa scan kondisi perusahaan dalam 5 detik.
* Urgent issue harus terlihat paling cepat.
* Jangan semua card terlihat sama kuat; gunakan hierarchy.
* Angka dan status harus dominan.
* AI Brief harus terasa seperti assistant operational, bukan sekadar text box.
* Next Actions harus terasa actionable.
* Jangan terlalu banyak teks panjang.

Acceptance criteria:

1. Dashboard visually mengikuti layout referensi secara struktur:
   sidebar compact, topbar, metric cards, tabs, dashboard grid, AI brief, table, chart, bottom actions.
2. Tetap menggunakan design system existing shadcn/Tailwind project.
3. Tidak copy persis warna, icon treatment, typography, atau spacing dari referensi.
4. Semua elemen dashboard relevan dengan ERP interior Dekoria.
5. Responsive desktop/tablet/mobile aman.
6. Tidak ada TypeScript/lint error.
7. Data dummy rapi dan mudah diganti.
8. Component modular dan maintainable.
9. Tidak menambahkan fitur baru di luar dashboard owner overview.
10. Tampilan akhir harus clean, premium, dan siap dijadikan baseline UI project.

Silakan inspect current dashboard implementation terlebih dahulu, lalu lakukan redesign dengan pendekatan incremental:

* Pahami struktur routing dan file dashboard saat ini.
* Identifikasi component UI yang sudah tersedia.
* Buat atau update dashboard component.
* Refactor dummy data ke constants.
* Pastikan layout responsive.
* Jalankan typecheck/lint/build jika tersedia.
* Perbaiki error sampai clean.

Output yang saya harapkan:
Remake dashboard current project menjadi Owner Overview dashboard yang clean, premium, user-friendly, dan replicable langsung di website, dengan struktur visual mendekati referensi tetapi tetap original dan sesuai design system project.
