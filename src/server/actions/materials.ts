"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  getMaterialIssuesQuery,
  getMaterialsQuery,
} from "@/src/features/materials/queries";
import {
  materialFiltersSchema,
  materialStatusUpdateSchema,
  materialUrgencyUpdateSchema,
  parseMaterialFormData,
  type MaterialActionState,
  type MaterialMutationInput,
} from "@/src/features/materials/schemas";
import type { CurrentUser } from "@/src/lib/auth/permissions";
import {
  requirePermission,
  requireRole,
  requireUser,
} from "@/src/lib/auth/permissions";
import { db, schema } from "@/src/lib/db";
import { createMediaAssets } from "@/src/features/media/server";
import { getZodFieldErrors } from "@/src/lib/forms";

const materialIdSchema = z.uuid("Material id is invalid.");

export async function getMaterials(filters: unknown = {}, includeArchived?: boolean) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "material:view");
  requireRole(currentUser, ["owner", "admin", "purchasing"]);

  const parsed = materialFiltersSchema.safeParse(filters);

  return getMaterialsQuery(parsed.success ? parsed.data : {}, includeArchived);
}

export async function getMaterialIssues(limit = 6) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "dashboard:view");

  return getMaterialIssuesQuery(limit);
}

export async function createMaterialAction(
  _state: MaterialActionState,
  formData: FormData,
): Promise<MaterialActionState> {
  const currentUser = await requireUser();
  requirePermission(currentUser, "material:create");
  requireRole(currentUser, ["owner", "admin", "purchasing"]);

  const parsed = parseMaterialFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: getZodMessage(parsed.error),
      fieldErrors: getZodFieldErrors(parsed.error),
    };
  }

  const projectCheck = await validateMaterialProject(parsed.data.projectId);

  if (projectCheck) {
    return projectCheck;
  }

  const [material] = await db
    .insert(schema.materials)
    .values(toMaterialValues(parsed.data, currentUser.id))
    .returning({
      id: schema.materials.id,
      projectId: schema.materials.projectId,
    });

  if (!material) {
    return {
      status: "error",
      message: "Material issue could not be created.",
    };
  }

  await createMediaAssets({
    mediaAssets: parsed.data.mediaAssets,
    projectId: material.projectId,
    relatedType: "material",
    relatedId: material.id,
    uploadedBy: currentUser.id,
  });

  revalidateMaterialPaths(material.projectId);

  return {
    status: "success",
    message: "Material issue created.",
  };
}

export async function updateMaterialAction(
  materialId: string,
  _state: MaterialActionState,
  formData: FormData,
): Promise<MaterialActionState> {
  const currentUser = await requireUser();
  requirePermission(currentUser, "material:update");
  requireRole(currentUser, ["owner", "admin", "purchasing"]);

  const parsedMaterialId = materialIdSchema.safeParse(materialId);

  if (!parsedMaterialId.success) {
    return {
      status: "error",
      message: getZodMessage(parsedMaterialId.error),
      fieldErrors: getZodFieldErrors(parsedMaterialId.error),
    };
  }

  const parsed = parseMaterialFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: getZodMessage(parsed.error),
      fieldErrors: getZodFieldErrors(parsed.error),
    };
  }

  const projectCheck = await validateMaterialProject(parsed.data.projectId);

  if (projectCheck) {
    return projectCheck;
  }

  const ownershipCheck = await validateMaterialOwnership(
    parsedMaterialId.data,
    currentUser,
  );

  if (ownershipCheck) {
    return ownershipCheck;
  }

  const [material] = await db
    .update(schema.materials)
    .set(toMaterialValues(parsed.data, currentUser.id))
    .where(eq(schema.materials.id, parsedMaterialId.data))
    .returning({
      id: schema.materials.id,
      projectId: schema.materials.projectId,
    });

  if (!material) {
    return {
      status: "error",
      message: "Material issue was not found.",
    };
  }

  await createMediaAssets({
    mediaAssets: parsed.data.mediaAssets,
    projectId: material.projectId,
    relatedType: "material",
    relatedId: material.id,
    uploadedBy: currentUser.id,
  });

  revalidateMaterialPaths(material.projectId);

  return {
    status: "success",
    message: "Material issue updated.",
  };
}

export async function updateMaterialStatusAction(
  materialId: string,
  input: unknown,
): Promise<MaterialActionState> {
  const currentUser = await requireUser();
  requirePermission(currentUser, "material:update");
  requireRole(currentUser, ["owner", "admin", "purchasing"]);

  const parsedMaterialId = materialIdSchema.safeParse(materialId);
  const parsed = materialStatusUpdateSchema.safeParse(input);

  if (!parsedMaterialId.success || !parsed.success) {
    return {
      status: "error",
      message:
        getFirstZodMessage(parsedMaterialId, parsed) ??
        "Material status is invalid.",
    };
  }

  const ownershipCheck = await validateMaterialOwnership(
    parsedMaterialId.data,
    currentUser,
  );

  if (ownershipCheck) {
    return ownershipCheck;
  }

  return updateMaterialFields(parsedMaterialId.data, currentUser.id, {
    status: parsed.data.status,
  });
}

