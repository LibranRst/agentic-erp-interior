import { createTool } from "@mastra/core/tools";
import { desc, inArray } from "drizzle-orm";

import { db, schema } from "@/src/lib/db";

import { requireOwnerAdminAiToolUser } from "./auth";
import { authorizedToolInputSchema, safeProjectSchema } from "./schemas";
import { clampLimit, READ_ONLY_TOOL_ANNOTATIONS, toDateOnly, toIsoString } from "./utils";

export const getProjectRiskDataTool = createTool({
  id: "get-project-risk-data",
  description:
    "Fetch urgent, blocked, delayed, or critical Dekoria project data through safe Drizzle queries.",
  inputSchema: authorizedToolInputSchema,
  outputSchema: safeProjectSchema.array(),
  mcp: {
    annotations: READ_ONLY_TOOL_ANNOTATIONS,
  },
  execute: async (input) => getProjectRiskData(input),
});

export async function getProjectRiskData(input: {
  limit?: number;
  requesterUserId: string;
}) {
  await requireOwnerAdminAiToolUser(input.requesterUserId);

  const limit = clampLimit(input.limit);

  const projects = await db.query.projects.findMany({
    where: inArray(schema.projects.healthStatus, [
      "urgent",
      "blocked",
      "delayed",
      "needs_attention",
    ]),
    columns: {
      id: true,
      projectName: true,
      clientName: true,
      status: true,
      healthStatus: true,
      priority: true,
      progressPercentage: true,
      deadline: true,
      updatedAt: true,
    },
    with: {
      projectManager: {
        columns: {
          id: true,
          name: true,
        },
      },
      designer: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [desc(schema.projects.updatedAt)],
    limit,
  });

  return projects.map((project) => ({
    ...project,
    deadline: toDateOnly(project.deadline),
    updatedAt: toIsoString(project.updatedAt),
    projectManager: project.projectManager
      ? { ...project.projectManager, role: "project_manager" }
      : null,
    designer: project.designer ? { ...project.designer, role: "designer" } : null,
  }));
}
