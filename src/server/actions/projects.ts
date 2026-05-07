"use server";

import { eq } from "drizzle-orm";
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

export async function getProjects(filters: unknown = {}) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "project:view");

  const parsed = projectFiltersSchema.safeParse(filters);

  return getProjectsQuery(parsed.success ? parsed.data : {});
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

function getZodMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Project data is invalid.";
}
