import { z } from "zod";

import {
  DESIGN_APPROVAL_STATUSES,
  DESIGN_TASK_STATUSES,
  DESIGN_TYPES,
} from "./constants";

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

const revisionCount = z.preprocess(
  (value) => {
    if (value === null || value === undefined || value === "") {
      return 0;
    }

    return Number(value);
  },
  z
    .number("Revision count must be a number.")
    .int("Revision count must be a whole number.")
    .min(0, "Revision count cannot be below 0.")
    .max(99, "Revision count is too high for MVP tracking."),
);

export const uploadedDesignMediaSchema = z.object({
  fileName: z.string().trim().min(1).max(240),
  fileType: z.string().trim().max(80).optional(),
  mimeType: z.string().trim().max(120).optional(),
  fileSize: z.number().int().positive().optional(),
  imagekitFileId: z.string().trim().min(1).max(240),
  imagekitUrl: z.url(),
  thumbnailUrl: z.url().optional(),
  folderPath: z.string().trim().max(500).optional(),
});

export const designTaskMutationSchema = z.object({
  projectId: requiredUuid,
  designerId: optionalUuid,
  taskName: z
    .string()
    .trim()
    .min(2, "Task name must be at least 2 characters.")
    .max(160, "Task name is too long."),
  designType: z.enum(DESIGN_TYPES),
  status: z.enum(DESIGN_TASK_STATUSES),
  approvalStatus: z.enum(DESIGN_APPROVAL_STATUSES),
  revisionCount,
  dueDate: optionalDate,
  notes: optionalText(1000),
  mediaAssets: z.array(uploadedDesignMediaSchema).default([]),
});

export const designTaskFiltersSchema = z.object({
  search: optionalText(120),
  projectId: optionalUuid,
  designerId: optionalUuid,
  designType: z.preprocess(emptyToUndefined, z.enum(DESIGN_TYPES).optional()),
  status: z.preprocess(
    emptyToUndefined,
    z.enum(DESIGN_TASK_STATUSES).optional(),
  ),
  approvalStatus: z.preprocess(
    emptyToUndefined,
    z.enum(DESIGN_APPROVAL_STATUSES).optional(),
  ),
});

export type UploadedDesignMediaInput = z.infer<
  typeof uploadedDesignMediaSchema
>;
export type DesignTaskMutationInput = z.infer<typeof designTaskMutationSchema>;
export type DesignTaskFilters = z.infer<typeof designTaskFiltersSchema>;

export type DesignTaskActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export function parseDesignTaskFormData(formData: FormData) {
  return designTaskMutationSchema.safeParse({
    projectId: formData.get("projectId"),
    designerId: formData.get("designerId"),
    taskName: formData.get("taskName"),
    designType: formData.get("designType"),
    status: formData.get("status"),
    approvalStatus: formData.get("approvalStatus"),
    revisionCount: formData.get("revisionCount"),
    dueDate: formData.get("dueDate"),
    notes: formData.get("notes"),
    mediaAssets: parseMediaAssets(formData.get("mediaAssets")),
  });
}

function parseMediaAssets(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
