import {
  FileImageIcon,
  Image02Icon,
  PaintBoardIcon,
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
  getLatestMediaAssets,
  getMediaLibraryMetrics,
} from "@/src/features/media/queries"
import { formatDate } from "@/src/features/projects/utils"
import { requirePageUser } from "@/src/lib/auth/permissions"

export default async function MediaPage() {
  await requirePageUser()

  const [metrics, mediaAssets] = await Promise.all([
    getMediaLibraryMetrics(),
    getLatestMediaAssets(30),
  ])

  return (
    <PageContainer>
      <PageHeader
        title="Media"
        description="Read-only library of ImageKit-backed files already attached to MVP operational records."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Assets"
          value={metrics.assets.toString()}
          description="Total saved media records"
          icon={Image02Icon}
        />
        <MetricCard
          title="Progress Photos"
          value={metrics.progressPhotos.toString()}
          description="Attached to PM updates"
          icon={FileImageIcon}
        />
        <MetricCard
          title="Design Files"
          value={metrics.designFiles.toString()}
          description="Attached to design tasks"
          icon={PaintBoardIcon}
        />
        <MetricCard
          title="Content Files"
          value={metrics.contentFiles.toString()}
          description="Attached to content assets"
          icon={FileImageIcon}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Latest Media</CardTitle>
          <CardDescription>
            Recent files saved through project, PM, design, material, sales, and content workflows.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTableShell>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Context</TableHead>
                  <TableHead>Uploaded By</TableHead>
                  <TableHead>Uploaded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mediaAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">
                      <a
                        href={asset.imagekitUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="underline-offset-4 hover:underline"
                      >
                        {asset.fileName}
                      </a>
                    </TableCell>
                    <TableCell>
                      {asset.project?.projectName ?? "No project"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {formatRelatedType(asset.relatedType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {asset.uploader?.name ?? "Unknown"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(asset.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {mediaAssets.length === 0 ? (
              <RecordEmptyState
                title="No media assets"
                description="Files uploaded from MVP module forms will appear here."
                className="border-0 p-8"
              />
            ) : null}
          </DataTableShell>
        </CardContent>
      </Card>
    </PageContainer>
  )
}

function formatRelatedType(value: string) {
  return value
    .split("_")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ")
}
