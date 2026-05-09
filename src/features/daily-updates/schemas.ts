import { z } from "zod";

import { DAILY_UPDATE_HEALTH_STATUSES } from "./constants";
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

const requiredDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format.");

const optionalUuid = z.preprocess(
  emptyToUndefined,
  z.uuid("Select a valid record.").optional(),
);

const requiredUuid = z.uuid("Select a valid record.");

const optionalProgressPercentage = z.preprocess(
  emptyToUndefined,
  z.coerce
    .number("Progress must be a number.")
    .int("Progress must be a whole number.")
    .min(0, "Progress cannot be below 0%.")
    .max(100, "Progress cannot be above 100%.")
    .optional(),
);

export const uploadedDailyUpdateMediaSchema = uploadedMediaSchema;

export const dailyUpdateMutationSchema = z.object({
  projectId: requiredUuid,
  updateDate: requiredDate,
  progressSummary: z
    .string()
    .trim()
    .min(3, "Progress summary must be at least 3 characters.")
    .max(1200, "Progress summary is too long."),
  workCompleted: optionalText(1200),
  issueNotes: optionalText(1200),
  blockerNotes: optionalText(1200),
  needOwnerAttention: z.preprocess(
    (value) => (value === "true" ? true : value === "on" ? true : false),
    z.boolean().default(false),
  ),
  nextAction: optionalText(800),
  progressPercentage: optionalProgressPercentage,
  healthStatus: z.preprocess(
    emptyToUndefined,
    z.enum(DAILY_UPDATE_HEALTH_STATUSES).optional(),
  ),
  mediaAssets: z.array(uploadedDailyUpdateMediaSchema).default([]),
});

export const dailyUpdateFiltersSchema = z.object({
  projectId: optionalUuid,
  healthStatus: z.preprocess(
    emptyToUndefined,
    z.enum(DAILY_UPDATE_HEALTH_STATUSES).optional(),
  ),
  updateDate: optionalDate,
});

export type UploadedDailyUpdateMediaInput = z.infer<
  typeof uploadedDailyUpdateMediaSchema
>;
export type DailyUpdateMutationInput = z.infer<
  typeof dailyUpdateMutationSchema
>;
export type DailyUpdateFilters = z.infer<typeof dailyUpdateFiltersSchema>;

export type DailyUpdateActionState = FormActionState;

export function parseDailyUpdateFormData(formData: FormData) {
  return dailyUpdateMutationSchema.safeParse({
    projectId: formData.get("projectId"),
    updateDate: formData.get("updateDate"),
    progressSummary: formData.get("progressSummary"),
    workCompleted: formData.get("workCompleted"),
    issueNotes: formData.get("issueNotes"),
    blockerNotes: formData.get("blockerNotes"),
    needOwnerAttention: formData.get("needOwnerAttention"),
    nextAction: formData.get("nextAction"),
    progressPercentage: formData.get("progressPercentage"),
    healthStatus: formData.get("healthStatus"),
    mediaAssets: parseMediaAssets(formData.get("mediaAssets")),
  });
}
