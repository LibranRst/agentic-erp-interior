import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  isNotNull,
  isNull,
  or,
  type SQL,
} from "drizzle-orm";

import { db, schema } from "@/src/lib/db";

import {
  CONTENT_READY_DASHBOARD_STATUSES,
  type ContentStatus,
} from "./constants";
import type { ContentAssetFilters } from "./schemas";

export type ContentAssetListItem = Awaited<
  ReturnType<typeof getContentAssetsQuery>
>[number];
export type ContentAssetFormOptions = Awaited<
  ReturnType<typeof getContentAssetFormOptions>
>;
export type ContentAssetMetrics = Awaited<
  ReturnType<typeof getContentAssetMetrics>
>;
export type ContentReadyProject = Awaited<
  ReturnType<typeof getContentReadyProjectsQuery>
>[number];

export async function getContentAssetsQuery(
  filters: ContentAssetFilters = {},
  includeArchived?: boolean,
) {
  const assets = await db.query.contentAssets.findMany({
    where: buildContentAssetWhere(filters, includeArchived),
    with: {
      project: {
        columns: {
          id: true,
          projectName: true,
          clientName: true,
        },
      },
      assignee: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: (contentAssets, { desc }) => [
      desc(contentAssets.updatedAt),
      desc(contentAssets.createdAt),
    ],
  });

  return attachMedia(assets);
}

export async function getContentReadyProjectsQuery(limit = 6, includeArchived?: boolean) {
  const archiveFilter = includeArchived
    ? isNotNull(schema.contentAssets.archivedAt)
    : isNull(schema.contentAssets.archivedAt);
  const assets = await db.query.contentAssets.findMany({
    where: and(
      archiveFilter,
      inArray(schema.contentAssets.contentStatus, [
        ...CONTENT_READY_DASHBOARD_STATUSES,
      ]),
    ),
    with: {
      project: {
        columns: {
          id: true,
          projectName: true,
          clientName: true,
        },
      },
      assignee: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: (contentAssets, { desc }) => [
      desc(contentAssets.updatedAt),
      desc(contentAssets.createdAt),
    ],
    limit,
  });

  return attachMedia(assets);
}

export async function getContentAssetMetrics(includeArchived?: boolean) {
  const [readyToShoot, footageAvailable, editing, published] =
    await Promise.all([
      countByStatus("ready_to_shoot", includeArchived),
      countByStatus("footage_available", includeArchived),
      countByStatus("editing", includeArchived),
      countByStatus("published", includeArchived),
    ]);

  return {
    readyToShoot,
    footageAvailable,
    editing,
    published,
  };
}

export async function getContentAssetFormOptions() {
  const projects = await db.query.projects.findMany({
    columns: {
      id: true,
      projectName: true,
      clientName: true,
      roomArea: true,
    },
    orderBy: [asc(schema.projects.projectName)],
  });

  return {
    projects,
  };
}

export async function getContentMediaByAssetIds(assetIds: readonly string[]) {
  if (assetIds.length === 0) {
    return new Map<string, Array<typeof schema.mediaAssets.$inferSelect>>();
  }

  const mediaAssets = await db.query.mediaAssets.findMany({
    where: and(
      eq(schema.mediaAssets.relatedType, "content_asset"),
      inArray(schema.mediaAssets.relatedId, [...assetIds]),
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

  const mediaByAssetId = new Map<string, typeof mediaAssets>();

  for (const asset of mediaAssets) {
    if (!asset.relatedId) {
      continue;
    }

    const existing = mediaByAssetId.get(asset.relatedId) ?? [];
    existing.push(asset);
    mediaByAssetId.set(asset.relatedId, existing);
  }

  return mediaByAssetId;
}

function buildContentAssetWhere(filters: ContentAssetFilters, includeArchived?: boolean) {
  const conditions: SQL[] = [];

  if (includeArchived) {
    conditions.push(isNotNull(schema.contentAssets.archivedAt));
  } else {
    conditions.push(isNull(schema.contentAssets.archivedAt));
  }

  if (filters.search) {
    const searchValue = `%${filters.search}%`;
    const searchCondition = or(
      ilike(schema.contentAssets.roomArea, searchValue),
      ilike(schema.contentAssets.visualStatus, searchValue),
      ilike(schema.contentAssets.footageStatus, searchValue),
      ilike(schema.contentAssets.suggestedAngle, searchValue),
      ilike(schema.contentAssets.publishUrl, searchValue),
      ilike(schema.contentAssets.notes, searchValue),
    );

    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (filters.projectId) {
    conditions.push(eq(schema.contentAssets.projectId, filters.projectId));
  }

  if (filters.contentOpportunity) {
    conditions.push(
      eq(schema.contentAssets.contentOpportunity, filters.contentOpportunity),
    );
  }

  if (filters.contentStatus) {
    conditions.push(eq(schema.contentAssets.contentStatus, filters.contentStatus));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

async function countByStatus(status: ContentStatus, includeArchived?: boolean) {
  const archiveFilter = includeArchived
    ? isNotNull(schema.contentAssets.archivedAt)
    : isNull(schema.contentAssets.archivedAt);
  const [row] = await db
    .select({ value: count() })
    .from(schema.contentAssets)
    .where(and(archiveFilter, eq(schema.contentAssets.contentStatus, status)));

  return row?.value ?? 0;
}

async function attachMedia<TAsset extends { id: string }>(assets: TAsset[]) {
  const mediaByAssetId = await getContentMediaByAssetIds(
    assets.map((asset) => asset.id),
  );

  return assets.map((asset) => ({
    ...asset,
    mediaAssets: mediaByAssetId.get(asset.id) ?? [],
  }));
}
