---
name: dekoria-mastra-ai
description: Use for Dekoria-specific Mastra AI workflows, OwnerOpsAgent behavior, ERP summary logic, ai_runs logging, ai_summaries persistence, and operational AI rules.
---

# Dekoria Mastra AI Skill

Claude Code version of this skill. Follow root CLAUDE.md and AGENTS.md first.

Use this skill together with the official mastra-ai/skills skill.

Official Mastra skill responsibility:
- Mastra API usage
- agent setup
- workflow syntax
- tool implementation patterns
- memory
- evals
- streaming
- deployment
- up-to-date Mastra documentation

This custom skill responsibility:
- Dekoria ERP business context
- OwnerOpsAgent behavior
- AI summary rules
- data grounding rules
- ai_runs and ai_summaries logging rules
- owner-friendly Bahasa Indonesia output

AI in this MVP is an operational assistant for the owner, not a generic chatbot.

Main agent:
- OwnerOpsAgent

Main workflow:
- generateMorningSummary

AI responsibilities:
- Generate morning summary
- Detect urgent projects
- Summarize PM updates
- Identify design/DED bottlenecks
- Identify material risks
- Summarize sales/leads
- Suggest content opportunities

Rules:
- All AI code lives in src/mastra.
- Do not call Gemini directly from UI components.
- Do not call Gemini directly from random server actions.
- Server actions call Mastra workflows.
- Mastra tools fetch data through typed Drizzle queries.
- Save every AI execution to ai_runs.
- Save final summary to ai_summaries.
- Output Bahasa Indonesia by default.
- Keep summary concise, actionable, and owner-friendly.
- Do not invent project facts if data is missing.
- Mention missing data clearly.
- Never expose raw secrets in prompts, logs, or summaries.
- Never allow arbitrary SQL execution.

Claude Code-specific:
- Use official Mastra docs/skill before writing Mastra API code.
- Do not call Gemini directly outside src/mastra.
- Keep AI summary grounded in database data.

Before writing Mastra code:
1. Read CLAUDE.md and AGENTS.md.
2. Read docs/PRD.md.
3. Read docs/FLOWS.md.
4. Read docs/AI_AGENT_INSTRUCTIONS.md.
5. Read docs/DATABASE_SCHEMA.md.
6. Use the official mastra-ai/skills skill or Mastra docs for current API patterns.
7. Inspect existing src/mastra files.
8. Implement the smallest complete workflow.

Preferred folder:
- src/mastra/index.ts
- src/mastra/agents/owner-ops-agent.ts
- src/mastra/tools/get-dashboard-data.ts
- src/mastra/tools/get-project-risk-data.ts
- src/mastra/tools/get-daily-updates.ts
- src/mastra/tools/get-design-bottlenecks.ts
- src/mastra/tools/get-material-issues.ts
- src/mastra/tools/get-sales-snapshot.ts
- src/mastra/tools/get-content-opportunities.ts
- src/mastra/workflows/generate-morning-summary.ts

Quality bar:
- AI output must be grounded in fetched data.
- Log errors clearly.
- No silent AI failures.
- No hallucinated Mastra APIs.
- No direct model calls outside src/mastra.
- No arbitrary SQL.
