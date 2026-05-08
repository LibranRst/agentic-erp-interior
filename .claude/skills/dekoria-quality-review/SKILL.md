---
name: dekoria-quality-review
description: Use for reviewing code quality, detecting bugs, checking type safety, finding inconsistent UI patterns, reviewing security risks, and verifying MVP readiness.
---

# Dekoria Quality Review Skill

Claude Code version of this skill. Follow root CLAUDE.md and AGENTS.md first.

Review like a senior engineer.

Focus on:
- correctness
- type safety
- security
- permission checks
- architecture consistency
- UI consistency
- accessibility
- maintainability
- MVP scope discipline

Check:
- Does the code match AGENTS.md?
- Does it follow PRD.md and FLOWS.md?
- Does it follow relevant technical docs?
- Are server actions protected?
- Are permissions checked?
- Are inputs validated?
- Are errors surfaced clearly?
- Are there unsafe casts or any?
- Are there duplicate components/helpers?
- Does UI use shadcn and semantic tokens?
- Is the feature responsive enough?
- Did the change accidentally introduce V2/V3 scope?
- Did the implementation hallucinate package APIs?
- Did it use official skills or docs where appropriate?

Claude Code-specific:
- Review scope, type safety, permissions, UI consistency, MVP completeness, and hallucinated APIs.
- Return findings by severity.

When reviewing:
- List findings by severity.
- Include file paths.
- Suggest concrete fixes.
- If no major issues, say so and mention residual risks.

Before final response:
- Run lint/typecheck/build when relevant and available.
- Summarize verification result.
