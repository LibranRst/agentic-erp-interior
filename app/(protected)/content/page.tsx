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
import { getContentAssets } from "@/src/server/actions/content";

type ContentPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ContentPage({
  searchParams,
}: ContentPageProps) {
  await requirePageRole(["owner", "admin", "marketing"]);

  const params = await searchParams;
  const filters = {
    search: getParam(params.search),
    projectId: getParam(params.projectId),
    contentOpportunity: getParam(params.contentOpportunity),
    contentStatus: getParam(params.contentStatus),
  };
  const parsedFilters = contentAssetFiltersSchema.safeParse(filters);
  const contentFilters = parsedFilters.success ? parsedFilters.data : {};

  const [assets, metrics, options] = await Promise.all([
    getContentAssets(contentFilters),
    getContentAssetMetrics(),
    getContentAssetFormOptions(),
  ]);

  return (
    <PageContainer className="overflow-x-hidden">
      <PageHeader
        title="Content Readiness"
        description="Track project rooms, visual availability, footage, content angles, publishing state, and ImageKit media."
        action={<ContentAssetDialog mode="create" options={options} />}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Ready to Shoot"
          value={metrics.readyToShoot.toString()}
          description="Shoot candidates queued for marketing"
          badge={metrics.readyToShoot > 0 ? "Schedule" : undefined}
        />
        <MetricCard
          title="Footage Available"
          value={metrics.footageAvailable.toString()}
          description="Raw media available for content"
          badge={metrics.footageAvailable > 0 ? "Review" : undefined}
        />
        <MetricCard
          title="Editing"
          value={metrics.editing.toString()}
          description="Assets currently in production"
        />
        <MetricCard
          title="Published"
          value={metrics.published.toString()}
          description="Completed content records"
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
          <ContentAssetFilters filters={contentFilters} options={options} />

          {assets.length > 0 ? (
            <div className="min-w-0 rounded-xl border">
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
                        <ContentAssetDialog
                          mode="edit"
                          asset={asset}
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
                <EmptyTitle>No content assets found</EmptyTitle>
                <EmptyDescription>
                  Adjust the filters or create the first content opportunity for
                  marketing readiness.
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
