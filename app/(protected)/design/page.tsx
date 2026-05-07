import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { FileAttachmentIcon } from "@hugeicons/core-free-icons";

import { PageContainer, PageHeader } from "@/components/layout/page-container";
import {
  DataTableShell,
  RecordEmptyState,
} from "@/components/shared/data-table";
import { MetricCard } from "@/components/shared/metric-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DesignApprovalStatusBadge,
  DesignTaskStatusBadge,
  DesignTypeBadge,
} from "@/src/features/design/components/design-badges";
import { DesignTaskDialog } from "@/src/features/design/components/design-task-dialog";
import { DesignTaskFilters } from "@/src/features/design/components/design-task-filters";
import {
  getDesignTaskFormOptions,
  getDesignTaskMetrics,
} from "@/src/features/design/queries";
import { designTaskFiltersSchema } from "@/src/features/design/schemas";
import { getDesignTasks, archiveDesignTaskAction, restoreDesignTaskAction, deleteDesignTaskAction } from "@/src/server/actions/design";
import { ArchivedToggle } from "@/components/shared/archived-toggle";
import { RestoreButton } from "@/components/shared/restore-button";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { ArchiveButton } from "@/components/shared/archive-button";
import { requirePageRole } from "@/src/lib/auth/permissions";
import { formatDate } from "@/src/features/projects/utils";

type DesignPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DesignPage({ searchParams }: DesignPageProps) {
  await requirePageRole(["owner", "admin", "designer"]);

  const params = await searchParams;
  const showArchived = getParam(params.archived) === "true";
  const filters = {
    search: getParam(params.search),
    projectId: getParam(params.projectId),
    designerId: getParam(params.designerId),
    designType: getParam(params.designType),
    status: getParam(params.status),
    approvalStatus: getParam(params.approvalStatus),
  };
  const parsedFilters = designTaskFiltersSchema.safeParse(filters);
  const designFilters = parsedFilters.success ? parsedFilters.data : {};

  const [tasks, metrics, options] = await Promise.all([
    getDesignTasks(designFilters, showArchived),
    getDesignTaskMetrics(undefined, showArchived),
    getDesignTaskFormOptions(),
  ]);

  return (
    <PageContainer className="overflow-x-hidden">
      <PageHeader
        title="Design / DED Tracker"
        description="Monitor concepts, renders, revisions, approvals, DED delivery, and design file handoff."
        action={<DesignTaskDialog mode="create" options={options} />}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Pending Design"
          value={metrics.pending.toString()}
          description="Open render, revision, approval, or DED tasks"
        />
        <MetricCard
          title="Waiting Approval"
          value={metrics.waitingApproval.toString()}
          description="Client or owner review"
        />
        <MetricCard
          title="DED Progress"
          value={metrics.dedProgress.toString()}
          description="Technical drawings in progress"
        />
        <MetricCard
          title="Blocked"
          value={metrics.blocked.toString()}
          description="Needs a decision or unblock"
          badge={metrics.blocked > 0 ? "Urgent" : undefined}
        />
      </div>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Design Task List</CardTitle>
          <CardDescription>
            Search, filter, and update the current design and DED workload.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-3">
            <DesignTaskFilters filters={designFilters} options={options} />
            <ArchivedToggle />
          </div>

          {tasks.length > 0 ? (
            <DataTableShell>
              <Table className="min-w-[1120px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Designer</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Design Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Approval</TableHead>
                    <TableHead>Revisions</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Files</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="min-w-56">
                        <Link
                          href={`/projects/${task.projectId}`}
                          className="font-medium hover:underline"
                        >
                          {task.project.projectName}
                        </Link>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {task.project.clientName}
                        </div>
                      </TableCell>
                      <TableCell>{task.designer?.name ?? "Unassigned"}</TableCell>
                      <TableCell className="min-w-56 font-medium">
                        {task.taskName}
                        {task.notes ? (
                          <div className="mt-1 line-clamp-2 text-xs font-normal text-muted-foreground">
                            {task.notes}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <DesignTypeBadge designType={task.designType} />
                      </TableCell>
                      <TableCell>
                        <DesignTaskStatusBadge status={task.status} />
                      </TableCell>
                      <TableCell>
                        <DesignApprovalStatusBadge
                          approvalStatus={task.approvalStatus}
                        />
                      </TableCell>
                      <TableCell>{task.revisionCount}</TableCell>
                      <TableCell>{formatDate(task.dueDate)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <HugeiconsIcon
                            icon={FileAttachmentIcon}
                            strokeWidth={2}
                          />
                          <span>{task.mediaAssets.length}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {showArchived ? (
                          <div className="flex items-center justify-end gap-2">
                            <RestoreButton action={restoreDesignTaskAction.bind(null, task.id)} />
                            <DeleteConfirmationDialog
                              entityLabel={task.taskName}
                              deleteAction={deleteDesignTaskAction.bind(null, task.id)}
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2">
                            <DesignTaskDialog
                              mode="edit"
                              task={task}
                              options={options}
                            />
                            <ArchiveButton
                              action={archiveDesignTaskAction.bind(null, task.id)}
                            />
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DataTableShell>
          ) : (
            <RecordEmptyState
              title="No design tasks found"
              description="Adjust the filters or create the first design, render, or DED task for this workspace."
            />
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
