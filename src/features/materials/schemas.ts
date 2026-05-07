import { z } from "zod";

import {
  MATERIAL_STATUSES,
  MATERIAL_URGENCY_LEVELS,
} from "./constants";
import {
  parseMediaAssets,
  uploadedMediaSchema,
} from "@/src/features/media/schemas";
import type { FormActionState } from "@/src/lib/forms";

const emptyToUndefined = (value: unknown) => {
  if (typeof value === "string") {
    const trimmedValue = value.trim();
    return trimmedValue === "" ||
      trimmedValue === "all" ||
      trimmedValue === "unassigned"
      ? undefined
      : trimmedValue;
  }

  return value;
};

const optionalText = (maxLength: number) =>
  z.preprocess(
    emptyToUndefined,
    z.string().trim().max(maxLength).optional(),
  );

const optionalDate = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format.")
    .optional(),
);

const optionalUuid = z.preprocess(
  emptyToUndefined,
  z.uuid("Select a valid record.").optional(),
);

const requiredUuid = z.uuid("Select a valid record.");

const optionalQuantity = z.preprocess(
  (value) => {
    if (value === null || value === undefined || value === "") {
      return undefined;
    }

    return Number(value);
  },
  z
    .number("Quantity must be a number.")
    .positive("Quantity must be greater than 0.")
    .max(99999999, "Quantity is too high for MVP tracking.")
    .optional(),
);

export const materialMutationSchema = z.object({
  projectId: requiredUuid,
  materialName: z
    .string()
    .trim()
    .min(2, "Material name must be at least 2 characters.")
    .max(160, "Material name is too long."),
  category: optionalText(120),
  vendorId: optionalUuid,
  status: z.enum(MATERIAL_STATUSES),
  urgencyLevel: z.enum(MATERIAL_URGENCY_LEVELS),
  quantity: optionalQuantity,
  unit: optionalText(40),
  etaDate: optionalDate,
  issueNotes: optionalText(1200),
  mediaAssets: z.array(uploadedMediaSchema).default([]),
});

export const materialFiltersSchema = z.object({
  search: optionalText(120),
  projectId: optionalUuid,
  vendorId: optionalUuid,
  status: z.preprocess(emptyToUndefined, z.enum(MATERIAL_STATUSES).optional()),
  urgencyLevel: z.preprocess(
    emptyToUndefined,
    z.enum(MATERIAL_URGENCY_LEVELS).optional(),
  ),
});

export const materialStatusUpdateSchema = z.object({
  status: z.enum(MATERIAL_STATUSES),
});

export const materialUrgencyUpdateSchema = z.object({
  urgencyLevel: z.enum(MATERIAL_URGENCY_LEVELS),
});

export type MaterialMutationInput = z.infer<typeof materialMutationSchema>;
export type UploadedMaterialMediaInput = z.infer<typeof uploadedMediaSchema>;
export type MaterialFilters = z.infer<typeof materialFiltersSchema>;
export type MaterialStatusUpdateInput = z.infer<
  typeof materialStatusUpdateSchema
>;
export type MaterialUrgencyUpdateInput = z.infer<
  typeof materialUrgencyUpdateSchema
>;

export type MaterialActionState = FormActionState;

export function parseMaterialFormData(formData: FormData) {
  return materialMutationSchema.safeParse({
    projectId: formData.get("projectId"),
    materialName: formData.get("materialName"),
    category: formData.get("category"),
    vendorId: formData.get("vendorId"),
    status: formData.get("status"),
    urgencyLevel: formData.get("urgencyLevel"),
    quantity: formData.get("quantity"),
    unit: formData.get("unit"),
    etaDate: formData.get("etaDate"),
    issueNotes: formData.get("issueNotes"),
    mediaAssets: parseMediaAssets(formData.get("mediaAssets")),
  });
}
