import {
  and,
  asc,
  count,
  desc,
  eq,
  inArray,
  isNotNull,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

import type { CurrentUser } from "@/src/lib/auth/permissions";
import { db, schema } from "@/src/lib/db";

import type { DailyUpdateFilters } from "./schemas";

export type DailyUpdateListItem = Awaited<
  ReturnType<typeof getDailyUpdatesQuery>
>[number];
export type DailyUpdateFormOptions = Awaited<
  ReturnType<typeof getDailyUpdateFormOptions>
>;
export type DailyUpdateMetrics = Awaited<ReturnType<typeof getDailyUpdateMetrics>>;

export async function getDailyUpdatesQuery(
  filters: DailyUpdateFilters = {},
  currentUser?: CurrentUser,
) {
  const updates = await db.query.dailyUpdates.findMany({
    where: buildDailyUpdateWhere(filters, currentUser),
    with: {
      project: {
        columns: {
          id: true,
          projectName: true,
          clientName: true,
          pmId: true,
        },
      },
      updater: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: (dailyUpdates, { desc }) => [
      desc(dailyUpdates.updateDate),
      desc(dailyUpdates.createdAt),
    ],
  });

  return attachMedia(updates);
}

export async function getLatestDailyUpdatesQuery(
  limit = 5,
  currentUser?: CurrentUser,
) {
  const updates = await db.query.dailyUpdates.findMany({
    where: buildDailyUpdateWhere({}, currentUser),
    with: {
      project: {
        columns: {
          id: true,
          projectName: true,
          clientName: true,
          pmId: true,
        },
      },
      updater: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: (dailyUpdates, { desc }) => [
      desc(dailyUpdates.updateDate),
      desc(dailyUpdates.createdAt),
    ],
    limit,
  });

  return attachMedia(updates);
}

export async function getDailyUpdateMetrics(currentUser?: CurrentUser) {
  const today = new Date().toISOString().slice(0, 10);
  const scope = buildRoleScope(currentUser);
  const todayWhere = and(eq(schema.dailyUpdates.updateDate, today), scope);
  const issueWhere = and(
    or(
      isNotNull(schema.dailyUpdates.issueNotes),
      isNotNull(schema.dailyUpdates.blockerNotes),
      inArray(schema.dailyUpdates.healthStatus, [
        "needs_attention",
        "urgent",
        "blocked",
        "delayed",
      ]),
    ),
    scope,
  );

  const attachmentWhere = and(
    eq(schema.mediaAssets.relatedType, "daily_update"),
    scope
      ? sql`${schema.mediaAssets.relatedId} in (
          select ${schema.dailyUpdates.id}
          from ${schema.dailyUpdates}
          where ${schema.dailyUpdates.projectId} in (
            select ${schema.projects.id}
            from ${schema.projects}
            where ${schema.projects.pmId} = ${currentUser?.id}
          )
        )`
      : undefined,
  );
  const [submittedToday, withIssues, attachmentCount, latestCount] =
    await Promise.all([
      db.select({ value: count() }).from(schema.dailyUpdates).where(todayWhere),
      db.select({ value: count() }).from(schema.dailyUpdates).where(issueWhere),
      db
        .select({ value: count() })
        .from(schema.mediaAssets)
        .where(attachmentWhere),
      db.select({ value: count() }).from(schema.dailyUpdates).where(scope),
    ]);

  return {
    submittedToday: submittedToday[0]?.value ?? 0,
    withIssues: withIssues[0]?.value ?? 0,
    attachments: attachmentCount[0]?.value ?? 0,
    latest: latestCount[0]?.value ?? 0,
  };
}

export async function getDailyUpdateFormOptions(currentUser?: CurrentUser) {
  return {
    projects: await getSelectableProjects(currentUser),
  };
}

export async function getDailyUpdateMediaByUpdateIds(
  updateIds: readonly string[],
) {
  if (updateIds.length === 0) {
    return new Map<string, Array<typeof schema.mediaAssets.$inferSelect>>();
  }

  const mediaAssets = await db.query.mediaAssets.findMany({
    where: and(
      eq(schema.mediaAssets.relatedType, "daily_update"),
      inArray(schema.mediaAssets.relatedId, [...updateIds]),
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

  const mediaByUpdateId = new Map<string, typeof mediaAssets>();

  for (const asset of mediaAssets) {
    if (!asset.relatedId) {
      continue;
    }

    const existing = mediaByUpdateId.get(asset.relatedId) ?? [];
    existing.push(asset);
    mediaByUpdateId.set(asset.relatedId, existing);
  }

  return mediaByUpdateId;
}

function buildDailyUpdateWhere(
  filters: DailyUpdateFilters,
  currentUser?: CurrentUser,
) {
  const conditions: SQL[] = [];
  const scope = buildRoleScope(currentUser);

  if (scope) {
    conditions.push(scope);
  }

  if (filters.projectId) {
    conditions.push(eq(schema.dailyUpdates.projectId, filters.projectId));
  }

  if (filters.healthStatus) {
    conditions.push(eq(schema.dailyUpdates.healthStatus, filters.healthStatus));
  }

  if (filters.updateDate) {
    conditions.push(eq(schema.dailyUpdates.updateDate, filters.updateDate));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

function buildRoleScope(currentUser?: CurrentUser) {
  if (!currentUser || currentUser.role !== "project_manager") {
    return undefined;
  }

  return sql`${schema.dailyUpdates.projectId} in (
    select ${schema.projects.id}
    from ${schema.projects}
    where ${schema.projects.pmId} = ${currentUser.id}
  )`;
}

async function getSelectableProjects(currentUser?: CurrentUser) {
  const where =
    currentUser?.role === "project_manager"
      ? eq(schema.projects.pmId, currentUser.id)
      : undefined;

  return db.query.projects.findMany({
    where,
    columns: {
      id: true,
      projectName: true,
      clientName: true,
      pmId: true,
      progressPercentage: true,
      healthStatus: true,
    },
    with: {
      projectManager: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: [asc(schema.projects.projectName)],
  });
}

async function attachMedia<TUpdate extends { id: string }>(updates: TUpdate[]) {
  const mediaByUpdateId = await getDailyUpdateMediaByUpdateIds(
    updates.map((update) => update.id),
  );

  return updates.map((update) => ({
    ...update,
    mediaAssets: mediaByUpdateId.get(update.id) ?? [],
  }));
}
