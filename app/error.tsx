"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"

export default function GlobalError({
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
    <html lang="en" suppressHydrationWarning>
      <body>
        <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
          <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-sm">
            <h1 className="text-xl font-medium">The app could not start</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Check required environment variables in `.env.local`, especially `DATABASE_URL`, then try again.
            </p>
            {error.digest ? (
              <p className="mt-4 rounded-lg border bg-muted/40 p-3 font-mono text-xs text-muted-foreground">
                {error.digest}
              </p>
            ) : null}
            <Button type="button" onClick={reset} className="mt-5">
              Try again
            </Button>
          </div>
        </main>
      </body>
    </html>
  )
}
