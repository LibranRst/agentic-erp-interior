import { relations, sql } from "drizzle-orm";
import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

export const roleNameEnum = pgEnum("role_name", [
  "owner",
  "admin",
  "project_manager",
  "designer",
  "purchasing",
  "sales",
  "marketing",
]);

export const userStatusEnum = pgEnum("user_status", ["active", "inactive"]);

export const inviteStatusEnum = pgEnum("invite_status", [
  "pending",
  "accepted",
  "revoked",
  "expired",
]);

export const projectStatusEnum = pgEnum("project_status", [
  "lead_converted",
  "survey",
  "concept_design",
  "design_revision",
  "ded_progress",
  "production",
  "installation",
  "finishing",
  "handover",
  "completed",
  "on_hold",
  "cancelled",
]);

export const healthStatusEnum = pgEnum("health_status", [
  "healthy",
  "needs_attention",
  "urgent",
  "blocked",
  "delayed",
]);

export const priorityEnum = pgEnum("priority", [
  "low",
  "medium",
  "high",
  "critical",
]);

export const budgetWarningStatusEnum = pgEnum("budget_warning_status", [
  "none",
  "watch",
  "risk",
  "over_budget",
]);

export const stageStatusEnum = pgEnum("stage_status", [
  "not_started",
  "in_progress",
  "blocked",
  "completed",
]);

export const designTypeEnum = pgEnum("design_type", [
  "layout",
  "concept",
  "render",
  "revision",
  "ded",
  "moodboard",
  "material_spec",
]);

export const designTaskStatusEnum = pgEnum("design_task_status", [
  "not_started",
  "concept_progress",
  "render_progress",
  "revision",
  "waiting_approval",
  "approved",
  "ded_progress",
  "ded_done",
  "blocked",
]);

export const approvalStatusEnum = pgEnum("approval_status", [
  "not_submitted",
  "waiting_approval",
  "approved",
  "revision_needed",
  "rejected",
]);

export const materialStatusEnum = pgEnum("material_status", [
  "planned",
  "requested",
  "ordered",
  "in_production",
  "in_delivery",
  "arrived",
  "installed",
  "delayed",
  "problem",
  "cancelled",
]);

export const leadStatusEnum = pgEnum("lead_status", [
  "new",
  "contacted",
  "consultation_scheduled",
  "proposal_sent",
  "negotiation",
  "converted",
  "lost",
  "cold",
]);

export const contentStatusEnum = pgEnum("content_status", [
  "not_ready",
  "ready_to_shoot",
  "footage_available",
  "editing",
  "ready_to_publish",
  "published",
  "archived",
]);

export const contentOpportunityEnum = pgEnum("content_opportunity", [
  "before_after",
  "cinematic_showcase",
  "detail_craftsmanship",
  "problem_solution",
  "client_story",
  "design_tips",
  "material_highlight",
  "storage_solution",
  "luxury_feature",
]);

export const relatedTypeEnum = pgEnum("related_type", [
  "daily_update",
  "design_task",
  "material",
  "content_asset",
  "project_documentation",
  "lead_attachment",
  "user_avatar",
]);

export const summaryTypeEnum = pgEnum("summary_type", [
  "morning_summary",
  "project_risk_summary",
  "pm_update_summary",
  "design_bottleneck_summary",
  "material_warning_summary",
  "sales_snapshot_summary",
  "content_opportunity_summary",
]);

export const aiRunStatusEnum = pgEnum("ai_run_status", [
  "started",
  "success",
  "failed",
  "fallback_success",
  "fallback_failed",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "project",
  "daily_update",
  "design",
  "material",
  "lead",
  "content",
  "ai",
  "system",
]);

export const authUsers = pgTable(
  "auth_users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("auth_users_email_idx").on(sql`lower(${table.email})`)],
);

export const authSessions = pgTable(
  "auth_sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("auth_sessions_user_id_idx").on(table.userId),
    index("auth_sessions_token_idx").on(table.token),
  ],
);

export const authAccounts = pgTable(
  "auth_accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => authUsers.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("auth_accounts_user_id_idx").on(table.userId),
    index("auth_accounts_provider_account_idx").on(
      table.providerId,
      table.accountId,
    ),
  ],
);

