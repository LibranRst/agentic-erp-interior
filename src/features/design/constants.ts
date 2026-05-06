type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export const DESIGN_TYPES = [
  "layout",
  "concept",
  "render",
  "revision",
  "ded",
  "moodboard",
  "material_spec",
] as const;

export const DESIGN_TASK_STATUSES = [
  "not_started",
  "concept_progress",
  "render_progress",
  "revision",
  "waiting_approval",
  "approved",
  "ded_progress",
  "ded_done",
  "blocked",
] as const;

export const DESIGN_APPROVAL_STATUSES = [
  "not_submitted",
  "waiting_approval",
  "approved",
  "revision_needed",
  "rejected",
] as const;

export const PENDING_DESIGN_TASK_STATUSES = [
  "concept_progress",
  "render_progress",
  "revision",
  "waiting_approval",
  "ded_progress",
  "blocked",
] as const satisfies readonly DesignTaskStatus[];

export type DesignType = (typeof DESIGN_TYPES)[number];
export type DesignTaskStatus = (typeof DESIGN_TASK_STATUSES)[number];
export type DesignApprovalStatus = (typeof DESIGN_APPROVAL_STATUSES)[number];

export const designTypeLabels = {
  layout: "Layout",
  concept: "Concept",
  render: "Render",
  revision: "Revision",
  ded: "DED",
  moodboard: "Moodboard",
  material_spec: "Material Spec",
} satisfies Record<DesignType, string>;

export const designTaskStatusLabels = {
  not_started: "Not Started",
  concept_progress: "Concept Progress",
  render_progress: "Render Progress",
  revision: "Revision",
  waiting_approval: "Waiting Approval",
  approved: "Approved",
  ded_progress: "DED Progress",
  ded_done: "DED Done",
  blocked: "Blocked",
} satisfies Record<DesignTaskStatus, string>;

export const designApprovalStatusLabels = {
  not_submitted: "Not Submitted",
  waiting_approval: "Waiting Approval",
  approved: "Approved",
  revision_needed: "Revision Needed",
  rejected: "Rejected",
} satisfies Record<DesignApprovalStatus, string>;

export const designTaskStatusBadgeVariants = {
  not_started: "outline",
  concept_progress: "secondary",
  render_progress: "secondary",
  revision: "outline",
  waiting_approval: "outline",
  approved: "secondary",
  ded_progress: "default",
  ded_done: "secondary",
  blocked: "destructive",
} satisfies Record<DesignTaskStatus, BadgeVariant>;

export const designApprovalStatusBadgeVariants = {
  not_submitted: "outline",
  waiting_approval: "outline",
  approved: "secondary",
  revision_needed: "destructive",
  rejected: "destructive",
} satisfies Record<DesignApprovalStatus, BadgeVariant>;
