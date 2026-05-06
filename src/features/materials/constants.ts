type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export const MATERIAL_STATUSES = [
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
] as const;

export const MATERIAL_URGENCY_LEVELS = [
  "low",
  "medium",
  "high",
  "critical",
] as const;

export const MATERIAL_ISSUE_STATUSES = [
  "delayed",
  "problem",
] as const satisfies readonly MaterialStatus[];

export const MATERIAL_WARNING_URGENCY_LEVELS = [
  "high",
  "critical",
] as const satisfies readonly MaterialUrgencyLevel[];

export type MaterialStatus = (typeof MATERIAL_STATUSES)[number];
export type MaterialUrgencyLevel = (typeof MATERIAL_URGENCY_LEVELS)[number];

export const materialStatusLabels = {
  planned: "Planned",
  requested: "Requested",
  ordered: "Ordered",
  in_production: "In Production",
  in_delivery: "In Delivery",
  arrived: "Arrived",
  installed: "Installed",
  delayed: "Delayed",
  problem: "Problem",
  cancelled: "Cancelled",
} satisfies Record<MaterialStatus, string>;

export const materialUrgencyLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
} satisfies Record<MaterialUrgencyLevel, string>;

export const materialStatusBadgeVariants = {
  planned: "outline",
  requested: "outline",
  ordered: "secondary",
  in_production: "secondary",
  in_delivery: "default",
  arrived: "secondary",
  installed: "secondary",
  delayed: "destructive",
  problem: "destructive",
  cancelled: "outline",
} satisfies Record<MaterialStatus, BadgeVariant>;

export const materialUrgencyBadgeVariants = {
  low: "outline",
  medium: "secondary",
  high: "default",
  critical: "destructive",
} satisfies Record<MaterialUrgencyLevel, BadgeVariant>;
