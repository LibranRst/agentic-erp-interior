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
import { getProjectsQuery } from "@/src/features/projects/queries";
import {
  restoreProjectAction,
  deleteProjectAction,
} from "@/src/server/actions/projects";

export async function ArchivedProjectsTab() {
  const projects = await getProjectsQuery({}, true);

  return (
    <DataTableShell>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>
                <RecordEmptyState
                  title="No archived projects"
                  description="Archived projects will appear here."
                  className="border-0 p-6"
                />
              </TableCell>
            </TableRow>
          ) : (
            projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">
                  {project.projectName}
                </TableCell>
                <TableCell>{project.clientName}</TableCell>
                <TableCell className="text-muted-foreground">
                  {project.status}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <RestoreButton
                      action={restoreProjectAction.bind(null, project.id)}
                      label="Restore"
                    />
                    <DeleteConfirmationDialog
                      entityLabel={project.projectName}
                      deleteAction={deleteProjectAction.bind(null, project.id)}
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
