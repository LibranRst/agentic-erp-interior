import {
  and,
  asc,
  count,
  eq,
  ilike,
  inArray,
  isNotNull,
  isNull,
  or,
  type SQL,
} from "drizzle-orm";

import { db, schema } from "@/src/lib/db";
import { getMediaByRelatedIds } from "@/src/features/media/queries";

import {
  MATERIAL_ISSUE_STATUSES,
  MATERIAL_WARNING_URGENCY_LEVELS,
} from "./constants";
import type { MaterialFilters } from "./schemas";

export type MaterialListItem = Awaited<
  ReturnType<typeof getMaterialsQuery>
>[number];
export type MaterialFormOptions = Awaited<
  ReturnType<typeof getMaterialFormOptions>
>;
export type MaterialIssueMetrics = Awaited<
  ReturnType<typeof getMaterialIssueMetrics>
>;

export async function getMaterialsQuery(filters: MaterialFilters = {}, includeArchived?: boolean) {
  const materials = await db.query.materials.findMany({
    where: buildMaterialWhere(filters, includeArchived),
    with: {
      project: {
        columns: {
          id: true,
          projectName: true,
          clientName: true,
        },
      },
      vendor: {
        columns: {
          id: true,
          vendorName: true,
          contactPerson: true,
          phone: true,
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
    orderBy: (materials, { asc, desc }) => [
      asc(materials.etaDate),
      desc(materials.updatedAt),
    ],
  });

  return attachMedia(materials);
}

export async function getMaterialIssuesQuery(limit = 6, includeArchived?: boolean) {
  const materials = await db.query.materials.findMany({
    where: buildMaterialIssueWhere(includeArchived),
    with: {
      project: {
        columns: {
          id: true,
          projectName: true,
          clientName: true,
        },
      },
      vendor: {
        columns: {
          id: true,
          vendorName: true,
          contactPerson: true,
          phone: true,
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
    orderBy: (materials, { asc, desc }) => [
      desc(materials.urgencyLevel),
      asc(materials.etaDate),
      desc(materials.updatedAt),
    ],
    limit,
  });

  return attachMedia(materials);
}

export async function getMaterialIssueMetrics(includeArchived?: boolean) {
  const archiveFilter = includeArchived
    ? isNotNull(schema.materials.archivedAt)
    : isNull(schema.materials.archivedAt);
  const issueWhere = buildMaterialIssueWhere(includeArchived);
  const [openIssues, delayed, high, critical, ready] = await Promise.all([
    db.select({ value: count() }).from(schema.materials).where(issueWhere),
    db
      .select({ value: count() })
      .from(schema.materials)
      .where(and(archiveFilter, eq(schema.materials.status, "delayed"))),
    db
      .select({ value: count() })
      .from(schema.materials)
      .where(and(archiveFilter, eq(schema.materials.urgencyLevel, "high"))),
    db
      .select({ value: count() })
      .from(schema.materials)
      .where(and(archiveFilter, eq(schema.materials.urgencyLevel, "critical"))),
    db
      .select({ value: count() })
      .from(schema.materials)
      .where(and(archiveFilter, inArray(schema.materials.status, ["arrived", "installed"]))),
  ]);

  return {
    openIssues: openIssues[0]?.value ?? 0,
    delayed: delayed[0]?.value ?? 0,
    high: high[0]?.value ?? 0,
    critical: critical[0]?.value ?? 0,
    ready: ready[0]?.value ?? 0,
  };
}

export async function getMaterialFormOptions() {
  const [projects, vendors] = await Promise.all([
    db.query.projects.findMany({
      columns: {
        id: true,
        projectName: true,
        clientName: true,
      },
      orderBy: [asc(schema.projects.projectName)],
    }),
    db.query.vendors.findMany({
      columns: {
        id: true,
        vendorName: true,
        category: true,
        contactPerson: true,
      },
      orderBy: [asc(schema.vendors.vendorName)],
    }),
  ]);

  return {
    projects,
    vendors,
  };
}

function buildMaterialWhere(filters: MaterialFilters, includeArchived?: boolean) {
  const conditions: SQL[] = [];

  if (includeArchived) {
    conditions.push(isNotNull(schema.materials.archivedAt));
  } else {
    conditions.push(isNull(schema.materials.archivedAt));
  }

  if (filters.search) {
    const searchValue = `%${filters.search}%`;
    const searchCondition = or(
      ilike(schema.materials.materialName, searchValue),
      ilike(schema.materials.category, searchValue),
      ilike(schema.materials.issueNotes, searchValue),
    );

    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (filters.projectId) {
    conditions.push(eq(schema.materials.projectId, filters.projectId));
  }

  if (filters.vendorId) {
    conditions.push(eq(schema.materials.vendorId, filters.vendorId));
  }

  if (filters.status) {
    conditions.push(eq(schema.materials.status, filters.status));
  }

  if (filters.urgencyLevel) {
    conditions.push(eq(schema.materials.urgencyLevel, filters.urgencyLevel));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

function buildMaterialIssueWhere(includeArchived?: boolean) {
  const archiveFilter = includeArchived
    ? isNotNull(schema.materials.archivedAt)
    : isNull(schema.materials.archivedAt);
  return and(
    archiveFilter,
    or(
      inArray(schema.materials.status, [...MATERIAL_ISSUE_STATUSES]),
      inArray(schema.materials.urgencyLevel, [
        ...MATERIAL_WARNING_URGENCY_LEVELS,
      ]),
    ),
  );
}

async function attachMedia<TMaterial extends { id: string }>(
  materials: TMaterial[],
) {
  const mediaByMaterialId = await getMediaByRelatedIds(
    "material",
    materials.map((material) => material.id),
  );

  return materials.map((material) => ({
    ...material,
    mediaAssets: mediaByMaterialId.get(material.id) ?? [],
  }));
}
