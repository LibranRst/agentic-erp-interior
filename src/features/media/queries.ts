import { and, count, desc, eq, inArray } from "drizzle-orm";

import { db, schema } from "@/src/lib/db";

import type { MediaRelatedType } from "./schemas";

export type ExistingMediaAsset = Awaited<
  ReturnType<typeof getMediaByProjectId>
>[number];

export type MediaLibraryAsset = Awaited<
  ReturnType<typeof getLatestMediaAssets>
>[number];

export async function getLatestMediaAssets(limit = 30) {
  return db.query.mediaAssets.findMany({
    with: {
      project: {
        columns: {
          id: true,
          projectName: true,
        },
      },
      uploader: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [desc(schema.mediaAssets.createdAt)],
    limit,
  });
}

export async function getMediaLibraryMetrics() {
  const [assets, progressPhotos, designFiles, contentFiles] = await Promise.all([
    db.select({ value: count() }).from(schema.mediaAssets),
    db
      .select({ value: count() })
      .from(schema.mediaAssets)
      .where(eq(schema.mediaAssets.relatedType, "daily_update")),
    db
      .select({ value: count() })
      .from(schema.mediaAssets)
      .where(eq(schema.mediaAssets.relatedType, "design_task")),
    db
      .select({ value: count() })
      .from(schema.mediaAssets)
      .where(eq(schema.mediaAssets.relatedType, "content_asset")),
  ]);

  return {
    assets: assets[0]?.value ?? 0,
    progressPhotos: progressPhotos[0]?.value ?? 0,
    designFiles: designFiles[0]?.value ?? 0,
    contentFiles: contentFiles[0]?.value ?? 0,
  };
}

export async function getMediaByProjectId(projectId: string) {
  return db.query.mediaAssets.findMany({
    where: eq(schema.mediaAssets.projectId, projectId),
    with: {
      uploader: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [desc(schema.mediaAssets.createdAt)],
  });
}

export async function getMediaByRelated(
  relatedType: MediaRelatedType,
  relatedId: string,
) {
  return db.query.mediaAssets.findMany({
    where: and(
      eq(schema.mediaAssets.relatedType, relatedType),
      eq(schema.mediaAssets.relatedId, relatedId),
    ),
    with: {
      uploader: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [desc(schema.mediaAssets.createdAt)],
  });
}

export async function getMediaByRelatedIds(
  relatedType: MediaRelatedType,
  relatedIds: readonly string[],
) {
  if (relatedIds.length === 0) {
    return new Map<string, Awaited<ReturnType<typeof getMediaByRelated>>>();
  }

  const mediaAssets = await db.query.mediaAssets.findMany({
    where: and(
      eq(schema.mediaAssets.relatedType, relatedType),
      inArray(schema.mediaAssets.relatedId, [...relatedIds]),
    ),
    with: {
      uploader: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [desc(schema.mediaAssets.createdAt)],
  });

  const mediaByRelatedId = new Map<string, typeof mediaAssets>();

  for (const asset of mediaAssets) {
    if (!asset.relatedId) {
      continue;
    }

    const existing = mediaByRelatedId.get(asset.relatedId) ?? [];
    existing.push(asset);
    mediaByRelatedId.set(asset.relatedId, existing);
  }

  return mediaByRelatedId;
}
