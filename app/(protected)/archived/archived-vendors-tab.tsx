import { DataTableShell, RecordEmptyState } from "@/components/shared/data-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RestoreButton } from "@/components/shared/restore-button";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { deleteVendorAction, getVendors, restoreVendorAction } from "@/src/server/actions/vendors";
import { vendorCategoryLabels, type VendorCategory } from "@/src/features/vendors/constants";

export async function ArchivedVendorsTab() {
  const vendors = await getVendors({}, true);

  return (
    <DataTableShell>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vendor</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vendors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>
                <RecordEmptyState
                  title="No archived vendors"
                  description="Archived vendors will appear here."
                  className="border-0 p-6"
                />
              </TableCell>
            </TableRow>
          ) : (
            vendors.map((vendor) => (
              <TableRow key={vendor.id}>
                <TableCell className="max-w-64 truncate font-medium">
                  {vendor.vendorName}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {vendor.contactPerson ?? "-"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {vendor.phone ?? "-"}
                </TableCell>
                <TableCell>
                  {vendor.category ? (
                    <Badge variant="secondary">
                      {vendor.category in vendorCategoryLabels
                        ? vendorCategoryLabels[vendor.category as VendorCategory]
                        : vendor.category}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <RestoreButton
                      action={restoreVendorAction.bind(null, vendor.id)}
                      label="Restore"
                    />
                    <DeleteConfirmationDialog
                      entityLabel={vendor.vendorName}
                      deleteAction={deleteVendorAction.bind(null, vendor.id)}
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
