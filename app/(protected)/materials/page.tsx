import Link from "next/link";

import { PageContainer, PageHeader } from "@/components/layout/page-container";
import { MetricCard } from "@/components/shared/metric-card";
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
import { getMaterials } from "@/src/server/actions/materials";

type MaterialsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MaterialsPage({
  searchParams,
}: MaterialsPageProps) {
  await requirePageRole(["owner", "admin", "purchasing"]);

  const params = await searchParams;
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
    getMaterials(materialFilters),
    getMaterialIssueMetrics(),
    getMaterialFormOptions(),
  ]);

  return (
    <PageContainer className="overflow-x-hidden">
      <PageHeader
        title="Material Issue Tracker"
        description="Track urgent materials, vendor ownership, ETA risks, delivery status, and project impact."
        action={<MaterialDialog mode="create" options={options} />}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Open Issues"
          value={metrics.openIssues.toString()}
          description="Delayed, problem, high, or critical materials"
          badge={metrics.openIssues > 0 ? "Owner visible" : undefined}
        />
        <MetricCard
          title="Delayed"
          value={metrics.delayed.toString()}
          description="ETA or delivery risk"
          badge={metrics.delayed > 0 ? "Follow up" : undefined}
        />
        <MetricCard
          title="High / Critical"
          value={(metrics.high + metrics.critical).toString()}
          description={`${metrics.critical} critical issue${metrics.critical === 1 ? "" : "s"}`}
          badge={metrics.critical > 0 ? "Critical" : undefined}
        />
        <MetricCard
          title="Ready"
          value={metrics.ready.toString()}
          description="Arrived or installed items"
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
          <MaterialFilters filters={materialFilters} options={options} />

          {materials.length > 0 ? (
            <div className="min-w-0 rounded-xl border">
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
                        <MaterialDialog
                          mode="edit"
                          material={material}
                          options={options}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No materials found</EmptyTitle>
                <EmptyDescription>
                  Adjust the filters or create the first material issue for
                  purchasing visibility.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
