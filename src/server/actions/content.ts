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
  parseContentAssetFormData,
  type ContentAssetActionState,
  type ContentAssetMutationInput,
  type UploadedContentMediaInput,
} from "@/src/features/content/schemas";
import {
  contentReadinessRank,
  type ContentStatus,
} from "@/src/features/content/constants";
import {
  requirePermission,
  requireRole,
  requireUser,
} from "@/src/lib/auth/permissions";
import { db, schema } from "@/src/lib/db";
import { createMediaAssets } from "@/src/features/media/server";

const contentAssetIdSchema = z.uuid("Content asset id is invalid.");

export async function getContentAssets(filters: unknown = {}) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "content_asset:view");
  requireRole(currentUser, ["owner", "admin", "marketing"]);

  const parsed = contentAssetFiltersSchema.safeParse(filters);

  return getContentAssetsQuery(parsed.success ? parsed.data : {});
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
    };
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
    };
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

function getZodMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Content asset data is invalid.";
}
