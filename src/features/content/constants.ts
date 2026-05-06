type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export const CONTENT_STATUSES = [
  "not_ready",
  "ready_to_shoot",
  "footage_available",
  "editing",
  "ready_to_publish",
  "published",
  "archived",
] as const;

export const CONTENT_OPPORTUNITIES = [
  "before_after",
  "cinematic_showcase",
  "detail_craftsmanship",
  "problem_solution",
  "client_story",
  "design_tips",
  "material_highlight",
  "storage_solution",
  "luxury_feature",
] as const;

export const CONTENT_VISUAL_STATUSES = [
  "render_available",
  "progress_visual_available",
  "final_visual_available",
] as const;

export const CONTENT_FOOTAGE_STATUSES = [
  "needs_shooting",
  "footage_available",
] as const;

export const CONTENT_READY_DASHBOARD_STATUSES = [
  "ready_to_shoot",
  "footage_available",
  "ready_to_publish",
] as const satisfies readonly ContentStatus[];

export type ContentStatus = (typeof CONTENT_STATUSES)[number];
export type ContentOpportunity = (typeof CONTENT_OPPORTUNITIES)[number];
export type ContentVisualStatus = (typeof CONTENT_VISUAL_STATUSES)[number];
export type ContentFootageStatus = (typeof CONTENT_FOOTAGE_STATUSES)[number];

export const contentStatusLabels = {
  not_ready: "Not Ready",
  ready_to_shoot: "Ready to Shoot",
  footage_available: "Footage Available",
  editing: "Editing",
  ready_to_publish: "Ready to Publish",
  published: "Published",
  archived: "Archived",
} satisfies Record<ContentStatus, string>;

export const contentOpportunityLabels = {
  before_after: "Before / After",
  cinematic_showcase: "Cinematic Showcase",
  detail_craftsmanship: "Detail Craftsmanship",
  problem_solution: "Problem / Solution",
  client_story: "Client Story",
  design_tips: "Design Tips",
  material_highlight: "Material Highlight",
  storage_solution: "Storage Solution",
  luxury_feature: "Luxury Feature",
} satisfies Record<ContentOpportunity, string>;

export const contentVisualStatusLabels = {
  render_available: "Render Available",
  progress_visual_available: "Progress Visual Available",
  final_visual_available: "Final Visual Available",
} satisfies Record<ContentVisualStatus, string>;

export const contentFootageStatusLabels = {
  needs_shooting: "Needs Shooting",
  footage_available: "Footage Available",
} satisfies Record<ContentFootageStatus, string>;

export const contentStatusBadgeVariants = {
  not_ready: "outline",
  ready_to_shoot: "default",
  footage_available: "default",
  editing: "secondary",
  ready_to_publish: "default",
  published: "secondary",
  archived: "outline",
} satisfies Record<ContentStatus, BadgeVariant>;

export const contentReadinessRank = {
  not_ready: 0,
  ready_to_shoot: 1,
  footage_available: 2,
  editing: 3,
  ready_to_publish: 4,
  published: 5,
  archived: -1,
} satisfies Record<ContentStatus, number>;
