import Link from "next/link";
import {
  Camera01Icon,
  CheckmarkCircle02Icon,
  Image02Icon,
  Video02Icon,
} from "@hugeicons/core-free-icons";

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
  ContentFootageStatusBadge,
  ContentOpportunityBadge,
  ContentStatusBadge,
  ContentVisualStatusBadge,
} from "@/src/features/content/components/content-badges";
import { ContentAssetDialog } from "@/src/features/content/components/content-dialog";
import { ContentAssetFilters } from "@/src/features/content/components/content-filters";
import {
  getContentAssetFormOptions,
  getContentAssetMetrics,
} from "@/src/features/content/queries";
import { contentAssetFiltersSchema } from "@/src/features/content/schemas";
import { requirePageRole } from "@/src/lib/auth/permissions";
import { getContentAssets, archiveContentAssetAction, restoreContentAssetAction, deleteContentAssetAction } from "@/src/server/actions/content";
import { ArchivedToggle } from "@/components/shared/archived-toggle";
import { RestoreButton } from "@/components/shared/restore-button";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { ArchiveButton } from "@/components/shared/archive-button";

type ContentPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ContentPage({
  searchParams,
}: ContentPageProps) {
  const currentUser = await requirePageRole(["owner", "admin", "marketing"]);
  const isOwnerOrAdmin = currentUser.role === "owner" || currentUser.role === "admin";

  const params = await searchParams;
  const showArchived = getParam(params.archived) === "true";
  const filters = {
    search: getParam(params.search),
    projectId: getParam(params.projectId),
    contentOpportunity: getParam(params.contentOpportunity),
    contentStatus: getParam(params.contentStatus),
  };
  const parsedFilters = contentAssetFiltersSchema.safeParse(filters);
  const contentFilters = parsedFilters.success ? parsedFilters.data : {};

  const [assets, metrics, options] = await Promise.all([
    getContentAssets(contentFilters, showArchived),
    getContentAssetMetrics(showArchived),
    getContentAssetFormOptions(),
  ]);

  return (
    <PageContainer className="max-w-none">
      <PageHeader
        title="Content Readiness"
        description="Track project rooms, visual availability, footage, content angles, publishing state, and ImageKit media."
        action={<ContentAssetDialog mode="create" options={options} />}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Ready to Shoot"
          value={metrics.readyToShoot.toString()}
          badge={metrics.readyToShoot > 0 ? "Schedule" : "Shoot candidates queued for marketing"}
          tone={metrics.readyToShoot > 0 ? "success" : "primary"}
          icon={Camera01Icon}
        />
        <MetricCard
          label="Footage Available"
          value={metrics.footageAvailable.toString()}
          badge={metrics.footageAvailable > 0 ? "Review" : "Raw media available for content"}
          tone={metrics.footageAvailable > 0 ? "warning" : "primary"}
          icon={Video02Icon}
        />
        <MetricCard
          label="Editing"
          value={metrics.editing.toString()}
          badge="Assets currently in production"
          icon={Image02Icon}
        />
        <MetricCard
          label="Published"
          value={metrics.published.toString()}
          badge="Completed content records"
          icon={CheckmarkCircle02Icon}
        />
      </div>

      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Content Assets</CardTitle>
          <CardDescription>
            Search, filter, and update marketing opportunities by project,
            room, asset state, angle, publishing URL, and status.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-3">
            <ContentAssetFilters filters={contentFilters} options={options} />
            {isOwnerOrAdmin ? <ArchivedToggle /> : null}
          </div>

          {assets.length > 0 ? (
            <DataTableShell>
              <Table className="min-w-[1280px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Room / Area</TableHead>
                    <TableHead>Visual</TableHead>
                    <TableHead>Footage</TableHead>
                    <TableHead>Opportunity</TableHead>
                    <TableHead>Suggested Angle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Media</TableHead>
                    <TableHead>Publish URL</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="min-w-56">
                        <Link
                          href={`/projects/${asset.projectId}`}
                          className="font-medium hover:underline"
                        >
                          {asset.project.projectName}
                        </Link>
                        <div className="mt-1 text-xs text-muted-foreground">
                          {asset.project.clientName}
                        </div>
                      </TableCell>
                      <TableCell className="min-w-40 font-medium">
                        {asset.roomArea ?? "General"}
                      </TableCell>
                      <TableCell>
                        <ContentVisualStatusBadge
                          status={asset.visualStatus}
                        />
                      </TableCell>
                      <TableCell>
                        <ContentFootageStatusBadge
                          status={asset.footageStatus}
                        />
                      </TableCell>
                      <TableCell>
                        <ContentOpportunityBadge
                          opportunity={asset.contentOpportunity}
                        />
                      </TableCell>
                      <TableCell className="min-w-72">
                        {asset.suggestedAngle ? (
                          <span className="line-clamp-2 text-muted-foreground">
                            {asset.suggestedAngle}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            No angle
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <ContentStatusBadge status={asset.contentStatus} />
                      </TableCell>
                      <TableCell>
                        {asset.mediaAssets.length > 0 ? (
                          <Link
                            href={asset.mediaAssets[0]?.imagekitUrl ?? "#"}
                            target="_blank"
                            className="hover:underline"
                          >
                            {asset.mediaAssets.length} file
                            {asset.mediaAssets.length === 1 ? "" : "s"}
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">0 files</span>
                        )}
                      </TableCell>
                      <TableCell className="min-w-52">
                        {asset.publishUrl ? (
                          <Link
                            href={asset.publishUrl}
                            target="_blank"
                            className="truncate hover:underline"
                          >
                            Open link
                          </Link>
                        ) : (
                          <span className="text-muted-foreground">Not set</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {showArchived
                          ? isOwnerOrAdmin ? (
                              <div className="flex items-center justify-end gap-2">
                                <RestoreButton action={restoreContentAssetAction.bind(null, asset.id)} />
                                <DeleteConfirmationDialog
                                  entityLabel={asset.roomArea ?? asset.project.projectName}
                                  deleteAction={deleteContentAssetAction.bind(null, asset.id)}
                                />
                              </div>
                            ) : null
                          : (
                            <div className="flex items-center justify-end gap-2">
                              {(isOwnerOrAdmin || asset.assignee?.id === currentUser.id) ? (
                                <ContentAssetDialog
                                  mode="edit"
                                  asset={asset}
                                  options={options}
                                />
                              ) : null}
                              {isOwnerOrAdmin ? (
                                <ArchiveButton
                                  action={archiveContentAssetAction.bind(null, asset.id)}
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
              title="No content assets found"
              description="Adjust the filters or create the first content opportunity for marketing readiness."
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
