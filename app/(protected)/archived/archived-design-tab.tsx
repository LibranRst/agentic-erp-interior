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
import { getDesignTasksQuery } from "@/src/features/design/queries";
import {
  restoreDesignTaskAction,
  deleteDesignTaskAction,
} from "@/src/server/actions/design";
import { DesignTaskStatusBadge } from "@/src/features/design/components/design-badges";
import { formatDate } from "@/src/features/projects/utils";

export async function ArchivedDesignTab() {
  const tasks = await getDesignTasksQuery({}, true);

  return (
    <DataTableShell>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>
                <RecordEmptyState
                  title="No archived design tasks"
                  description="Archived design tasks will appear here."
                  className="border-0 p-6"
                />
              </TableCell>
            </TableRow>
          ) : (
            tasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.taskName}</TableCell>
                <TableCell className="text-muted-foreground">
                  {task.project.projectName}
                </TableCell>
                <TableCell>
                  <DesignTaskStatusBadge status={task.status} />
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(task.dueDate)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <RestoreButton
                      action={restoreDesignTaskAction.bind(null, task.id)}
                      label="Restore"
                    />
                    <DeleteConfirmationDialog
                      entityLabel={task.taskName}
                      deleteAction={deleteDesignTaskAction.bind(null, task.id)}
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
