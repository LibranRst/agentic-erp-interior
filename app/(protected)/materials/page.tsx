import Link from "next/link";
import {
  Alert02Icon,
  CheckmarkCircle02Icon,
  DeliveryTruck02Icon,
} from "@hugeicons/core-free-icons"

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
  MaterialStatusBadge,
  MaterialUrgencyBadge,
} from "@/src/features/materials/components/material-badges";
import { MaterialDialog } from "@/src/features/materials/components/material-dialog";
import { MaterialFilters } from "@/src/features/materials/components/material-filters";
import {
  getMaterialFormOptions,
  getMaterialIssueMetrics,
} from "@/src/features/materials/queries";
import { materialFiltersSchema } from "@/src/features/materials/schemas";
import { formatDate } from "@/src/features/projects/utils";
import { requirePageRole } from "@/src/lib/auth/permissions";
import { getMaterials, archiveMaterialAction, restoreMaterialAction, deleteMaterialAction } from "@/src/server/actions/materials";
import { ArchivedToggle } from "@/components/shared/archived-toggle";
import { RestoreButton } from "@/components/shared/restore-button";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { ArchiveButton } from "@/components/shared/archive-button";

type MaterialsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MaterialsPage({
  searchParams,
}: MaterialsPageProps) {
  const currentUser = await requirePageRole(["owner", "admin", "purchasing"]);
  const isOwnerOrAdmin = currentUser.role === "owner" || currentUser.role === "admin";

  const params = await searchParams;
  const showArchived = getParam(params.archived) === "true";
  const filters = {
    search: getParam(params.search),
    projectId: getParam(params.projectId),
    vendorId: getParam(params.vendorId),
    status: getParam(params.status),
    urgencyLevel: getParam(params.urgencyLevel),
  };
  const parsedFilters = materialFiltersSchema.safeParse(filters);
  const materialFilters = parsedFilters.success ? parsedFilters.data : {};

  const [materials, metrics, options] = await Promise.all([
    getMaterials(materialFilters, showArchived),
    getMaterialIssueMetrics(showArchived),
    getMaterialFormOptions(),
  ]);

  return (
    <PageContainer className="max-w-none">
      <PageHeader
        title="Material Issue Tracker"
        description="Track urgent materials, vendor ownership, ETA risks, delivery status, and project impact."
        action={<MaterialDialog mode="create" options={options} />}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Open Issues"
          value={metrics.openIssues.toString()}
          badge={metrics.openIssues > 0 ? "Owner visible" : "Delayed, problem, high, or critical"}
          tone={metrics.openIssues > 0 ? "danger" : "primary"}
          icon={Alert02Icon}
        />
        <MetricCard
          label="Delayed"
          value={metrics.delayed.toString()}
          badge={metrics.delayed > 0 ? "Follow up" : "ETA or delivery risk"}
          tone={metrics.delayed > 0 ? "warning" : "primary"}
          icon={DeliveryTruck02Icon}
        />
        <MetricCard
          label="High / Critical"
          value={(metrics.high + metrics.critical).toString()}
          badge={metrics.critical > 0 ? "Critical" : `${metrics.critical} critical issue${metrics.critical === 1 ? "" : "s"}`}
          tone={metrics.critical > 0 ? "danger" : "primary"}
          icon={Alert02Icon}
        />
        <MetricCard
          label="Ready"
          value={metrics.ready.toString()}
          badge="Arrived or installed items"
          icon={CheckmarkCircle02Icon}
        />
      </div>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Material List</CardTitle>
          <CardDescription>
            Search, filter, and update purchasing issues by project, vendor,
            status, urgency, and ETA.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-3">
            <MaterialFilters filters={materialFilters} options={options} />
            {isOwnerOrAdmin ? <ArchivedToggle /> : null}
          </div>

          {materials.length > 0 ? (
            <DataTableShell>
              <Table className="min-w-[1120px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>Issue Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.map((material) => (
                    <TableRow key={material.id}>
                      <TableCell className="min-w-56">
                        <Link
                          href={`/projects/${material.projectId}`}
                          className="font-medium hover:underline"
                        >
                          {material.project.projectName}
                        </Link>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {material.project.clientName}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-52 font-medium">
                        {material.materialName}
                        {material.category ? (
                          <div className="mt-1 text-xs font-normal text-muted-foreground">
                            {material.category}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell className="min-w-44">
                        {material.vendor?.vendorName ?? "Unassigned"}
                        {material.vendor?.contactPerson ? (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {material.vendor.contactPerson}
                          </div>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <MaterialStatusBadge status={material.status} />
                      </TableCell>
                      <TableCell>
                        <MaterialUrgencyBadge
                          urgencyLevel={material.urgencyLevel}
                        />
                      </TableCell>
                      <TableCell>
                        {material.quantity
                          ? `${Number(material.quantity).toLocaleString("en")} ${material.unit ?? ""}`.trim()
                          : "Not set"}
                      </TableCell>
                      <TableCell>{formatDate(material.etaDate)}</TableCell>
                      <TableCell className="min-w-64">
                        {material.issueNotes ? (
                          <span className="line-clamp-2 text-muted-foreground">
                            {material.issueNotes}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No notes</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {showArchived
                          ? isOwnerOrAdmin ? (
                              <div className="flex items-center justify-end gap-2">
                                <RestoreButton action={restoreMaterialAction.bind(null, material.id)} />
                                <DeleteConfirmationDialog
                                  entityLabel={material.materialName}
                                  deleteAction={deleteMaterialAction.bind(null, material.id)}
                                />
                              </div>
                            ) : null
                          : (
                            <div className="flex items-center justify-end gap-2">
                              {(isOwnerOrAdmin || material.updater?.id === currentUser.id) ? (
                                <MaterialDialog
                                  mode="edit"
                                  material={material}
                                  options={options}
                                />
                              ) : null}
                              {isOwnerOrAdmin ? (
                                <ArchiveButton
                                  action={archiveMaterialAction.bind(
                                    null,
                                    material.id,
                                  )}
                                />
                              ) : null}
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
              title="No materials found"
              description="Adjust the filters or create the first material issue for purchasing visibility."
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