export const authVerifications = pgTable(
  "auth_verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("auth_verifications_identifier_idx").on(table.identifier)],
);

export const roles = pgTable("roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: roleNameEnum("name").notNull().unique(),
  description: text("description"),
  ...timestamps,
});

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    authUserId: text("auth_user_id").unique(),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    avatarMediaId: uuid("avatar_media_id").references(
      (): AnyPgColumn => mediaAssets.id,
    ),
    status: userStatusEnum("status").default("active").notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("users_email_idx").on(sql`lower(${table.email})`)],
);

export const userInvites = pgTable(
  "user_invites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id),
    tokenHash: text("token_hash").notNull().unique(),
    status: inviteStatusEnum("status").default("pending").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    invitedBy: uuid("invited_by").references(() => users.id),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index("user_invites_email_idx").on(sql`lower(${table.email})`),
    index("user_invites_role_id_idx").on(table.roleId),
    index("user_invites_status_idx").on(table.status),
  ],
);

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectName: text("project_name").notNull(),
    clientName: text("client_name").notNull(),
    clientPhone: text("client_phone"),
    location: text("location"),
    projectType: text("project_type"),
    roomArea: text("room_area"),
    description: text("description"),
    status: projectStatusEnum("status").notNull(),
    healthStatus: healthStatusEnum("health_status")
      .default("healthy")
      .notNull(),
    priority: priorityEnum("priority").default("medium").notNull(),
    progressPercentage: integer("progress_percentage").default(0).notNull(),
    startDate: date("start_date"),
    deadline: date("deadline"),
    handoverDate: date("handover_date"),
    pmId: uuid("pm_id").references((): AnyPgColumn => users.id),
    designerId: uuid("designer_id").references((): AnyPgColumn => users.id),
    estimatedValue: numeric("estimated_value", { precision: 14, scale: 2 }),
    budgetWarningStatus: budgetWarningStatusEnum("budget_warning_status")
      .default("none")
      .notNull(),
    contentReadyStatus: contentStatusEnum("content_ready_status")
      .default("not_ready")
      .notNull(),
    ...timestamps,
  },
  (table) => [
    index("projects_status_idx").on(table.status),
    index("projects_health_status_idx").on(table.healthStatus),
    index("projects_pm_id_idx").on(table.pmId),
    index("projects_designer_id_idx").on(table.designerId),
  ],
);

export const projectStages = pgTable(
  "project_stages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    stageName: text("stage_name").notNull(),
    status: stageStatusEnum("status").notNull(),
    startDate: date("start_date"),
    dueDate: date("due_date"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    assignedTo: uuid("assigned_to").references(() => users.id),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [index("project_stages_project_id_idx").on(table.projectId)],
);

export const dailyUpdates = pgTable(
  "daily_updates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    updatedBy: uuid("updated_by").references(() => users.id),
    updateDate: date("update_date").notNull(),
    progressSummary: text("progress_summary").notNull(),
    workCompleted: text("work_completed"),
    issueNotes: text("issue_notes"),
    blockerNotes: text("blocker_notes"),
    nextAction: text("next_action"),
    progressPercentage: integer("progress_percentage"),
    healthStatus: healthStatusEnum("health_status"),
    ...timestamps,
  },
  (table) => [
    index("daily_updates_project_update_date_idx").on(
      table.projectId,
      table.updateDate,
    ),
  ],
);

export const designTasks = pgTable(
  "design_tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    designerId: uuid("designer_id").references(() => users.id),
    taskName: text("task_name").notNull(),
    designType: designTypeEnum("design_type").notNull(),
    status: designTaskStatusEnum("status").notNull(),
    approvalStatus: approvalStatusEnum("approval_status")
      .default("not_submitted")
      .notNull(),
    revisionCount: integer("revision_count").default(0).notNull(),
    dueDate: date("due_date"),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [
    index("design_tasks_project_status_idx").on(table.projectId, table.status),
  ],
);

export const vendors = pgTable("vendors", {
  id: uuid("id").defaultRandom().primaryKey(),
  vendorName: text("vendor_name").notNull(),
  contactPerson: text("contact_person"),
  phone: text("phone"),
  category: text("category"),
  notes: text("notes"),
  ...timestamps,
});

