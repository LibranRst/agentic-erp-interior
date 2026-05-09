"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  getProjectByIdQuery,
  getProjectsQuery,
} from "@/src/features/projects/queries";
import {
  parseProjectFormData,
  projectFiltersSchema,
  projectHealthUpdateSchema,
  projectProgressUpdateSchema,
  projectStatusUpdateSchema,
  type ProjectActionState,
  type ProjectMutationInput,
} from "@/src/features/projects/schemas";
import {
  requirePermission,
  requireRole,
  requireUser,
} from "@/src/lib/auth/permissions";
import { db, schema } from "@/src/lib/db";
import { getZodFieldErrors } from "@/src/lib/forms";

const projectIdSchema = z.uuid("Project id is invalid.");

export async function getProjects(filters: unknown = {}, includeArchived?: boolean) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "project:view");

  const parsed = projectFiltersSchema.safeParse(filters);

  return getProjectsQuery(parsed.success ? parsed.data : {}, includeArchived);
}

export async function getProjectById(projectId: string) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "project:view");

  const parsedProjectId = projectIdSchema.parse(projectId);

  return getProjectByIdQuery(parsedProjectId);
}

export async function createProjectAction(
  _state: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const currentUser = await requireUser();
  requirePermission(currentUser, "project:create");
  requireRole(currentUser, ["owner", "admin"]);

  const parsed = parseProjectFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: getZodMessage(parsed.error),
      fieldErrors: getZodFieldErrors(parsed.error),
    };
  }

  const [project] = await db
    .insert(schema.projects)
    .values(toProjectValues(parsed.data))
    .returning({ id: schema.projects.id });

  if (!project) {
    return {
      status: "error",
      message: "Project could not be created.",
    };
  }

  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function updateProjectAction(
  projectId: string,
  _state: ProjectActionState,
  formData: FormData,
): Promise<ProjectActionState> {
  const currentUser = await requireUser();
  requirePermission(currentUser, "project:update");
  requireRole(currentUser, ["owner", "admin"]);

  const parsedProjectId = projectIdSchema.safeParse(projectId);

  if (!parsedProjectId.success) {
    return {
      status: "error",
      message: getZodMessage(parsedProjectId.error),
      fieldErrors: getZodFieldErrors(parsedProjectId.error),
    };
  }

  const parsed = parseProjectFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: getZodMessage(parsed.error),
      fieldErrors: getZodFieldErrors(parsed.error),
    };
  }

  const [project] = await db
    .update(schema.projects)
    .set(toProjectValues(parsed.data))
    .where(eq(schema.projects.id, parsedProjectId.data))
    .returning({ id: schema.projects.id });

  if (!project) {
    return {
      status: "error",
      message: "Project was not found.",
    };
  }

  revalidatePath("/projects");
  revalidatePath(`/projects/${project.id}`);

  return {
    status: "success",
    message: "Project updated.",
  };
}

export async function updateProjectStatusAction(
  projectId: string,
  input: unknown,
) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "project:update");
  requireRole(currentUser, ["owner", "admin", "project_manager"]);

  const parsedProjectId = projectIdSchema.safeParse(projectId);
  const parsed = projectStatusUpdateSchema.safeParse(input);

  if (!parsedProjectId.success || !parsed.success) {
    return {
      status: "error",
      message:
        getFirstZodMessage(parsedProjectId, parsed) ??
        "Project status data is invalid.",
    } satisfies ProjectActionState;
  }

  return updateLimitedProjectFields(parsedProjectId.data, currentUser, {
    status: parsed.data.status,
  });
}

export async function updateProjectHealthAction(
  projectId: string,
  input: unknown,
) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "project:update");
  requireRole(currentUser, ["owner", "admin", "project_manager"]);

  const parsedProjectId = projectIdSchema.safeParse(projectId);
  const parsed = projectHealthUpdateSchema.safeParse(input);

  if (!parsedProjectId.success || !parsed.success) {
    return {
      status: "error",
      message:
        getFirstZodMessage(parsedProjectId, parsed) ??
        "Project health data is invalid.",
    } satisfies ProjectActionState;
  }

  return updateLimitedProjectFields(parsedProjectId.data, currentUser, {
    healthStatus: parsed.data.healthStatus,
  });
}

export async function updateProjectProgressAction(
  projectId: string,
  input: unknown,
) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "project:update");
  requireRole(currentUser, ["owner", "admin", "project_manager"]);

  const parsedProjectId = projectIdSchema.safeParse(projectId);
  const parsed = projectProgressUpdateSchema.safeParse(input);

  if (!parsedProjectId.success || !parsed.success) {
    return {
      status: "error",
      message:
        getFirstZodMessage(parsedProjectId, parsed) ??
        "Project progress data is invalid.",
    } satisfies ProjectActionState;
  }

  return updateLimitedProjectFields(parsedProjectId.data, currentUser, {
    progressPercentage: parsed.data.progressPercentage,
  });
}

