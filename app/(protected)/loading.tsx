import { PageContainer } from "@/components/layout/page-container";
import {
  LoadingMetricGrid,
  LoadingTableBlock,
} from "@/components/shared/data-table";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProtectedLoading() {
  return (
    <PageContainer className="max-w-none">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-[32rem] max-w-full" />
        </div>
        <Skeleton className="h-9 w-36" />
      </div>
      <LoadingMetricGrid />
      <LoadingTableBlock />
    </PageContainer>
  );
}

