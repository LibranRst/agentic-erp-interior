import { createTool } from "@mastra/core/tools";
import { desc } from "drizzle-orm";

import { db, schema } from "@/src/lib/db";

import { requireOwnerAdminAiToolUser } from "./auth";
import { authorizedToolInputSchema, dailyUpdateSchema } from "./schemas";
import { clampLimit, READ_ONLY_TOOL_ANNOTATIONS, toDateOnly } from "./utils";

export const getLatestDailyUpdatesTool = createTool({
  id: "get-latest-daily-updates",
  description:
    "Fetch recent PM daily updates through safe Drizzle queries, without exposing raw contact data.",
  inputSchema: authorizedToolInputSchema,
  outputSchema: dailyUpdateSchema.array(),
  mcp: {
    annotations: READ_ONLY_TOOL_ANNOTATIONS,
  },
  execute: async (input) => getLatestDailyUpdates(input),
});

export async function getLatestDailyUpdates(input: {
  limit?: number;
  requesterUserId: string;
}) {
  await requireOwnerAdminAiToolUser(input.requesterUserId);

  const limit = clampLimit(input.limit);

  const updates = await db.query.dailyUpdates.findMany({
    columns: {
      id: true,
      updateDate: true,
      progressSummary: true,
      workCompleted: true,
      issueNotes: true,
      blockerNotes: true,
      needOwnerAttention: true,
      nextAction: true,
      progressPercentage: true,
      healthStatus: true,
    },
    with: {
      project: {
        columns: {
          id: true,
          projectName: true,
          clientName: true,
        },
      },
      updater: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [desc(schema.dailyUpdates.updateDate), desc(schema.dailyUpdates.createdAt)],
    limit,
  });

  return updates.map((update) => ({
    id: update.id,
    project: {
      id: update.project.id,
      projectName: update.project.projectName,
      clientName: update.project.clientName,
    },
    updater: update.updater ? { ...update.updater, role: null } : null,
    updateDate: toDateOnly(update.updateDate) ?? "",
    progressSummary: update.progressSummary,
    workCompleted: update.workCompleted,
    issueNotes: update.issueNotes,
    blockerNotes: update.blockerNotes,
    needOwnerAttention: update.needOwnerAttention ?? false,
    nextAction: update.nextAction,
    progressPercentage: update.progressPercentage,
    healthStatus: update.healthStatus,
  }));
}
