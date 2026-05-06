import { z } from "zod";

import { LEAD_STATUSES } from "./constants";
import {
  parseMediaAssets,
  uploadedMediaSchema,
} from "@/src/features/media/schemas";

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
  z.uuid("Select a valid team member.").optional(),
);

const optionalEstimatedValue = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Estimated value must be a valid amount.")
    .optional(),
);

export const leadMutationSchema = z.object({
  leadName: z
    .string()
    .trim()
    .min(2, "Lead name must be at least 2 characters.")
    .max(120, "Lead name is too long."),
  phone: optionalText(40),
  email: optionalText(160),
  source: optionalText(120),
  interest: optionalText(240),
  estimatedProjectValue: optionalEstimatedValue,
  status: z.enum(LEAD_STATUSES),
  assignedSalesId: optionalUuid,
  nextFollowUpDate: optionalDate,
  notes: optionalText(1200),
  mediaAssets: z.array(uploadedMediaSchema).default([]),
});

export const leadFiltersSchema = z.object({
  search: optionalText(120),
  status: z.preprocess(emptyToUndefined, z.enum(LEAD_STATUSES).optional()),
  assignedSalesId: optionalUuid,
  source: optionalText(120),
  followUp: z.preprocess(
    emptyToUndefined,
    z.enum(["due", "upcoming", "none"]).optional(),
  ),
});

export const leadConvertSchema = z.object({
  projectName: z
    .string()
    .trim()
    .min(2, "Project name must be at least 2 characters.")
    .max(160, "Project name is too long."),
  projectType: optionalText(80),
  roomArea: optionalText(120),
  location: optionalText(160),
  description: optionalText(1000),
  pmId: optionalUuid,
  designerId: optionalUuid,
});

export type LeadMutationInput = z.infer<typeof leadMutationSchema>;
export type UploadedLeadMediaInput = z.infer<typeof uploadedMediaSchema>;
export type LeadFilters = z.infer<typeof leadFiltersSchema>;
export type LeadConvertInput = z.infer<typeof leadConvertSchema>;

export type LeadActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export function parseLeadFormData(formData: FormData) {
  return leadMutationSchema.safeParse({
    leadName: formData.get("leadName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    source: formData.get("source"),
    interest: formData.get("interest"),
    estimatedProjectValue: formData.get("estimatedProjectValue"),
    status: formData.get("status"),
    assignedSalesId: formData.get("assignedSalesId"),
    nextFollowUpDate: formData.get("nextFollowUpDate"),
    notes: formData.get("notes"),
    mediaAssets: parseMediaAssets(formData.get("mediaAssets")),
  });
}

export function parseLeadConvertFormData(formData: FormData) {
  return leadConvertSchema.safeParse({
    projectName: formData.get("projectName"),
    projectType: formData.get("projectType"),
    roomArea: formData.get("roomArea"),
    location: formData.get("location"),
    description: formData.get("description"),
    pmId: formData.get("pmId"),
    designerId: formData.get("designerId"),
  });
}
