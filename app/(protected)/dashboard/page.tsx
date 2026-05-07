import { HugeiconsIcon } from "@hugeicons/react"
import {
  ChartUpIcon,
  Folder01Icon,
  PackageIcon,
  PaintBoardIcon,
  ShoppingBag03Icon,
} from "@hugeicons/core-free-icons"

import { PageContainer, PageHeader } from "@/components/layout/page-container"
import {
  DataTableShell,
  RecordEmptyState,
} from "@/components/shared/data-table"
import { MetricCard } from "@/components/shared/metric-card"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DesignTaskStatusBadge,
  DesignTypeBadge,
} from "@/src/features/design/components/design-badges"
import {
  ContentOpportunityBadge,
  ContentStatusBadge,
} from "@/src/features/content/components/content-badges"
import { DailyUpdateHealthBadge } from "@/src/features/daily-updates/components/daily-update-badges"
import {
  MaterialStatusBadge,
  MaterialUrgencyBadge,
} from "@/src/features/materials/components/material-badges"
import { LeadStatusBadge } from "@/src/features/leads/components/lead-badges"
import { GenerateAiSummaryButton } from "@/src/features/ai-summary/components/generate-ai-summary-button"
import {
  getDesignTaskMetrics,
  getPendingDesignTasksQuery,
} from "@/src/features/design/queries"
import { getMaterialIssueMetrics } from "@/src/features/materials/queries"
import { getProjectMetrics } from "@/src/features/projects/queries"
import { formatDate } from "@/src/features/projects/utils"
import { getLatestDailyUpdates } from "@/src/server/actions/daily-updates"
import {
  getDashboardLeads,
  getSalesSnapshot,
} from "@/src/server/actions/leads"
import { getLatestAiSummary } from "@/src/server/actions/ai-summary"
import { getContentReadyProjects } from "@/src/server/actions/content"
import { getMaterialIssues } from "@/src/server/actions/materials"
import { requirePageUser } from "@/src/lib/auth/permissions"

const projectRows = [
  ["Kebayoran Residence", "Build", "At risk", "Material ETA pending"],
  ["Pondok Indah Apartment", "Design", "Healthy", "DED review tomorrow"],
  ["BSD Show Unit", "Finishing", "Watch", "PM update needed"],
]

const snapshotCards = [
  {
    title: "Design Status Snapshot",
    description: "2 approvals waiting",
    icon: PaintBoardIcon,
  },
  {
    title: "Material Warning Snapshot",
    description: "5 tracked issues",
    icon: PackageIcon,
  },
  {
    title: "Sales Snapshot",
    description: "11 new leads this week",
    icon: ShoppingBag03Icon,
  },
]

