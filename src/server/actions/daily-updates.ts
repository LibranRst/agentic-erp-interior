"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  getDailyUpdateFormOptions,
  getDailyUpdateMetrics,
  getDailyUpdatesQuery,
  getLatestDailyUpdatesQuery,
} from "@/src/features/daily-updates/queries";
import {
  dailyUpdateFiltersSchema,
  parseDailyUpdateFormData,
  type DailyUpdateActionState,
  type DailyUpdateMutationInput,
  type UploadedDailyUpdateMediaInput,
} from "@/src/features/daily-updates/schemas";
import {
  requirePermission,
  requireRole,
  requireUser,
} from "@/src/lib/auth/permissions";
import { db, schema } from "@/src/lib/db";
import { createMediaAssets } from "@/src/features/media/server";
import { getZodFieldErrors } from "@/src/lib/forms";

const dailyUpdateIdSchema = z.uuid("Daily update id is invalid.");

export async function getDailyUpdates(filters: unknown = {}) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "daily_update:view");
  requireRole(currentUser, ["owner", "admin", "project_manager"]);

  const parsed = dailyUpdateFiltersSchema.safeParse(filters);

  return getDailyUpdatesQuery(parsed.success ? parsed.data : {}, currentUser);
}

export async function getLatestDailyUpdates(limit = 5) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "dashboard:view");

  return getLatestDailyUpdatesQuery(limit, currentUser);
}

export async function getDailyUpdatePageData(filters: unknown = {}) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "daily_update:view");
  requireRole(currentUser, ["owner", "admin", "project_manager"]);

  const parsed = dailyUpdateFiltersSchema.safeParse(filters);
  const parsedFilters = parsed.success ? parsed.data : {};

  const [updates, metrics, options] = await Promise.all([
    getDailyUpdatesQuery(parsedFilters, currentUser),
    getDailyUpdateMetrics(currentUser),
    getDailyUpdateFormOptions(currentUser),
  ]);

  return {
    updates,
    metrics,
    options,
    filters: parsedFilters,
  };
}

export async function getDailyUpdateFormOptionsAction() {
  const currentUser = await requireUser();
  requirePermission(currentUser, "daily_update:create");
  requireRole(currentUser, ["owner", "admin", "project_manager"]);

  return getDailyUpdateFormOptions(currentUser);
}

export async function createDailyUpdateAction(
  _state: DailyUpdateActionState,
  formData: FormData,
): Promise<DailyUpdateActionState> {
  const currentUser = await requireUser();
  requirePermission(currentUser, "daily_update:create");
  requireRole(currentUser, ["owner", "admin", "project_manager"]);

  const parsed = parseDailyUpdateFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: getZodMessage(parsed.error),
      fieldErrors: getZodFieldErrors(parsed.error),
    };
  }

  const project = await db.query.projects.findFirst({
    where: eq(schema.projects.id, parsed.data.projectId),
    columns: {
      id: true,
      pmId: true,
    },
  });

  if (!project) {
    return {
      status: "error",
      message: "Project was not found.",
    };
  }

  if (currentUser.role === "project_manager" && project.pmId !== currentUser.id) {
    return {
      status: "error",
      message: "PM users can only update assigned projects.",
    };
  }

  const [dailyUpdate] = await db
    .insert(schema.dailyUpdates)
    .values(toDailyUpdateValues(parsed.data, currentUser.id))
    .returning({
      id: schema.dailyUpdates.id,
      projectId: schema.dailyUpdates.projectId,
    });

  if (!dailyUpdate) {
    return {
      status: "error",
      message: "Daily update could not be created.",
    };
  }

  await Promise.all([
    updateProjectFromDailyUpdate(parsed.data),
    createDailyUpdateMediaAssets({
      mediaAssets: parsed.data.mediaAssets,
      projectId: dailyUpdate.projectId,
      dailyUpdateId: dailyUpdate.id,
      uploadedBy: currentUser.id,
    }),
  ]);

  revalidateDailyUpdatePaths(dailyUpdate.projectId);

  return {
    status: "success",
    message: "Daily update created.",
  };
}

