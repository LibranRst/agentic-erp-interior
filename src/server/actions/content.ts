"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  getContentAssetsQuery,
  getContentReadyProjectsQuery,
} from "@/src/features/content/queries";
import {
  contentAssetFiltersSchema,
  contentStatusUpdateSchema,
  parseContentAssetFormData,
  type ContentAssetActionState,
  type ContentAssetMutationInput,
  type UploadedContentMediaInput,
} from "@/src/features/content/schemas";
import {
  contentReadinessRank,
  type ContentStatus,
} from "@/src/features/content/constants";
import type { CurrentUser } from "@/src/lib/auth/permissions";
import {
  requirePermission,
  requireRole,
  requireUser,
} from "@/src/lib/auth/permissions";
import { db, schema } from "@/src/lib/db";
import { createMediaAssets } from "@/src/features/media/server";
import { getZodFieldErrors } from "@/src/lib/forms";

const contentAssetIdSchema = z.uuid("Content asset id is invalid.");

export async function getContentAssets(filters: unknown = {}, includeArchived?: boolean) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "content_asset:view");
  requireRole(currentUser, ["owner", "admin", "marketing"]);

  const parsed = contentAssetFiltersSchema.safeParse(filters);

  return getContentAssetsQuery(parsed.success ? parsed.data : {}, includeArchived);
}

export async function getContentReadyProjects(limit = 6) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "dashboard:view");

  return getContentReadyProjectsQuery(limit);
}

export async function createContentAssetAction(
  _state: ContentAssetActionState,
  formData: FormData,
): Promise<ContentAssetActionState> {
  const currentUser = await requireUser();
  requirePermission(currentUser, "content_asset:create");
  requireRole(currentUser, ["owner", "admin", "marketing"]);

  const parsed = parseContentAssetFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: getZodMessage(parsed.error),
      fieldErrors: getZodFieldErrors(parsed.error),
    };
  }

  const projectCheck = await validateContentProject(parsed.data.projectId);

  if (projectCheck) {
    return projectCheck;
  }

  const [asset] = await db
    .insert(schema.contentAssets)
    .values(toContentAssetValues(parsed.data, currentUser.id))
    .returning({
      id: schema.contentAssets.id,
      projectId: schema.contentAssets.projectId,
    });

  if (!asset) {
    return {
      status: "error",
      message: "Content asset could not be created.",
    };
  }

  await Promise.all([
    createContentMediaAssets({
      mediaAssets: parsed.data.mediaAssets,
      projectId: asset.projectId,
      contentAssetId: asset.id,
      uploadedBy: currentUser.id,
    }),
    syncProjectContentReadyStatus(asset.projectId),
  ]);

  revalidateContentPaths(asset.projectId);

  return {
    status: "success",
    message: "Content asset created.",
  };
}

export async function updateContentAssetAction(
  contentAssetId: string,
  _state: ContentAssetActionState,
  formData: FormData,
): Promise<ContentAssetActionState> {
  const currentUser = await requireUser();
  requirePermission(currentUser, "content_asset:update");
  requireRole(currentUser, ["owner", "admin", "marketing"]);

  const parsedAssetId = contentAssetIdSchema.safeParse(contentAssetId);

  if (!parsedAssetId.success) {
    return {
      status: "error",
      message: getZodMessage(parsedAssetId.error),
      fieldErrors: getZodFieldErrors(parsedAssetId.error),
    };
  }

  const existingAsset = await db.query.contentAssets.findFirst({
    where: eq(schema.contentAssets.id, parsedAssetId.data),
  });

  if (!existingAsset) {
    return {
      status: "error",
      message: "Content asset was not found.",
    };
  }

  const parsed = parseContentAssetFormData(formData);

  if (!parsed.success) {
    return {
      status: "error",
      message: getZodMessage(parsed.error),
      fieldErrors: getZodFieldErrors(parsed.error),
    };
  }

  const projectCheck = await validateContentProject(parsed.data.projectId);

  if (projectCheck) {
    return projectCheck;
  }

  const ownershipCheck = await validateContentOwnership(
    parsedAssetId.data,
    currentUser,
  );

  if (ownershipCheck) {
    return ownershipCheck;
  }

  const [asset] = await db
    .update(schema.contentAssets)
    .set(toContentAssetValues(parsed.data, currentUser.id))
    .where(eq(schema.contentAssets.id, parsedAssetId.data))
    .returning({
      id: schema.contentAssets.id,
      projectId: schema.contentAssets.projectId,
    });

  if (!asset) {
    return {
      status: "error",
      message: "Content asset could not be updated.",
    };
  }

  await createContentMediaAssets({
    mediaAssets: parsed.data.mediaAssets,
    projectId: asset.projectId,
    contentAssetId: asset.id,
    uploadedBy: currentUser.id,
  });

  await Promise.all([
    syncProjectContentReadyStatus(asset.projectId),
    existingAsset.projectId !== asset.projectId
      ? syncProjectContentReadyStatus(existingAsset.projectId)
      : Promise.resolve(),
  ]);

  revalidateContentPaths(asset.projectId);

  if (existingAsset.projectId !== asset.projectId) {
    revalidatePath(`/projects/${existingAsset.projectId}`);
  }

  return {
    status: "success",
    message: "Content asset updated.",
  };
}

