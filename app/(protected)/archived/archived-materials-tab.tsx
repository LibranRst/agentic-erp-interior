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
import { getMaterialsQuery } from "@/src/features/materials/queries";
import {
  restoreMaterialAction,
  deleteMaterialAction,
} from "@/src/server/actions/materials";
import { MaterialStatusBadge } from "@/src/features/materials/components/material-badges";

export async function ArchivedMaterialsTab() {
  const materials = await getMaterialsQuery({}, true);

  return (
    <DataTableShell>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Material</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {materials.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>
                <RecordEmptyState
                  title="No archived materials"
                  description="Archived material issues will appear here."
                  className="border-0 p-6"
                />
              </TableCell>
            </TableRow>
          ) : (
            materials.map((material) => (
              <TableRow key={material.id}>
                <TableCell className="font-medium">
                  {material.materialName}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {material.project.projectName}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {material.vendor?.vendorName ?? "-"}
                </TableCell>
                <TableCell>
                  <MaterialStatusBadge status={material.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <RestoreButton
                      action={restoreMaterialAction.bind(null, material.id)}
                      label="Restore"
                    />
                    <DeleteConfirmationDialog
                      entityLabel={material.materialName}
                      deleteAction={deleteMaterialAction.bind(null, material.id)}
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
