import { createTool } from "@mastra/core/tools";
import { desc, inArray } from "drizzle-orm";

import { CONTENT_READY_DASHBOARD_STATUSES } from "@/src/features/content/constants";
import { db, schema } from "@/src/lib/db";

import { boundedLimitSchema, contentOpportunitySchema } from "./schemas";
import { clampLimit, READ_ONLY_TOOL_ANNOTATIONS } from "./utils";

export const getContentOpportunitiesTool = createTool({
  id: "get-content-opportunities",
  description:
    "Fetch content-ready project assets and content opportunities through safe Drizzle queries.",
  inputSchema: boundedLimitSchema,
  outputSchema: contentOpportunitySchema.array(),
  mcp: {
    annotations: READ_ONLY_TOOL_ANNOTATIONS,
  },
  execute: async (input) => getContentOpportunities(input),
});

export async function getContentOpportunities(input: { limit?: number } = {}) {
  const limit = clampLimit(input.limit);

  const assets = await db.query.contentAssets.findMany({
    where: inArray(schema.contentAssets.contentStatus, [
      ...CONTENT_READY_DASHBOARD_STATUSES,
    ]),
    columns: {
      id: true,
      roomArea: true,
      visualStatus: true,
      footageStatus: true,
      contentOpportunity: true,
      suggestedAngle: true,
      contentStatus: true,
      notes: true,
    },
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
        },
      },
    },
    orderBy: [desc(schema.contentAssets.updatedAt), desc(schema.contentAssets.createdAt)],
    limit,
  });

  return assets.map((asset) => ({
    ...asset,
    assignee: asset.assignee ? { ...asset.assignee, role: "marketing" } : null,
  }));
}
