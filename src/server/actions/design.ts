"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  getDesignTasksQuery,
  getPendingDesignTasksQuery,
} from "@/src/features/design/queries";
import {
  designTaskFiltersSchema,
  parseDesignTaskFormData,
  type DesignTaskActionState,
  type DesignTaskMutationInput,
  type UploadedDesignMediaInput,
} from "@/src/features/design/schemas";
import {
  requirePermission,
  requireRole,
  requireUser,
} from "@/src/lib/auth/permissions";
import { db, schema } from "@/src/lib/db";

const designTaskIdSchema = z.uuid("Design task id is invalid.");

export async function getDesignTasks(filters: unknown = {}) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "design_task:view");
  requireRole(currentUser, ["owner", "admin", "designer"]);

  const parsed = designTaskFiltersSchema.safeParse(filters);
  const parsedFilters = parsed.success ? parsed.data : {};

  return getDesignTasksQuery(
    currentUser.role === "designer"
      ? { ...parsedFilters, designerId: currentUser.id }
      : parsedFilters,
  );
}

export async function getPendingDesignTasks(limit = 6) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "dashboard:view");

  return getPendingDesignTasksQuery(limit);
}

export async function createDesignTaskAction(
  _state: DesignTaskActionState,
  formData: FormData,
): Promise<DesignTaskActionState> {
  const currentUser = await requireUser();
  requirePermission(currentUser, "design_task:create");
  requireRole(currentUser, ["owner", "admin", "designer"]);

  const parsed = parseDesignTaskFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: getZodMessage(parsed.error),
    };
  }

  const values = toDesignTaskValues(parsed.data, currentUser);

  const [task] = await db
    .insert(schema.designTasks)
    .values(values)
    .returning({
      id: schema.designTasks.id,
      projectId: schema.designTasks.projectId,
    });

  if (!task) {
    return {
      status: "error",
      message: "Design task could not be created.",
    };
  }

  await createDesignMediaAssets({
    mediaAssets: parsed.data.mediaAssets,
    projectId: task.projectId,
    designTaskId: task.id,
    uploadedBy: currentUser.id,
  });

  revalidateDesignPaths(task.projectId);

  return {
    status: "success",
    message: "Design task created.",
  };
}

export async function updateDesignTaskAction(
  designTaskId: string,
  _state: DesignTaskActionState,
  formData: FormData,
): Promise<DesignTaskActionState> {
  const currentUser = await requireUser();
  requirePermission(currentUser, "design_task:update");
  requireRole(currentUser, ["owner", "admin", "designer"]);

  const parsedTaskId = designTaskIdSchema.safeParse(designTaskId);

  if (!parsedTaskId.success) {
    return {
      status: "error",
      message: getZodMessage(parsedTaskId.error),
    };
  }

  const existingTask = await db.query.designTasks.findFirst({
    where: eq(schema.designTasks.id, parsedTaskId.data),
  });

  if (!existingTask) {
    return {
      status: "error",
      message: "Design task was not found.",
    };
  }

  if (
    currentUser.role === "designer" &&
    existingTask.designerId !== currentUser.id
  ) {
    return {
      status: "error",
      message: "Designers can only update tasks assigned to them.",
    };
  }

  const parsed = parseDesignTaskFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: getZodMessage(parsed.error),
    };
  }

  const [task] = await db
    .update(schema.designTasks)
    .set(toDesignTaskValues(parsed.data, currentUser))
    .where(eq(schema.designTasks.id, parsedTaskId.data))
    .returning({
      id: schema.designTasks.id,
      projectId: schema.designTasks.projectId,
    });

  if (!task) {
    return {
      status: "error",
      message: "Design task could not be updated.",
    };
  }

  await createDesignMediaAssets({
    mediaAssets: parsed.data.mediaAssets,
    projectId: task.projectId,
    designTaskId: task.id,
    uploadedBy: currentUser.id,
  });

  revalidateDesignPaths(task.projectId);

  return {
    status: "success",
    message: "Design task updated.",
  };
}

function toDesignTaskValues(
  data: DesignTaskMutationInput,
  currentUser: Awaited<ReturnType<typeof requireUser>>,
) {
  return {
    projectId: data.projectId,
    designerId:
      currentUser.role === "designer" ? currentUser.id : data.designerId ?? null,
    taskName: data.taskName,
    designType: data.designType,
    status: data.status,
    approvalStatus: data.approvalStatus,
    revisionCount: data.revisionCount,
    dueDate: data.dueDate ?? null,
    notes: data.notes ?? null,
  } satisfies typeof schema.designTasks.$inferInsert;
}

async function createDesignMediaAssets({
  mediaAssets,
  projectId,
  designTaskId,
  uploadedBy,
}: {
  mediaAssets: UploadedDesignMediaInput[];
  projectId: string;
  designTaskId: string;
  uploadedBy: string;
}) {
  if (mediaAssets.length === 0) {
    return;
  }

  await db.insert(schema.mediaAssets).values(
    mediaAssets.map((asset) => ({
      projectId,
      relatedType: "design_task" as const,
      relatedId: designTaskId,
      fileName: asset.fileName,
      fileType: asset.fileType ?? null,
      mimeType: asset.mimeType ?? null,
      fileSize: asset.fileSize ?? null,
      imagekitFileId: asset.imagekitFileId,
      imagekitUrl: asset.imagekitUrl,
      thumbnailUrl: asset.thumbnailUrl ?? null,
      folderPath: asset.folderPath ?? `dekoria-erp/projects/${projectId}/design`,
      uploadedBy,
    })),
  );
}

function revalidateDesignPaths(projectId: string) {
  revalidatePath("/design");
  revalidatePath("/dashboard");
  revalidatePath(`/projects/${projectId}`);
}

function getZodMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Design task data is invalid.";
}
