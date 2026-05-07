"use client";

import { useEffect } from "react";
import { Alert02Icon, RefreshIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8">
      <Card className="max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={Alert02Icon}
              strokeWidth={2}
              className="text-muted-foreground"
            />
            <CardTitle>Dashboard unavailable</CardTitle>
          </div>
          <CardDescription>
            The owner dashboard could not load. This may be a temporary issue.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            {error.message || "An unexpected error occurred while loading dashboard data."}
          </p>
          <Button onClick={reset} variant="outline">
            <HugeiconsIcon icon={RefreshIcon} strokeWidth={2} />
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
