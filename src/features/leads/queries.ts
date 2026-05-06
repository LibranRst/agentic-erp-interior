import {
  and,
  asc,
  count,
  eq,
  gte,
  ilike,
  inArray,
  isNotNull,
  isNull,
  lte,
  or,
  type SQL,
} from "drizzle-orm";

import type { CurrentUser, RoleName } from "@/src/lib/auth/permissions";
import { getMediaByRelatedIds } from "@/src/features/media/queries";
import { db, schema } from "@/src/lib/db";

import { OPEN_FOLLOW_UP_LEAD_STATUSES } from "./constants";
import type { LeadFilters } from "./schemas";

export type LeadListItem = Awaited<ReturnType<typeof getLeadsQuery>>[number];
export type LeadFormOptions = Awaited<ReturnType<typeof getLeadFormOptions>>;
export type SalesSnapshot = Awaited<ReturnType<typeof getSalesSnapshotQuery>>;

export async function getLeadsQuery(
  filters: LeadFilters = {},
  currentUser?: CurrentUser,
) {
  const leads = await db.query.leads.findMany({
    where: buildLeadWhere(filters, currentUser),
    with: {
      assignedSales: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      convertedProject: {
        columns: {
          id: true,
          projectName: true,
          clientName: true,
        },
      },
    },
    orderBy: (leads, { asc, desc }) => [
      asc(leads.nextFollowUpDate),
      desc(leads.updatedAt),
      desc(leads.createdAt),
    ],
  });

  return attachMedia(leads);
}

export async function getDashboardLeadsQuery(
  limit = 5,
  currentUser?: CurrentUser,
) {
  const leads = await db.query.leads.findMany({
    where: and(
      buildRoleScope(currentUser),
      or(
        eq(schema.leads.status, "new"),
        eq(schema.leads.status, "hot"),
        and(
          inArray(schema.leads.status, [...OPEN_FOLLOW_UP_LEAD_STATUSES]),
          isNotNull(schema.leads.nextFollowUpDate),
          lte(schema.leads.nextFollowUpDate, getJakartaDate()),
        ),
      ),
    ),
    with: {
      assignedSales: {
        columns: {
          id: true,
          name: true,
          email: true,
        },
      },
      convertedProject: {
        columns: {
          id: true,
          projectName: true,
          clientName: true,
        },
      },
    },
    orderBy: (leads, { asc, desc }) => [
      desc(leads.status),
      asc(leads.nextFollowUpDate),
      desc(leads.updatedAt),
    ],
    limit,
  });

  return attachMedia(leads);
}

export async function getSalesSnapshotQuery(currentUser?: CurrentUser) {
  const today = getJakartaDate();
  const scope = buildRoleScope(currentUser);
  const followUpWhere = and(
    scope,
    inArray(schema.leads.status, [...OPEN_FOLLOW_UP_LEAD_STATUSES]),
    isNotNull(schema.leads.nextFollowUpDate),
    lte(schema.leads.nextFollowUpDate, today),
  );

  const [newLeads, hotLeads, followUpLeads, convertedLeads] =
    await Promise.all([
      db
        .select({ value: count() })
        .from(schema.leads)
        .where(and(scope, eq(schema.leads.status, "new"))),
      db
        .select({ value: count() })
        .from(schema.leads)
        .where(and(scope, eq(schema.leads.status, "hot"))),
      db.select({ value: count() }).from(schema.leads).where(followUpWhere),
      db
        .select({ value: count() })
        .from(schema.leads)
        .where(and(scope, eq(schema.leads.status, "converted"))),
    ]);

  return {
    new: newLeads[0]?.value ?? 0,
    hot: hotLeads[0]?.value ?? 0,
    followUp: followUpLeads[0]?.value ?? 0,
    converted: convertedLeads[0]?.value ?? 0,
  };
}

export async function getLeadFormOptions(currentUser?: CurrentUser) {
  const salesUsers = await getActiveUsersByRoles(["sales", "owner", "admin"]);
  const scopedSalesUsers =
    currentUser?.role === "sales"
      ? salesUsers.filter((user) => user.id === currentUser.id)
      : salesUsers;

  const sourceWhere = buildRoleScope(currentUser);
  const sourceRows = await db
    .selectDistinct({ source: schema.leads.source })
    .from(schema.leads)
    .where(and(sourceWhere, isNotNull(schema.leads.source)))
    .orderBy(asc(schema.leads.source));

  return {
    salesUsers: scopedSalesUsers,
    sources: sourceRows
      .map((row) => row.source)
      .filter((source): source is string => Boolean(source)),
  };
}

function buildLeadWhere(filters: LeadFilters, currentUser?: CurrentUser) {
  const conditions: SQL[] = [];
  const scope = buildRoleScope(currentUser);
  const today = getJakartaDate();

  if (scope) {
    conditions.push(scope);
  }

  if (filters.search) {
    const searchValue = `%${filters.search}%`;
    const searchCondition = or(
      ilike(schema.leads.leadName, searchValue),
      ilike(schema.leads.phone, searchValue),
      ilike(schema.leads.email, searchValue),
      ilike(schema.leads.source, searchValue),
      ilike(schema.leads.interest, searchValue),
      ilike(schema.leads.notes, searchValue),
    );

    if (searchCondition) {
      conditions.push(searchCondition);
    }
  }

  if (filters.status) {
    conditions.push(eq(schema.leads.status, filters.status));
  }

  if (filters.assignedSalesId) {
    conditions.push(eq(schema.leads.assignedSalesId, filters.assignedSalesId));
  }

  if (filters.source) {
    conditions.push(eq(schema.leads.source, filters.source));
  }

  if (filters.followUp === "due") {
    conditions.push(
      and(
        inArray(schema.leads.status, [...OPEN_FOLLOW_UP_LEAD_STATUSES]),
        isNotNull(schema.leads.nextFollowUpDate),
        lte(schema.leads.nextFollowUpDate, today),
      )!,
    );
  }

  if (filters.followUp === "upcoming") {
    conditions.push(
      and(
        inArray(schema.leads.status, [...OPEN_FOLLOW_UP_LEAD_STATUSES]),
        isNotNull(schema.leads.nextFollowUpDate),
        gte(schema.leads.nextFollowUpDate, today),
      )!,
    );
  }

  if (filters.followUp === "none") {
    conditions.push(isNull(schema.leads.nextFollowUpDate));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

function buildRoleScope(currentUser?: CurrentUser) {
  if (!currentUser || currentUser.role !== "sales") {
    return undefined;
  }

  return eq(schema.leads.assignedSalesId, currentUser.id);
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

function getJakartaDate() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

async function attachMedia<TLead extends { id: string }>(leads: TLead[]) {
  const mediaByLeadId = await getMediaByRelatedIds(
    "lead_attachment",
    leads.map((lead) => lead.id),
  );

  return leads.map((lead) => ({
    ...lead,
    mediaAssets: mediaByLeadId.get(lead.id) ?? [],
  }));
}