export default async function DashboardPage() {
  const currentUser = await requirePageUser()
  const [
    projectMetrics,
    designMetrics,
    materialMetrics,
    salesMetrics,
    pendingDesignTasks,
    latestDailyUpdates,
    materialIssues,
    dashboardLeads,
    contentReadyProjects,
    latestAiSummary,
  ] = await Promise.all([
    getProjectMetrics(),
    getDesignTaskMetrics(),
    getMaterialIssueMetrics(),
    getSalesSnapshot(),
    getPendingDesignTasksQuery(4),
    getLatestDailyUpdates(4),
    getMaterialIssues(4),
    getDashboardLeads(4),
    getContentReadyProjects(4),
    getLatestAiSummary(),
  ])

  const metrics = [
    {
      title: "Active Projects",
      value: projectMetrics.active.toString(),
      description: "Projects currently in delivery",
      icon: Folder01Icon,
    },
    {
      title: "Urgent Projects",
      value: projectMetrics.urgent.toString(),
      description: "Need owner attention today",
      badge: projectMetrics.urgent > 0 ? "Watch closely" : undefined,
      icon: ChartUpIcon,
    },
    {
      title: "Pending Design",
      value: designMetrics.pending.toString(),
      description: "Render, revision, approval, or DED queues",
      badge:
        designMetrics.blocked > 0
          ? `${designMetrics.blocked} blocked`
          : undefined,
      icon: PaintBoardIcon,
    },
    {
      title: "Material Issues",
      value: materialMetrics.openIssues.toString(),
      description: "Vendor or ETA risks",
      badge:
        materialMetrics.critical > 0
          ? `${materialMetrics.critical} critical`
          : materialMetrics.high > 0
            ? `${materialMetrics.high} high`
            : undefined,
      icon: PackageIcon,
    },
    {
      title: "New Leads",
      value: salesMetrics.new.toString(),
      description: "Fresh sales opportunities",
      badge: salesMetrics.hot > 0 ? `${salesMetrics.hot} hot` : undefined,
      icon: ShoppingBag03Icon,
    },
    {
      title: "Content Ready",
      value: projectMetrics.contentReady.toString(),
      description: "Projects ready for capture",
    },
  ]

  const dashboardSnapshotCards = snapshotCards.map((card) =>
    card.title === "Design Status Snapshot"
      ? {
          ...card,
          description: `${designMetrics.waitingApproval} approvals waiting, ${designMetrics.dedProgress} DED in progress`,
        }
      : card.title === "Material Warning Snapshot"
        ? {
            ...card,
            description: `${materialMetrics.delayed} delayed, ${materialMetrics.high + materialMetrics.critical} high or critical`,
          }
      : card.title === "Sales Snapshot"
        ? {
            ...card,
            description: `${salesMetrics.new} new, ${salesMetrics.hot} hot, ${salesMetrics.followUp} follow-up due`,
          }
      : card,
  )

  return (
    <PageContainer>
      <PageHeader
        title="Owner Dashboard"
        description="Ringkasan kondisi operasional hari ini untuk project, design, material, sales, content, dan AI summary."
        action={
          ["owner", "admin"].includes(currentUser.role) ? (
            <GenerateAiSummaryButton />
          ) : null
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Morning Summary</CardTitle>
              <CardDescription>
                Latest owner briefing generated from live ERP data.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {latestAiSummary ? (
                <>
                  <p className="whitespace-pre-wrap text-sm leading-6">
                    {latestAiSummary.content}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{latestAiSummary.aiRun?.status ?? "saved"}</Badge>
                    <Badge variant="secondary">
                      {latestAiSummary.aiRun?.modelName ?? "Model not logged"}
                    </Badge>
                    <Badge variant="outline">
                      Reasoning{" "}
                      {latestAiSummary.aiRun?.reasoningLevel ?? "not logged"}
                    </Badge>
                    <Badge variant="outline">
                      {formatGeneratedAt(latestAiSummary.createdAt)}
                    </Badge>
                  </div>
                </>
              ) : (
                <RecordEmptyState
                  title="No AI summary yet"
                  description="Owner or admin users can generate the first morning summary from this dashboard."
                  className="p-8"
                />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Project Health Overview</CardTitle>
              <CardDescription>
                Fast scan of active delivery risk.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTableShell>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Health</TableHead>
                      <TableHead>Next Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectRows.map(([project, stage, health, action]) => (
                      <TableRow key={project}>
                        <TableCell className="font-medium">{project}</TableCell>
                        <TableCell>{stage}</TableCell>
                        <TableCell>
                          <Badge variant={health === "At risk" ? "destructive" : "secondary"}>
                            {health}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {action}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DataTableShell>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4">
          <Card size="sm">
            <CardHeader>
              <CardTitle>Latest PM Updates</CardTitle>
              <CardDescription>
                {latestDailyUpdates.length} latest progress reports from PMs.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {latestDailyUpdates.length > 0 ? (
                latestDailyUpdates.map((update) => (
                  <div key={update.id} className="flex flex-col gap-2 rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {update.project.projectName}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {update.updater?.name ?? "Unknown PM"} · {formatDate(update.updateDate)}
                        </div>
                      </div>
                      <DailyUpdateHealthBadge
                        healthStatus={update.healthStatus}
                      />
                    </div>
                    <div className="line-clamp-2 text-sm text-muted-foreground">
                      {update.nextAction ??
                        update.issueNotes ??
                        update.progressSummary}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">
                        {update.progressPercentage !== null
                          ? `${update.progressPercentage}%`
                          : "Progress not set"}
                      </Badge>
                      <Badge variant="secondary">
                        {update.mediaAssets.length} attachments
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <RecordEmptyState
                  title="No PM updates"
                  description="Daily PM progress reports will appear here once submitted."
                  className="p-6"
                />
              )}
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle>Design Status Snapshot</CardTitle>
              <CardDescription>
                Pending design, render, revision, and DED work.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {pendingDesignTasks.length > 0 ? (
                pendingDesignTasks.map((task) => (
                  <div key={task.id} className="flex flex-col gap-2 rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {task.taskName}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {task.project.projectName} · {task.designer?.name ?? "Unassigned"}
                        </div>
                      </div>
                      <DesignTaskStatusBadge status={task.status} />
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <DesignTypeBadge designType={task.designType} />
                      <Badge variant="outline">{formatDate(task.dueDate)}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <RecordEmptyState
                  title="No pending design tasks"
                  description="Open render, revision, approval, and DED work will appear here."
                  className="p-6"
                />
              )}
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle>Material Warning Snapshot</CardTitle>
              <CardDescription>
                Delayed, high, and critical purchasing issues.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {materialIssues.length > 0 ? (
                materialIssues.map((material) => (
                  <div key={material.id} className="flex flex-col gap-2 rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {material.materialName}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {material.project.projectName} · {material.vendor?.vendorName ?? "Vendor unassigned"}
                        </div>
                      </div>
                      <MaterialUrgencyBadge
                        urgencyLevel={material.urgencyLevel}
                      />
                    </div>
                    <div className="line-clamp-2 text-sm text-muted-foreground">
                      {material.issueNotes ?? "No issue notes recorded yet."}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <MaterialStatusBadge status={material.status} />
                      <Badge variant="outline">ETA {formatDate(material.etaDate)}</Badge>
                    </div>
                  </div>
                ))
              ) : (
                <RecordEmptyState
                  title="No material warnings"
                  description="Delayed, high, and critical purchasing issues will appear here."
                  className="p-6"
                />
              )}
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle>Content Readiness</CardTitle>
              <CardDescription>
                Projects with shoot, footage, or publishing opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {contentReadyProjects.length > 0 ? (
                contentReadyProjects.map((asset) => (
                  <div key={asset.id} className="flex flex-col gap-2 rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {asset.project.projectName}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {asset.roomArea ?? "General"} · {asset.project.clientName}
                        </div>
                      </div>
                      <ContentStatusBadge status={asset.contentStatus} />
                    </div>
                    <div className="line-clamp-2 text-sm text-muted-foreground">
                      {asset.suggestedAngle ?? "No suggested angle recorded yet."}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <ContentOpportunityBadge
                        opportunity={asset.contentOpportunity}
                      />
                      <Badge variant="secondary">
                        {asset.mediaAssets.length} media
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <RecordEmptyState
                  title="No content-ready projects"
                  description="Shoot, footage, and publishing opportunities will appear here."
                  className="p-6"
                />
              )}
            </CardContent>
          </Card>
          {dashboardSnapshotCards
            .filter(
              (card) =>
                card.title !== "Design Status Snapshot" &&
                card.title !== "Material Warning Snapshot" &&
                card.title !== "Sales Snapshot",
            )
            .map(({ title, description, icon }) => (
              <Card key={title} size="sm">
                <CardHeader>
                  <CardTitle>{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
                  <span>Open module for details</span>
                  <HugeiconsIcon icon={icon} strokeWidth={2} />
                </CardContent>
              </Card>
            ))}
          <Card size="sm">
            <CardHeader>
              <CardTitle>Sales Snapshot</CardTitle>
              <CardDescription>
                New, hot, and follow-up leads requiring sales attention.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {dashboardLeads.length > 0 ? (
                dashboardLeads.map((lead) => (
                  <div key={lead.id} className="flex flex-col gap-2 rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {lead.leadName}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                          {lead.assignedSales?.name ?? "Unassigned"} · {lead.source ?? "Source not set"}
                        </div>
                      </div>
                      <LeadStatusBadge status={lead.status} />
                    </div>
                    <div className="line-clamp-2 text-sm text-muted-foreground">
                      {lead.interest ?? lead.notes ?? "No interest recorded yet."}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">
                        Follow-up {formatDate(lead.nextFollowUpDate)}
                      </Badge>
                      <Badge variant="secondary">
                        {lead.estimatedProjectValue
                          ? `Rp ${Number(lead.estimatedProjectValue).toLocaleString("id-ID")}`
                          : "Value not set"}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <RecordEmptyState
                  title="No sales follow-ups"
                  description="New, hot, and due follow-up leads will appear here."
                  className="p-6"
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}

function formatGeneratedAt(value: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value)
}
