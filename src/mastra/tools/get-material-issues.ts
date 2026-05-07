import { createTool } from "@mastra/core/tools";
import { asc, desc, inArray, or } from "drizzle-orm";

import {
  MATERIAL_ISSUE_STATUSES,
  MATERIAL_WARNING_URGENCY_LEVELS,
} from "@/src/features/materials/constants";
import { db, schema } from "@/src/lib/db";

import { requireOwnerAdminAiToolUser } from "./auth";
import { authorizedToolInputSchema, materialIssueSchema } from "./schemas";
import { clampLimit, READ_ONLY_TOOL_ANNOTATIONS, toDateOnly } from "./utils";

export const getMaterialIssuesTool = createTool({
  id: "get-material-issues",
  description:
    "Fetch delayed, problematic, high urgency, or critical material issues through safe Drizzle queries.",
  inputSchema: authorizedToolInputSchema,
  outputSchema: materialIssueSchema.array(),
  mcp: {
    annotations: READ_ONLY_TOOL_ANNOTATIONS,
  },
  execute: async (input) => getMaterialIssues(input),
});

export async function getMaterialIssues(input: {
  limit?: number;
  requesterUserId: string;
}) {
  await requireOwnerAdminAiToolUser(input.requesterUserId);

  const limit = clampLimit(input.limit);

  const materials = await db.query.materials.findMany({
    where: or(
      inArray(schema.materials.status, [...MATERIAL_ISSUE_STATUSES]),
      inArray(schema.materials.urgencyLevel, [...MATERIAL_WARNING_URGENCY_LEVELS]),
    ),
    columns: {
      id: true,
      materialName: true,
      category: true,
      status: true,
      urgencyLevel: true,
      etaDate: true,
      issueNotes: true,
    },
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
          vendorName: true,
        },
      },
    },
    orderBy: [desc(schema.materials.urgencyLevel), asc(schema.materials.etaDate)],
    limit,
  });

  return materials.map((material) => ({
    ...material,
    etaDate: toDateOnly(material.etaDate),
    vendorName: material.vendor?.vendorName ?? null,
  }));
}
