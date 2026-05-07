"use client"

import { useEffect } from "react"

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
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle>Something needs attention</CardTitle>
          <CardDescription>
            The app could not load this protected route. Check the environment setup and try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
            {getErrorMessage(error)}
          </div>
          <Button type="button" onClick={reset}>
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
