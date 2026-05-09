import type { HugeiconsIcon } from "@hugeicons/react"

import type { AiSummaryWithRun } from "@/src/features/ai-summary/queries"
import type { ContentReadyProject } from "@/src/features/content/queries"
import type { DailyUpdateListItem } from "@/src/features/daily-updates/queries"
import type { MaterialListItem } from "@/src/features/materials/queries"
import type { ProjectHealthOverviewItem } from "@/src/features/projects/queries"

import type { MetricTone } from "./constants"

type DashboardIcon = React.ComponentProps<typeof HugeiconsIcon>["icon"]

export type MetricTrend = "up" | "down" | "neutral"

export type OwnerMetric = {
  label: string
  value: string
  delta: string
  trend: MetricTrend
  tone: MetricTone
  icon: DashboardIcon
}

export type HealthChartPoint = {
  dayLabel: string
  onTrack: number
  atRisk: number
  delayed: number
}

export type RecommendedAction = {
  title: string
  helper: string
  priority: "Prioritas Tinggi" | "Prioritas Menengah"
  icon: DashboardIcon
  href?: string
}

export type DashboardOverviewData = {
  aiSummary: AiSummaryWithRun | null
  canGenerateAiSummary: boolean
  aiInsights: readonly string[]
  aiActions: readonly RecommendedAction[]
  healthChartData: readonly HealthChartPoint[]
  projectHealthRows: readonly ProjectHealthOverviewItem[]
  updates: readonly DailyUpdateListItem[]
  updatesTotal: number
  materialIssues: readonly MaterialListItem[]
  materialTotal: number
  salesSnapshot: {
    totalLeads: string
    delta: string
    rows: readonly { label: string; value: string }[]
  }
  contentReadyProjects: readonly ContentReadyProject[]
  contentTotal: number
  recommendedActions: readonly RecommendedAction[]
}
