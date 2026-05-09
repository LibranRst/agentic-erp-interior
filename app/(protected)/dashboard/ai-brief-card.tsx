import Link from "next/link"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { GenerateAiSummaryButton } from "@/src/features/ai-summary/components/generate-ai-summary-button"
import type { AiSummaryWithRun } from "@/src/features/ai-summary/queries"

import { aiBriefIcon } from "./constants"
import type { RecommendedAction } from "./types"

function AiBriefCard({
  actions,
  canGenerateSummary,
  insights,
  summary,
}: {
  actions: readonly RecommendedAction[]
  canGenerateSummary: boolean
  insights: readonly string[]
  summary: AiSummaryWithRun | null
}) {
  return (
    <Card className="h-full">
      <CardHeader className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            <HugeiconsIcon icon={aiBriefIcon} strokeWidth={2} className="size-4" />
          </div>
          <CardTitle>AI Brief</CardTitle>
        </div>
        {summary ? <Badge variant="secondary">Hari ini</Badge> : null}
      </CardHeader>

      <CardContent className="flex h-full flex-col gap-3">
        <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">
          {summary?.content ?? "Belum ada AI brief hari ini. Generate ringkasan untuk membaca kondisi operasional terbaru."}
        </p>

        <ul className="space-y-2.5 text-sm text-muted-foreground">
          {insights.map((insight) => (
            <li key={insight} className="flex gap-2.5">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              <span>{insight}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto space-y-2">
          {!summary && canGenerateSummary ? <GenerateAiSummaryButton /> : null}
          {actions.map((action) => {
            const content = (
              <>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <HugeiconsIcon icon={action.icon} strokeWidth={2} className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">
                    {action.title}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {action.helper}
                  </span>
                </span>
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  strokeWidth={2}
                  className="size-4 shrink-0 text-muted-foreground"
                />
              </>
            )

            if (action.href) {
              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:bg-muted/50"
                >
                  {content}
                </Link>
              )
            }

            return (
              <button
                key={action.title}
                type="button"
                className="flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:bg-muted/50"
              >
                {content}
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export { AiBriefCard }
