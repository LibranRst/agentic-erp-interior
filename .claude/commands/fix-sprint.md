# /fix-sprint — Fix Sprint Execution

Execute the fix sprint checklist from MVP_FIX_SPRINT_PLAN.md.

## Workflow

1. Read AGENTS.md
2. Read docs/MVP_FIX_SPRINT_PLAN.md
3. Read docs/MVP_GAP_REPORT.md (if exists)
4. For each fix item:
   - Read relevant docs and source files
   - Implement fix following AGENTS.md rules
   - Verify with lint/typecheck/build
   - Mark item complete
5. After all fixes:
   - Run docs/TESTING_CHECKLIST.md verification
   - Summarize what was fixed per item
   - Report any remaining blockers
   - Suggest re-audit with /mvp-audit

## Constraints

- One fix at a time — do not batch unrelated changes
- Follow existing patterns in the codebase
- Do not expand scope beyond the fix item
- Run verification after each fix
