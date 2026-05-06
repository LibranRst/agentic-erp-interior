import { Badge } from "@/components/ui/badge";

import {
  designApprovalStatusBadgeVariants,
  designApprovalStatusLabels,
  designTaskStatusBadgeVariants,
  designTaskStatusLabels,
  designTypeLabels,
  type DesignApprovalStatus,
  type DesignTaskStatus,
  type DesignType,
} from "../constants";

export function DesignTypeBadge({ designType }: { designType: DesignType }) {
  return <Badge variant="outline">{designTypeLabels[designType]}</Badge>;
}

export function DesignTaskStatusBadge({
  status,
}: {
  status: DesignTaskStatus;
}) {
  return (
    <Badge variant={designTaskStatusBadgeVariants[status]}>
      {designTaskStatusLabels[status]}
    </Badge>
  );
}

export function DesignApprovalStatusBadge({
  approvalStatus,
}: {
  approvalStatus: DesignApprovalStatus;
}) {
  return (
    <Badge variant={designApprovalStatusBadgeVariants[approvalStatus]}>
      {designApprovalStatusLabels[approvalStatus]}
    </Badge>
  );
}
