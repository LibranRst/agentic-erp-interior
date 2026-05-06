import { Badge } from "@/components/ui/badge";

import {
  materialStatusBadgeVariants,
  materialStatusLabels,
  materialUrgencyBadgeVariants,
  materialUrgencyLabels,
  type MaterialStatus,
  type MaterialUrgencyLevel,
} from "../constants";

export function MaterialStatusBadge({ status }: { status: MaterialStatus }) {
  return (
    <Badge variant={materialStatusBadgeVariants[status]}>
      {materialStatusLabels[status]}
    </Badge>
  );
}

export function MaterialUrgencyBadge({
  urgencyLevel,
}: {
  urgencyLevel: MaterialUrgencyLevel;
}) {
  return (
    <Badge variant={materialUrgencyBadgeVariants[urgencyLevel]}>
      {materialUrgencyLabels[urgencyLevel]}
    </Badge>
  );
}
