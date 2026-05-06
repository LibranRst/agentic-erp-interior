import { Badge } from "@/components/ui/badge";

import {
  budgetWarningLabels,
  contentReadyLabels,
  projectHealthBadgeVariants,
  projectHealthLabels,
  projectPriorityBadgeVariants,
  projectPriorityLabels,
  projectStatusBadgeVariants,
  projectStatusLabels,
  type BudgetWarningStatus,
  type ContentReadyStatus,
  type ProjectHealthStatus,
  type ProjectPriority,
  type ProjectStatus,
} from "../constants";

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge variant={projectStatusBadgeVariants[status]}>
      {projectStatusLabels[status]}
    </Badge>
  );
}

export function ProjectHealthBadge({
  healthStatus,
}: {
  healthStatus: ProjectHealthStatus;
}) {
  return (
    <Badge variant={projectHealthBadgeVariants[healthStatus]}>
      {projectHealthLabels[healthStatus]}
    </Badge>
  );
}

export function ProjectPriorityBadge({
  priority,
}: {
  priority: ProjectPriority;
}) {
  return (
    <Badge variant={projectPriorityBadgeVariants[priority]}>
      {projectPriorityLabels[priority]}
    </Badge>
  );
}

export function BudgetWarningBadge({
  status,
}: {
  status: BudgetWarningStatus;
}) {
  return (
    <Badge variant={status === "none" ? "outline" : "destructive"}>
      {budgetWarningLabels[status]}
    </Badge>
  );
}

export function ContentReadyBadge({
  status,
}: {
  status: ContentReadyStatus;
}) {
  return (
    <Badge variant={status === "not_ready" ? "outline" : "secondary"}>
      {contentReadyLabels[status]}
    </Badge>
  );
}
