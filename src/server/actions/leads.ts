"use server";

import { randomUUID } from "node:crypto";

import { and, eq, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  getDashboardLeadsQuery,
  getLeadsQuery,
  getSalesSnapshotQuery,
} from "@/src/features/leads/queries";
import {
  leadFiltersSchema,
  parseLeadConvertFormData,
  parseLeadFormData,
  type LeadActionState,
  type LeadMutationInput,
} from "@/src/features/leads/schemas";
import {
  requirePermission,
  requireRole,
  requireUser,
  type CurrentUser,
} from "@/src/lib/auth/permissions";
import { db, schema } from "@/src/lib/db";
import { createMediaAssets } from "@/src/features/media/server";
import { getZodFieldErrors } from "@/src/lib/forms";

const leadIdSchema = z.uuid("Lead id is invalid.");

export async function getLeads(filters: unknown = {}, includeArchived?: boolean) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "lead:view");
  requireRole(currentUser, ["owner", "admin", "sales"]);

  const parsed = leadFiltersSchema.safeParse(filters);

  return getLeadsQuery(parsed.success ? parsed.data : {}, currentUser, includeArchived);
}

export async function getSalesSnapshot() {
  const currentUser = await requireUser();
  requirePermission(currentUser, "dashboard:view");

  return getSalesSnapshotQuery(currentUser);
}

export async function getDashboardLeads(limit = 5) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "dashboard:view");

  return getDashboardLeadsQuery(limit, currentUser);
}

export async function createLeadAction(
  _state: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const currentUser = await requireUser();
  requirePermission(currentUser, "lead:create");
  requireRole(currentUser, ["owner", "admin", "sales"]);

  const parsed = parseLeadFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: getZodMessage(parsed.error),
      fieldErrors: getZodFieldErrors(parsed.error),
    };
  }

  if (parsed.data.status === "converted") {
    return {
      status: "error",
      message: "Use the convert action to create a linked project.",
    };
  }

  const [lead] = await db
    .insert(schema.leads)
    .values(toLeadValues(parsed.data, currentUser))
    .returning({ id: schema.leads.id });

  if (!lead) {
    return {
      status: "error",
      message: "Lead could not be created.",
    };
  }

  await createMediaAssets({
    mediaAssets: parsed.data.mediaAssets,
    relatedType: "lead_attachment",
    relatedId: lead.id,
    uploadedBy: currentUser.id,
  });

  revalidateLeadPaths();

  return {
    status: "success",
    message: "Lead created.",
  };
}

export async function updateLeadAction(
  leadId: string,
  _state: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const currentUser = await requireUser();
  requirePermission(currentUser, "lead:update");
  requireRole(currentUser, ["owner", "admin", "sales"]);

  const parsedLeadId = leadIdSchema.safeParse(leadId);

  if (!parsedLeadId.success) {
    return {
      status: "error",
      message: getZodMessage(parsedLeadId.error),
      fieldErrors: getZodFieldErrors(parsedLeadId.error),
    };
  }

  const parsed = parseLeadFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: getZodMessage(parsed.error),
      fieldErrors: getZodFieldErrors(parsed.error),
    };
  }

  const where = buildLeadMutationWhere(parsedLeadId.data, currentUser);
  const existingLead = await db.query.leads.findFirst({
    where,
  });

  if (!existingLead) {
    return {
      status: "error",
      message: "Lead was not found or is not assigned to you.",
    };
  }

  if (parsed.data.status === "converted" && !existingLead.convertedProjectId) {
    return {
      status: "error",
      message: "Use the convert action to create a linked project.",
    };
  }

  const [lead] = await db
    .update(schema.leads)
    .set(toLeadValues(parsed.data, currentUser))
    .where(where)
    .returning({
      id: schema.leads.id,
      convertedProjectId: schema.leads.convertedProjectId,
    });

  if (!lead) {
    return {
      status: "error",
      message: "Lead was not found or is not assigned to you.",
    };
  }

  await createMediaAssets({
    mediaAssets: parsed.data.mediaAssets,
    projectId: lead.convertedProjectId,
    relatedType: "lead_attachment",
    relatedId: lead.id,
    uploadedBy: currentUser.id,
  });

  revalidateLeadPaths(lead.convertedProjectId);

  return {
    status: "success",
    message: "Lead updated.",
  };
}

