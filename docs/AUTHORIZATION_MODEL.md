# Authorization Model — Dekoria ERP

Dokumentasi lengkap sistem otorisasi 3-lapis: Page Gate, Permission+Role, dan Assignment Check.

---

## 1. Lapis Pertahanan

### Layer 1 — Page Gate (`requirePageRole` / `requirePageUser`)

Redirect user yang tidak punya role sebelum halaman render. File: `src/lib/auth/permissions.ts`.

| Halaman | Gate | Role yang bisa |
|---|---|---|
| `/dashboard` | `requirePageUser()` | Semua authenticated |
| `/projects`, `/projects/[id]` | `requirePageUser()` | Semua authenticated |
| `/projects/new` | `requirePageRole(["owner","admin"])` | owner, admin |
| `/daily-updates` | `requirePageUser()` | Semua authenticated |
| `/design` | `requirePageRole(["owner","admin","designer"])` | owner, admin, designer |
| `/materials` | `requirePageRole(["owner","admin","purchasing"])` | owner, admin, purchasing |
| `/vendors` | `requirePageRole(["owner","admin","purchasing"])` | owner, admin, purchasing |
| `/sales` | `requirePageRole(["owner","admin","sales"])` | owner, admin, sales |
| `/content` | `requirePageRole(["owner","admin","marketing"])` | owner, admin, marketing |
| `/ai-summary` | `requirePageRole(["owner","admin"])` | owner, admin |
| `/users` | `requirePageRole(["owner","admin"])` | owner, admin |
| `/settings` | `requirePageRole(["owner","admin"])` | owner, admin |
| `/archived` | `requirePageRole(["owner","admin"])` | owner, admin |
| `/media` | `requirePageUser()` | Semua authenticated |

### Layer 2 — Permission + Role (`requirePermission` + `requireRole`)

Setiap server action cek **keduanya** secara berurutan. Harus lolos permission check DAN role check.

Contoh dari `src/server/actions/daily-updates.ts:72-73`:
```ts
requirePermission(currentUser, "daily_update:create");
requireRole(currentUser, ["owner", "admin", "project_manager"]);
```

Keduanya throw `ForbiddenError` jika gagal.

### Layer 3 — Assignment Check

Setelah lolos layer 1 & 2, server action menambah cek assignment: user hanya bisa mutate record yang dia "punya" berdasarkan field `pmId`, `designerId`, `assignedSalesId`, atau `assignedTo`.

Owner dan admin **tidak pernah kena** assignment check — semua conditional `if (role === "project_manager")` di-skip.

---

## 2. Permission Matrix Lengkap

File: `src/lib/auth/permissions.ts:50-102`.

| Permission | owner | admin | pm | designer | purchasing | sales | marketing |
|---|---|---|---|---|---|---|---|
| `dashboard:view` | x | x | x | x | x | x | x |
| `project:view` | x | x | x | x | x | x | x |
| `project:create` | x | x | | | | | |
| `project:update` | x | x | x | | | | |
| `project:archive` | x | x | | | | | |
| `daily_update:view` | x | x | x | | | | |
| `daily_update:create` | x | x | x | | | | |
| `daily_update:update` | x | x | x | | | | |
| `design_task:view` | x | x | | x | | | |
| `design_task:create` | x | x | | x | | | |
| `design_task:update` | x | x | | x | | | |
| `material:view` | x | x | | | x | | |
| `material:create` | x | x | | | x | | |
| `material:update` | x | x | | | x | | |
| `vendor:view` | x | x | | | x | | |
| `vendor:create` | x | x | | | x | | |
| `vendor:update` | x | x | | | x | | |
| `lead:view` | x | x | | | | x | |
| `lead:create` | x | x | | | | x | |
| `lead:update` | x | x | | | | x | |
| `lead:convert` | x | x | | | | | |
| `content_asset:view` | x | x | | | | | x |
| `content_asset:create` | x | x | | | | | x |
| `content_asset:update` | x | x | | | | | x |
| `ai_summary:view` | x | x | x | x | x | x | x |
| `ai_summary:generate` | x | x | | | | | |
| `user:view` | x | x | | | | | |
| `user:create` | x | x | | | | | |
| `user:update` | x | x | | | | | |
| `user:avatar:update` | x | x | x | x | x | x | x |
| `settings:update` | x | x | | | | | |

