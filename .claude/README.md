# .claude — Claude Code Configuration

This directory configures Claude Code for this repository.

## Files

- `CLAUDE.md` (project root) — Thin adapter that defers to AGENTS.md
- `.claude/skills/*/SKILL.md` — Claude Code project skills (mirrored from `.agents/skills/`)
- `.claude/commands/*.md` — Slash commands for repeated workflows
- `.claude/settings.local.json` — Local permission settings

## Claude Code Role

Claude Code is the tertiary fallback coding agent in this repository's Agentic Coding Framework:

1. **Codex** — Primary coding agent
2. **OpenCode** — Secondary fallback
3. **Claude Code** — Additional fallback

All agents share AGENTS.md as the source of truth.

## Getting Started

```bash
cd /Volumes/DekoriaSSD/App Projects/dekoria-erp-project
claude
```

Then:
1. Read `@CLAUDE.md`
2. Read `@AGENTS.md`
3. Read relevant docs from `docs/`
4. Use Plan mode for large changes
5. Use slash commands for repeated workflows
6. Reference skills from `.claude/skills/` or `.agents/skills/`

## Commands

| Command | Description |
|---------|-------------|
| `/mvp-audit` | Run MVP readiness audit against doc requirements |
| `/fix-sprint` | Execute fix sprint checklist |
| `/final-validation` | Run final validation before release |
| `/staging-check` | Verify staging deployment readiness |

## Skills

Claude Code project skills are mirrored in `.claude/skills/` from `.agents/skills/`. Use `@` mentions to reference them:

- `@.claude/skills/dekoria-project-architect/SKILL.md`
- `@.claude/skills/dekoria-ui-builder/SKILL.md`
- `@.claude/skills/dekoria-db-drizzle/SKILL.md`
- `@.claude/skills/dekoria-mastra-ai/SKILL.md`
- `@.claude/skills/dekoria-quality-review/SKILL.md`

Official skills (at `.agents/skills/`):
- `@.agents/skills/shadcn/SKILL.md`
- `@.agents/skills/mastra/SKILL.md`

## Recommended Claude Code Workflow

For large tasks:
1. Start in Plan mode.
2. Ask Claude to read CLAUDE.md, AGENTS.md, and relevant docs.
3. Ask for a plan first.
4. Approve or adjust the plan.
5. Then implement.
6. Run verification.
7. Update docs if implementation changes decisions.

## Hooks

No hooks are currently configured. Hooks may be added later for safe automation such as:
- reminding to run typecheck
- running format checks
- blocking destructive commands

But hooks should not be enabled until the project is stable.

## Do Not

- Do not blindly overwrite AGENTS.md.
- Do not run destructive git commands.
- Do not add V2/V3 scope.
- Do not use npm/pnpm/yarn unless explicitly approved.
- Do not guess shadcn or Mastra APIs.

## Related

- [CLAUDE.md](../CLAUDE.md) — Claude Code entrypoint
- [AGENTS.md](../AGENTS.md) — Shared agent instructions
- [docs/AGENTIC_CODING_SETUP.md](../docs/AGENTIC_CODING_SETUP.md) — Full framework setup
- [docs/VIBECODING_FRAMEWORK.md](../docs/VIBECODING_FRAMEWORK.md) — Workflow patterns
