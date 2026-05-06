import { Badge } from "@/components/ui/badge";

import {
  leadStatusBadgeVariants,
  leadStatusLabels,
  type LeadStatus,
} from "../constants";

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge variant={leadStatusBadgeVariants[status]}>
      {leadStatusLabels[status]}
    </Badge>
  );
}
