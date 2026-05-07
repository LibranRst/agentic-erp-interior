import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">404</p>
        <h1 className="mt-2 text-2xl font-medium">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This route or record does not exist in the Dekoria MVP workspace.
        </p>
        <Button asChild className="mt-5">
          <Link href="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </main>
  )
}
