import Link from "next/link"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import type { RecommendedAction } from "./types"

const priorityVariant: Record<RecommendedAction["priority"], "destructive" | "secondary"> = {
  "Prioritas Tinggi": "destructive",
  "Prioritas Menengah": "secondary",
}

function NextActionsCard({ actions }: { actions: readonly RecommendedAction[] }) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle>Recommended Actions</CardTitle>
          <p className="text-xs text-muted-foreground">
            Follow-up paling penting berdasarkan kondisi operasional hari ini.
          </p>
        </div>
        <CardAction>
          <Button asChild variant="outline" size="sm" className="gap-1 text-xs">
            <Link href="/dashboard">
              Lihat semua rekomendasi
              <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-3.5" />
            </Link>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {actions.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Belum ada rekomendasi prioritas. Data operasional hari ini terlihat aman.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {actions.map((action) => {
              const content = (
                <>
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <HugeiconsIcon icon={action.icon} strokeWidth={2} className="size-4" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-2">
                    <span className="block truncate text-sm font-medium">{action.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">{action.helper}</span>
                    <span className="flex min-w-0 items-center justify-between gap-2">
                      <Badge variant={priorityVariant[action.priority]} className="shrink-0">
                        {action.priority}
                      </Badge>
                      <span className="flex min-w-0 items-center gap-1 truncate text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground">
                        <span className="truncate">Lihat detail</span>
                        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-3.5 shrink-0" />
                      </span>
                    </span>
                  </span>
                </>
              )

              if (action.href) {
                return (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="group flex items-start gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:bg-muted/40"
                  >
                    {content}
                  </Link>
                )
              }

              return (
                <button
                  key={action.title}
                  type="button"
                  className="group flex items-start gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:bg-muted/40"
                >
                  {content}
                </button>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { NextActionsCard }
