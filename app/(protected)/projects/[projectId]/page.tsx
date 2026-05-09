import { notFound } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Calendar03Icon,
  FileImageIcon,
  PackageIcon,
  PaintBoardIcon,
} from "@hugeicons/core-free-icons";

import { PageContainer, PageHeader } from "@/components/layout/page-container";
import {
  DataTableShell,
  RecordEmptyState,
} from "@/components/shared/data-table";
import { MetricCard } from "@/components/shared/metric-card";
import { ProjectDocumentationUploader } from "@/components/shared/project-documentation-uploader";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { DailyUpdateDialog } from "@/src/features/daily-updates/components/daily-update-dialog";
import { DailyUpdateHealthBadge } from "@/src/features/daily-updates/components/daily-update-badges";
import {
  getDailyUpdateFormOptions,
  getDailyUpdateMediaByUpdateIds,
} from "@/src/features/daily-updates/queries";
import { ProjectEditDialog } from "@/src/features/projects/components/project-edit-dialog";
import { ProjectPmControls } from "@/src/features/projects/components/project-pm-controls";
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
import { getDesignMediaByTaskIds } from "@/src/features/design/queries";

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

  const mediaByDesignTaskId = await getDesignMediaByTaskIds(
    project.designTasks.map((task) => task.id),
  );
  const mediaByDailyUpdateId = await getDailyUpdateMediaByUpdateIds(
    project.dailyUpdates.map((update) => update.id),
  );
  const latestUpdate = project.dailyUpdates[0];
  const deadlineState = getDeadlineState(project.deadline);
  const canEdit = currentUser.role === "owner" || currentUser.role === "admin";
  const canPmUpdate =
    canEdit ||
    (currentUser.role === "project_manager" && project.pmId === currentUser.id);
  const canCreateDailyUpdate = canPmUpdate;
  const dailyUpdateOptions = canCreateDailyUpdate
    ? await getDailyUpdateFormOptions(currentUser)
    : null;

  return (
    <PageContainer className="max-w-none">
      <PageHeader
        title={project.projectName}
        description={`${project.clientName}${project.location ? ` · ${project.location}` : ""}`}
        action={
          canEdit ? (
            <ProjectEditDialog project={project} options={options} />
          ) : undefined
        }
      />

      {canPmUpdate ? (
        <div className="mb-4 rounded-xl border p-4">
          <div className="mb-2 text-xs font-medium text-muted-foreground">
            Quick Update
          </div>
          <ProjectPmControls
            projectId={project.id}
            status={project.status}
            healthStatus={project.healthStatus}
            progressPercentage={project.progressPercentage}
          />
        </div>
      ) : null}

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
        <div className="min-w-0 overflow-x-auto overflow-y-hidden pb-2">
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
                label="Daily Updates"
                value={project.dailyUpdates.length.toString()}
                badge="Latest records shown"
                icon={Calendar03Icon}
              />
              <MetricCard
                label="Design Tasks"
                value={project.designTasks.length.toString()}
                badge="Open and completed design work"
                icon={PaintBoardIcon}
              />
              <MetricCard
                label="Materials"
                value={project.materials.length.toString()}
                badge="Tracked material items"
                icon={PackageIcon}
              />
              <MetricCard
                label="Media"
                value={project.mediaAssets.length.toString()}
                badge="ImageKit-backed assets"
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
                  <div className="grid gap-4 md:grid-cols-4">
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
                    <KeyValue
                      label="Attachments"
                      value={`${mediaByDailyUpdateId.get(latestUpdate.id)?.length ?? 0}`}
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
          <DataCard
            title="Daily Updates"
            description="Latest PM reports."
            action={
              dailyUpdateOptions ? (
                <DailyUpdateDialog
                  mode="create"
                  options={dailyUpdateOptions}
                  defaultProjectId={project.id}
                />
              ) : undefined
            }
          >
            {project.dailyUpdates.length > 0 ? (
              <DataTableShell>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Updated By</TableHead>
                      <TableHead>Summary</TableHead>
                      <TableHead>Health</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Attachments</TableHead>
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
                          <DailyUpdateHealthBadge
                            healthStatus={update.healthStatus}
                          />
                        </TableCell>
                        <TableCell>
                          {update.progressPercentage !== null
                            ? `${update.progressPercentage}%`
                            : "Not set"}
                        </TableCell>
                        <TableCell className="min-w-52">
                          <MediaLinks
                            mediaAssets={mediaByDailyUpdateId.get(update.id) ?? []}
                          />
                        </TableCell>
                        <TableCell className="min-w-64 text-muted-foreground">
                          {update.nextAction ?? "Not set"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </DataTableShell>
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
              <DataTableShell>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Designer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Approval</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead>Files</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {project.designTasks.map((task) => {
                      const taskMedia = mediaByDesignTaskId.get(task.id) ?? [];

                      return (
                        <TableRow key={task.id}>
                          <TableCell className="font-medium">
                            {task.taskName}
                          </TableCell>
                          <TableCell>
                            {task.designer?.name ?? "Unassigned"}
                          </TableCell>
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
                          <TableCell>
                            {formatEnumLabel(task.approvalStatus)}
                          </TableCell>
                          <TableCell>{formatDate(task.dueDate)}</TableCell>
                          <TableCell className="min-w-56">
                            {taskMedia.length > 0 ? (
                              <div className="flex flex-col gap-1">
                                {taskMedia.slice(0, 2).map((asset) => (
                                  <a
                                    key={asset.id}
                                    href={asset.imagekitUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="truncate text-sm hover:underline"
                                  >
                                    {asset.fileName}
                                  </a>
                                ))}
                                {taskMedia.length > 2 ? (
                                  <span className="text-xs text-muted-foreground">
                                    +{taskMedia.length - 2} more files
                                  </span>
                                ) : null}
                              </div>
                            ) : (
                              <span className="text-muted-foreground">
                                No files
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="min-w-64 text-muted-foreground">
                            {task.notes ?? "No notes"}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </DataTableShell>
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
              <DataTableShell>
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
              </DataTableShell>
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
              <DataTableShell>
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
              </DataTableShell>
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
              <DataTableShell>
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
              </DataTableShell>
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
            {canEdit ? (
              <div className="mb-4">
                <ProjectDocumentationUploader
                  projectId={project.id}
                  existingMedia={project.mediaAssets.filter(
                    (asset) => asset.relatedType === "project_documentation",
                  )}
                />
              </div>
            ) : null}
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
  action,
  children,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent className="min-w-0">{children}</CardContent>
    </Card>
  );
}

function MediaLinks({
  mediaAssets,
}: {
  mediaAssets: Array<{
    id: string;
    fileName: string;
    imagekitUrl: string;
  }>;
}) {
  if (mediaAssets.length === 0) {
    return <span className="text-muted-foreground">None</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      {mediaAssets.slice(0, 2).map((asset) => (
        <a
          key={asset.id}
          href={asset.imagekitUrl}
          target="_blank"
          rel="noreferrer"
          className="truncate text-sm hover:underline"
        >
          {asset.fileName}
        </a>
      ))}
      {mediaAssets.length > 2 ? (
        <span className="text-xs text-muted-foreground">
          +{mediaAssets.length - 2} more
        </span>
      ) : null}
    </div>
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
    <RecordEmptyState
      title={title}
      description={description}
      className="border-0 bg-transparent"
    />
  );
}

function formatEnumLabel(value: string) {
  return value
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}
