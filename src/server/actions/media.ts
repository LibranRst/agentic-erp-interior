"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createMediaAssets } from "@/src/features/media/server";
import { uploadedMediaSchema } from "@/src/features/media/schemas";
import {
  ForbiddenError,
  requirePermission,
  requireRole,
  requireUser,
} from "@/src/lib/auth/permissions";
import { db, schema } from "@/src/lib/db";

const mediaAssetsSchema = z.array(uploadedMediaSchema).min(1);
const idSchema = z.uuid("Record id is invalid.");

export async function createProjectDocumentationMediaAction(
  projectId: string,
  mediaAssets: unknown,
) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "project:update");
  requireRole(currentUser, ["owner", "admin"]);

  const parsedProjectId = idSchema.parse(projectId);
  const parsedMediaAssets = mediaAssetsSchema.parse(mediaAssets);
  const project = await db.query.projects.findFirst({
    where: eq(schema.projects.id, parsedProjectId),
    columns: {
      id: true,
    },
  });

  if (!project) {
    throw new Error("Project was not found.");
  }

  await createMediaAssets({
    mediaAssets: parsedMediaAssets,
    projectId: project.id,
    relatedType: "project_documentation",
    relatedId: project.id,
    uploadedBy: currentUser.id,
  });

  revalidatePath(`/projects/${project.id}`);
  revalidatePath("/projects");
}

export async function updateUserAvatarMediaAction(
  userId: string,
  mediaAssets: unknown,
) {
  const currentUser = await requireUser();
  requirePermission(currentUser, "user:avatar:update");
  const parsedUserId = idSchema.parse(userId);

  if (!canUpdateUserAvatar(currentUser, parsedUserId)) {
    throw new ForbiddenError("You can only update your own avatar.");
  }

  const [mediaAsset] = mediaAssetsSchema.parse(mediaAssets);
  const targetUser = await db.query.users.findFirst({
    where: eq(schema.users.id, parsedUserId),
    columns: {
      id: true,
    },
  });

  if (!targetUser) {
    throw new Error("User was not found.");
  }

  const [createdMediaAsset] = await createMediaAssets({
    mediaAssets: [mediaAsset],
    relatedType: "user_avatar",
    relatedId: targetUser.id,
    uploadedBy: currentUser.id,
  });

  if (!createdMediaAsset) {
    throw new Error("Avatar metadata could not be saved.");
  }

  await db
    .update(schema.users)
    .set({ avatarMediaId: createdMediaAsset.id })
    .where(eq(schema.users.id, targetUser.id));

  revalidatePath("/users");
  revalidatePath("/dashboard");
}

function canUpdateUserAvatar(
  currentUser: Awaited<ReturnType<typeof requireUser>>,
  targetUserId: string,
) {
  return (
    targetUserId === currentUser.id ||
    currentUser.role === "owner" ||
    currentUser.role === "admin"
  );
}
