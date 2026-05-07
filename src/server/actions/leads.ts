"use server";

import { randomUUID } from "node:crypto";

import { and, eq, sql } from "drizzle-orm";
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

export async function getLeads(filters: unknown = {}) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "lead:view");
  requireRole(currentUser, ["owner", "admin", "sales"]);

  const parsed = leadFiltersSchema.safeParse(filters);

  return getLeadsQuery(parsed.success ? parsed.data : {}, currentUser);
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
  const convertedRows = await db.execute<{
    projectId: string;
    leadId: string;
  }>(sql`
    with updated_lead as (
      update ${schema.leads}
      set
        ${schema.leads.status} = 'converted',
        ${schema.leads.convertedProjectId} = ${projectId}::uuid,
        ${schema.leads.updatedAt} = now()
      where ${schema.leads.id} = ${lead.id}
        and ${schema.leads.status} <> 'converted'
        and ${schema.leads.convertedProjectId} is null
      returning ${schema.leads.id}
    ),
    inserted_project as (
      insert into ${schema.projects} (
        ${schema.projects.id},
        ${schema.projects.projectName},
        ${schema.projects.clientName},
        ${schema.projects.clientPhone},
        ${schema.projects.location},
        ${schema.projects.projectType},
        ${schema.projects.roomArea},
        ${schema.projects.description},
        ${schema.projects.status},
        ${schema.projects.healthStatus},
        ${schema.projects.priority},
        ${schema.projects.progressPercentage},
        ${schema.projects.pmId},
        ${schema.projects.designerId},
        ${schema.projects.estimatedValue},
        ${schema.projects.budgetWarningStatus},
        ${schema.projects.contentReadyStatus}
      )
      select
        ${projectId}::uuid,
        ${parsed.data.projectName},
        ${lead.leadName},
        ${lead.phone},
        ${parsed.data.location ?? null},
        ${parsed.data.projectType ?? null},
        ${parsed.data.roomArea ?? null},
        coalesce(${parsed.data.description ?? null}, ${lead.notes}),
        'lead_converted',
        'healthy',
        'medium',
        0,
        ${parsed.data.pmId ?? null}::uuid,
        ${parsed.data.designerId ?? null}::uuid,
        ${lead.estimatedProjectValue},
        'none',
        'not_ready'
      from updated_lead
      returning ${schema.projects.id}
    )
    select
      inserted_project.id as "projectId",
      updated_lead.id as "leadId"
    from inserted_project
    join updated_lead on true
  `);

  const convertedLead = convertedRows.rows[0];

  if (!convertedLead) {
    return {
      status: "error",
      message:
        "Lead could not be converted. Refresh before retrying.",
    };
  }

  revalidateLeadPaths(convertedLead.projectId);
  revalidatePath(`/projects/${convertedLead.projectId}`);

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

function getZodMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Lead data is invalid.";
}
