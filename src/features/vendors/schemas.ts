import { z } from "zod";

import { VENDOR_CATEGORIES } from "./constants";
import type { FormActionState } from "@/src/lib/forms";

const emptyToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
};

const optionalText = (maxLength: number) =>
  z.preprocess(
    emptyToUndefined,
    z.string().trim().max(maxLength).optional(),
  );

export const vendorMutationSchema = z.object({
  vendorName: z
    .string()
    .trim()
    .min(2, "Vendor name must be at least 2 characters.")
    .max(120, "Vendor name is too long."),
  contactPerson: optionalText(80),
  phone: optionalText(40),
  category: z.preprocess(
    emptyToUndefined,
    z.enum(VENDOR_CATEGORIES).optional(),
  ),
  notes: optionalText(600),
});

export const vendorFiltersSchema = z.object({
  search: optionalText(120),
  category: z.preprocess(
    emptyToUndefined,
    z.enum(VENDOR_CATEGORIES).optional(),
  ),
});

export type VendorMutationInput = z.infer<typeof vendorMutationSchema>;
export type VendorFilters = z.infer<typeof vendorFiltersSchema>;
export type VendorActionState = FormActionState;

export function parseVendorFormData(formData: FormData) {
  return vendorMutationSchema.safeParse({
    vendorName: formData.get("vendorName"),
    contactPerson: formData.get("contactPerson"),
    phone: formData.get("phone"),
    category: formData.get("category"),
    notes: formData.get("notes"),
  });
}
