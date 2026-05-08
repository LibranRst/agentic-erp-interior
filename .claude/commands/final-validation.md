# /final-validation — Final Validation Before Release

Run final validation checks before marking MVP complete.

## Workflow

1. Read AGENTS.md
2. Read docs/PRD.md (MVP scope)
3. Read docs/TESTING_CHECKLIST.md
4. Run validation:
   - `bun run lint` — lint check
   - `bun run typecheck` — type check
   - `bun run build` — build check
   - Verify all routes from PRD exist and render
   - Verify auth gates on protected routes
   - Verify permission checks on server actions
   - Verify AI workflow end-to-end (if applicable)
   - Run docs/TESTING_CHECKLIST.md items
5. Return:
   - ✅ Passing checks
   - ❌ Failing checks with details
   - ⚠️ Warnings or non-blocking issues
   - Verdict: MVP Ready or Not Ready
   - If not ready, list minimum fixes required for MVP Ready
