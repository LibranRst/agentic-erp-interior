# Dekoria Agentic Interior ERP

Internal MVP for Dekoria Living operations.

The product is an owner command center for project visibility, PM updates, design/DED tracking, material issues, sales/leads, content readiness, user roles, media metadata, and AI morning summaries.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Bun
- Neon Postgres
- Drizzle ORM
- Better Auth
- ImageKit
- Mastra
- Gemini

Use Bun for project commands.

## Setup

```bash
bun install
cp .env.example .env.local
```

Fill `.env.local` with development values. Required for local app/auth/database:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=
DATABASE_URL_UNPOOLED=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
```

Recommended for first local owner login:

```env
BOOTSTRAP_OWNER_EMAIL=owner@example.com
BOOTSTRAP_OWNER_NAME=Dekoria Owner
```

Optional MVP services:

```env
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=
IMAGEKIT_URL_ENDPOINT=
GOOGLE_GENERATIVE_AI_API_KEY=
MASTRA_TELEMETRY_DISABLED=false
```

## Database

Run these only against a confirmed safe development database:

```bash
bun run db:migrate
bun run db:seed
```

The seed script creates roles, sample operational data, sample AI records, media metadata, notifications, and a bootstrap owner invite when `BOOTSTRAP_OWNER_EMAIL` is set. Open the printed invite URL to create the Better Auth owner password, then log in at `/login`.

## Development

```bash
bun dev
```

Important routes:

- `/dashboard`
- `/projects`
- `/projects/new`
- `/daily-updates`
- `/design`
- `/materials`
- `/vendors`
- `/sales`
- `/content`
- `/ai-summary`
- `/media`
- `/users`
- `/settings`
- `/archived`

## QA

Static verification:

```bash
bun run typecheck
bun run lint
bun run build
```

Optional integration checks:

```bash
bun run mastra:build
bun run db:migrate
bun run db:seed
```

Final internal beta workflow:

1. Owner logs in and opens `/dashboard`.
2. Owner sees project status, latest PM updates, design/DED status, material issues, sales/leads, content readiness, and latest AI summary.
3. Owner/admin generates AI morning summary or records exact Gemini/Mastra env blocker.
4. PM submits a daily update.
5. Designer updates design/DED status.
6. Purchasing updates material issue/vendor state.
7. Sales updates leads and owner/admin converts a qualified lead.
8. Marketing updates content readiness.
9. Owner/admin manages user invites, roles, and status.
10. Non-owner roles are rejected from owner/admin-only pages and actions.

## Current Beta Status

Sprint G status: Ready for internal beta with limitations.

Verified in Sprint G:

- static verification, Mastra build, migration, and seed
- owner login and dashboard browser QA
- PM, designer, purchasing, sales, and marketing create flows
- owner/admin route load checks
- PM redirect away from owner/admin-only routes
- ImageKit upload-auth signed payload

Known internal beta limitations:

- live AI summary generation is blocked by an invalid Gemini API key
- end-to-end ImageKit binary upload was not performed
- owner/admin lead conversion was not separately exercised
- full non-owner matrix for every role was not separately exercised

See:

- `docs/MVP_ACCEPTANCE_CHECKLIST.md`
- `docs/MVP_GAP_REPORT.md`
- `docs/TESTING_CHECKLIST.md`
- `docs/ENV_SETUP.md`
- `docs/SEED_DATA.md`
