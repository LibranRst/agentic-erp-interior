# Codex Setup

This repo now uses a shared agentic coding framework for Codex, OpenCode, and Claude Code.

Use [docs/AGENTIC_CODING_SETUP.md](AGENTIC_CODING_SETUP.md) as the canonical setup document.

Codex remains the primary AI coding agent. OpenCode is the fallback when Codex reaches usage limits. Claude Code is the additional fallback when both are unavailable.

Do not maintain separate Codex-only instructions here; keep shared agent instructions in:
- AGENTS.md
- docs/AGENTIC_CODING_SETUP.md
- .agents/skills/<skill-name>/SKILL.md
