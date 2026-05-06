import { Badge } from "@/components/ui/badge";

import {
  dailyUpdateHealthBadgeVariants,
  dailyUpdateHealthLabels,
  type DailyUpdateHealthStatus,
} from "../constants";

export function DailyUpdateHealthBadge({
  healthStatus,
}: {
  healthStatus: DailyUpdateHealthStatus | null;
}) {
  if (!healthStatus) {
    return <Badge variant="outline">Not set</Badge>;
  }

  return (
    <Badge variant={dailyUpdateHealthBadgeVariants[healthStatus]}>
      {dailyUpdateHealthLabels[healthStatus]}
    </Badge>
  );
}