export async function updateContentStatusAction(
  contentAssetId: string,
  input: unknown,
): Promise<ContentAssetActionState> {
  const currentUser = await requireUser();
  requirePermission(currentUser, "content_asset:update");
  requireRole(currentUser, ["owner", "admin", "marketing"]);

  const parsedAssetId = contentAssetIdSchema.safeParse(contentAssetId);
  const parsed = contentStatusUpdateSchema.safeParse(input);

  if (!parsedAssetId.success || !parsed.success) {
    return {
      status: "error",
      message:
        getFirstZodMessage(parsedAssetId, parsed) ??
        "Content status is invalid.",
    };
  }

  const ownershipCheck = await validateContentOwnership(
    parsedAssetId.data,
    currentUser,
  );

  if (ownershipCheck) {
    return ownershipCheck;
  }

  const [asset] = await db
    .update(schema.contentAssets)
    .set({
      contentStatus: parsed.data.contentStatus,
      assignedTo: currentUser.id,
    })
    .where(eq(schema.contentAssets.id, parsedAssetId.data))
    .returning({
      id: schema.contentAssets.id,
      projectId: schema.contentAssets.projectId,
    });

  if (!asset) {
    return {
      status: "error",
      message: "Content asset was not found.",
    };
  }

  await syncProjectContentReadyStatus(asset.projectId);
  revalidateContentPaths(asset.projectId);

  return {
    status: "success",
    message: "Content asset updated.",
  };
}

function toContentAssetValues(
  data: ContentAssetMutationInput,
  assignedTo: string,
) {
  return {
    projectId: data.projectId,
    roomArea: data.roomArea ?? null,
    visualStatus: data.visualStatus ?? null,
    footageStatus: data.footageStatus ?? null,
    contentOpportunity: data.contentOpportunity ?? null,
    suggestedAngle: data.suggestedAngle ?? null,
    contentStatus: data.contentStatus,
    assignedTo,
    publishUrl: data.publishUrl ?? null,
    notes: data.notes ?? null,
  } satisfies typeof schema.contentAssets.$inferInsert;
}

async function validateContentProject(
  projectId: string,
): Promise<ContentAssetActionState | null> {
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
        "Content updates are not allowed for completed or cancelled projects.",
    };
  }

  return null;
}

async function validateContentOwnership(
  contentAssetId: string,
  currentUser: CurrentUser,
): Promise<ContentAssetActionState | null> {
  if (currentUser.role === "owner" || currentUser.role === "admin") {
    return null;
  }

  const asset = await db.query.contentAssets.findFirst({
    where: eq(schema.contentAssets.id, contentAssetId),
    columns: {
      id: true,
      assignedTo: true,
    },
  });

  if (!asset) {
    return {
      status: "error",
      message: "Content asset was not found.",
    };
  }

  if (
    currentUser.role === "marketing" &&
    asset.assignedTo !== currentUser.id
  ) {
    return {
      status: "error",
      message:
        "Marketing users can only update content assets assigned to them.",
    };
  }

  return null;
}

