import {
  and,
  asc,
  count,
  desc,
  eq,
  ilike,
  inArray,
  or,
  type SQL,
} from "drizzle-orm";

import type { CurrentUser, RoleName } from "@/src/lib/auth/permissions";
import { db, schema } from "@/src/lib/db";

import {
  PENDING_DESIGN_TASK_STATUSES,
} from "./constants";
import type { DesignTaskFilters } from "./schemas";

export type DesignTaskListItem = Awaited<
  ReturnType<typeof getDesignTasksQuery>
>[number];
export type DesignTaskFormOptions = Awaited<
  ReturnType<typeof getDesignTaskFormOptions>
>;
export type DesignTaskMetrics = Awaited<ReturnType<typeof getDesignTaskMetrics>>;

export async function getDesignTasksQuery(filters: DesignTaskFilters = {}) {
  const where = buildDesignTaskWhere(filters);

  const tasks = await db.query.designTasks.findMany({
    where,
    with: {
      project: {
        columns: {
          id: true,
          projectName: true,
          clientName: true,
        },
      },
      designer: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: (designTasks, { asc, desc }) => [
      asc(designTasks.dueDate),
      desc(designTasks.updatedAt),
    ],
  });

  return attachMedia(tasks);
}

export async function getPendingDesignTasksQuery(
  limit = 6,
  currentUser?: CurrentUser,
) {
  const conditions: SQL[] = [
    inArray(schema.designTasks.status, [...PENDING_DESIGN_TASK_STATUSES]),
  ];
  const scope = buildDesignTaskRoleScope(currentUser);
  if (scope) {
    conditions.push(scope);
  }

  const tasks = await db.query.designTasks.findMany({
    where: and(...conditions),
    with: {
      project: {
        columns: {
          id: true,
          projectName: true,
          clientName: true,
        },
      },
      designer: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: (designTasks, { asc, desc }) => [
      asc(designTasks.dueDate),
      desc(designTasks.updatedAt),
    ],
    limit,
  });

  return attachMedia(tasks);
}

export async function getDesignTaskMetrics(currentUser?: CurrentUser) {
  const scope = buildDesignTaskRoleScope(currentUser);
  const buildWhere = (condition: SQL) => (scope ? and(condition, scope) : condition);

  const [pending, waitingApproval, dedProgress, blocked] = await Promise.all([
    db
      .select({ value: count() })
      .from(schema.designTasks)
      .where(
        buildWhere(
          inArray(schema.designTasks.status, [...PENDING_DESIGN_TASK_STATUSES]),
        ),
      ),
    db
      .select({ value: count() })
      .from(schema.designTasks)
      .where(
        buildWhere(eq(schema.designTasks.approvalStatus, "waiting_approval")),
      ),
    db
      .select({ value: count() })
      .from(schema.designTasks)
      .where(buildWhere(eq(schema.designTasks.status, "ded_progress"))),
    db
      .select({ value: count() })
      .from(schema.designTasks)
      .where(buildWhere(eq(schema.designTasks.status, "blocked"))),
  ]);

  return {
    pending: pending[0]?.value ?? 0,
    waitingApproval: waitingApproval[0]?.value ?? 0,
    dedProgress: dedProgress[0]?.value ?? 0,
    blocked: blocked[0]?.value ?? 0,
  };
}

export async function getDesignTaskFormOptions() {
  const [projects, designers] = await Promise.all([
    db.query.projects.findMany({
      columns: {
        id: true,
        projectName: true,
        clientName: true,
        designerId: true,
      },
      orderBy: [asc(schema.projects.projectName)],
    }),
    getActiveUsersByRoles(["designer", "owner", "admin"]),
  ]);

  return {
    projects,
    designers,
  };
}

export async function getDesignMediaByTaskIds(taskIds: readonly string[]) {
  if (taskIds.length === 0) {
    return new Map<string, Array<typeof schema.mediaAssets.$inferSelect>>();
  }

  const mediaAssets = await db.query.mediaAssets.findMany({
    where: and(
      eq(schema.mediaAssets.relatedType, "design_task"),
      inArray(schema.mediaAssets.relatedId, [...taskIds]),
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

  const mediaByTaskId = new Map<string, typeof mediaAssets>();

  for (const asset of mediaAssets) {
    if (!asset.relatedId) {
      continue;
    }

    const existing = mediaByTaskId.get(asset.relatedId) ?? [];
    existing.push(asset);
    mediaByTaskId.set(asset.relatedId, existing);
  }

  return mediaByTaskId;
}

function buildDesignTaskWhere(filters: DesignTaskFilters) {
  const conditions: SQL[] = [];

  if (filters.search) {
    const searchValue = `%${filters.search}%`;
    const searchCondition = or(
      ilike(schema.designTasks.taskName, searchValue),
      ilike(schema.designTasks.notes, searchValue),
    );

    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (filters.projectId) {
    conditions.push(eq(schema.designTasks.projectId, filters.projectId));
  }

  if (filters.designerId) {
    conditions.push(eq(schema.designTasks.designerId, filters.designerId));
  }

  if (filters.designType) {
    conditions.push(eq(schema.designTasks.designType, filters.designType));
  }

  if (filters.status) {
    conditions.push(eq(schema.designTasks.status, filters.status));
  }

  if (filters.approvalStatus) {
    conditions.push(
      eq(schema.designTasks.approvalStatus, filters.approvalStatus),
    );
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

async function attachMedia<
  TTask extends { id: string },
>(tasks: TTask[]) {
  const mediaByTaskId = await getDesignMediaByTaskIds(
    tasks.map((task) => task.id),
  );

  return tasks.map((task) => ({
    ...task,
    mediaAssets: mediaByTaskId.get(task.id) ?? [],
  }));
}

function buildDesignTaskRoleScope(currentUser?: CurrentUser) {
  if (!currentUser || currentUser.role !== "designer") {
    return undefined;
  }

  return eq(schema.designTasks.designerId, currentUser.id);
}

async function getActiveUsersByRoles(roleNames: readonly RoleName[]) {
  const roles = await db.query.roles.findMany({
    where: inArray(schema.roles.name, [...roleNames]),
  });
  const roleIds = roles.map((role) => role.id);

  if (roleIds.length === 0) {
    return [];
  }

  return db.query.users.findMany({
    where: and(
      inArray(schema.users.roleId, roleIds),
      eq(schema.users.status, "active"),
    ),
    with: {
      role: true,
    },
    orderBy: [asc(schema.users.name)],
  });
}
