# CLAUDE.md — Claude Code Adapter

This file is a thin adapter for Claude Code. All shared agent instructions live in AGENTS.md.

## Defer to AGENTS.md

Claude Code must read AGENTS.md before any implementation:

- @AGENTS.md — primary shared instructions for all coding agents

Claude Code is the tertiary fallback agent:
- Codex is the primary coding agent.
- OpenCode is the secondary fallback.
- Claude Code is the additional fallback when both are unavailable.

## Required Docs

Read relevant docs before implementation:

- @docs/PRD.md
- @docs/FLOWS.md
- @docs/MVP_SYSTEM_BLUEPRINT.md
- @docs/AGENTIC_CODING_SETUP.md — full agentic coding framework setup
- @docs/VIBECODING_FRAMEWORK.md — workflow patterns and prompt templates
- Additional technical docs under docs/ as needed

## Claude Code Workflow

1. Run `claude` from project root.
2. Read CLAUDE.md (this file) then AGENTS.md.
3. For large tasks, use Plan mode before writing code.
4. Reference docs with @ file mentions.
5. Use slash commands for repeated workflows.
6. Verify with lint/typecheck/build when available.

## Skills

Claude Code project skills are mirrored in `.claude/skills/` from `.agents/skills/`. Reference them with `@` mentions:

- `@.claude/skills/dekoria-project-architect/SKILL.md`
- `@.claude/skills/dekoria-ui-builder/SKILL.md`
- `@.claude/skills/dekoria-db-drizzle/SKILL.md`
- `@.claude/skills/dekoria-mastra-ai/SKILL.md`
- `@.claude/skills/dekoria-quality-review/SKILL.md`

Official skills at `.agents/skills/`:
- `@.agents/skills/shadcn/SKILL.md`
- `@.agents/skills/mastra/SKILL.md`

## Commands

- `/mvp-audit` — Run MVP readiness audit
- `/fix-sprint` — Execute fix sprint checklist
- `/final-validation` — Run final validation before release
- `/staging-check` — Verify staging deployment readiness

## Prohibited

- Do not run destructive git commands (reset --hard, checkout -- .).
- Do not overwrite curated AGENTS.md blindly.
- Do not expand beyond MVP scope unless explicitly requested.
