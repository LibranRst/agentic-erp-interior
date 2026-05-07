import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, ViewIcon } from "@hugeicons/core-free-icons";

import { PageContainer, PageHeader } from "@/components/layout/page-container";
import {
  DataTableShell,
  RecordEmptyState,
} from "@/components/shared/data-table";
import { MetricCard } from "@/components/shared/metric-card";
import { Button } from "@/components/ui/button";
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
  getProjectFormOptions,
  getProjectMetrics,
} from "@/src/features/projects/queries";
import {
  ProjectHealthBadge,
  ProjectPriorityBadge,
  ProjectStatusBadge,
} from "@/src/features/projects/components/project-badges";
import { ProjectFilters } from "@/src/features/projects/components/project-filters";
import { getProjects, archiveProjectAction, restoreProjectAction, deleteProjectAction } from "@/src/server/actions/projects";
import { ArchivedToggle } from "@/components/shared/archived-toggle";
import { RestoreButton } from "@/components/shared/restore-button";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { ArchiveButton } from "@/components/shared/archive-button";
import { formatDate, getDeadlineState } from "@/src/features/projects/utils";

type ProjectsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
  const params = await searchParams;
  const showArchived = getParam(params.archived) === "true";
  const filters = {
    search: getParam(params.search),
    status: getParam(params.status),
    health: getParam(params.health),
    pmId: getParam(params.pmId),
    priority: getParam(params.priority),
  };

  const [projects, metrics, options] = await Promise.all([
    getProjects(filters, showArchived),
    getProjectMetrics(undefined, showArchived),
    getProjectFormOptions(),
  ]);

  return (
    <PageContainer className="overflow-x-hidden">
      <PageHeader
        title="Projects"
        description="Track active projects, health, progress, team ownership, deadlines, and operational risk."
        action={
          <Button asChild>
            <Link href="/projects/new">
              <HugeiconsIcon
                icon={Add01Icon}
                strokeWidth={2}
                data-icon="inline-start"
              />
              Add Project
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Active"
          value={metrics.active.toString()}
          description="Projects still in delivery"
        />
        <MetricCard
          title="Urgent"
          value={metrics.urgent.toString()}
          description="Urgent, blocked, or delayed"
          badge="Watch"
        />
        <MetricCard
          title="Design Stage"
          value={metrics.designStage.toString()}
          description="Concept, revision, or DED"
        />
        <MetricCard
          title="Content Ready"
          value={metrics.contentReady.toString()}
          description="Ready for marketing review"
        />
      </div>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Project List</CardTitle>
          <CardDescription>
            Search and filter the current operational project portfolio.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-3">
            <ProjectFilters filters={filters} options={options} />
            <ArchivedToggle />
          </div>

          {projects.length > 0 ? (
            <DataTableShell>
              <Table className="min-w-[1040px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>PM</TableHead>
                    <TableHead>Designer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Health</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => {
                    const deadlineState = getDeadlineState(project.deadline);

                    return (
                      <TableRow key={project.id}>
                        <TableCell className="min-w-64">
                          <Link
                            href={`/projects/${project.id}`}
                            className="font-medium hover:underline"
                          >
                            {project.projectName}
                          </Link>
                          <div className="mt-1 flex flex-wrap gap-1 text-xs text-muted-foreground">
                            {project.projectType ? (
                              <span>{project.projectType}</span>
                            ) : null}
                            {project.roomArea ? (
                              <span>{project.roomArea}</span>
                            ) : null}
                            <ProjectPriorityBadge priority={project.priority} />
                          </div>
                        </TableCell>
                        <TableCell>{project.clientName}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {project.location ?? "Not set"}
                        </TableCell>
                        <TableCell>
                          {project.projectManager?.name ?? "Unassigned"}
                        </TableCell>
                        <TableCell>
                          {project.designer?.name ?? "Unassigned"}
                        </TableCell>
                        <TableCell>
                          <ProjectStatusBadge status={project.status} />
                        </TableCell>
                        <TableCell>
                          <ProjectHealthBadge
                            healthStatus={project.healthStatus}
                          />
                        </TableCell>
                        <TableCell>{project.progressPercentage}%</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span>{formatDate(project.deadline)}</span>
                            <span
                              className={
                                deadlineState.isWarning
                                  ? "text-xs text-destructive"
                                  : "text-xs text-muted-foreground"
                              }
                            >
                              {deadlineState.label}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {showArchived ? (
                            <div className="flex items-center justify-end gap-2">
                              <RestoreButton action={restoreProjectAction.bind(null, project.id)} />
                              <DeleteConfirmationDialog
                                entityLabel={project.projectName}
                                deleteAction={deleteProjectAction.bind(null, project.id)}
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/projects/${project.id}`}>
                                  <HugeiconsIcon
                                    icon={ViewIcon}
                                    strokeWidth={2}
                                    data-icon="inline-start"
                                  />
                                  View
                                </Link>
                              </Button>
                              <ArchiveButton
                                action={archiveProjectAction.bind(
                                  null,
                                  project.id,
                                )}
                              />
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </DataTableShell>
          ) : (
            <RecordEmptyState
              title="No projects found"
              description="Adjust the search or filters, or create the first tracked project for this workspace."
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
