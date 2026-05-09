import {
  Alert02Icon,
  Calendar03Icon,
  DeliveryTruck02Icon,
  File01Icon,
  Folder01Icon,
  PackageIcon,
  PaintBoardIcon,
  Task01Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons"

import { PageContainer, PageHeader } from "@/components/layout/page-container"
import { getLatestAiSummaryQuery } from "@/src/features/ai-summary/queries"
import { getContentAssetMetrics, getContentReadyProjectsQuery } from "@/src/features/content/queries"
import { getDailyUpdateMetrics, getLatestDailyUpdatesQuery } from "@/src/features/daily-updates/queries"
import { getDesignTaskMetrics, getPendingDesignTasksQuery } from "@/src/features/design/queries"
import { getSalesSnapshotQuery } from "@/src/features/leads/queries"
import { getMaterialIssueMetrics, getMaterialIssuesQuery } from "@/src/features/materials/queries"
import {
  getProjectHealthOverviewQuery,
  getProjectMetrics,
  getUrgentProjectOverviewQuery,
} from "@/src/features/projects/queries"
import { hasPermission, requirePageUser } from "@/src/lib/auth/permissions"

import { dashboardPageIcon } from "./constants"
import { DashboardTabs, OwnerMetricCard } from "./index"
import { getProjectHealthChartData } from "./queries"
import type { DashboardOverviewData, OwnerMetric, RecommendedAction } from "./types"

export default async function DashboardPage() {
  const currentUser = await requirePageUser()

  const [
    projectMetrics,
    dailyUpdateMetrics,
    designMetrics,
    materialMetrics,
    salesSnapshot,
    contentMetrics,
    projectHealthRows,
    urgentProjects,
    latestUpdates,
    pendingDesignTasks,
    materialIssues,
    contentReadyProjects,
    latestAiSummary,
    healthChartData,
  ] = await Promise.all([
    getProjectMetrics(currentUser),
    getDailyUpdateMetrics(currentUser),
    getDesignTaskMetrics(currentUser),
    getMaterialIssueMetrics(),
    getSalesSnapshotQuery(currentUser),
    getContentAssetMetrics(),
    getProjectHealthOverviewQuery(5, currentUser),
    getUrgentProjectOverviewQuery(4, currentUser),
    getLatestDailyUpdatesQuery(2, currentUser),
    getPendingDesignTasksQuery(4, currentUser),
    getMaterialIssuesQuery(2),
    getContentReadyProjectsQuery(3),
    getLatestAiSummaryQuery(),
    getProjectHealthChartData(currentUser),
  ])

  const metrics = buildOwnerMetrics({
    projectMetrics,
    designMetrics,
    materialMetrics,
    salesSnapshot,
  })
  const recommendedActions = buildRecommendedActions({
    urgentProjects,
    materialIssues,
    pendingDesignTasks,
    salesSnapshot,
    contentReadyProjects,
  })

  const overview: DashboardOverviewData = {
    aiSummary: latestAiSummary,
    canGenerateAiSummary: hasPermission(currentUser, "ai_summary:generate"),
    aiInsights: buildAiInsights({
      urgentProjects: projectMetrics.urgent,
      materialCritical: materialMetrics.critical,
      waitingApproval: designMetrics.waitingApproval,
    }),
    aiActions: recommendedActions.slice(0, 2),
    healthChartData,
    projectHealthRows,
    updates: latestUpdates,
    updatesTotal: dailyUpdateMetrics.withIssues,
    materialIssues,
    materialTotal: materialMetrics.openIssues,
    salesSnapshot: {
      totalLeads: (salesSnapshot.new + salesSnapshot.hot + salesSnapshot.followUp).toString(),
      delta: `${salesSnapshot.hot} hot leads`,
      rows: [
        { label: "Hot Leads", value: salesSnapshot.hot.toString() },
        { label: "Follow-up", value: salesSnapshot.followUp.toString() },
        { label: "New Leads", value: salesSnapshot.new.toString() },
        { label: "Converted", value: salesSnapshot.converted.toString() },
      ],
    },
    contentReadyProjects,
    contentTotal: contentMetrics.readyToShoot + contentMetrics.footageAvailable + contentMetrics.editing,
    recommendedActions,
  }

  return (
    <PageContainer className="max-w-none">
      <PageHeader
        title="Owner Overview"
        description="Dashboard operasional untuk membaca project, update PM, design, material, sales, content, dan prioritas hari ini."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {metrics.map((metric) => (
          <OwnerMetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <DashboardTabs overview={overview} />
    </PageContainer>
  )
}

function buildOwnerMetrics({
  projectMetrics,
  designMetrics,
  materialMetrics,
  salesSnapshot,
}: {
  projectMetrics: Awaited<ReturnType<typeof getProjectMetrics>>
  designMetrics: Awaited<ReturnType<typeof getDesignTaskMetrics>>
  materialMetrics: Awaited<ReturnType<typeof getMaterialIssueMetrics>>
  salesSnapshot: Awaited<ReturnType<typeof getSalesSnapshotQuery>>
}): OwnerMetric[] {
  const urgentTotal = projectMetrics.urgent + materialMetrics.critical + designMetrics.blocked

  return [
    {
      label: "Active Projects",
      value: projectMetrics.active.toString(),
      delta: `${projectMetrics.urgent} butuh perhatian`,
      trend: projectMetrics.urgent > 0 ? "up" : "neutral",
      tone: "primary",
      icon: Folder01Icon,
    },
    {
      label: "Urgent Issues",
      value: urgentTotal.toString(),
      delta: `${materialMetrics.critical} material kritikal`,
      trend: urgentTotal > 0 ? "up" : "neutral",
      tone: "danger",
      icon: Alert02Icon,
    },
    {
      label: "Design / DED",
      value: designMetrics.pending.toString(),
      delta: `${designMetrics.waitingApproval} waiting approval`,
      trend: designMetrics.pending > 0 ? "neutral" : "down",
      tone: "success",
      icon: PaintBoardIcon,
    },
    {
      label: "Material Alerts",
      value: materialMetrics.openIssues.toString(),
      delta: `${materialMetrics.delayed} delayed`,
      trend: materialMetrics.openIssues > 0 ? "up" : "neutral",
      tone: "warning",
      icon: PackageIcon,
    },
    {
      label: "New Leads",
      value: salesSnapshot.new.toString(),
      delta: `${salesSnapshot.hot} hot leads`,
      trend: salesSnapshot.new > 0 ? "up" : "neutral",
      tone: "accent",
      icon: UserAdd01Icon,
    },
  ]
}

function buildRecommendedActions({
  urgentProjects,
  materialIssues,
  pendingDesignTasks,
  salesSnapshot,
  contentReadyProjects,
}: {
  urgentProjects: Awaited<ReturnType<typeof getUrgentProjectOverviewQuery>>
  materialIssues: Awaited<ReturnType<typeof getMaterialIssuesQuery>>
  pendingDesignTasks: Awaited<ReturnType<typeof getPendingDesignTasksQuery>>
  salesSnapshot: Awaited<ReturnType<typeof getSalesSnapshotQuery>>
  contentReadyProjects: Awaited<ReturnType<typeof getContentReadyProjectsQuery>>
}): RecommendedAction[] {
  const actions: RecommendedAction[] = []
  const urgentProject = urgentProjects[0]
  const materialIssue = materialIssues[0]
  const designTask = pendingDesignTasks[0]
  const contentProject = contentReadyProjects[0]

  if (urgentProject) {
    actions.push({
      title: `Review project urgent: ${urgentProject.projectName}`,
      helper: "Cek progress, deadline, dan blocker terbaru.",
      priority: "Prioritas Tinggi",
      icon: Task01Icon,
      href: `/projects/${urgentProject.id}`,
    })
  }

  if (materialIssue) {
    actions.push({
      title: `Follow up material: ${materialIssue.materialName}`,
      helper: materialIssue.vendor?.vendorName ?? "Cek status vendor dan ETA terbaru.",
      priority: materialIssue.urgencyLevel === "critical" ? "Prioritas Tinggi" : "Prioritas Menengah",
      icon: DeliveryTruck02Icon,
      href: "/materials",
    })
  }

  if (designTask) {
    actions.push({
      title: `Review design/DED: ${designTask.taskName}`,
      helper: designTask.project?.projectName ?? "Cek approval dan revisi tertunda.",
      priority: designTask.status === "blocked" ? "Prioritas Tinggi" : "Prioritas Menengah",
      icon: Calendar03Icon,
      href: "/design",
    })
  }

  if (salesSnapshot.followUp > 0) {
    actions.push({
      title: `Follow up ${salesSnapshot.followUp} leads hari ini`,
      helper: "Prioritaskan lead yang sudah due follow-up.",
      priority: "Prioritas Menengah",
      icon: File01Icon,
      href: "/sales",
    })
  }

  if (contentProject) {
    actions.push({
      title: `Siapkan konten: ${contentProject.project?.projectName ?? contentProject.roomArea}`,
      helper: contentProject.suggestedAngle ?? "Review asset dan jadwalkan produksi konten.",
      priority: "Prioritas Menengah",
      icon: File01Icon,
      href: "/content",
    })
  }

  return actions.slice(0, 4)
}

function buildAiInsights({
  urgentProjects,
  materialCritical,
  waitingApproval,
}: {
  urgentProjects: number
  materialCritical: number
  waitingApproval: number
}) {
  return [
    `${urgentProjects} project perlu perhatian owner hari ini.`,
    `${waitingApproval} design/DED masih menunggu approval.`,
    `${materialCritical} material kritikal berpotensi menghambat produksi atau instalasi.`,
  ]
}

export { dashboardPageIcon }