export async function updateDailyUpdateAction(
  dailyUpdateId: string,
  _state: DailyUpdateActionState,
  formData: FormData,
): Promise<DailyUpdateActionState> {
  const currentUser = await requireUser();
  requirePermission(currentUser, "daily_update:update");
  requireRole(currentUser, ["owner", "admin", "project_manager"]);

  const parsedDailyUpdateId = dailyUpdateIdSchema.safeParse(dailyUpdateId);

  if (!parsedDailyUpdateId.success) {
    return {
      status: "error",
      message: getZodMessage(parsedDailyUpdateId.error),
      fieldErrors: getZodFieldErrors(parsedDailyUpdateId.error),
    };
  }

  const parsed = parseDailyUpdateFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: getZodMessage(parsed.error),
      fieldErrors: getZodFieldErrors(parsed.error),
    };
  }

  const existingDailyUpdate = await db.query.dailyUpdates.findFirst({
    where: eq(schema.dailyUpdates.id, parsedDailyUpdateId.data),
    with: {
      project: {
        columns: {
          id: true,
          pmId: true,
        },
      },
    },
  });

  if (!existingDailyUpdate) {
    return {
      status: "error",
      message: "Daily update was not found.",
    };
  }

  if (
    currentUser.role === "project_manager" &&
    existingDailyUpdate.project.pmId !== currentUser.id
  ) {
    return {
      status: "error",
      message: "PM users can only update assigned daily updates.",
    };
  }

  const project = await db.query.projects.findFirst({
    where: eq(schema.projects.id, parsed.data.projectId),
    columns: {
      id: true,
      pmId: true,
    },
  });

  if (!project) {
    return {
      status: "error",
      message: "Project was not found.",
    };
  }

  if (currentUser.role === "project_manager" && project.pmId !== currentUser.id) {
    return {
      status: "error",
      message: "PM users can only update assigned projects.",
    };
  }

  const [dailyUpdate] = await db
    .update(schema.dailyUpdates)
    .set(toDailyUpdateValues(parsed.data, currentUser.id))
    .where(eq(schema.dailyUpdates.id, parsedDailyUpdateId.data))
    .returning({
      id: schema.dailyUpdates.id,
      projectId: schema.dailyUpdates.projectId,
    });

  if (!dailyUpdate) {
    return {
      status: "error",
      message: "Daily update could not be updated.",
    };
  }

  await Promise.all([
    updateProjectFromDailyUpdate(parsed.data),
    createDailyUpdateMediaAssets({
      mediaAssets: parsed.data.mediaAssets,
      projectId: dailyUpdate.projectId,
      dailyUpdateId: dailyUpdate.id,
      uploadedBy: currentUser.id,
    }),
  ]);

  revalidateDailyUpdatePaths(dailyUpdate.projectId);
  if (existingDailyUpdate.projectId !== dailyUpdate.projectId) {
    revalidatePath(`/projects/${existingDailyUpdate.projectId}`);
  }

  return {
    status: "success",
    message: "Daily update updated.",
  };
}

function toDailyUpdateValues(data: DailyUpdateMutationInput, updatedBy: string) {
  return {
    projectId: data.projectId,
    updatedBy,
    updateDate: data.updateDate,
    progressSummary: data.progressSummary,
    workCompleted: data.workCompleted ?? null,
    issueNotes: data.issueNotes ?? null,
    blockerNotes: data.blockerNotes ?? null,
    nextAction: data.nextAction ?? null,
    progressPercentage: data.progressPercentage ?? null,
    healthStatus: data.healthStatus ?? null,
  } satisfies typeof schema.dailyUpdates.$inferInsert;
}

async function updateProjectFromDailyUpdate(data: DailyUpdateMutationInput) {
  if (data.progressPercentage === undefined && data.healthStatus === undefined) {
    return;
  }

  await db
    .update(schema.projects)
    .set({
      ...(data.progressPercentage !== undefined
        ? { progressPercentage: data.progressPercentage }
        : {}),
      ...(data.healthStatus !== undefined
        ? { healthStatus: data.healthStatus }
        : {}),
    })
    .where(eq(schema.projects.id, data.projectId));
}

async function createDailyUpdateMediaAssets({
  mediaAssets,
  projectId,
  dailyUpdateId,
  uploadedBy,
}: {
  mediaAssets: UploadedDailyUpdateMediaInput[];
  projectId: string;
  dailyUpdateId: string;
  uploadedBy: string;
}) {
  if (mediaAssets.length === 0) {
    return;
  }

  await createMediaAssets({
    mediaAssets,
    projectId,
    relatedType: "daily_update",
    relatedId: dailyUpdateId,
    uploadedBy,
  });
}

function revalidateDailyUpdatePaths(projectId: string) {
  revalidatePath("/daily-updates");
  revalidatePath("/dashboard");
  revalidatePath(`/projects/${projectId}`);
}

function getZodMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Daily update data is invalid.";
}
