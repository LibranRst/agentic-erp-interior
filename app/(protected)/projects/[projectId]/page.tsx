import { notFound } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  FileImageIcon,
  PackageIcon,
  PaintBoardIcon,
} from "@hugeicons/core-free-icons";

import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { MetricCard } from "@/components/shared/metric-card";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  BudgetWarningBadge,
  ContentReadyBadge,
  ProjectHealthBadge,
  ProjectPriorityBadge,
  ProjectStatusBadge,
} from "@/src/features/projects/components/project-badges";
import { ProjectEditDialog } from "@/src/features/projects/components/project-edit-dialog";
import { getProjectFormOptions } from "@/src/features/projects/queries";
import {
  formatCurrency,
  formatDate,
  getDeadlineState,
} from "@/src/features/projects/utils";
import {
  getProjectById,
} from "@/src/server/actions/projects";
import { requirePageUser } from "@/src/lib/auth/permissions";

type ProjectDetailPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const [{ projectId }, currentUser] = await Promise.all([
    params,
    requirePageUser(),
  ]);
  const [project, options] = await Promise.all([
    getProjectById(projectId),
    getProjectFormOptions(),
  ]);

  if (!project) {
    notFound();
  }

  const latestUpdate = project.dailyUpdates[0];
  const deadlineState = getDeadlineState(project.deadline);
  const canEdit = currentUser.role === "owner" || currentUser.role === "admin";

  return (
    <PageContainer>
      <PageHeader
        title={project.projectName}
        description={`${project.clientName}${project.location ? ` · ${project.location}` : ""}`}
        action={
          canEdit ? (
            <ProjectEditDialog project={project} options={options} />
          ) : undefined
        }
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex flex-col gap-2">
              <CardTitle>Project Snapshot</CardTitle>
              <CardDescription>
                Core status, assignment, progress, and deadline signal.
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <ProjectStatusBadge status={project.status} />
              <ProjectHealthBadge healthStatus={project.healthStatus} />
              <ProjectPriorityBadge priority={project.priority} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SnapshotItem label="Progress" value={`${project.progressPercentage}%`} />
          <SnapshotItem
            label="Deadline"
            value={formatDate(project.deadline)}
            description={deadlineState.label}
            warning={deadlineState.isWarning}
          />
          <SnapshotItem
            label="Project Manager"
            value={project.projectManager?.name ?? "Unassigned"}
          />
          <SnapshotItem
            label="Designer"
            value={project.designer?.name ?? "Unassigned"}
          />
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="gap-4">
        <div className="overflow-x-auto">
          <TabsList variant="line" className="min-w-max">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="daily-updates">Daily Updates</TabsTrigger>
            <TabsTrigger value="design">Design / DED</TabsTrigger>
            <TabsTrigger value="materials">Materials</TabsTrigger>
            <TabsTrigger value="sales">Sales Info</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="ai-summary">AI Summary</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview">
          <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="grid gap-4 md:grid-cols-2">
              <MetricCard
                title="Daily Updates"
                value={project.dailyUpdates.length.toString()}
                description="Latest records shown"
                icon={Calendar03Icon}
              />
              <MetricCard
                title="Design Tasks"
                value={project.designTasks.length.toString()}
                description="Open and completed design work"
                icon={PaintBoardIcon}
              />
              <MetricCard
                title="Materials"
                value={project.materials.length.toString()}
                description="Tracked material items"
                icon={PackageIcon}
              />
              <MetricCard
                title="Media"
                value={project.mediaAssets.length.toString()}
                description="ImageKit-backed assets"
                icon={FileImageIcon}
              />
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Operational Notes</CardTitle>
                <CardDescription>
                  Fast owner scan for project context and current next action.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <KeyValue label="Project type" value={project.projectType} />
                <KeyValue label="Room / area" value={project.roomArea} />
                <KeyValue
                  label="Estimated value"
                  value={formatCurrency(project.estimatedValue)}
                />
                <div className="flex flex-wrap gap-2">
                  <BudgetWarningBadge status={project.budgetWarningStatus} />
                  <ContentReadyBadge status={project.contentReadyStatus} />
                </div>
                <Separator />
                <p className="text-sm leading-6 text-muted-foreground">
                  {project.description ?? "No project notes recorded yet."}
                </p>
              </CardContent>
            </Card>
            <Card className="xl:col-span-2">
              <CardHeader>
                <CardTitle>Latest PM Update</CardTitle>
                <CardDescription>
                  Most recent daily update connected to this project.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {latestUpdate ? (
                  <div className="grid gap-4 md:grid-cols-3">
                    <KeyValue
                      label="Summary"
                      value={latestUpdate.progressSummary}
                    />
                    <KeyValue
                      label="Issue"
                      value={latestUpdate.issueNotes ?? "No issue recorded"}
                    />
                    <KeyValue
                      label="Next action"
                      value={latestUpdate.nextAction ?? "No next action"}
                    />
                  </div>
                ) : (
                  <EmptyState
                    title="No daily updates"
                    description="PM updates will appear here after the Daily Updates module records them."
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="daily-updates">
          <DataCard title="Daily Updates" description="Latest PM reports.">
            {project.dailyUpdates.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Updated By</TableHead>
                    <TableHead>Summary</TableHead>
                    <TableHead>Health</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Next Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.dailyUpdates.map((update) => (
                    <TableRow key={update.id}>
                      <TableCell>{formatDate(update.updateDate)}</TableCell>
                      <TableCell>{update.updater?.name ?? "Unknown"}</TableCell>
                      <TableCell className="min-w-72">
                        {update.progressSummary}
                      </TableCell>
                      <TableCell>
                        {update.healthStatus ? (
                          <Badge variant="secondary">
                            {formatEnumLabel(update.healthStatus)}
                          </Badge>
                        ) : (
                          "Not set"
                        )}
                      </TableCell>
                      <TableCell>
                        {update.progressPercentage !== null
                          ? `${update.progressPercentage}%`
                          : "Not set"}
                      </TableCell>
                      <TableCell className="min-w-64 text-muted-foreground">
                        {update.nextAction ?? "Not set"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="No daily updates"
                description="Daily PM reports connected to this project will appear here."
              />
            )}
          </DataCard>
        </TabsContent>

        <TabsContent value="design">
          <DataCard title="Design / DED" description="Design task snapshot.">
            {project.designTasks.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task</TableHead>
                    <TableHead>Designer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Approval</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.designTasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">
                        {task.taskName}
                      </TableCell>
                      <TableCell>{task.designer?.name ?? "Unassigned"}</TableCell>
                      <TableCell>{formatEnumLabel(task.designType)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            task.status === "blocked"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {formatEnumLabel(task.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatEnumLabel(task.approvalStatus)}</TableCell>
                      <TableCell>{formatDate(task.dueDate)}</TableCell>
                      <TableCell className="min-w-64 text-muted-foreground">
                        {task.notes ?? "No notes"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="No design tasks"
                description="Design and DED tasks will appear here once created."
              />
            )}
          </DataCard>
        </TabsContent>

        <TabsContent value="materials">
          <DataCard title="Materials" description="Material and vendor risks.">
            {project.materials.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>Issue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.materials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="font-medium">
                        {material.materialName}
                      </TableCell>
                      <TableCell>
                        {material.vendor?.vendorName ?? "No vendor"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            ["delayed", "problem"].includes(material.status)
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {formatEnumLabel(material.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatEnumLabel(material.urgencyLevel)}</TableCell>
                      <TableCell>{formatDate(material.etaDate)}</TableCell>
                      <TableCell className="min-w-64 text-muted-foreground">
                        {material.issueNotes ?? "No issue"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="No materials"
                description="Material records linked to this project will appear here."
              />
            )}
          </DataCard>
        </TabsContent>

        <TabsContent value="sales">
          <DataCard title="Sales Info" description="Converted lead context.">
            {project.leads.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead>Follow Up</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.leads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        {lead.leadName}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {formatEnumLabel(lead.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {lead.assignedSales?.name ?? "Unassigned"}
                      </TableCell>
                      <TableCell>{formatDate(lead.nextFollowUpDate)}</TableCell>
                      <TableCell className="min-w-64 text-muted-foreground">
                        {lead.notes ?? "No notes"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="No sales info"
                description="Converted leads linked to this project will appear here."
              />
            )}
          </DataCard>
        </TabsContent>

        <TabsContent value="content">
          <DataCard title="Content" description="Content readiness records.">
            {project.contentAssets.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Room / Area</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Visual</TableHead>
                    <TableHead>Footage</TableHead>
                    <TableHead>Opportunity</TableHead>
                    <TableHead>Angle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {project.contentAssets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">
                        {asset.roomArea ?? "General"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {formatEnumLabel(asset.contentStatus)}
                        </Badge>
                      </TableCell>
                      <TableCell>{asset.visualStatus ?? "Not set"}</TableCell>
                      <TableCell>{asset.footageStatus ?? "Not set"}</TableCell>
                      <TableCell>
                        {asset.contentOpportunity
                          ? formatEnumLabel(asset.contentOpportunity)
                          : "Not set"}
                      </TableCell>
                      <TableCell className="min-w-64 text-muted-foreground">
                        {asset.suggestedAngle ?? "No angle"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="No content records"
                description="Content assets and readiness notes will appear here."
              />
            )}
          </DataCard>
        </TabsContent>

        <TabsContent value="media">
          <DataCard title="Media" description="ImageKit media linked to project.">
            {project.mediaAssets.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {project.mediaAssets.map((asset) => (
                  <a
                    key={asset.id}
                    href={asset.imagekitUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex flex-col gap-2 rounded-xl border p-4 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2 font-medium">
                      <HugeiconsIcon icon={FileImageIcon} strokeWidth={2} />
                      <span className="truncate">{asset.fileName}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {asset.fileType ?? asset.mimeType ?? "Media asset"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Uploaded by {asset.uploader?.name ?? "Unknown"}
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No media"
                description="Progress photos, renders, DED files, and content assets will appear here after upload."
              />
            )}
          </DataCard>
        </TabsContent>

        <TabsContent value="ai-summary">
          <DataCard title="AI Summary" description="Saved project AI summaries.">
            {project.aiSummaries.length > 0 ? (
              <div className="flex flex-col gap-3">
                {project.aiSummaries.map((summary) => (
                  <div key={summary.id} className="rounded-xl border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge variant="secondary">
                        {formatEnumLabel(summary.summaryType)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(summary.summaryDate)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6">{summary.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No AI summaries"
                description="Project risk or owner briefing summaries will appear here after Mastra workflows are connected."
              />
            )}
          </DataCard>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}

function SnapshotItem({
  label,
  value,
  description,
  warning = false,
}: {
  label: string;
  value: string;
  description?: string;
  warning?: boolean;
}) {
  return (
    <div className="rounded-xl border p-4">
      <div className="text-xs font-medium text-muted-foreground">{label}</div>
      <div className="mt-2 text-lg font-medium">{value}</div>
      {description ? (
        <div
          className={
            warning
              ? "mt-1 text-xs text-destructive"
              : "mt-1 text-xs text-muted-foreground"
          }
        >
          {description}
        </div>
      ) : null}
    </div>
  );
}

function KeyValue({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm leading-6">{value ?? "Not set"}</dd>
    </div>
  );
}

function DataCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">{children}</div>
      </CardContent>
    </Card>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function formatEnumLabel(value: string) {
  return value
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}
