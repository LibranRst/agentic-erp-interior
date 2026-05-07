import {
  DataTableShell,
  RecordEmptyState,
} from "@/components/shared/data-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RestoreButton } from "@/components/shared/restore-button";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { getContentAssetsQuery } from "@/src/features/content/queries";
import {
  restoreContentAssetAction,
  deleteContentAssetAction,
} from "@/src/server/actions/content";
import { ContentStatusBadge } from "@/src/features/content/components/content-badges";

export async function ArchivedContentTab() {
  const assets = await getContentAssetsQuery({}, true);

  return (
    <DataTableShell>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Room / Area</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>
                <RecordEmptyState
                  title="No archived content assets"
                  description="Archived content assets will appear here."
                  className="border-0 p-6"
                />
              </TableCell>
            </TableRow>
          ) : (
            assets.map((asset) => (
              <TableRow key={asset.id}>
                <TableCell className="font-medium">
                  {asset.project.projectName}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {asset.roomArea ?? "General"}
                </TableCell>
                <TableCell>
                  <ContentStatusBadge status={asset.contentStatus} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <RestoreButton
                      action={restoreContentAssetAction.bind(null, asset.id)}
                      label="Restore"
                    />
                    <DeleteConfirmationDialog
                      entityLabel={`content for ${asset.project.projectName}`}
                      deleteAction={deleteContentAssetAction.bind(
                        null,
                        asset.id,
                      )}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </DataTableShell>
  );
}