export const materials = pgTable(
  "materials",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    materialName: text("material_name").notNull(),
    category: text("category"),
    vendorId: uuid("vendor_id").references(() => vendors.id),
    status: materialStatusEnum("status").notNull(),
    urgencyLevel: priorityEnum("urgency_level").default("medium").notNull(),
    quantity: numeric("quantity", { precision: 12, scale: 2 }),
    unit: text("unit"),
    etaDate: date("eta_date"),
    issueNotes: text("issue_notes"),
    updatedBy: uuid("updated_by").references(() => users.id),
    ...timestamps,
  },
  (table) => [
    index("materials_project_status_idx").on(table.projectId, table.status),
    index("materials_urgency_level_idx").on(table.urgencyLevel),
  ],
);

export const leads = pgTable(
  "leads",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    leadName: text("lead_name").notNull(),
    phone: text("phone"),
    email: text("email"),
    source: text("source"),
    interest: text("interest"),
    estimatedProjectValue: numeric("estimated_project_value", {
      precision: 14,
      scale: 2,
    }),
    status: leadStatusEnum("status").default("new").notNull(),
    assignedSalesId: uuid("assigned_sales_id").references(() => users.id),
    nextFollowUpDate: date("next_follow_up_date"),
    notes: text("notes"),
    convertedProjectId: uuid("converted_project_id").references(
      () => projects.id,
    ),
    ...timestamps,
  },
  (table) => [index("leads_status_idx").on(table.status)],
);

export const contentAssets = pgTable(
  "content_assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    roomArea: text("room_area"),
    visualStatus: text("visual_status"),
    footageStatus: text("footage_status"),
    contentOpportunity: contentOpportunityEnum("content_opportunity"),
    suggestedAngle: text("suggested_angle"),
    contentStatus: contentStatusEnum("content_status")
      .default("not_ready")
      .notNull(),
    assignedTo: uuid("assigned_to").references(() => users.id),
    publishUrl: text("publish_url"),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [
    index("content_assets_project_content_status_idx").on(
      table.projectId,
      table.contentStatus,
    ),
  ],
);

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").references((): AnyPgColumn => projects.id),
    relatedType: relatedTypeEnum("related_type").notNull(),
    relatedId: uuid("related_id"),
    fileName: text("file_name").notNull(),
    fileType: text("file_type"),
    mimeType: text("mime_type"),
    fileSize: integer("file_size"),
    imagekitFileId: text("imagekit_file_id").notNull(),
    imagekitUrl: text("imagekit_url").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    folderPath: text("folder_path"),
    uploadedBy: uuid("uploaded_by").references((): AnyPgColumn => users.id),
    ...timestamps,
  },
  (table) => [
    index("media_assets_project_id_idx").on(table.projectId),
    index("media_assets_related_idx").on(table.relatedType, table.relatedId),
  ],
);

export const aiRuns = pgTable(
  "ai_runs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    agentName: text("agent_name").notNull(),
    workflowName: text("workflow_name").notNull(),
    modelProvider: text("model_provider").notNull(),
    modelName: text("model_name").notNull(),
    reasoningLevel: text("reasoning_level").notNull(),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    totalTokens: integer("total_tokens"),
    status: aiRunStatusEnum("status").notNull(),
    errorMessage: text("error_message"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("ai_runs_agent_workflow_created_at_idx").on(
      table.agentName,
      table.workflowName,
      table.createdAt,
    ),
  ],
);

export const aiSummaries = pgTable(
  "ai_summaries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    summaryType: summaryTypeEnum("summary_type").notNull(),
    summaryDate: date("summary_date").notNull(),
    generatedForUserId: uuid("generated_for_user_id").references(
      () => users.id,
    ),
    content: text("content").notNull(),
    sourceData: jsonb("source_data"),
    aiRunId: uuid("ai_run_id").references(() => aiRuns.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("ai_summaries_type_date_idx").on(
      table.summaryType,
      table.summaryDate,
    ),
  ],
);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => projects.id),
    title: text("title").notNull(),
    message: text("message").notNull(),
    type: notificationTypeEnum("type"),
    isRead: boolean("is_read").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("notifications_user_id_idx").on(table.userId),
    index("notifications_project_id_idx").on(table.projectId),
  ],
);

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
  userInvites: many(userInvites),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  avatar: one(mediaAssets, {
    fields: [users.avatarMediaId],
    references: [mediaAssets.id],
  }),
  managedProjects: many(projects, { relationName: "projectManager" }),
  designedProjects: many(projects, { relationName: "projectDesigner" }),
  dailyUpdates: many(dailyUpdates),
  designTasks: many(designTasks),
  materials: many(materials),
  leads: many(leads),
  contentAssets: many(contentAssets),
  mediaAssets: many(mediaAssets),
  aiSummaries: many(aiSummaries),
  aiRuns: many(aiRuns),
  notifications: many(notifications),
  sentInvites: many(userInvites),
}));

