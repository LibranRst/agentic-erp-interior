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
    <div className="flex min-h-[60vh] items-center justify-center p-4 sm:p-8">
      <Card className="w-full max-w-md">
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
          <p className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
            {getDashboardErrorMessage(error)}
          </p>
          <Button onClick={reset} variant="outline" className="w-full sm:w-fit">
            <HugeiconsIcon
              icon={RefreshIcon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function getDashboardErrorMessage(error: Error & { digest?: string }) {
  if (error.message.includes("DATABASE_URL")) {
    return "DATABASE_URL is missing. Add it to .env.local as documented in docs/ENV_SETUP.md.";
  }

  if (error.digest) {
    return `Error digest: ${error.digest}`;
  }

  return "Dashboard data could not be loaded. Please retry after checking the application environment.";
}
