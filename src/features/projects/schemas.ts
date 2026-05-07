import { z } from "zod";

import {
  BUDGET_WARNING_STATUSES,
  CONTENT_READY_STATUSES,
  PROJECT_HEALTH_STATUSES,
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
} from "./constants";
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
  z.uuid("Select a valid team member.").optional(),
);

const progressPercentage = z.preprocess(
  (value) => {
    if (value === null || value === undefined || value === "") {
      return 0;
    }

    return Number(value);
  },
  z
    .number("Progress must be a number.")
    .int("Progress must be a whole number.")
    .min(0, "Progress cannot be below 0%.")
    .max(100, "Progress cannot be above 100%."),
);

const estimatedValue = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Estimated value must be a valid amount.")
    .optional(),
);

export const projectMutationSchema = z.object({
  projectName: z
    .string()
    .trim()
    .min(2, "Project name must be at least 2 characters.")
    .max(160, "Project name is too long."),
  clientName: z
    .string()
    .trim()
    .min(2, "Client name must be at least 2 characters.")
    .max(120, "Client name is too long."),
  clientPhone: optionalText(40),
  location: optionalText(160),
  projectType: optionalText(80),
  roomArea: optionalText(120),
  description: optionalText(1000),
  status: z.enum(PROJECT_STATUSES),
  healthStatus: z.enum(PROJECT_HEALTH_STATUSES),
  priority: z.enum(PROJECT_PRIORITIES),
  progressPercentage,
  startDate: optionalDate,
  deadline: optionalDate,
  handoverDate: optionalDate,
  pmId: optionalUuid,
  designerId: optionalUuid,
  estimatedValue,
  budgetWarningStatus: z.enum(BUDGET_WARNING_STATUSES),
  contentReadyStatus: z.enum(CONTENT_READY_STATUSES),
});

export const projectFiltersSchema = z.object({
  search: optionalText(120),
  status: z.preprocess(emptyToUndefined, z.enum(PROJECT_STATUSES).optional()),
  health: z.preprocess(
    emptyToUndefined,
    z.enum(PROJECT_HEALTH_STATUSES).optional(),
  ),
  pmId: optionalUuid,
  priority: z.preprocess(emptyToUndefined, z.enum(PROJECT_PRIORITIES).optional()),
});

export const projectStatusUpdateSchema = z.object({
  status: z.enum(PROJECT_STATUSES),
});

export const projectHealthUpdateSchema = z.object({
  healthStatus: z.enum(PROJECT_HEALTH_STATUSES),
});

export const projectProgressUpdateSchema = z.object({
  progressPercentage,
});

export type ProjectMutationInput = z.infer<typeof projectMutationSchema>;
export type ProjectFilters = z.infer<typeof projectFiltersSchema>;
export type ProjectStatusUpdateInput = z.infer<typeof projectStatusUpdateSchema>;
export type ProjectHealthUpdateInput = z.infer<typeof projectHealthUpdateSchema>;
export type ProjectProgressUpdateInput = z.infer<
  typeof projectProgressUpdateSchema
>;

export type ProjectActionState = FormActionState;

export function parseProjectFormData(formData: FormData) {
  return projectMutationSchema.safeParse({
    projectName: formData.get("projectName"),
    clientName: formData.get("clientName"),
    clientPhone: formData.get("clientPhone"),
    location: formData.get("location"),
    projectType: formData.get("projectType"),
    roomArea: formData.get("roomArea"),
    description: formData.get("description"),
    status: formData.get("status"),
    healthStatus: formData.get("healthStatus"),
    priority: formData.get("priority"),
    progressPercentage: formData.get("progressPercentage"),
    startDate: formData.get("startDate"),
    deadline: formData.get("deadline"),
    handoverDate: formData.get("handoverDate"),
    pmId: formData.get("pmId"),
    designerId: formData.get("designerId"),
    estimatedValue: formData.get("estimatedValue"),
    budgetWarningStatus: formData.get("budgetWarningStatus"),
    contentReadyStatus: formData.get("contentReadyStatus"),
  });
}
