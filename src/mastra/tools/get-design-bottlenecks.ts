import { createTool } from "@mastra/core/tools";
import { asc, desc, inArray } from "drizzle-orm";

import { PENDING_DESIGN_TASK_STATUSES } from "@/src/features/design/constants";
import { db, schema } from "@/src/lib/db";

import { requireOwnerAdminAiToolUser } from "./auth";
import { authorizedToolInputSchema, designBottleneckSchema } from "./schemas";
import { clampLimit, READ_ONLY_TOOL_ANNOTATIONS, toDateOnly } from "./utils";

export const getDesignBottlenecksTool = createTool({
  id: "get-design-bottlenecks",
  description:
    "Fetch pending, blocked, or waiting design and DED tasks through safe Drizzle queries.",
  inputSchema: authorizedToolInputSchema,
  outputSchema: designBottleneckSchema.array(),
  mcp: {
    annotations: READ_ONLY_TOOL_ANNOTATIONS,
  },
  execute: async (input) => getDesignBottlenecks(input),
});

export async function getDesignBottlenecks(input: {
  limit?: number;
  requesterUserId: string;
}) {
  await requireOwnerAdminAiToolUser(input.requesterUserId);

  const limit = clampLimit(input.limit);

  const tasks = await db.query.designTasks.findMany({
    where: inArray(schema.designTasks.status, [...PENDING_DESIGN_TASK_STATUSES]),
    columns: {
      id: true,
      taskName: true,
      designType: true,
      status: true,
      approvalStatus: true,
      revisionCount: true,
      dueDate: true,
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
      designer: {
        columns: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [asc(schema.designTasks.dueDate), desc(schema.designTasks.updatedAt)],
    limit,
  });

  return tasks.map((task) => ({
    ...task,
    dueDate: toDateOnly(task.dueDate),
    designer: task.designer ? { ...task.designer, role: "designer" } : null,
  }));
}
