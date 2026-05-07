"use client"

import { useEffect } from "react"
import { Alert02Icon, RefreshIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={Alert02Icon}
              strokeWidth={2}
              className="text-muted-foreground"
            />
            <CardTitle>Something needs attention</CardTitle>
          </div>
          <CardDescription>
            The app could not load this protected route. Check the environment setup and try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
            {getErrorMessage(error)}
          </div>
          <Button type="button" onClick={reset} className="w-full sm:w-fit">
            <HugeiconsIcon
              icon={RefreshIcon}
              strokeWidth={2}
              data-icon="inline-start"
            />
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function getErrorMessage(error: Error & { digest?: string }) {
  if (error.message.includes("DATABASE_URL")) {
    return "DATABASE_URL is missing. Add it to .env.local as documented in docs/ENV_SETUP.md."
  }

  if (error.digest) {
    return `Error digest: ${error.digest}`
  }

  return "A runtime error occurred while loading this route."
}
