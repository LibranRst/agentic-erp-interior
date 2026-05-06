import { Badge } from "@/components/ui/badge";

import {
  CONTENT_FOOTAGE_STATUSES,
  CONTENT_VISUAL_STATUSES,
  contentFootageStatusLabels,
  contentOpportunityLabels,
  contentStatusBadgeVariants,
  contentStatusLabels,
  contentVisualStatusLabels,
  type ContentFootageStatus,
  type ContentOpportunity,
  type ContentStatus,
  type ContentVisualStatus,
} from "../constants";

export function ContentStatusBadge({ status }: { status: ContentStatus }) {
  return (
    <Badge variant={contentStatusBadgeVariants[status]}>
      {contentStatusLabels[status]}
    </Badge>
  );
}

export function ContentOpportunityBadge({
  opportunity,
}: {
  opportunity: ContentOpportunity | null;
}) {
  if (!opportunity) {
    return <Badge variant="outline">Not Set</Badge>;
  }

  return <Badge variant="secondary">{contentOpportunityLabels[opportunity]}</Badge>;
}

export function ContentVisualStatusBadge({
  status,
}: {
  status: string | null;
}) {
  if (!status) {
    return <Badge variant="outline">Not Set</Badge>;
  }

  return (
    <Badge variant="outline">
      {isContentVisualStatus(status)
        ? contentVisualStatusLabels[status]
        : formatTextStatus(status)}
    </Badge>
  );
}

export function ContentFootageStatusBadge({
  status,
}: {
  status: string | null;
}) {
  if (!status) {
    return <Badge variant="outline">Not Set</Badge>;
  }

  return (
    <Badge variant="outline">
      {isContentFootageStatus(status)
        ? contentFootageStatusLabels[status]
        : formatTextStatus(status)}
    </Badge>
  );
}

function isContentVisualStatus(value: string): value is ContentVisualStatus {
  return CONTENT_VISUAL_STATUSES.includes(value as ContentVisualStatus);
}

function isContentFootageStatus(value: string): value is ContentFootageStatus {
  return CONTENT_FOOTAGE_STATUSES.includes(value as ContentFootageStatus);
}

function formatTextStatus(value: string) {
  return value
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}
