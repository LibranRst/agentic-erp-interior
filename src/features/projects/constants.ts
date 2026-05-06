type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export const PROJECT_STATUSES = [
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
] as const;

export const PROJECT_HEALTH_STATUSES = [
  "healthy",
  "needs_attention",
  "urgent",
  "blocked",
  "delayed",
] as const;

export const PROJECT_PRIORITIES = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export const BUDGET_WARNING_STATUSES = [
  "none",
  "watch",
  "risk",
  "over_budget",
] as const;

export const CONTENT_READY_STATUSES = [
  "not_ready",
  "ready_to_shoot",
  "footage_available",
  "editing",
  "ready_to_publish",
  "published",
  "archived",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type ProjectHealthStatus = (typeof PROJECT_HEALTH_STATUSES)[number];
export type ProjectPriority = (typeof PROJECT_PRIORITIES)[number];
export type BudgetWarningStatus = (typeof BUDGET_WARNING_STATUSES)[number];
export type ContentReadyStatus = (typeof CONTENT_READY_STATUSES)[number];

export const projectStatusLabels = {
  lead_converted: "Lead Converted",
  survey: "Survey",
  concept_design: "Concept Design",
  design_revision: "Design Revision",
  ded_progress: "DED Progress",
  production: "Production",
  installation: "Installation",
  finishing: "Finishing",
  handover: "Handover",
  completed: "Completed",
  on_hold: "On Hold",
  cancelled: "Cancelled",
} satisfies Record<ProjectStatus, string>;

export const projectHealthLabels = {
  healthy: "Healthy",
  needs_attention: "Needs Attention",
  urgent: "Urgent",
  blocked: "Blocked",
  delayed: "Delayed",
} satisfies Record<ProjectHealthStatus, string>;

export const projectPriorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
} satisfies Record<ProjectPriority, string>;

export const budgetWarningLabels = {
  none: "None",
  watch: "Watch",
  risk: "Risk",
  over_budget: "Over Budget",
} satisfies Record<BudgetWarningStatus, string>;

export const contentReadyLabels = {
  not_ready: "Not Ready",
  ready_to_shoot: "Ready to Shoot",
  footage_available: "Footage Available",
  editing: "Editing",
  ready_to_publish: "Ready to Publish",
  published: "Published",
  archived: "Archived",
} satisfies Record<ContentReadyStatus, string>;

export const projectStatusBadgeVariants = {
  lead_converted: "outline",
  survey: "secondary",
  concept_design: "secondary",
  design_revision: "secondary",
  ded_progress: "secondary",
  production: "default",
  installation: "default",
  finishing: "default",
  handover: "outline",
  completed: "secondary",
  on_hold: "outline",
  cancelled: "destructive",
} satisfies Record<ProjectStatus, BadgeVariant>;

export const projectHealthBadgeVariants = {
  healthy: "secondary",
  needs_attention: "outline",
  urgent: "destructive",
  blocked: "destructive",
  delayed: "destructive",
} satisfies Record<ProjectHealthStatus, BadgeVariant>;

export const projectPriorityBadgeVariants = {
  low: "outline",
  medium: "secondary",
  high: "outline",
  critical: "destructive",
} satisfies Record<ProjectPriority, BadgeVariant>;

export const activeProjectStatuses = PROJECT_STATUSES.filter(
  (status) => !["completed", "cancelled"].includes(status),
);

export const designProjectStatuses = [
  "concept_design",
  "design_revision",
  "ded_progress",
] as const satisfies readonly ProjectStatus[];