**Hanya owner/admin:** `project:create`, `project:archive`, `lead:convert`, semua `user:*` kecuali avatar, `settings:update`, `ai_summary:generate`.

---

## 3. Assignment Rules Per Role

### Project Manager

| Action | Scope | File:Line |
|---|---|---|
| Lihat project list | Semua project | `projects/queries.ts` — no scope |
| Lihat project detail | Semua project | `getProjectByIdQuery` — no scope |
| Update status/health/progress | **Hanya project dengan `pmId === user.id`** | `projects.ts:245` |
| Create daily update | **Hanya assigned project** | `daily-updates.ts:111` — error: "PM users can only update assigned projects" |
| Update daily update | **Hanya assigned project** | `daily-updates.ts:201,224` |
| Lihat daily update list | **Hanya assigned project** | `daily-updates/queries.ts:238` — `projects.pm_id = currentUser.id` |
| Design/Material/Vendor/Sales/Content | Tidak bisa | Permission tidak ada |

**PM tidak assigned:**
- Bisa lihat project di list dan detail
- Tidak bisa update project (status/health/progress)
- Tidak bisa create daily update — error "PM users can only update assigned projects"
- Daily update list kosong (query discope)

### Designer

| Action | Scope | File:Line |
|---|---|---|
| Lihat design task list | **Hanya task dengan `designerId === user.id`** | `design.ts:41` — auto-inject filter |
| Create design task | **Hanya project dengan `designerId === user.id`** | `design.ts:291` |
| Update/change status task | **Hanya task dengan `designerId === user.id`** | `design.ts:145,333` |
| Lihat project | Semua project | `project:view` universal |

**Designer tidak assigned:**
- Bisa lihat project detail
- Halaman `/design` kosong — tidak ada task yang muncul
- Tidak bisa create/update design task

### Sales

| Action | Scope | File:Line |
|---|---|---|
| Lihat leads | **Hanya leads dengan `assignedSalesId === user.id`** | `leads/queries.ts:249` |
| Create lead | Auto-assign ke diri sendiri | `leads.ts:294` |
| Update lead | **Hanya leads dengan `assignedSalesId === user.id`** | `leads.ts:315` — error: "Lead was not found or is not assigned to you" |
| Convert lead | Tidak bisa | owner/admin only |

### Marketing

| Action | Scope | File:Line |
|---|---|---|
| Lihat content assets | Semua (tidak discope) | Tidak ada `buildRoleScope` |
| Create content asset | Auto-assign ke diri sendiri | `content.ts:275` |
| Update content asset | **Hanya asset dengan `assignedTo === user.id`** | `content.ts:335` |

### Purchasing

- **Tidak ada assignment check** — semua purchasing user bisa CRUD semua material dan vendor
- Archive/restore/delete tetap owner/admin only

---

## 4. Owner / Admin

- Tidak pernah kena assignment check
- Semua conditional `if (role === "project_manager")` atau `if (role === "designer")` di-skip
- Bisa update/edit apapun di project manapun, lepas dari assignment
- Fitur **Login As** (halaman `/users`) memungkinkan owner impersonate role lain untuk test workflow

---

## 5. Ringkasan

| Role | Bisa lihat | Bisa edit/mutate |
|---|---|---|
| Owner | Semuanya | Semuanya, tanpa batasan |
| Admin | Semuanya | Semuanya, tanpa batasan |
| PM | Semua project | Hanya project dengan `pmId === dia` |
| Designer | Semua project | Hanya design task dengan `designerId === dia` |
| Sales | Semua project | Hanya leads dengan `assignedSalesId === dia` |
| Marketing | Semua project | Hanya content asset yang dia buat sendiri |
| Purchasing | Semua project | Semua material & vendor (tanpa assignment) |

Patokan utama: **semua role bisa VIEW project manapun** (`project:view` universal), tapi **MUTATE hanya untuk record yang mereka "punya"** via assignment field (`pmId`, `designerId`, `assignedSalesId`, `assignedTo`).

---

## 6. Known Gap

Halaman `/daily-updates` tidak punya `requirePageRole` gate, tapi data-fetch action (`getDailyUpdatePageData`) throw `ForbiddenError` untuk non-PM role. User tanpa role PM akan dapat error 500, bukan redirect. Harusnya page punya `requirePageRole(["owner", "admin", "project_manager"])`.
