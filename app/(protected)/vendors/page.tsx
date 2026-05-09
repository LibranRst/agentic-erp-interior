import { PageContainer, PageHeader } from "@/components/layout/page-container";
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
import { Badge } from "@/components/ui/badge";
import { ArchivedToggle } from "@/components/shared/archived-toggle";
import { ArchiveButton } from "@/components/shared/archive-button";
import { RestoreButton } from "@/components/shared/restore-button";
import { DeleteConfirmationDialog } from "@/components/shared/delete-confirmation-dialog";
import { requirePageRole } from "@/src/lib/auth/permissions";
import {
  archiveVendorAction,
  deleteVendorAction,
  getVendors,
  restoreVendorAction,
} from "@/src/server/actions/vendors";
import { vendorCategoryLabels, VENDOR_CATEGORIES, type VendorCategory } from "@/src/features/vendors/constants";
import type { VendorFilters } from "@/src/features/vendors/schemas";
import { VendorDialog } from "./vendor-dialog";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const currentUser = await requirePageRole(["owner", "admin", "purchasing"]);
  const isOwnerOrAdmin = currentUser.role === "owner" || currentUser.role === "admin";

  const params = await searchParams;
  const showArchived = getParam(params.archived) === "true";
  const rawCategory =
    typeof params.category === "string" ? params.category : undefined;
  const category = (
    VENDOR_CATEGORIES as readonly string[]
  ).includes(rawCategory ?? "")
    ? (rawCategory as VendorCategory)
    : undefined;

  const filters: VendorFilters = {
    search: typeof params.search === "string" ? params.search : undefined,
    category,
  };

  const vendors = await getVendors(filters, showArchived);

  return (
    <PageContainer className="max-w-none">
      <PageHeader
        title="Vendors"
        description="Manage suppliers, contact details, and categories."
        action={
          showArchived ? undefined : <VendorDialog mode="create" />
        }
      />
      <div className="mb-4 flex flex-col gap-3">
        {isOwnerOrAdmin ? <ArchivedToggle /> : null}
      </div>
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
                    title="No vendors"
                    description={
                      showArchived
                        ? "Archived vendors will appear here."
                        : "Add your first supplier to start tracking material sources."
                    }
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
                        ? vendorCategoryLabels[
                            vendor.category as VendorCategory
                          ]
                        : vendor.category}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {showArchived
                      ? isOwnerOrAdmin ? (
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
                        ) : null
                      : (
                        <div className="flex items-center justify-end gap-2">
                          <VendorDialog mode="edit" initialData={vendor} />
                          {isOwnerOrAdmin ? (
                            <ArchiveButton
                              action={archiveVendorAction.bind(null, vendor.id)}
                            />
                          ) : null}
                        </div>
                      )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </DataTableShell>
    </PageContainer>
  );
}

function getParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
