# ENV_SETUP.md
# SaaS Agentic Interior ERP

This document defines environment variables, local setup, and deployment notes for the MVP.

---

## 1. Runtime Decision

```txt
Package Manager: Bun
Local Runtime: Bun
Production Runtime: Vercel-managed Next.js runtime
Deployment Target: Vercel
```

Rules:

```txt
- Use Bun for all package installation and script execution.
- Do not use npm, pnpm, or yarn unless explicitly requested.
- Use bunx --bun for shadcn CLI commands.
- Keep bun.lock / bun.lockb as the source of truth.
- Do not commit secrets to the repository.
```

---

## 2. Local Development Commands

```bash
bun install
bun dev
bun run build
bun run lint
bun run typecheck
```

Database commands:

```bash
bun run db:generate
bun run db:migrate
bun run db:studio
bun run db:seed
```

shadcn commands:

```bash
bunx --bun shadcn@latest add button card table form input select
```

---

## 3. shadcn Initialization

Use the user's preferred preset:

```bash
bunx --bun shadcn@latest init --preset b5d2ZsMLI --template next --pointer
```

Rules:

```txt
- The shadcn preset is the UI source of truth.
- Do not create a separate design system from scratch.
- Do not overwrite generated shadcn components unless explicitly requested.
- Use components/ui for generated shadcn components.
- Use components/shared for project-specific reusable UI.
```

---

## 4. Required Environment Variables

Create `.env.local` in the project root.

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Database - NeonDB
DATABASE_URL=
DATABASE_URL_UNPOOLED=

# Auth - Better Auth
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# Optional Auth - Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# ImageKit
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=
IMAGEKIT_URL_ENDPOINT=

# Gemini
GOOGLE_GENERATIVE_AI_API_KEY=

# Mastra
MASTRA_TELEMETRY_DISABLED=false

# Internal App Security
INTERNAL_API_SECRET=
```

---

## 5. Environment Variable Notes

### `DATABASE_URL`

Used by the app and Drizzle to connect to Neon Postgres.

### `DATABASE_URL_UNPOOLED`

Recommended for migrations if Neon provides a separate unpooled connection string.

### `BETTER_AUTH_SECRET`

Generate a secure random string:

```bash
openssl rand -base64 32
```

### `IMAGEKIT_PRIVATE_KEY`

Server-only. Never expose this to client components.

### `GOOGLE_GENERATIVE_AI_API_KEY`

Used by Mastra workflows and Gemini model calls. Do not call Gemini directly from UI components.

---

## 6. Recommended `.env.example`

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=
DATABASE_URL_UNPOOLED=

BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=
IMAGEKIT_URL_ENDPOINT=

GOOGLE_GENERATIVE_AI_API_KEY=
MASTRA_TELEMETRY_DISABLED=false
INTERNAL_API_SECRET=
```

---

## 7. Local Setup Checklist

```txt
1. Create Next.js project using shadcn preset command.
2. Run bun install.
3. Create .env.local.
4. Add Neon database connection string.
5. Add ImageKit keys.
6. Add Gemini API key.
7. Add Better Auth secret.
8. Run Drizzle migration.
9. Run seed script.
10. Start local dev server with bun dev.
```

---

## 8. Vercel Deployment Notes

Set the same environment variables in Vercel Project Settings.

Production required variables:

```env
NEXT_PUBLIC_APP_URL=
DATABASE_URL=
DATABASE_URL_UNPOOLED=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=
GOOGLE_GENERATIVE_AI_API_KEY=
INTERNAL_API_SECRET=
```

If using Clerk instead of Better Auth:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```

---

## 9. Security Rules

```txt
- Never expose private keys in client components.
- Never commit .env.local.
- Never log full database URLs.
- Never log API keys.
- Never allow AI agents to access raw environment variables.
- Server actions must validate user session and permission before accessing data.
```

---

## 10. Done Criteria

Environment setup is complete when:

```txt
- bun dev runs successfully.
- Next.js app loads.
- shadcn UI components render correctly.
- Neon database connection works.
- Drizzle migrations run.
- Seed data is inserted.
- ImageKit upload authentication works.
- Mastra can call Gemini successfully.
- Auth login/logout works.
```
