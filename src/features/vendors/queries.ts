import { and, asc, eq, ilike, isNotNull, isNull, or, type SQL } from "drizzle-orm";

import { db, schema } from "@/src/lib/db";

import type { VendorFilters } from "./schemas";

export type VendorListItem = Awaited<ReturnType<typeof getVendorsQuery>>[number];

export async function getVendorsQuery(
  filters: VendorFilters = {},
  includeArchived = false,
) {
  return db.query.vendors.findMany({
    where: and(
      buildVendorWhere(filters),
      includeArchived
        ? isNotNull(schema.vendors.archivedAt)
        : isNull(schema.vendors.archivedAt),
    ),
    orderBy: [asc(schema.vendors.vendorName)],
  });
}

function buildVendorWhere(filters: VendorFilters) {
  const conditions: SQL[] = [];

  if (filters.search) {
    const searchValue = `%${filters.search}%`;
    const searchCondition = or(
      ilike(schema.vendors.vendorName, searchValue),
      ilike(schema.vendors.contactPerson, searchValue),
      ilike(schema.vendors.phone, searchValue),
      ilike(schema.vendors.notes, searchValue),
    );

    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (filters.category) {
    conditions.push(eq(schema.vendors.category, filters.category));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}
