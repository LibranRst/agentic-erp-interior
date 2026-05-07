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
import { requirePageRole } from "@/src/lib/auth/permissions";
import { getVendors } from "@/src/server/actions/vendors";
import { vendorCategoryLabels, VENDOR_CATEGORIES, type VendorCategory } from "@/src/features/vendors/constants";
import type { VendorFilters } from "@/src/features/vendors/schemas";
import { VendorDialog } from "./vendor-dialog";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function VendorsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  await requirePageRole(["owner", "admin", "purchasing"]);

  const params = await searchParams;
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

  const vendors = await getVendors(filters);

  return (
    <PageContainer>
      <PageHeader
        title="Vendors"
        description="Manage suppliers, contact details, and categories."
        action={<VendorDialog mode="create" />}
      />
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
                    description="Add your first supplier to start tracking material sources."
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
                    <VendorDialog mode="edit" initialData={vendor} />
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
