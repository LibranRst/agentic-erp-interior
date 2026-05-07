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
  parseMaterialFormData,
  type MaterialActionState,
  type MaterialMutationInput,
} from "@/src/features/materials/schemas";
import {
  requirePermission,
  requireRole,
  requireUser,
} from "@/src/lib/auth/permissions";
import { db, schema } from "@/src/lib/db";
import { createMediaAssets } from "@/src/features/media/server";
import { getZodFieldErrors } from "@/src/lib/forms";

const materialIdSchema = z.uuid("Material id is invalid.");

export async function getMaterials(filters: unknown = {}) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "material:view");
  requireRole(currentUser, ["owner", "admin", "purchasing"]);

  const parsed = materialFiltersSchema.safeParse(filters);

  return getMaterialsQuery(parsed.success ? parsed.data : {});
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

function revalidateMaterialPaths(projectId: string) {
  revalidatePath("/materials");
  revalidatePath("/dashboard");
  revalidatePath(`/projects/${projectId}`);
}

function getZodMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Material issue data is invalid.";
}
