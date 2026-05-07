import { HugeiconsIcon } from "@hugeicons/react";
import { SearchRemoveIcon } from "@hugeicons/core-free-icons";
import type * as React from "react";

import { cn } from "@/lib/utils";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";

function DataTableShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-xl border bg-card shadow-xs",
        "[&_[data-slot=table-container]]:max-w-full",
        "[&_[data-slot=table-container]]:overscroll-x-contain",
        "[&_[data-slot=table]]:min-w-max",
        "[&_[data-slot=table-head]]:bg-muted/40",
        "[&_[data-slot=table-head]]:text-xs [&_[data-slot=table-head]]:uppercase [&_[data-slot=table-head]]:tracking-normal",
        "[&_[data-slot=table-row]]:hover:bg-muted/40",
        className,
      )}
    >
      {children}
    </div>
  );
}

function RecordEmptyState({
  title,
  description,
  className,
}: {
  title: string;
  description: string;
  className?: string;
}) {
  return (
    <Empty
      className={cn(
        "rounded-xl border border-dashed bg-muted/20 p-8",
        className,
      )}
    >
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <HugeiconsIcon icon={SearchRemoveIcon} strokeWidth={2} />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function LoadingMetricGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-xl border bg-card p-4 shadow-xs">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-3 h-3 w-40" />
          <Skeleton className="mt-6 h-8 w-20" />
        </div>
      ))}
    </div>
  );
}

function LoadingTableBlock({ rows = 6 }: { rows?: number }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-xs">
      <Skeleton className="h-5 w-44" />
      <Skeleton className="mt-2 h-4 w-72 max-w-full" />
      <div className="mt-5 flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
    </div>
  );
}

export {
  DataTableShell,
  LoadingMetricGrid,
  LoadingTableBlock,
  RecordEmptyState,
};
