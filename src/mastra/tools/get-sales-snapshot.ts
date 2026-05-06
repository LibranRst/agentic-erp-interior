import { createTool } from "@mastra/core/tools";
import { and, asc, count, desc, eq, inArray, isNotNull, lte, or } from "drizzle-orm";

import { OPEN_FOLLOW_UP_LEAD_STATUSES } from "@/src/features/leads/constants";
import { db, schema } from "@/src/lib/db";

import { boundedLimitSchema, salesSnapshotSchema } from "./schemas";
import {
  clampLimit,
  countValue,
  getJakartaDate,
  READ_ONLY_TOOL_ANNOTATIONS,
  toDateOnly,
} from "./utils";

export const getSalesSnapshotTool = createTool({
  id: "get-sales-snapshot",
  description:
    "Fetch Dekoria sales lead counts and follow-up priorities through safe Drizzle queries.",
  inputSchema: boundedLimitSchema,
  outputSchema: salesSnapshotSchema,
  mcp: {
    annotations: READ_ONLY_TOOL_ANNOTATIONS,
  },
  execute: async (input) => getSalesSnapshot(input),
});

export async function getSalesSnapshot(input: { limit?: number } = {}) {
  const limit = clampLimit(input.limit);
  const today = getJakartaDate();

  const followUpWhere = and(
    inArray(schema.leads.status, [...OPEN_FOLLOW_UP_LEAD_STATUSES]),
    isNotNull(schema.leads.nextFollowUpDate),
    lte(schema.leads.nextFollowUpDate, today),
  );

  const [newLeads, hotLeads, followUpLeads, convertedLeads, leads] =
    await Promise.all([
      db.select({ value: count() }).from(schema.leads).where(eq(schema.leads.status, "new")),
      db.select({ value: count() }).from(schema.leads).where(eq(schema.leads.status, "hot")),
      db.select({ value: count() }).from(schema.leads).where(followUpWhere),
      db
        .select({ value: count() })
        .from(schema.leads)
        .where(eq(schema.leads.status, "converted")),
      db.query.leads.findMany({
        where: or(eq(schema.leads.status, "new"), eq(schema.leads.status, "hot"), followUpWhere),
        columns: {
          id: true,
          leadName: true,
          source: true,
          interest: true,
          status: true,
          nextFollowUpDate: true,
          notes: true,
        },
        with: {
          assignedSales: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [desc(schema.leads.status), asc(schema.leads.nextFollowUpDate)],
        limit,
      }),
    ]);

  return {
    metrics: {
      new: countValue(newLeads),
      hot: countValue(hotLeads),
      followUp: countValue(followUpLeads),
      converted: countValue(convertedLeads),
    },
    leads: leads.map((lead) => ({
      ...lead,
      nextFollowUpDate: toDateOnly(lead.nextFollowUpDate),
      assignedSales: lead.assignedSales
        ? { ...lead.assignedSales, role: "sales" }
        : null,
    })),
  };
}
