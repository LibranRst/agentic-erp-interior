# AUTH_AND_PERMISSION.md
# SaaS Agentic Interior ERP

This document defines authentication, roles, permissions, route access, and server-side authorization rules for the MVP.

---

## 1. Auth Decision

```txt
Primary Recommendation: Better Auth
Alternative Fast MVP Option: Clerk
```

The rest of this document assumes authenticated users are connected to the `users` table.

---

## 2. Core Auth Rules

```txt
- Every protected page requires an authenticated user.
- Every server action must check the current user session.
- Every server action must check user permission before mutating data.
- Never rely only on client-side checks.
- Navigation can be role-based, but data access must also be server-protected.
- Owner and Admin have full access in MVP.
```

---

## 3. User Roles

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

## 4. Role Definitions

### Owner

Can:

```txt
- View all dashboard data.
- View all projects.
- Create, update, and archive projects.
- View and generate AI summaries.
- View all leads, material issues, design tasks, and content readiness.
- Manage users and roles.
```

### Admin

Can:

```txt
- View most data.
- Create and update operational records.
- Manage general system data.
- Assist owner with user/project setup.
```

### Project Manager

Can:

```txt
- View assigned projects.
- View project detail.
- Create daily updates.
- Update project progress percentage.
- Update project health.
- Add project issue/blocker notes.
```

Cannot:

```txt
- Manage users.
- Generate company-level AI summaries.
- Delete projects.
```

### Designer

Can:

```txt
- View assigned/relevant projects.
- Create and update design tasks.
- Update design status.
- Update approval/revision status.
- Add design notes and file links.
```

### Purchasing

Can:

```txt
- View relevant project material data.
- Create and update material records.
- Update vendor/material issue status.
- Add ETA and urgency level.
```

### Sales

Can:

```txt
- Create leads.
- Update assigned leads.
- Update lead status and follow-up date.
- Convert lead to project if allowed by owner/admin.
```

### Marketing

Can:

```txt
- View projects marked as content-ready.
- Create and update content asset records.
- Add content opportunity and suggested angle.
- Update content production status.
```

---

## 5. Permission Matrix

| Feature | Owner | Admin | PM | Designer | Purchasing | Sales | Marketing |
|---|---:|---:|---:|---:|---:|---:|---:|
| View Owner Dashboard | Yes | Yes | Limited | Limited | Limited | Limited | Limited |
| View All Projects | Yes | Yes | Yes | Yes | Yes | Limited | Yes |
| Create Project | Yes | Yes | No | No | No | No | No |
| Edit Project | Yes | Yes | Limited | No | No | No | No |
| Delete/Archive Project | Yes | Yes | No | No | No | No | No |
| Create Daily Update | Yes | Yes | Yes | No | No | No | No |
| Update Design Task | Yes | Yes | No | Yes | No | No | No |
| Update Material | Yes | Yes | No | No | Yes | No | No |
| Manage Vendors | Yes | Yes | No | No | Yes | No | No |
| Manage Leads | Yes | Yes | No | No | No | Yes | No |
| Manage Content Assets | Yes | Yes | No | No | No | No | Yes |
| Generate AI Summary | Yes | Yes | No | No | No | No | No |
| View AI Summary | Yes | Yes | Limited | Limited | Limited | Limited | Limited |
| Manage Users | Yes | Yes | No | No | No | No | No |
| Manage Settings | Yes | Yes | No | No | No | No | No |

---

## 6. Route Access Rules

Public routes:

```txt
/login
/register or /invite if enabled
/forgot-password if enabled
```

Protected routes:

```txt
/app/dashboard
/app/projects
/app/projects/[projectId]
/app/daily-updates
/app/design
/app/materials
/app/sales
/app/content
/app/ai-summary
/app/users
/app/settings
```

Owner/admin only:

```txt
/app/users
/app/settings
/app/ai-summary/generate
```

Role-specific routes:

```txt
/app/daily-updates  - owner, admin, project_manager
/app/design         - owner, admin, designer
/app/materials      - owner, admin, purchasing
/app/sales          - owner, admin, sales
/app/content        - owner, admin, marketing
```

---

## 7. Middleware Rules

The middleware should:

```txt
1. Allow public routes.
2. Redirect unauthenticated users to /login.
3. Allow authenticated users into protected routes.
4. Optionally prevent access to role-restricted routes.
5. Never be the only protection layer for sensitive data.
```

Server actions must still enforce permissions.

---

## 8. Server Action Guard Pattern

```ts
export async function createProjectAction(input: CreateProjectInput) {
  const user = await requireUser()

  await requirePermission(user, "project:create")

  const data = createProjectSchema.parse(input)

  return await db.insert(projects).values({
    ...data,
    createdBy: user.id,
  })
}
```

---

## 9. Suggested Permission Keys

```txt
dashboard:view
project:view
project:create
project:update
project:archive

daily_update:view
daily_update:create
daily_update:update

design_task:view
design_task:create
design_task:update

material:view
material:create
material:update

vendor:view
vendor:create
vendor:update

lead:view
lead:create
lead:update
lead:convert

content_asset:view
content_asset:create
content_asset:update

ai_summary:view
ai_summary:generate

user:view
user:create
user:update
settings:update
```

---

## 10. Permission Helper

Create helper:

```txt
src/lib/auth/permissions.ts
```

Responsibilities:

```txt
- Define permission map by role.
- Provide hasPermission(user, permission).
- Provide requirePermission(user, permission).
- Provide requireRole(user, roles).
```

---

## 11. Data Ownership Rules

MVP can start with simple role-based access.

Later, add assignment filtering:

```txt
- PM sees assigned projects.
- Designer sees projects with assigned design tasks.
- Purchasing sees material-related project data.
- Sales sees assigned leads.
- Marketing sees content-ready projects.
```

Owner/admin can see all records.

---

## 12. Invite Flow

Recommended MVP invite flow:

```txt
1. Owner/admin creates user profile.
2. System sends invite link or temporary setup link.
3. User creates password/signs in.
4. User is assigned role.
5. User sees role-based dashboard.
```

If invite flow is too much for MVP, create users manually during development.

---

## 13. Security Notes

```txt
- Do not expose all user data to client components.
- Filter data on server.
- Do not pass private user metadata to the browser.
- Do not allow users to change their own role.
- Only owner/admin can update roles.
- AI workflows must run under the authenticated user's permission context.
```

---

## 14. Done Criteria

Auth and permission implementation is complete when:

```txt
- User can login/logout.
- Protected pages redirect unauthenticated users.
- Sidebar menu changes by role.
- Server actions reject unauthorized users.
- Owner/admin can manage all records.
- Role users can only access allowed modules.
- AI summary generation is restricted to owner/admin.
```