async function createContentMediaAssets({
  mediaAssets,
  projectId,
  contentAssetId,
  uploadedBy,
}: {
  mediaAssets: UploadedContentMediaInput[];
  projectId: string;
  contentAssetId: string;
  uploadedBy: string;
}) {
  if (mediaAssets.length === 0) {
    return;
  }

  await createMediaAssets({
    mediaAssets,
    projectId,
    relatedType: "content_asset",
    relatedId: contentAssetId,
    uploadedBy,
  });
}

async function syncProjectContentReadyStatus(projectId: string) {
  const assets = await db.query.contentAssets.findMany({
    where: and(
      eq(schema.contentAssets.projectId, projectId),
      ne(schema.contentAssets.contentStatus, "archived"),
    ),
    columns: {
      contentStatus: true,
    },
  });

  const nextStatus =
    assets
      .map((asset) => asset.contentStatus)
      .sort(
        (left, right) =>
          contentReadinessRank[right] - contentReadinessRank[left],
      )[0] ?? "not_ready";

  await db
    .update(schema.projects)
    .set({ contentReadyStatus: nextStatus as ContentStatus })
    .where(eq(schema.projects.id, projectId));
}

function revalidateContentPaths(projectId: string) {
  revalidatePath("/content");
  revalidatePath("/dashboard");
  revalidatePath(`/projects/${projectId}`);
}

export async function archiveContentAssetAction(contentAssetId: string) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "content_asset:update");
  requireRole(currentUser, ["owner", "admin"]);

  const parsedAssetId = contentAssetIdSchema.safeParse(contentAssetId);

  if (!parsedAssetId.success) {
    return { status: "error", message: "Content asset id is invalid." };
  }

  const [asset] = await db
    .update(schema.contentAssets)
    .set({ archivedAt: new Date(), archivedBy: currentUser.id, contentStatus: "archived", assignedTo: currentUser.id })
    .where(eq(schema.contentAssets.id, parsedAssetId.data))
    .returning({
      id: schema.contentAssets.id,
      projectId: schema.contentAssets.projectId,
    });

  if (!asset) {
    return { status: "error", message: "Content asset was not found." };
  }

  await syncProjectContentReadyStatus(asset.projectId);
  revalidateContentPaths(asset.projectId);

  return { status: "success", message: "Content asset archived." };
}

export async function restoreContentAssetAction(contentAssetId: string) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "content_asset:update");
  requireRole(currentUser, ["owner", "admin"]);

  const parsedAssetId = contentAssetIdSchema.safeParse(contentAssetId);

  if (!parsedAssetId.success) {
    return { status: "error", message: "Content asset id is invalid." };
  }

  const [asset] = await db
    .update(schema.contentAssets)
    .set({ archivedAt: null, archivedBy: null, assignedTo: currentUser.id })
    .where(eq(schema.contentAssets.id, parsedAssetId.data))
    .returning({
      id: schema.contentAssets.id,
      projectId: schema.contentAssets.projectId,
    });

  if (!asset) {
    return { status: "error", message: "Content asset was not found." };
  }

  await syncProjectContentReadyStatus(asset.projectId);
  revalidateContentPaths(asset.projectId);

  return { status: "success", message: "Content asset restored." };
}

export async function deleteContentAssetAction(contentAssetId: string) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "content_asset:update");
  requireRole(currentUser, ["owner", "admin"]);

  const parsedAssetId = contentAssetIdSchema.safeParse(contentAssetId);

  if (!parsedAssetId.success) {
    return { status: "error", message: "Content asset id is invalid." };
  }

  const [asset] = await db
    .delete(schema.contentAssets)
    .where(eq(schema.contentAssets.id, parsedAssetId.data))
    .returning({ id: schema.contentAssets.id });

  if (!asset) {
    return { status: "error", message: "Content asset was not found." };
  }

  revalidatePath("/content");
  revalidatePath("/dashboard");

  return { status: "success", message: "Content asset deleted." };
}

function getZodMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Content asset data is invalid.";
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