export async function updateMaterialUrgencyAction(
  materialId: string,
  input: unknown,
): Promise<MaterialActionState> {
  const currentUser = await requireUser();
  requirePermission(currentUser, "material:update");
  requireRole(currentUser, ["owner", "admin", "purchasing"]);

  const parsedMaterialId = materialIdSchema.safeParse(materialId);
  const parsed = materialUrgencyUpdateSchema.safeParse(input);

  if (!parsedMaterialId.success || !parsed.success) {
    return {
      status: "error",
      message:
        getFirstZodMessage(parsedMaterialId, parsed) ??
        "Material urgency is invalid.",
    };
  }

  const ownershipCheck = await validateMaterialOwnership(
    parsedMaterialId.data,
    currentUser,
  );

  if (ownershipCheck) {
    return ownershipCheck;
  }

  return updateMaterialFields(parsedMaterialId.data, currentUser.id, {
    urgencyLevel: parsed.data.urgencyLevel,
  });
}

function toMaterialValues(data: MaterialMutationInput, updatedBy: string) {
  return {
    projectId: data.projectId,
    materialName: data.materialName,
    category: data.category ?? null,
    vendorId: data.vendorId ?? null,
    status: data.status,
    urgencyLevel: data.urgencyLevel,
    quantity: data.quantity?.toString() ?? null,
    unit: data.unit ?? null,
    etaDate: data.etaDate ?? null,
    issueNotes: data.issueNotes ?? null,
    updatedBy,
  } satisfies typeof schema.materials.$inferInsert;
}

async function validateMaterialProject(
  projectId: string,
): Promise<MaterialActionState | null> {
  const project = await db.query.projects.findFirst({
    where: eq(schema.projects.id, projectId),
    columns: {
      id: true,
      status: true,
    },
  });

  if (!project) {
    return {
      status: "error",
      message: "Project was not found.",
    };
  }

  if (project.status === "completed" || project.status === "cancelled") {
    return {
      status: "error",
      message:
        "Material updates are not allowed for completed or cancelled projects.",
    };
  }

  return null;
}

async function validateMaterialOwnership(
  materialId: string,
  currentUser: CurrentUser,
): Promise<MaterialActionState | null> {
  if (currentUser.role === "owner" || currentUser.role === "admin") {
    return null;
  }

  const material = await db.query.materials.findFirst({
    where: eq(schema.materials.id, materialId),
    columns: {
      id: true,
      updatedBy: true,
    },
  });

  if (!material) {
    return {
      status: "error",
      message: "Material issue was not found.",
    };
  }

  if (
    currentUser.role === "purchasing" &&
    material.updatedBy !== currentUser.id
  ) {
    return {
      status: "error",
      message:
        "Purchasing users can only update material issues they created.",
    };
  }

  return null;
}

async function updateMaterialFields(
  materialId: string,
  updatedBy: string,
  values: Partial<
    Pick<typeof schema.materials.$inferInsert, "status" | "urgencyLevel">
  >,
): Promise<MaterialActionState> {
  const [material] = await db
    .update(schema.materials)
    .set({ ...values, updatedBy })
    .where(eq(schema.materials.id, materialId))
    .returning({
      id: schema.materials.id,
      projectId: schema.materials.projectId,
    });

  if (!material) {
    return {
      status: "error",
      message: "Material issue was not found.",
    };
  }

  revalidateMaterialPaths(material.projectId);

  return {
    status: "success",
    message: "Material issue updated.",
  };
}

function revalidateMaterialPaths(projectId: string) {
  revalidatePath("/materials");
  revalidatePath("/dashboard");
  revalidatePath(`/projects/${projectId}`);
}

export async function archiveMaterialAction(materialId: string) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "material:update");
  requireRole(currentUser, ["owner", "admin"]);

  const parsedMaterialId = materialIdSchema.safeParse(materialId);

  if (!parsedMaterialId.success) {
    return { status: "error", message: "Material id is invalid." };
  }

  const [material] = await db
    .update(schema.materials)
    .set({ archivedAt: new Date(), archivedBy: currentUser.id, updatedBy: currentUser.id })
    .where(eq(schema.materials.id, parsedMaterialId.data))
    .returning({
      id: schema.materials.id,
      projectId: schema.materials.projectId,
    });

  if (!material) {
    return { status: "error", message: "Material issue was not found." };
  }

  revalidateMaterialPaths(material.projectId);

  return { status: "success", message: "Material issue archived." };
}

export async function restoreMaterialAction(materialId: string) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "material:update");
  requireRole(currentUser, ["owner", "admin"]);

  const parsedMaterialId = materialIdSchema.safeParse(materialId);

  if (!parsedMaterialId.success) {
    return { status: "error", message: "Material id is invalid." };
  }

  const [material] = await db
    .update(schema.materials)
    .set({ archivedAt: null, archivedBy: null, updatedBy: currentUser.id })
    .where(eq(schema.materials.id, parsedMaterialId.data))
    .returning({
      id: schema.materials.id,
      projectId: schema.materials.projectId,
    });

  if (!material) {
    return { status: "error", message: "Material issue was not found." };
  }

  revalidateMaterialPaths(material.projectId);

  return { status: "success", message: "Material issue restored." };
}

export async function deleteMaterialAction(materialId: string) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "material:update");
  requireRole(currentUser, ["owner", "admin"]);

  const parsedMaterialId = materialIdSchema.safeParse(materialId);

  if (!parsedMaterialId.success) {
    return { status: "error", message: "Material id is invalid." };
  }

  const [material] = await db
    .delete(schema.materials)
    .where(eq(schema.materials.id, parsedMaterialId.data))
    .returning({ id: schema.materials.id });

  if (!material) {
    return { status: "error", message: "Material issue was not found." };
  }

  revalidatePath("/materials");
  revalidatePath("/dashboard");

  return { status: "success", message: "Material issue deleted." };
}

function getZodMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Material issue data is invalid.";
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
