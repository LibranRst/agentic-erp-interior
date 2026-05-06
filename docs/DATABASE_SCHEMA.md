# DATABASE_SCHEMA.md
# SaaS Agentic Interior ERP — NeonDB + Drizzle Database Schema

## 1. Database Decision

The MVP uses:

```txt
Database: NeonDB / PostgreSQL
ORM: Drizzle ORM
Package Manager: Bun
```

Rules:

- Use Drizzle for app-level database access.
- Use SQL only for migrations or database maintenance.
- Do not use Supabase.
- Do not store images/videos/files directly in Neon.
- Store actual media in ImageKit.
- Store media metadata in `media_assets`.

---

## 2. Core Tables

```txt
roles
users
projects
project_stages
daily_updates
design_tasks
vendors
materials
leads
content_assets
media_assets
ai_summaries
ai_runs
notifications
```

---

## 3. Table: roles

```txt
roles
- id uuid primary key
- name text unique not null
- description text
- created_at timestamp
- updated_at timestamp
```

Default roles:

```txt
owner
admin
project_manager
designer
purchasing
sales
marketing
```

---

## 4. Table: users

```txt
users
- id uuid primary key
- auth_user_id text unique
- role_id uuid references roles(id)
- name text not null
- email text unique not null
- phone text
- avatar_media_id uuid references media_assets(id)
- status text default 'active'
- created_at timestamp
- updated_at timestamp
```

Notes:

- `auth_user_id` maps to Better Auth or Clerk user ID.
- App permissions should use `role_id`.

---

## 5. Table: projects

```txt
projects
- id uuid primary key
- project_name text not null
- client_name text not null
- client_phone text
- location text
- description text
- status text not null
- health_status text not null default 'healthy'
- priority text not null default 'medium'
- progress_percentage integer default 0
- start_date date
- deadline date
- handover_date date
- pm_id uuid references users(id)
- designer_id uuid references users(id)
- estimated_value numeric
- budget_warning_status text default 'none'
- content_ready_status text default 'not_ready'
- created_at timestamp
- updated_at timestamp
```

Project status:

```txt
lead_converted
survey
concept_design
design_revision
ded_progress
production
installation
finishing
handover
completed
on_hold
cancelled
```

Health status:

```txt
healthy
needs_attention
urgent
blocked
delayed
```

---

## 6. Table: project_stages

```txt
project_stages
- id uuid primary key
- project_id uuid references projects(id) on delete cascade
- stage_name text not null
- status text not null
- start_date date
- due_date date
- completed_at timestamp
- assigned_to uuid references users(id)
- notes text
- created_at timestamp
- updated_at timestamp
```

---

## 7. Table: daily_updates

```txt
daily_updates
- id uuid primary key
- project_id uuid references projects(id) on delete cascade
- updated_by uuid references users(id)
- update_date date not null
- progress_summary text not null
- work_completed text
- issue_notes text
- blocker_notes text
- next_action text
- progress_percentage integer
- health_status text
- created_at timestamp
- updated_at timestamp
```

Attachments should be linked via `media_assets.related_type = 'daily_update'` and `related_id = daily_updates.id`.

---

## 8. Table: design_tasks

```txt
design_tasks
- id uuid primary key
- project_id uuid references projects(id) on delete cascade
- designer_id uuid references users(id)
- task_name text not null
- design_type text not null
- status text not null
- approval_status text default 'not_submitted'
- revision_count integer default 0
- due_date date
- notes text
- created_at timestamp
- updated_at timestamp
```

Design type:

```txt
layout
concept
render
revision
ded
moodboard
material_spec
```

Status:

```txt
not_started
concept_progress
render_progress
revision
waiting_approval
approved
ded_progress
ded_done
blocked
```

Approval status:

```txt
not_submitted
waiting_approval
approved
revision_needed
rejected
```

---

## 9. Table: vendors

```txt
vendors
- id uuid primary key
- vendor_name text not null
- contact_person text
- phone text
- category text
- notes text
- created_at timestamp
- updated_at timestamp
```

---

## 10. Table: materials

```txt
materials
- id uuid primary key
- project_id uuid references projects(id) on delete cascade
- material_name text not null
- category text
- vendor_id uuid references vendors(id)
- status text not null
- urgency_level text default 'medium'
- quantity numeric
- unit text
- eta_date date
- issue_notes text
- updated_by uuid references users(id)
- created_at timestamp
- updated_at timestamp
```

