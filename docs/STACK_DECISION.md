# STACK_DECISION.md
# SaaS Agentic Interior ERP — Final MVP Stack Decision

## 1. Final Stack

```txt
Package Manager: Bun
Local Runtime: Bun
Production Runtime: Vercel-managed Next.js / Node-compatible runtime
Framework: Next.js App Router
Language: TypeScript
UI: shadcn/ui custom preset b5d2ZsMLI
Styling: Tailwind CSS + CSS variables from shadcn preset
Database: NeonDB / PostgreSQL
ORM: Drizzle ORM
Auth: Better Auth by default; Clerk allowed if speed is prioritized
Storage/CDN: ImageKit
AI Agent Framework: Mastra
AI Provider: Google Gemini API
Default AI Model: Gemini 3 Flash
Default Reasoning: High
Fallback AI Model: Gemini 3 Flash
Fallback Reasoning: Low
Deployment: Vercel
```

---

## 2. Bun Decision

The project uses Bun for package management and local development because the shadcn foundation is initialized with Bun:

```bash
bunx --bun shadcn@latest init --preset b5d2ZsMLI --template next --pointer
```

### Required Command Style

```bash
bun install
bun dev
bun run build
bun run lint
bunx --bun shadcn@latest add button card table form input select
```

### Rules

- Use Bun for all package installation and script execution.
- Use `bunx --bun` for shadcn CLI commands.
- Do not use `npm`, `pnpm`, or `yarn` unless explicitly requested.
- Do not generate `package-lock.json`, `pnpm-lock.yaml`, or `yarn.lock`.
- Keep `bun.lock` or `bun.lockb` as the package lock source of truth.
- Use `bun dev` for local development.
- Use Vercel as deployment target unless changed later.
- Do not describe production runtime as Bun unless the app is later deployed to a Bun-native server or container.

---

## 3. UI Decision

The project uses shadcn/ui with a custom preset.

```bash
bunx --bun shadcn@latest init --preset b5d2ZsMLI --template next --pointer
```

### UI Source of Truth

The preset is the source of truth for:

- Typography
- Radius
- Spacing
- Color tokens
- Border style
- Component tone
- Interaction style
- Base UI components

### UI Rules

- Use shadcn components first.
- Do not create a separate design system.
- Do not hardcode random colors.
- Use CSS variables and Tailwind tokens from the preset.
- Do not casually overwrite `components/ui`.
- Build custom ERP components as wrappers around shadcn primitives.
- Keep ERP screens clean, quiet, data-dense, and premium.

---

## 4. Database Decision

Use **NeonDB** as the PostgreSQL database.

### Why NeonDB

- ERP data is relational and Postgres-first.
- Neon branching is useful for AI-agent / Codex development workflows.
- Works cleanly with Drizzle ORM.
- Better composability than an all-in-one backend platform.
- Avoids locking auth/storage/database into one vendor.

### Database Access Rules

- Use Drizzle ORM for application queries.
- Use SQL only for migrations or deliberate database maintenance.
- Do not let AI agents execute arbitrary SQL.
- Do not store large files in Neon.
- Store media metadata in `media_assets`, but actual files in ImageKit.

---

## 5. Storage Decision

Use **ImageKit** for media storage, optimization, and delivery.

### Media Types

- Project progress photos
- 3D renders
- Design references
- Material photos
- Before-after documentation
- Content thumbnails
- User avatars

### ImageKit Folder Structure

```txt
dekoria-erp/
  projects/
    {projectId}/
      daily-updates/
      design/
      materials/
      content/
      handover/
  leads/
    {leadId}/
  users/
    avatars/
```

---

## 6. Auth Decision

Default recommendation:

```txt
Better Auth + Drizzle + NeonDB
```

Alternative for faster MVP:

```txt
Clerk + NeonDB
```

### Auth Rules

- Use app-level roles for ERP permissions.
- Do not rely only on UI hiding for access control.
- Every server action must validate the current user and role.
- Owner and Admin can manage all modules.
- Other roles have scoped permissions.

---

## 7. AI Decision

Use **Mastra** as the AI agent framework.

```txt
AI Framework: Mastra
Provider: Google Gemini API
Default Model: Gemini 3 Flash
Default Reasoning: High
Fallback Model: Gemini 3 Flash
Fallback Reasoning: Low
Utility Model Optional: Gemini Flash-Lite / lower-cost model for simple formatting/classification
```

### AI Rules

- All AI logic must live inside `src/mastra`.
- Next.js server actions call Mastra workflows.
- Mastra tools fetch data through Drizzle.
- Do not call Gemini directly from random UI components or server actions.
- Never expose database credentials to the model.
- Never allow AI to execute arbitrary SQL.
- Save every AI execution into `ai_runs`.
- Save final owner-facing summaries into `ai_summaries`.
- Output Bahasa Indonesia by default.

---

## 8. Environment Variables

```env
# App
NEXT_PUBLIC_APP_URL=

# Database
DATABASE_URL=

# Auth - Better Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=

# Optional Auth - Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# ImageKit
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=

# Google Gemini
GOOGLE_GENERATIVE_AI_API_KEY=
```
