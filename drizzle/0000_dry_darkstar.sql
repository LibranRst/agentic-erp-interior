CREATE TYPE "public"."ai_run_status" AS ENUM('started', 'success', 'failed', 'fallback_success', 'fallback_failed');--> statement-breakpoint
CREATE TYPE "public"."approval_status" AS ENUM('not_submitted', 'waiting_approval', 'approved', 'revision_needed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."budget_warning_status" AS ENUM('none', 'watch', 'risk', 'over_budget');--> statement-breakpoint
CREATE TYPE "public"."content_opportunity" AS ENUM('before_after', 'cinematic_showcase', 'detail_craftsmanship', 'problem_solution', 'client_story', 'design_tips', 'material_highlight', 'storage_solution', 'luxury_feature');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('not_ready', 'ready_to_shoot', 'footage_available', 'editing', 'ready_to_publish', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."design_task_status" AS ENUM('not_started', 'concept_progress', 'render_progress', 'revision', 'waiting_approval', 'approved', 'ded_progress', 'ded_done', 'blocked');--> statement-breakpoint
CREATE TYPE "public"."design_type" AS ENUM('layout', 'concept', 'render', 'revision', 'ded', 'moodboard', 'material_spec');--> statement-breakpoint
CREATE TYPE "public"."health_status" AS ENUM('healthy', 'needs_attention', 'urgent', 'blocked', 'delayed');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('new', 'contacted', 'consultation_scheduled', 'proposal_sent', 'negotiation', 'converted', 'lost', 'cold');--> statement-breakpoint
CREATE TYPE "public"."material_status" AS ENUM('planned', 'requested', 'ordered', 'in_production', 'in_delivery', 'arrived', 'installed', 'delayed', 'problem', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('project', 'daily_update', 'design', 'material', 'lead', 'content', 'ai', 'system');--> statement-breakpoint
CREATE TYPE "public"."priority" AS ENUM('low', 'medium', 'high', 'critical');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('lead_converted', 'survey', 'concept_design', 'design_revision', 'ded_progress', 'production', 'installation', 'finishing', 'handover', 'completed', 'on_hold', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."related_type" AS ENUM('daily_update', 'design_task', 'material', 'content_asset', 'project_documentation', 'lead_attachment', 'user_avatar');--> statement-breakpoint
CREATE TYPE "public"."role_name" AS ENUM('owner', 'admin', 'project_manager', 'designer', 'purchasing', 'sales', 'marketing');--> statement-breakpoint
CREATE TYPE "public"."stage_status" AS ENUM('not_started', 'in_progress', 'blocked', 'completed');--> statement-breakpoint
CREATE TYPE "public"."summary_type" AS ENUM('morning_summary', 'project_risk_summary', 'pm_update_summary', 'design_bottleneck_summary', 'material_warning_summary', 'sales_snapshot_summary', 'content_opportunity_summary');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TABLE "ai_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"agent_name" text NOT NULL,
	"workflow_name" text NOT NULL,
	"model_provider" text NOT NULL,
	"model_name" text NOT NULL,
	"reasoning_level" text NOT NULL,
	"input_tokens" integer,
	"output_tokens" integer,
	"total_tokens" integer,
	"status" "ai_run_status" NOT NULL,
	"error_message" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_summaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"summary_type" "summary_type" NOT NULL,
	"summary_date" date NOT NULL,
	"generated_for_user_id" uuid,
	"content" text NOT NULL,
	"source_data" jsonb,
	"ai_run_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"room_area" text,
	"visual_status" text,
	"footage_status" text,
	"content_opportunity" "content_opportunity",
	"suggested_angle" text,
	"content_status" "content_status" DEFAULT 'not_ready' NOT NULL,
	"assigned_to" uuid,
	"publish_url" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_updates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"updated_by" uuid,
	"update_date" date NOT NULL,
	"progress_summary" text NOT NULL,
	"work_completed" text,
	"issue_notes" text,
	"blocker_notes" text,
	"next_action" text,
	"progress_percentage" integer,
	"health_status" "health_status",
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "design_tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"designer_id" uuid,
	"task_name" text NOT NULL,
	"design_type" "design_type" NOT NULL,
	"status" "design_task_status" NOT NULL,
	"approval_status" "approval_status" DEFAULT 'not_submitted' NOT NULL,
	"revision_count" integer DEFAULT 0 NOT NULL,
	"due_date" date,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lead_name" text NOT NULL,
	"phone" text,
	"email" text,
	"source" text,
	"interest" text,
	"estimated_project_value" numeric(14, 2),
	"status" "lead_status" DEFAULT 'new' NOT NULL,
	"assigned_sales_id" uuid,
	"next_follow_up_date" date,
	"notes" text,
	"converted_project_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "materials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"material_name" text NOT NULL,
	"category" text,
	"vendor_id" uuid,
	"status" "material_status" NOT NULL,
	"urgency_level" "priority" DEFAULT 'medium' NOT NULL,
	"quantity" numeric(12, 2),
	"unit" text,
	"eta_date" date,
	"issue_notes" text,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid,
	"related_type" "related_type" NOT NULL,
	"related_id" uuid,
	"file_name" text NOT NULL,
	"file_type" text,
	"mime_type" text,
	"file_size" integer,
	"imagekit_file_id" text NOT NULL,
	"imagekit_url" text NOT NULL,
	"thumbnail_url" text,
	"folder_path" text,
	"uploaded_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"project_id" uuid,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" "notification_type",
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_stages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"stage_name" text NOT NULL,
	"status" "stage_status" NOT NULL,
	"start_date" date,
	"due_date" date,
	"completed_at" timestamp with time zone,
	"assigned_to" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_name" text NOT NULL,
	"client_name" text NOT NULL,
	"client_phone" text,
	"location" text,
	"description" text,
	"status" "project_status" NOT NULL,
	"health_status" "health_status" DEFAULT 'healthy' NOT NULL,
	"priority" "priority" DEFAULT 'medium' NOT NULL,
	"progress_percentage" integer DEFAULT 0 NOT NULL,
	"start_date" date,
	"deadline" date,
	"handover_date" date,
	"pm_id" uuid,
	"designer_id" uuid,
	"estimated_value" numeric(14, 2),
	"budget_warning_status" "budget_warning_status" DEFAULT 'none' NOT NULL,
	"content_ready_status" "content_status" DEFAULT 'not_ready' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" "role_name" NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_user_id" text,
	"role_id" uuid NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"avatar_media_id" uuid,
	"status" "user_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_auth_user_id_unique" UNIQUE("auth_user_id")
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vendor_name" text NOT NULL,
	"contact_person" text,
	"phone" text,
	"category" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_runs" ADD CONSTRAINT "ai_runs_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_summaries" ADD CONSTRAINT "ai_summaries_generated_for_user_id_users_id_fk" FOREIGN KEY ("generated_for_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_summaries" ADD CONSTRAINT "ai_summaries_ai_run_id_ai_runs_id_fk" FOREIGN KEY ("ai_run_id") REFERENCES "public"."ai_runs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_assets" ADD CONSTRAINT "content_assets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_assets" ADD CONSTRAINT "content_assets_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_updates" ADD CONSTRAINT "daily_updates_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "daily_updates" ADD CONSTRAINT "daily_updates_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "design_tasks" ADD CONSTRAINT "design_tasks_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "design_tasks" ADD CONSTRAINT "design_tasks_designer_id_users_id_fk" FOREIGN KEY ("designer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_sales_id_users_id_fk" FOREIGN KEY ("assigned_sales_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leads" ADD CONSTRAINT "leads_converted_project_id_projects_id_fk" FOREIGN KEY ("converted_project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "materials_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "materials_vendor_id_vendors_id_fk" FOREIGN KEY ("vendor_id") REFERENCES "public"."vendors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materials" ADD CONSTRAINT "materials_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_stages" ADD CONSTRAINT "project_stages_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_stages" ADD CONSTRAINT "project_stages_assigned_to_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_pm_id_users_id_fk" FOREIGN KEY ("pm_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_designer_id_users_id_fk" FOREIGN KEY ("designer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_avatar_media_id_media_assets_id_fk" FOREIGN KEY ("avatar_media_id") REFERENCES "public"."media_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ai_runs_agent_workflow_created_at_idx" ON "ai_runs" USING btree ("agent_name","workflow_name","created_at");--> statement-breakpoint
CREATE INDEX "ai_summaries_type_date_idx" ON "ai_summaries" USING btree ("summary_type","summary_date");--> statement-breakpoint
CREATE INDEX "content_assets_project_content_status_idx" ON "content_assets" USING btree ("project_id","content_status");--> statement-breakpoint
CREATE INDEX "daily_updates_project_update_date_idx" ON "daily_updates" USING btree ("project_id","update_date");--> statement-breakpoint
CREATE INDEX "design_tasks_project_status_idx" ON "design_tasks" USING btree ("project_id","status");--> statement-breakpoint
CREATE INDEX "leads_status_idx" ON "leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "materials_project_status_idx" ON "materials" USING btree ("project_id","status");--> statement-breakpoint
CREATE INDEX "materials_urgency_level_idx" ON "materials" USING btree ("urgency_level");--> statement-breakpoint
CREATE INDEX "media_assets_project_id_idx" ON "media_assets" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "media_assets_related_idx" ON "media_assets" USING btree ("related_type","related_id");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_project_id_idx" ON "notifications" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_stages_project_id_idx" ON "project_stages" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "projects_health_status_idx" ON "projects" USING btree ("health_status");--> statement-breakpoint
CREATE INDEX "projects_pm_id_idx" ON "projects" USING btree ("pm_id");--> statement-breakpoint
CREATE INDEX "projects_designer_id_idx" ON "projects" USING btree ("designer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree (lower("email"));