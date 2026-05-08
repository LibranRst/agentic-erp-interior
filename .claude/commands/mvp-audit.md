# /mvp-audit — MVP Readiness Audit

Run MVP readiness audit against documented requirements.

## Workflow

1. Read AGENTS.md
2. Read docs/MVP_ACCEPTANCE_CHECKLIST.md
3. Read docs/MVP_GAP_REPORT.md (if exists)
4. Read docs/PRD.md MVP scope section
5. Audit the codebase for:
   - Missing modules or routes
   - Incomplete features against PRD
   - Missing permission checks
   - Type safety issues
   - UI inconsistencies against UI_SYSTEM_GUIDE.md
   - No placeholder/stub implementations
6. Compare against MVP_FIX_SPRINT_PLAN.md (if exists)
7. Return:
   - Modules that are complete
   - Modules with gaps (with severity)
   - Concrete next actions for each gap
   - Estimated effort for each gap
