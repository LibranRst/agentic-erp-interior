import { z } from "zod";

import {
  CONTENT_FOOTAGE_STATUSES,
  CONTENT_OPPORTUNITIES,
  CONTENT_STATUSES,
  CONTENT_VISUAL_STATUSES,
} from "./constants";
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

const optionalUrl = z.preprocess(
  emptyToUndefined,
  z.url("Enter a valid URL.").max(500, "URL is too long.").optional(),
);

const optionalUuid = z.preprocess(
  emptyToUndefined,
  z.uuid("Select a valid record.").optional(),
);

const requiredUuid = z.uuid("Select a valid record.");

export const uploadedContentMediaSchema = uploadedMediaSchema;

export const contentAssetMutationSchema = z.object({
  projectId: requiredUuid,
  roomArea: optionalText(160),
  visualStatus: z.preprocess(
    emptyToUndefined,
    z.enum(CONTENT_VISUAL_STATUSES).optional(),
  ),
  footageStatus: z.preprocess(
    emptyToUndefined,
    z.enum(CONTENT_FOOTAGE_STATUSES).optional(),
  ),
  contentOpportunity: z.preprocess(
    emptyToUndefined,
    z.enum(CONTENT_OPPORTUNITIES).optional(),
  ),
  suggestedAngle: optionalText(800),
  contentStatus: z.enum(CONTENT_STATUSES),
  publishUrl: optionalUrl,
  notes: optionalText(1200),
  mediaAssets: z.array(uploadedContentMediaSchema).default([]),
});

export const contentAssetFiltersSchema = z.object({
  search: optionalText(120),
  projectId: optionalUuid,
  contentOpportunity: z.preprocess(
    emptyToUndefined,
    z.enum(CONTENT_OPPORTUNITIES).optional(),
  ),
  contentStatus: z.preprocess(
    emptyToUndefined,
    z.enum(CONTENT_STATUSES).optional(),
  ),
});

export type UploadedContentMediaInput = z.infer<
  typeof uploadedContentMediaSchema
>;
export type ContentAssetMutationInput = z.infer<
  typeof contentAssetMutationSchema
>;
export type ContentAssetFilters = z.infer<typeof contentAssetFiltersSchema>;

export type ContentAssetActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export function parseContentAssetFormData(formData: FormData) {
  return contentAssetMutationSchema.safeParse({
    projectId: formData.get("projectId"),
    roomArea: formData.get("roomArea"),
    visualStatus: formData.get("visualStatus"),
    footageStatus: formData.get("footageStatus"),
    contentOpportunity: formData.get("contentOpportunity"),
    suggestedAngle: formData.get("suggestedAngle"),
    contentStatus: formData.get("contentStatus"),
    publishUrl: formData.get("publishUrl"),
    notes: formData.get("notes"),
    mediaAssets: parseMediaAssets(formData.get("mediaAssets")),
  });
}
