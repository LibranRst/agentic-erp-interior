import Link from "next/link"

import { RecordEmptyState } from "@/components/shared/data-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  ownerAiBriefSchema,
  type OwnerAiBrief,
} from "@/src/mastra/tools/schemas"

type AiSummary = {
  content: string
  structuredContent?: unknown
  createdAt: Date
  aiRun?: {
    status: string
    modelName: string
    reasoningLevel: string
  } | null
} | null

function OwnerAiBrief({ summary }: { summary: AiSummary }) {
  if (!summary) {
    return (
      <Card className="overflow-hidden border-border/60 bg-card shadow-sm">
        <CardHeader>
          <CardTitle>AI Operational Brief</CardTitle>
          <CardDescription>
            Generate a structured morning brief from live ERP data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecordEmptyState
            title="No AI brief yet"
            description="Owner or admin users can generate the first structured morning brief from this dashboard."
            className="border border-dashed bg-muted/30 p-8"
          />
        </CardContent>
      </Card>
    )
  }

  const brief = parseBrief(summary.structuredContent)

  if (!brief) {
    return <LegacyAiBrief summary={summary} />
  }

  const topPriorities = brief.priorities.slice(0, 3)

  return (
    <Card className="overflow-hidden border-border/60 bg-card shadow-sm">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={getStatusVariant(brief.overallStatus)}>
                {getStatusLabel(brief.overallStatus)}
              </Badge>
              <Badge variant="outline">{formatGeneratedAt(summary.createdAt)}</Badge>
            </div>
            <div>
              <CardTitle>AI Operational Brief</CardTitle>
              <CardDescription>
                Structured priorities, blockers, opportunities, and next action.
              </CardDescription>
            </div>
          </div>
          <BriefDetails brief={brief} summary={summary} />
        </div>
        <p className="max-w-3xl text-pretty text-sm leading-6 text-muted-foreground">
          {brief.executiveSummary}
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-2xl border border-border/60 bg-muted/35 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Recommended owner action
          </div>
          <div className="mt-2 text-sm font-medium leading-6">
            {brief.recommendedOwnerAction}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          {topPriorities.length > 0 ? (
            topPriorities.map((priority) => (
              <PriorityCard key={priority.id} priority={priority} />
            ))
          ) : (
            <div className="rounded-2xl border border-dashed bg-muted/25 p-4 text-sm text-muted-foreground lg:col-span-3">
              No critical priorities detected in latest ERP signals.
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border/60 pt-4">
          <Badge variant="secondary">{summary.aiRun?.status ?? "saved"}</Badge>
          <Badge variant="outline">
            {summary.aiRun?.modelName ?? "Model not logged"}
          </Badge>
          <Badge variant="outline">
            Reasoning {summary.aiRun?.reasoningLevel ?? "not logged"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function PriorityCard({ priority }: { priority: OwnerAiBrief["priorities"][number] }) {
  return (
    <div className="flex min-h-full flex-col rounded-2xl border border-border/60 bg-background/70 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {priority.area}
          </div>
          <h3 className="line-clamp-2 text-sm font-semibold leading-5">
            {priority.title}
          </h3>
        </div>
        <Badge variant={getSeverityVariant(priority.severity)}>
          {priority.severity}
        </Badge>
      </div>
      {priority.relatedEntityName ? (
        <div className="mt-3 truncate text-xs text-muted-foreground">
          {priority.relatedEntityName}
        </div>
      ) : null}
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
        {priority.reason}
      </p>
      <div className="mt-4 rounded-xl bg-muted/45 p-3 text-sm leading-5">
        {priority.recommendedAction}
      </div>
      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        {priority.suggestedActions.slice(0, 2).map((action) => (
          <Button key={`${priority.id}-${action.label}`} size="sm" variant="outline" asChild>
            <Link href={getActionHref(action.actionType, action.targetId)}>
              {action.label}
            </Link>
          </Button>
        ))}
      </div>
    </div>
  )
}

function BriefDetails({ brief, summary }: { brief: OwnerAiBrief; summary: NonNullable<AiSummary> }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">View full brief</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Full AI operational brief</DialogTitle>
          <DialogDescription>
            Generated {formatGeneratedAt(summary.createdAt)} from current ERP signals.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <p className="text-sm leading-6 text-muted-foreground">{brief.fullReport}</p>
          <Separator />
          <SignalGroup title="Blockers" items={brief.blockers} />
          <SignalGroup title="Risks" items={brief.risks} />
          <SignalGroup title="Opportunities" items={brief.opportunities} />
          <Separator />
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(brief.departmentInsights).map(([department, insight]) => (
              <div key={department} className="rounded-xl border bg-muted/30 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium capitalize">{department}</div>
                  <Badge variant={getDepartmentVariant(insight.status)}>
                    {insight.status.replaceAll("_", " ")}
                  </Badge>
                </div>
                <p className="mt-2 text-sm leading-5 text-muted-foreground">
                  {insight.summary}
                </p>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function SignalGroup({ title, items }: { title: string; items: OwnerAiBrief["blockers"] }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold">{title}</h3>
      {items.length > 0 ? (
        <div className="grid gap-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border bg-muted/25 p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">{item.title}</span>
                <Badge variant={getSeverityVariant(item.severity)}>{item.severity}</Badge>
              </div>
              <p className="mt-2 text-sm leading-5 text-muted-foreground">
                {item.reason}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No {title.toLowerCase()} highlighted.</p>
      )}
    </section>
  )
}

function LegacyAiBrief({ summary }: { summary: NonNullable<AiSummary> }) {
  return (
    <Card className="border-border/60 bg-card shadow-sm">
      <CardHeader>
        <CardTitle>AI Operational Brief</CardTitle>
        <CardDescription>
          Legacy text report. Generate a new brief for structured priorities and actions.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="max-h-56 overflow-hidden whitespace-pre-wrap rounded-2xl border bg-muted/30 p-4 text-sm leading-6 text-muted-foreground">
          {summary.content}
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge>{summary.aiRun?.status ?? "saved"}</Badge>
          <Badge variant="outline">{formatGeneratedAt(summary.createdAt)}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function parseBrief(value: unknown) {
  const parsed = ownerAiBriefSchema.safeParse(value)
  return parsed.success ? parsed.data : null
}

function getActionHref(actionType: string, targetId?: string | null) {
  if (actionType === "open_project" && targetId) return `/projects/${targetId}`
  if (actionType === "open_lead") return "/sales"
  if (actionType === "open_content") return "/content"
  if (actionType === "open_material_issue") return "/materials"
  return "/dashboard"
}

function getStatusLabel(status: OwnerAiBrief["overallStatus"]) {
  return {
    healthy: "Healthy",
    needs_attention: "Needs attention",
    critical: "Critical",
  }[status]
}

function getStatusVariant(status: OwnerAiBrief["overallStatus"]) {
  return status === "healthy" ? "secondary" : status === "critical" ? "destructive" : "default"
}

function getSeverityVariant(severity: OwnerAiBrief["priorities"][number]["severity"]) {
  return severity === "critical" ? "destructive" : severity === "high" ? "default" : "secondary"
}

function getDepartmentVariant(status: OwnerAiBrief["departmentInsights"]["projects"]["status"]) {
  return status === "critical" ? "destructive" : status === "healthy" ? "secondary" : "outline"
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

export { OwnerAiBrief }