function toProjectValues(data: ProjectMutationInput) {
  return {
    projectName: data.projectName,
    clientName: data.clientName,
    clientPhone: data.clientPhone ?? null,
    location: data.location ?? null,
    projectType: data.projectType ?? null,
    roomArea: data.roomArea ?? null,
    description: data.description ?? null,
    status: data.status,
    healthStatus: data.healthStatus,
    priority: data.priority,
    progressPercentage: data.progressPercentage,
    startDate: data.startDate ?? null,
    deadline: data.deadline ?? null,
    handoverDate: data.handoverDate ?? null,
    pmId: data.pmId ?? null,
    designerId: data.designerId ?? null,
    estimatedValue: data.estimatedValue ?? null,
    budgetWarningStatus: data.budgetWarningStatus,
    contentReadyStatus: data.contentReadyStatus,
  } satisfies typeof schema.projects.$inferInsert;
}

async function updateLimitedProjectFields(
  projectId: string,
  currentUser: Awaited<ReturnType<typeof requireUser>>,
  values: Partial<
    Pick<
      typeof schema.projects.$inferInsert,
      "status" | "healthStatus" | "progressPercentage"
    >
  >,
): Promise<ProjectActionState> {
  const where =
    currentUser.role === "project_manager"
      ? and(eq(schema.projects.id, projectId), eq(schema.projects.pmId, currentUser.id))
      : eq(schema.projects.id, projectId);

  const [project] = await db
    .update(schema.projects)
    .set(values)
    .where(where)
    .returning({ id: schema.projects.id });

  if (!project) {
    return {
      status: "error",
      message: "Project was not found or is not assigned to you.",
    };
  }

  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath(`/projects/${project.id}`);

  return {
    status: "success",
    message: "Project updated.",
  };
}

export async function archiveProjectAction(projectId: string) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "project:archive");
  requireRole(currentUser, ["owner", "admin"]);

  const parsedProjectId = projectIdSchema.safeParse(projectId);

  if (!parsedProjectId.success) {
    return { status: "error", message: "Project id is invalid." };
  }

  const [project] = await db
    .update(schema.projects)
    .set({ archivedAt: new Date(), archivedBy: currentUser.id })
    .where(eq(schema.projects.id, parsedProjectId.data))
    .returning({ id: schema.projects.id });

  if (!project) {
    return { status: "error", message: "Project was not found." };
  }

  revalidatePath("/projects");
  revalidatePath("/dashboard");

  return { status: "success", message: "Project archived." };
}

export async function restoreProjectAction(projectId: string) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "project:archive");
  requireRole(currentUser, ["owner", "admin"]);

  const parsedProjectId = projectIdSchema.safeParse(projectId);

  if (!parsedProjectId.success) {
    return { status: "error", message: "Project id is invalid." };
  }

  const [project] = await db
    .update(schema.projects)
    .set({ archivedAt: null, archivedBy: null })
    .where(eq(schema.projects.id, parsedProjectId.data))
    .returning({ id: schema.projects.id });

  if (!project) {
    return { status: "error", message: "Project was not found." };
  }

  revalidatePath("/projects");
  revalidatePath("/dashboard");

  return { status: "success", message: "Project restored." };
}

export async function deleteProjectAction(projectId: string) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "project:archive");
  requireRole(currentUser, ["owner", "admin"]);

  const parsedProjectId = projectIdSchema.safeParse(projectId);

  if (!parsedProjectId.success) {
    return { status: "error", message: "Project id is invalid." };
  }

  const pid = parsedProjectId.data;

  // Clear child rows in tables without ON DELETE CASCADE on projects FK
  await db
    .delete(schema.notifications)
    .where(eq(schema.notifications.projectId, pid));
  await db
    .update(schema.mediaAssets)
    .set({ projectId: null })
    .where(eq(schema.mediaAssets.projectId, pid));
  await db
    .update(schema.leads)
    .set({ convertedProjectId: null, status: "hot" })
    .where(eq(schema.leads.convertedProjectId, pid));

  const [project] = await db
    .delete(schema.projects)
    .where(eq(schema.projects.id, pid))
    .returning({ id: schema.projects.id });

  if (!project) {
    return { status: "error", message: "Project was not found." };
  }

  revalidatePath("/projects");
  revalidatePath("/dashboard");

  return { status: "success", message: "Project deleted." };
}

function getZodMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Project data is invalid.";
}

function getFirstZodMessage(
  ...results: Array<ReturnType<typeof z.ZodType.prototype.safeParse>>
) {
  for (const result of results) {
    if (!result.success) {
      return result.error.issues[0]?.message;
    }
  }

  return undefined;
}
