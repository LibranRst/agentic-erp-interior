"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getVendorsQuery } from "@/src/features/vendors/queries";
import {
  parseVendorFormData,
  vendorFiltersSchema,
  type VendorActionState,
  type VendorMutationInput,
} from "@/src/features/vendors/schemas";
import {
  requirePermission,
  requireRole,
  requireUser,
} from "@/src/lib/auth/permissions";
import { db, schema } from "@/src/lib/db";
import { getZodFieldErrors } from "@/src/lib/forms";

const vendorIdSchema = z.uuid("Vendor id is invalid.");

export async function getVendors(filters: unknown = {}) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "vendor:view");
  requireRole(currentUser, ["owner", "admin", "purchasing"]);

  const parsed = vendorFiltersSchema.safeParse(filters);

  return getVendorsQuery(parsed.success ? parsed.data : {});
}

export async function createVendorAction(
  _state: VendorActionState,
  formData: FormData,
): Promise<VendorActionState> {
  const currentUser = await requireUser();
  requirePermission(currentUser, "vendor:create");
  requireRole(currentUser, ["owner", "admin", "purchasing"]);

  const parsed = parseVendorFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Vendor data is invalid.",
      fieldErrors: getZodFieldErrors(parsed.error),
    };
  }

  await db.insert(schema.vendors).values(toVendorValues(parsed.data));

  revalidatePath("/vendors");

  return {
    status: "success",
    message: "Vendor created.",
  };
}

export async function updateVendorAction(
  vendorId: string,
  _state: VendorActionState,
  formData: FormData,
): Promise<VendorActionState> {
  const currentUser = await requireUser();
  requirePermission(currentUser, "vendor:update");
  requireRole(currentUser, ["owner", "admin", "purchasing"]);

  const parsedVendorId = vendorIdSchema.safeParse(vendorId);

  if (!parsedVendorId.success) {
    return {
      status: "error",
      message: "Vendor id is invalid.",
    };
  }

  const parsed = parseVendorFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Vendor data is invalid.",
      fieldErrors: getZodFieldErrors(parsed.error),
    };
  }

  const [vendor] = await db
    .update(schema.vendors)
    .set(toVendorValues(parsed.data))
    .where(eq(schema.vendors.id, parsedVendorId.data))
    .returning({ id: schema.vendors.id });

  if (!vendor) {
    return {
      status: "error",
      message: "Vendor was not found.",
    };
  }

  revalidatePath("/vendors");

  return {
    status: "success",
    message: "Vendor updated.",
  };
}

function toVendorValues(data: VendorMutationInput) {
  return {
    vendorName: data.vendorName,
    contactPerson: data.contactPerson ?? null,
    phone: data.phone ?? null,
    category: data.category ?? null,
    notes: data.notes ?? null,
  } satisfies typeof schema.vendors.$inferInsert;
}
