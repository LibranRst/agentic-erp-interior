# /staging-check — Staging Deployment Readiness

Verify staging deployment readiness before pushing to production.

## Workflow

1. Read CLAUDE.md and AGENTS.md
2. Read docs/ENV_SETUP.md
3. Read docs/MIGRATION_PLAN.md
4. Read docs/FINAL_MVP_VALIDATION.md (if exists)

## Check

- Vercel build settings
- Bun compatibility
- env vars (DATABASE_URL, BETTER_AUTH_SECRET, IMAGEKIT_KEYS, MASTRA/GEMINI keys)
- Neon database connection
- Drizzle migration flow
- Better Auth configuration
- ImageKit configuration
- Mastra/Gemini environment
- seed/test data availability
- production build success

## Create or Update

- docs/STAGING_DEPLOYMENT_CHECKLIST.md

## Return

1. Required env vars
2. Build command
3. Migration command (if available)
4. Deployment risks
5. Staging checklist
6. Commands run
7. Verification result

## Constraints

- Do not add new features.
- Do not modify env files directly.
- Only report readiness and gaps.
