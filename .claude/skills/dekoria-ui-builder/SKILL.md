---
name: dekoria-ui-builder
description: Use for building premium dashboard UI, shadcn/ui components, layouts, responsive pages, cards, tables, forms, sidebar, and app shell for Dekoria ERP.
---

# Dekoria UI Builder Skill

Claude Code version of this skill. Follow root CLAUDE.md and AGENTS.md first.

Use this skill together with the official shadcn/ui skill.

Official shadcn/ui skill responsibility:
- shadcn component usage
- registry
- CLI usage
- theming
- component docs
- component composition patterns
- current shadcn best practices

This custom skill responsibility:
- Dekoria visual direction
- dashboard UX rules
- premium interior brand feel
- operational readability
- feature-specific UI boundaries

Build UI that feels premium, calm, operational, and consistent.

Before building UI:
1. Read CLAUDE.md and AGENTS.md.
2. Read docs/PRD.md.
3. Read docs/FLOWS.md.
4. Read docs/UI_SYSTEM_GUIDE.md if it exists.
5. Read docs/UI_WIREFRAME.md if it exists.
6. Inspect components.json after shadcn is initialized.
7. Use bunx --bun shadcn@latest info when shadcn is initialized.
8. Use bunx --bun shadcn@latest docs <component> before using unfamiliar components.
9. Use official shadcn/ui skill when available.

UI principles:
- Use shadcn/ui first.
- Compose existing components.
- Use semantic tokens, not random raw colors.
- Keep dashboard UI readable and spacious.
- Prioritize data clarity over decorative visuals.
- Use clean status badges, cards, tables, forms, empty states, and skeletons.

Do:
- Use Card, Badge, Button, Table, DropdownMenu, Sheet, Dialog, Tabs, Form, Input, Select, Textarea.
- Put reusable non-shadcn components in src/components/shared.
- Put module-specific components in src/features/<module>/components.
- Make responsive layout desktop-first and mobile-friendly.
- Use whitespace, clean borders, subtle hierarchy, and calm typography.

Do not:
- Hardcode arbitrary colors.
- Create duplicate base components.
- Put business logic inside UI components.
- Overdesign with random gradients or decorative clutter.
- Use generic AI dashboard template layouts.
- Add animation unless it improves clarity.

Claude Code-specific:
- Use shadcn/ui patterns — do not guess component APIs.
- Do not hardcode random colors — use semantic tokens.
- Keep UI premium, calm, dashboard-first.

Preferred visual feel:
- Linear + Notion + Vercel dashboard
- Premium interior brand restraint
- quiet luxury
- clean spacing
- clear hierarchy
- table-heavy but elegant
