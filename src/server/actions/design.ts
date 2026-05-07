"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  getDesignTasksQuery,
  getPendingDesignTasksQuery,
} from "@/src/features/design/queries";
import {
  designApprovalUpdateSchema,
  designTaskFiltersSchema,
  designStatusUpdateSchema,
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
import { createMediaAssets } from "@/src/features/media/server";
import { getZodFieldErrors } from "@/src/lib/forms";

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
      fieldErrors: getZodFieldErrors(parsed.error),
    };
  }

  const values = toDesignTaskValues(parsed.data, currentUser);
  const projectCheck = await validateDesignProjectAssignment(
    parsed.data.projectId,
    values.designerId,
    currentUser,
  );

  if (projectCheck) {
    return projectCheck;
  }

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
      fieldErrors: getZodFieldErrors(parsedTaskId.error),
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
      fieldErrors: getZodFieldErrors(parsed.error),
    };
  }

  const nextValues = toDesignTaskValues(parsed.data, currentUser);
  const projectCheck = await validateDesignProjectAssignment(
    parsed.data.projectId,
    nextValues.designerId,
    currentUser,
  );

  if (projectCheck) {
    return projectCheck;
  }

  const [task] = await db
    .update(schema.designTasks)
    .set(nextValues)
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

export async function updateDesignStatusAction(
  designTaskId: string,
  input: unknown,
): Promise<DesignTaskActionState> {
  const currentUser = await requireUser();
  requirePermission(currentUser, "design_task:update");
  requireRole(currentUser, ["owner", "admin", "designer"]);

  const parsedTaskId = designTaskIdSchema.safeParse(designTaskId);
  const parsed = designStatusUpdateSchema.safeParse(input);

  if (!parsedTaskId.success || !parsed.success) {
    return {
      status: "error",
      message: getFirstZodMessage(parsedTaskId, parsed) ?? "Design status is invalid.",
    };
  }

  return updateDesignTaskFields(parsedTaskId.data, currentUser, {
    status: parsed.data.status,
  });
}

export async function updateDesignApprovalAction(
  designTaskId: string,
  input: unknown,
): Promise<DesignTaskActionState> {
  const currentUser = await requireUser();
  requirePermission(currentUser, "design_task:update");
  requireRole(currentUser, ["owner", "admin", "designer"]);

  const parsedTaskId = designTaskIdSchema.safeParse(designTaskId);
  const parsed = designApprovalUpdateSchema.safeParse(input);

  if (!parsedTaskId.success || !parsed.success) {
    return {
      status: "error",
      message:
        getFirstZodMessage(parsedTaskId, parsed) ??
        "Design approval status is invalid.",
    };
  }

  return updateDesignTaskFields(parsedTaskId.data, currentUser, {
    approvalStatus: parsed.data.approvalStatus,
  });
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

async function validateDesignProjectAssignment(
  projectId: string,
  designerId: string | null | undefined,
  currentUser: Awaited<ReturnType<typeof requireUser>>,
): Promise<DesignTaskActionState | null> {
  const project = await db.query.projects.findFirst({
    where: eq(schema.projects.id, projectId),
    columns: {
      id: true,
      designerId: true,
    },
  });

  if (!project) {
    return {
      status: "error",
      message: "Project was not found.",
    };
  }

  if (currentUser.role === "designer" && project.designerId !== currentUser.id) {
    return {
      status: "error",
      message: "Designers can only create tasks for assigned projects.",
    };
  }

  if (designerId && project.designerId && project.designerId !== designerId) {
    return {
      status: "error",
      message: "Selected designer is not assigned to this project.",
    };
  }

  return null;
}

async function updateDesignTaskFields(
  designTaskId: string,
  currentUser: Awaited<ReturnType<typeof requireUser>>,
  values: Partial<
    Pick<typeof schema.designTasks.$inferInsert, "status" | "approvalStatus">
  >,
): Promise<DesignTaskActionState> {
  const existingTask = await db.query.designTasks.findFirst({
    where: eq(schema.designTasks.id, designTaskId),
    columns: {
      id: true,
      projectId: true,
      designerId: true,
    },
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

  const [task] = await db
    .update(schema.designTasks)
    .set(values)
    .where(eq(schema.designTasks.id, existingTask.id))
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

  revalidateDesignPaths(task.projectId);

  return {
    status: "success",
    message: "Design task updated.",
  };
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

  await createMediaAssets({
    mediaAssets,
    projectId,
    relatedType: "design_task",
    relatedId: designTaskId,
    uploadedBy,
  });
}

function revalidateDesignPaths(projectId: string) {
  revalidatePath("/design");
  revalidatePath("/dashboard");
  revalidatePath(`/projects/${projectId}`);
}

function getZodMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Design task data is invalid.";
}

type SafeParseFailure = { success: false; error: z.ZodError };
type SafeParseResult = { success: true } | SafeParseFailure;

function getFirstZodMessage(...results: SafeParseResult[]) {
  for (const result of results) {
    if (!result.success) {
      return result.error.issues[0]?.message;
    }
  }

  return undefined;
}