Status:

```txt
planned
requested
ordered
in_production
in_delivery
arrived
installed
delayed
problem
cancelled
```

Urgency:

```txt
low
medium
high
critical
```

---

## 11. Table: leads

```txt
leads
- id uuid primary key
- lead_name text not null
- phone text
- email text
- source text
- interest text
- estimated_project_value numeric
- status text not null default 'new'
- assigned_sales_id uuid references users(id)
- next_follow_up_date date
- notes text
- converted_project_id uuid references projects(id)
- created_at timestamp
- updated_at timestamp
```

Lead status:

```txt
new
contacted
consultation_scheduled
proposal_sent
negotiation
converted
lost
cold
```

---

## 12. Table: content_assets

```txt
content_assets
- id uuid primary key
- project_id uuid references projects(id) on delete cascade
- room_area text
- visual_status text
- footage_status text
- content_opportunity text
- suggested_angle text
- content_status text default 'not_ready'
- assigned_to uuid references users(id)
- publish_url text
- notes text
- created_at timestamp
- updated_at timestamp
```

Content status:

```txt
not_ready
ready_to_shoot
footage_available
editing
ready_to_publish
published
archived
```

Content opportunity:

```txt
before_after
cinematic_showcase
detail_craftsmanship
problem_solution
client_story
design_tips
material_highlight
storage_solution
luxury_feature
```

---

## 13. Table: media_assets

```txt
media_assets
- id uuid primary key
- project_id uuid references projects(id)
- related_type text not null
- related_id uuid
- file_name text not null
- file_type text
- mime_type text
- file_size integer
- imagekit_file_id text not null
- imagekit_url text not null
- thumbnail_url text
- folder_path text
- uploaded_by uuid references users(id)
- created_at timestamp
- updated_at timestamp
```

Related type examples:

```txt
daily_update
design_task
material
content_asset
project_documentation
lead_attachment
user_avatar
```

---

## 14. Table: ai_summaries

```txt
ai_summaries
- id uuid primary key
- summary_type text not null
- summary_date date not null
- generated_for_user_id uuid references users(id)
- content text not null
- source_data jsonb
- ai_run_id uuid references ai_runs(id)
- created_at timestamp
```

Summary types:

```txt
morning_summary
project_risk_summary
pm_update_summary
design_bottleneck_summary
material_warning_summary
sales_snapshot_summary
content_opportunity_summary
```

---

## 15. Table: ai_runs

```txt
ai_runs
- id uuid primary key
- agent_name text not null
- workflow_name text not null
- model_provider text not null
- model_name text not null
- reasoning_level text not null
- input_tokens integer
- output_tokens integer
- total_tokens integer
- status text not null
- error_message text
- started_at timestamp
- completed_at timestamp
- created_by uuid references users(id)
- created_at timestamp
```

Status:

```txt
started
success
failed
fallback_success
fallback_failed
```

---

## 16. Table: notifications

```txt
notifications
- id uuid primary key
- user_id uuid references users(id) on delete cascade
- project_id uuid references projects(id)
- title text not null
- message text not null
- type text
- is_read boolean default false
- created_at timestamp
```

---

## 17. Recommended Indexes

```txt
projects(status)
projects(health_status)
projects(pm_id)
projects(designer_id)
daily_updates(project_id, update_date)
design_tasks(project_id, status)
materials(project_id, status)
materials(urgency_level)
leads(status)
content_assets(project_id, content_status)
media_assets(project_id)
media_assets(related_type, related_id)
ai_summaries(summary_type, summary_date)
ai_runs(agent_name, workflow_name, created_at)
```

---

## 18. Dashboard Query Logic

Active projects:

```txt
status NOT IN ('completed', 'cancelled')
```

Urgent projects:

```txt
health_status IN ('urgent', 'blocked', 'delayed')
```

Pending design:

```txt
status IN ('concept_progress', 'render_progress', 'revision', 'waiting_approval', 'ded_progress', 'blocked')
```

Material issues:

```txt
status IN ('delayed', 'problem') OR urgency_level IN ('high', 'critical')
```

New leads:

```txt
status IN ('new', 'contacted')
```

Content ready:

```txt
content_status IN ('ready_to_shoot', 'footage_available', 'ready_to_publish')
```