export async function convertLeadToProjectAction(
  leadId: string,
  _state: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const currentUser = await requireUser();
  requirePermission(currentUser, "lead:convert");
  requireRole(currentUser, ["owner", "admin"]);

  const parsedLeadId = leadIdSchema.safeParse(leadId);

  if (!parsedLeadId.success) {
    return {
      status: "error",
      message: getZodMessage(parsedLeadId.error),
      fieldErrors: getZodFieldErrors(parsedLeadId.error),
    };
  }

  const parsed = parseLeadConvertFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: getZodMessage(parsed.error),
      fieldErrors: getZodFieldErrors(parsed.error),
    };
  }

  const lead = await db.query.leads.findFirst({
    where: eq(schema.leads.id, parsedLeadId.data),
  });

  if (!lead) {
    return {
      status: "error",
      message: "Lead was not found.",
    };
  }

  if (lead.status === "converted" || lead.convertedProjectId) {
    return {
      status: "error",
      message: "Lead has already been converted.",
    };
  }

  const projectId = randomUUID();

  try {
    await db.insert(schema.projects).values({
      id: projectId,
      projectName: parsed.data.projectName,
      clientName: lead.leadName,
      clientPhone: lead.phone,
      location: parsed.data.location ?? null,
      projectType: parsed.data.projectType ?? null,
      roomArea: parsed.data.roomArea ?? null,
      description: (parsed.data.description ?? lead.notes) ?? null,
      status: "lead_converted",
      healthStatus: "healthy",
      priority: "medium",
      progressPercentage: 0,
      pmId: parsed.data.pmId ?? null,
      designerId: parsed.data.designerId ?? null,
      estimatedValue: lead.estimatedProjectValue,
      budgetWarningStatus: "none",
      contentReadyStatus: "not_ready",
    });
  } catch (error) {
    console.error("Project insert during lead conversion failed:", error);
    return { status: "error", message: `Database error: ${(error as Error).message}` };
  }

  try {
    await db
      .update(schema.leads)
      .set({
        status: "converted",
        convertedProjectId: projectId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(schema.leads.id, lead.id),
          eq(schema.leads.status, lead.status),
          isNull(schema.leads.convertedProjectId),
        ),
      );
  } catch (error) {
    // Project already inserted; log but don't fail — the project record exists
    console.error("Lead status update after conversion failed:", error);
  }

  revalidateLeadPaths(projectId);
  revalidatePath(`/projects/${projectId}`);

  return {
    status: "success",
    message: "Lead converted to project.",
  };
}

function toLeadValues(data: LeadMutationInput, currentUser: CurrentUser) {
  const assignedSalesId =
    currentUser.role === "sales" ? currentUser.id : data.assignedSalesId ?? null;

  return {
    leadName: data.leadName,
    phone: data.phone ?? null,
    email: data.email ?? null,
    source: data.source ?? null,
    interest: data.interest ?? null,
    estimatedProjectValue: data.estimatedProjectValue ?? null,
    status: data.status,
    assignedSalesId,
    nextFollowUpDate: data.nextFollowUpDate ?? null,
    notes: data.notes ?? null,
  } satisfies typeof schema.leads.$inferInsert;
}

function buildLeadMutationWhere(leadId: string, currentUser: CurrentUser) {
  if (currentUser.role !== "sales") {
    return eq(schema.leads.id, leadId);
  }

  return and(
    eq(schema.leads.id, leadId),
    eq(schema.leads.assignedSalesId, currentUser.id),
  );
}

function revalidateLeadPaths(projectId?: string | null) {
  revalidatePath("/sales");
  revalidatePath("/dashboard");
  revalidatePath("/projects");

  if (projectId) {
    revalidatePath(`/projects/${projectId}`);
  }
}

export async function archiveLeadAction(leadId: string) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "lead:update");
  requireRole(currentUser, ["owner", "admin"]);

  const parsedLeadId = leadIdSchema.safeParse(leadId);

  if (!parsedLeadId.success) {
    return { status: "error", message: "Lead id is invalid." };
  }

  const [lead] = await db
    .update(schema.leads)
    .set({ archivedAt: new Date(), archivedBy: currentUser.id })
    .where(eq(schema.leads.id, parsedLeadId.data))
    .returning({ id: schema.leads.id });

  if (!lead) {
    return { status: "error", message: "Lead was not found." };
  }

  revalidatePath("/sales");
  revalidatePath("/dashboard");

  return { status: "success", message: "Lead archived." };
}

export async function restoreLeadAction(leadId: string) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "lead:update");
  requireRole(currentUser, ["owner", "admin"]);

  const parsedLeadId = leadIdSchema.safeParse(leadId);

  if (!parsedLeadId.success) {
    return { status: "error", message: "Lead id is invalid." };
  }

  const [lead] = await db
    .update(schema.leads)
    .set({ archivedAt: null, archivedBy: null })
    .where(eq(schema.leads.id, parsedLeadId.data))
    .returning({ id: schema.leads.id });

  if (!lead) {
    return { status: "error", message: "Lead was not found." };
  }

  revalidatePath("/sales");
  revalidatePath("/dashboard");

  return { status: "success", message: "Lead restored." };
}

export async function deleteLeadAction(leadId: string) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "lead:update");
  requireRole(currentUser, ["owner", "admin"]);

  const parsedLeadId = leadIdSchema.safeParse(leadId);

  if (!parsedLeadId.success) {
    return { status: "error", message: "Lead id is invalid." };
  }

  const [lead] = await db
    .delete(schema.leads)
    .where(eq(schema.leads.id, parsedLeadId.data))
    .returning({ id: schema.leads.id });

  if (!lead) {
    return { status: "error", message: "Lead was not found." };
  }

  revalidatePath("/sales");
  revalidatePath("/dashboard");

  return { status: "success", message: "Lead deleted." };
}

function getZodMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Lead data is invalid.";
}
