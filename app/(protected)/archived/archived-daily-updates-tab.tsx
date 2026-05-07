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
import { getLatestDailyUpdatesQuery } from "@/src/features/daily-updates/queries";
import {
  restoreDailyUpdateAction,
  deleteDailyUpdateAction,
} from "@/src/server/actions/daily-updates";
import { DailyUpdateHealthBadge } from "@/src/features/daily-updates/components/daily-update-badges";
import { formatDate } from "@/src/features/projects/utils";

export async function ArchivedDailyUpdatesTab() {
  const updates = await getLatestDailyUpdatesQuery(30, undefined, true);

  return (
    <DataTableShell>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Summary</TableHead>
            <TableHead>Health</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {updates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>
                <RecordEmptyState
                  title="No archived daily updates"
                  description="Archived daily updates will appear here."
                  className="border-0 p-6"
                />
              </TableCell>
            </TableRow>
          ) : (
            updates.map((update) => (
              <TableRow key={update.id}>
                <TableCell className="font-medium">
                  {update.project.projectName}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(update.updateDate)}
                </TableCell>
                <TableCell className="max-w-64 truncate text-muted-foreground">
                  {update.progressSummary}
                </TableCell>
                <TableCell>
                  <DailyUpdateHealthBadge
                    healthStatus={update.healthStatus}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <RestoreButton
                      action={restoreDailyUpdateAction.bind(null, update.id)}
                      label="Restore"
                    />
                    <DeleteConfirmationDialog
                      entityLabel={`update for ${update.project.projectName}`}
                      deleteAction={deleteDailyUpdateAction.bind(
                        null,
                        update.id,
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
