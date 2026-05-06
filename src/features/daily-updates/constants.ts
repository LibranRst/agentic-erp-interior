import {
  PROJECT_HEALTH_STATUSES,
  projectHealthBadgeVariants,
  projectHealthLabels,
  type ProjectHealthStatus,
} from "@/src/features/projects/constants";

export const DAILY_UPDATE_HEALTH_STATUSES = PROJECT_HEALTH_STATUSES;

export type DailyUpdateHealthStatus = ProjectHealthStatus;

export const dailyUpdateHealthLabels = projectHealthLabels;
export const dailyUpdateHealthBadgeVariants = projectHealthBadgeVariants;