export const userInvitesRelations = relations(userInvites, ({ one }) => ({
  role: one(roles, {
    fields: [userInvites.roleId],
    references: [roles.id],
  }),
  inviter: one(users, {
    fields: [userInvites.invitedBy],
    references: [users.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  projectManager: one(users, {
    fields: [projects.pmId],
    references: [users.id],
    relationName: "projectManager",
  }),
  designer: one(users, {
    fields: [projects.designerId],
    references: [users.id],
    relationName: "projectDesigner",
  }),
  stages: many(projectStages),
  dailyUpdates: many(dailyUpdates),
  designTasks: many(designTasks),
  materials: many(materials),
  leads: many(leads),
  contentAssets: many(contentAssets),
  mediaAssets: many(mediaAssets),
  notifications: many(notifications),
}));

export const projectStagesRelations = relations(projectStages, ({ one }) => ({
  project: one(projects, {
    fields: [projectStages.projectId],
    references: [projects.id],
  }),
  assignee: one(users, {
    fields: [projectStages.assignedTo],
    references: [users.id],
  }),
}));

export const dailyUpdatesRelations = relations(dailyUpdates, ({ one }) => ({
  project: one(projects, {
    fields: [dailyUpdates.projectId],
    references: [projects.id],
  }),
  updater: one(users, {
    fields: [dailyUpdates.updatedBy],
    references: [users.id],
  }),
}));

export const designTasksRelations = relations(designTasks, ({ one }) => ({
  project: one(projects, {
    fields: [designTasks.projectId],
    references: [projects.id],
  }),
  designer: one(users, {
    fields: [designTasks.designerId],
    references: [users.id],
  }),
}));

export const vendorsRelations = relations(vendors, ({ many }) => ({
  materials: many(materials),
}));

export const materialsRelations = relations(materials, ({ one }) => ({
  project: one(projects, {
    fields: [materials.projectId],
    references: [projects.id],
  }),
  vendor: one(vendors, {
    fields: [materials.vendorId],
    references: [vendors.id],
  }),
  updater: one(users, {
    fields: [materials.updatedBy],
    references: [users.id],
  }),
}));

export const leadsRelations = relations(leads, ({ one }) => ({
  assignedSales: one(users, {
    fields: [leads.assignedSalesId],
    references: [users.id],
  }),
  convertedProject: one(projects, {
    fields: [leads.convertedProjectId],
    references: [projects.id],
  }),
}));

export const contentAssetsRelations = relations(contentAssets, ({ one }) => ({
  project: one(projects, {
    fields: [contentAssets.projectId],
    references: [projects.id],
  }),
  assignee: one(users, {
    fields: [contentAssets.assignedTo],
    references: [users.id],
  }),
}));

export const mediaAssetsRelations = relations(mediaAssets, ({ one }) => ({
  project: one(projects, {
    fields: [mediaAssets.projectId],
    references: [projects.id],
  }),
  uploader: one(users, {
    fields: [mediaAssets.uploadedBy],
    references: [users.id],
  }),
}));

export const aiRunsRelations = relations(aiRuns, ({ one, many }) => ({
  creator: one(users, {
    fields: [aiRuns.createdBy],
    references: [users.id],
  }),
  summaries: many(aiSummaries),
}));

export const aiSummariesRelations = relations(aiSummaries, ({ one }) => ({
  generatedForUser: one(users, {
    fields: [aiSummaries.generatedForUserId],
    references: [users.id],
  }),
  aiRun: one(aiRuns, {
    fields: [aiSummaries.aiRunId],
    references: [aiRuns.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [notifications.projectId],
    references: [projects.id],
  }),
}));
