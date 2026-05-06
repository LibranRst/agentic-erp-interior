import { and, desc, eq, inArray } from "drizzle-orm";

import { db, schema } from "@/src/lib/db";

import type { MediaRelatedType } from "./schemas";

export type ExistingMediaAsset = Awaited<
  ReturnType<typeof getMediaByProjectId>
>[number];

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
