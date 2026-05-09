import Link from "next/link"
import {
  Alert02Icon,
  ArrowRight01Icon,
  Task01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  contentStatusBadgeVariants,
  contentStatusLabels,
} from "@/src/features/content/constants"
import type { ContentReadyProject } from "@/src/features/content/queries"
import {
  dailyUpdateHealthBadgeVariants,
  dailyUpdateHealthLabels,
} from "@/src/features/daily-updates/constants"
import type { DailyUpdateListItem } from "@/src/features/daily-updates/queries"
import {
  materialUrgencyBadgeVariants,
  materialUrgencyLabels,
} from "@/src/features/materials/constants"
import type { MaterialListItem } from "@/src/features/materials/queries"

function CardLink({ href }: { href: string }) {
  return (
    <CardAction className="shrink-0">
      <Button asChild variant="link" size="sm" className="h-auto px-0 text-xs">
        <Link href={href}>Lihat semua</Link>
      </Button>
    </CardAction>
  )
}

function RowTwoCards({
  contentReadyProjects,
  contentTotal,
  materialIssues,
  materialTotal,
  salesSnapshot,
  updates,
  updatesTotal,
}: {
  contentReadyProjects: readonly ContentReadyProject[]
  contentTotal: number
  materialIssues: readonly MaterialListItem[]
  materialTotal: number
  salesSnapshot: {
    totalLeads: string
    delta: string
    rows: readonly { label: string; value: string }[]
  }
  updates: readonly DailyUpdateListItem[]
  updatesTotal: number
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card size="sm" className="h-full">
        <CardHeader className="flex-row items-center justify-between gap-3">
          <CardTitle className="min-w-0 truncate">Updates</CardTitle>
          <CardLink href="/daily-updates" />
        </CardHeader>
        <CardContent className="grid flex-1 grid-rows-2 divide-y divide-border">
          {updates.length === 0 ? (
            <div className="col-span-full row-span-full flex items-center justify-center px-4 py-8 text-center text-sm text-muted-foreground">
              Belum ada update terbaru.
            </div>
          ) : updates.slice(0, 2).map((item) => (
            <Link
              key={item.id}
              href={`/projects/${item.project.id}`}
              className="group -mx-4 flex w-[calc(100%+2rem)] overflow-hidden gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
            >
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <HugeiconsIcon icon={Task01Icon} strokeWidth={2} className="size-4" />
              </div>
              <div className="min-w-0 basis-0 flex-1 overflow-hidden space-y-1">
                <div className="truncate text-sm font-medium">
                  {item.project.projectName}
                </div>
                <div className="truncate text-xs text-muted-foreground">
                  {item.project.clientName}
                </div>
                <div className="line-clamp-2 text-xs text-muted-foreground">
                  {item.issueNotes || item.blockerNotes || item.progressSummary}
                </div>
                <div className="flex min-w-0">
                  <Badge variant={dailyUpdateHealthBadgeVariants[item.healthStatus ?? "healthy"]} className="shrink-0">
                    {dailyUpdateHealthLabels[item.healthStatus ?? "healthy"]}
                  </Badge>
                </div>
              </div>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                strokeWidth={2}
                className="mt-1 size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
              />
            </Link>
          ))}
        </CardContent>
        <CardFooter className="justify-between border-t pt-3 text-sm">
          <span className="min-w-0 truncate text-muted-foreground">Butuh Follow-up</span>
          <Badge variant="outline" className="shrink-0">{updatesTotal}</Badge>
        </CardFooter>
      </Card>

      <Card size="sm" className="h-full">
        <CardHeader className="flex-row items-center justify-between gap-3">
          <CardTitle className="min-w-0 truncate">Material</CardTitle>
          <CardLink href="/materials" />
        </CardHeader>
        <CardContent className="grid flex-1 grid-rows-2 divide-y divide-border">
          {materialIssues.length === 0 ? (
            <div className="col-span-full row-span-full flex items-center justify-center px-4 py-8 text-center text-sm text-muted-foreground">
              Belum ada material alert.
            </div>
          ) : materialIssues.slice(0, 2).map((item) => (
            <Link
              key={item.id}
              href={`/projects/${item.project.id}`}
              className="group -mx-4 flex w-[calc(100%+2rem)] items-start overflow-hidden gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
            >
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <HugeiconsIcon icon={Alert02Icon} strokeWidth={2} className="size-4" />
              </div>
              <div className="min-w-0 basis-0 flex-1 overflow-hidden space-y-1">
                <div className="truncate text-sm font-medium">{item.materialName}</div>
                <div className="truncate text-xs text-muted-foreground">
                  Vendor: {item.vendor?.vendorName ?? "Belum ditentukan"}
                </div>
                <div className="truncate text-xs font-medium text-destructive">
                  {item.issueNotes ?? item.status}
                </div>
                <div className="flex min-w-0">
                  <Badge variant={materialUrgencyBadgeVariants[item.urgencyLevel]} className="shrink-0">
                    {materialUrgencyLabels[item.urgencyLevel]}
                  </Badge>
                </div>
              </div>
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                strokeWidth={2}
                className="mt-1 size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
              />
            </Link>
          ))}
        </CardContent>
        <CardFooter className="justify-between border-t pt-3 text-sm">
          <span className="min-w-0 truncate text-muted-foreground">Total Alert</span>
          <Badge variant="outline" className="shrink-0">{materialTotal}</Badge>
        </CardFooter>
      </Card>

      <Card size="sm" className="h-full">
        <CardHeader className="flex-row items-center justify-between gap-3">
          <CardTitle className="min-w-0 truncate">Sales</CardTitle>
          <CardLink href="/sales" />
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-end justify-between gap-3 border-b pb-3">
            <div className="min-w-0">
              <div className="truncate text-xs text-muted-foreground">Total Leads</div>
              <div className="text-3xl font-semibold">{salesSnapshot.totalLeads}</div>
            </div>
            <div className="shrink-0 text-xs font-medium text-primary">{salesSnapshot.delta}</div>
          </div>
          <div className="space-y-2">
            {salesSnapshot.rows.map((row) => (
              <Link
                key={row.label}
                href="/sales"
                className="group flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted/40"
              >
                <span className="min-w-0 truncate text-muted-foreground">{row.label}</span>
                <span className="flex shrink-0 items-center gap-1 font-medium">
                  {row.value}
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    strokeWidth={2}
                    className="size-3.5 text-muted-foreground transition-colors group-hover:text-foreground"
                  />
                </span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card size="sm" className="h-full">
        <CardHeader className="flex-row items-center justify-between gap-3">
          <CardTitle className="min-w-0 truncate">Content</CardTitle>
          <CardLink href="/content" />
        </CardHeader>
        <CardContent className="grid flex-1 grid-rows-3 divide-y divide-border">
          {contentReadyProjects.length === 0 ? (
            <div className="col-span-full row-span-full flex items-center justify-center px-4 py-8 text-center text-sm text-muted-foreground">
              Belum ada konten siap produksi.
            </div>
          ) : contentReadyProjects.slice(0, 3).map((item) => {
            const media = item.mediaAssets[0]

            return (
              <Link
                key={item.id}
                href={`/projects/${item.project.id}`}
                className="group -mx-4 flex w-[calc(100%+2rem)] overflow-hidden gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
              >
                <div
                  className="size-11 shrink-0 rounded-lg bg-muted bg-cover bg-center"
                  style={{
                    backgroundImage: media?.thumbnailUrl || media?.imagekitUrl
                      ? `url(${media.thumbnailUrl ?? media.imagekitUrl})`
                      : undefined,
                  }}
                />
                <div className="min-w-0 basis-0 flex-1 overflow-hidden space-y-1">
                  <div className="truncate text-sm font-medium">
                    {item.project?.projectName ?? item.roomArea}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">{item.roomArea}</div>
                  <div className="flex min-w-0">
                    <Badge variant={contentStatusBadgeVariants[item.contentStatus]} className="shrink-0">
                      {contentStatusLabels[item.contentStatus]}
                    </Badge>
                  </div>
                </div>
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  strokeWidth={2}
                  className="mt-1 size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                />
              </Link>
            )
          })}
        </CardContent>
        <CardFooter className="justify-between border-t pt-3 text-sm">
          <span className="min-w-0 truncate text-muted-foreground">Dalam Pipeline</span>
          <Badge variant="outline" className="shrink-0">{contentTotal}</Badge>
        </CardFooter>
      </Card>
    </div>
  )
}

export { RowTwoCards }
