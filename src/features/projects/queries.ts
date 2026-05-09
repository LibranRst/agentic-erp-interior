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
import type { CurrentUser, RoleName } from "@/src/lib/auth/permissions";

import {
  activeProjectStatuses,
  designProjectStatuses,
  type ProjectHealthStatus,
} from "./constants";
import type { ProjectFilters } from "./schemas";

export type ProjectListItem = Awaited<ReturnType<typeof getProjectsQuery>>[number];
export type ProjectDetail = NonNullable<Awaited<ReturnType<typeof getProjectByIdQuery>>>;
export type ProjectFormOptions = Awaited<ReturnType<typeof getProjectFormOptions>>;
export type ProjectHealthOverviewItem = Awaited<
  ReturnType<typeof getProjectHealthOverviewQuery>
>[number];
export type UrgentProjectOverviewItem = Awaited<
  ReturnType<typeof getUrgentProjectOverviewQuery>
>[number];

export async function getProjectsQuery(filters: ProjectFilters = {}, includeArchived?: boolean) {
  const where = buildProjectWhere(filters, includeArchived);

  return db.query.projects.findMany({
    where,
    with: {
      projectManager: {
        columns: {
          id: true,
          name: true,
          email: true,
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
    orderBy: (projects, { desc }) => [
      desc(projects.updatedAt),
      desc(projects.createdAt),
    ],
  });
}

export async function getProjectByIdQuery(projectId: string) {
  const project = await db.query.projects.findFirst({
    where: eq(schema.projects.id, projectId),
    with: {
      projectManager: true,
      designer: true,
      stages: {
        with: {
          assignee: true,
        },
        orderBy: (projectStages, { asc, desc }) => [
          asc(projectStages.dueDate),
          desc(projectStages.createdAt),
        ],
      },
      dailyUpdates: {
        with: {
          updater: true,
        },
        orderBy: (dailyUpdates, { desc }) => [
          desc(dailyUpdates.updateDate),
          desc(dailyUpdates.createdAt),
        ],
        limit: 8,
      },
      designTasks: {
        with: {
          designer: true,
        },
        orderBy: (designTasks, { asc, desc }) => [
          asc(designTasks.dueDate),
          desc(designTasks.createdAt),
        ],
      },
      materials: {
        with: {
          vendor: true,
          updater: true,
        },
        orderBy: (materials, { asc, desc }) => [
          asc(materials.etaDate),
          desc(materials.updatedAt),
        ],
      },
      leads: {
        with: {
          assignedSales: true,
        },
        orderBy: (leads, { desc }) => [desc(leads.updatedAt)],
      },
      contentAssets: {
        with: {
          assignee: true,
        },
        orderBy: (contentAssets, { desc }) => [desc(contentAssets.updatedAt)],
      },
      mediaAssets: {
        with: {
          uploader: true,
        },
        orderBy: (mediaAssets, { desc }) => [desc(mediaAssets.createdAt)],
        limit: 12,
      },
    },
  });

  if (!project) {
    return null;
  }

  return {
    ...project,
    aiSummaries: [] as Array<typeof schema.aiSummaries.$inferSelect>,
  };
}

export async function getProjectMetrics(currentUser?: CurrentUser, includeArchived?: boolean) {
  const scope = buildProjectRoleScope(currentUser);
  const archiveFilter = includeArchived
    ? isNotNull(schema.projects.archivedAt)
    : isNull(schema.projects.archivedAt);

  const buildWhere = (condition: SQL) => (scope ? and(archiveFilter, condition, scope) : and(archiveFilter, condition));

  const [activeProjects, urgentProjects, designStageProjects, contentReadyProjects] =
    await Promise.all([
      db
        .select({ value: count() })
        .from(schema.projects)
        .where(
          buildWhere(inArray(schema.projects.status, activeProjectStatuses)),
        ),
      db
        .select({ value: count() })
        .from(schema.projects)
        .where(
          buildWhere(
            inArray(schema.projects.healthStatus, [
              "urgent",
              "blocked",
              "delayed",
            ] satisfies ProjectHealthStatus[]),
          ),
        ),
      db
        .select({ value: count() })
        .from(schema.projects)
        .where(
          buildWhere(inArray(schema.projects.status, [...designProjectStatuses])),
        ),
      db
        .select({ value: count() })
        .from(schema.projects)
        .where(
          buildWhere(
            inArray(schema.projects.contentReadyStatus, [
              "ready_to_shoot",
              "footage_available",
              "editing",
              "ready_to_publish",
              "published",
            ]),
          ),
        ),
    ]);

  return {
    active: activeProjects[0]?.value ?? 0,
    urgent: urgentProjects[0]?.value ?? 0,
    designStage: designStageProjects[0]?.value ?? 0,
    contentReady: contentReadyProjects[0]?.value ?? 0,
  };
}

export async function getProjectHealthOverviewQuery(
  limit = 5,
  currentUser?: CurrentUser,
  includeArchived?: boolean,
) {
  const scope = buildProjectRoleScope(currentUser);
  const archiveFilter = includeArchived
    ? isNotNull(schema.projects.archivedAt)
    : isNull(schema.projects.archivedAt);
  const conditions: SQL[] = [
    archiveFilter,
    inArray(schema.projects.status, activeProjectStatuses),
  ];
  if (scope) conditions.push(scope);

  return db.query.projects.findMany({
    where: and(...conditions),
    columns: {
      id: true,
      projectName: true,
      clientName: true,
      roomArea: true,
      status: true,
      healthStatus: true,
      priority: true,
      progressPercentage: true,
      deadline: true,
      updatedAt: true,
    },
    orderBy: [
      desc(schema.projects.updatedAt),
      desc(schema.projects.createdAt),
    ],
    limit,
  });
}

export async function getUrgentProjectOverviewQuery(
  limit = 5,
  currentUser?: CurrentUser,
  includeArchived?: boolean,
) {
  const scope = buildProjectRoleScope(currentUser);
  const archiveFilter = includeArchived
    ? isNotNull(schema.projects.archivedAt)
    : isNull(schema.projects.archivedAt);
  const conditions: SQL[] = [
    archiveFilter,
    inArray(schema.projects.healthStatus, [
      "urgent",
      "blocked",
      "delayed",
    ] satisfies ProjectHealthStatus[]),
  ];
  if (scope) conditions.push(scope);

  return db.query.projects.findMany({
    where: and(...conditions),
    columns: {
      id: true,
      projectName: true,
      clientName: true,
      roomArea: true,
      status: true,
      healthStatus: true,
      priority: true,
      progressPercentage: true,
      deadline: true,
      updatedAt: true,
    },
    orderBy: [
      desc(schema.projects.updatedAt),
      desc(schema.projects.createdAt),
    ],
    limit,
  });
}

export async function getProjectFormOptions() {
  const [projectManagers, designers] = await Promise.all([
    getActiveUsersByRoles(["project_manager", "owner", "admin"]),
    getActiveUsersByRoles(["designer", "owner", "admin"]),
  ]);

  return {
    projectManagers,
    designers,
  };
}

function buildProjectWhere(filters: ProjectFilters, includeArchived?: boolean) {
  const conditions: SQL[] = [];

  if (includeArchived) {
    conditions.push(isNotNull(schema.projects.archivedAt));
  } else {
    conditions.push(isNull(schema.projects.archivedAt));
  }

  if (filters.search) {
    const searchValue = `%${filters.search}%`;
    const searchCondition = or(
      ilike(schema.projects.projectName, searchValue),
      ilike(schema.projects.clientName, searchValue),
      ilike(schema.projects.location, searchValue),
      ilike(schema.projects.projectType, searchValue),
      ilike(schema.projects.roomArea, searchValue),
    );

    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (filters.status) {
    conditions.push(eq(schema.projects.status, filters.status));
  }

  if (filters.health) {
    conditions.push(eq(schema.projects.healthStatus, filters.health));
  }

  if (filters.pmId) {
    conditions.push(eq(schema.projects.pmId, filters.pmId));
  }

  if (filters.priority) {
    conditions.push(eq(schema.projects.priority, filters.priority));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

function buildProjectRoleScope(currentUser?: CurrentUser) {
  if (!currentUser || currentUser.role !== "project_manager") {
    return undefined;
  }

  return eq(schema.projects.pmId, currentUser.id);
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
